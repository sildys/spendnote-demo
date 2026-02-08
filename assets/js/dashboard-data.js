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

    const tableWrapper = document.getElementById('tableWrapper');
    const headerRow = document.getElementById('transactionTableHeader');

    const { hexToRgb, formatCurrency, getInitials, normalizeHexColor } = getSpendNoteHelpers();

    const cashBoxById = new Map((ctx?.cashBoxes || []).filter(Boolean).map((b) => [String(b.id), b]));

    const state = {
        sort: { key: 'date', direction: 'desc' },
        latestRows: []
    };

    const getCreatedByAvatarUrl = (createdByName) => {
        try {
            const storedAvatar = localStorage.getItem('spendnote.user.avatar.v1');
            if (storedAvatar) return storedAvatar;
        } catch (_) {
            // ignore
        }

        let avatarColor = '#10b981';
        try {
            avatarColor = localStorage.getItem('spendnote.user.avatarColor.v1') || '#10b981';
        } catch (_) {
            // ignore
        }

        const initials = getInitials(createdByName === '—' ? '' : createdByName);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="${avatarColor}" stroke-width="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="800" fill="${avatarColor}">${initials}</text></svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    const removeExistingRows = () => {
        if (!tableWrapper) return;
        const existingRows = Array.from(tableWrapper.querySelectorAll('.table-grid'))
            .filter((el) => !el.classList.contains('table-header'));
        existingRows.forEach((el) => el.remove());
    };

    const renderMessageRow = (message) => {
        if (!tableWrapper) return;
        removeExistingRows();
        const row = document.createElement('div');
        row.className = 'table-grid';
        row.tabIndex = -1;
        row.innerHTML = `<div style="grid-column: 1 / -1; padding: 18px 0; text-align: center; color: var(--text-muted); font-weight: 800;">${String(message || '')}</div>`;
        tableWrapper.appendChild(row);
    };

    const sortRows = (rows, sort) => {
        const list = Array.isArray(rows) ? [...rows] : [];
        const dir = sort?.direction === 'asc' ? 1 : -1;
        const key = String(sort?.key || 'date');

        const getVal = (tx) => {
            if (key === 'type') return String(tx?.type || '').toLowerCase();
            if (key === 'date') return Date.parse(tx?.created_at || tx?.transaction_date || '') || 0;
            if (key === 'amount') return Number(tx?.amount) || 0;
            if (key === 'cash_box') return String(tx?.cash_box?.name || '').toLowerCase();
            if (key === 'contact') return String(tx?.contact?.name || tx?.contact_name || '').toLowerCase();
            if (key === 'created_by') return String(tx?.created_by_user_name || tx?.created_by || '').toLowerCase();
            return '';
        };

        list.sort((a, b) => {
            const av = getVal(a);
            const bv = getVal(b);
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return String(a?.id || '').localeCompare(String(b?.id || '')) * dir;
        });

        return list;
    };

    const updateSortHeaderClasses = () => {
        if (!headerRow) return;
        Array.from(headerRow.querySelectorAll('.sortable')).forEach((el) => {
            el.classList.remove('asc', 'desc');
            const key = String(el.getAttribute('data-sort-key') || '').trim();
            if (key && key === state.sort.key) {
                el.classList.add(state.sort.direction);
            }
        });
    };

    const bindEvents = () => {
        if (headerRow && headerRow.dataset.dashboardSortBound === '1') return;
        if (headerRow) headerRow.dataset.dashboardSortBound = '1';

        if (headerRow) {
            headerRow.addEventListener('click', (e) => {
                const target = e.target && e.target.closest ? e.target.closest('.sortable[data-sort-key]') : null;
                if (!target) return;
                const key = String(target.getAttribute('data-sort-key') || '').trim();
                if (!key) return;

                if (state.sort.key === key) {
                    state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sort.key = key;
                    state.sort.direction = 'asc';
                }

                updateSortHeaderClasses();

                // Sort only within the already-fetched latest 5 rows.
                renderRows(sortRows(state.latestRows, state.sort));
            });

            headerRow.addEventListener('keydown', (e) => {
                const isEnter = e.key === 'Enter';
                const isSpace = e.key === ' ';
                if (!isEnter && !isSpace) return;
                const target = e.target && e.target.closest ? e.target.closest('.sortable[data-sort-key]') : null;
                if (!target) return;
                e.preventDefault();
                target.click();
            });
        }

        if (tableWrapper && tableWrapper.dataset.dashboardRowNavBound !== '1') {
            tableWrapper.dataset.dashboardRowNavBound = '1';

            const shouldIgnoreRowNav = (ev) => {
                const t = ev?.target;
                if (!t || !t.closest) return false;
                return Boolean(t.closest('a, button, input, .tx-action, .tx-actions'));
            };

            tableWrapper.addEventListener('click', (e) => {
                if (shouldIgnoreRowNav(e)) return;
                const row = e.target && e.target.closest ? e.target.closest('.table-grid[data-tx-id]') : null;
                if (!row) return;
                const txId = String(row.getAttribute('data-tx-id') || '').trim();
                if (!txId) return;
                window.location.href = `spendnote-transaction-detail.html?txId=${encodeURIComponent(txId)}`;
            });

            tableWrapper.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                if (shouldIgnoreRowNav(e)) return;
                const row = e.target && e.target.closest ? e.target.closest('.table-grid[data-tx-id]') : null;
                if (!row) return;
                const txId = String(row.getAttribute('data-tx-id') || '').trim();
                if (!txId) return;
                e.preventDefault();
                window.location.href = `spendnote-transaction-detail.html?txId=${encodeURIComponent(txId)}`;
            });
        }
    };

    const normalizeJoinError = (err) => {
        const raw = String(err || '');
        const lower = raw.toLowerCase();
        if (lower.includes('pgrst200') || lower.includes('relationship') || lower.includes('embedded')) {
            return true;
        }
        return false;
    };

    const fetchPage = async () => {
        if (!window.db?.transactions?.getPage) {
            return { data: [], count: 0, error: 'Transactions API not ready.' };
        }

        const joinedSelect = [
            'id',
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
            'cash_box:cash_boxes(id, name, color, currency, icon, sequence_number)',
            'contact:contacts(id, name, sequence_number)'
        ].join(', ');

        const plainSelect = [
            'id',
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
            'voided_at'
        ].join(', ');

        const baseOpts = {
            page: 1,
            perPage: 5,
            includeSystem: false,
            // IMPORTANT: Always fetch the latest 5 by date/time (dashboard invariant)
            sortKey: 'date',
            sortDir: 'desc'
        };

        const first = await window.db.transactions.getPage({
            select: joinedSelect,
            ...baseOpts
        });

        if (!first?.error) return first;
        if (!normalizeJoinError(first.error)) return first;

        if (debug) console.warn('[DashboardTx] Join select failed, falling back to plain select:', first.error);

        const fallback = await window.db.transactions.getPage({
            select: plainSelect,
            ...baseOpts
        });
        if (fallback && Array.isArray(fallback.data)) {
            fallback.data = fallback.data.map((tx) => {
                if (tx && !tx.cash_box && tx.cash_box_id) {
                    tx.cash_box = cashBoxById.get(String(tx.cash_box_id)) || null;
                }
                return tx;
            });
        }
        return fallback;
    };

    const renderRows = (rows) => {
        if (!tableWrapper) return;
        removeExistingRows();

        const txs = Array.isArray(rows) ? rows : [];
        if (!txs.length) {
            renderMessageRow('No transactions found.');
            return;
        }

        txs.forEach((tx) => {
            const type = String(tx?.type || '').toLowerCase();
            const isIncome = type === 'income';
            const isVoided = String(tx?.status || 'active').toLowerCase() === 'voided';

            const cashBoxColor = normalizeHexColor(tx?.cash_box?.color || '#10b981');
            const cashBoxRgb = hexToRgb(cashBoxColor);
            const currency = tx?.cash_box?.currency || 'USD';

            const formattedAmount = formatCurrency(tx?.amount, currency);

            const dt = new Date(tx?.created_at || tx?.transaction_date);
            const formattedDate = dt && !Number.isNaN(dt.getTime())
                ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
            const formattedTime = dt && !Number.isNaN(dt.getTime())
                ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : '';

            let createdByName = tx?.created_by_user_name || tx?.created_by || '';
            if (!createdByName || String(createdByName).trim() === '—') {
                try {
                    createdByName = localStorage.getItem('spendnote.user.fullName.v1') || '';
                } catch (_) {
                    createdByName = '';
                }
            }
            createdByName = String(createdByName || '').trim() || '—';
            const avatarUrl = getCreatedByAvatarUrl(createdByName);

            const contactName = tx?.contact?.name || tx?.contact_name || '';
            const contactId = tx?.contact_id || tx?.contact?.id || '';
            const cashBoxId = tx?.cash_box_id || tx?.cash_box?.id || '';
            const descEnc = encodeURIComponent(String(tx?.description || ''));
            const contactEnc = encodeURIComponent(String(contactName || ''));

            const pillClass = isVoided ? 'void' : (isIncome ? 'in' : 'out');
            const pillIcon = isVoided ? 'fa-ban' : (isIncome ? 'fa-arrow-down' : 'fa-arrow-up');
            const pillLabel = isVoided ? 'VOID' : (isIncome ? 'IN' : 'OUT');

            const row = document.createElement('div');
            row.className = 'table-grid';
            row.tabIndex = 0;
            row.setAttribute('data-tx-id', String(tx?.id || ''));
            row.style.setProperty('--cashbox-rgb', cashBoxRgb);
            row.style.setProperty('--cashbox-color', cashBoxColor);
            row.innerHTML = `
                <div class="tx-type-pill ${pillClass}">
                    <span class="quick-icon"><i class="fas ${pillIcon}"></i></span>
                    <span class="quick-label">${pillLabel}</span>
                </div>
                <div class="tx-datetime">
                    <span class="date">${formattedDate}</span>
                    <span class="time">${formattedTime}</span>
                </div>
                <div class="tx-cashbox"><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${tx?.cash_box?.name || 'Unknown'}</span></div>
                <div class="tx-person">${contactName || '—'}</div>
                <div class="tx-desc">${tx?.description || '—'}</div>
                <div class="tx-amount ${isIncome ? 'in' : 'out'} ${isVoided ? 'voided' : ''}">${isIncome ? '+' : '-'}${formattedAmount}</div>
                <div class="tx-createdby"><div class="user-avatar user-avatar-small"><img src="${avatarUrl}" alt="${createdByName}"></div></div>
                <div class="tx-actions">
                    <button type="button" class="tx-action btn-duplicate" data-tx-id="${String(tx?.id || '')}" data-cash-box-id="${String(cashBoxId || '')}" data-direction="${isIncome ? 'in' : 'out'}" data-amount="${String(tx?.amount ?? '')}" data-contact-id="${String(contactId || '')}" data-description="${descEnc}" data-contact-name="${contactEnc}">
                        <i class="fas fa-copy"></i>
                        <span>Duplicate</span>
                    </button>
                    <a href="spendnote-transaction-detail.html?txId=${encodeURIComponent(String(tx?.id || ''))}" class="tx-action btn-view">
                        <span>View</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;
            tableWrapper.appendChild(row);
        });
    };

    async function render() {
        bindEvents();
        updateSortHeaderClasses();

        renderMessageRow('Loading…');

        const res = await fetchPage();
        if (res && res.error) {
            renderMessageRow(String(res.error || 'Failed to load transactions.'));
            return;
        }

        state.latestRows = Array.isArray(res?.data) ? res.data : [];
        renderRows(sortRows(state.latestRows, state.sort));
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
                const savedActiveId = localStorage.getItem('activeCashBoxId');
                const defaultActiveId = savedActiveId || cashBoxes[cashBoxes.length - 1]?.id;
                
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
                    window.registersSwiper.slideTo(cashBoxes.findIndex(box => box.id === defaultActiveId), 0);
                    
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

    const savedActiveId = localStorage.getItem('activeCashBoxId');
    const defaultActiveId = savedActiveId || cashBoxes[cashBoxes.length - 1]?.id;
    
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
