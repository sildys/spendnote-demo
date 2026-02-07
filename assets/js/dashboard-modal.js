// Dashboard Modal - Transaction creation modal logic
// Extracted from dashboard.html for better code organization

(function() {

// ========================================
// MODAL STATE
// ========================================
let lastModalFocusEl = null;
let isModalSubmitting = false;
window.isModalSubmitting = false;
let modalLineItemCount = 0;
const maxModalLineItems = 4;
let modalItemsExpanded = false;
let modalCashBoxes = [];
let modalCashBoxIndex = 0;
let Contacts = [];
let contactsLoaded = false;

function formatContactDisplayId(sequenceNumber) {
    try {
        if (window.SpendNoteIds && typeof window.SpendNoteIds.formatContactDisplayId === 'function') {
            return window.SpendNoteIds.formatContactDisplayId(sequenceNumber) || '';
        }
    } catch (_) {

    }
    const n = Number(sequenceNumber);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `CONT-${String(n).padStart(3, '0')}`;
}

function isUuid(value) {
    try {
        if (window.SpendNoteIds && typeof window.SpendNoteIds.isUuid === 'function') {
            return window.SpendNoteIds.isUuid(value);
        }
    } catch (_) {

    }
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));
}

// ========================================
// DOM HELPERS
// ========================================
const getEl = (id) => document.getElementById(id);
const getModal = () => getEl('createTransactionModal');
const getModalContainer = () => getEl('createTransactionModalContainer');

// ========================================
// MODAL HELPERS
// ========================================
function updateExpandItemsBtnUI() {
    const btn = getEl('modalExpandItemsBtn');
    if (!btn) return;
    btn.innerHTML = modalItemsExpanded
        ? '<i class="fas fa-minus-circle"></i> Hide extra items'
        : '<i class="fas fa-plus-circle"></i> Add more items';
}

function setModalSubmittingState(submitting) {
    isModalSubmitting = Boolean(submitting);
    window.isModalSubmitting = isModalSubmitting;
    const closeBtn = getEl('closeModalBtn');
    const cancelBtn = getEl('modalCancelBtn');
    if (closeBtn) closeBtn.disabled = isModalSubmitting;
    if (cancelBtn) cancelBtn.disabled = isModalSubmitting;
}

function getModalFocusableEls() {
    const container = getModalContainer();
    if (!container) return [];
    return Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null);
}

function handleModalKeydown(e) {
    const modal = getModal();
    const container = getModalContainer();
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        if (isModalSubmitting) { e.preventDefault(); return; }
        e.preventDefault();
        closeModal();
        return;
    }

    if (e.key === 'Tab') {
        const focusables = getModalFocusableEls();
        if (!focusables.length) { e.preventDefault(); container && container.focus(); return; }
        const first = focusables[0], last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
            if (active === first || !container.contains(active)) { e.preventDefault(); last.focus(); }
        } else {
            if (!container.contains(active)) { e.preventDefault(); first.focus(); return; }
            if (active === last) { e.preventDefault(); first.focus(); }
        }
    }
}

function handleModalFocusIn(e) {
    const modal = getModal();
    const container = getModalContainer();
    if (!modal || !modal.classList.contains('active') || !container) return;
    if (e.target && container.contains(e.target)) return;
    const focusables = getModalFocusableEls();
    if (focusables[0] && focusables[0].focus) { focusables[0].focus(); return; }
    container.focus();
}

