// ===== USER SETTINGS PAGE LOGIC =====

const escapeHtml = (str) => String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const getInitials = (name) => {
    const n = String(name || '').trim();
    if (!n) return '—';
    const parts = n.split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || n[0]?.toUpperCase() || '—';
};

const applyRoleBadge = (roleValue) => {
    const roleEl = document.getElementById('profileRole');
    if (!roleEl) return;

    const role = String(roleValue || '').trim().toLowerCase();
    const normalized = (role === 'owner' || role === 'admin' || role === 'user') ? role : 'user';
    const label = normalized === 'owner' ? 'Owner' : (normalized === 'admin' ? 'Admin' : 'User');

    roleEl.textContent = label;
    roleEl.classList.remove('owner', 'admin', 'member');
    roleEl.classList.add(normalized === 'owner' ? 'owner' : (normalized === 'admin' ? 'admin' : 'member'));
};

// Avatar localStorage
const AVATAR_KEY = 'spendnote.user.avatar.v1';
const AVATAR_COLOR_KEY = 'spendnote.user.avatarColor.v1';
const USER_FULLNAME_KEY = 'spendnote.user.fullName.v1';
const readAvatar = () => { try { return localStorage.getItem(AVATAR_KEY); } catch { return null; } };
const writeAvatar = (dataUrl) => { try { dataUrl ? localStorage.setItem(AVATAR_KEY, dataUrl) : localStorage.removeItem(AVATAR_KEY); } catch {} };
const readAvatarColor = () => { try { return localStorage.getItem(AVATAR_COLOR_KEY) || '#10b981'; } catch { return '#10b981'; } };
const writeAvatarColor = (color) => { try { localStorage.setItem(AVATAR_COLOR_KEY, color); } catch {} };
const writeUserFullName = (name) => {
    try {
        const v = String(name || '').trim();
        if (v) localStorage.setItem(USER_FULLNAME_KEY, v);
        else localStorage.removeItem(USER_FULLNAME_KEY);
    } catch (_) {}
};

const persistAvatarColor = async (color) => {
    try {
        if (!window.db?.profiles?.update) return;
        const result = await window.db.profiles.update({ avatar_color: color });
        if (!result?.success) {
            return;
        }
    } catch (_) {
        // ignore (column may not exist)
    }
};

// Logo localStorage
const LOGO_KEY = 'spendnote.receipt.logo.v1';
const readLogo = () => { try { return localStorage.getItem(LOGO_KEY); } catch { return null; } };
const writeLogo = (dataUrl) => { try { dataUrl ? localStorage.setItem(LOGO_KEY, dataUrl) : localStorage.removeItem(LOGO_KEY); } catch {} };


// State
let currentProfile = null;
let teamMembers = [];
let cashBoxes = [];
let selectedMemberForAccess = null;
let currentRole = 'owner';

// Member colors
const memberColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
const getMemberColor = (idx) => memberColors[idx % memberColors.length];

// ===== PROFILE =====
const applyAvatar = (fullName) => {
    const wrap = document.getElementById('avatarPreview');
    const img = document.getElementById('avatarImg');
    const initials = document.getElementById('avatarInitials');
    if (!wrap || !img || !initials) return;
    const stored = readAvatar();
    const color = readAvatarColor();
    wrap.style.background = 'var(--surface)';
    wrap.style.borderColor = color;
    initials.style.color = color;
    initials.textContent = getInitials(fullName);
    if (stored) {
        wrap.classList.add('has-image');
        img.src = stored;
    } else {
        wrap.classList.remove('has-image');
        img.removeAttribute('src');
    }
    
    document.querySelectorAll('.avatar-color-swatch').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
};

const applyLogo = () => {
    const wrap = document.getElementById('logoPreview');
    const img = document.getElementById('logoImg');
    if (!wrap || !img) return;
    const stored = readLogo();
    if (stored) {
        wrap.classList.add('has-image');
        img.src = stored;
    } else {
        wrap.classList.remove('has-image');
        img.removeAttribute('src');
    }
};

