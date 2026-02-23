// ===== TEAM PAGE — Cash-Box-Centric =====
(function () {
'use strict';

const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
const color = (i) => COLORS[i % COLORS.length];
const initials = (n) => {
    const p = String(n || '').trim().split(/\s+/);
    if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
    return String(n || '?').slice(0, 2).toUpperCase();
};

let members = [];
let boxes = [];
let accessMap = {};   // { cashBoxId: Set<userId> }
let myRole = 'user';

// ── Helpers ──

const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = ''; };
const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

// ── Wait for Supabase session (the real fix) ──

const waitForSession = () => new Promise((resolve) => {
    let attempts = 0;
    const poll = async () => {
        attempts++;
        if (attempts > 80) { resolve(false); return; } // ~12s max
        try {
            if (!window.supabaseClient) { setTimeout(poll, 150); return; }
            const { data } = await window.supabaseClient.auth.getSession();
            if (data?.session) { resolve(true); return; }
        } catch (_) {}
        setTimeout(poll, 150);
    };
    poll();
});

// ── Data loading ──

const loadAll = async () => {
    const results = { members: [], boxes: [] };
    try {
        if (window.db?.teamMembers?.getAll) results.members = await window.db.teamMembers.getAll() || [];
    } catch (e) { console.error('[team] loadMembers', e); }
    try {
        if (window.db?.cashBoxes?.getAll) results.boxes = await window.db.cashBoxes.getAll() || [];
    } catch (e) { console.error('[team] loadBoxes', e); }

    // Build access map per cash box
    accessMap = {};
    for (const cb of results.boxes) accessMap[cb.id] = new Set();

    const activeUserIds = results.members
        .filter(m => m.status === 'active' && m.member_id)
        .map(m => m.member_id);

    for (const uid of activeUserIds) {
        try {
            if (!window.db?.cashBoxAccess?.getForUser) break;
            const acc = await window.db.cashBoxAccess.getForUser(uid) || [];
            for (const a of acc) {
                if (accessMap[a.cash_box_id]) accessMap[a.cash_box_id].add(uid);
            }
        } catch (_) {}
    }

    // Owners/admins have access to all boxes
    for (const m of results.members) {
        const r = String(m.role || '').toLowerCase();
        if ((r === 'owner' || r === 'admin') && m.member_id) {
            for (const cb of results.boxes) {
                if (accessMap[cb.id]) accessMap[cb.id].add(m.member_id);
            }
        }
    }

    members = results.members;
    boxes = results.boxes;
};

const getRole = async () => {
    try {
        if (window.db?.orgMemberships?.getMyRole) {
            const r = await window.db.orgMemberships.getMyRole();
            const n = String(r || '').toLowerCase();
            if (n === 'owner' || n === 'admin' || n === 'user') myRole = n;
        }
    } catch (_) {}
};

// ── Helpers for member data ──

const memberName = (m) => m.member?.full_name || m.invited_email || '—';
const memberEmail = (m) => m.member?.email || m.invited_email || '—';
const memberCbHtml = (m) => {
    const role = String(m.role || '').toLowerCase();
    if (role === 'owner' || role === 'admin') return '<span class="tm-cb-label">All Cash Boxes</span>';
    if (m.status === 'active' && m.member_id) {
        const mBoxes = boxes.filter(cb => accessMap[cb.id]?.has(m.member_id));
        if (mBoxes.length) return '<div class="tm-cb-dots">' + mBoxes.map(cb =>
            `<span class="tm-cb-dot" style="background:${cb.color || '#6b7280'}" title="${esc(cb.name)}"></span>`
        ).join('') + '</div>';
        return '<span class="tm-cb-label">None</span>';
    }
    return '<span class="tm-cb-label">—</span>';
};

// ── Render: Members Table (desktop) ──

const renderMembersTable = () => {
    const tbody = document.getElementById('teamTableBody');
    if (!tbody) return;
    const canManage = myRole === 'owner' || myRole === 'admin';

    if (!members.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="team-empty">
            <div class="team-empty-icon"><i class="fas fa-users"></i></div>
            <div class="team-empty-title">No team members yet</div>
            <div class="team-empty-text">Invite your first team member to get started</div>
        </td></tr>`;
        return;
    }

    tbody.innerHTML = members.map((m, idx) => {
        const name = memberName(m);
        const email = memberEmail(m);
        const role = String(m.role || 'user').toLowerCase();
        const status = m.status || 'active';
        const isOwner = role === 'owner';

        // Role
        const roleHtml = isOwner
            ? `<span class="tm-role owner"><i class="fas fa-crown"></i> Owner</span>`
            : (canManage
                ? `<select class="tm-role-select" data-action="set-role" data-id="${m.id}" data-status="${status}">
                    <option value="user" ${role !== 'admin' ? 'selected' : ''}>User</option>
                    <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                   </select>`
                : `<span class="tm-role ${role}">${role === 'admin' ? 'Admin' : 'User'}</span>`);

        // Status
        const statusHtml = `<span class="tm-status ${status}"><span class="tm-status-dot"></span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;

        // Actions
        let actionsHtml = '';
        if (canManage && !isOwner) {
            if (status === 'pending') {
                actionsHtml = `<div class="tm-actions">
                    <button class="tm-action" data-action="resend" data-id="${m.id}"><i class="fas fa-paper-plane"></i> Resend</button>
                    <button class="tm-action danger" data-action="revoke" data-id="${m.id}"><i class="fas fa-ban"></i></button>
                </div>`;
            } else {
                actionsHtml = `<div class="tm-actions">
                    <button class="tm-action danger" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i></button>
                </div>`;
            }
        }

        return `<tr>
            <td><div class="tm-member">
                <div class="tm-avatar" style="background:${color(idx)}">${initials(name)}</div>
                <div><div class="tm-name">${esc(name)}</div><div class="tm-email">${esc(email)}</div></div>
            </div></td>
            <td>${roleHtml}</td>
            <td>${memberCbHtml(m)}</td>
            <td>${statusHtml}</td>
            <td>${actionsHtml}</td>
        </tr>`;
    }).join('');
};

