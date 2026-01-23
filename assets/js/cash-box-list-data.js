// Cash Box List Data Loader - Load real data from Supabase
async function loadCashBoxList() {
    try {
        // Load cash boxes from database
        const cashBoxes = await db.cashBoxes.getAll();
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the grid container
            const grid = document.querySelector('.registers-grid');
            if (!grid) return;
            
            // Clear existing cards (keep only the "Add Cash Box" card)
            const allCards = Array.from(grid.querySelectorAll('.register-card'));
            const addCashBoxCard = allCards.find(card => card.querySelector('.add-cash-box-card'));
            
            // Remove all cards except "Add Cash Box"
            allCards.forEach(card => {
                if (!card.querySelector('.add-cash-box-card')) {
                    card.remove();
                }
            });
            
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
                    'exclamation-triangle': 'fa-exclamation-triangle'
                };
                return iconMap[iconName] || 'fa-building';
            }
            
            // Helper function to get color class from color hex
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
            let allCardsHTML = '';
            cashBoxes.forEach((box, index) => {
                const rgb = hexToRgb(box.color);
                const iconClass = getIconClass(box.icon);
                const colorClass = getColorClass(box.color);
                
                // Format currency
                const formattedBalance = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: box.currency || 'USD'
                }).format(box.current_balance || 0);
                
                // Create card HTML
                allCardsHTML += `
                    <div class="register-card" 
                         data-id="${box.id}" 
                         data-name="${box.name}" 
                         data-color="${box.color}" 
                         data-rgb="${rgb}"
                         onclick="window.location.href='spendnote-cash-box-detail.html?id=${box.id}'"
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
                            <div class="register-actions" onclick="event.stopPropagation();">
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
                `;
            });
            
            // Insert all cash boxes before the "Add Cash Box" card
            if (addCashBoxCard) {
                addCashBoxCard.insertAdjacentHTML('beforebegin', allCardsHTML);
            } else {
                grid.insertAdjacentHTML('beforeend', allCardsHTML);
            }
            
            console.log('✅ Cash Box List loaded with real data:', cashBoxes.length, 'cash boxes');
        } else {
            console.log('ℹ️ No cash boxes found in database');
        }
        
    } catch (error) {
        console.error('❌ Error loading cash box list:', error);
    }
}

// Load data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCashBoxList);
} else {
    loadCashBoxList();
}
