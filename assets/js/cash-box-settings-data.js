// Cash Box Settings Data Handler - Create/Update cash boxes
const DEBUG = window.SpendNoteDebug || false;
let isEditMode = false;
let currentCashBoxId = null;
let currentCashBoxData = null;
let hasInitialized = false;
let supportsReceiptLabels = true;
let supportsCashBoxLogo = true;
let supportsReceiptVisibility = true;

function isUuid(value) {
    try {
        if (window.SpendNoteIds && typeof window.SpendNoteIds.isUuid === 'function') {
            return window.SpendNoteIds.isUuid(value);
        }
    } catch (_) {

    }
    return false;
}

function getReceiptFormatStorageKey(cashBoxId) {
    const id = String(cashBoxId || '').trim();
    if (!id) return '';
    return `spendnote.cashBox.${id}.defaultReceiptFormat.v1`;
}

function applyReceiptFormatUi(format) {
    const f = String(format || '').trim().toLowerCase();
    if (f !== 'a4' && f !== 'pdf' && f !== 'email') return;
    document.querySelectorAll('.format-btn').forEach((btn) => {
        btn.classList.toggle('active', String(btn?.dataset?.format || '').toLowerCase() === f);
    });
}

function bindReceiptFormatButtons() {
    document.querySelectorAll('.format-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const format = String(btn?.dataset?.format || '').trim().toLowerCase();
            if (format !== 'a4' && format !== 'pdf' && format !== 'email') return;
            applyReceiptFormatUi(format);
            if (!currentCashBoxId) return;
            const key = getReceiptFormatStorageKey(currentCashBoxId);
            if (!key) return;
            try {
                localStorage.setItem(key, format);
            } catch (_) {
                // ignore
            }
        });
    });
}

async function getCashBoxTransactionCount(cashBoxId) {
    try {
        if (!cashBoxId || !window.supabaseClient) return 0;

        const { count, error } = await window.supabaseClient
            .from('transactions')
            .select('id', { count: 'exact', head: true })
            .eq('cash_box_id', cashBoxId);

        if (error) {
            console.error('Error counting transactions for cash box:', error);
            return 0;
        }

        return Number.isFinite(count) ? count : 0;
    } catch (e) {
        console.error('Error counting transactions for cash box:', e);
        return 0;
    }
}

function clearActiveCashBoxIfMatches(cashBoxId) {
    try {
        const activeId = localStorage.getItem('activeCashBoxId');
        if (activeId && cashBoxId && String(activeId) === String(cashBoxId)) {
            localStorage.removeItem('activeCashBoxId');
            localStorage.removeItem('activeCashBoxColor');
            localStorage.removeItem('activeCashBoxRgb');
        }
    } catch (e) {}
}

function togglePanelDisplay(panelEl, displayWhenVisible) {
    if (!panelEl) return;
    const isHidden = panelEl.style.display === 'none' || !panelEl.style.display;
    panelEl.style.display = isHidden ? (displayWhenVisible || 'block') : 'none';
}

function bindTeamAccessToggle() {
    const content = document.getElementById('teamContent');
    if (!content) return;

    const header = content.previousElementSibling;
    const icon = document.getElementById('teamToggleIcon');
    if (!header) return;

    header.addEventListener('click', () => {
        const isHidden = content.style.display === 'none' || !content.style.display;
        content.style.display = isHidden ? 'block' : 'none';
        if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
}

function bindCashBoxDeletePanelToggle() {
    const toggleBtn = document.getElementById('cashBoxDeleteToggle');
    const panel = document.getElementById('cashBoxDeletePanel');
    if (!toggleBtn || !panel) return;

    toggleBtn.addEventListener('click', () => {
        togglePanelDisplay(panel, 'flex');
    });
}

async function handleDeleteCashBox() {
    try {
        if (!currentCashBoxId) {
            showAlert('You can only delete a Cash Box after it has been created.', { iconType: 'warning' });
            return;
        }

        const name = document.getElementById('cashBoxNameInput')?.value?.trim() || 'this Cash Box';
        const txCount = await getCashBoxTransactionCount(currentCashBoxId);

        const confirmed = await showConfirm(
            `Delete "${name}"?\n\n` +
            `This will permanently delete:\n• This Cash Box\n• ${txCount} transaction${txCount === 1 ? '' : 's'}\n\n` +
            `Before deleting, export your data if you need it.\nThis action cannot be undone.`,
            { title: 'Delete Cash Box', iconType: 'danger', okLabel: 'Continue', danger: true }
        );
        if (!confirmed) return;

        const typed = await showPrompt(
            `Type DELETE to confirm permanent deletion of "${name}".\n\nThis will also delete ${txCount} transaction${txCount === 1 ? '' : 's'}.`,
            { title: 'Confirm Deletion', iconType: 'danger', placeholder: 'DELETE' }
        );
        if (typed !== 'DELETE') {
            showAlert('Deletion cancelled.', { iconType: 'info' });
            return;
        }

        const deleteBtn = document.getElementById('deleteButton');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.classList.add('is-loading');
        }

        if (!window.db?.cashBoxes?.delete) {
            throw new Error('Delete is not available');
        }

        const result = await window.db.cashBoxes.delete(currentCashBoxId);
        if (result?.success === false) {
            throw new Error(result.error || 'Delete failed');
        }

        clearActiveCashBoxIfMatches(currentCashBoxId);
        window.location.replace('spendnote-cash-box-list.html');
    } catch (error) {
        console.error('Failed to delete cash box:', error);
        showAlert('Could not delete the Cash Box.', { iconType: 'error' });

        const deleteBtn = document.getElementById('deleteButton');
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.classList.remove('is-loading');
        }
    }
}

