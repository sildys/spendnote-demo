// Dashboard Data Loader - Load real data from Supabase
async function loadDashboardData() {
    try {
        // Load cash boxes from database
        const cashBoxes = await db.cashBoxes.getAll();
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the swiper wrapper
            const swiperWrapper = document.querySelector('.registers-swiper .swiper-wrapper');
            if (!swiperWrapper) return;
            
            // Save the add cash box slide before clearing
            const allSlides = Array.from(swiperWrapper.querySelectorAll('.swiper-slide'));
            const addCashBoxSlide = allSlides.find(slide => slide.querySelector('.add-cash-box-card'));
            console.log('🔍 Add Cash Box slide found:', addCashBoxSlide ? 'Yes' : 'No');
            
            // Clear all existing slides
            swiperWrapper.innerHTML = '';
            
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
                    'coins': 'fa-coins'
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
            
            // Generate slides for each cash box
            cashBoxes.forEach((box, index) => {
                const rgb = hexToRgb(box.color);
                const iconClass = getIconClass(box.icon);
                const colorClass = getColorClass(box.color);
                const isActive = index === 0 ? 'active' : '';
                
                // Format currency
                const formattedBalance = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: box.currency || 'USD'
                }).format(box.current_balance || 0);
                
                // Create slide HTML
                const slideHTML = `
                    <div class="swiper-slide">
                        <div class="register-card ${isActive}" 
                             data-id="${box.id}" 
                             data-name="${box.name}" 
                             data-color="${box.color}" 
                             data-rgb="${rgb}"
                             role="button" 
                             tabindex="0">
                            <div class="register-top">
                                <div class="register-header-left">
                                    <div class="register-icon ${colorClass}">
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
                
                swiperWrapper.insertAdjacentHTML('beforeend', slideHTML);
            });
            
            // Re-add the add cash box slide at the end if it existed
            if (addCashBoxSlide) {
                swiperWrapper.appendChild(addCashBoxSlide);
                console.log('✅ Add Cash Box slide restored');
            } else {
                console.log('⚠️ Add Cash Box slide not found, skipping restore');
            }
            
            // Reinitialize Swiper after adding slides
            if (window.registersSwiper) {
                window.registersSwiper.update();
                
                // Set initial active card color
                const activeCard = document.querySelector('.register-card.active');
                if (activeCard) {
                    document.documentElement.style.setProperty('--active', activeCard.dataset.color);
                    document.documentElement.style.setProperty('--active-rgb', activeCard.dataset.rgb);
                }
            } else {
                console.log('⚠️ Swiper not initialized yet');
            }
            
            console.log('✅ Dashboard loaded with real cash boxes:', cashBoxes.length);
        } else {
            console.log('ℹ️ No cash boxes found in database');
        }
        
        // Load recent transactions
        await loadRecentTransactions();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Load recent transactions
async function loadRecentTransactions() {
    try {
        const transactions = await db.transactions.getAll({ limit: 5 });
        
        if (transactions && transactions.length > 0) {
            const tbody = document.querySelector('.transactions-table tbody');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            transactions.forEach(tx => {
                const isIncome = tx.type === 'income';
                const formattedAmount = new Intl.NumberFormat('en-US', {
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
