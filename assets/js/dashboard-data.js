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

        let userId = safeText(user?.id, '');
        if (!userId) {
            try {
                userId = safeText(localStorage.getItem(AVATAR_SCOPE_USER_KEY), '');
            } catch (_) {
                userId = '';
            }
        }
        viewerAvatar.userId = userId;

        let profile = null;
        try {
            profile = await window.db?.profiles?.getCurrent?.();
        } catch (_) {
            profile = null;
        }

        const scopedAvatarKey = userId ? `${AVATAR_KEY_PREFIX}.${userId}` : '';
        const scopedColorKey = userId ? `${AVATAR_COLOR_KEY_PREFIX}.${userId}` : '';
        const scopedSettingsKey = userId ? `${AVATAR_SETTINGS_KEY_PREFIX}.${userId}` : '';

        let avatarUrl = safeText(profile?.avatar_url || user?.user_metadata?.avatar_url, '');
        let avatarColor = safeText(profile?.avatar_color || user?.user_metadata?.avatar_color, '');
        let avatarSettings = profile?.avatar_settings || user?.user_metadata?.avatar_settings || null;

        try {
            if (!avatarUrl && scopedAvatarKey) {
                avatarUrl = safeText(localStorage.getItem(scopedAvatarKey), '');
            }
            if (!avatarColor && scopedColorKey) {
                avatarColor = safeText(localStorage.getItem(scopedColorKey), '');
            }
            if (!avatarSettings && scopedSettingsKey) {
                const rawSettings = localStorage.getItem(scopedSettingsKey);
                avatarSettings = rawSettings ? JSON.parse(rawSettings) : null;
            }
        } catch (_) {
            // ignore
        }

        viewerAvatar.avatarUrl = avatarUrl;
        viewerAvatar.avatarColor = avatarColor || '#10b981';
        viewerAvatar.avatarSettings = normalizeAvatarSettings(avatarSettings);
        viewerAvatar.displayName = safeText(
            profile?.full_name || user?.user_metadata?.full_name || user?.email,
            ''
        ).toLowerCase();

        try {
            if (userId) {
                localStorage.setItem(AVATAR_SCOPE_USER_KEY, userId);
                if (scopedAvatarKey && avatarUrl) {
                    localStorage.setItem(scopedAvatarKey, avatarUrl);
                }
                if (scopedColorKey && viewerAvatar.avatarColor) {
                    localStorage.setItem(scopedColorKey, viewerAvatar.avatarColor);
                }
                if (scopedSettingsKey) {
                    localStorage.setItem(scopedSettingsKey, JSON.stringify(viewerAvatar.avatarSettings));
                }
            }
        } catch (_) {
            // ignore
        }
    };

    const getCreatedByAvatarData = (createdByName, tx) => {
        const createdByUserId = safeText(tx?.created_by_user_id, '');
        const createdByNameNorm = safeText(createdByName, '').toLowerCase();
        const isCurrentUserRow = (
            viewerAvatar.userId
            && createdByUserId
            && createdByUserId === viewerAvatar.userId
        ) || (
            !createdByUserId
            && viewerAvatar.displayName
            && createdByNameNorm
            && createdByNameNorm === viewerAvatar.displayName
        );

        if (isCurrentUserRow && viewerAvatar.avatarUrl) {
            return {
                url: viewerAvatar.avatarUrl,
                transform: buildAvatarTransform(viewerAvatar.avatarSettings, 32)
            };
        }

        const avatarColor = isCurrentUserRow ? viewerAvatar.avatarColor : '#10b981';
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

    const renderRows = (rows) => {
        if (!txTbody) return;
        clearTbody();

        const txs = Array.isArray(rows) ? rows : [];
        if (!txs.length) {
            renderMessageRow('No transactions found.');
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
                try {
                    createdByName = localStorage.getItem('spendnote.user.fullName.v1') || '';
                } catch (_) {
                    createdByName = '';
                }
            }
            createdByName = String(createdByName || '').trim() || '—';
            const avatarData = getCreatedByAvatarData(createdByName, tx);
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
                        <button type="button" class="tx-action btn-duplicate" data-tx-id="${safeText(tx?.id, '')}" data-cash-box-id="${safeText(cashBoxId, '')}" data-direction="${isIncome ? 'in' : 'out'}" data-amount="${safeText(tx?.amount, '')}" data-contact-id="${safeText(contactId, '')}" data-description="${descEnc}" data-contact-name="${contactEnc}">
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

        state.latestRows = Array.isArray(res?.data) ? res.data : [];
        renderRows(state.latestRows);
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

            const debug = Boolean(window.SpendNoteDebug);

            const { hexToRgb, getIconClass, formatCurrency } = getSpendNoteHelpers();

            const cashBoxesPromise = db.cashBoxes.getAll({
                select: 'id, name, color, currency, icon, current_balance, created_at, sort_order, sequence_number'
            });

            const [cashBoxes] = await Promise.all([cashBoxesPromise]);
            
            if (cashBoxes && cashBoxes.length > 0) {
                const savedActiveId = String(localStorage.getItem('activeCashBoxId') || '').trim();
                const hasSavedActive = savedActiveId
                    ? cashBoxes.some((box) => String(box?.id || '').trim() === savedActiveId)
                    : false;
                const defaultActiveId = hasSavedActive
                    ? savedActiveId
                    : String(cashBoxes[0]?.id || '').trim();
                
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

                    const seq = Number(box.sequence_number);
                    const displayCode = Number.isFinite(seq) && seq > 0
                        ? `SN-${String(seq).padStart(3, '0')}`
                        : '—';
                    
                    // Format currency (locale + cash box currency)
                    const formattedBalance = formatCurrency(box.current_balance || 0, box.currency || 'USD');
                    
                    // Create slide HTML
                    allSlidesHTML += `
                        <div class="swiper-slide">
                            <div class="register-card ${isActive}" 
                                 data-id="${box.id}" 
                                 data-name="${box.name}" 
                                 data-color="${color}" 
                                  data-rgb="${rgb}"
                                 data-display-code="${displayCode}"
                                 data-sequence-number="${Number.isFinite(seq) ? seq : ''}"
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
                                    <div class="register-actions">
                                        <a class="register-kebab" href="spendnote-cash-box-settings.html?cashBoxId=${box.id}" aria-label="Cash Box settings" title="Cash Box settings">
                                            <i class="fas fa-ellipsis-v"></i>
                                        </a>
                                    </div>
                                </div>
                                
                                <div class="register-balance">${formattedBalance}</div>

                                <div class="register-quick-actions">
                                    <button type="button" class="register-quick-btn in" data-quick="in">
                                        <span class="quick-icon" aria-hidden="true">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 3V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
                                                <path d="M4.5 8.8L8 12.3L11.5 8.8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </span>
                                        <span class="quick-label">IN</span>
                                    </button>
                                    <button type="button" class="register-quick-btn out" data-quick="out">
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

                if (addSlide) {
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
            } else if (debug) {
                console.log('ℹ️ No cash boxes found in database');
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

    const savedActiveId = String(localStorage.getItem('activeCashBoxId') || '').trim();
    const hasSavedActive = savedActiveId
        ? cashBoxes.some((box) => String(box?.id || '').trim() === savedActiveId)
        : false;
    const defaultActiveId = hasSavedActive
        ? savedActiveId
        : String(cashBoxes[0]?.id || '').trim();
    
    // Clear existing options
    modalRegisterSelect.innerHTML = '';
    
    // Add options for each cash box
    cashBoxes.forEach((box, index) => {
        const color = box.color || '#059669';
        const option = document.createElement('option');
        option.value = box.id;
        option.textContent = box.name;
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