function toRgbStringFromHex(hex) {
    try {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
        if (!m) return null;
        return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
    } catch (e) {
        return null;
    }
}

function normalizeFaIcon(icon) {
    const raw = String(icon || '').trim();
    if (!raw) return 'fa-building';
    if (raw.includes('fa-')) {
        const m = raw.match(/fa-[a-z0-9-]+/i);
        return m ? m[0] : 'fa-building';
    }
    return raw.startsWith('fa') ? raw : `fa-${raw}`;
}

function normalizeIconForStorage(icon) {
    const normalized = normalizeFaIcon(icon);
    return normalized.replace(/^fa-/, '') || 'building';
}

function getCashBoxDisplayCode(cashBox) {
    const seq = Number(cashBox?.sequence_number);
    return Number.isFinite(seq) && seq > 0 ? `SN-${String(seq).padStart(3, '0')}` : '—';
}

function formatMoney(amount, currency) {
    const safeAmount = Number(amount);
    const value = Number.isFinite(safeAmount) ? safeAmount : 0;
    const curr = String(currency || 'USD').toUpperCase();
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr }).format(value);
    } catch (e) {
        return `$${value.toFixed(2)}`;
    }
}

function updateSummaryCard(cashBox) {
    const summaryCard = document.querySelector('.summary-card');
    if (!summaryCard) return;

    const iconWrap = document.getElementById('summaryIcon');
    const idEl = document.getElementById('summaryId');
    const nameEl = document.getElementById('summaryName');
    const balanceEl = document.getElementById('summaryBalance');

    const displayCode = getCashBoxDisplayCode(cashBox);
    const iconClass = normalizeFaIcon(cashBox?.icon);
    const color = cashBox?.color || '#059669';
    const rgb = toRgbStringFromHex(color) || '5, 150, 105';

    if (iconWrap) {
        iconWrap.style.background = color;
        iconWrap.innerHTML = `<i class="fas ${iconClass}"></i>`;
    }
    if (idEl) idEl.textContent = displayCode;
    if (nameEl) nameEl.textContent = cashBox?.name || '—';
    if (balanceEl) balanceEl.textContent = formatMoney(cashBox?.current_balance, cashBox?.currency);

    // Keep page accent in sync (visual only)
    document.documentElement.style.setProperty('--active', color);
    document.documentElement.style.setProperty('--active-rgb', rgb);
}

function bindSummaryLiveUpdates() {
    const nameInput = document.getElementById('cashBoxNameInput');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const nameEl = document.getElementById('summaryName');
            if (nameEl) nameEl.textContent = nameInput.value.trim() || '—';
        });
    }

    const currencyInput = document.getElementById('currencySelect');
    if (currencyInput) {
        currencyInput.addEventListener('input', () => {
            const balanceEl = document.getElementById('summaryBalance');
            if (!balanceEl) return;
            const currency = String(currencyInput.value || 'USD').toUpperCase();
            const amount = currentCashBoxData?.current_balance;
            balanceEl.textContent = formatMoney(amount, currency);
        });
    }

    // Icon palette -> summary icon
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', () => {
            const iconWrap = document.getElementById('summaryIcon');
            const selected = document.querySelector('.icon-option.selected');
            const iconClass = normalizeFaIcon(selected?.dataset?.icon);
            if (iconWrap) iconWrap.innerHTML = `<i class="fas ${iconClass}"></i>`;
        });
    });

    // Color palette -> summary background
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const iconWrap = document.getElementById('summaryIcon');
            const selected = document.querySelector('.color-option.selected');
            const color = selected?.dataset?.color;
            if (iconWrap && color) iconWrap.style.background = color;
        });
    });
}