function setModalBackgroundInert(isInert) {
    Array.from(document.body.children || []).forEach(el => {
        if (!el || el.id === 'createTransactionModal' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
        isInert ? el.setAttribute('inert', '') : el.removeAttribute('inert');
    });
}

function updateModalDirectionUI(direction) {
    const container = getModalContainer();
    if (container) container.dataset.direction = direction === 'out' ? 'out' : 'in';
}

function getStoredModalMode() {
    try { return localStorage.getItem('spendnote.modalMode') === 'detailed' ? 'detailed' : 'quick'; }
    catch (e) { return 'quick'; }
}

function storeModalMode(mode) {
    try { localStorage.setItem('spendnote.modalMode', mode); } catch (e) {}
}

function setDetailedItemsExpanded(expanded) {
    const container = getEl('modalLineItemsContainer');
    modalItemsExpanded = Boolean(expanded);
    if (container) {
        container.style.display = modalItemsExpanded ? '' : 'none';
        if (!modalItemsExpanded) { container.innerHTML = ''; modalLineItemCount = 0; }
    }
    updateExpandItemsBtnUI();
    if (typeof updateLineItemsTotal === 'function') updateLineItemsTotal();
}

function renderDetailedExtraItems(count) {
    const container = getEl('modalLineItemsContainer');
    if (!container) return;
    container.innerHTML = '';
    modalLineItemCount = 0;

    for (let i = 1; i <= count; i++) {
        modalLineItemCount++;
        const div = document.createElement('div');
        div.className = 'form-row-line-item';
        div.style.marginBottom = '10px';
        div.innerHTML = '<div class="form-group"><input type="text" class="form-input line-item-input" placeholder="Item description" autocomplete="off" data-item-index="' + modalLineItemCount + '"></div><div class="form-group"><div class="input-with-prefix"><span class="input-prefix">$</span><input type="number" class="form-input line-item-input line-item-amount" placeholder="0.00" step="0.01" min="0" data-amount-index="' + modalLineItemCount + '"></div></div>';
        container.appendChild(div);
        div.querySelectorAll('.line-item-amount').forEach(function(input) { input.addEventListener('input', updateLineItemsTotal); });
    }
}

function updateModalModeUI(mode, options) {
    options = options || {};
    var persist = options.persist !== false;
    const container = getModalContainer();
    if (!container) return;
    const m = mode === 'detailed' ? 'detailed' : 'quick';
    container.dataset.mode = m;

    const quickEl = getEl('modalModeQuick');
    const detailedEl = getEl('modalModeDetailed');
    if (quickEl && detailedEl) {
        quickEl.checked = m === 'quick';
        detailedEl.checked = m === 'detailed';
    }

    if (m !== 'detailed') {
        setDetailedItemsExpanded(false);
    } else {
        const expandBtn = getEl('modalExpandItemsBtn');
        const itemsContainer = getEl('modalLineItemsContainer');
        if (expandBtn) expandBtn.style.display = '';
        if (itemsContainer && !modalItemsExpanded) itemsContainer.style.display = 'none';
        updateExpandItemsBtnUI();
    }

    const itemsTitleEl = getEl('modalItemsSectionTitle');
    const itemsDescHeaderEl = getEl('modalItemsDescriptionHeader');
    const mainDescInputEl = getEl('modalDescription');
    const isQuick = m === 'quick';

    if (itemsTitleEl) { itemsTitleEl.textContent = 'Items'; itemsTitleEl.style.display = isQuick ? 'none' : ''; }
    if (itemsDescHeaderEl) {
        const required = itemsDescHeaderEl.querySelector('.required');
        itemsDescHeaderEl.textContent = (isQuick ? 'Transaction description' : 'Description') + ' ';
        if (required) itemsDescHeaderEl.appendChild(required);
    }
    if (mainDescInputEl) mainDescInputEl.placeholder = isQuick ? 'Transaction description' : 'Item description';

    if (persist) storeModalMode(m);
    if (typeof updateLineItemsTotal === 'function') updateLineItemsTotal();
}

// ========================================
// CASH BOX CAROUSEL
// ========================================
function initModalCashboxCarousel() {
    const cards = document.querySelectorAll('.register-card');
    modalCashBoxes = [];

    cards.forEach(function(card) {
        if (!card.dataset.id) return;
        const iconEl = card.querySelector('.register-icon i');
        const iconClass = iconEl ? Array.from(iconEl.classList).find(function(cls) { return cls.startsWith('fa-') && cls !== 'fa-fw'; }) : null;
        let displayId = String(card.dataset.displayCode || '').trim() || (function() {
            const idEl = card.querySelector('.register-id');
            return idEl ? String(idEl.textContent || '').trim() : '';
        })();
        if (!displayId) {
            const seq = Number(card.dataset.sequenceNumber || '');
            if (Number.isFinite(seq) && seq > 0) {
                displayId = 'SN-' + String(seq).padStart(3, '0');
            }
        }
        modalCashBoxes.push({
            id: card.dataset.id,
            name: card.querySelector('.register-name') ? card.querySelector('.register-name').textContent : 'Cash Box',
            displayId: displayId,
            color: card.dataset.color || '#059669',
            rgb: card.dataset.rgb || '5, 150, 105',
            icon: iconClass || card.dataset.icon || 'fa-cash-register'
        });
    });

    if (!modalCashBoxes.length) {
        modalCashBoxIndex = 0;
        return;
    }

    let preferredId = '';
    try {
        preferredId = String(localStorage.getItem('activeCashBoxId') || '').trim();
    } catch (_) {
        preferredId = '';
    }
    if (!preferredId) {
        const activeCard = document.querySelector('.register-card.active');
        preferredId = activeCard ? String(activeCard.dataset.id || '').trim() : '';
    }

    const preferredIdx = preferredId
        ? modalCashBoxes.findIndex(function (cb) { return String(cb.id || '') === preferredId; })
        : -1;
    modalCashBoxIndex = preferredIdx >= 0 ? preferredIdx : 0;
    updateModalCashboxDisplay();
}

function updateModalCashboxDisplay() {
    const cashbox = modalCashBoxes[modalCashBoxIndex];
    if (!cashbox) return;

    const iconEl = getEl('modalCashboxIcon');
    const nameEl = getEl('modalCashboxName');
    const idDisplayEl = getEl('modalCashboxIdDisplay');
    const balanceEl = getEl('modalCashboxBalance');
    const idInput = getEl('modalCashBoxId');

    if (iconEl) { iconEl.innerHTML = '<i class="fas ' + cashbox.icon + '"></i>'; iconEl.style.background = cashbox.color; }
    if (nameEl) nameEl.textContent = cashbox.name;
    if (idDisplayEl) {
        const card = document.querySelector('.register-card[data-id="' + cashbox.id + '"]');
        let codeText = '';
        if (card) {
            codeText = String(card.dataset.displayCode || '').trim();
            if (!codeText) {
                const idEl = card.querySelector('.register-id');
                if (idEl) codeText = String(idEl.textContent || '').trim();
            }
            if (!codeText) {
                const seq = Number(card.dataset.sequenceNumber || '');
                if (Number.isFinite(seq) && seq > 0) {
                    codeText = 'SN-' + String(seq).padStart(3, '0');
                }
            }
        }
        if (!codeText && cashbox.displayId) {
            codeText = cashbox.displayId;
        }
        idDisplayEl.textContent = codeText || '—';
    }
    if (balanceEl) {
        const card = document.querySelector('.register-card[data-id="' + cashbox.id + '"]');
        const balanceText = card && card.querySelector('.register-balance') ? card.querySelector('.register-balance').textContent : '';
        balanceEl.textContent = balanceText ? 'Balance: ' + balanceText : '';
    }
    if (idInput) idInput.value = cashbox.id;

    let synced = false;
    try {
        if (typeof window.syncDashboardCashBoxSelection === 'function') {
            window.syncDashboardCashBoxSelection(cashbox.id, { scrollPage: false });
            synced = true;
        }
    } catch (_) {
        synced = false;
    }

    if (!synced && cashbox.color && cashbox.rgb) {
        document.documentElement.style.setProperty('--active', cashbox.color);
        document.documentElement.style.setProperty('--active-rgb', cashbox.rgb);
        try {
            localStorage.setItem('activeCashBoxColor', cashbox.color);
            localStorage.setItem('activeCashBoxRgb', cashbox.rgb);
            if (isUuid(cashbox.id)) {
                localStorage.setItem('activeCashBoxId', cashbox.id);
            }
        } catch (e) {}
        if (typeof window.updateMenuColors === 'function') window.updateMenuColors(cashbox.color);
    }
}

// ========================================
// OPEN/CLOSE MODAL
// ========================================
function openModal(preset) {
    const modal = getModal();
    const container = getModalContainer();
    const isEvent = preset && typeof preset === 'object' && 'preventDefault' in preset;
    const options = isEvent ? {} : (preset || {});

    initModalCashboxCarousel();
    if (!modalCashBoxes || !modalCashBoxes.length) {
        alert('You need to create a Cash Box before recording transactions.');
        window.location.href = 'spendnote-cash-box-settings.html';
        return;
    }

    lastModalFocusEl = document.activeElement;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setModalBackgroundInert(true);
    document.addEventListener('keydown', handleModalKeydown, true);
    document.addEventListener('focusin', handleModalFocusIn, true);

    const form = getEl('modalTransactionForm');
    if (form) form.reset();

    const dateField = getEl('modalDateField');
    if (dateField) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        dateField.value = mm + '/' + dd + '/' + yyyy;
        dateField.dataset.fullDate = now.toISOString();
        const dateValue = getEl('modalDate');
        if (dateValue) dateValue.value = yyyy + '-' + mm + '-' + dd;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'date') && options.date && !options.isDuplicate) {
        const raw = String(options.date);
        let yyyy = '', mm = '', dd = '';
        if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
            const parts = raw.slice(0, 10).split('-');
            yyyy = parts[0];
            mm = parts[1];
            dd = parts[2];
        } else {
            const d = new Date(raw);
            if (!Number.isNaN(d.getTime())) {
                yyyy = String(d.getFullYear());
                mm = String(d.getMonth() + 1).padStart(2, '0');
                dd = String(d.getDate()).padStart(2, '0');
            }
        }
        if (yyyy && mm && dd) {
            const dateValue = getEl('modalDate');
            if (dateValue) dateValue.value = yyyy + '-' + mm + '-' + dd;
            const df = getEl('modalDateField');
            if (df) {
                df.value = mm + '/' + dd + '/' + yyyy;
                df.dataset.fullDate = yyyy + '-' + mm + '-' + dd;
            }
        }
    }

    if (options.cashBoxId) {
        const idx = modalCashBoxes.findIndex(function(cb) { return cb.id === options.cashBoxId; });
        if (idx >= 0) { modalCashBoxIndex = idx; updateModalCashboxDisplay(); }
    }

    if (options.direction === 'in' || options.direction === 'out') {
        const inEl = getEl('modalDirectionIn');
        const outEl = getEl('modalDirectionOut');
        if (inEl && outEl) {
            inEl.checked = options.direction === 'in';
            outEl.checked = options.direction === 'out';
        }
    }

    const checkedDir = document.querySelector('input[name="modalDirection"]:checked');
    updateModalDirectionUI(checkedDir ? checkedDir.value : 'in');

    const hasExplicitMode = (options.mode === 'detailed' || options.mode === 'quick');
    const hasPrefilledLineItems = Array.isArray(options.lineItems) && options.lineItems.length > 0;
    const isDuplicateFlow = Boolean(options.isDuplicate) || hasPrefilledLineItems;

    const initialMode = hasExplicitMode
        ? options.mode
        : (isDuplicateFlow ? getStoredModalMode() : 'quick');

    updateModalModeUI(initialMode, { persist: false });

    if (initialMode !== 'detailed') {
        const noteSection = getEl('modalNoteSection');
        if (noteSection) noteSection.open = false;
    }

    // Pre-fill fields if provided (for duplicate functionality)
    if (Object.prototype.hasOwnProperty.call(options, 'amount')) {
        const amountEl = getEl('modalAmount');
        if (amountEl) amountEl.value = options.amount || '';
    }
    if (Object.prototype.hasOwnProperty.call(options, 'description')) {
        const descEl = getEl('modalDescription');
        if (descEl) descEl.value = options.description || '';
    }
    if (Object.prototype.hasOwnProperty.call(options, 'contactName')) {
        const contactEl = getEl('modalContactName');
        if (contactEl) contactEl.value = options.contactName || '';
    }
    if (Object.prototype.hasOwnProperty.call(options, 'contactAddress')) {
        if (typeof window.__setModalContactAddress === 'function') {
            window.__setModalContactAddress(options.contactAddress || '');
        } else {
            const addrEl = getEl('modalContactAddress');
            if (addrEl) addrEl.value = options.contactAddress || '';
        }
    }
    if (Object.prototype.hasOwnProperty.call(options, 'contactOtherId')) {
        const otherIdEl = getEl('modalContactCompanyId');
        if (otherIdEl) otherIdEl.value = options.contactOtherId || '';
    }
    const contactIdEl = getEl('modalContactId');
    if (contactIdEl) contactIdEl.value = '';
    if (Object.prototype.hasOwnProperty.call(options, 'transactionId')) {
        const txIdEl = getEl('modalTransactionId');
        if (txIdEl) txIdEl.value = options.transactionId || '';
    }
    if (Object.prototype.hasOwnProperty.call(options, 'note')) {
        const noteEl = getEl('modalNote');
        if (noteEl) noteEl.value = options.note || '';
        // Open note section if there's data
        if (options.note) {
            const noteSection = getEl('modalNoteSection');
            if (noteSection) noteSection.open = true;
        }
    }

    // Pre-fill line items if provided (for duplicate)
    if (Array.isArray(options.lineItems) && options.lineItems.length > 0) {
        // Switch to detailed mode to show line items
        updateModalModeUI('detailed', { persist: false });
        
        // Render extra line items
        const itemsContainer = getEl('modalLineItemsContainer');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            options.lineItems.forEach(function(item, idx) {
                const row = document.createElement('div');
                row.className = 'form-row-line-item';
                row.innerHTML = '<div class="form-group"><input type="text" class="line-item-input" data-item-index="' + (idx + 1) + '" placeholder="Item description" value="' + (item.description || '').replace(/"/g, '&quot;') + '"></div><div class="form-group"><div class="amount-input-wrapper"><span class="currency-symbol">$</span><input type="text" class="line-item-input line-item-amount" data-amount-index="' + (idx + 1) + '" placeholder="0.00" value="' + (item.amount || '') + '"></div></div>';
                itemsContainer.appendChild(row);
            });
            setDetailedItemsExpanded(true);
        }
    }

    // Always update total after prefill
    setTimeout(function() { updateLineItemsTotal(); }, 0);

    requestAnimationFrame(function() {
        requestAnimationFrame(function() {
            const dirEl = document.querySelector('input[name="modalDirection"]:checked');
            const focusId = dirEl ? dirEl.id : 'modalDirectionIn';
            const label = container ? container.querySelector('label[for="' + focusId + '"]') : null;
            if (label && typeof label.focus === 'function') { label.focus(); }
            else if (dirEl && typeof dirEl.focus === 'function') { dirEl.focus(); }
            else if (container) { container.focus(); }
        });
    });
}

