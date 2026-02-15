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
const LOGO_KEY = 'spendnote.proLogoDataUrl';
const LEGACY_LOGO_KEY = 'spendnote.receipt.logo.v1';
const LOGO_SCALE_KEY = 'spendnote.receipt.logoScale.v1';
const LOGO_ALIGN_KEY = 'spendnote.receipt.logoAlign.v1';
const readLogo = () => {
    try {
        return localStorage.getItem(LOGO_KEY) || localStorage.getItem(LEGACY_LOGO_KEY);
    } catch {
        return null;
    }
};
const writeLogo = (dataUrl) => {
    try {
        if (dataUrl) {
            localStorage.setItem(LOGO_KEY, dataUrl);
            localStorage.setItem(LEGACY_LOGO_KEY, dataUrl);
        } else {
            localStorage.removeItem(LOGO_KEY);
            localStorage.removeItem(LEGACY_LOGO_KEY);
        }
    } catch {}
};


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
    const scale = clampLogoScale(readLogoScale());
    const align = readLogoAlign();
    wrap.style.setProperty('--logo-scale', String(scale));
    wrap.style.setProperty('--logo-position-x', align === 'left' ? 'left' : (align === 'right' ? 'right' : 'center'));
    if (stored) {
        wrap.classList.add('has-image');
        img.src = stored;
    } else {
        wrap.classList.remove('has-image');
        img.removeAttribute('src');
    }
};

const clampLogoScale = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(1.2, Math.max(0.7, n));
};

const readLogoScale = () => {
    try { return parseFloat(localStorage.getItem(LOGO_SCALE_KEY) || '1'); } catch { return 1; }
};

const readLogoAlign = () => {
    try {
        const v = String(localStorage.getItem(LOGO_ALIGN_KEY) || '').toLowerCase();
        if (v === 'left' || v === 'center' || v === 'right') return v;
    } catch (_) {}
    return 'center';
};

const writeLogoScale = (value) => {
    try { localStorage.setItem(LOGO_SCALE_KEY, String(clampLogoScale(value))); } catch (_) {}
};

const writeLogoAlign = (value) => {
    const v = (value === 'left' || value === 'right') ? value : 'center';
    try { localStorage.setItem(LOGO_ALIGN_KEY, v); } catch (_) {}
};

