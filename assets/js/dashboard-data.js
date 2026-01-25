// Dashboard Data Loader - Load real data from Supabase
async function loadDashboardData() {
    try {
        const swiperWrapper = document.querySelector('.registers-swiper .swiper-wrapper');
        if (!swiperWrapper) return;
        
        // Load cash boxes and transactions in parallel for speed
        const [cashBoxes, transactions] = await Promise.all([
            db.cashBoxes.getAll(),
            db.transactions.getAll({ limit: 5 })
        ]);
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the swiper wrapper
            const swiperWrapper = document.querySelector('.registers-swiper .swiper-wrapper');
            if (!swiperWrapper) return;

            const savedActiveId = localStorage.getItem('activeCashBoxId');
            const defaultActiveId = savedActiveId || cashBoxes[cashBoxes.length - 1]?.id;
            
            // Remove loading indicator
            const loadingSlide = swiperWrapper.querySelector('.loading-slide');
            if (loadingSlide) loadingSlide.remove();
            
            // Remove only register-card slides, keep the add-cash-box-card slide
            const allSlides = Array.from(swiperWrapper.querySelectorAll('.swiper-slide'));
            const registerSlides = allSlides.filter(slide => slide.querySelector('.register-card'));
            registerSlides.forEach(slide => slide.remove());
            console.log('🗑️ Removed', registerSlides.length, 'demo register slides');
            
            // Helper function to convert hex color to RGB
            function hexToRgb(hex) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? 
                    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
                    '5, 150, 105';
            }
            
            // Helper function to get icon class from icon name
            function getIconClass(iconName) {
                const iconMap = {
                    'building': 'fa-building',
                    'calendar': 'fa-calendar-alt',
                    'wallet': 'fa-wallet',
                    'bullhorn': 'fa-bullhorn',
                    'store': 'fa-store',
                    'piggy-bank': 'fa-piggy-bank',
                    'chart-line': 'fa-chart-line',
                    'coins': 'fa-coins',
                    'dollar': 'fa-dollar-sign',
                    'home': 'fa-home',
                    'briefcase': 'fa-briefcase',
                    'chart': 'fa-chart-line',
                    'star': 'fa-star',
                    'flag': 'fa-flag',
                    'heart': 'fa-heart',
                    'bolt': 'fa-bolt',
                    'gift': 'fa-gift',
                    'tag': 'fa-tag',
                    'bell': 'fa-bell'
                };
                return iconMap[iconName] || 'fa-building';
            }
            
            // Helper function to get color class
            function getColorClass(color) {
                const colorMap = {
                    '#059669': 'green',
                    '#10b981': 'green',
                    '#f59e0b': 'orange',
                    '#3b82f6': 'blue',
                    '#8b5cf6': 'purple',
                    '#ef4444': 'red',
                    '#ec4899': 'pink'
                };
                return colorMap[color] || 'green';
            }
            
            // Generate HTML for all cash boxes
            let allSlidesHTML = '';
            const cashBoxesForNumbering = [...cashBoxes].sort((a, b) => {
                const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
                if (aTime !== bTime) return aTime - bTime;
                return String(a?.id || '').localeCompare(String(b?.id || ''));
            });

            const sequenceById = new Map(
                cashBoxesForNumbering.map((box, idx) => [box.id, idx + 1])
            );

            cashBoxes.forEach((box, index) => {
                const color = box.color || '#059669';
                const rgb = hexToRgb(color);
                const iconClass = getIconClass(box.icon);
                const colorClass = getColorClass(color);
                const isActive = (defaultActiveId && box.id === defaultActiveId) ? 'active' : '';
                const iconStyle = '';

                const sequenceNumber = sequenceById.get(box.id) ?? (index + 1);
                const cashBoxPrefix = 'cbx';
                
                // Format currency (locale + cash box currency)
                const formattedBalance = (window.SpendNote && typeof window.SpendNote.formatCurrency === 'function')
                    ? window.SpendNote.formatCurrency(box.current_balance || 0, box.currency || 'USD')
                    : new Intl.NumberFormat(navigator.language || 'en-US', {
                        style: 'currency',
                        currency: box.currency || 'USD'
                    }).format(box.current_balance || 0);
                
                // Create slide HTML
                allSlidesHTML += `
                    <div class="swiper-slide">
                        <div class="register-card ${isActive}" 
                             data-id="${box.id}" 
                             data-name="${box.name}" 
                             data-color="${color}" 
                             data-rgb="${rgb}"
                             role="button" 
                             tabindex="0">
                            <div class="register-top">
                                <div class="register-header-left">
                                    <a href="spendnote-cash-box-settings.html?id=${box.id}" class="register-icon ${colorClass} register-icon-link" style="${iconStyle}" aria-label="Cash Box settings">
                                        <i class="fas ${iconClass}"></i>
                                    </a>
                                    <div class="register-info">
                                        <div class="register-name" style="font-size:24px;font-weight:900;line-height:1.1;">${box.name}</div>
                                        <div class="register-id">${cashBoxPrefix}-${String(sequenceNumber).padStart(3, '0')}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="register-balance">${formattedBalance}</div>

                            <div class="register-quick-actions">
                                <button type="button" class="register-quick-btn in" data-quick="in">
                                    <span class="quick-icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 3V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            <path d="M4.5 8.8L8 12.3L11.5 8.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </span>
                                    <span class="quick-label">IN</span>
                                </button>
                                <button type="button" class="register-quick-btn out" data-quick="out">
                                    <span class="quick-icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 13V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                            <path d="M4.5 7.2L8 3.7L11.5 7.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
            
            console.log('✅ Inserted', cashBoxes.length, 'cash boxes before Add Cash Box card');
            
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
            } else {
                console.log('⚠️ Swiper not initialized yet');
            }
            
            console.log('✅ Dashboard loaded with real cash boxes:', cashBoxes.length);
            
            // Update modal cash box dropdown
            updateModalCashBoxDropdown(cashBoxes);
        } else {
            console.log('ℹ️ No cash boxes found in database');
        }
        
        // Load recent transactions (already loaded in parallel)
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

    const savedActiveId = localStorage.getItem('activeCashBoxId');
    const defaultActiveId = savedActiveId || cashBoxes[cashBoxes.length - 1]?.id;
    
    // Clear existing options
    modalRegisterSelect.innerHTML = '';
    
    // Helper function to get icon class from icon name
    function getIconClass(iconName) {
        const iconMap = {
            'building': 'fa-building',
            'calendar': 'fa-calendar-alt',
            'wallet': 'fa-wallet',
            'bullhorn': 'fa-bullhorn',
            'store': 'fa-store',
            'piggy-bank': 'fa-piggy-bank',
            'chart-line': 'fa-chart-line',
            'coins': 'fa-coins',
            'dollar': 'fa-dollar-sign',
            'home': 'fa-home',
            'briefcase': 'fa-briefcase',
            'chart': 'fa-chart-line',
            'star': 'fa-star',
            'flag': 'fa-flag',
            'heart': 'fa-heart',
            'bolt': 'fa-bolt',
            'gift': 'fa-gift',
            'tag': 'fa-tag',
            'bell': 'fa-bell'
        };
        return iconMap[iconName] || 'fa-building';
    }
    
    // Helper function to convert hex color to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '5, 150, 105';
    }
    
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
    
    console.log('✅ Modal cash box dropdown updated with', cashBoxes.length, 'cash boxes');
}

// Load recent transactions (synchronous version - data already loaded)
function loadRecentTransactionsSync(transactions) {
    try {
        const wrapper = document.getElementById('tableWrapper');
        if (!wrapper) return;

        // Remove demo rows (keep header)
        const existingRows = Array.from(wrapper.querySelectorAll('.table-grid'))
            .filter((el) => !el.classList.contains('table-header'));
        existingRows.forEach((el) => el.remove());

        if (transactions && transactions.length > 0) {

            const getRgbFromHex = (hex) => {
                const cleaned = String(hex || '').trim().replace('#', '');
                if (cleaned.length !== 6) return '5, 150, 105';
                const r = parseInt(cleaned.slice(0, 2), 16);
                const g = parseInt(cleaned.slice(2, 4), 16);
                const b = parseInt(cleaned.slice(4, 6), 16);
                if ([r, g, b].some((v) => Number.isNaN(v))) return '5, 150, 105';
                return `${r}, ${g}, ${b}`;
            };

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
                const cashBoxColor = tx.cash_box?.color || '#10b981';
                const cashBoxRgb = getRgbFromHex(cashBoxColor);

                const formattedAmount = (window.SpendNote && typeof window.SpendNote.formatCurrency === 'function')
                    ? window.SpendNote.formatCurrency(tx.amount, tx.cash_box?.currency || 'USD')
                    : new Intl.NumberFormat(navigator.language || 'en-US', {
                        style: 'currency',
                        currency: tx.cash_box?.currency || 'USD'
                    }).format(tx.amount);

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
                const getInitials = (name) => {
                    if (!name || name === '—') return 'U';
                    const parts = String(name).trim().split(/\s+/).filter(Boolean);
                    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
                    return initials || 'U';
                };

                const initials = getInitials(createdByName);
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#10b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
                const avatarUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
                const rowHTML = `
                    <div class="table-grid" tabindex="0" style="--cashbox-rgb: ${cashBoxRgb}; --cashbox-color: ${cashBoxColor};">
                        <div class="tx-type ${isIncome ? 'in' : 'out'}">${isIncome ? 'IN' : 'OUT'}</div>
                        <div class="tx-datetime">
                            <span class="date">${formattedDate}</span>
                            <span class="time">${formattedTime}</span>
                        </div>
                        <div class="tx-cashbox"><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${tx.cash_box?.name || 'Unknown'}</span></div>
                        <div class="tx-person">${tx.contact?.name || tx.contact_name || 'N/A'}</div>
                        <div class="tx-desc">${tx.description || 'No description'}</div>
                        <div class="tx-amount ${isIncome ? 'in' : 'out'}">${isIncome ? '+' : '-'}${formattedAmount}</div>
                        <div class="tx-createdby"><div class="avatar-with-name"><div class="user-avatar user-avatar-small"><img src="${avatarUrl}" alt="${createdByName}"></div><span>${createdByName}</span></div></div>
                        <a href="spendnote-transaction-detail.html?id=${tx.id}" class="tx-action btn-view">
                            <span>View</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                `;

                wrapper.insertAdjacentHTML('beforeend', rowHTML);
            });

            console.log('✅ Loaded recent transactions:', transactions.length);
        } else {
            console.log('ℹ️ No transactions found');
        }
    } catch (error) {
        console.error('❌ Error loading transactions:', error);
    }
}
