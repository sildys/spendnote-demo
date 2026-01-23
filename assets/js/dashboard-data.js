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
            cashBoxes.forEach((box, index) => {
                const color = box.color || '#059669';
                const rgb = hexToRgb(color);
                const iconClass = getIconClass(box.icon);
                const colorClass = getColorClass(color);
                const isActive = (defaultActiveId && box.id === defaultActiveId) ? 'active' : '';
                const iconStyle = `background: linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.08)); color: ${color}; border: 2px solid rgba(${rgb}, 0.2);`;
                
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
                                    <div class="register-icon ${colorClass}" style="${iconStyle}">
                                        <i class="fas ${iconClass}"></i>
                                    </div>
                                    <div class="register-info">
                                        <div class="register-name">${box.name}</div>
                                        <div class="register-id">${box.id_prefix || 'CB'}-${String(index + 1).padStart(3, '0')}</div>
                                    </div>
                                </div>
                                <div class="register-actions">
                                    <a href="spendnote-cash-box-settings.html?id=${box.id}" class="register-kebab" aria-label="Cash Box settings">
                                        <i class="fas fa-ellipsis-h"></i>
                                    </a>
                                </div>
                            </div>
                            
                            <div class="register-balance">${formattedBalance}</div>
                            
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
        if (transactions && transactions.length > 0) {
            loadRecentTransactionsSync(transactions);
        }
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
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
        if (transactions && transactions.length > 0) {
            const tbody = document.querySelector('.transactions-table tbody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            transactions.forEach(tx => {
                const isIncome = tx.type === 'income';
                const formattedAmount = (window.SpendNote && typeof window.SpendNote.formatCurrency === 'function')
                    ? window.SpendNote.formatCurrency(tx.amount, tx.cash_box?.currency || 'USD')
                    : new Intl.NumberFormat(navigator.language || 'en-US', {
                        style: 'currency',
                        currency: tx.cash_box?.currency || 'USD'
                    }).format(tx.amount);
                
                const date = new Date(tx.transaction_date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                
                const rowHTML = `
                    <tr>
                        <td class="tx-type">
                            <span class="type-badge ${isIncome ? 'in' : 'out'}">
                                ${isIncome ? 'IN' : 'OUT'}
                            </span>
                        </td>
                        <td class="tx-datetime">
                            <span class="date">${formattedDate}</span>
                        </td>
                        <td class="tx-cashbox">
                            <span class="cashbox-badge" style="--cb-color: ${tx.cash_box?.color || '#10b981'};">
                                ${tx.cash_box?.name || 'Unknown'}
                            </span>
                        </td>
                        <td class="tx-person">${tx.contact?.name || tx.contact_name || 'N/A'}</td>
                        <td class="tx-desc">${tx.description || 'No description'}</td>
                        <td class="tx-amount ${isIncome ? 'in' : 'out'}">
                            ${isIncome ? '+' : '-'}${formattedAmount}
                        </td>
                        <td class="tx-action">
                            <a href="spendnote-transaction-detail.html?id=${tx.id}" class="btn-view">View</a>
                        </td>
                    </tr>
                `;
                
                tbody.insertAdjacentHTML('beforeend', rowHTML);
            });
            
            console.log('✅ Loaded recent transactions:', transactions.length);
        } else {
            console.log('ℹ️ No transactions found');
        }
    } catch (error) {
        console.error('❌ Error loading transactions:', error);
    }
}
