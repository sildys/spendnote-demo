// Cash Box List Data Loader - Load real data from Supabase
async function loadCashBoxList() {
    try {
        // Show loading state
        const grid = document.querySelector('.registers-grid');
        if (!grid) return;
        
        // Add loading indicator
        const loadingHTML = `
            <div class="loading-indicator" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i>
                <p style="margin-top: 16px; color: var(--text-muted);">Loading cash boxes...</p>
            </div>
        `;
        grid.insertAdjacentHTML('afterbegin', loadingHTML);
        
        // Load cash boxes from database
        const cashBoxes = await db.cashBoxes.getAll();
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the grid container
            const grid = document.querySelector('.registers-grid');
            if (!grid) return;
            
            // Find the "Add Cash Box" card
            const addCashBoxCard = grid.querySelector('.add-cash-box-card');
            
            // Remove loading indicator
            const loadingIndicator = grid.querySelector('.loading-indicator');
            if (loadingIndicator) loadingIndicator.remove();
            
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
                         style="--card-color: ${box.color}; --card-rgb: ${rgb};">
                        <div class="register-header">
                            <div class="register-icon ${colorClass}">
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