const fillProfile = (p) => {
    currentProfile = p ? { ...p } : null;
    const fullName = String(p?.full_name || '').trim();
    writeUserFullName(fullName);
    document.getElementById('profileFullName').value = fullName;
    document.getElementById('profileEmail').value = String(p?.email || '');

    applyRoleBadge(currentRole);

    document.getElementById('receiptDisplayName').value = String(p?.company_name || '');
    // Reuse profiles.phone as Receipt Identity "Other ID"
    const otherIdEl = document.getElementById('receiptOtherId');
    if (otherIdEl) otherIdEl.value = String(p?.phone || '');
    document.getElementById('receiptAddress').value = String(p?.address || '');

    applyAvatar(fullName);
    applyLogo();

    window.refreshUserNav?.();
};

const loadProfile = async () => {
    if (!window.db?.profiles?.getCurrent) return;
    const p = await window.db.profiles.getCurrent();
    fillProfile(p);
};

const computeAndApplyRole = async () => {
    try {
        const user = await window.auth?.getCurrentUser?.();
        if (!user) return;

        let role = 'owner';
        if (window.db?.orgMemberships?.getMyRole) {
            const dbRole = await window.db.orgMemberships.getMyRole();
            const normalized = String(dbRole || '').toLowerCase();
            if (normalized === 'owner' || normalized === 'admin' || normalized === 'user') {
                role = normalized;
            }
        }

        currentRole = role;
        applyRoleBadge(currentRole);
        renderTeamTable();
    } catch (_) {
        // ignore
    }
};

// ===== TEAM =====
const renderTeamTable = () => {
    const tbody = document.getElementById('teamTableBody');
    if (!tbody) return;

    const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

    try {
        const inviteBtn = document.getElementById('inviteMemberBtn');
        if (inviteBtn) {
            inviteBtn.style.display = canManageTeam ? '' : 'none';
        }
    } catch (_) {

    }

    const total = teamMembers.length;
    const active = teamMembers.filter(m => m.status === 'active').length;
    const pending = teamMembers.filter(m => m.status === 'pending').length;

    document.getElementById('statTotalMembers').textContent = total;
    document.getElementById('statMembersNote').textContent = 'of plan limit';
    document.getElementById('statActiveMembers').textContent = active;
    document.getElementById('statPendingMembers').textContent = pending;

    if (!total) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:24px;">No team members yet. Click "Invite" to add.</td></tr>';
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
                ? `
                    <select class="team-role-select role-badge ${roleBadgeClass}" data-action="set-role" data-id="${m.id}" data-status="${status}" ${status === 'active' || status === 'pending' ? '' : 'disabled'}>
                        <option value="user" ${role !== 'admin' ? 'selected' : ''}>User</option>
                        <option value="admin" ${role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                `
                : `<span class="role-badge ${roleBadgeClass}">${role === 'admin' ? 'Admin' : 'User'}</span>`
            );
        const statusClass = status === 'active' ? 'active' : (status === 'pending' ? 'pending' : 'inactive');

        return `
            <tr data-member-id="${m.id || ''}">
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
                <td>
                    ${(!canManageTeam || isOwner)
                        ? '<span style="color:var(--text-muted)">—</span>'
                        : (
                            status !== 'active'
                                ? `<button type="button" class="btn btn-secondary btn-small" data-action="remove" data-id="${m.id}" style="color:#dc2626;border-color:rgba(239,68,68,0.3);"><i class="fas fa-trash"></i></button>`
                                : `
                                    <button type="button" class="btn btn-secondary btn-small" data-action="access" data-id="${m.id}"><i class="fas fa-key"></i> Access</button>
                                    <button type="button" class="btn btn-secondary btn-small" data-action="remove" data-id="${m.id}" style="color:#dc2626;border-color:rgba(239,68,68,0.3);margin-left:4px;"><i class="fas fa-trash"></i></button>
                                `
                        )
                    }
                </td>
            </tr>
        `;
    }).join('');
};

const loadTeam = async () => {
    if (!window.db?.teamMembers?.getAll) {
        teamMembers = [];
        renderTeamTable();
        return;
    }
    teamMembers = await window.db.teamMembers.getAll() || [];
    renderTeamTable();
};