function closeModal() {
    const modal = getModal();
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setModalBackgroundInert(false);
    document.removeEventListener('keydown', handleModalKeydown, true);
    document.removeEventListener('focusin', handleModalFocusIn, true);

    const form = getEl('modalTransactionForm');
    if (form) form.reset();
    updateModalDirectionUI('in');
    updateModalModeUI(getStoredModalMode(), { persist: false });

    const lineItems = getEl('modalLineItemsContainer');
    if (lineItems) lineItems.innerHTML = '';
    setDetailedItemsExpanded(false);

    const noteSection = getEl('modalNoteSection');
    if (noteSection) noteSection.open = false;
    if (typeof updateLineItemsTotal === 'function') updateLineItemsTotal();

    if (lastModalFocusEl && typeof lastModalFocusEl.focus === 'function') {
        try { lastModalFocusEl.focus(); } catch (e) {}
    }
    lastModalFocusEl = null;

    try {
        const activeId = localStorage.getItem('activeCashBoxId');
        if (activeId && typeof window.syncDashboardCashBoxSelection === 'function') {
            window.syncDashboardCashBoxSelection(activeId, { scrollPage: true });
        }
    } catch (_) {
        // ignore
    }
}

window.openModal = openModal;
window.closeModal = closeModal;
window.setModalSubmittingState = setModalSubmittingState;
window.setDetailedItemsExpanded = setDetailedItemsExpanded;
window.renderDetailedExtraItems = renderDetailedExtraItems;
window.updateModalModeUI = updateModalModeUI;
window.modalCashBoxes = modalCashBoxes;
window.modalCashBoxIndex = modalCashBoxIndex;
window.maxModalLineItems = maxModalLineItems;

