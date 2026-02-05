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

async function loadDashboardData() {
    try {
        const swiperWrapper = document.querySelector('.registers-swiper .swiper-wrapper');
        if (!swiperWrapper) return;

        const debug = Boolean(window.SpendNoteDebug);

        const { hexToRgb, getIconClass, formatCurrency } = getSpendNoteHelpers();

        const cashBoxesPromise = db.cashBoxes.getAll({
            select: 'id, name, color, currency, icon, current_balance, created_at, sort_order, sequence_number'
        });

        const transactionsPromise = db.transactions.getAll({ limit: 5, select: '*' });

        const [cashBoxes, transactions] = await Promise.all([cashBoxesPromise, transactionsPromise]);
        
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
                                    <a href="spendnote-cash-box-detail.html?id=${box.id}" class="register-icon register-icon-link" aria-label="Cash Box detail">
                                        <i class="fas ${iconClass}"></i>
                                    </a>
                                    <div class="register-info">
                                        <div class="register-name" style="font-size:24px;font-weight:900;line-height:1.1;">${box.name}</div>
                                        <div class="register-id">${displayCode}</div>
                                    </div>
                                </div>
                                <div class="register-actions">
                                    <a class="register-kebab" href="spendnote-cash-box-settings.html?id=${box.id}" aria-label="Cash Box settings" title="Cash Box settings">
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
            
            // Insert all cash boxes before the add-cash-box-card slide
            const allCurrentSlides = Array.from(swiperWrapper.querySelectorAll('.swiper-slide'));
            const addCashBoxSlide = allCurrentSlides.find(slide => slide.querySelector('.add-cash-box-card'));
            if (addCashBoxSlide) {
                addCashBoxSlide.insertAdjacentHTML('beforebegin', allSlidesHTML);
            } else {
                swiperWrapper.insertAdjacentHTML('beforeend', allSlidesHTML);
            }
            
            if (debug) console.log('✅ Inserted', cashBoxes.length, 'cash boxes before Add Cash Box card');
            
            // Reinitialize Swiper after adding slides
            if (window.registersSwiper) {
                window.registersSwiper.update();

                if (typeof window.initCashBoxCards === 'function') {
                    window.initCashBoxCards();
                }

                if (defaultActiveId) {
                    const slides = Array.from(window.registersSwiper.slides || []);
                    const targetIndex = slides.findIndex(slide => {
                        const card = slide.querySelector('.register-card');
                        return card && card.dataset.id === defaultActiveId;
                    });
                    if (targetIndex >= 0) {
                        window.registersSwiper.slideTo(targetIndex, 0);
                    }
                }
                
                // Set initial active card color
                const activeCard = document.querySelector('.register-card.active');
                if (activeCard) {
                    document.documentElement.style.setProperty('--active', activeCard.dataset.color);
                    document.documentElement.style.setProperty('--active-rgb', activeCard.dataset.rgb);
                    
                    // Update menu colors and table header
                    if (typeof updateMenuColors === 'function') {
                        updateMenuColors(activeCard.dataset.color);
                    }
                    if (typeof updateTableHeaderColor === 'function') {
                        updateTableHeaderColor(activeCard.dataset.rgb);
                    }
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

        const cashBoxById = new Map((cashBoxes || []).map((b) => [b.id, b]));
        const enrichedTransactions = (transactions || []).map((tx) => {
            if (tx && tx.cash_box) return tx;
            const cashBox = tx ? cashBoxById.get(tx.cash_box_id) : null;
            return { ...tx, cash_box: cashBox || null };
        });
        loadRecentTransactionsSync(enrichedTransactions);

        window.__spendnoteDashboardDataLoaded = true;
        document.documentElement.classList.remove('dashboard-loading');
        document.documentElement.classList.add('dashboard-ready');
        window.dispatchEvent(new Event('SpendNoteDashboardDataLoaded'));
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        document.documentElement.classList.remove('dashboard-loading');
        document.documentElement.classList.add('dashboard-ready');
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

// Load recent transactions (synchronous version - data already loaded)
function loadRecentTransactionsSync(transactions) {
    try {
        const wrapper = document.getElementById('tableWrapper');
        if (!wrapper) return;

        const { hexToRgb, formatCurrency, getInitials, normalizeHexColor } = getSpendNoteHelpers();

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
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${avatarColor}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
            return `data:image/svg+xml,${encodeURIComponent(svg)}`;
        };

        // Remove demo rows (keep header)
        const existingRows = Array.from(wrapper.querySelectorAll('.table-grid'))
            .filter((el) => !el.classList.contains('table-header'));
        existingRows.forEach((el) => el.remove());

        if (transactions && transactions.length > 0) {
            const parseSortTime = (tx) => {
                const createdAt = tx?.created_at ? Date.parse(tx.created_at) : NaN;
                if (Number.isFinite(createdAt)) return createdAt;
                const transactionDate = tx?.transaction_date ? Date.parse(tx.transaction_date) : NaN;
                if (Number.isFinite(transactionDate)) return transactionDate;
                return 0;
            };

            const sortedTransactions = [...transactions].sort((a, b) => {
                const bt = parseSortTime(b);
                const at = parseSortTime(a);
                if (bt !== at) return bt - at;
                return String(b?.id || '').localeCompare(String(a?.id || ''));
            });

            sortedTransactions.forEach(tx => {
                const isIncome = tx.type === 'income';
                const cashBoxColor = normalizeHexColor(tx.cash_box?.color || '#10b981');
                const cashBoxRgb = hexToRgb(cashBoxColor);

                const formattedAmount = formatCurrency(tx.amount, tx.cash_box?.currency || 'USD');

                const dt = new Date(tx.created_at || tx.transaction_date);
                const formattedDate = dt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
                const formattedTime = dt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });

                const createdByName = tx.created_by_user_name || tx.created_by || '—';
                const avatarUrl = getCreatedByAvatarUrl(createdByName);

                const contactName = tx.contact?.name || tx.contact_name || '';
                const contactId = tx.contact_id || tx.contact?.id || '';
                const cashBoxId = tx.cash_box_id || tx.cash_box?.id || '';
                const dateIso = tx.transaction_date || tx.created_at || '';
                const descEnc = encodeURIComponent(String(tx.description || ''));
                const contactEnc = encodeURIComponent(String(contactName || ''));
                const rowHTML = `
                    <div class="table-grid" tabindex="0" style="--cashbox-rgb: ${cashBoxRgb}; --cashbox-color: ${cashBoxColor};">
                        <div class="tx-type-pill ${isIncome ? 'in' : 'out'}">
                            <span class="quick-icon"><i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></span>
                            <span class="quick-label">${isIncome ? 'IN' : 'OUT'}</span>
                        </div>
                        <div class="tx-datetime">
                            <span class="date">${formattedDate}</span>
                            <span class="time">${formattedTime}</span>
                        </div>
                        <div class="tx-cashbox"><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${tx.cash_box?.name || 'Unknown'}</span></div>
                        <div class="tx-person">${contactName || 'N/A'}</div>
                        <div class="tx-desc">${tx.description || 'No description'}</div>
                        <div class="tx-amount ${isIncome ? 'in' : 'out'}">${isIncome ? '+' : '-'}${formattedAmount}</div>
                        <div class="tx-createdby"><div class="user-avatar user-avatar-small"><img src="${avatarUrl}" alt="${createdByName}"></div></div>
                        <div class="tx-actions">
                            <button type="button" class="tx-action btn-duplicate" data-tx-id="${tx.id}" data-cash-box-id="${cashBoxId}" data-direction="${isIncome ? 'in' : 'out'}" data-amount="${String(tx.amount ?? '')}" data-date="${String(dateIso || '')}" data-contact-id="${String(contactId || '')}" data-description="${descEnc}" data-contact-name="${contactEnc}">
                                <i class="fas fa-copy"></i>
                                <span>Duplicate</span>
                            </button>
                            <a href="spendnote-transaction-detail.html?id=${encodeURIComponent(tx.id)}" class="tx-action btn-view">
                                <span>View</span>
                                <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                `;

                wrapper.insertAdjacentHTML('beforeend', rowHTML);
            });

            if (Boolean(window.SpendNoteDebug)) {
                console.log('✅ Loaded recent transactions:', transactions.length);
            }
        } else if (Boolean(window.SpendNoteDebug)) {
            console.log('ℹ️ No transactions found');
        }
    } catch (error) {
        if (window.SpendNoteDebug) console.error('❌ Error loading transactions:', error);
    }
}

// Export for use in other scripts
window.loadDashboardData = loadDashboardData;
