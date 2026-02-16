// Dashboard Form - Transaction form submission logic
// Extracted from dashboard.html for better code organization

function initTransactionForm() {
    const form = document.getElementById('modalTransactionForm');
    if (!form) return;

    if (form.dataset.txSubmitBound === '1') return;
    form.dataset.txSubmitBound = '1';

    const addressTextarea = document.getElementById('modalContactAddress');
    const ADDRESS_LINE_MAX = 48;

    const enforceAddressConstraints = () => {
        if (!addressTextarea) return;

        let value = String(addressTextarea.value || '');
        value = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        let lines = value.split('\n');
        lines = lines.slice(0, 2).map((line) => String(line || '').slice(0, ADDRESS_LINE_MAX));
        const nextValue = lines.join('\n');

        if (nextValue !== addressTextarea.value) {
            addressTextarea.value = nextValue;
        }

        addressTextarea.classList.toggle('is-two-lines', nextValue.includes('\n'));
    };

    if (addressTextarea) {
        window.__setModalContactAddress = (value) => {
            addressTextarea.value = String(value || '');
            enforceAddressConstraints();
        };

        enforceAddressConstraints();

        addressTextarea.addEventListener('input', enforceAddressConstraints);
        addressTextarea.addEventListener('paste', () => setTimeout(enforceAddressConstraints, 0));
        addressTextarea.addEventListener('keydown', (e) => {
            const value = String(addressTextarea.value || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            const lines = value.split('\n');

            if (e.key === 'Enter') {
                if (lines.length >= 2) {
                    e.preventDefault();
                    return;
                }
                setTimeout(enforceAddressConstraints, 0);
                return;
            }

            // Allow navigation/editing keys
            if (
                e.ctrlKey || e.metaKey || e.altKey ||
                e.key === 'Backspace' || e.key === 'Delete' ||
                e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                e.key === 'Home' || e.key === 'End' ||
                e.key === 'Tab'
            ) {
                return;
            }

            // Block additional typing once current line reaches limit (unless user adds a newline)
            if (e.key && e.key.length === 1) {
                const start = addressTextarea.selectionStart ?? 0;
                const end = addressTextarea.selectionEnd ?? start;

                const before = value.slice(0, start);
                const after = value.slice(end);
                const beforeLineStart = before.lastIndexOf('\n') + 1;
                const beforeLine = before.slice(beforeLineStart);
                const afterLineEndRel = after.indexOf('\n');
                const afterLine = afterLineEndRel === -1 ? after : after.slice(0, afterLineEndRel);

                const currentLineLen = beforeLine.length + afterLine.length;
                const replacingLen = end - start;
                const nextLineLen = currentLineLen - replacingLen + 1;

                if (nextLineLen > ADDRESS_LINE_MAX) {
                    e.preventDefault();
                }
            }
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (window.isModalSubmitting) return;
        
        const actionBtn = e.submitter;
        const action = actionBtn ? actionBtn.value : 'done';
        const wantsReceipt = action === 'done-receipt';

        let preopenedReceiptWindow = null;
        let intendedPdfDownload = false;
        let precreatedPdfIframe = null;

        const triggerHiddenPdfDownload = (url) => {
            try {
                const iframe = precreatedPdfIframe || document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.left = '-10000px';
                iframe.style.top = '0';
                iframe.style.width = '1200px';
                iframe.style.height = '1700px';
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
                iframe.style.border = '0';

                if (!precreatedPdfIframe) {
                    document.body.appendChild(iframe);
                }

                iframe.src = url;

                setTimeout(() => {
                    try {
                        iframe.remove();
                    } catch (_) {
                        // ignore
                    }
                    if (precreatedPdfIframe === iframe) {
                        precreatedPdfIframe = null;
                    }
                }, 30000);
                return true;
            } catch (_) {
                return false;
            }
        };

        if (wantsReceipt) {
            // Write fresh bootstrap session BEFORE opening new tab/iframe
            try {
                if (typeof window.writeBootstrapSession === 'function') {
                    await window.writeBootstrapSession();
                }
            } catch (_) {}

            let intendedFormat = 'a4';
            try {
                const cbId = String(document.getElementById('modalCashBoxId')?.value || '').trim();
                if (cbId) {
                    const key = `spendnote.cashBox.${cbId}.defaultReceiptFormat.v1`;
                    const stored = String(localStorage.getItem(key) || '').trim().toLowerCase();
                    if (stored === 'a4' || stored === 'pdf') {
                        intendedFormat = stored;
                    }
                }
            } catch (_) {
                intendedFormat = 'a4';
            }

            intendedPdfDownload = intendedFormat === 'pdf';
            if (intendedPdfDownload) {
                try {
                    precreatedPdfIframe = document.createElement('iframe');
                    precreatedPdfIframe.style.position = 'fixed';
                    precreatedPdfIframe.style.left = '-10000px';
                    precreatedPdfIframe.style.top = '0';
                    precreatedPdfIframe.style.width = '1200px';
                    precreatedPdfIframe.style.height = '1700px';
                    precreatedPdfIframe.style.opacity = '0';
                    precreatedPdfIframe.style.pointerEvents = 'none';
                    precreatedPdfIframe.style.border = '0';
                    precreatedPdfIframe.src = 'about:blank';
                    document.body.appendChild(precreatedPdfIframe);
                } catch (_) {
                    precreatedPdfIframe = null;
                }
            } else {
                preopenedReceiptWindow = window.open('about:blank', '_blank');
            }
        }

        const closeReceiptWindow = () => {
            try {
                if (preopenedReceiptWindow && !preopenedReceiptWindow.closed) {
                    preopenedReceiptWindow.close();
                }
            } catch (_) {
                // ignore
            }
            try {
                if (precreatedPdfIframe) {
                    precreatedPdfIframe.remove();
                    precreatedPdfIframe = null;
                }
            } catch (_) {
                // ignore
            }
        };
        const container = document.getElementById('createTransactionModalContainer');
        const mode = container && container.dataset.mode === 'detailed' ? 'detailed' : 'quick';

        const formData = {
            cashBox: document.getElementById('modalCashBoxId')?.value || '',
            loggedBy: document.querySelector('.user-name')?.textContent || 'John',
            ContactName: document.getElementById('modalContactName')?.value || '',
            ContactAddress: document.getElementById('modalContactAddress')?.value || '',
            direction: document.querySelector('input[name="modalDirection"]:checked')?.value || 'in',
            amount: document.getElementById('modalAmount')?.value || '',
            date: document.getElementById('modalDate')?.value || new Date().toISOString().slice(0, 10),
            transactionId: document.getElementById('modalTransactionId')?.value || '',
            note: mode === 'detailed' ? (document.getElementById('modalNote')?.value || '') : '',
            lineItems: []
        };

        // Collect line items in detailed mode
        if (mode === 'detailed') {
            document.querySelectorAll('#modalLineItemsContainer .form-row-line-item').forEach(function(row) {
                const descEl = row.querySelector('[data-item-index]');
                const amtEl = row.querySelector('.line-item-amount') || row.querySelector('[data-amount-index]');
                const desc = descEl ? descEl.value : '';
                const amt = amtEl ? amtEl.value : '';
                const parsedAmt = window.parseModalAmount ? window.parseModalAmount(amt) : parseFloat(amt) || 0;
                if (String(desc || '').trim() || parsedAmt > 0) {
                    formData.lineItems.push({ description: String(desc || '').trim(), amount: parsedAmt });
                }
            });
        }

        const submitContainer = (e && e.currentTarget) ? e.currentTarget : form;
        const submitButtons = submitContainer ? Array.from(submitContainer.querySelectorAll('button[type="submit"]')) : [];
        submitButtons.forEach(function(btn) {
            if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
            btn.disabled = true;
        });

        if (actionBtn) {
            if (!actionBtn.dataset.originalHtml) actionBtn.dataset.originalHtml = actionBtn.innerHTML;
            actionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }

        if (typeof window.setModalSubmittingState === 'function') {
            window.setModalSubmittingState(true);
        }

        try {
            if (!window.auth || !window.db || !window.supabaseClient) {
                closeReceiptWindow();
                window.location.href = '/spendnote-login.html';
                return;
            }

            const DEBUG = Boolean(window.SpendNoteDebug);

            const user = await window.auth.getCurrentUser();
            if (!user) {
                closeReceiptWindow();
                window.location.href = '/spendnote-login.html';
                return;
            }

            const isUuid = function(value) {
                try {
                    if (window.SpendNoteIds && typeof window.SpendNoteIds.isUuid === 'function') {
                        return window.SpendNoteIds.isUuid(value);
                    }
                } catch (_) {

                }
                return false;
            };

            if (!isUuid(formData.cashBox)) {
                closeReceiptWindow();
                showAlert('Please create and select a Cash Box first.', { iconType: 'warning' });
                return;
            }

            const parseAmount = window.parseModalAmount || function(v) { return parseFloat(String(v || '').replace(/,/g, '.')) || 0; };
            const amountValue = parseAmount(formData.amount);
            
            if (!Number.isFinite(amountValue) || amountValue <= 0) {
                closeReceiptWindow();
                showAlert('Please enter a valid amount.', { iconType: 'warning' });
                return;
            }

            const description = (document.getElementById('modalDescription')?.value || '').trim();
            if (!description) {
                closeReceiptWindow();
                showAlert('Description is required.', { iconType: 'warning' });
                return;
            }

            const contactName = String(formData.ContactName || '').trim();
            if (!contactName) {
                closeReceiptWindow();
                showAlert('Contact Name is required.', { iconType: 'warning' });
                return;
            }
            let contactOtherId = String(document.getElementById('modalContactCompanyId')?.value || '').trim() || null;

            const dateCandidate = String(formData.date || '').trim();
            const transactionDate = /^\d{4}-\d{2}-\d{2}$/.test(dateCandidate)
                ? dateCandidate
                : new Date().toISOString().slice(0, 10);

            // Get or create profile
            let profile = null;
            try {
                profile = await window.db.profiles.getCurrent();
            } catch (err) {
                profile = null;
            }

            if (!profile) {
                const fallbackName = user.user_metadata?.full_name || user.email || 'User';
                const { data: createdProfile, error: profileError } = await window.supabaseClient
                    .from('profiles')
                    .insert([{ id: user.id, email: user.email, full_name: fallbackName }])
                    .select()
                    .single();
                if (!profileError) profile = createdProfile;
            }

            // Calculate final amount
            const extrasTotal = (formData.lineItems || []).reduce(function(sum, item) {
                return sum + (parseFloat(item.amount) || 0);
            }, 0);
            const finalAmount = amountValue + extrasTotal;

            const persistedLineItems = [
                { description: description, amount: amountValue }
            ].concat(formData.lineItems || []);

            const payload = {
                user_id: user.id,
                cash_box_id: document.getElementById('modalCashBoxId')?.value || null,
                type: formData.direction === 'out' ? 'expense' : 'income',
                amount: finalAmount,
                description: description || null,
                notes: String(formData.note || '').trim() || null,
                transaction_date: transactionDate,
                receipt_number: String(formData.transactionId || '').trim() || null,
                line_items: persistedLineItems,
                contact_id: null,
                contact_name: contactName,
                contact_email: null,
                contact_phone: null,
                contact_address: String(formData.ContactAddress || '').trim() || null,
                contact_custom_field_1: contactOtherId,
                created_by_user_id: user.id,
                created_by_user_name: profile?.full_name || user.user_metadata?.full_name || user.email || null
            };

            // If user selected a contact from autocomplete, link by UUID.
            try {
                const selectedIdRaw = String(document.getElementById('modalContactId')?.value || '').trim();
                if (isUuid(selectedIdRaw)) {
                    payload.contact_id = selectedIdRaw;
                }
            } catch (_) {
                // ignore
            }

            // If contact is linked and user didn't type an Other ID, pull from saved contact.
            if (payload.contact_id && !contactOtherId && window.db?.contacts?.getById) {
                try {
                    const saved = await window.db.contacts.getById(payload.contact_id);
                    const fromSaved = String(saved?.phone || '').trim();
                    if (fromSaved) {
                        contactOtherId = fromSaved;
                        payload.contact_custom_field_1 = fromSaved;
                        const otherIdEl = document.getElementById('modalContactCompanyId');
                        if (otherIdEl && !String(otherIdEl.value || '').trim()) {
                            otherIdEl.value = fromSaved;
                        }
                    }
                } catch (_) {
                    // ignore
                }
            }

            if (payload.type === 'expense') {
                const cb = payload.cash_box_id && window.db?.cashBoxes?.getById
                    ? await window.db.cashBoxes.getById(payload.cash_box_id)
                    : null;
                const currentBalance = Number(cb?.current_balance);
                const balance = Number.isFinite(currentBalance) ? currentBalance : 0;
                if (finalAmount > balance) {
                    closeReceiptWindow();
                    showAlert('Not enough funds in this Cash Box.', { iconType: 'error' });
                    return;
                }
            }

            // Try to find existing contact by name to link the transaction
            if (!payload.contact_id && contactName) {
                try {
                    const nameKey = String(contactName || '').trim().toLowerCase();
                    const cached = window.__spendnoteContactsByName && typeof window.__spendnoteContactsByName.get === 'function'
                        ? window.__spendnoteContactsByName.get(nameKey)
                        : '';
                    if (cached) {
                        payload.contact_id = String(cached);
                    } else if (window.supabaseClient && user && user.id) {
                        const lookup = await window.supabaseClient
                            .from('contacts')
                            .select('id')
                            .eq('user_id', user.id)
                            .ilike('name', String(contactName))
                            .limit(1);
                        const row = Array.isArray(lookup?.data) ? lookup.data[0] : null;
                        const id = String(row?.id || '').trim();
                        if (id) {
                            payload.contact_id = id;
                        }
                    }
                } catch (e) {
                    if (DEBUG) console.warn('[TxSave] Could not lookup contact:', e);
                }
            }

            // Ensure contact exists (create new if Save to Contacts is checked)
            let ensuredContact = null;
            const shouldSaveContact = Boolean(document.getElementById('modalSaveContact')?.checked);
            if (!payload.contact_id && shouldSaveContact && window.db?.contacts?.getOrCreate && typeof window.db.contacts.getOrCreate === 'function') {
                ensuredContact = await window.db.contacts.getOrCreate({
                    name: contactName,
                    address: payload.contact_address,
                    phone: contactOtherId
                });
            } else if (!payload.contact_id && shouldSaveContact && window.db?.contacts?.create && typeof window.db.contacts.create === 'function') {
                ensuredContact = await window.db.contacts.create({
                    user_id: user.id,
                    name: contactName,
                    address: payload.contact_address,
                    phone: contactOtherId
                });
            }

            if (shouldSaveContact && ensuredContact && ensuredContact.success === false) {
                closeReceiptWindow();
                showAlert(ensuredContact?.error || 'Could not save contact. Please try again.', { iconType: 'error' });
                return;
            }

            // Create transaction
            if (DEBUG) console.log('[TxSave] Creating transaction with payload:', payload);
            const result = await window.db.transactions.create(payload);
            if (DEBUG) console.log('[TxSave] Result:', result);
            
            // Verification: immediately check if transaction exists
            if (DEBUG && result && result.success && result.data && result.data.id) {
                const verifyId = result.data.id;
                console.log('[TxSave] Verifying transaction exists with ID:', verifyId);
                const verify = await window.db.transactions.getById(verifyId);
                console.log('[TxSave] Verification result:', verify);
                if (!verify) {
                    console.error('[TxSave] CRITICAL: Transaction returned success but does NOT exist in database!');
                }
            }
            
            if (!result || !result.success) {
                closeReceiptWindow();
                const raw = String(result?.error || '').trim();
                const lower = raw.toLowerCase();
                let msg = raw || 'Failed to create transaction.';
                if (raw === 'INSUFFICIENT_BALANCE' || lower.includes('insufficient_balance')) {
                    msg = 'Not enough funds in this Cash Box.';
                } else
                if (lower.includes('permission denied') || lower.includes('row level security') || lower.includes('rls')) {
                    msg = 'Permission denied (RLS). Please log out and log in again. If the problem persists, your profile row may be missing.';
                } else if (lower.includes('foreign key') && (lower.includes('profiles') || lower.includes('user_id'))) {
                    msg = 'Could not save: profile not found for this user. Please log out and log in again.';
                } else if (lower.includes('jwt') || lower.includes('session')) {
                    msg = 'Your session expired. Please log in again.';
                }
                showAlert(msg, { iconType: 'error' });
                return;
            }

            const createdId = result?.data?.id;

            const addAnother = Boolean(document.getElementById('modalAddAnother')?.checked);

            // Reload dashboard data
            if (typeof loadDashboardData === 'function') {
                await loadDashboardData();
            }

            // Handle print receipt action
            if (action === 'done-receipt') {
                const buildReceiptUrl = async () => {
                    const baseUrls = {
                        a4: 'spendnote-receipt-a4-two-copies.html',
                        pdf: 'spendnote-pdf-receipt.html',
                        email: 'spendnote-email-receipt.html'
                    };

                    const params = new URLSearchParams();
                    params.set('v', 'print-20260216-2248');
                    if (createdId) params.set('txId', createdId);
                    params.set('bootstrap', '1');

                    params.set('itemsMode', mode === 'quick' ? 'single' : 'full');
                    params.set('recordedBy', '0');

                    let format = 'a4';
                    try {
                        const cbId = String(payload.cash_box_id || '').trim();
                        if (cbId) {
                            const key = `spendnote.cashBox.${cbId}.defaultReceiptFormat.v1`;
                            const stored = String(localStorage.getItem(key) || '').trim().toLowerCase();
                            if (stored === 'a4' || stored === 'pdf') {
                                format = stored;
                            }
                        }
                    } catch (_) {
                        format = 'a4';
                    }

                    if (format === 'a4') {
                        params.set('autoPrint', '1');
                        try {
                            params.set('returnTo', window.location.href);
                        } catch (_) {

                        }
                    }

                    if (format === 'pdf') {
                        params.set('download', '1');
                    }

                    let cb = null;
                    try {
                        cb = createdId && payload.cash_box_id && window.db?.cashBoxes?.getById
                            ? await window.db.cashBoxes.getById(payload.cash_box_id)
                            : null;
                    } catch (_) {
                        cb = null;
                    }

                    const readStoredObject = (key) => {
                        try {
                            if (!key) return null;
                            const raw = localStorage.getItem(key);
                            if (!raw) return null;
                            const parsed = JSON.parse(raw);
                            return parsed && typeof parsed === 'object' ? parsed : null;
                        } catch (_) {
                            return null;
                        }
                    };

                    const cbIdForDefaults = String(payload.cash_box_id || '').trim();
                    const storedVisibility = cbIdForDefaults
                        ? (readStoredObject(`spendnote.cashBox.${cbIdForDefaults}.receiptVisibility.v1`) || {})
                        : {};
                    const storedReceiptText = cbIdForDefaults
                        ? (readStoredObject(`spendnote.cashBox.${cbIdForDefaults}.receiptText.v1`) || {})
                        : {};
                    const storedLogoSettings = cbIdForDefaults
                        ? (readStoredObject(`spendnote.cashBox.${cbIdForDefaults}.logoSettings.v1`) || null)
                        : null;
                    const storedPrefix = (() => {
                        if (!cbIdForDefaults) return '';
                        try {
                            return String(localStorage.getItem(`spendnote.cashBox.${cbIdForDefaults}.idPrefix.v1`) || '').trim().toUpperCase();
                        } catch (_) {
                            return '';
                        }
                    })();

                    const normalizePrefix = (value) => {
                        const raw = String(value || '').trim().toUpperCase();
                        if (!raw) return '';
                        return raw === 'REC-' ? 'SN' : raw;
                    };

                    const yn = (value, fallback) => {
                        if (value === true) return '1';
                        if (value === false) return '0';
                        return fallback;
                    };

                    const resolveVisibility = (field, dbValue, fallbackBool) => {
                        if (typeof dbValue === 'boolean') return dbValue;
                        const stored = storedVisibility?.[field];
                        if (typeof stored === 'boolean') return stored;
                        if (stored === '1' || stored === 1 || String(stored).toLowerCase() === 'true') return true;
                        if (stored === '0' || stored === 0 || String(stored).toLowerCase() === 'false') return false;
                        return fallbackBool;
                    };

                    const resolveText = (dbValue, storageField) => {
                        const fromDb = String(dbValue || '').trim();
                        if (fromDb) return fromDb;
                        return String(storedReceiptText?.[storageField] || '').trim();
                    };

                    params.set('logo', yn(resolveVisibility('logo', cb?.receipt_show_logo, true), '1'));
                    params.set('addresses', yn(resolveVisibility('addresses', cb?.receipt_show_addresses, true), '1'));
                    params.set('tracking', yn(resolveVisibility('tracking', cb?.receipt_show_tracking, true), '1'));
                    params.set('additional', yn(resolveVisibility('additional', cb?.receipt_show_additional, false), '0'));
                    params.set('note', yn(resolveVisibility('note', cb?.receipt_show_note, false), '0'));
                    params.set('signatures', yn(resolveVisibility('signatures', cb?.receipt_show_signatures, true), '1'));

                    const resolvedIdPrefix = normalizePrefix(cb?.id_prefix || storedPrefix || '');
                    if (resolvedIdPrefix) {
                        params.set('idPrefix', resolvedIdPrefix);
                    }

                    const receiptTitle = resolveText(cb?.receipt_title, 'receiptTitle');
                    const totalLabel = resolveText(cb?.receipt_total_label, 'totalLabel');
                    const fromLabel = resolveText(cb?.receipt_from_label, 'fromLabel');
                    const toLabel = resolveText(cb?.receipt_to_label, 'toLabel');
                    const descriptionLabel = resolveText(cb?.receipt_description_label, 'descriptionLabel');
                    const amountLabel = resolveText(cb?.receipt_amount_label, 'amountLabel');
                    const issuedByLabel = resolveText(cb?.receipt_issued_by_label, 'issuedByLabel');
                    const receivedByLabel = resolveText(cb?.receipt_received_by_label, 'receivedByLabel');
                    const footerNote = resolveText(cb?.receipt_footer_note, 'footerNote');

                    if (receiptTitle) params.set('receiptTitle', receiptTitle);
                    if (totalLabel) params.set('totalLabel', totalLabel);
                    if (fromLabel) params.set('fromLabel', fromLabel);
                    if (toLabel) params.set('toLabel', toLabel);
                    if (descriptionLabel) params.set('descriptionLabel', descriptionLabel);
                    if (amountLabel) params.set('amountLabel', amountLabel);
                    if (issuedByLabel) params.set('issuedByLabel', issuedByLabel);
                    if (receivedByLabel) params.set('receivedByLabel', receivedByLabel);
                    if (footerNote) params.set('footerNote', footerNote);

                    try {
                        const cbLogo = String(cb?.cash_box_logo_url || '').trim();
                        if (cbLogo) {
                            const cbKey = `spendnote.cbLogo.${cbIdForDefaults || 'temp'}`;
                            try { localStorage.setItem(cbKey, cbLogo); } catch (_) {}
                            params.set('logoKey', cbKey);
                        } else {
                            const storedLogo = localStorage.getItem('spendnote.proLogoDataUrl') || '';
                            if (storedLogo) {
                                params.set('logoKey', 'spendnote.proLogoDataUrl');
                            }
                        }
                    } catch (_) {
                        // ignore
                    }

                    try {
                        const parseFinite = (value) => {
                            const n = Number(value);
                            return Number.isFinite(n) ? n : null;
                        };

                        const cbScale = parseFinite(storedLogoSettings?.scale);
                        const cbX = parseFinite(storedLogoSettings?.x);
                        const cbY = parseFinite(storedLogoSettings?.y);

                        if (cbScale !== null && cbScale > 0) {
                            params.set('logoScale', String(cbScale));
                        } else {
                            const storedScale = parseFloat(localStorage.getItem('spendnote.receipt.logoScale.v1') || '1');
                            if (Number.isFinite(storedScale) && storedScale > 0) {
                                params.set('logoScale', String(storedScale));
                            }
                        }

                        if (cbX !== null) {
                            params.set('logoX', String(cbX));
                        }
                        if (cbY !== null) {
                            params.set('logoY', String(cbY));
                        }

                        if (cbX === null || cbY === null) {
                            try {
                                const storedPosRaw = localStorage.getItem('spendnote.receipt.logoPosition.v1');
                                if (storedPosRaw) {
                                    const p = JSON.parse(storedPosRaw);
                                    if (cbX === null && Number.isFinite(Number(p?.x))) {
                                        params.set('logoX', String(Number(p.x)));
                                    }
                                    if (cbY === null && Number.isFinite(Number(p?.y))) {
                                        params.set('logoY', String(Number(p.y)));
                                    }
                                }
                            } catch (_) {
                                // ignore
                            }
                        }
                    } catch (_) {}

                    try {
                        const storedAlign = String(localStorage.getItem('spendnote.receipt.logoAlign.v1') || '').trim().toLowerCase();
                        if (storedAlign === 'left' || storedAlign === 'center' || storedAlign === 'right') {
                            params.set('logoAlign', storedAlign);
                        }
                    } catch (_) {}

                    const baseUrl = baseUrls[format] || baseUrls.a4;
                    return {
                        url: `${baseUrl}?${params.toString()}`,
                        format
                    };
                };

                const receipt = await buildReceiptUrl();
                const url = receipt?.url;
                const finalFormat = receipt?.format || 'a4';

                if (finalFormat === 'pdf') {
                    const ok = triggerHiddenPdfDownload(url);
                    if (!ok) {
                        const opened = window.open(url, '_blank');
                        if (!opened) {
                            showAlert('Popup blocked. Please allow popups to download PDFs.', { iconType: 'warning' });
                        }
                    }
                } else {
                    if (preopenedReceiptWindow && !preopenedReceiptWindow.closed) {
                        preopenedReceiptWindow.location.href = url;
                    } else {
                        const opened = window.open(url, '_blank');
                        if (!opened) {
                            showAlert('Popup blocked. Please allow popups to print receipts.', { iconType: 'warning' });
                        }
                    }
                }

                if (typeof window.closeModal === 'function') window.closeModal();
                return;
            }

            // Handle "add another" option
            if (addAnother) {
                ['modalAmount', 'modalDescription', 'modalTransactionId', 'modalNote'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.value = '';
                });

                if (typeof window.setDetailedItemsExpanded === 'function') {
                    window.setDetailedItemsExpanded(false);
                }
                
                var noteSection = document.getElementById('modalNoteSection');
                if (noteSection) noteSection.open = false;

                ['modalTransactionIdGroup', 'modalNoteGroup'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });

                var lineItemsContainer = document.getElementById('modalLineItemsContainer');
                if (lineItemsContainer) {
                    lineItemsContainer.innerHTML = '';
                    if (typeof window.updateLineItemsTotal === 'function') window.updateLineItemsTotal();
                }

                var checkedDir = document.querySelector('input[name="modalDirection"]:checked');
                var focusId = checkedDir ? checkedDir.id : 'modalDirectionIn';
                var modalContainer = document.getElementById('createTransactionModalContainer');
                var focusLabel = modalContainer ? modalContainer.querySelector('label[for="' + focusId + '"]') : null;
                if (focusLabel && typeof focusLabel.focus === 'function') {
                    focusLabel.focus();
                } else if (checkedDir && typeof checkedDir.focus === 'function') {
                    checkedDir.focus();
                }
                return;
            }

            // Close modal
            if (typeof window.closeModal === 'function') window.closeModal();
        } catch (error) {
            console.error('Transaction submit failed:', error);
            showAlert(error?.message || 'Failed to create transaction.', { iconType: 'error' });
        } finally {
            submitButtons.forEach(function(btn) {
                btn.disabled = false;
                if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
            });
            if (typeof window.setModalSubmittingState === 'function') {
                window.setModalSubmittingState(false);
            }
        }
    });

}

window.initTransactionForm = initTransactionForm;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTransactionForm);
} else {
    initTransactionForm();
}