// ── Render: Members Cards (mobile) ──

const renderMemberCards = () => {
    const list = document.getElementById('teamCardList');
    if (!list) return;
    const canManage = myRole === 'owner' || myRole === 'admin';

    if (!members.length) {
        list.innerHTML = `<div class="team-empty">
            <div class="team-empty-icon"><i class="fas fa-users"></i></div>
            <div class="team-empty-title">No team members yet</div>
            <div class="team-empty-text">Invite your first team member</div>
        </div>`;
        return;
    }

    list.innerHTML = members.map((m, idx) => {
        const name = memberName(m);
        const role = String(m.role || 'user').toLowerCase();
        const status = m.status || 'active';
        const isOwner = role === 'owner';

        const roleBadge = isOwner
            ? '<span class="tm-role owner"><i class="fas fa-crown"></i> Owner</span>'
            : `<span class="tm-role ${role}">${role === 'admin' ? 'Admin' : 'User'}</span>`;
        const statusBadge = `<span class="tm-status ${status}"><span class="tm-status-dot"></span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;

        let actions = '';
        if (canManage && !isOwner) {
            if (status === 'pending') {
                actions = `<button class="tm-action" data-action="resend" data-id="${m.id}"><i class="fas fa-paper-plane"></i></button>
                           <button class="tm-action danger" data-action="revoke" data-id="${m.id}"><i class="fas fa-ban"></i></button>`;
            } else {
                actions = `<button class="tm-action danger" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i></button>`;
            }
        }

        return `<div class="team-card">
            <div class="tm-avatar" style="background:${color(idx)}">${initials(name)}</div>
            <div class="team-card-body">
                <div class="team-card-name">${esc(name)}</div>
                <div class="team-card-meta">${roleBadge} ${statusBadge}</div>
            </div>
            <div class="team-card-actions">${actions}</div>
        </div>`;
    }).join('');
};

// ── Render: Cash Box Access list ──

const renderCbAccess = () => {
    const wrap = document.getElementById('cashBoxAccessList');
    if (!wrap) return;
    const canManage = myRole === 'owner' || myRole === 'admin';

    if (!boxes.length) {
        wrap.innerHTML = '<div style="color:var(--text-muted);padding:20px;text-align:center;font-size:13px;">No Cash Boxes yet.</div>';
        return;
    }

    wrap.innerHTML = boxes.map((cb) => {
        const cbMembers = members.filter(m => m.status === 'active' && m.member_id && accessMap[cb.id]?.has(m.member_id));

        const pills = cbMembers.length
            ? cbMembers.map((m, mi) => {
                const n = memberName(m);
                return `<span class="cb-access-pill"><span class="cb-access-pill-avatar" style="background:${color(mi)}">${initials(n)}</span>${esc(n)}</span>`;
            }).join('')
            : '<span class="cb-access-empty">No members</span>';

        const manageBtn = canManage
            ? `<button class="tm-action" data-action="manage-cb" data-cb-id="${cb.id}"><i class="fas fa-user-cog"></i> Manage</button>`
            : '';

        return `<div class="cb-access-row">
            <div class="cb-access-dot" style="background:${cb.color || '#6b7280'}"></div>
            <div class="cb-access-name">${esc(cb.name)}</div>
            <div class="cb-access-members">${pills}</div>
            <div class="cb-access-manage">${manageBtn}</div>
        </div>`;
    }).join('');
};

// ── Render: Stats ──

const renderStats = () => {
    const pending = members.filter(m => m.status === 'pending').length;
    const el = document.getElementById('statMemberCount');
    if (el) {
        const parts = [];
        parts.push(`${members.length} total`);
        if (pending) parts.push(`${pending} pending`);
        parts.push(`${boxes.length} boxes`);
        el.textContent = `(${parts.join(' · ')})`;
    }
};

// ── Render all ──

const renderAll = () => {
    const canManage = myRole === 'owner' || myRole === 'admin';
    const headerActions = document.getElementById('teamHeaderActions');
    if (headerActions) headerActions.style.display = canManage ? '' : 'none';

    renderStats();
    renderMembersTable();
    renderMemberCards();
    renderCbAccess();
};

// ── Invite Modal: populate cash box checkboxes ──

const populateInviteCashBoxes = () => {
    const list = document.getElementById('inviteCashBoxList');
    if (!list) return;
    if (!boxes.length) {
        list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No Cash Boxes available.</div>';
        return;
    }
    list.innerHTML = boxes.map(cb => `<label class="invite-cb-item" data-cb-id="${cb.id}">
        <input type="checkbox" value="${cb.id}" checked>
        <span class="invite-cb-dot" style="background:${cb.color || '#6b7280'}"></span>
        <span class="invite-cb-name">${esc(cb.name)}</span>
    </label>`).join('');
};

const toggleInviteCbGroup = () => {
    const group = document.getElementById('inviteCashBoxGroup');
    const role = document.getElementById('inviteRole')?.value;
    if (group) group.style.display = (role === 'admin') ? 'none' : '';
};

// ── Access Modal for a specific Cash Box ──

let accessModalCbId = null;

const openCbAccessModal = async (cbId) => {
    const cb = boxes.find(b => b.id === cbId);
    if (!cb) return;
    accessModalCbId = cbId;

    const title = document.getElementById('accessModalTitle');
    if (title) title.textContent = `Manage Access — ${cb.name}`;

    const list = document.getElementById('accessMemberList');
    if (!list) return;

    const eligibleMembers = members.filter(m => {
        const r = String(m.role || '').toLowerCase();
        return m.status === 'active' && m.member_id && r !== 'owner';
    });

    if (!eligibleMembers.length) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">No team members to configure.</div>';
        document.getElementById('accessModal')?.classList.add('active');
        return;
    }

    list.innerHTML = eligibleMembers.map((m, i) => {
        const name = m.member?.full_name || m.invited_email || '—';
        const email = m.member?.email || m.invited_email || '';
        const r = String(m.role || '').toLowerCase();
        const isAdmin = r === 'admin';
        const hasAccess = isAdmin || (accessMap[cbId]?.has(m.member_id));

        return `<div class="access-member-row" data-uid="${m.member_id}">
            <div class="access-member-info">
                <div class="access-member-avatar" style="background:${color(i)}">${initials(name)}</div>
                <div>
                    <div class="access-member-name">${esc(name)}</div>
                    ${email ? `<div class="access-member-email">${esc(email)}</div>` : ''}
                </div>
            </div>
            ${isAdmin
                ? '<span class="access-member-note">Admin — all boxes</span>'
                : `<button type="button" class="btn btn-small ${hasAccess ? 'btn-primary' : 'btn-secondary'}" data-toggle-uid="${m.member_id}" data-has="${hasAccess}">
                    ${hasAccess ? '<i class="fas fa-check"></i> Access' : '<i class="fas fa-plus"></i> Grant'}
                   </button>`}
        </div>`;
    }).join('');

    document.getElementById('accessModal')?.classList.add('active');
};

// ── Main Init ──

const initTeamPage = async () => {
    console.log('[team-page] init start');

    // 1) Wait for actual Supabase session
    const hasSession = await waitForSession();
    if (!hasSession) {
        hide('teamLoading');
        show('teamError');
        document.getElementById('teamErrorMsg').textContent = 'Could not establish session. Please log in again.';
        console.error('[team-page] No session after waiting');
        return;
    }
    console.log('[team-page] session ready');

    // 2) Load role + data
    try {
        await getRole();
        await loadAll();
    } catch (err) {
        console.error('[team-page] loadAll failed:', err);
        hide('teamLoading');
        show('teamError');
        document.getElementById('teamErrorMsg').textContent = err?.message || 'Failed to load data.';
        return;
    }

    // 3) Show content
    hide('teamLoading');
    hide('teamError');
    show('teamContent');
    renderAll();
    populateInviteCashBoxes();
    console.log('[team-page] rendered', members.length, 'members,', boxes.length, 'boxes');

    // ── Event Listeners ──

    const canManage = () => myRole === 'owner' || myRole === 'admin';

    // Invite modal
    const inviteModal = document.getElementById('inviteModal');
    document.getElementById('inviteMemberBtn')?.addEventListener('click', () => {
        if (!canManage()) { showAlert('Only Owner/Admin can invite.', { iconType: 'warning' }); return; }
        populateInviteCashBoxes();
        toggleInviteCbGroup();
        inviteModal?.classList.add('active');
    });
    document.getElementById('inviteRole')?.addEventListener('change', toggleInviteCbGroup);
    document.getElementById('inviteModalClose')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalCancel')?.addEventListener('click', () => inviteModal?.classList.remove('active'));

    document.getElementById('inviteModalSubmit')?.addEventListener('click', async () => {
        if (!canManage()) return;
        const email = document.getElementById('inviteEmail')?.value?.trim();
        const role = document.getElementById('inviteRole')?.value || 'user';
        if (!email) { showAlert('Email is required.', { iconType: 'warning' }); return; }

        // Get selected cash boxes
        const selectedCbs = [];
        if (role !== 'admin') {
            document.querySelectorAll('#inviteCashBoxList input[type="checkbox"]:checked').forEach(cb => {
                selectedCbs.push(cb.value);
            });
            if (!selectedCbs.length) { showAlert('Select at least one Cash Box.', { iconType: 'warning' }); return; }
        }

        if (!window.db?.teamMembers?.invite) { showAlert('Team feature not available.', { iconType: 'error' }); return; }

        const result = await window.db.teamMembers.invite(email, role);
        if (!result?.success) { showAlert(result?.error || 'Failed to invite.', { iconType: 'error' }); return; }

        // Grant cash box access for the invited user if they're a user role
        if (role !== 'admin' && selectedCbs.length && result?.data?.member_id && window.db?.cashBoxAccess?.grant) {
            for (const cbId of selectedCbs) {
                try { await window.db.cashBoxAccess.grant(cbId, result.data.member_id); } catch (_) {}
            }
        }

        inviteModal?.classList.remove('active');
        document.getElementById('inviteEmail').value = '';

        // Handle invite token / email
        const token = result?.data?.token;
        if (Boolean(result?.emailSent)) {
            showAlert('Invitation sent!', { iconType: 'success' });
        } else if (result?.emailError) {
            showAlert(String(result.emailError), { iconType: 'warning' });
        }
        if (token && !result?.emailSent) {
            const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}&invitedEmail=${encodeURIComponent(email)}`;
            try { await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' }); }
            catch (_) { showAlert(link, { iconType: 'info' }); }
        }

        // Reload
        await loadAll();
        renderAll();
    });

    // Cash Box access list: manage access button
    document.getElementById('cashBoxAccessList')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('[data-action="manage-cb"]');
        if (!btn || !canManage()) return;
        await openCbAccessModal(btn.dataset.cbId);
    });

    // Access modal: toggle access
    document.getElementById('accessMemberList')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('[data-toggle-uid]');
        if (!btn || !accessModalCbId) return;
        const uid = btn.dataset.toggleUid;
        const has = btn.dataset.has === 'true';

        btn.disabled = true;
        try {
            if (has) { await window.db.cashBoxAccess?.revoke?.(accessModalCbId, uid); }
            else { await window.db.cashBoxAccess?.grant?.(accessModalCbId, uid); }
        } catch (_) {}

        // Reload access data and re-render
        await loadAll();
        renderAll();
        await openCbAccessModal(accessModalCbId);
    });

    document.getElementById('accessModalClose')?.addEventListener('click', () => document.getElementById('accessModal')?.classList.remove('active'));
    document.getElementById('accessModalDone')?.addEventListener('click', () => document.getElementById('accessModal')?.classList.remove('active'));

    // Members actions (shared handler for both table and mobile cards)
    const handleMemberAction = async (e) => {
        const btn = e.target?.closest('button[data-action]');
        if (!btn || !canManage()) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'resend') {
            const member = members.find(m => m.id === id);
            if (!member || member.status !== 'pending') return;
            const email = String(member.invited_email || '').trim();
            const role = String(member.role || 'user');
            btn.disabled = true;
            try {
                const result = await window.db.teamMembers.invite(email, role);
                if (!result?.success) { showAlert(result?.error || 'Failed to resend.', { iconType: 'error' }); return; }
                if (Boolean(result?.emailSent)) showAlert('Invitation resent.', { iconType: 'success' });
                else if (result?.data?.token) {
                    const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(result.data.token)}&invitedEmail=${encodeURIComponent(email)}`;
                    try { await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' }); }
                    catch (_) { showAlert(link, { iconType: 'info' }); }
                }
                await loadAll(); renderAll();
            } finally { btn.disabled = false; }
        } else if (action === 'revoke' || action === 'remove') {
            const member = members.find(m => m.id === id);
            const isPending = member?.status === 'pending';
            const msg = isPending ? 'Revoke this invite?' : 'Remove this team member?';
            if (!await showConfirm(msg, { title: isPending ? 'Revoke Invite' : 'Remove Member', iconType: 'danger', okLabel: isPending ? 'Revoke' : 'Remove', danger: true })) return;
            const result = await window.db.teamMembers.remove(id);
            if (!result?.success) { showAlert(result?.error || 'Failed.', { iconType: 'error' }); return; }
            await loadAll(); renderAll();
            showAlert(isPending ? 'Invite revoked.' : 'Member removed.', { iconType: 'success' });
        }
    };
    document.getElementById('teamTableBody')?.addEventListener('click', handleMemberAction);
    document.getElementById('teamCardList')?.addEventListener('click', handleMemberAction);

    // Members table: role change
    document.getElementById('teamTableBody')?.addEventListener('change', async (e) => {
        const sel = e.target?.closest('select[data-action="set-role"]');
        if (!sel || !canManage()) return;
        sel.disabled = true;
        try {
            const fn = sel.dataset.status === 'pending'
                ? window.db.teamMembers.updateInviteRole
                : window.db.teamMembers.updateRole;
            if (fn) {
                const result = await fn(sel.dataset.id, sel.value);
                if (result && !result.success) showAlert(result.error || 'Failed.', { iconType: 'error' });
            }
        } catch (err) { showAlert(err?.message || 'Failed.', { iconType: 'error' }); }
        finally { sel.disabled = false; }
        await loadAll(); renderAll();
    });
};

// ── Boot ──
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); }), { once: true });
} else {
    initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); });
}
})();
