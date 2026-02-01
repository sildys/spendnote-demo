// Dashboard UI - Kebab Menus, Filters, Bulk Selection
// Core UI interactions extracted from dashboard.html

// ========================================
// CASH BOX KEBAB MENUS
// ========================================
function closeAllRegisterMenus() {
    document.querySelectorAll('.register-menu.open').forEach(m => m.classList.remove('open'));
}

function initKebabMenus() {
    document.querySelectorAll('.register-kebab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.register-card');
            const menu = card ? card.querySelector('.register-menu') : null;
            if (!menu) return;
            const isOpen = menu.classList.contains('open');
            closeAllRegisterMenus();
            if (!isOpen) menu.classList.add('open');
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    document.querySelectorAll('.register-menu').forEach(menu => {
        menu.addEventListener('click', (e) => e.stopPropagation());
    });

    document.querySelectorAll('.menu-settings').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.register-card');
            const cashBoxId = card?.dataset?.id;
            if (cashBoxId) {
                window.location.href = `spendnote-cash-box-settings.html?id=${encodeURIComponent(cashBoxId)}`;
            }
            closeAllRegisterMenus();
        });
    });

    document.querySelectorAll('.menu-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.register-card');
            const cashBoxId = card?.dataset?.id;
            const name = card?.dataset?.name || 'this Cash Box';
            if (!cashBoxId) {
                closeAllRegisterMenus();
                return;
            }

            const confirmed = window.confirm(`Delete "${name}"? This will remove the Cash Box and its data.`);
            if (!confirmed) {
                closeAllRegisterMenus();
                return;
            }

            (async () => {
                try {
                    if (window.db?.cashBoxes?.delete) {
                        const result = await window.db.cashBoxes.delete(cashBoxId);
                        if (result?.success === false) throw new Error(result.error || 'Delete failed');
                    }
                    window.location.reload();
                } catch (error) {
                    console.error('Failed to delete cash box:', error);
                    alert('Could not delete the Cash Box.');
                }
            })();
            closeAllRegisterMenus();
        });
    });

    document.addEventListener('click', closeAllRegisterMenus);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllRegisterMenus();
    });
}

// ========================================
// FILTERS
// ========================================
function initFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const filterPanel = document.getElementById('filterPanel');

    if (filterToggle) {
        filterToggle.addEventListener('click', () => {
            filterPanel?.classList.toggle('expanded');
            filterToggle.classList.toggle('active');
        });
    }

    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            ['filterName', 'filterDesc', 'filterDateFrom', 'filterDateTo', 'filterAmountMin', 'filterAmountMax'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        });
    }

    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            filterPanel?.classList.remove('expanded');
            filterToggle?.classList.remove('active');
        });
    }
}

// ========================================
// BULK SELECTION
// ========================================
function initBulkSelection() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const txCheckboxes = document.querySelectorAll('.tx-checkbox');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');

    function syncRowSelection() {
        txCheckboxes.forEach(cb => {
            const row = cb.closest('.table-grid');
            if (row) row.classList.toggle('is-selected', cb.checked);
        });
    }

    function updateBulkActions() {
        const checkedCount = document.querySelectorAll('.tx-checkbox:checked').length;
        if (selectedCount) selectedCount.textContent = checkedCount;
        if (bulkActions) bulkActions.classList.toggle('active', checkedCount > 0);
        if (selectAllCheckbox) selectAllCheckbox.checked = checkedCount === txCheckboxes.length && txCheckboxes.length > 0;
        syncRowSelection();
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            txCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
            updateBulkActions();
        });
    }

    txCheckboxes.forEach(cb => cb.addEventListener('change', updateBulkActions));
    syncRowSelection();

    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const rows = document.querySelectorAll('.transactions-table .table-grid:not(.table-header)');
            if (!rows.length) {
                alert('No transactions to export.');
                return;
            }
            alert(`Export feature coming soon. ${rows.length} transactions ready.`);
        });
    }
}

// ========================================
// TABLE HEADER COLOR
// ========================================
function updateTableHeaderColor(rgb) {
    document.getElementById('transactionTableHeader')?.style.setProperty('--cashbox-rgb', rgb);
    document.getElementById('transactionsHeader')?.style.setProperty('--cashbox-rgb', rgb);
}