// Initialize page
async function initCashBoxSettings() {
    try {
        if (hasInitialized) return;
        hasInitialized = true;

        const urlParams = new URLSearchParams(window.location.search);
        const idRaw = urlParams.get('cashBoxId');
        const raw = String(idRaw || '').trim();
        currentCashBoxId = raw && isUuid(raw) ? raw : null;

        if (raw && !currentCashBoxId) {
            try {
                const seq = (window.SpendNoteIds && typeof window.SpendNoteIds.parseCashBoxDisplayId === 'function')
                    ? window.SpendNoteIds.parseCashBoxDisplayId(raw)
                    : null;

                if (Number.isFinite(seq) && seq > 0 && window.db?.cashBoxes?.getBySequence) {
                    const box = await window.db.cashBoxes.getBySequence(seq);
                    const uuid = String(box?.id || '').trim();
                    if (uuid && isUuid(uuid)) {
                        currentCashBoxId = uuid;
                        try {
                            urlParams.set('cashBoxId', uuid);
                            urlParams.delete('id');
                            const next = `${window.location.pathname}?${urlParams.toString()}${window.location.hash || ''}`;
                            window.history.replaceState({}, '', next);
                        } catch (_) {}
                    }
                }
            } catch (_) {
                // ignore
            }
        }

        if (raw && !currentCashBoxId) {
            await showAlert('Invalid Cash Box ID.', { iconType: 'error' });
            window.location.replace('spendnote-cash-box-list.html');
            return;
        }

        if (currentCashBoxId) {
            // Edit mode - load existing cash box
            isEditMode = true;
            await loadCashBoxData(currentCashBoxId);
            
            // Update page title
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) pageTitle.textContent = 'Edit Cash Box';
        } else {
            // Create mode
            isEditMode = false;
            
            // Update page title
            const pageTitle = document.querySelector('.page-title');
            if (pageTitle) pageTitle.textContent = 'Create Cash Box';

            const summaryCard = document.querySelector('.summary-card');
            if (summaryCard) summaryCard.style.display = 'none';

            const deleteToggle = document.getElementById('cashBoxDeleteToggle');
            const deletePanel = document.getElementById('cashBoxDeletePanel');
            if (deleteToggle) deleteToggle.style.display = 'none';
            if (deletePanel) deletePanel.style.display = 'none';
        }
        
        // Sync profile logo from DB to localStorage for receipt preview
        try {
            const profile = window.db?.profiles?.getCurrent ? await window.db.profiles.getCurrent() : null;
            if (profile) {
                const LOGO_K = 'spendnote.proLogoDataUrl';
                const LEGACY_K = 'spendnote.receipt.logo.v1';
                const SCALE_K = 'spendnote.receipt.logoScale.v1';
                const POS_K = 'spendnote.receipt.logoPosition.v1';
                if (profile.account_logo_url) {
                    try { localStorage.setItem(LOGO_K, profile.account_logo_url); localStorage.setItem(LEGACY_K, profile.account_logo_url); } catch (_) {}
                }
                const ls = profile.logo_settings;
                if (ls && typeof ls === 'object') {
                    if (ls.scale != null) try { localStorage.setItem(SCALE_K, String(ls.scale)); } catch (_) {}
                    if (ls.x != null || ls.y != null) try { localStorage.setItem(POS_K, JSON.stringify({ x: Number(ls.x) || 0, y: Number(ls.y) || 0 })); } catch (_) {}
                }
            }
        } catch (_) {}

        if (DEBUG) console.log('Cash Box Settings initialized', isEditMode ? '(Edit mode)' : '(Create mode)');
        
        const saveBtn = document.getElementById('cashBoxSaveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', handleSave);
        }

        const cancelBtn = document.getElementById('cashBoxCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const referrer = document.referrer;
                if (referrer && referrer.includes('dashboard.html')) {
                    window.location.replace('dashboard.html');
                } else if (referrer && referrer.includes('spendnote-cash-box-list.html')) {
                    window.location.replace('spendnote-cash-box-list.html');
                } else {
                    window.location.replace('spendnote-cash-box-list.html');
                }
            });
        }

        const deleteBtn = document.getElementById('deleteButton');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', handleDeleteCashBox);
        }

        bindTeamAccessToggle();
        if (isEditMode) {
            bindCashBoxDeletePanelToggle();
        }

        bindReceiptFormatButtons();

        // Apply persisted Default Format (localStorage) so the UI matches what Done & Print will use.
        if (currentCashBoxId) {
            try {
                const key = getReceiptFormatStorageKey(currentCashBoxId);
                const stored = key ? String(localStorage.getItem(key) || '').trim().toLowerCase() : '';
                if (stored) {
                    const btn = document.querySelector(`.format-btn[data-format="${stored}"]`);
                    if (btn && typeof btn.click === 'function') {
                        btn.click();
                    } else {
                        applyReceiptFormatUi(stored);
                    }
                }
            } catch (_) {
                // ignore
            }
        }

        // Summary live updates (name/icon/color)
        bindSummaryLiveUpdates();
        
    } catch (error) {
        console.error('❌ Error initializing cash box settings:', error);
    }
}