// ===== CASH BOX ACCESS =====
const loadCashBoxes = async () => {
    if (!window.db?.cashBoxes?.getAll) return;
    cashBoxes = await window.db.cashBoxes.getAll() || [];
};

const openAccessModal = async (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;
    selectedMemberForAccess = member;

    document.getElementById('accessMemberName').textContent = member.member?.full_name || member.invited_email || '—';
    document.getElementById('accessMemberEmail').textContent = member.member?.email || member.invited_email || '—';

    const list = document.getElementById('accessCashBoxList');
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    document.getElementById('accessModal').classList.add('active');

    // Get current access for this member
    let memberAccess = [];
    const userId = member.member_id || member.member?.id;
    if (!userId) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Access can be set after the user accepts the invite.</div>';
        return;
    }
    if (userId && window.db?.cashBoxAccess?.getForUser) {
        memberAccess = await window.db.cashBoxAccess.getForUser(userId) || [];
    }
    const accessSet = new Set(memberAccess.map(a => a.cash_box_id));

    if (!cashBoxes.length) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">No Cash Boxes available.</div>';
        return;
    }

    list.innerHTML = cashBoxes.map(cb => {
        const hasAccess = accessSet.has(cb.id);
        return `
            <div class="access-item">
                <div class="access-item-left">
                    <div class="access-dot" style="background:${cb.color || '#6b7280'}"></div>
                    <div class="access-name">${escapeHtml(cb.name)}</div>
                </div>
                <button type="button" class="btn btn-small ${hasAccess ? 'btn-primary' : 'btn-secondary'}" 
                        data-cb-id="${cb.id}" data-has-access="${hasAccess}">
                    ${hasAccess ? '<i class="fas fa-check"></i> Has Access' : '<i class="fas fa-plus"></i> Grant'}
                </button>
            </div>
        `;
    }).join('');
};

// ===== BILLING =====
let isYearly = true;

