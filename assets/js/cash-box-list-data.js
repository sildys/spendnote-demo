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
                const iconStyle = `background: linear-gradient(135deg, rgba(${rgb}, 0.15), rgba(${rgb}, 0.08)); color: ${color}; border: 2px solid rgba(${rgb}, 0.2);`;

                const cashBoxPrefix = 'cbx';
                const sequenceNumber = sequenceById.get(box.id) ?? (index + 1);
                
                // Format currency (locale + cash box currency)
                const formattedBalance = (window.SpendNote && typeof window.SpendNote.formatCurrency === 'function')
                    ? window.SpendNote.formatCurrency(box.current_balance || 0, box.currency || 'USD')
                    : new Intl.NumberFormat(navigator.language || 'en-US', {
                        style: 'currency',
                        currency: box.currency || 'USD'
                    }).format(box.current_balance || 0);
                
                // Create card HTML
                allCardsHTML += `
                    <div class="register-card ${colorClass}" 
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
                                <div class="register-id">${cashBoxPrefix}-${String(sequenceNumber).padStart(3, '0')}</div>
                            </div>
                            <div class="register-actions">
                                <a href="spendnote-cash-box-settings.html?id=${box.id}" class="register-kebab" aria-label="Cash Box settings">
                                    <i class="fas fa-cog"></i>
                                </a>
                            </div>
                        </div>
                        
                        <div class="register-balance">${formattedBalance}</div>
                        
                        <div class="register-quick-actions">
                            <button type="button" class="register-quick-btn in" onclick="window.location.href='dashboard.html?cashbox=${box.id}&direction=in#new-transaction'">IN</button>
                            <button type="button" class="register-quick-btn out" onclick="window.location.href='dashboard.html?cashbox=${box.id}&direction=out#new-transaction'">OUT</button>
                            <a class="tx-action" href="spendnote-cash-box-detail.html?id=${box.id}">View</a>
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
            
            // Bind selection + menu color sync for dynamic cards
            const cashBoxCards = Array.from(grid.querySelectorAll('.register-card'))
                .filter(card => !card.classList.contains('add-cash-box-card'));

            const applyMenuColors = (color) => {
                if (typeof window.updateMenuColors === 'function') {
                    window.updateMenuColors(color);
                    return;
                }
                document.querySelectorAll('.nav-cash-item').forEach(item => {
                    item.style.color = color;
                });
                document.querySelectorAll('.nav-links a:not(.nav-cash-item):not(.btn):not(.nav-new-transaction-btn)')
                    .forEach(item => {
                        item.style.color = color;
                    });
                const newTransactionBtn = document.querySelector('.nav-new-transaction-btn');
                if (newTransactionBtn) {
                    newTransactionBtn.style.background = color;
                    newTransactionBtn.style.borderColor = color;
                }
            };

            const setActiveCard = (card) => {
                if (!card) return;
                cashBoxCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const color = card.dataset.color || '#059669';
                const rgb = card.dataset.rgb || '5, 150, 105';
                document.documentElement.style.setProperty('--active', color);
                document.documentElement.style.setProperty('--active-rgb', rgb);
                localStorage.setItem('activeCashBoxColor', color);
                localStorage.setItem('activeCashBoxRgb', rgb);
                localStorage.setItem('activeCashBoxId', card.dataset.id || '');
                applyMenuColors(color);
            };

            let draggedCard = null;
            let isSavingOrder = false;

            const persistOrder = async () => {
                if (isSavingOrder) return;
                isSavingOrder = true;

                try {
                    const orderedCards = Array.from(grid.querySelectorAll('.register-card'))
                        .filter(card => !card.classList.contains('add-cash-box-card'));

                    const updates = orderedCards
                        .map(card => card.dataset.id)
                        .filter(Boolean)
                        .map((id, idx) => db.cashBoxes.update(id, { sort_order: idx + 1 }));

                    const results = await Promise.all(updates);
                    const failed = results.find(r => r && r.success === false);
                    if (failed) {
                        throw new Error(failed.error || 'Failed to save cash box order');
                    }
                } catch (error) {
                    console.error('❌ Failed to persist cash box order:', error);
                    alert('Could not save cash box order yet. Please make sure the database has a sort_order column.');
                } finally {
                    isSavingOrder = false;
                }
            };

            const enableDragAndDrop = () => {
                cashBoxCards.forEach(card => {
                    card.setAttribute('draggable', 'true');
                });

                grid.addEventListener('dragstart', (event) => {
                    const targetEl = (event.target instanceof Element)
                        ? event.target
                        : (event.target && event.target.parentElement ? event.target.parentElement : null);
                    const card = targetEl ? targetEl.closest('.register-card') : null;
                    if (!card || card.classList.contains('add-cash-box-card')) return;
                    if (targetEl && targetEl.closest('.action-btn')) {
                        event.preventDefault();
                        return;
                    }
                    draggedCard = card;
                    draggedCard.classList.add('dragging');
                    if (event.dataTransfer) {
                        event.dataTransfer.effectAllowed = 'move';
                        try {
                            // Some browsers require non-empty data for drag to start reliably
                            event.dataTransfer.setData('text/plain', card.dataset.id || 'drag');
                        } catch (e) {
                            // ignore
                        }

                        // Use a clean drag image (just the card)
                        try {
                            event.dataTransfer.setDragImage(card, 24, 24);
                        } catch (e) {
                            // ignore
                        }
                    }
                });

                grid.addEventListener('dragend', () => {
                    if (draggedCard) {
                        draggedCard.classList.remove('dragging');
                    }
                    draggedCard = null;
                });

                grid.addEventListener('dragover', (event) => {
                    if (!draggedCard) return;
                    event.preventDefault();

                    const hit = document.elementFromPoint(event.clientX, event.clientY);
                    const overCard = hit ? hit.closest('.register-card') : null;
                    if (!overCard || overCard === draggedCard || overCard.classList.contains('add-cash-box-card')) {
                        return;
                    }

                    const rect = overCard.getBoundingClientRect();
                    const insertAfter = (event.clientY - rect.top) > rect.height / 2;
                    grid.insertBefore(draggedCard, insertAfter ? overCard.nextSibling : overCard);
                });

                grid.addEventListener('drop', async (event) => {
                    if (!draggedCard) return;
                    event.preventDefault();
                    await persistOrder();
                });
            };

            cashBoxCards.forEach(card => {
                card.addEventListener('click', (event) => {
                    if (event.target.closest('.action-btn') || event.target.closest('.register-quick-btn') || event.target.closest('.tx-action') || event.target.closest('.register-kebab')) {
                        return;
                    }
                    setActiveCard(card);
                });
            });

            enableDragAndDrop();

            const savedId = localStorage.getItem('activeCashBoxId');
            const savedCard = savedId ? cashBoxCards.find(card => card.dataset.id === savedId) : null;
            setActiveCard(savedCard || cashBoxCards[cashBoxCards.length - 1]);

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