// Load existing cash box data
async function loadCashBoxData(id) {
    try {
        const cashBox = await db.cashBoxes.getById(id);
        
        if (!cashBox) {
            await showAlert('Cash box not found', { iconType: 'error' });
            window.location.href = 'spendnote-cash-box-list.html';
            return;
        }
        
        // Populate the name field
        const nameInput = document.getElementById('cashBoxNameInput');
        if (nameInput) nameInput.value = cashBox.name || '';

        // Populate currency
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect && cashBox.currency) {
            currencySelect.value = cashBox.currency;
            currencySelect.dataset.originalCurrency = cashBox.currency;
        }

        // Populate ID prefix
        const idPrefixInput = document.getElementById('idPrefixInput');
        if (idPrefixInput) {
            idPrefixInput.value = String(cashBox.id_prefix || idPrefixInput.value || 'SN').trim();
        }

        // Populate color selection
        if (cashBox.color) {
            document.querySelectorAll('.color-option').forEach(option => {
                option.classList.toggle('selected', option.dataset.color === cashBox.color);
            });
        }

        // Populate icon selection
        if (cashBox.icon) {
            const target = normalizeFaIcon(cashBox.icon);
            document.querySelectorAll('.icon-option').forEach(option => {
                const opt = normalizeFaIcon(option.dataset.icon);
                option.classList.toggle('selected', opt === target);
            });
        }

        // Populate Pro Options receipt labels (cash box defaults)
        const receiptTitleEl = document.getElementById('receiptTitle');
        const totalLabelEl = document.getElementById('totalLabel');
        const fromLabelEl = document.getElementById('fromLabel');
        const toLabelEl = document.getElementById('toLabel');
        const descriptionLabelEl = document.getElementById('descriptionLabel');
        const amountLabelEl = document.getElementById('amountLabel');
        const issuedByLabelEl = document.getElementById('issuedByLabel');
        const receivedByLabelEl = document.getElementById('receivedByLabel');
        const footerNoteEl = document.getElementById('footerNote');

        if (receiptTitleEl) receiptTitleEl.value = cashBox.receipt_title || '';
        if (totalLabelEl) totalLabelEl.value = cashBox.receipt_total_label || '';
        if (fromLabelEl) fromLabelEl.value = cashBox.receipt_from_label || '';
        if (toLabelEl) toLabelEl.value = cashBox.receipt_to_label || '';
        if (descriptionLabelEl) descriptionLabelEl.value = cashBox.receipt_description_label || '';
        if (amountLabelEl) amountLabelEl.value = cashBox.receipt_amount_label || '';
        if (issuedByLabelEl) issuedByLabelEl.value = cashBox.receipt_issued_by_label || '';
        if (receivedByLabelEl) receivedByLabelEl.value = cashBox.receipt_received_by_label || '';
        if (footerNoteEl) footerNoteEl.value = cashBox.receipt_footer_note || '';

        // Populate receipt field visibility toggles
        const visibilityByField = {
            logo: cashBox.receipt_show_logo,
            addresses: cashBox.receipt_show_addresses,
            tracking: cashBox.receipt_show_tracking,
            additional: cashBox.receipt_show_additional,
            note: cashBox.receipt_show_note,
            signatures: cashBox.receipt_show_signatures
        };

        const normalizeVisibility = (value, fallback) => {
            if (typeof value === 'boolean') return value;
            if (value === '1' || value === 1 || String(value).toLowerCase() === 'true') return true;
            if (value === '0' || value === 0 || String(value).toLowerCase() === 'false') return false;
            return fallback;
        };

        const quickPreset = { logo: true, addresses: true, tracking: true, additional: false, note: false, signatures: true };
        const resolvedVisibility = {
            logo: normalizeVisibility(visibilityByField.logo, quickPreset.logo),
            addresses: normalizeVisibility(visibilityByField.addresses, quickPreset.addresses),
            tracking: normalizeVisibility(visibilityByField.tracking, quickPreset.tracking),
            additional: normalizeVisibility(visibilityByField.additional, quickPreset.additional),
            note: normalizeVisibility(visibilityByField.note, quickPreset.note),
            signatures: normalizeVisibility(visibilityByField.signatures, quickPreset.signatures)
        };

        const isQuickMode = Object.keys(quickPreset).every((k) => resolvedVisibility[k] === quickPreset[k]);
        if (typeof window.applyReceiptMode === 'function') {
            window.applyReceiptMode(isQuickMode ? 'quick' : 'detailed');
        }

        document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach((toggle) => {
            const field = String(toggle?.dataset?.field || '');
            if (!field || !Object.prototype.hasOwnProperty.call(resolvedVisibility, field)) return;
            toggle.checked = Boolean(resolvedVisibility[field]);
            toggle.dispatchEvent(new Event('change', { bubbles: true }));
        });

        currentCashBoxData = cashBox;
        supportsReceiptLabels = Boolean(cashBox && Object.prototype.hasOwnProperty.call(cashBox, 'receipt_amount_label'));
        updateSummaryCard(cashBox);

        // Load cash-box-specific logo into Pro Options preview
        if (typeof window.setCashBoxLogo === 'function') {
            window.setCashBoxLogo(cashBox.cash_box_logo_url || '');
        }
        
        if (DEBUG) console.log('Cash box data loaded:', cashBox.name);
        
    } catch (error) {
        console.error('❌ Error loading cash box data:', error);
        showAlert('Error loading cash box data', { iconType: 'error' });
    }
}