const applyLogoControls = () => {
    const scaleInput = document.getElementById('logoScaleInput');
    const scaleValue = document.getElementById('logoScaleValue');
    const alignGroup = document.getElementById('logoAlignGroup');
    const scale = clampLogoScale(readLogoScale());
    if (scaleInput) scaleInput.value = String(Math.round(scale * 100));
    if (scaleValue) scaleValue.textContent = `${Math.round(scale * 100)}%`;
    if (alignGroup) {
        const align = readLogoAlign();
        alignGroup.querySelectorAll('.logo-align-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.align === align);
        });
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
    applyLogoControls();

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
        try {
            const manageAccessBtn = document.getElementById('manageAccessBtn');
            if (manageAccessBtn) {
                manageAccessBtn.style.display = (currentRole === 'owner' || currentRole === 'admin') ? '' : 'none';
            }
        } catch (_) {}
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

        const actionsHtml = (() => {
            if (!canManageTeam || isOwner) return '<span style="color:var(--text-muted)">—</span>';
            if (status === 'pending') {
                return `
                    <div class="team-actions">
                        <button type="button" class="btn btn-secondary btn-small" data-action="resend" data-id="${m.id}"><i class="fas fa-paper-plane"></i> Resend</button>
                        <button type="button" class="btn btn-danger btn-small" data-action="revoke" data-id="${m.id}"><i class="fas fa-ban"></i> Revoke</button>
                    </div>
                `;
            }
            if (status !== 'active') {
                return `
                    <div class="team-actions">
                        <button type="button" class="btn btn-danger btn-small" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                `;
            }

            const isAdminLikeMember = role === 'admin' || role === 'owner';
            if (isAdminLikeMember) {
                return `
                    <div class="team-actions">
                        <span style="color:var(--text-muted);font-size:12px;">All Cash Boxes</span>
                        <button type="button" class="btn btn-danger btn-small" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i> Remove</button>
                    </div>
                `;
            }

            return `
                <div class="team-actions">
                    <button type="button" class="btn btn-secondary btn-small" data-action="access" data-id="${m.id}"><i class="fas fa-key"></i> Cash Boxes</button>
                    <button type="button" class="btn btn-danger btn-small" data-action="remove" data-id="${m.id}"><i class="fas fa-trash"></i> Remove</button>
                </div>
            `;
        })();

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
                    ${actionsHtml}
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

const openAccessModal = async (memberId, options = {}) => {
    const forcePicker = Boolean(options && options.forcePicker);
    const pickerWrap = document.getElementById('accessMemberPickerWrap');
    const pickerSelect = document.getElementById('accessMemberSelect');

    const eligibleMembers = teamMembers
        .filter((m) => {
            const status = String(m?.status || '').toLowerCase();
            const r = String(m?.role || '').toLowerCase();
            if (r === 'owner' || r === 'admin') return false;
            return status === 'active' || status === 'pending';
        });

    if (pickerWrap && pickerSelect) {
        if (forcePicker) {
            pickerWrap.style.display = '';

            if (!eligibleMembers.length) {
                selectedMemberForAccess = null;
                document.getElementById('accessMemberName').textContent = '—';
                document.getElementById('accessMemberEmail').textContent = '—';
                const list = document.getElementById('accessCashBoxList');
                if (list) {
                    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">No Users available to configure. Pending invites must be accepted before access can be set.</div>';
                }
                document.getElementById('accessModal').classList.add('active');
                pickerSelect.innerHTML = '';
                pickerSelect.onchange = null;
                return;
            }

            pickerSelect.innerHTML = eligibleMembers.map((m) => {
                const name = m.member?.full_name || m.invited_email || '—';
                const email = m.member?.email || m.invited_email || '';
                const status = String(m?.status || '').toLowerCase();
                const label = email ? `${name} (${email})` : String(name);
                return `<option value="${escapeHtml(m.id)}">${escapeHtml(label)}${status === 'pending' ? ' — Pending invite' : ''}</option>`;
            }).join('');

            if (!memberId) {
                memberId = pickerSelect.value || null;
            } else {
                pickerSelect.value = memberId;
            }

            pickerSelect.onchange = async () => {
                await openAccessModal(pickerSelect.value, { forcePicker: true });
            };
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
    const isAdminLikeMember = memberRole === 'owner' || memberRole === 'admin';
    if (isAdminLikeMember) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">Admins can access all Cash Boxes. No per-cash-box changes are needed.</div>';
        return;
    }

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
        if (file.size > 2 * 1024 * 1024) { showAlert('Max avatar size is 2MB.', { iconType: 'warning' }); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (!dataUrl?.startsWith('data:image/')) { showAlert('Invalid image.', { iconType: 'error' }); return; }
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
        if (!fullName) { showAlert('Full Name is required.', { iconType: 'warning' }); return; }

        const result = await window.db.profiles.update({ full_name: fullName });
        if (!result?.success) { showAlert(result?.error || 'Failed to save.', { iconType: 'error' }); return; }
        writeUserFullName(fullName);
        fillProfile(result.data);
        showAlert('Profile saved.', { iconType: 'success' });
    });

    // Logo upload
    document.getElementById('logoUploadBtn')?.addEventListener('click', () => document.getElementById('logoFileInput')?.click());
    document.getElementById('logoFileInput')?.addEventListener('change', (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { showAlert('Max logo size is 2MB.', { iconType: 'warning' }); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (!dataUrl?.startsWith('data:image/')) { showAlert('Invalid image.', { iconType: 'error' }); return; }
            writeLogo(dataUrl);
            applyLogo();
        };
        reader.readAsDataURL(file);
    });
    document.getElementById('logoRemoveBtn')?.addEventListener('click', () => {
        writeLogo(null);
        applyLogo();
    });

    const logoScaleInput = document.getElementById('logoScaleInput');
    if (logoScaleInput) {
        logoScaleInput.addEventListener('input', () => {
            const scale = clampLogoScale(Number(logoScaleInput.value) / 100);
            writeLogoScale(scale);
            const scaleValue = document.getElementById('logoScaleValue');
            if (scaleValue) scaleValue.textContent = `${Math.round(scale * 100)}%`;
            applyLogo();
        });
    }

    const logoAlignGroup = document.getElementById('logoAlignGroup');
    if (logoAlignGroup) {
        logoAlignGroup.addEventListener('click', (e) => {
            const btn = e.target?.closest('.logo-align-btn');
            if (!btn) return;
            writeLogoAlign(btn.dataset.align);
            applyLogoControls();
            applyLogo();
        });
    }

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
        if (!result?.success) { showAlert(result?.error || 'Failed to save.', { iconType: 'error' }); return; }
        fillProfile(result.data);
        showAlert('Receipt identity saved.', { iconType: 'success' });
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
        if (!pw || pw.length < 8) { showAlert('Password must be at least 8 characters.', { iconType: 'warning' }); return; }
        const hasNumber = /\d/.test(pw);
        const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
        if (!hasNumber && !hasSymbol) { showAlert('Password must include at least 1 number or symbol.', { iconType: 'warning' }); return; }
        if (pw !== pw2) { showAlert('Passwords do not match.', { iconType: 'warning' }); return; }
        try {
            const { error } = await window.supabaseClient.auth.updateUser({ password: pw });
            if (error) throw error;
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            showAlert('Password updated.', { iconType: 'success' });
        } catch (err) {
            showAlert(err.message || 'Failed to update password.', { iconType: 'error' });
        }
    });

    // Delete account
    document.getElementById('deleteAccountBtn')?.addEventListener('click', () => {
        if (document.getElementById('deleteConfirmInput')?.value !== 'DELETE') {
            showAlert('Please type "DELETE" to confirm.', { iconType: 'warning' });
            return;
        }
        showAlert('Account deletion is not implemented yet. Contact support.', { iconType: 'info' });
    });

    // Invite modal
    const inviteModal = document.getElementById('inviteModal');
    document.getElementById('inviteMemberBtn')?.addEventListener('click', () => {
        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            showAlert('Only Owner/Admin can invite team members.', { iconType: 'warning' });
            return;
        }
        inviteModal?.classList.add('active');
    });

    document.getElementById('manageAccessBtn')?.addEventListener('click', async () => {
        if (!(currentRole === 'owner' || currentRole === 'admin')) return;
        await openAccessModal(null, { forcePicker: true });
    });
    document.getElementById('inviteModalClose')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalCancel')?.addEventListener('click', () => inviteModal?.classList.remove('active'));
    document.getElementById('inviteModalSubmit')?.addEventListener('click', async () => {
        if (!(currentRole === 'owner' || currentRole === 'admin')) {
            showAlert('Only Owner/Admin can invite team members.', { iconType: 'warning' });
            return;
        }
        const email = document.getElementById('inviteEmail')?.value?.trim();
        const role = document.getElementById('inviteRole')?.value;
        if (!email) { showAlert('Email is required.', { iconType: 'warning' }); return; }
        if (!window.db?.teamMembers?.invite) { showAlert('Team feature not available.', { iconType: 'error' }); return; }
        const result = await window.db.teamMembers.invite(email, role);
        if (!result?.success) { showAlert(result?.error || 'Failed to invite.', { iconType: 'error' }); return; }
        inviteModal?.classList.remove('active');
        document.getElementById('inviteEmail').value = '';
        await loadTeam();

        const token = result?.data?.token;
        const emailSent = Boolean(result?.emailSent);

        if (emailSent) {
            showAlert('Invitation sent.', { iconType: 'success' });
            return;
        }

        if (result?.emailError) {
            showAlert(String(result.emailError), { iconType: 'warning' });
        }

        if (token) {
            const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}&invitedEmail=${encodeURIComponent(String(email || '').trim())}`;
            try {
                await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' });
            } catch (_) {
                showAlert(link, { iconType: 'info' });
            }
            return;
        }

        showAlert(result?.emailError || 'Invitation sent.', { iconType: 'success' });
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
        } else if (action === 'resend') {
            const member = teamMembers.find(m => m.id === id);
            if (!member || member.status !== 'pending') return;
            const email = String(member.invited_email || '').trim();
            const role = String(member.role || 'user').trim();
            if (!email) { showAlert('Missing invite email.', { iconType: 'error' }); return; }
            if (!window.db?.teamMembers?.invite) { showAlert('Team feature not available.', { iconType: 'error' }); return; }

            btn.disabled = true;
            try {
                const result = await window.db.teamMembers.invite(email, role);
                if (!result?.success) {
                    showAlert(result?.error || 'Failed to resend invite.', { iconType: 'error' });
                    return;
                }
                await loadTeam();

                const token = result?.data?.token;
                const emailSent = Boolean(result?.emailSent);

                if (emailSent) {
                    showAlert('Invitation resent.', { iconType: 'success' });
                    return;
                }

                if (result?.emailError) {
                    showAlert(String(result.emailError), { iconType: 'warning' });
                }

                if (token) {
                    const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}&invitedEmail=${encodeURIComponent(String(email || '').trim())}`;
                    try {
                        await showPrompt('Copy invite link:', { defaultValue: link, title: 'Invite Link' });
                    } catch (_) {
                        showAlert(link, { iconType: 'info' });
                    }
                    return;
                }
            } finally {
                btn.disabled = false;
            }
        } else if (action === 'revoke') {
            const member = teamMembers.find(m => m.id === id);
            if (!member || member.status !== 'pending') return;
            if (!await showConfirm('Revoke this invite?', { title: 'Revoke Invite', iconType: 'danger', okLabel: 'Revoke', danger: true })) return;
            if (!window.db?.teamMembers?.remove) return;
            const result = await window.db.teamMembers.remove(id);
            if (!result?.success) { showAlert(result?.error || 'Failed to revoke invite.', { iconType: 'error' }); return; }
            await loadTeam();
            showAlert('Invite revoked.', { iconType: 'success' });
        } else if (action === 'remove') {
            const member = teamMembers.find(m => m.id === id);
            const isPending = member?.status === 'pending';
            const confirmText = isPending ? 'Revoke this invite?' : 'Remove this team member?';
            const confirmTitle = isPending ? 'Revoke Invite' : 'Remove Member';
            const okLabel = isPending ? 'Revoke' : 'Remove';
            if (!await showConfirm(confirmText, { title: confirmTitle, iconType: 'danger', okLabel, danger: true })) return;
            if (!window.db?.teamMembers?.remove) return;
            const result = await window.db.teamMembers.remove(id);
            if (!result?.success) { showAlert(result?.error || 'Failed to remove.', { iconType: 'error' }); return; }
            await loadTeam();
            showAlert(isPending ? 'Invite revoked.' : 'Member removed.', { iconType: 'success' });
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
                    showAlert('Invite role update is not available.', { iconType: 'error' });
                } else {
                    const result = await window.db.teamMembers.updateInviteRole(id, role);
                    if (!result?.success) {
                        showAlert(result?.error || 'Failed to update role.', { iconType: 'error' });
                    }
                }
            } else {
                if (!window.db?.teamMembers?.updateRole) {
                    showAlert('Role update is not available.', { iconType: 'error' });
                } else {
                    const result = await window.db.teamMembers.updateRole(id, role);
                    if (!result?.success) {
                        showAlert(result?.error || 'Failed to update role.', { iconType: 'error' });
                    }
                }
            }
        } catch (err) {
            showAlert(err?.message || 'Failed to update role.', { iconType: 'error' });
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

        const memberRole = String(selectedMemberForAccess?.role || '').toLowerCase();
        if (memberRole === 'owner' || memberRole === 'admin') {
            return;
        }
        const cbId = btn.dataset.cbId;
        const hasAccess = btn.dataset.hasAccess === 'true';
        const userId = selectedMemberForAccess.member_id || selectedMemberForAccess.member?.id;
        if (!userId) { showAlert('Cannot determine member ID.', { iconType: 'error' }); return; }

        if (hasAccess) {
            if (!window.db?.cashBoxAccess?.revoke) return;
            await window.db.cashBoxAccess.revoke(cbId, userId);
        } else {
            if (!window.db?.cashBoxAccess?.grant) return;
            await window.db.cashBoxAccess.grant(cbId, userId);
        }
        const pickerWrap = document.getElementById('accessMemberPickerWrap');
        const keepPicker = Boolean(pickerWrap && pickerWrap.style.display !== 'none');
        await openAccessModal(selectedMemberForAccess.id, { forcePicker: keepPicker });
    });

    // Billing toggle
    document.getElementById('billingToggle')?.addEventListener('click', () => { isYearly = !isYearly; updatePricing(); });
    document.getElementById('monthlyLabel')?.addEventListener('click', () => { isYearly = false; updatePricing(); });
    document.getElementById('yearlyLabel')?.addEventListener('click', () => { isYearly = true; updatePricing(); });

    // Billing buttons (placeholders for Stripe integration)
    document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', () => {
        showAlert('Cancel Subscription\n\nIn production: Opens Stripe portal to cancel.', { iconType: 'info' });
    });
    document.getElementById('upgradeProBtn')?.addEventListener('click', () => {
        showAlert('Upgrade to Pro\n\nIn production: Opens Stripe checkout for Pro plan.', { iconType: 'info' });
    });
    document.getElementById('manageBillingBtn')?.addEventListener('click', () => {
        showAlert('Manage Billing\n\nIn production: Opens Stripe customer portal to manage payment methods and view invoices.', { iconType: 'info' });
    });
});