// ========================================
// LINE ITEMS TOTAL
// ========================================
function parseModalAmount(value) {
    const normalized = String(value || '').replace(/\s+/g, '').replace(/,/g, '.');
    const num = parseFloat(normalized);
    return Number.isFinite(num) ? num : 0;
}

function updateLineItemsTotal() {
    const totalEl = getEl('lineItemsTotal');
    const amountEl = getEl('lineItemsTotalAmount');
    const mainAmount = getEl('modalAmount');
    if (!totalEl || !amountEl) return;

    const container = getModalContainer();
    const isDetailed = container && container.dataset.mode === 'detailed';
    const baseAmount = parseModalAmount(mainAmount ? mainAmount.value : 0);
    let extrasTotal = 0;

    if (isDetailed) {
        document.querySelectorAll('#modalLineItemsContainer .line-item-amount').forEach(function(input) {
            const value = parseModalAmount(input.value);
            if (value > 0) extrasTotal += value;
        });
    }

    const total = baseAmount + extrasTotal;
    totalEl.style.display = 'flex';
    amountEl.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
}

window.parseModalAmount = parseModalAmount;
window.updateLineItemsTotal = updateLineItemsTotal;

// ========================================
// CONTACT AUTOCOMPLETE
// ========================================
async function loadContactsForAutocomplete() {
    if (contactsLoaded) { console.log('[ContactAC] Already loaded:', Contacts.length); return; }
    if (!window.db || !window.db.contacts) { console.warn('[ContactAC] db.contacts not ready, retrying...'); setTimeout(loadContactsForAutocomplete, 300); return; }
    try {
        console.log('[ContactAC] Loading contacts from DB...');
        const data = await window.db.contacts.getAll();
        Contacts = (data || []).map(function(c) {
            const displayId = formatContactDisplayId(c && c.sequence_number);
            return { id: c.id, name: c.name || '', address: c.address || '', contact: c.email || '', displayId: displayId };
        });
        contactsLoaded = true;
        console.log('[ContactAC] Loaded', Contacts.length, 'contacts');
    } catch (e) { console.error('[ContactAC] Failed to load contacts:', e); }
}