// Handle save button click
async function handleSave(e) {
    e.preventDefault();
    
    try {
        // Get the name from the input
        const nameInput = document.getElementById('cashBoxNameInput');
        const name = nameInput ? nameInput.value.trim() : '';
        
        // Validate
        if (!name) {
            showAlert('Please enter a cash box name', { iconType: 'warning' });
            return;
        }
        
        // Get current user
        const user = await window.auth.getCurrentUser();
        
        if (!user) {
            throw new Error('You must be logged in to create a cash box');
        }
        
        // Check if profile exists (cash_boxes.user_id references profiles.id)
        let { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (DEBUG) console.log('Profile:', profile, 'Error:', profileError);
        
        // If profile doesn't exist, create it automatically
        if (profileError || !profile) {
            if (DEBUG) console.log('Creating profile automatically...');
            const { data: newProfile, error: createError } = await window.supabaseClient
                .from('profiles')
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.email.split('@')[0],
                    subscription_tier: 'free'
                }])
                .select()
                .single();
            
            if (createError) {
                console.error('❌ Error creating profile:', createError);
                throw new Error('Failed to create profile: ' + createError.message);
            }
            
            profile = newProfile;
            if (DEBUG) console.log('Profile created:', profile);
        }
        
        // Prepare data
        const currencyInput = document.getElementById('currencySelect');
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
        const selectedIcon = document.querySelector('.icon-option.selected')?.dataset.icon;

        const currencyAliases = {
            'FT': 'HUF',
            'FORINT': 'HUF',
            'HUF': 'HUF',
            '€': 'EUR',
            'EUR': 'EUR',
            '$': 'USD',
            'USD': 'USD',
            '£': 'GBP',
            'GBP': 'GBP',
            '¥': 'JPY',
            'JPY': 'JPY'
        };

        const canonicalizeCurrency = (value) => {
            const raw = (value || '').toString().trim().toUpperCase();
            const compact = raw.replace(/\s+/g, '');

            if (currencyAliases[compact]) {
                return currencyAliases[compact];
            }

            const iso = compact.replace(/[^A-Z]/g, '');
            if (/^[A-Z]{3}$/.test(iso)) {
                return iso;
            }

            return null;
        };

        const currency = canonicalizeCurrency(currencyInput ? currencyInput.value : 'USD');
        if (!currency) {
            showAlert('Currency must be a valid ISO 4217 code (e.g., USD, EUR, HUF).\nTip: you can type "Ft" and it will be saved as HUF.', { iconType: 'warning' });
            return;
        }

        try {
            new Intl.NumberFormat('en', { style: 'currency', currency }).format(0);
        } catch (err) {
            showAlert('Invalid currency code. Please use a valid ISO 4217 code (e.g., USD, EUR, HUF).', { iconType: 'warning' });
            return;
        }

        if (currencyInput) {
            currencyInput.value = currency;
            currencyInput.dataset.originalCurrency = currencyInput.dataset.originalCurrency || currency;
        }

        const color = selectedColor || currentCashBoxData?.color || '#059669';
        const icon = normalizeIconForStorage(selectedIcon || currentCashBoxData?.icon || 'building');

        const safeText = (v) => {
            const s = String(v || '').trim();
            return s ? s : null;
        };

        const idPrefixInput = document.getElementById('idPrefixInput');
        const idPrefix = String(idPrefixInput?.value || '').trim() || 'SN';

        const getToggleBool = (field, fallback) => {
            const el = document.querySelector(`.toggle-list input[type="checkbox"][data-field="${field}"]`);
            if (!el) return fallback;
            return Boolean(el.checked);
        };

        // Cash box logo from Pro Options
        const cbLogoValue = typeof window.getCashBoxLogo === 'function' ? window.getCashBoxLogo() : undefined;

        const updatePayload = {
            name,
            currency,
            color,
            icon,
            id_prefix: idPrefix,
            receipt_show_logo: getToggleBool('logo', true),
            receipt_show_addresses: getToggleBool('addresses', true),
            receipt_show_tracking: getToggleBool('tracking', true),
            receipt_show_additional: getToggleBool('additional', false),
            receipt_show_note: getToggleBool('note', false),
            receipt_show_signatures: getToggleBool('signatures', true),
            cash_box_logo_url: cbLogoValue || null,
            receipt_title: safeText(document.getElementById('receiptTitle')?.value),
            receipt_total_label: safeText(document.getElementById('totalLabel')?.value),
            receipt_from_label: safeText(document.getElementById('fromLabel')?.value),
            receipt_to_label: safeText(document.getElementById('toLabel')?.value),
            receipt_description_label: safeText(document.getElementById('descriptionLabel')?.value),
            receipt_amount_label: safeText(document.getElementById('amountLabel')?.value),
            receipt_issued_by_label: safeText(document.getElementById('issuedByLabel')?.value),
            receipt_received_by_label: safeText(document.getElementById('receivedByLabel')?.value),
            receipt_footer_note: safeText(document.getElementById('footerNote')?.value)
        };

        const stripReceiptLabelFields = (payload) => {
            const next = { ...payload };
            delete next.receipt_title;
            delete next.receipt_total_label;
            delete next.receipt_from_label;
            delete next.receipt_to_label;
            delete next.receipt_description_label;
            delete next.receipt_amount_label;
            delete next.receipt_issued_by_label;
            delete next.receipt_received_by_label;
            delete next.receipt_footer_note;
            return next;
        };

        const stripCashBoxLogoField = (payload) => {
            const next = { ...payload };
            delete next.cash_box_logo_url;
            return next;
        };

        const stripReceiptVisibilityFields = (payload) => {
            const next = { ...payload };
            delete next.receipt_show_logo;
            delete next.receipt_show_addresses;
            delete next.receipt_show_tracking;
            delete next.receipt_show_additional;
            delete next.receipt_show_note;
            delete next.receipt_show_signatures;
            return next;
        };

        const buildCompatiblePayload = (payload) => {
            let next = { ...payload };
            if (!supportsReceiptLabels) {
                next = stripReceiptLabelFields(next);
            }
            if (!supportsCashBoxLogo) {
                next = stripCashBoxLogoField(next);
            }
            if (!supportsReceiptVisibility) {
                next = stripReceiptVisibilityFields(next);
            }
            return next;
        };

        const safeUpdatePayload = buildCompatiblePayload(updatePayload);

        const createPayload = {
            ...safeUpdatePayload,
            current_balance: 0,
            user_id: user.id
        };
        
        if (DEBUG) console.log('Form data:', isEditMode ? updatePayload : createPayload);
        
        // Show loading state
        const saveBtn = e.target;
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        if (isEditMode) {
            // Update existing cash box
            let updateResult = await db.cashBoxes.update(currentCashBoxId, safeUpdatePayload);
            if (updateResult && updateResult.success === false) {
                const msg = String(updateResult.error || '').toLowerCase();
                if (msg.includes('cash_box_logo_url')) {
                    supportsCashBoxLogo = false;
                }
                if (msg.includes('receipt_show_')) {
                    supportsReceiptVisibility = false;
                }
                if (msg.includes('receipt_')) {
                    supportsReceiptLabels = false;
                }
                if (msg.includes('schema cache') || msg.includes('column') || msg.includes('receipt_') || msg.includes('cash_box_logo_url') || msg.includes('receipt_show_')) {
                    updateResult = await db.cashBoxes.update(currentCashBoxId, buildCompatiblePayload(updatePayload));
                }
            }
            if (DEBUG) console.log('Update result:', updateResult);
            if (updateResult && updateResult.success === false) {
                throw new Error(updateResult.error || 'Failed to update cash box');
            }

            // If the edited cash box is currently selected, update saved theme
            if (localStorage.getItem('activeCashBoxId') === currentCashBoxId) {
                const rgb = (() => {
                    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                    return m ? `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}` : '5, 150, 105';
                })();
                localStorage.setItem('activeCashBoxColor', color);
                localStorage.setItem('activeCashBoxRgb', rgb);
            }

            if (DEBUG) console.log('Cash box updated:', updatePayload.name);
            await showAlert('Cash box updated successfully!', { iconType: 'success' });
        } else {
            // Create new cash box
            let createResult;
            const [maxSortOrder] = await Promise.all([
                db.cashBoxes.getMaxSortOrder()
            ]);
            createResult = await db.cashBoxes.create(createPayload);
            if (createResult && createResult.success === false) {
                const msg = String(createResult.error || '').toLowerCase();
                if (msg.includes('cash_box_logo_url')) {
                    supportsCashBoxLogo = false;
                }
                if (msg.includes('receipt_show_')) {
                    supportsReceiptVisibility = false;
                }
                if (msg.includes('receipt_')) {
                    supportsReceiptLabels = false;
                }
                if (msg.includes('schema cache') || msg.includes('column') || msg.includes('receipt_') || msg.includes('cash_box_logo_url') || msg.includes('receipt_show_')) {
                    createResult = await db.cashBoxes.create({
                        ...buildCompatiblePayload(updatePayload),
                        current_balance: 0,
                        user_id: user.id
                    });
                }
            }
            const result = createResult;
            const nextSortOrder = Number(maxSortOrder || 0) + 1;
            if (DEBUG) console.log('Create result:', result);
            
            if (result.success === false) {
                throw new Error(result.error || 'Failed to create cash box');
            }

            const createdId = result?.data?.id;
            if (createdId) {
                const orderResult = await db.cashBoxes.update(createdId, { sort_order: nextSortOrder });
                if (orderResult && orderResult.success === false) {
                    console.warn('⚠️ Could not set sort_order for new cash box:', orderResult.error);
                }
            }
            
            if (DEBUG) console.log('Cash box created:', createPayload.name);
            await showAlert('Cash box created successfully!', { iconType: 'success' });
        }
        
        // Redirect back to where we came from with hard refresh
        const referrer = document.referrer;
        if (referrer && referrer.includes('dashboard.html')) {
            window.location.replace('dashboard.html');
        } else if (referrer && referrer.includes('spendnote-cash-box-list.html')) {
            window.location.replace('spendnote-cash-box-list.html');
        } else {
            // Default to cash box list if no referrer
            window.location.replace('spendnote-cash-box-list.html');
        }
        
    } catch (error) {
        console.error('❌ Error saving cash box:', error);
        showAlert('Error saving cash box: ' + error.message, { iconType: 'error' });
        
        // Restore button state
        const saveBtn = e.target;
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCashBoxSettings);
} else {
    initCashBoxSettings();
}
