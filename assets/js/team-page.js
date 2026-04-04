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
let currentOrgName = '';
let seatLimit = 1;
let subscriptionTier = 'preview';

const show = (id) => { const el = document.getElementById(id); if (el) el.style.display = ''; };
const hide = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };

const showTeamOnboardingModal = () => new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
        <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#ecfdf5,#d1fae5);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div style="font-size:12px;color:#059669;font-weight:600;margin-bottom:12px;letter-spacing:0.3px;">You now have access to team features</div>
        <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:8px;line-height:1.3;">Start working with your team</div>
        <div style="font-size:14px;color:#475569;margin-bottom:20px;line-height:1.6;">Invite people and manage cash together.</div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:6px;text-align:left;">Give your team a name (you can change it later)</div>
        <input type="text" id="sn-onboard-team-name" placeholder="e.g. Acme Coffee Shop" maxlength="60" style="width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:15px;font-family:inherit;outline:none;margin-bottom:16px;transition:border-color .15s;" onfocus="this.style.borderColor='#059669'" onblur="this.style.borderColor='#e2e8f0'">
        <button type="button" id="sn-onboard-submit" style="display:inline-flex;align-items:center;justify-content:center;background:#059669;color:#fff;border:none;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;cursor:pointer;width:100%;box-sizing:border-box;">Create team</button>
        <button type="button" id="sn-onboard-cancel" style="appearance:none;border:none;background:none;color:#94a3b8;font-size:12px;cursor:pointer;margin-top:12px;padding:4px;">I'll do this later</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#sn-onboard-team-name');
    const submit = overlay.querySelector('#sn-onboard-submit');
    const cancel = overlay.querySelector('#sn-onboard-cancel');

    const finish = (value) => { overlay.remove(); resolve(value); };

    submit.addEventListener('click', () => {
        const name = String(input.value || '').trim();
        if (!name) { input.style.borderColor = '#ef4444'; input.focus(); return; }
        finish(name);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { submit.click(); }
    });

    cancel.addEventListener('click', () => finish(null));

    setTimeout(() => input.focus(), 100);
});

const canManageOrgName = () => currentRole === 'owner' || currentRole === 'admin';

const renderOrgNamePanel = () => {
    const panel = document.getElementById('orgNamePanel');
    const input = document.getElementById('orgNameInput');
    const note = document.getElementById('orgNameNote');
    if (!panel || !input || !note) return;

    if (!canManageOrgName()) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    input.value = String(currentOrgName || '').trim();
    const hasName = Boolean(String(currentOrgName || '').trim());
    note.textContent = hasName
        ? 'Team members will see this when selecting a team at sign in.'
        : 'Set a Team name so members can select it during sign in.';
    note.style.color = hasName ? 'var(--text-muted)' : '#d97706';
};

const loadCurrentOrgName = async () => {
    try {
        if (!window.db?.orgMemberships?.getCurrentOrgName) {
            currentOrgName = '';
            renderOrgNamePanel();
            return;
        }
        currentOrgName = await window.db.orgMemberships.getCurrentOrgName();
    } catch (_) {
        currentOrgName = '';
    }
    renderOrgNamePanel();
};

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

// ── Seat counter ──