function initContactAutocomplete() {
    const input = getEl('modalContactName');
    const dropdown = getEl('ContactAutocomplete');
    console.log('[ContactAC] Init called, input:', !!input, 'dropdown:', !!dropdown);
    if (!input || !dropdown) { console.warn('[ContactAC] input or dropdown not found'); return; }

    loadContactsForAutocomplete();
    let selectedIdx = -1;

    function removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function filter(q) {
        if (!q) return [];
        const lq = removeAccents(q.toLowerCase());
        return Contacts.filter(function(p) {
            return removeAccents(p.name.toLowerCase()).includes(lq)
                || (p.displayId && removeAccents(p.displayId.toLowerCase()).includes(lq))
                || (p.address && removeAccents(p.address.toLowerCase()).includes(lq));
        });
    }

    function select(c) {
        input.value = c.name;
        if (typeof window.__setModalContactAddress === 'function') {
            window.__setModalContactAddress(c.address);
        } else {
            const addrEl = getEl('modalContactAddress');
            if (addrEl) addrEl.value = c.address;
        }
        const otherIdEl = getEl('modalContactCompanyId');
        if (otherIdEl) otherIdEl.value = c.phone || '';
        const contactIdEl = getEl('modalContactId');
        if (contactIdEl) contactIdEl.value = c.id;
        dropdown.classList.remove('show');
        selectedIdx = -1;
    }

    function show(results) {
        if (!results.length) { dropdown.classList.remove('show'); return; }

        var html = results.map(function(c, i) {
            return '<div class="autocomplete-item ' + (i === selectedIdx ? 'active' : '') + '" data-index="' + i + '"><div class="autocomplete-item-name">' + c.name + '</div><div class="autocomplete-item-details">' + (c.displayId ? '<div class="autocomplete-item-detail"><i class="fas fa-tag"></i>' + c.displayId + '</div>' : '') + (c.address ? '<div class="autocomplete-item-detail"><i class="fas fa-map-marker-alt"></i>' + c.address.split(',')[0] + '</div>' : '') + '</div></div>';
        }).join('');

        dropdown.innerHTML = html;
        dropdown.classList.add('show');

        dropdown.querySelectorAll('.autocomplete-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var f = filter(input.value);
                if (f[+item.dataset.index]) select(f[+item.dataset.index]);
            });
        });
    }

    function updateActive() {
        var items = dropdown.querySelectorAll('.autocomplete-item');
        items.forEach(function(item, i) { item.classList.toggle('active', i === selectedIdx); });
        if (selectedIdx >= 0 && items[selectedIdx]) items[selectedIdx].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', async function(e) {
        console.log('[ContactAC] Input event, value:', e.target.value, 'contactsLoaded:', contactsLoaded);
        const idEl = getEl('modalContactId');
        if (idEl) idEl.value = '';
        if (!contactsLoaded) await loadContactsForAutocomplete();
        const results = filter(e.target.value);
        console.log('[ContactAC] Filter results:', results.length);
        show(results);
        selectedIdx = -1;
    });
    input.addEventListener('focus', async function(e) {
        if (!contactsLoaded) await loadContactsForAutocomplete();
        if (e.target.value) show(filter(e.target.value));
    });
    input.addEventListener('keydown', function(e) {
        var items = dropdown.querySelectorAll('.autocomplete-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, items.length - 1); updateActive(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, -1); updateActive(); }
        else if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); var f = filter(input.value); if (f[selectedIdx]) select(f[selectedIdx]); }
        else if (e.key === 'Escape') { dropdown.classList.remove('show'); selectedIdx = -1; }
    });

    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) { dropdown.classList.remove('show'); selectedIdx = -1; }
    });
}