const updatePricing = () => {
    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    const toggle = document.getElementById('billingToggle');

    if (isYearly) {
        toggle.classList.add('yearly');
        yearlyLabel.classList.add('active');
        monthlyLabel.classList.remove('active');
        document.getElementById('standardPrice').textContent = '$190';
        document.getElementById('standardPeriod').textContent = 'per year';
        document.getElementById('standardSavings').textContent = 'Save $38 vs monthly';
        document.getElementById('proPrice').textContent = '$290';
        document.getElementById('proPeriod').textContent = 'per year';
        document.getElementById('proSavings').textContent = 'Save $58 vs monthly';
    } else {
        toggle.classList.remove('yearly');
        monthlyLabel.classList.add('active');
        yearlyLabel.classList.remove('active');
        document.getElementById('standardPrice').textContent = '$19';
        document.getElementById('standardPeriod').textContent = 'per month';
        document.getElementById('standardSavings').textContent = '';
        document.getElementById('proPrice').textContent = '$29';
        document.getElementById('proPeriod').textContent = 'per month';
        document.getElementById('proSavings').textContent = '';
    }
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Supabase to be ready
    const waitForDb = () => new Promise(resolve => {
        const check = () => window.db?.profiles ? resolve() : setTimeout(check, 50);
        check();
    });
    await waitForDb();

    // Load data
    await Promise.all([loadProfile(), loadTeam(), loadCashBoxes()]);
    await computeAndApplyRole();

    // Avatar color picker
    document.getElementById('avatarColorSwatches')?.addEventListener('click', (e) => {
        const btn = e.target?.closest('.avatar-color-swatch');
        if (!btn) return;
        const color = btn.dataset.color;
        if (!color) return;
        writeAvatarColor(color);
        persistAvatarColor(color);
        const fullName = document.getElementById('profileFullName')?.value || '';
        applyAvatar(fullName);
        window.refreshUserNav?.();
    });

    // Avatar upload
    document.getElementById('avatarUploadBtn')?.addEventListener('click', () => document.getElementById('avatarFileInput')?.click());
    document.getElementById('avatarFileInput')?.addEventListener('change', (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Max avatar size is 2MB.'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (!dataUrl?.startsWith('data:image/')) { alert('Invalid image.'); return; }
            writeAvatar(dataUrl);
            applyAvatar(document.getElementById('profileFullName')?.value);
            window.refreshUserNav?.();
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('avatarRemoveBtn')?.addEventListener('click', () => {
        writeAvatar(null);
        applyAvatar(document.getElementById('profileFullName')?.value);
        window.refreshUserNav?.();
    });

    // Profile form
    document.getElementById('profileResetBtn')?.addEventListener('click', () => fillProfile(currentProfile));
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profileFullName')?.value?.trim();
        if (!fullName) { alert('Full Name is required.'); return; }

        const result = await window.db.profiles.update({ full_name: fullName });
        if (!result?.success) { alert(result?.error || 'Failed to save.'); return; }
        writeUserFullName(fullName);
        fillProfile(result.data);
        alert('Profile saved.');
    });

    // Logo upload
    document.getElementById('logoUploadBtn')?.addEventListener('click', () => document.getElementById('logoFileInput')?.click());
    document.getElementById('logoFileInput')?.addEventListener('change', (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert('Max logo size is 2MB.'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (!dataUrl?.startsWith('data:image/')) { alert('Invalid image.'); return; }
            writeLogo(dataUrl);
            applyLogo();
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('logoRemoveBtn')?.addEventListener('click', () => {
        writeLogo(null);
        applyLogo();
    });

    // Receipt form
    document.getElementById('receiptResetBtn')?.addEventListener('click', () => fillProfile(currentProfile));
    document.getElementById('receiptForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            company_name: document.getElementById('receiptDisplayName')?.value?.trim() || null,
            phone: document.getElementById('receiptOtherId')?.value?.trim() || null,
            address: document.getElementById('receiptAddress')?.value?.trim() || null
        };
        const result = await window.db.profiles.update(payload);
        if (!result?.success) { alert(result?.error || 'Failed to save.'); return; }
        fillProfile(result.data);
        alert('Receipt identity saved.');
    });

    // Delete Account collapsible toggle
    document.getElementById('deleteAccountToggle')?.addEventListener('click', () => {
        document.querySelector('.collapsible-card')?.classList.toggle('open');
    });

    // Password form
    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pw = document.getElementById('newPassword')?.value;
        const pw2 = document.getElementById('confirmPassword')?.value;
        // Match signup strength expectations: >=8 chars, and at least one number OR symbol
        if (!pw || pw.length < 8) { alert('Password must be at least 8 characters.'); return; }
        const hasNumber = /\d/.test(pw);
        const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
        if (!hasNumber && !hasSymbol) { alert('Password must include at least 1 number or symbol.'); return; }
        if (pw !== pw2) { alert('Passwords do not match.'); return; }
        try {
            const { error } = await window.supabaseClient.auth.updateUser({ password: pw });
            if (error) throw error;
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            alert('Password updated.');
        } catch (err) {
            alert(err.message || 'Failed to update password.');
        }
    });

    // Delete account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
        if (document.getElementById('deleteConfirmInput')?.value !== 'DELETE') {
            alert('Please type "DELETE" to confirm.');
            return;
        }
        alert('Account deletion is not implemented yet. Contact support.');
    });

    // Invite modal
    const inviteModal = document.getElementById('inviteModal');
    document.getElementById('inviteMemberBtn')?.addEventListener('click', () => {
        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            alert('Only Owner/Admin can invite team members.');
            return;
        }
        inviteModal?.classList.add('active');
    });
    document.getElementById('inviteModalClose')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalCancel')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalSubmit')?.addEventListener('click', async () => {
        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            alert('Only Owner/Admin can invite team members.');
            return;
        }
        const email = document.getElementById('inviteEmail')?.value?.trim();
        const role = document.getElementById('inviteRole')?.value;
        if (!email) { alert('Email is required.'); return; }
        if (!window.db?.teamMembers?.invite) { alert('Team feature not available.'); return; }
        const result = await window.db.teamMembers.invite(email, role);
        if (!result?.success) { alert(result?.error || 'Failed to invite.'); return; }
        inviteModal?.classList.remove('active');
        document.getElementById('inviteEmail').value = '';
        await loadTeam();

        const token = result?.data?.token;
        if (token) {
            const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}`;
            try {
                window.prompt('Copy invite link:', link);
            } catch (_) {
                alert(link);
            }
        } else {
            alert('Invitation sent.');
        }
    });

    // Team table actions
    document.getElementById('teamTableBody')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('button[data-action]');
        if (!btn) return;

        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            return;
        }
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'access') {
            await openAccessModal(id);
        } else if (action === 'remove') {
            if (!confirm('Remove this team member?')) return;
            if (!window.db?.teamMembers?.remove) return;
            const result = await window.db.teamMembers.remove(id);
            if (!result?.success) { alert(result?.error || 'Failed to remove.'); return; }
            await loadTeam();
        }
    });

    document.getElementById('teamTableBody')?.addEventListener('change', async (e) => {
        const sel = e.target?.closest('select[data-action="set-role"]');
        if (!sel) return;

        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            await loadTeam();
            return;
        }

        const id = sel.dataset.id;
        const status = sel.dataset.status;
        const role = sel.value;

        sel.disabled = true;
        try {
            if (status === 'pending') {
                if (!window.db?.teamMembers?.updateInviteRole) {
                    alert('Invite role update is not available.');
                } else {
                    const result = await window.db.teamMembers.updateInviteRole(id, role);
                    if (!result?.success) {
                        alert(result?.error || 'Failed to update role.');
                    }
                }
            } else {
                if (!window.db?.teamMembers?.updateRole) {
                    alert('Role update is not available.');
                } else {
                    const result = await window.db.teamMembers.updateRole(id, role);
                    if (!result?.success) {
                        alert(result?.error || 'Failed to update role.');
                    }
                }
            }
        } catch (err) {
            alert(err?.message || 'Failed to update role.');
        } finally {
            sel.disabled = false;
        }

        await loadTeam();
    });

    // Access modal
    const accessModal = document.getElementById('accessModal');
    document.getElementById('accessModalClose')?.addEventListener('click', () => accessModal?.classList.remove('active'));
    document.getElementById('accessModalClose2')?.addEventListener('click', () => accessModal?.classList.remove('active'));
    document.getElementById('accessCashBoxList')?.addEventListener('click', async (e) => {
        const btn = e.target?.closest('button[data-cb-id]');
        if (!btn || !selectedMemberForAccess) return;
        const cbId = btn.dataset.cbId;
        const hasAccess = btn.dataset.hasAccess === 'true';
        const userId = selectedMemberForAccess.member_id || selectedMemberForAccess.member?.id;
        if (!userId) { alert('Cannot determine member ID.'); return; }

        if (hasAccess) {
            if (!window.db?.cashBoxAccess?.revoke) return;
            await window.db.cashBoxAccess.revoke(cbId, userId);
        } else {
            if (!window.db?.cashBoxAccess?.grant) return;
            await window.db.cashBoxAccess.grant(cbId, userId);
        }
        await openAccessModal(selectedMemberForAccess.id);
    });

    // Billing toggle
    document.getElementById('billingToggle')?.addEventListener('click', () => { isYearly = !isYearly; updatePricing(); });
    document.getElementById('monthlyLabel')?.addEventListener('click', () => { isYearly = false; updatePricing(); });
    document.getElementById('yearlyLabel')?.addEventListener('click', () => { isYearly = true; updatePricing(); });

    // Billing buttons (placeholders for Stripe integration)
    document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', () => {
        alert('Cancel Subscription\n\nIn production: Opens Stripe portal to cancel.');
    });
    document.getElementById('upgradeProBtn')?.addEventListener('click', () => {
        alert('Upgrade to Pro\n\nIn production: Opens Stripe checkout for Pro plan.');
    });
    document.getElementById('manageBillingBtn')?.addEventListener('click', () => {
        alert('Manage Billing\n\nIn production: Opens Stripe customer portal to manage payment methods and view invoices.');
    });
});