const updateSeatCounter = () => {
    const el = document.getElementById('seatCounter');
    if (!el) return;

    if (subscriptionTier !== 'pro') {
        el.style.display = 'none';
        return;
    }

    const used = teamMembers.filter(m => m.status === 'active' || m.status === 'pending').length;
    const pct = Math.min(100, Math.round((used / seatLimit) * 100));
    const atLimit = used >= seatLimit;
    const barColor = atLimit ? '#ef4444' : '#f59e0b';

    el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">
        <i class="fas fa-users" style="color:${atLimit ? '#ef4444' : 'var(--text-muted)'};font-size:11px;"></i>
        <strong>${used}</strong> of <strong>${seatLimit}</strong> seats used
    </span>
    <div style="margin-top:4px;height:4px;border-radius:2px;background:var(--bg-tertiary, #e5e7eb);overflow:hidden;max-width:180px;">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:2px;transition:width .3s;"></div>
    </div>`;
    el.style.display = '';
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

// ── Invite modal: CB info note visibility ──

const populateInviteCashBoxes = () => {};

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

    // Gate: only Pro (and preview) users can access Team page
    try {
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        const uid = sessionData?.session?.user?.id;
        if (uid) {
            const { data: gateProfile } = await window.supabaseClient
                .from('profiles')
                .select('subscription_tier')
                .eq('id', uid)
                .single();
            const tier = String(gateProfile?.subscription_tier || '').toLowerCase();
            if (tier !== 'pro' && tier !== 'preview') {
                if (window.SpendNoteUpgrade?.showTeamUpgrade) {
                    window.SpendNoteUpgrade.showTeamUpgrade();
                } else {
                    window.location.href = 'spendnote-pricing.html?minPlan=pro&feature=Team%20Management';
                }
                return;
            }
        }
    } catch (_) {}

    // Ensure org exists for Pro user — show onboarding if first time
    try {
        let existingOrgId = null;
        try {
            existingOrgId = await window.db?.orgMemberships?.getMyOrgId?.();
        } catch (_) {}

        if (!existingOrgId) {
            const teamName = await showTeamOnboardingModal();
            if (!teamName) {
                hide('teamLoading');
                hide('teamError');
                show('teamContent');
                const tbody = document.getElementById('teamTableBody');
                if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:40px 20px;"><div style="font-size:16px;font-weight:600;margin-bottom:6px;">No team yet</div><div style="font-size:13px;margin-bottom:16px;">Invite people when you\'re ready.</div><button type="button" onclick="window.location.reload()" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;">Create team</button></td></tr>';
                return;
            }
            try {
                const { data, error } = await window.supabaseClient.rpc('spendnote_ensure_org_for_pro', {
                    p_team_name: teamName
                });
                if (error) throw error;
                window.location.reload();
                return;
            } catch (e) {
                console.error('[team-page] ensure org failed:', e);
                showAlert('Could not create team. Please try again.', { iconType: 'error' });
                return;
            }
        }
    } catch (_) {}

    try {
        if (window.db?.orgMemberships?.getMyRole) {
            const r = await window.db.orgMemberships.getMyRole();
            const n = String(r || '').toLowerCase();
            if (n === 'owner' || n === 'admin' || n === 'user') currentRole = n;
        }
    } catch (_) {}

    try {
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
            const { data: profile, error: profileErr } = await window.supabaseClient
                .from('profiles')
                .select('subscription_tier, seat_count')
                .eq('id', user.id)
                .single();
            console.log('[team-page] profile for seats:', profile, profileErr);
            if (profile) {
                subscriptionTier = String(profile.subscription_tier || 'preview').toLowerCase();
                const sc = Number(profile.seat_count || 0);
                if (subscriptionTier === 'pro') {
                    seatLimit = sc > 0 ? sc : 3;
                } else if (subscriptionTier === 'standard') {
                    seatLimit = 1;
                } else {
                    seatLimit = 1;
                }
            }
        }
        console.log('[team-page] tier:', subscriptionTier, 'seatLimit:', seatLimit);
    } catch (e) { console.warn('[team-page] seat profile load error:', e); }

    try {
        await Promise.all([loadTeam(), loadCashBoxes()]);
    } catch (err) {
        console.error('[team-page] load failed:', err);
    }

    hide('teamLoading');
    hide('teamError');
    show('teamContent');
    populateInviteCashBoxes();
    updateSeatCounter();
    console.log('[team-page] rendered', teamMembers.length, 'members,', cashBoxes.length, 'boxes');

    const canManage = () => currentRole === 'owner' || currentRole === 'admin';

    const orgNameSaveBtn = document.getElementById('orgNameSaveBtn');
    orgNameSaveBtn?.addEventListener('click', async () => {
        if (!canManageOrgName()) return;
        const input = document.getElementById('orgNameInput');
        const nextName = String(input?.value || '').trim();
        if (!nextName) {
            showAlert('Team name is required.', { iconType: 'warning' });
            return;
        }
        const result = await window.db?.orgMemberships?.updateCurrentOrgName?.(nextName);
        if (!result?.success) {
            showAlert(result?.error || 'Could not save Team name.', { iconType: 'error' });
            return;
        }
        currentOrgName = nextName;
        renderOrgNamePanel();
        showAlert('Team name saved.', { iconType: 'success' });
        try {
            if (typeof window.updateUserNav === 'function') window.updateUserNav();
        } catch (_) {}
    });

    // Invite modal
    const inviteModal = document.getElementById('inviteModal');
    document.getElementById('inviteMemberBtn')?.addEventListener('click', async () => {
        if (!canManage()) { showAlert('Only Owner/Admin can invite.', { iconType: 'warning' }); return; }

        if (!await window.SpendNoteUpgrade?.guardFeature('can_invite_members', 'Team Invites', 'pro')) return;

        const currentCount = teamMembers.filter(m => m.status === 'active' || m.status === 'pending').length;
        // Preview: unlimited team invites in product terms — do not show Pro seat paywall.
        if (subscriptionTier !== 'preview' && currentCount >= seatLimit) {
            if (typeof window.SpendNoteUpgrade?.showSeatLimitUpgrade === 'function') {
                window.SpendNoteUpgrade.showSeatLimitUpgrade(seatLimit);
            } else if (window.SpendNoteUpgrade?.showLockOverlay) {
                window.SpendNoteUpgrade.showLockOverlay({
                    feature: 'More team seats',
                    requiredPlan: 'pro'
                });
            } else {
                showAlert(`Seat limit reached (${seatLimit}). Upgrade your plan to add more members.`, { iconType: 'warning' });
            }
            return;
        }

        populateInviteCashBoxes();
        toggleInviteCbGroup();
        inviteModal?.classList.add('active');
    });
    document.getElementById('inviteRole')?.addEventListener('change', toggleInviteCbGroup);
    document.getElementById('inviteModalClose')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalCancel')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalSubmit')?.addEventListener('click', async () => {
        if (!canManage()) return;
        if (!String(currentOrgName || '').trim()) {
            showAlert('Set a Team name first so members can select it during sign in.', { iconType: 'warning' });
            return;
        }
        const email = document.getElementById('inviteEmail')?.value?.trim();
        const role = document.getElementById('inviteRole')?.value || 'user';
        if (!email) { showAlert('Email is required.', { iconType: 'warning' }); return; }

        if (!window.db?.teamMembers?.invite) { showAlert('Team feature not available.', { iconType: 'error' }); return; }
        const result = await window.db.teamMembers.invite(email, role);
        if (!result?.success) { showAlert(result?.error || 'Failed to invite.', { iconType: 'error' }); return; }

        inviteModal?.classList.remove('active');
        document.getElementById('inviteEmail').value = '';
        await loadTeam();
        updateSeatCounter();

        const token = result?.data?.token;
        if (Boolean(result?.emailSent)) { showAlert('Invitation sent!', { iconType: 'success' }); return; }
        if (result?.emailError) showAlert(String(result.emailError), { iconType: 'warning' });
        if (token) {
            const link = `${window.location.origin}/signup?inviteToken=${encodeURIComponent(token)}`;
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
                    const link = `${window.location.origin}/signup?inviteToken=${encodeURIComponent(result.data.token)}`;
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
            updateSeatCounter();
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

    await loadCurrentOrgName();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); }); }, { once: true });
} else {
    initTeamPage().catch(e => { console.error('[team-page]', e); hide('teamLoading'); show('teamError'); });
}

})();