// ========================================
// CASH BOX CARDS
// ========================================
function initCashBoxCards() {
    const cards = document.querySelectorAll('.register-card');
    const addCashBoxCard = document.querySelector('.add-cash-box-card');

    const activateCard = (card) => {
        if (!card) return;
        const color = card.dataset.color;
        const rgb = card.dataset.rgb;

        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        document.documentElement.style.setProperty('--active', color);
        document.documentElement.style.setProperty('--active-rgb', rgb);

        localStorage.setItem('activeCashBoxColor', color);
        localStorage.setItem('activeCashBoxRgb', rgb);
        localStorage.setItem('activeCashBoxId', card.dataset.id);

        window.updateMenuColors?.(color);
        updateTableHeaderColor(rgb);
    };

    cards.forEach(card => {
        card.style.setProperty('--card-color', card.dataset.color);
        card.style.setProperty('--card-rgb', card.dataset.rgb);

        card.querySelectorAll('.register-quick-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                activateCard(card);
                window.openModal?.({ cashBoxId: card.dataset.id, direction: btn.getAttribute('data-quick') });
            });
        });

        card.addEventListener('click', (e) => {
            if (e.target.closest('.register-kebab, .register-menu, .register-quick-actions, .register-icon-link')) return;
            activateCard(card);
        });

        card.addEventListener('dblclick', (e) => {
            if (e.target.closest('.register-kebab, .register-menu, .register-quick-actions, .register-icon-link')) return;
            window.location.href = `spendnote-cash-box-detail.html?id=${card.dataset.id}`;
        });
    });

    const savedCard = Array.from(cards).find(c => c.dataset.id === localStorage.getItem('activeCashBoxId'));
    if (savedCard) activateCard(savedCard);

    if (addCashBoxCard) {
        requestAnimationFrame(() => {
            const heights = Array.from(cards).map(el => el.getBoundingClientRect().height).filter(h => h > 0);
            if (heights.length) addCashBoxCard.style.minHeight = `${Math.ceil(Math.max(...heights))}px`;
        });
    }
}

// ========================================
// ADD CASH BOX
// ========================================
function handleAddCashBoxDashboard() {
    const card = document.querySelector('.add-cash-box-card');
    const plan = card?.getAttribute('data-plan');
    const boxCount = parseInt(card?.getAttribute('data-box-count') || '0');
    const limits = { free: 1, standard: 2, pro: Infinity };
    const limit = limits[plan] || 1;

    if (boxCount >= limit) {
        alert(plan === 'free' 
            ? 'You have reached the Free plan limit (1 Cash Box).\n\nUpgrade to Standard to create up to 2 Cash Boxes.'
            : 'You have reached the Standard plan limit (2 Cash Boxes).\n\nUpgrade to Pro for unlimited Cash Boxes.');
    } else {
        window.location.href = 'spendnote-cash-box-settings.html';
    }
}

function initAddCashBoxCard() {
    const card = document.querySelector('.add-cash-box-card');
    if (!card) return;

    const plan = card.getAttribute('data-plan');
    const boxCount = parseInt(card.getAttribute('data-box-count') || '0');
    const limits = { free: 1, standard: 2, pro: Infinity };
    const limit = limits[plan] || 1;

    if (boxCount >= limit) {
        card.classList.add('disabled');
        card.querySelectorAll('.add-cash-box-upgrade').forEach(msg => {
            const type = msg.getAttribute('data-upgrade-text');
            msg.style.display = ((plan === 'free' && type === 'standard') || (plan === 'standard' && type === 'pro')) ? 'block' : 'none';
        });
    } else {
        card.classList.remove('disabled');
        card.querySelectorAll('.add-cash-box-upgrade').forEach(msg => msg.style.display = 'none');
    }
}

// ========================================
// TRANSACTIONS NAV LINK
// ========================================
function initTransactionsNavLink() {
    document.getElementById('navTransactions')?.addEventListener('click', (e) => {
        e.preventDefault();
        const active = document.querySelector('.register-card.active');
        window.location.href = active && active.dataset.id
            ? `spendnote-transaction-history.html?cashBoxId=${encodeURIComponent(active.dataset.id)}`
            : 'spendnote-transaction-history.html';
    });
}

// ========================================
// EXPORTS
// ========================================
window.closeAllRegisterMenus = closeAllRegisterMenus;
window.updateTableHeaderColor = updateTableHeaderColor;
window.initCashBoxCards = initCashBoxCards;
window.handleAddCashBoxDashboard = handleAddCashBoxDashboard;

window.initDashboardUI = function() {
    initKebabMenus();
    initFilters();
    initBulkSelection();
    initAddCashBoxCard();
    initTransactionsNavLink();
};
