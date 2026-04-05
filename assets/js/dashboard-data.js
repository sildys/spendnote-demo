// Dashboard Data Loader - Load real data from Supabase
if (window.SpendNoteDebug) console.log('SpendNote dashboard-data.js build 20260129-1353');

function getSpendNoteHelpers() {
    const sn = (typeof window !== 'undefined' && window.SpendNote) ? window.SpendNote : null;

    const hexToRgb = (sn && typeof sn.hexToRgb === 'function')
        ? sn.hexToRgb.bind(sn)
        : () => '5, 150, 105';

    const formatCurrency = (sn && typeof sn.formatCurrency === 'function')
        ? sn.formatCurrency.bind(sn)
        : (amount, currency) => {
            try {
                return new Intl.NumberFormat(navigator.language || 'en-US', {
                    style: 'currency',
                    currency: currency || 'USD'
                }).format(Number(amount) || 0);
            } catch (e) {
                return String(amount || 0);
            }
        };

    const getIconClass = (sn && typeof sn.getIconClass === 'function')
        ? sn.getIconClass.bind(sn)
        : () => 'fa-building';

    const getColorClass = (sn && typeof sn.getColorClass === 'function')
        ? sn.getColorClass.bind(sn)
        : () => 'green';

    const getInitials = (sn && typeof sn.getInitials === 'function')
        ? sn.getInitials.bind(sn)
        : () => 'U';

    const normalizeHexColor = (value) => {
        const raw = String(value || '').trim();
        if (!raw) return '#059669';
        if (raw.startsWith('#')) return raw;
        if (/^[a-fA-F\d]{6}$/.test(raw)) return `#${raw}`;
        return raw;
    };

    return {
        hexToRgb,
        formatCurrency,
        getIconClass,
        getColorClass,
        getInitials,
        normalizeHexColor
    };
}

let dashboardLoadPromise = null;

let dashboardTxController = null;

async function maybeShowTierDowngradeModal(profile, cashBoxes) {
    const overlay = document.getElementById('tierCashBoxModal');
    const bodyEl = document.getElementById('tierCashBoxModalBody');
    const listEl = document.getElementById('tierCashBoxModalList');
    const saveBtn = document.getElementById('tierCashBoxModalSave');
    if (!overlay || !bodyEl || !listEl || !saveBtn) return;
    if (!profile?.tier_cash_boxes_pending) return;

    const tier = String(profile.subscription_tier || 'free').toLowerCase();
    const maxKeep = tier === 'free' ? 1 : tier === 'standard' ? 2 : 99;
    const n = (cashBoxes || []).length;
    if (n <= maxKeep) {
        const allIds = (cashBoxes || []).map((b) => String(b?.id || '').trim()).filter(Boolean);
        if (allIds.length && window.db?.profiles?.resolveTierCashBoxes) {
            const res = await window.db.profiles.resolveTierCashBoxes(allIds);
            if (res?.success && typeof loadDashboardData === 'function') {
                await loadDashboardData();
            }
        }
        return;
    }

    const { formatCurrency, getIconClass, hexToRgb } = getSpendNoteHelpers();
    const isMulti = maxKeep > 1;

    let teamCount = 0;
    try {
        if (window.db?.teamMembers?.getAll) {
            const members = await window.db.teamMembers.getAll();
            const currentUser = await window.auth?.getCurrentUser?.();
            const myId = String(currentUser?.id || '').trim();
            teamCount = Array.isArray(members)
                ? members.filter((m) => String(m?.member_id || m?.member?.id || '').trim() !== myId).length
                : 0;
        }
    } catch (_) {}

    const titleEl = document.getElementById('tierCashBoxModalTitle');
    if (titleEl) {
        titleEl.textContent = `You can only use ${maxKeep} cash box${isMulti ? 'es' : ''} on this plan`;
    }

    let descHtml = `You currently have ${n} cash boxes, but your plan allows only ${maxKeep}.<br>The others will stop recording new transactions and become read-only.`;

    if (tier === 'standard' || tier === 'free') {
        const teamLine = teamCount > 0
            ? `Your ${teamCount === 1 ? '1 team member has' : teamCount + ' team members have'} lost access to your cash boxes.`
            : 'Team management is no longer available on this plan.';
        descHtml += `<div style="margin-top:12px;padding:10px 14px;border-radius:10px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);color:#b91c1c;font-size:13px;font-weight:600;line-height:1.5;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${teamLine}<br>
            <span style="font-weight:400;color:#92400e;">Invite members and share cash boxes with Pro.</span>
        </div>`;
    }
    bodyEl.innerHTML = descHtml;

    const upgradeBtn = document.getElementById('tierCashBoxModalUpgrade');
    if (upgradeBtn) {
        try {
            const planUrl = window.SpendNoteUpgrade?._buildPlanUrl?.('pro', 'Cash Boxes')
                || '/spendnote-pricing.html?minPlan=pro&feature=Cash+Boxes';
            upgradeBtn.href = planUrl;
        } catch (_) {}
    }

    saveBtn.textContent = `Continue with ${maxKeep} cash box${isMulti ? 'es' : ''}`;

    listEl.innerHTML = '';
    const ordered = [...(cashBoxes || [])].sort((a, b) => {
        const ab = a?.transactions_blocked ? 1 : 0;
        const bb = b?.transactions_blocked ? 1 : 0;
        return ab - bb;
    });
    const selected = new Set(ordered.slice(0, maxKeep).map((b) => String(b?.id || '').trim()).filter(Boolean));

    const syncSelectedUI = () => {
        listEl.querySelectorAll('.tier-modal-item').forEach((item) => {
            const isSel = selected.has(item.dataset.boxId || '');
            item.classList.toggle('selected', isSel);
        });
    };

    (cashBoxes || []).forEach((box) => {
        const id = String(box?.id || '').trim();
        if (!id) return;
        const color = box?.color || '#059669';
        const rgb = hexToRgb(color);
        const iconClass = getIconClass(box?.icon);
        const balance = formatCurrency(box?.current_balance || 0, box?.currency || 'USD');
        const currency = String(box?.currency || 'USD').toUpperCase();

        const item = document.createElement('div');
        item.className = 'tier-modal-item' + (selected.has(id) ? ' selected' : '');
        item.dataset.boxId = id;
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', selected.has(id) ? 'true' : 'false');

        const indicatorClass = isMulti ? 'tier-modal-item-check' : 'tier-modal-item-radio';
        const indicatorInner = isMulti
            ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
            : '';

        item.innerHTML = `
            <div class="${indicatorClass}">${indicatorInner}</div>
            <div class="tier-modal-item-icon" style="background:rgba(${rgb},0.12);color:${color};">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="tier-modal-item-info">
                <div class="tier-modal-item-name">${String(box?.name || id).replace(/</g, '&lt;')}</div>
                <div class="tier-modal-item-meta">${currency} · ${balance}</div>
            </div>
        `;
        listEl.appendChild(item);

        item.addEventListener('click', () => {
            if (isMulti) {
                if (selected.has(id)) {
                    selected.delete(id);
                } else {
                    if (selected.size >= maxKeep) {
                        const oldest = selected.values().next().value;
                        selected.delete(oldest);
                    }
                    selected.add(id);
                }
            } else {
                selected.clear();
                selected.add(id);
            }
            syncSelectedUI();
        });
    });

    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');

    saveBtn.onclick = async () => {
        if (selected.size < 1 || selected.size > maxKeep) {
            if (typeof showAlert === 'function') {
                showAlert(`Select ${isMulti ? 'up to ' + maxKeep : 'one'} cash box${isMulti ? 'es' : ''}.`, { iconType: 'warning' });
            }
            return;
        }
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';
        const keepIds = Array.from(selected);
        const res = await window.db?.profiles?.resolveTierCashBoxes?.(keepIds);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save selection';
        if (!res || res.success !== true) {
            if (typeof showAlert === 'function') {
                showAlert(String(res?.error || 'Could not save your selection.'), { iconType: 'error' });
            }
            return;
        }
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        if (typeof loadDashboardData === 'function') {
            await loadDashboardData();
        }
    };
}

