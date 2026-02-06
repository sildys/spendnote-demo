const QUICK_PRESET = {
        logo: '1',
        addresses: '1',
        tracking: '1',
        additional: '0',
        note: '0',
        signatures: '1'
    };

    let receiptMode = 'quick';
    let displayOptions = { ...QUICK_PRESET };
    let currentFormat = 'a4';
    let currentZoom = 0.6;

    let receiptText = {
        receiptTitle: '',
        totalLabel: '',
        fromLabel: '',
        toLabel: '',
        descriptionLabel: '',
        amountLabel: '',
        notesLabel: '',
        issuedByLabel: '',
        receivedByLabel: '',
        footerNote: ''
    };

    let receiptLogoUrl = '';
    const RECEIPT_LOGO_KEY = 'spendnote.proLogoDataUrl';
    const RECEIPT_MODE_KEY = 'spendnote.receiptMode';

    let lastReceiptUrl = '';
    let reloadTimer = null;
    let hasInitializedFromTxData = false;
    let currentTxIsVoided = false;
    let overrideContactAddress = '';
    let currentCashBoxId = '';

    const txId = new URLSearchParams(window.location.search).get('id');

    function buildReceiptUrl(format, extraParams) {
        const baseUrls = {
            'a4': 'spendnote-receipt-a4-two-copies.html',
            'pdf': 'spendnote-pdf-receipt.html',
            'email': 'spendnote-email-receipt.html'
        };
        const params = new URLSearchParams();
        params.append('v', 'receipt-20260206-03');
        if (txId) params.append('txId', txId);

        const addrOverride = String(overrideContactAddress || '').trim();
        if (addrOverride) {
            params.append('overrideContactAddress', addrOverride);
        }

        if (currentTxIsVoided) {
            params.append('void', '1');
        }
        for (const [key, value] of Object.entries(displayOptions)) {
            params.append(key, value);
        }

        params.append('itemsMode', receiptMode === 'quick' ? 'single' : 'full');
        params.append('recordedBy', '0');

        for (const [key, value] of Object.entries(receiptText)) {
            const v = String(value || '').trim();
            if (v) params.append(key, v);
        }

        let storedLogo = '';
        try { storedLogo = localStorage.getItem(RECEIPT_LOGO_KEY) || ''; } catch (_) {}
        if (storedLogo) {
            params.append('logoKey', RECEIPT_LOGO_KEY);
        } else if (receiptLogoUrl) {
            params.append('logoUrl', receiptLogoUrl);
        }

        if (extraParams && typeof extraParams === 'object') {
            for (const [key, value] of Object.entries(extraParams)) {
                const v = String(value ?? '').trim();
                if (v) params.append(key, v);
            }
        }

        return `${baseUrls[format]}?${params.toString()}`;
    }

    function getCashBoxDefaultReceiptFormat() {
        const cbId = String(currentCashBoxId || '').trim();
        if (!cbId) return '';
        try {
            const key = `spendnote.cashBox.${cbId}.defaultReceiptFormat.v1`;
            const stored = String(localStorage.getItem(key) || '').trim().toLowerCase();
            if (stored === 'a4' || stored === 'pdf' || stored === 'email') {
                return stored;
            }
        } catch (_) {
            return '';
        }
        return '';
    }

    function applyReceiptUrlIfChanged(nextUrl) {
        const url = String(nextUrl || '');
        if (!url || url === lastReceiptUrl) return;
        lastReceiptUrl = url;
        const iframe = document.getElementById('receiptFrame');
        if (iframe) iframe.src = url;
    }

    function requestReload(delayMs) {
        const delay = Number.isFinite(Number(delayMs)) ? Math.max(0, Number(delayMs)) : 0;
        if (reloadTimer) {
            clearTimeout(reloadTimer);
            reloadTimer = null;
        }

        reloadTimer = setTimeout(() => {
            reloadTimer = null;
            applyReceiptUrlIfChanged(buildReceiptUrl(currentFormat));
        }, delay);
    }

    function applyReceiptMode(mode) {
        const m = mode === 'detailed' ? 'detailed' : 'quick';
        receiptMode = m;
        try { localStorage.setItem(RECEIPT_MODE_KEY, m); } catch (e) {}

        const quickSummary = document.getElementById('receiptQuickSummary');
        const detailedToggles = document.getElementById('receiptDetailedToggles');
        if (quickSummary) quickSummary.style.display = m === 'quick' ? 'block' : 'none';
        if (detailedToggles) detailedToggles.style.display = m === 'detailed' ? 'block' : 'none';

        document.getElementById('receiptModeQuick').checked = m === 'quick';
        document.getElementById('receiptModeDetailed').checked = m === 'detailed';

        if (m === 'quick') {
            displayOptions = { ...QUICK_PRESET };
            document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach(toggle => {
                const field = toggle.dataset.field;
                if (field) toggle.checked = displayOptions[field] === '1';
            });
        } else {
            document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach(toggle => {
                const field = toggle.dataset.field;
                if (field) displayOptions[field] = toggle.checked ? '1' : '0';
            });
        }
        requestReload(0);
    }

    function getStoredReceiptMode() {
        try {
            const v = String(localStorage.getItem(RECEIPT_MODE_KEY) || '').toLowerCase();
            if (v === 'quick' || v === 'detailed') return v;
            return '';
        } catch (_) {
            return '';
        }
    }

    function inferReceiptModeFromOptions(options) {
        const o = options || {};
        const keys = Object.keys(QUICK_PRESET);
        const isQuick = keys.every((k) => String(o[k]) === String(QUICK_PRESET[k]));
        return isQuick ? 'quick' : 'detailed';
    }

    function initReceiptUiFromCashBox(cashBox, profile, tx) {
        const cb = cashBox || {};
        const t = tx || {};
        // Transaction-specific labels override cash box defaults
        receiptText.receiptTitle = t.receipt_title || cb.receipt_title || '';
        receiptText.totalLabel = t.receipt_total_label || cb.receipt_total_label || '';
        receiptText.fromLabel = t.receipt_from_label || cb.receipt_from_label || '';
        receiptText.toLabel = t.receipt_to_label || cb.receipt_to_label || '';
        receiptText.descriptionLabel = t.receipt_description_label || cb.receipt_description_label || '';
        receiptText.amountLabel = t.receipt_amount_label || cb.receipt_amount_label || '';
        receiptText.notesLabel = t.receipt_notes_label || cb.receipt_notes_label || '';
        receiptText.issuedByLabel = t.receipt_issued_by_label || cb.receipt_issued_by_label || '';
        receiptText.receivedByLabel = t.receipt_received_by_label || cb.receipt_received_by_label || '';
        receiptText.footerNote = t.receipt_footer_note || cb.receipt_footer_note || '';

        const titleEl = document.getElementById('txReceiptTitle');
        const totalEl = document.getElementById('txTotalLabel');
        const fromEl = document.getElementById('txFromLabel');
        const toEl = document.getElementById('txToLabel');
        const descEl = document.getElementById('txDescriptionLabel');
        const amtEl = document.getElementById('txAmountLabel');
        const issuedEl = document.getElementById('txIssuedByLabel');
        const receivedEl = document.getElementById('txReceivedByLabel');
        const footerEl = document.getElementById('txFooterNote');

        const defaults = {
            receiptTitle: 'Cash Receipt',
            totalLabel: 'Total handed over',
            fromLabel: 'FROM',
            toLabel: 'TO',
            descriptionLabel: 'Description',
            amountLabel: 'Amount',
            issuedByLabel: 'Issued by',
            receivedByLabel: 'Received by',
            footerNote: ''
        };

        if (titleEl) titleEl.value = receiptText.receiptTitle || defaults.receiptTitle;
        if (totalEl) totalEl.value = receiptText.totalLabel || defaults.totalLabel;
        if (fromEl) fromEl.value = receiptText.fromLabel || defaults.fromLabel;
        if (toEl) toEl.value = receiptText.toLabel || defaults.toLabel;
        if (descEl) descEl.value = receiptText.descriptionLabel || defaults.descriptionLabel;
        if (amtEl) amtEl.value = receiptText.amountLabel || defaults.amountLabel;
        if (issuedEl) issuedEl.value = receiptText.issuedByLabel || defaults.issuedByLabel;
        if (receivedEl) receivedEl.value = receiptText.receivedByLabel || defaults.receivedByLabel;
        if (footerEl) footerEl.value = receiptText.footerNote || defaults.footerNote;

        const bindText = (el, key) => {
            if (!el) return;
            el.addEventListener('input', () => {
                receiptText[key] = el.value;
                requestReload(250);
            });
        };

        bindText(titleEl, 'receiptTitle');
        bindText(totalEl, 'totalLabel');
        bindText(fromEl, 'fromLabel');
        bindText(toEl, 'toLabel');
        bindText(descEl, 'descriptionLabel');
        bindText(amtEl, 'amountLabel');
        bindText(issuedEl, 'issuedByLabel');
        bindText(receivedEl, 'receivedByLabel');
        bindText(footerEl, 'footerNote');

        receiptLogoUrl = String(cb.cash_box_logo_url || profile?.account_logo_url || '').trim();

        const storedLogo = (() => {
            try { return localStorage.getItem(RECEIPT_LOGO_KEY) || ''; } catch (_) { return ''; }
        })();
        const resolvedLogo = storedLogo || receiptLogoUrl;
        if (resolvedLogo) {
            const logoPreview = document.getElementById('txLogoPreview');
            const logoPreviewImg = document.getElementById('txLogoPreviewImg');
            const removeLogoBtn = document.getElementById('txRemoveLogoBtn');
            if (logoPreview && logoPreviewImg && removeLogoBtn) {
                logoPreviewImg.src = resolvedLogo;
                logoPreview.style.display = 'flex';
                removeLogoBtn.style.display = 'inline-flex';
            }
        }

        const mapBool = (v, fallback) => {
            if (typeof v === 'boolean') return v;
            if (v === 1 || v === '1') return true;
            if (v === 0 || v === '0') return false;
            return fallback;
        };

        displayOptions = {
            logo: mapBool(cb.receipt_show_logo, true) ? '1' : '0',
            addresses: mapBool(cb.receipt_show_addresses, true) ? '1' : '0',
            tracking: mapBool(cb.receipt_show_tracking, false) ? '1' : '0',
            additional: mapBool(cb.receipt_show_additional, false) ? '1' : '0',
            note: mapBool(cb.receipt_show_note, false) ? '1' : '0',
            signatures: mapBool(cb.receipt_show_signatures, false) ? '1' : '0'
        };

        document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach(toggle => {
            const field = toggle.dataset.field;
            if (field && displayOptions[field] !== undefined) {
                toggle.checked = displayOptions[field] === '1';
            }
        });

        const storedMode = getStoredReceiptMode();
        const modeToApply = storedMode || inferReceiptModeFromOptions(displayOptions);
        applyReceiptMode(modeToApply);
    }

    window.onTransactionDetailDataLoaded = ({ tx, cashBox, profile }) => {
        hasInitializedFromTxData = true;

        try {
            currentCashBoxId = String(cashBox?.id || tx?.cash_box_id || '').trim();
        } catch (_) {
            currentCashBoxId = '';
        }

        try {
            overrideContactAddress = String(tx?.contact_address || tx?.contact?.address || '').trim();
        } catch (_) {
            overrideContactAddress = '';
        }

        try {
            const isVoided = String(tx?.status || 'active').toLowerCase() === 'voided';
            currentTxIsVoided = isVoided;
            const voidBtn = document.getElementById('txVoidBtn');
            const voidNote = document.getElementById('txVoidNote');
            if (isVoided) {
                if (voidBtn) voidBtn.disabled = true;
                if (voidNote) {
                    const when = tx?.voided_at ? new Date(tx.voided_at) : null;
                    const whenText = when && !Number.isNaN(when.getTime()) ? when.toLocaleString() : '';
                    const who = String(tx?.voided_by_user_name || '').trim();
                    voidNote.textContent = who && whenText ? `Voided by ${who} on ${whenText}` : (whenText ? `Voided on ${whenText}` : 'Voided');
                }
            }
        } catch (_) {
            // ignore void ui sync failures
        }

        initReceiptUiFromCashBox(cashBox, profile, tx);
        requestReload(0);
    };

    function applyIframeZoom(iframe) {
        try {
            const doc = iframe.contentDocument;
            if (!doc) return;
            const de = doc.documentElement;
            const body = doc.body;
            if (!de || !body) return;

            let style = doc.getElementById('txReceiptPreviewOverride');
            if (!style) {
                style = doc.createElement('style');
                style.id = 'txReceiptPreviewOverride';
                style.textContent = `
html, body { height: auto !important; overflow: auto !important; }
.page { height: auto !important; min-height: 0 !important; }
`;
                doc.head && doc.head.appendChild(style);
            }

            de.style.overflow = 'auto';
            body.style.overflow = 'auto';
            body.style.zoom = String(currentZoom);
        } catch (_) {}
    }

    function updateZoom() {
        const iframe = document.getElementById('receiptFrame');
        const zoomLevel = document.getElementById('zoomLevel');
        if (iframe) {
            iframe.style.transform = 'none';
            iframe.style.zoom = '1';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            applyIframeZoom(iframe);
        }
        if (zoomLevel) zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    }

    function scheduleZoomUpdate() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                updateZoom();
            });
        });
    }

    function zoomIn() { currentZoom = Math.min(currentZoom + 0.1, 1.2); scheduleZoomUpdate(); }
    function zoomOut() { currentZoom = Math.max(currentZoom - 0.1, 0.4); scheduleZoomUpdate(); }
    function resetZoom() { currentZoom = 0.6; scheduleZoomUpdate(); }

    function setFormat(format) {
        const f = String(format || '').toLowerCase();
        if (f !== 'a4' && f !== 'pdf' && f !== 'email') return;
        document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.format-btn[data-format="${f}"]`);
        if (btn) btn.classList.add('active');
        currentFormat = f;
        requestReload(0);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const deleteToggle = document.getElementById('txDeleteToggle');
        const duplicateBtn = document.getElementById('txDuplicateBtn');
        const voidPanel = document.getElementById('txVoidPanel');
        const voidBtn = document.getElementById('txVoidBtn');
        const voidNote = document.getElementById('txVoidNote');

        if (duplicateBtn) {
            const id = new URLSearchParams(window.location.search).get('id');
            duplicateBtn.dataset.txId = id || '';
            if (!id) duplicateBtn.disabled = true;
        }

        const receiptFrame = document.getElementById('receiptFrame');
        if (receiptFrame) {
            receiptFrame.addEventListener('load', () => {
                scheduleZoomUpdate();
            });
        }

        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomResetBtn = document.getElementById('zoomResetBtn');
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
        if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
        if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

        const printBtn = document.getElementById('txPrintBtn');
        const pdfBtn = document.getElementById('txPdfBtn');
        const emailBtn = document.getElementById('txEmailBtn');

        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const format = getCashBoxDefaultReceiptFormat() || 'a4';
                const receiptWindow = window.open('about:blank', '_blank');
                const url = buildReceiptUrl(format, format === 'a4' ? { autoPrint: '1' } : null);

                if (receiptWindow && !receiptWindow.closed) {
                    receiptWindow.location.href = url;
                } else {
                    const opened = window.open(url, '_blank');
                    if (!opened) {
                        alert('Popup blocked. Please allow popups to print receipts.');
                    }
                }
            });
        }
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                setFormat('pdf');
            });
        }
        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                setFormat('email');
            });
        }

        setTimeout(() => {
            if (!hasInitializedFromTxData) {
                requestReload(0);
            }
        }, 700);

        window.addEventListener('resize', () => {
            scheduleZoomUpdate();
        });

        if (deleteToggle && voidPanel) {
            deleteToggle.addEventListener('click', () => {
                voidPanel.classList.toggle('open');
            });
        }

        const setVoidAccessUi = (isAdmin) => {
            if (!voidBtn || !voidNote) return;

            if (currentTxIsVoided) {
                voidBtn.disabled = true;
                return;
            }

            voidBtn.disabled = !isAdmin;
            voidNote.textContent = isAdmin ? 'Admin verified' : 'Admin required';
        };

        (async () => {
            let isAdmin = false;
            const user = await window.auth?.getCurrentUser?.();

            if (user) {
                // Default to admin for single-user mode; refine if team role data exists
                isAdmin = true;

                try {
                    const rows = await window.db?.teamMembers?.getAll?.();
                    if (Array.isArray(rows) && rows.length) {
                        const me = rows.find(r => r?.member_id === user.id || r?.member?.id === user.id);
                        if (me && typeof me.role === 'string') {
                            isAdmin = me.role.toLowerCase() === 'admin';
                        } else {
                            // If I'm the owner in any row, treat as admin; otherwise assume not admin
                            const isOwner = rows.some(r => r?.owner_id === user.id);
                            isAdmin = Boolean(isOwner);
                        }
                    }
                } catch (_) {}
            } else {
                isAdmin = false;
            }

            setVoidAccessUi(isAdmin);

            if (voidBtn) {
                voidBtn.addEventListener('click', async () => {
                    if (voidBtn.disabled) return;
                    const ok = confirm('Void this transaction?\n\nThis is irreversible.');
                    if (!ok) return;

                    const prev = voidBtn.innerHTML;
                    voidBtn.disabled = true;
                    voidBtn.innerHTML = '<i class="fas fa-ban"></i> Voiding…';

                    try {
                        const res = await window.db?.transactions?.voidTransaction?.(txId, null);
                        if (!res || res.success !== true) {
                            const msg = String(res?.error || 'Failed to void transaction.');
                            if (msg.includes('INSUFFICIENT_BALANCE_FOR_VOID')) {
                                alert('Cannot void: this would make the cash box balance negative.\n\nDeposit funds first, or create a separate correction (expense) transaction.');
                            } else {
                                alert(msg);
                            }
                            return;
                        }

                        // Refresh to show updated status
                        window.location.reload();
                    } finally {
                        // If we didn't reload (failed), restore UI
                        voidBtn.innerHTML = prev;
                        voidBtn.disabled = currentTxIsVoided ? true : !isAdmin;
                    }
                });
            }
        })();

        const logoInput = document.getElementById('txLogoInput');
        const uploadLogoBtn = document.getElementById('txUploadLogoBtn');
        const removeLogoBtn = document.getElementById('txRemoveLogoBtn');
        const logoPreview = document.getElementById('txLogoPreview');
        const logoPreviewImg = document.getElementById('txLogoPreviewImg');

        const LOGO_STORAGE_KEY = 'spendnote.proLogoDataUrl';

        const setLogoUi = (dataUrl) => {
            if (!logoPreview || !logoPreviewImg || !removeLogoBtn) return;
            if (dataUrl) {
                logoPreviewImg.src = dataUrl;
                logoPreview.style.display = 'flex';
                removeLogoBtn.style.display = 'inline-flex';
            } else {
                logoPreviewImg.removeAttribute('src');
                logoPreview.style.display = 'none';
                removeLogoBtn.style.display = 'none';
            }
        };

        try {
            const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY) || '';
            if (storedLogo) setLogoUi(storedLogo);
        } catch (_) {}

        if (uploadLogoBtn && logoInput) {
            uploadLogoBtn.addEventListener('click', () => logoInput.click());
        }

        if (logoInput) {
            logoInput.addEventListener('change', () => {
                const file = logoInput.files && logoInput.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    const dataUrl = String(reader.result || '');
                    if (dataUrl) {
                        setLogoUi(dataUrl);
                        try { localStorage.setItem(LOGO_STORAGE_KEY, dataUrl); } catch (_) {}
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        if (removeLogoBtn) {
            removeLogoBtn.addEventListener('click', () => {
                if (logoInput) logoInput.value = '';
                setLogoUi('');
                try { localStorage.removeItem(LOGO_STORAGE_KEY); } catch (_) {}
            });
        }

        const storedMode = getStoredReceiptMode();
        if (storedMode) receiptMode = storedMode;

        document.getElementById('receiptModeQuick')?.addEventListener('change', () => applyReceiptMode('quick'));
        document.getElementById('receiptModeDetailed')?.addEventListener('change', () => applyReceiptMode('detailed'));

        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                setFormat(this.dataset.format);
            });
        });

        document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', function() {
                if (receiptMode !== 'detailed') return;
                const field = this.dataset.field;
                if (field) {
                    displayOptions[field] = this.checked ? '1' : '0';
                    requestReload(0);
                }
            });
        });

        const saveLabelsBtn = document.getElementById('txSaveLabelsBtn');
        if (saveLabelsBtn) {
            saveLabelsBtn.addEventListener('click', async () => {
                if (!txId || !window.db?.transactions?.update) return;

                saveLabelsBtn.disabled = true;
                saveLabelsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

                try {
                    const updates = {
                        receipt_title: receiptText.receiptTitle || null,
                        receipt_total_label: receiptText.totalLabel || null,
                        receipt_from_label: receiptText.fromLabel || null,
                        receipt_to_label: receiptText.toLabel || null,
                        receipt_description_label: receiptText.descriptionLabel || null,
                        receipt_amount_label: receiptText.amountLabel || null,
                        receipt_issued_by_label: receiptText.issuedByLabel || null,
                        receipt_received_by_label: receiptText.receivedByLabel || null,
                        receipt_footer_note: receiptText.footerNote || null
                    };

                    const result = await window.db.transactions.update(txId, updates);
                    if (result?.success) {
                        saveLabelsBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                        setTimeout(() => {
                            saveLabelsBtn.innerHTML = '<i class="fas fa-save"></i> Save Labels';
                            saveLabelsBtn.disabled = false;
                        }, 1500);
                    } else {
                        throw new Error(result?.error || 'Save failed');
                    }
                } catch (err) {
                    console.error('Failed to save labels:', err);
                    saveLabelsBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                    setTimeout(() => {
                        saveLabelsBtn.innerHTML = '<i class="fas fa-save"></i> Save Labels';
                        saveLabelsBtn.disabled = false;
                    }, 2000);
                }
            });
        }

        applyReceiptMode(receiptMode);
        requestReload(0);
        scheduleZoomUpdate();
    });

