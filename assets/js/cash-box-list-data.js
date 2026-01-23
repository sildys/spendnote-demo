// Cash Box List Data Loader - Load real data from Supabase
async function loadCashBoxList() {
    try {
        // Load cash boxes from database
        const cashBoxes = await db.cashBoxes.getAll();
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the grid container
            const grid = document.querySelector('.registers-grid');
            if (!grid) return;
            
            // Find the "Add Cash Box" card
            const addCashBoxCard = grid.querySelector('.add-cash-box-card');
            
            // Remove all register-card elements (demo cards)
            const registerCards = grid.querySelectorAll('.register-card');
            registerCards.forEach(card => card.remove());
            
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
                    'exclamation-triangle': 'fa-exclamation-triangle',
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
                const color = box.color || '#059669';
                const rgb = hexToRgb(color);
                const iconClass = getIconClass(box.icon);
                const colorClass = getColorClass(color);
                const iconStyle = `background: linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.08)); color: ${color}; border: 2px solid rgba(${rgb}, 0.2);`;
                
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
                         data-color="${color}" 
                         data-rgb="${rgb}"
                         style="--card-color: ${color}; --card-rgb: ${rgb};">
                        <div class="register-header">
                            <div class="register-icon ${colorClass}" style="${iconStyle}">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div class="register-info">
                                <div class="register-name">${box.name}</div>
                                <div class="register-id">${box.id_prefix || 'CB'}-${String(index + 1).padStart(3, '0')}</div>
                            </div>
                        </div>
                        
                        <div class="register-balance">${formattedBalance}</div>
                        
                        <div class="register-actions">
                            <button class="action-btn primary" onclick="window.location.href='spendnote-cash-box-detail.html?id=${box.id}'">
                                <i class="fas fa-eye"></i>
                                View
                            </button>
                            <button class="action-btn" onclick="window.location.href='spendnote-cash-box-settings.html?id=${box.id}'">
                                <i class="fas fa-cog"></i>
                                Settings
                            </button>
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