function createDashboardTransactionsController(ctx) {
    const debug = Boolean(window.SpendNoteDebug);

    const txTable = document.getElementById('transactionsTable');
    const txTbody = txTable ? txTable.querySelector('tbody') : null;

    const { hexToRgb, formatCurrency, getInitials, normalizeHexColor } = getSpendNoteHelpers();

    const cashBoxById = new Map((ctx?.cashBoxes || []).filter(Boolean).map((b) => [String(b.id), b]));

    const state = {
        latestRows: []
    };

    const viewerAvatar = {
        userId: '',
        displayName: '',
        avatarUrl: '',
        avatarColor: '#10b981',
        avatarSettings: { scale: 1, x: 0, y: 0 }
    };

    /** Current org workspace owner (profiles.id); used to fix bad rows that credit the owner but user_id is the real member. */
    let workspaceOwnerUserId = '';

    const AVATAR_SCOPE_USER_KEY = 'spendnote.user.avatar.activeUserId.v1';
    const AVATAR_KEY_PREFIX = 'spendnote.user.avatar.v2';
    const AVATAR_COLOR_KEY_PREFIX = 'spendnote.user.avatarColor.v2';
    const AVATAR_SETTINGS_KEY_PREFIX = 'spendnote.user.avatarSettings.v2';
    const AVATAR_BASE_SIZE = 96;
    const AVATAR_MIN_SCALE = 0.5;
    const AVATAR_MAX_SCALE = 3;

    const safeText = (value, fallback) => {
        const s = value === undefined || value === null ? '' : String(value);
        const trimmed = s.trim();
        if (trimmed) return trimmed;
        return fallback === undefined ? '' : String(fallback);
    };

    const isValidAvatarSource = (value) => {
        const src = String(value || '').trim();
        if (!src) return false;
        return /^data:image\//i.test(src) || /^https?:\/\//i.test(src);
    };

    const normalizeAvatarSettings = (raw) => {
        const src = raw && typeof raw === 'object' ? raw : {};
        const scaleNum = Number(src.scale);
        const scale = Number.isFinite(scaleNum)
            ? Math.max(AVATAR_MIN_SCALE, Math.min(AVATAR_MAX_SCALE, scaleNum))
            : 1;
        const xNum = Number(src.x);
        const yNum = Number(src.y);
        return {
            scale: Math.round(scale * 100) / 100,
            x: Number.isFinite(xNum) ? xNum : 0,
            y: Number.isFinite(yNum) ? yNum : 0
        };
    };

    const buildAvatarTransform = (rawSettings, slotSizePx) => {
        const settings = normalizeAvatarSettings(rawSettings);
        const slot = Number(slotSizePx);
        const ratio = Number.isFinite(slot) && slot > 0 ? (slot / AVATAR_BASE_SIZE) : 1;
        const x = Math.round(settings.x * ratio * 100) / 100;
        const y = Math.round(settings.y * ratio * 100) / 100;
        return `translate(${x}px, ${y}px) scale(${settings.scale})`;
    };

    const escapeHtml = (value) => {
        return String(value === undefined || value === null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const formatDateShort = (value) => {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDisplayId = (tx) => {
        const cbSeq = tx?.cash_box_sequence;
        const txSeq = tx?.tx_sequence_in_box;
        if (cbSeq && txSeq) {
            const snapshotPrefixRaw = safeText(tx?.cash_box_id_prefix_snapshot, '').trim().toUpperCase();
            const livePrefixRaw = safeText(tx?.cash_box?.id_prefix, '').trim().toUpperCase();
            const snapshotPrefix = snapshotPrefixRaw && snapshotPrefixRaw !== 'REC-' ? snapshotPrefixRaw : '';
            const livePrefix = livePrefixRaw && livePrefixRaw !== 'REC-' ? livePrefixRaw : '';
            const prefix = (snapshotPrefix && snapshotPrefix !== 'SN')
                ? snapshotPrefix
                : (livePrefix || snapshotPrefix || 'SN');
            const txSeqStr = String(txSeq).padStart(3, '0');
            return `${prefix}${cbSeq}-${txSeqStr}`;
        }
        const receipt = safeText(tx?.receipt_number, '');
        if (receipt) return receipt;
        return '—';
    };

    const mergeTxCashBoxSnapshot = (tx, cashBox) => {
        const base = (cashBox && typeof cashBox === 'object') ? { ...cashBox } : {};

        const snapshotName = safeText(tx?.cash_box_name_snapshot, '').trim();
        if (snapshotName) base.name = snapshotName;

        const snapshotCurrency = safeText(tx?.cash_box_currency_snapshot, '').trim().toUpperCase();
        if (/^[A-Z]{3}$/.test(snapshotCurrency)) {
            base.currency = snapshotCurrency;
        }

        const snapshotColorRaw = safeText(tx?.cash_box_color_snapshot, '').trim();
        if (snapshotColorRaw) {
            base.color = normalizeHexColor(snapshotColorRaw);
        } else if (base.color) {
            base.color = normalizeHexColor(base.color);
        }

        const snapshotIcon = safeText(tx?.cash_box_icon_snapshot, '').trim();
        if (snapshotIcon) {
            base.icon = snapshotIcon;
        }

        const snapshotPrefixRaw = safeText(tx?.cash_box_id_prefix_snapshot, '').trim().toUpperCase();
        if (snapshotPrefixRaw) {
            base.id_prefix = snapshotPrefixRaw === 'REC-' ? 'SN' : snapshotPrefixRaw;
        }

        return base;
    };

    const hydrateViewerAvatarContext = async () => {
        let user = null;
        try {
            user = await window.auth?.getCurrentUser?.();
        } catch (_) {
            user = null;
        }

        viewerAvatar.userId = safeText(user?.id, '');

        let profile = null;
        try {
            profile = await window.db?.profiles?.getCurrent?.();
        } catch (_) {
            profile = null;
        }

        viewerAvatar.avatarUrl = safeText(profile?.avatar_url || user?.user_metadata?.avatar_url, '');
        viewerAvatar.avatarColor = safeText(profile?.avatar_color || user?.user_metadata?.avatar_color, '') || '#10b981';
        viewerAvatar.avatarSettings = normalizeAvatarSettings(profile?.avatar_settings || user?.user_metadata?.avatar_settings || null);
        viewerAvatar.displayName = safeText(
            profile?.full_name || user?.user_metadata?.full_name || user?.email,
            ''
        ).toLowerCase();
    };

    /**
     * Pick which profiles row drives "Created by" avatar.
     * Prefer each member's own `profiles` avatar (user settings), not a mistaken attribution to the workspace owner.
     */
    const resolveTxCreatorProfile = (tx, profileMap, createdByName) => {
        const map = profileMap instanceof Map ? profileMap : new Map();
        const cb = safeText(tx?.created_by_user_id, '');
        const uid = safeText(tx?.user_id, '');
        const nameNorm = safeText(createdByName, '').toLowerCase();
        const orgOwner = safeText(workspaceOwnerUserId, '');

        const rowFor = (id) => (id ? map.get(String(id)) : null);
        const nameMatches = (prof) => {
            if (!prof || !nameNorm || nameNorm === '—') return false;
            return safeText(prof.full_name, '').toLowerCase() === nameNorm;
        };

        const pCb = rowFor(cb);
        const pUid = rowFor(uid);

        // Rows that credit the org owner but were recorded under the member's user_id (owner must see the member's avatar).
        if (orgOwner && cb && uid && cb === orgOwner && uid !== orgOwner) {
            const actor = rowFor(uid);
            if (actor) return actor;
        }

        // Both ids may wrongly point at the owner while created_by_user_name is the member — pick the single roster name match.
        if (orgOwner && cb === orgOwner && nameNorm && nameNorm !== '—') {
            let nameHit = null;
            let nameHitCount = 0;
            map.forEach((prof) => {
                if (!nameMatches(prof)) return;
                nameHitCount += 1;
                nameHit = prof;
            });
            if (nameHitCount === 1 && nameHit) return nameHit;
        }

        if (cb && uid && cb !== uid) {
            const mCb = nameMatches(pCb);
            const mUid = nameMatches(pUid);
            if (mUid && !mCb) return pUid;
            if (mCb && !mUid) return pCb;
            return pUid || pCb;
        }
        if (cb) return pCb;
        return pUid;
    };

    const getCreatedByAvatarData = (createdByName, tx, creatorProfiles) => {
        const profileMap = creatorProfiles instanceof Map ? creatorProfiles : new Map();
        const createdByUserId = safeText(tx?.created_by_user_id, '');
        const rowUserId = safeText(tx?.user_id, '');
        const createdByNameNorm = safeText(createdByName, '').toLowerCase();
        const isCurrentUserRow = (
            viewerAvatar.userId
            && (
                (createdByUserId && createdByUserId === viewerAvatar.userId)
                || (rowUserId && rowUserId === viewerAvatar.userId)
            )
        ) || (
            !createdByUserId
            && !rowUserId
            && viewerAvatar.displayName
            && createdByNameNorm
            && createdByNameNorm === viewerAvatar.displayName
        );

        const slotPx = 32;

        const peerProfile = resolveTxCreatorProfile(tx, profileMap, createdByName);
        if (peerProfile) {
            const peerUrl = safeText(peerProfile.avatar_url, '');
            if (peerUrl && isValidAvatarSource(peerUrl)) {
                return {
                    url: peerUrl,
                    transform: buildAvatarTransform(peerProfile.avatar_settings, slotPx)
                };
            }
            const peerColor = normalizeHexColor(peerProfile.avatar_color || '#10b981');
            const peerInitialsName = safeText(peerProfile.full_name || createdByName, '');
            const peerInitials = getInitials(peerInitialsName === '—' ? '' : peerInitialsName);
            const svgPeer = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="${peerColor}" stroke-width="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="800" fill="${peerColor}">${peerInitials}</text></svg>`;
            return {
                url: `data:image/svg+xml,${encodeURIComponent(svgPeer)}`,
                transform: ''
            };
        }

        if (isCurrentUserRow && viewerAvatar.avatarUrl && isValidAvatarSource(viewerAvatar.avatarUrl)) {
            return {
                url: viewerAvatar.avatarUrl,
                transform: buildAvatarTransform(viewerAvatar.avatarSettings, slotPx)
            };
        }

        const avatarColor = isCurrentUserRow ? normalizeHexColor(viewerAvatar.avatarColor) : '#10b981';
        const initials = getInitials(createdByName === '—' ? '' : createdByName);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="${avatarColor}" stroke-width="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="800" fill="${avatarColor}">${initials}</text></svg>`;
        return {
            url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
            transform: ''
        };
    };

    const clearTbody = () => {
        if (!txTbody) return;
        txTbody.innerHTML = '';
    };

    const renderMessageRow = (message) => {
        if (!txTbody) return;
        clearTbody();
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="9" style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-weight: 700;">${safeText(message, '')}</td>`;
        txTbody.appendChild(tr);
    };

    const bindEvents = () => {
        if (txTbody && txTbody.dataset.dashboardRowNavBound !== '1') {
            txTbody.dataset.dashboardRowNavBound = '1';

            let armedTxId = '';
            let armedUntil = 0;
            let armedRow = null;
            let armTimer = null;

            const clearArmed = () => {
                if (armTimer) {
                    clearTimeout(armTimer);
                    armTimer = null;
                }
                if (armedRow && armedRow.classList) {
                    armedRow.classList.remove('is-armed');
                }
                armedTxId = '';
                armedUntil = 0;
                armedRow = null;
            };

            const armRow = (row, txId) => {
                clearArmed();
                armedRow = row;
                armedTxId = txId;
                armedUntil = Date.now() + 1500;
                try {
                    row.classList.add('is-armed');
                    if (typeof row.focus === 'function') row.focus({ preventScroll: true });
                } catch (_) {
                    // ignore
                }
                armTimer = setTimeout(clearArmed, 1500);
            };

            const shouldIgnoreRowNav = (ev) => {
                const t = ev?.target;
                if (!t || !t.closest) return false;
                return Boolean(t.closest('a, button, input, .tx-action, .tx-actions'));
            };

            txTbody.addEventListener('click', (e) => {
                if (shouldIgnoreRowNav(e)) return;
                const row = e.target && e.target.closest ? e.target.closest('tr[data-tx-id]') : null;
                if (!row) return;
                const txId = String(row.getAttribute('data-tx-id') || '').trim();
                if (!txId) return;

                if (txId === armedTxId && Date.now() <= armedUntil) {
                    clearArmed();
                    window.location.href = `spendnote-transaction-detail.html?txId=${encodeURIComponent(txId)}`;
                    return;
                }

                armRow(row, txId);
            });

            txTbody.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                if (shouldIgnoreRowNav(e)) return;
                const row = e.target && e.target.closest ? e.target.closest('tr[data-tx-id]') : null;
                if (!row) return;
                const txId = String(row.getAttribute('data-tx-id') || '').trim();
                if (!txId) return;
                e.preventDefault();

                if (txId === armedTxId && Date.now() <= armedUntil) {
                    clearArmed();
                    window.location.href = `spendnote-transaction-detail.html?txId=${encodeURIComponent(txId)}`;
                    return;
                }

                armRow(row, txId);
            });

            txTbody.addEventListener('focusin', (e) => {
                const row = e.target && e.target.closest ? e.target.closest('tr[data-tx-id]') : null;
                if (!row) return;
                const txId = String(row.getAttribute('data-tx-id') || '').trim();
                if (!txId) return;
                if (txId !== armedTxId) {
                    clearArmed();
                }
            });
        }
    };

    const fetchPage = async () => {
        if (!window.db?.transactions?.getPage) {
            return { data: [], count: 0, error: 'Transactions API not ready.' };
        }

        const plainSelect = [
            'id',
            'user_id',
            'receipt_number',
            'cash_box_id',
            'type',
            'amount',
            'description',
            'transaction_date',
            'created_at',
            'contact_id',
            'contact_name',
            'created_by_user_id',
            'created_by_user_name',
            'cash_box_sequence',
            'tx_sequence_in_box',
            'status',
            'voided_at',
            'cash_box_name_snapshot',
            'cash_box_currency_snapshot',
            'cash_box_color_snapshot',
            'cash_box_icon_snapshot',
            'cash_box_id_prefix_snapshot'
        ].join(', ');

        const baseOpts = {
            page: 1,
            perPage: 5,
            includeSystem: false,
            // IMPORTANT: Always fetch the latest 5 by date/time (dashboard invariant)
            sortKey: 'date',
            sortDir: 'desc'
        };

        const res = await window.db.transactions.getPage({
            select: plainSelect,
            ...baseOpts
        });
        if (res && Array.isArray(res.data)) {
            res.data = res.data.map((tx) => {
                const baseCashBox = tx?.cash_box || (tx?.cash_box_id ? (cashBoxById.get(String(tx.cash_box_id)) || null) : null);
                tx.cash_box = mergeTxCashBoxSnapshot(tx, baseCashBox);
                return tx;
            });
        }
        return res;
    };

    const renderRows = (rows, creatorProfiles) => {
        if (!txTbody) return;
        clearTbody();

        // Also clear mobile card list
        const txCardList = document.getElementById('txCardList');
        if (txCardList) txCardList.innerHTML = '';

        const profileByCreator = creatorProfiles instanceof Map ? creatorProfiles : new Map();
        const txs = Array.isArray(rows) ? rows : [];
        if (!txs.length) {
            renderMessageRow('No transactions found.');
            if (txCardList) txCardList.innerHTML = '<div class="tx-card-empty">No transactions found.</div>';
            return;
        }

        txs.forEach((tx) => {
            const type = safeText(tx?.type, '').toLowerCase();
            const isIncome = type === 'income';
            const isVoided = safeText(tx?.status, 'active').toLowerCase() === 'voided';

            const cashBoxColor = normalizeHexColor(tx?.cash_box?.color || '#10b981');
            const cashBoxRgb = hexToRgb(cashBoxColor);
            const currency = tx?.cash_box?.currency || 'USD';

            const formattedAmount = formatCurrency(tx?.amount, currency);

            let createdByName = tx?.created_by_user_name || tx?.created_by || '';
            if (!createdByName || String(createdByName).trim() === '—') {
                createdByName = safeText(viewerAvatar.displayName, '');
            }
            createdByName = String(createdByName || '').trim() || '—';
            const avatarData = getCreatedByAvatarData(createdByName, tx, profileByCreator);
            const avatarStyle = avatarData.transform
                ? ` style="transform: ${avatarData.transform}; transform-origin: 50% 50%;"`
                : '';

            const displayId = getDisplayId(tx);
            const contactName = safeText(tx?.contact?.name || tx?.contact_name, '—');
            const contactId = tx?.contact_id || tx?.contact?.id || '';
            const cashBoxId = tx?.cash_box_id || tx?.cash_box?.id || '';
            const descEnc = encodeURIComponent(safeText(tx?.description, ''));
            const contactEnc = encodeURIComponent(safeText(contactName, ''));
            const descriptionText = safeText(tx?.description, '—');
            const descriptionHtml = escapeHtml(descriptionText);

            const cashBoxNameText = safeText(tx?.cash_box?.name, 'Unknown');
            const cashBoxNameHtml = escapeHtml(cashBoxNameText);
            const contactNameHtml = escapeHtml(contactName);

            const pillClass = isVoided ? 'void' : (isIncome ? 'in' : 'out');
            const pillIcon = isVoided ? 'fa-ban' : (isIncome ? 'fa-arrow-down' : 'fa-arrow-up');
            const pillLabel = isVoided ? 'VOID' : (isIncome ? 'IN' : 'OUT');

            // ── Desktop: table row ──
            const tr = document.createElement('tr');
            tr.tabIndex = 0;
            tr.setAttribute('data-tx-id', safeText(tx?.id, ''));
            tr.style.setProperty('--cashbox-rgb', cashBoxRgb);
            tr.style.setProperty('--cashbox-color', cashBoxColor);
            tr.innerHTML = `
                <td>
                    <div class="tx-type-pill ${pillClass}">
                        <span class="quick-icon"><i class="fas ${pillIcon}"></i></span>
                        <span class="quick-label">${pillLabel}</span>
                    </div>
                </td>
                <td><span class="tx-id">${safeText(displayId, '—')}</span></td>
                <td><span class="tx-date">${formatDateShort(tx?.transaction_date || tx?.created_at)}</span></td>
                <td><span class="cashbox-badge" title="${cashBoxNameHtml}" style="--cb-color: ${cashBoxColor};">${cashBoxNameHtml}</span></td>
                <td><span class="tx-contact" title="${contactNameHtml}">${contactNameHtml}</span></td>
                <td><span class="tx-desc" title="${descriptionHtml}">${descriptionHtml}</span></td>
                <td><span class="tx-amount ${isIncome ? 'in' : 'out'} ${isVoided ? 'voided' : ''}">${formattedAmount}</span></td>
                <td><div class="tx-createdby"><div class="user-avatar user-avatar-small"><img src="${avatarData.url}" alt="${safeText(createdByName, '—')}"${avatarStyle}></div></div></td>
                <td>
                    <div class="tx-actions">
                        <button type="button" class="tx-action btn-duplicate" data-tx-id="${safeText(tx?.id, '')}" data-cash-box-id="${safeText(cashBoxId, '')}" data-direction="${isIncome ? 'in' : 'out'}" data-amount="${safeText(tx?.amount, '')}" data-contact-id="${safeText(contactId, '')}" data-description="${descEnc}" data-contact-name="${contactEnc}" data-cb-blocked="${tx?.cash_box?.transactions_blocked ? '1' : ''}">
                            <i class="fas fa-copy"></i>
                            <span>Duplicate</span>
                        </button>
                        <a href="spendnote-transaction-detail.html?txId=${encodeURIComponent(safeText(tx?.id, ''))}" class="tx-action btn-view">
                            <span>View</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </td>
            `;
            txTbody.appendChild(tr);

            // ── Mobile: card ──
            if (txCardList) {
                const card = document.createElement('a');
                card.className = `tx-card tx-card--${pillClass}`;
                card.href = `spendnote-transaction-detail.html?txId=${encodeURIComponent(safeText(tx?.id, ''))}`;
                card.setAttribute('data-tx-id', safeText(tx?.id, ''));
                card.style.setProperty('--cb-color', cashBoxColor);
                card.style.setProperty('--cb-rgb', cashBoxRgb);
                const hasContact = contactName && contactName !== '—';
                const hasDesc = descriptionText && descriptionText !== '—';
                const subline = hasContact ? contactNameHtml : (hasDesc ? descriptionHtml : cashBoxNameHtml);
                card.innerHTML = `
                    <div class="tx-card-left">
                        <div class="tx-card-pill ${pillClass}">
                            <i class="fas ${pillIcon}"></i>
                        </div>
                    </div>
                    <div class="tx-card-body">
                        <div class="tx-card-top">
                            <span class="tx-card-label">${pillLabel} · ${cashBoxNameHtml}</span>
                            <span class="tx-card-amount ${isIncome ? 'in' : 'out'} ${isVoided ? 'voided' : ''}">${formattedAmount}</span>
                        </div>
                        <div class="tx-card-bottom">
                            <span class="tx-card-sub">${subline}</span>
                            <span class="tx-card-date">${formatDateShort(tx?.transaction_date || tx?.created_at)}</span>
                        </div>
                    </div>
                    <div class="tx-card-right">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;
                txCardList.appendChild(card);
            }
        });
    };

    async function render() {
        bindEvents();

        await hydrateViewerAvatarContext();

        renderMessageRow('Loading…');

        const res = await fetchPage();
        if (res && res.error) {
            renderMessageRow(String(res.error || 'Failed to load transactions.'));
            return;
        }

        const txs = Array.isArray(res?.data) ? res.data : [];

        workspaceOwnerUserId = '';
        try {
            workspaceOwnerUserId = safeText(await window.db?.teamMembers?.getOrgOwnerUserId?.(), '');
        } catch (_) {
            workspaceOwnerUserId = '';
        }

        const creatorIds = [
            ...new Set(
                txs.flatMap((t) => {
                    const cb = safeText(t?.created_by_user_id, '');
                    const uid = safeText(t?.user_id, '');
                    return [cb, uid].filter(Boolean);
                })
            )
        ];

        // Same profile blobs as Team page (org roster), then overlay a direct profiles read for tx creators (freshest avatar).
        const creatorProfiles = new Map();
        try {
            if (window.db?.teamMembers?.getAll) {
                const team = await window.db.teamMembers.getAll();
                for (const m of Array.isArray(team) ? team : []) {
                    const mid = safeText(m?.member_id || m?.member?.id, '');
                    const mem = m?.member;
                    if (mid && mem && typeof mem === 'object') {
                        creatorProfiles.set(mid, mem);
                    }
                }
            }
        } catch (_) {
            // ignore roster load failures
        }

        if (creatorIds.length && window.supabaseClient) {
            try {
                const { data: profRows, error: profErr } = await window.supabaseClient
                    .from('profiles')
                    .select('id,avatar_url,avatar_settings,avatar_color,full_name')
                    .in('id', creatorIds);
                if (!profErr && Array.isArray(profRows)) {
                    for (const p of profRows) {
                        const id = safeText(p?.id, '');
                        if (!id) continue;
                        const prev = creatorProfiles.get(id);
                        creatorProfiles.set(id, prev && typeof prev === 'object' ? { ...prev, ...p } : p);
                    }
                }
            } catch (_) {
                // keep roster-only map
            }
        }

        state.latestRows = txs;
        renderRows(txs, creatorProfiles);
    }

    return {
        state,
        render
    };
}

async function loadDashboardData() {
    if (dashboardLoadPromise) {
        return await dashboardLoadPromise;
    }

    dashboardLoadPromise = (async () => {
        try {
            const swiperWrapper = document.querySelector('.registers-swiper .swiper-wrapper');
            if (!swiperWrapper) return;

            const waitForDbApi = async () => {
                for (let i = 0; i < 120; i++) {
                    const api = window.db;
                    if (api?.cashBoxes?.getAll) return api;
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
                return null;
            };

            const dbApi = await waitForDbApi();
            if (!dbApi) {
                throw new Error('Dashboard DB API not ready');
            }

            let myOrgRole = '';
            try {
                myOrgRole = String(await window.db?.orgMemberships?.getMyRole?.() || '').trim().toLowerCase();
            } catch (_) {
                myOrgRole = '';
            }
            const canAddCashBoxByRole = myOrgRole !== 'user';
            try {
                window.__spendnoteCanAddCashBox = canAddCashBoxByRole;
            } catch (_) {}

            try {
                const inviteBanner = document.getElementById('inviteBanner');
                if (inviteBanner && !canAddCashBoxByRole) inviteBanner.style.display = 'none';
            } catch (_) {}

            const debug = Boolean(window.SpendNoteDebug);

            const { hexToRgb, getIconClass, formatCurrency } = getSpendNoteHelpers();

            const cashBoxesPromise = dbApi.cashBoxes.getAll({
                select: 'id, name, color, currency, icon, current_balance, created_at, sort_order, sequence_number, transactions_blocked'
            });

            const profilePromise = typeof dbApi.profiles?.getCurrent === 'function'
                ? dbApi.profiles.getCurrent()
                : Promise.resolve(null);

            const [cashBoxes, profileRow] = await Promise.all([cashBoxesPromise, profilePromise]);

            const getStoredOrderKey = (userId) => {
                const uid = String(userId || '').trim();
                if (!uid) return '';
                return `spendnote.cashBoxOrder.${uid}.v1`;
            };

            const readStoredOrder = (userId) => {
                try {
                    const key = getStoredOrderKey(userId);
                    if (!key) return [];
                    const raw = localStorage.getItem(key);
                    const parsed = raw ? JSON.parse(raw) : [];
                    return Array.isArray(parsed)
                        ? parsed.map((id) => String(id || '').trim()).filter(Boolean)
                        : [];
                } catch (_) {
                    return [];
                }
            };

            if (cashBoxes && cashBoxes.length > 0) {
                let viewerUserId = '';
                try {
                    const user = await window.auth?.getCurrentUser?.();
                    viewerUserId = String(user?.id || '').trim();
                } catch (_) {
                    viewerUserId = '';
                }

                const storedOrderIds = readStoredOrder(viewerUserId);
                if (storedOrderIds.length > 0) {
                    const rank = new Map(storedOrderIds.map((id, idx) => [id, idx]));
                    cashBoxes.sort((a, b) => {
                        const aId = String(a?.id || '');
                        const bId = String(b?.id || '');
                        const aRank = rank.has(aId) ? rank.get(aId) : Number.MAX_SAFE_INTEGER;
                        const bRank = rank.has(bId) ? rank.get(bId) : Number.MAX_SAFE_INTEGER;
                        if (aRank !== bRank) return aRank - bRank;

                        const aSort = Number(a?.sort_order);
                        const bSort = Number(b?.sort_order);
                        const aSortRank = Number.isFinite(aSort) ? aSort : Number.MAX_SAFE_INTEGER;
                        const bSortRank = Number.isFinite(bSort) ? bSort : Number.MAX_SAFE_INTEGER;
                        if (aSortRank !== bSortRank) return aSortRank - bSortRank;

                        const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
                        const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
                        if (aTime !== bTime) return aTime - bTime;
                        return aId.localeCompare(bId);
                    });
                }
            }
            
            if (cashBoxes && cashBoxes.length > 0) {
                const savedActiveId = String(localStorage.getItem('activeCashBoxId') || '').trim();
                const firstUnblocked = cashBoxes.find((box) => !box?.transactions_blocked);
                const savedOk = savedActiveId
                    && cashBoxes.some((box) => String(box?.id || '').trim() === savedActiveId)
                    && !cashBoxes.find((box) => String(box?.id || '').trim() === savedActiveId)?.transactions_blocked;
                const defaultActiveId = savedOk
                    ? savedActiveId
                    : String(firstUnblocked?.id || cashBoxes[0]?.id || '').trim();
                
                // Remove loading indicator
                const loadingSlide = swiperWrapper.querySelector('.loading-slide');
                if (loadingSlide) loadingSlide.remove();
                
                // Remove only register-card slides, keep the add-cash-box-card slide
                const allSlides = Array.from(swiperWrapper.querySelectorAll('.swiper-slide'));
                const registerSlides = allSlides.filter(slide => slide.querySelector('.register-card'));
                registerSlides.forEach(slide => slide.remove());

                // Keep the "Add Cash Box" slide but move it to the end after inserting real cash boxes.
                const addSlide = allSlides.find(slide => slide.querySelector('.add-cash-box-card')) || null;
                if (addSlide) {
                    try { addSlide.remove(); } catch (_) {}
                }
                
                // Generate HTML for all cash boxes
                let allSlidesHTML = '';
                cashBoxes.forEach((box, index) => {
                    const color = box.color || '#059669';
                    const rgb = hexToRgb(color);
                    const iconClass = getIconClass(box.icon);
                    const isActive = (defaultActiveId && box.id === defaultActiveId) ? 'active' : '';
                    const txBlocked = Boolean(box?.transactions_blocked);
                    const blockedClass = txBlocked ? ' register-card--blocked' : '';

                    const seq = Number(box.sequence_number);
                    const displayCode = Number.isFinite(seq) && seq > 0
                        ? `SN-${String(seq).padStart(3, '0')}`
                        : '—';
                    
                    // Format currency (locale + cash box currency)
                    const formattedBalance = formatCurrency(box.current_balance || 0, box.currency || 'USD');
                    
                    // Create slide HTML
                    allSlidesHTML += `
                        <div class="swiper-slide">
                            <div class="register-card ${isActive}${blockedClass}" 
                                 data-id="${box.id}" 
                                 data-name="${box.name}" 
                                 data-currency="${String(box.currency || 'USD').toUpperCase()}"
                                 data-color="${color}" 
                                  data-rgb="${rgb}"
                                 data-display-code="${displayCode}"
                                 data-sequence-number="${Number.isFinite(seq) ? seq : ''}"
                                 data-transactions-blocked="${txBlocked ? '1' : ''}"
                                 style="--card-color: ${color}; --card-rgb: ${rgb};"
                                 role="button" 
                                 tabindex="0">
                                <div class="register-top">
                                    <div class="register-header-left">
                                        <a href="spendnote-cash-box-detail.html?cashBoxId=${box.id}" class="register-icon register-icon-link" aria-label="Cash Box detail">
                                            <i class="fas ${iconClass}"></i>
                                        </a>
                                        <div class="register-info">
                                            <div class="register-name" style="font-size:24px;font-weight:900;line-height:1.1;">${box.name}</div>
                                            <div class="register-id">${displayCode}</div>
                                        </div>
                                    </div>
                                    ${canAddCashBoxByRole ? `
                                    <div class="register-actions">
                                        <a class="register-kebab" href="spendnote-cash-box-settings.html?cashBoxId=${box.id}" aria-label="Cash Box settings" title="Cash Box settings">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </a>
                                    </div>` : ''}
                                </div>
                                
                                <div class="register-balance">${formattedBalance}</div>

                                <div class="register-quick-actions">
                                    <button type="button" class="register-quick-btn in" data-quick="in"${txBlocked ? ' disabled aria-disabled="true"' : ''}>
                                        <span class="quick-icon" aria-hidden="true">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 3V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                <path d="M4.5 8.8L8 12.3L11.5 8.8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </span>
                                        <span class="quick-label">IN</span>
                                    </button>
                                    <button type="button" class="register-quick-btn out" data-quick="out"${txBlocked ? ' disabled aria-disabled="true"' : ''}>
                                        <span class="quick-icon" aria-hidden="true">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 13V4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                <path d="M4.5 7.2L8 3.7L11.5 7.2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </span>
                                        <span class="quick-label">OUT</span>
                                    </button>
                                </div>
                                
                                <div class="register-stats">
                                    <div class="stat-item">
                                        <div class="tooltip">Loading...</div>
                                        <div class="stat-label">Today In</div>
                                        <div class="stat-value in">+$0</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="tooltip">Loading...</div>
                                        <div class="stat-label">Today Out</div>
                                        <div class="stat-value out">-$0</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                // Insert all cash boxes before the "Add Cash Box" card
                swiperWrapper.insertAdjacentHTML('beforeend', allSlidesHTML);

                if (addSlide && canAddCashBoxByRole) {
                    try {
                        swiperWrapper.appendChild(addSlide);
                    } catch (_) {

                    }
                }
                
                if (debug) console.log('✅ Inserted', cashBoxes.length, 'cash boxes before Add Cash Box card');
                
                // Reinitialize Swiper after adding slides
                if (window.registersSwiper) {
                    window.registersSwiper.update();
                    const activeSlideIndex = cashBoxes.findIndex((box) => String(box?.id || '').trim() === defaultActiveId);
                    if (activeSlideIndex >= 0) {
                        window.registersSwiper.slideTo(activeSlideIndex, 0);
                    }
                    
                    // Set active class on current slide
                    const slides = swiperWrapper.querySelectorAll('.register-card');
                    slides.forEach(card => {
                        if (card.dataset.id === defaultActiveId) {
                            card.classList.add('active');
                        }
                    });

                    // Update Add Cash Box card with real tier and box count
                    try {
                        const addCard = document.querySelector('.add-cash-box-card');
                        if (addCard) {
                            const tier = await window.SpendNoteFeatures?.getTier?.() || 'free';
                            const realBoxCount = swiperWrapper.querySelectorAll('.register-card').length;
                            addCard.setAttribute('data-plan', tier === 'preview' ? 'pro' : tier);
                            addCard.setAttribute('data-box-count', String(realBoxCount));
                        }
                    } catch (_) {}

                    // Ensure Add Cash Box card matches height of other cards
                    try {
                        const addCard = document.querySelector('.add-cash-box-card');
                        const heights = Array.from(swiperWrapper.querySelectorAll('.register-card'))
                            .map((el) => el.getBoundingClientRect().height)
                            .filter((h) => Number.isFinite(h) && h > 0);
                        const maxHeight = heights.length ? Math.max(...heights) : 0;
                        if (addCard && maxHeight) {
                            addCard.style.minHeight = `${Math.ceil(maxHeight)}px`;
                        }
                    } catch (_) {

                    }

                    try {
                        if (typeof window.initCashBoxCards === 'function') {
                            window.initCashBoxCards();
                        }
                    } catch (_) {

                    }
                } else if (debug) {
                    console.log('⚠️ Swiper not initialized yet');
                }
                
                if (debug) console.log('✅ Dashboard loaded with real cash boxes:', cashBoxes.length);
                
                // Update modal cash box dropdown
                updateModalCashBoxDropdown(cashBoxes);

                try {
                    await maybeShowTierDowngradeModal(profileRow, cashBoxes);
                } catch (e) {
                    if (debug) console.warn('[Downgrade modal]', e);
                }

                try {
                    const hasBlocked = (cashBoxes || []).some((b) => Boolean(b?.transactions_blocked));
                    if (hasBlocked && myOrgRole === 'admin' && !profileRow?.tier_cash_boxes_pending) {
                        const wrap = document.querySelector('main.main-content');
                        if (wrap && !document.getElementById('snDowngradeAdminNotice')) {
                            const note = document.createElement('div');
                            note.id = 'snDowngradeAdminNotice';
                            note.setAttribute('role', 'status');
                            note.style.cssText = 'margin:0 0 12px;padding:12px 14px;border-radius:10px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.35);color:var(--text);font-size:13px;line-height:1.5;';
                            note.textContent = 'Some cash boxes cannot record transactions until the subscription owner finishes the plan change on their account.';
                            wrap.insertBefore(note, wrap.firstChild);
                        }
                    }
                } catch (_) {}
            } else if (debug) {
                console.log('ℹ️ No cash boxes found in database');
            }

            // Ensure the transactions table exists (aggressive onboarding may replace it with empty state)
            if (!document.getElementById('transactionsTable')) {
                const txCard = document.querySelector('.transactions-card');
                if (txCard) {
                    txCard.innerHTML = `
                        <div class="transactions-header" id="transactionsHeader">
                            <div class="header-top">
                                <h2 class="transactions-title">Latest Transactions</h2>
                                <a href="spendnote-transaction-history.html" class="view-all-btn">
                                    <span>View All</span>
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                        <div class="table-container">
                            <div class="table-wrapper">
                                <table id="transactionsTable">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>ID</th>
                                            <th>Date</th>
                                            <th>Cash Box</th>
                                            <th>Contact</th>
                                            <th>Description</th>
                                            <th class="col-amount">Amount</th>
                                            <th>Created by</th>
                                            <th class="col-action">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <div id="txCardList" class="tx-card-list" aria-label="Latest transactions"></div>
                        </div>`;
                }
            }

            dashboardTxController = createDashboardTransactionsController({ cashBoxes: cashBoxes || [] });
            try {
                await dashboardTxController.render();
            } catch (e) {
                if (debug) console.warn('[DashboardTx] Render failed:', e);
            }

            window.__spendnoteDashboardDataLoaded = true;
            document.documentElement.classList.remove('dashboard-loading');
            document.documentElement.classList.add('dashboard-ready');
            window.dispatchEvent(new Event('SpendNoteDashboardDataLoaded'));
            
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            document.documentElement.classList.remove('dashboard-loading');
            document.documentElement.classList.add('dashboard-ready');
        }
    })();

    try {
        return await dashboardLoadPromise;
    } finally {
        dashboardLoadPromise = null;
    }
}

// Update modal cash box dropdown with real data
function updateModalCashBoxDropdown(cashBoxes) {
    const modalRegisterSelect = document.getElementById('modalRegister');
    if (!modalRegisterSelect || !cashBoxes || cashBoxes.length === 0) return;

    const { getIconClass, hexToRgb } = getSpendNoteHelpers();

    const recordable = cashBoxes.filter((box) => !box?.transactions_blocked);
    const pool = recordable.length ? recordable : cashBoxes;

    const savedActiveId = String(localStorage.getItem('activeCashBoxId') || '').trim();
    const savedInPool = savedActiveId && pool.some((box) => String(box?.id || '').trim() === savedActiveId);
    const defaultActiveId = savedInPool
        ? savedActiveId
        : String(pool[0]?.id || '').trim();
    
    // Clear existing options
    modalRegisterSelect.innerHTML = '';
    
    // Add options for each cash box
    pool.forEach((box, index) => {
        const color = box.color || '#059669';
        const option = document.createElement('option');
        option.value = box.id;
        option.textContent = box.transactions_blocked ? `${box.name} (read-only)` : box.name;
        option.setAttribute('data-color', color);
        option.setAttribute('data-rgb', hexToRgb(color));
        option.setAttribute('data-icon', getIconClass(box.icon));
        
        // Set default option as selected
        if (defaultActiveId && box.id === defaultActiveId) {
            option.selected = true;
        }
        
        modalRegisterSelect.appendChild(option);
    });
    
    if (Boolean(window.SpendNoteDebug)) {
        console.log('✅ Modal cash box dropdown updated with', cashBoxes.length, 'cash boxes');
    }
}

// Export for use in other scripts
window.loadDashboardData = loadDashboardData;