// ========================================
// SIMPLE AUTOCOMPLETE
// ========================================
function setupSimpleAutocomplete(input, dropdown, data) {
    if (!input || !dropdown || !Array.isArray(data)) return;
    let selectedIdx = -1;

    input.addEventListener('input', function(e) {
        const q = e.target.value.toLowerCase();
        if (!q) { dropdown.classList.remove('show'); return; }
        const results = data.filter(function(item) { return item.toLowerCase().includes(q); });
        if (!results.length) { dropdown.classList.remove('show'); return; }

        dropdown.innerHTML = results.map(function(item, i) {
            return '<div class="autocomplete-item ' + (i === selectedIdx ? 'active' : '') + '" data-value="' + item + '"><div class="autocomplete-item-name">' + item + '</div></div>';
        }).join('');
        dropdown.classList.add('show');

        dropdown.querySelectorAll('.autocomplete-item').forEach(function(item) {
            item.addEventListener('click', function() { input.value = item.dataset.value; dropdown.classList.remove('show'); selectedIdx = -1; });
        });
    });

    input.addEventListener('focus', function(e) { if (e.target.value) input.dispatchEvent(new Event('input', { bubbles: true })); });

    input.addEventListener('keydown', function(e) {
        var items = dropdown.querySelectorAll('.autocomplete-item');
        if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, items.length - 1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, -1); }
        else if (e.key === 'Enter' && selectedIdx >= 0 && items[selectedIdx]) { e.preventDefault(); input.value = items[selectedIdx].dataset.value; dropdown.classList.remove('show'); selectedIdx = -1; }
        else if (e.key === 'Escape') { dropdown.classList.remove('show'); selectedIdx = -1; }
        items.forEach(function(item, i) { item.classList.toggle('active', i === selectedIdx); });
        if (selectedIdx >= 0 && items[selectedIdx]) items[selectedIdx].scrollIntoView({ block: 'nearest' });
    });

    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) { dropdown.classList.remove('show'); selectedIdx = -1; }
    });
}

