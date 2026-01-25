// Cash Box List Data Loader - Load real data from Supabase
async function loadCashBoxList() {
    try {
        // Load cash boxes from database
        const cashBoxes = await db.cashBoxes.getAll();
        
        if (cashBoxes && cashBoxes.length > 0) {
            // Get the list container
            const grid = document.querySelector('.registers-list');
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
                
                // Get transaction count from database
                const txCount = box.transaction_count || 0;
                
                // Get users with access (mock for now - will be from database)
                const users = box.users || [
                    { name: 'Sramli Ildikó', initials: 'SI', color: '#059669' }
                ];
                const visibleUsers = users.slice(0, 3);
                const remainingCount = Math.max(0, users.length - visibleUsers.length);
                const usersHTML = [
                    ...visibleUsers.map(user =>
                        `<div class="user-avatar" style="background: ${user.color}20; color: ${user.color}; border-color: ${user.color}40;" title="${user.name}">${user.initials}</div>`
                    ),
                    ...(remainingCount > 0 ? [`<div class="user-avatar more" title="${remainingCount} more">+${remainingCount}</div>`] : [])
                ].join('');
                
                // Create list row HTML
                allCardsHTML += `
                    <div class="register-row ${colorClass}" 
                         data-id="${box.id}" 
                         data-name="${box.name}" 
                         data-color="${color}" 
                         data-rgb="${rgb}"
                         style="--card-color: ${color}; --card-rgb: ${rgb};">
                        <div class="drag-handle" title="Drag to reorder" aria-label="Reorder">
                            <i class="fas fa-grip-vertical"></i>
                        </div>
                        <div class="register-icon ${colorClass}" style="${iconStyle}">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="register-info">
                            <div class="register-title-row">
                                <div class="register-name">${box.name}</div>
                                <div class="register-balance">${formattedBalance}</div>
                            </div>
                            <div class="register-meta">
                                <span class="register-tx-count"><i class="fas fa-receipt"></i> ${txCount} tx</span>
                                <div class="register-users">${usersHTML}</div>
                            </div>
                        </div>
                        <div class="register-actions">
                            <a class="btn btn-secondary btn-small" href="spendnote-cash-box-settings.html?id=${box.id}" title="Cash Box Settings" aria-label="Cash Box Settings">
                                <i class="fas fa-cog"></i>
                                Settings
                            </a>
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
            
            // Bind selection + menu color sync for dynamic rows
            const cashBoxCards = Array.from(grid.querySelectorAll('.register-row'));

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

            const orderStatusEl = document.getElementById('orderStatus');
            const setOrderStatus = (text) => {
                if (!orderStatusEl) return;
                orderStatusEl.textContent = text || '';
            };

            const persistOrder = async () => {
                if (isSavingOrder) return;
                isSavingOrder = true;

                try {
                    const orderedCards = Array.from(grid.querySelectorAll('.register-row'));

                    const updates = orderedCards
                        .map(card => card.dataset.id)
                        .filter(Boolean)
                        .map((id, idx) => db.cashBoxes.update(id, { sort_order: idx + 1 }));

                    setOrderStatus('Saving...');
                    const results = await Promise.all(updates);
                    const failed = results.find(r => r && r.success === false);
                    if (failed) {
                        throw new Error(failed.error || 'Failed to save cash box order');
                    }

                    setOrderStatus('Saved');
                    setTimeout(() => setOrderStatus(''), 1200);
                } catch (error) {
                    console.error('❌ Failed to persist cash box order:', error);
                    setOrderStatus('Could not save');
                    alert('Could not save cash box order yet. Please make sure the database has a sort_order column.');
                } finally {
                    isSavingOrder = false;
                }
            };

            const enableDragAndDrop = () => {
                cashBoxCards.forEach(card => {
                    card.removeAttribute('draggable');
                    const handle = card.querySelector('.drag-handle');
                    if (handle) {
                        handle.setAttribute('draggable', 'true');
                    }
                });

                grid.addEventListener('dragstart', (event) => {
                    const targetEl = (event.target instanceof Element)
                        ? event.target
                        : (event.target && event.target.parentElement ? event.target.parentElement : null);
                    const card = targetEl ? targetEl.closest('.register-row') : null;
                    if (!card) return;
                    if (!targetEl || !targetEl.closest('.drag-handle')) {
                        event.preventDefault();
                        return;
                    }
                    if (targetEl && (targetEl.closest('.register-actions') || targetEl.closest('a') || targetEl.closest('button'))) {
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
                    const overCard = hit ? hit.closest('.register-row') : null;
                    if (!overCard || overCard === draggedCard) {
                        return;
                    }

                    const rect = overCard.getBoundingClientRect();
                    const insertAfter = (event.clientX - rect.left) > rect.width / 2;
                    grid.insertBefore(draggedCard, insertAfter ? overCard.nextSibling : overCard);
                });

                grid.addEventListener('drop', async (event) => {
                    if (!draggedCard) return;
                    event.preventDefault();
                    await persistOrder();
                });
            };

            const isDesktopPointer = (() => {
                try {
                    return window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
                } catch (e) {
                    return false;
                }
            })();

            cashBoxCards.forEach(card => {
                card.addEventListener('click', (event) => {
                    if (event.target.closest('.drag-handle') || event.target.closest('.register-actions') || event.target.closest('a') || event.target.closest('button')) {
                        return;
                    }
                    setActiveCard(card);

                    if (!isDesktopPointer) {
                        const id = card.dataset.id;
                        if (id) {
                            window.location.href = `spendnote-cash-box-detail.html?id=${id}`;
                        }
                    }
                });

                card.addEventListener('dblclick', (event) => {
                    if (!isDesktopPointer) return;
                    if (event.target.closest('.drag-handle') || event.target.closest('.register-actions') || event.target.closest('a') || event.target.closest('button')) {
                        return;
                    }
                    const id = card.dataset.id;
                    if (id) {
                        window.location.href = `spendnote-cash-box-detail.html?id=${id}`;
                    }
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
