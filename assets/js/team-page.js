// ===== TEAM PAGE — Original Settings Style + Session Fix + CB Invite =====
(function () {
'use strict';

const escapeHtml = (str) => String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

const MEMBER_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
const getMemberColor = (idx) => MEMBER_COLORS[idx % MEMBER_COLORS.length];
const getInitials = (name) => {
    const parts = String(name || '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return String(name || '?').slice(0, 2).toUpperCase();
};

let teamMembers = [];
let cashBoxes = [];
let currentRole = 'user';
let selectedMemberForAccess = null;

const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = ''; };
const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

// ── Wait for Supabase session ──

const waitForSession = () => new Promise((resolve) => {
    let attempts = 0;
    const poll = async () => {
        attempts++;
        if (attempts > 80) { resolve(false); return; }
        try {
            if (!window.supabaseClient) { setTimeout(poll, 150); return; }
            const { data } = await window.supabaseClient.auth.getSession();
            if (data?.session) { resolve(true); return; }
        } catch (_) {}
        setTimeout(poll, 150);
    };
    poll();
});

// ── Original renderTeamTable (from user-settings.js) ──

const renderTeamTable = () => {
    const tbody = document.getElementById('teamTableBody');
    if (!tbody) return;

    const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

    const inviteBtn = document.getElementById('inviteMemberBtn');
    const accessBtn = document.getElementById('manageAccessBtn');
    const headerActions = document.getElementById('teamHeaderActions');
    if (inviteBtn) inviteBtn.style.display = canManageTeam ? '' : 'none';
    if (accessBtn) accessBtn.style.display = canManageTeam ? '' : 'none';
    if (headerActions) headerActions.style.display = canManageTeam ? '' : 'none';

    const total = teamMembers.length;
    const active = teamMembers.filter(m => m.status === 'active').length;
    const pending = teamMembers.filter(m => m.status === 'pending').length;

    const totalEl = document.getElementById('statTotalMembers');
    const activeEl = document.getElementById('statActiveMembers');
    const pendingEl = document.getElementById('statPendingMembers');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (pendingEl) pendingEl.textContent = pending;

    if (!total) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:32px;">No team members yet. Click "Invite" to add your first member.</td></tr>';
        return;
    }

    tbody.innerHTML = teamMembers.map((m, idx) => {
        const name = m.member?.full_name || m.invited_email || '—';
        const email = m.member?.email || m.invited_email || '—';
        const role = String(m.role || 'user').toLowerCase();
        const status = m.status || 'active';
        const isOwner = role === 'owner';
        const color = getMemberColor(idx);
        const roleBadgeClass = isOwner ? 'owner' : (role === 'admin' ? 'admin' : 'member');

        const roleCellHtml = isOwner
            ? `<span class="role-badge owner"><i class="fas fa-crown"></i> Owner</span>`
            : (canManageTeam
                ? `<select class="team-role-select role-badge ${roleBadgeClass}" data-action="set-role" data-id="${m.id}" data-status="${status}">
                        <option value="user" ${role !== 'admin' ? 'selected' : ''}>User</option>
                        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                   </select>`
                : `<span class="role-badge ${roleBadgeClass}">${role === 'admin' ? 'Admin' : 'User'}</span>`
            );

        const statusClass = status === 'active' ? 'active' : (status === 'pending' ? 'pending' : 'inactive');

        const actionsHtml = (() => {
            if (!canManageTeam || isOwner) return '<span style="color:var(--text-muted)">—</span>';
            if (status === 'pending') {
                return `<div class="team-actions">
                    <button type="button" class="btn btn-secondary btn-small" data-action="resend" data-id="${m.id}"><i class="fas fa-paper-plane"></i> Resend</button>
                    <button type="button" class="btn btn-danger btn-small" data-action="revoke" data-id="${m.id}"><i class="fas fa-ban"></i> Revoke</button>
                </div>`;
            }
            if (role === 'admin' || role === 'owner') {
                return `<div class="team-actions">
                    <span style="color:var(--text-muted);font-size:12px;">All Cash Boxes</span>
                    <button type="button" class="btn btn-danger btn-small" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i> Remove</button>
                </div>`;
            }
            return `<div class="team-actions">
                <button type="button" class="btn btn-secondary btn-small" data-action="access" data-id="${m.id}"><i class="fas fa-key"></i> Cash Boxes</button>
                <button type="button" class="btn btn-danger btn-small" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i> Remove</button>
            </div>`;
        })();

        return `<tr data-member-id="${m.id || ''}">
            <td>
                <div class="member-cell">
                    <div class="member-avatar" style="background:${color}">${getInitials(name)}</div>
                    <div>
                        <div class="member-name">${escapeHtml(name)}</div>
                        <div class="member-email">${escapeHtml(email)}</div>
                    </div>
                </div>
            </td>
            <td>${roleCellHtml}</td>
            <td><span class="status-badge ${statusClass}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
            <td>${actionsHtml}</td>
        </tr>`;
    }).join('');
};

// ── Data loading ──

const loadTeam = async () => {
    try {
        if (!window.db?.teamMembers?.getAll) { teamMembers = []; renderTeamTable(); return; }
        teamMembers = await window.db.teamMembers.getAll() || [];
        renderTeamTable();
    } catch (err) {
        console.error('[team-page] loadTeam failed:', err);
        teamMembers = [];
        renderTeamTable();
    }
};

const loadCashBoxes = async () => {
    try {
        if (!window.db?.cashBoxes?.getAll) { cashBoxes = []; return; }
        cashBoxes = await window.db.cashBoxes.getAll() || [];
    } catch (err) {
        console.error('[team-page] loadCashBoxes failed:', err);
        cashBoxes = [];
    }
};

// ── Original openAccessModal (from user-settings.js) ──

const openAccessModal = async (memberId, options = {}) => {
    const forcePicker = Boolean(options?.forcePicker);
    const pickerWrap = document.getElementById('accessMemberPickerWrap');
    const pickerSelect = document.getElementById('accessMemberSelect');

    const eligibleMembers = teamMembers.filter(m => {
        const s = String(m?.status || '').toLowerCase();
        const r = String(m?.role || '').toLowerCase();
        if (r === 'owner' || r === 'admin') return false;
        return s === 'active' || s === 'pending';
    });

    if (pickerWrap && pickerSelect) {
        if (forcePicker) {
            pickerWrap.style.display = '';
            if (!eligibleMembers.length) {
                selectedMemberForAccess = null;
                document.getElementById('accessMemberName').textContent = '—';
                document.getElementById('accessMemberEmail').textContent = '—';
                const list = document.getElementById('accessCashBoxList');
                if (list) list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">No Users available to configure.</div>';
                document.getElementById('accessModal').classList.add('active');
                pickerSelect.innerHTML = '';
                pickerSelect.onchange = null;
                return;
            }
            pickerSelect.innerHTML = eligibleMembers.map(m => {
                const name = m.member?.full_name || m.invited_email || '—';
                const email = m.member?.email || m.invited_email || '';
                const s = String(m?.status || '').toLowerCase();
                const label = email ? `${name} (${email})` : String(name);
                return `<option value="${escapeHtml(m.id)}">${escapeHtml(label)}${s === 'pending' ? ' — Pending invite' : ''}</option>`;
            }).join('');
            if (!memberId) memberId = pickerSelect.value || null;
            else pickerSelect.value = memberId;
            pickerSelect.onchange = async () => { await openAccessModal(pickerSelect.value, { forcePicker: true }); };
        } else {
            pickerWrap.style.display = 'none';
            pickerSelect.onchange = null;
        }
    }

    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    selectedMemberForAccess = member;

    document.getElementById('accessMemberName').textContent = member.member?.full_name || member.invited_email || '—';
    document.getElementById('accessMemberEmail').textContent = member.member?.email || member.invited_email || '—';

    const list = document.getElementById('accessCashBoxList');
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    document.getElementById('accessModal').classList.add('active');

    const memberRole = String(member?.role || '').toLowerCase();
    if (memberRole === 'owner' || memberRole === 'admin') {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Admins can access all Cash Boxes.</div>';
        return;
    }

    let memberAccess = [];
    const userId = member.member_id || member.member?.id;
    if (!userId) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Access can be set after the user accepts the invite.</div>'; return; }
    if (window.db?.cashBoxAccess?.getForUser) memberAccess = await window.db.cashBoxAccess.getForUser(userId) || [];

    const accessSet = new Set(memberAccess.map(a => a.cash_box_id));
    if (!cashBoxes.length) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">No Cash Boxes available.</div>'; return; }

    list.innerHTML = cashBoxes.map(cb => {
        const hasAccess = accessSet.has(cb.id);
        return `<div class="access-item">
            <div class="access-item-left">
                <div class="access-dot" style="background:${cb.color || '#6b7280'}"></div>
                <div class="access-name">${escapeHtml(cb.name)}</div>
            </div>
            <button type="button" class="btn btn-small ${hasAccess ? 'btn-primary' : 'btn-secondary'}" data-cb-id="${cb.id}" data-has-access="${hasAccess}">
                ${hasAccess ? '<i class="fas fa-check"></i> Has Access' : '<i class="fas fa-plus"></i> Grant'}
            </button>
        </div>`;
    }).join('');
};

// ── Invite modal: populate CB checkboxes ──

const populateInviteCashBoxes = () => {
    const list = document.getElementById('inviteCashBoxList');
    if (!list) return;
    if (!cashBoxes.length) {
        list.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No Cash Boxes available.</div>';
        return;
    }
    list.innerHTML = cashBoxes.map(cb => `<label class="invite-cb-item">
        <input type="checkbox" value="${cb.id}" checked>
        <span class="invite-cb-dot" style="background:${cb.color || '#6b7280'}"></span>
        <span class="invite-cb-name">${escapeHtml(cb.name)}</span>
    </label>`).join('');
};

const toggleInviteCbGroup = () => {
    const group = document.getElementById('inviteCashBoxGroup');
    const role = document.getElementById('inviteRole')?.value;
    if (group) group.style.display = (role === 'admin') ? 'none' : '';
};

// ── Main Init ──

const initTeamPage = async () => {
    console.log('[team-page] init start');

    const hasSession = await waitForSession();
    if (!hasSession) {
        hide('teamLoading');
        show('teamError');
        const msg = document.getElementById('teamErrorMsg');
        if (msg) msg.textContent = 'Could not establish session. Please log in again.';
        return;
    }

    try {
        if (window.db?.orgMemberships?.getMyRole) {
            const r = await window.db.orgMemberships.getMyRole();
            const n = String(r || '').toLowerCase();
            if (n === 'owner' || n === 'admin' || n === 'user') currentRole = n;
        }
    } catch (_) {}

    try {
        await Promise.all([loadTeam(), loadCashBoxes()]);
    } catch (err) {
        console.error('[team-page] load failed:', err);
    }

    hide('teamLoading');
    hide('teamError');
    show('teamContent');
    populateInviteCashBoxes();
    console.log('[team-page] rendered', teamMembers.length, 'members,', cashBoxes.length, 'boxes');

    const canManage = () => currentRole === 'owner' || currentRole === 'admin';

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

        const selectedCbs = [];
        if (role !== 'admin') {
            document.querySelectorAll('#inviteCashBoxList input[type="checkbox"]:checked').forEach(cb => selectedCbs.push(cb.value));
            if (!selectedCbs.length) { showAlert('Select at least one Cash Box.', { iconType: 'warning' }); return; }
        }

        if (!window.db?.teamMembers?.invite) { showAlert('Team feature not available.', { iconType: 'error' }); return; }
        const result = await window.db.teamMembers.invite(email, role);
        if (!result?.success) { showAlert(result?.error || 'Failed to invite.', { iconType: 'error' }); return; }

        if (role !== 'admin' && selectedCbs.length && result?.data?.member_id && window.db?.cashBoxAccess?.grant) {
            for (const cbId of selectedCbs) { try { await window.db.cashBoxAccess.grant(cbId, result.data.member_id); } catch (_) {} }
        }

        inviteModal?.classList.remove('active');
        document.getElementById('inviteEmail').value = '';
        await loadTeam();

        const token = result?.data?.token;
        if (Boolean(result?.emailSent)) { showAlert('Invitation sent!', { iconType: 'success' }); return; }
        if (result?.emailError) showAlert(String(result.emailError), { iconType: 'warning' });
        if (token) {
            const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}&invitedEmail=${encodeURIComponent(email)}`;
            try { await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' }); }
            catch (_) { showAlert(link, { iconType: 'info' }); }
        }
    });

    // Cash Box Access button
    document.getElementById('manageAccessBtn')?.addEventListener('click', async () => {
        if (!canManage()) return;
        await openAccessModal(null, { forcePicker: true });
    });

    // Team table actions
    document.getElementById('teamTableBody')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('button[data-action]');
        if (!btn || !canManage()) return;
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'access') {
            await openAccessModal(id);
        } else if (action === 'resend') {
            const member = teamMembers.find(m => m.id === id);
            if (!member || member.status !== 'pending') return;
            btn.disabled = true;
            try {
                const result = await window.db.teamMembers.invite(String(member.invited_email || '').trim(), String(member.role || 'user'));
                if (!result?.success) { showAlert(result?.error || 'Failed.', { iconType: 'error' }); return; }
                await loadTeam();
                if (Boolean(result?.emailSent)) { showAlert('Invitation resent.', { iconType: 'success' }); return; }
                if (result?.data?.token) {
                    const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(result.data.token)}&invitedEmail=${encodeURIComponent(String(member.invited_email || ''))}`;
                    try { await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' }); }
                    catch (_) { showAlert(link, { iconType: 'info' }); }
                }
            } finally { btn.disabled = false; }
        } else if (action === 'revoke' || action === 'remove') {
            const member = teamMembers.find(m => m.id === id);
            const isPending = member?.status === 'pending';
            if (!await showConfirm(isPending ? 'Revoke this invite?' : 'Remove this team member?', { title: isPending ? 'Revoke Invite' : 'Remove Member', iconType: 'danger', okLabel: isPending ? 'Revoke' : 'Remove', danger: true })) return;
            const result = await window.db.teamMembers.remove(id);
            if (!result?.success) { showAlert(result?.error || 'Failed.', { iconType: 'error' }); return; }
            await loadTeam();
            showAlert(isPending ? 'Invite revoked.' : 'Member removed.', { iconType: 'success' });
        }
    });

    // Role change
    document.getElementById('teamTableBody')?.addEventListener('change', async (e) => {
        const sel = e.target?.closest('select[data-action="set-role"]');
        if (!sel || !canManage()) { await loadTeam(); return; }
        sel.disabled = true;
        try {
            const fn = sel.dataset.status === 'pending' ? window.db.teamMembers.updateInviteRole : window.db.teamMembers.updateRole;
            if (fn) { const r = await fn(sel.dataset.id, sel.value); if (r && !r.success) showAlert(r.error || 'Failed.', { iconType: 'error' }); }
        } catch (err) { showAlert(err?.message || 'Failed.', { iconType: 'error' }); }
        finally { sel.disabled = false; }
        await loadTeam();
    });

    // Access modal close + toggle
    const accessModal = document.getElementById('accessModal');
    document.getElementById('accessModalClose')?.addEventListener('click', () => accessModal?.classList.remove('active'));
    document.getElementById('accessModalClose2')?.addEventListener('click', () => accessModal?.classList.remove('active'));
    document.getElementById('accessCashBoxList')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('button[data-cb-id]');
        if (!btn || !selectedMemberForAccess) return;
        const memberRole = String(selectedMemberForAccess?.role || '').toLowerCase();
        if (memberRole === 'owner' || memberRole === 'admin') return;
        const cbId = btn.dataset.cbId;
        const hasAccess = btn.dataset.hasAccess === 'true';
        const userId = selectedMemberForAccess.member_id || selectedMemberForAccess.member?.id;
        if (!userId) { showAlert('Cannot determine member ID.', { iconType: 'error' }); return; }
        if (hasAccess) { await window.db.cashBoxAccess?.revoke?.(cbId, userId); }
        else { await window.db.cashBoxAccess?.grant?.(cbId, userId); }
        const pickerWrap = document.getElementById('accessMemberPickerWrap');
        const keepPicker = Boolean(pickerWrap && pickerWrap.style.display !== 'none');
        await openAccessModal(selectedMemberForAccess.id, { forcePicker: keepPicker });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); }); }, { once: true });
} else {
    initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); });
}

})();