// ========================================
// INIT MODAL
// ========================================
function initDashboardModal() {
    const openBtn = getEl('addTransactionBtn');
    const closeBtn = getEl('closeModalBtn');
    const cancelBtn = getEl('modalCancelBtn');
    const modal = getModal();

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    const dirIn = getEl('modalDirectionIn');
    const dirOut = getEl('modalDirectionOut');
    if (dirIn) dirIn.addEventListener('change', function() { updateModalDirectionUI('in'); });
    if (dirOut) dirOut.addEventListener('change', function() { updateModalDirectionUI('out'); });

    ['modalDirectionIn', 'modalDirectionOut'].forEach(function(id) {
        const label = document.querySelector('label[for="' + id + '"]');
        if (label) label.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); label.click(); }
        });
    });

    const modeQuick = getEl('modalModeQuick');
    const modeDetailed = getEl('modalModeDetailed');
    if (modeQuick) modeQuick.addEventListener('change', function() { updateModalModeUI('quick'); });
    if (modeDetailed) modeDetailed.addEventListener('change', function() { updateModalModeUI('detailed'); });

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (isModalSubmitting) return;
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                var container = getModalContainer();
                if (container && typeof container.focus === 'function') container.focus();
            }
        });
    }

    const prevBtn = getEl('modalCashboxPrev');
    const nextBtn = getEl('modalCashboxNext');
    if (prevBtn) prevBtn.addEventListener('click', function() {
        if (modalCashBoxes.length > 1) {
            modalCashBoxIndex = (modalCashBoxIndex - 1 + modalCashBoxes.length) % modalCashBoxes.length;
            updateModalCashboxDisplay();
        }
    });
    if (nextBtn) nextBtn.addEventListener('click', function() {
        if (modalCashBoxes.length > 1) {
            modalCashBoxIndex = (modalCashBoxIndex + 1) % modalCashBoxes.length;
            updateModalCashboxDisplay();
        }
    });

    const expandBtn = getEl('modalExpandItemsBtn');
    if (expandBtn) expandBtn.addEventListener('click', function() {
        if (modalItemsExpanded) { setDetailedItemsExpanded(false); return; }
        renderDetailedExtraItems(maxModalLineItems);
        setDetailedItemsExpanded(true);
    });

    const modalAmount = getEl('modalAmount');
    if (modalAmount) modalAmount.addEventListener('input', updateLineItemsTotal);

    // Event delegation for line item amount changes
    const lineItemsContainer = getEl('modalLineItemsContainer');
    if (lineItemsContainer) {
        lineItemsContainer.addEventListener('input', function(e) {
            if (e.target.classList.contains('line-item-amount')) {
                updateLineItemsTotal();
            }
        });
    }

    initContactAutocomplete();

    const descInput = getEl('modalDescription');
    const descDropdown = getEl('descriptionAutocomplete');
    if (descInput && descDropdown) {
        setupSimpleAutocomplete(descInput, descDropdown, [
            'Office supplies', 'Retail cash deposit', 'Customer payment', 'Marketing campaign',
            'Product sales', 'Employee salary', 'Rent payment', 'Utility bills',
            'Equipment purchase', 'Consulting services'
        ]);
    }

    const txIdInput = getEl('modalTransactionId');
    const txIdDropdown = getEl('transactionIdAutocomplete');
    if (txIdInput && txIdDropdown) {
        setupSimpleAutocomplete(txIdInput, txIdDropdown, ['PO-2026-001', 'INV-2026-045', 'ORD-2025-789', 'REF-2026-012']);
    }

    // Hash-based modal opening
    if (window.location.hash === '#new-transaction') {
        const params = new URLSearchParams(window.location.search);
        const duplicateTxId = params.get('duplicate');

        const doOpen = async function() {
            setTimeout(async function() {
                if (duplicateTxId) {
                    // Always fetch full transaction data for duplicate
                    await duplicateTransaction(duplicateTxId);
                } else {
                    // Normal new transaction mode
                    const preset = {};
                    const cbRaw = params.get('cashBoxId');
                    if (cbRaw) {
                        let ok = false;
                        try {
                            ok = Boolean(window.SpendNoteIds && typeof window.SpendNoteIds.isUuid === 'function'
                                ? window.SpendNoteIds.isUuid(cbRaw)
                                : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(cbRaw || '').trim()));
                        } catch (_) {
                            ok = false;
                        }
                        if (ok) preset.cashBoxId = cbRaw;
                    }
                    if (params.get('direction') === 'in' || params.get('direction') === 'out') preset.direction = params.get('direction');
                    openModal(preset);
                }
                history.replaceState(null, null, 'dashboard.html');
            }, 0);
        };

        if (window.__spendnoteDashboardDataLoaded) { doOpen(); }
        else { window.addEventListener('SpendNoteDashboardDataLoaded', doOpen, { once: true }); }
    }
}

window.initDashboardModal = initDashboardModal;

// ========================================
// DUPLICATE TRANSACTION
// ========================================
async function duplicateTransaction(txId) {
    if (!txId || !window.db?.transactions?.getById) {
        console.warn('Cannot duplicate: missing txId or db.transactions.getById');
        return;
    }

    try {
        const tx = await window.db.transactions.getById(txId);
        console.log('[Duplicate] Transaction data:', tx);
        if (!tx) {
            alert('Transaction not found.');
            return;
        }

        // Parse line items - first item is main description/amount, rest are extras
        const lineItems = Array.isArray(tx.line_items) ? tx.line_items : [];
        const firstItem = lineItems[0] || {};
        const extraItems = lineItems.slice(1);

        const rawOtherId = String(tx?.contact_custom_field_1 || '').trim();
        const rawNote = String(tx?.notes || tx?.note || '').trim();
        const duplicateMode = (extraItems.length > 0 || Boolean(rawOtherId) || Boolean(rawNote)) ? 'detailed' : 'quick';

        const fallbackContactId = formatContactDisplayId(tx?.contact?.sequence_number);
        const contactOtherId = rawOtherId || fallbackContactId || '';

        const preset = {
            cashBoxId: tx.cash_box_id || tx.cash_box?.id || null,
            direction: tx.type === 'income' ? 'in' : 'out',
            mode: duplicateMode,
            amount: firstItem.amount || tx.amount || '',
            description: firstItem.description || tx.description || '',
            contactName: tx.contact?.name || tx.contact_name || '',
            contactAddress: tx.contact_address || tx.contact?.address || '',
            contactOtherId: contactOtherId,
            isDuplicate: true,
            transactionId: '', // Clear the transaction ID for duplicate
            note: tx.notes || tx.note || '',
            lineItems: extraItems
        };
        console.log('[Duplicate] Preset:', preset);
        console.log('[Duplicate] Line items:', lineItems);

        // Navigate to dashboard if not already there
        if (!document.getElementById('createTransactionModal')) {
            const params = new URLSearchParams();
            params.set('duplicate', txId);
            window.location.href = 'dashboard.html?' + params.toString() + '#new-transaction';
            return;
        }

        openModal(preset);
    } catch (err) {
        console.error('Error duplicating transaction:', err);
        alert('Failed to duplicate transaction.');
    }
}

window.duplicateTransaction = duplicateTransaction;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardModal);
} else {
    initDashboardModal();
}

})();
