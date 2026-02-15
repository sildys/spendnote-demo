const QUICK_PRESET = {
        logo: '0',
        addresses: '1',
        tracking: '1',
        additional: '0',
        note: '0',
        signatures: '1'
    };

    const DETAILED_PRESET = {
        logo: '1',
        addresses: '1',
        tracking: '1',
        additional: '1',
        note: '1',
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
    const LOGO_SCALE_KEY = 'spendnote.receipt.logoScale.v1';
    const RECEIPT_MODE_KEY = 'spendnote.receiptMode';

    let lastReceiptUrl = '';
    let reloadTimer = null;
    let hasInitializedFromTxData = false;
    let currentTxIsVoided = false;
    let overrideContactAddress = '';
    let currentCashBoxId = '';

    function isUuid(value) {
        try {
            if (window.SpendNoteIds && typeof window.SpendNoteIds.isUuid === 'function') {
                return window.SpendNoteIds.isUuid(value);
            }
        } catch (_) {

        }
        return false;
    }

    const spTx = new URLSearchParams(window.location.search);
    const txIdRaw = spTx.get('txId');
    const txId = isUuid(txIdRaw) ? txIdRaw : '';

    function buildReceiptUrl(format, extraParams) {
        const baseUrls = {
            'a4': 'spendnote-receipt-a4-two-copies.html',
            'pdf': 'spendnote-pdf-receipt.html',
            'email': 'spendnote-email-receipt.html'
        };
        const params = new URLSearchParams();
        params.append('v', 'receipt-20260207-07');
        if (txId) params.append('txId', txId);
        params.append('bootstrap', '1');

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

        try {
            const storedScale = parseFloat(localStorage.getItem(LOGO_SCALE_KEY) || '1');
            if (Number.isFinite(storedScale) && storedScale > 0) {
                params.append('logoScale', String(storedScale));
            }
        } catch (_) {}

        if (extraParams && typeof extraParams === 'object') {
            for (const [key, value] of Object.entries(extraParams)) {
                const v = String(value ?? '').trim();
                if (v) params.append(key, v);
            }
        }

        if (format === 'a4' && extraParams && String(extraParams.autoPrint || '') === '1') {
            try {
                params.append('returnTo', window.location.href);
            } catch (_) {

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

        reloadTimer = setTimeout(async () => {
            reloadTimer = null;
            // Ensure bootstrap session is fresh before loading iframe
            try {
                if (typeof window.writeBootstrapSession === 'function') {
                    await window.writeBootstrapSession();
                }
            } catch (_) {}
            const extra = currentFormat === 'pdf' ? { preview: '1', download: '0' } : null;
            applyReceiptUrlIfChanged(buildReceiptUrl(currentFormat, extra));
        }, delay);
    }

    function applyReceiptMode(mode) {
        const m = mode === 'detailed' ? 'detailed' : 'quick';
        receiptMode = m;
        try { localStorage.setItem(RECEIPT_MODE_KEY, m); } catch (e) {}

        // Always show toggles in both modes - just with different default values
        const detailedToggles = document.getElementById('receiptDetailedToggles');
        if (detailedToggles) detailedToggles.style.display = 'block';

        document.getElementById('receiptModeQuick').checked = m === 'quick';
        document.getElementById('receiptModeDetailed').checked = m === 'detailed';

        if (m === 'quick') {
            displayOptions = { ...QUICK_PRESET };
        } else {
            displayOptions = { ...DETAILED_PRESET };
        }
        document.querySelectorAll('.toggle-list input[type="checkbox"]').forEach(toggle => {
            const field = toggle.dataset.field;
            if (field) toggle.checked = displayOptions[field] === '1';
        });
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
            const duplicateBtn = document.getElementById('txDuplicateBtn');
            const id = String(tx?.id || '').trim();
            if (duplicateBtn) {
                duplicateBtn.dataset.txId = id;
                duplicateBtn.disabled = !id;
            }
        } catch (_) {
            // ignore
        }

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
            duplicateBtn.dataset.txId = '';
            duplicateBtn.disabled = true;
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

        const triggerHiddenPdfDownload = (url) => {
            try {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.left = '-10000px';
                iframe.style.top = '0';
                iframe.style.width = '1200px';
                iframe.style.height = '1700px';
                iframe.style.opacity = '0';
                iframe.style.pointerEvents = 'none';
                iframe.style.border = '0';
                iframe.src = url;
                document.body.appendChild(iframe);

                setTimeout(() => {
                    try {
                        iframe.remove();
                    } catch (_) {
                        // ignore
                    }
                }, 30000);
            } catch (_) {
                const opened = window.open(url, '_blank');
                if (!opened) {
                    showAlert('Popup blocked. Please allow popups to download PDFs.', { iconType: 'warning' });
                }
            }
        };

        if (printBtn) {
            printBtn.addEventListener('click', async () => {
                // Write fresh bootstrap session before opening new tab
                try {
                    if (typeof window.writeBootstrapSession === 'function') {
                        await window.writeBootstrapSession();
                    }
                } catch (_) {}

                const url = buildReceiptUrl('a4', { autoPrint: '1' });
                const opened = window.open(url, '_blank');
                if (!opened) {
                    showAlert('Popup blocked. Please allow popups to print receipts.', { iconType: 'warning' });
                }
            });
        }
        if (pdfBtn) {
            pdfBtn.addEventListener('click', async () => {
                // Write fresh bootstrap session before triggering PDF download
                try {
                    if (typeof window.writeBootstrapSession === 'function') {
                        await window.writeBootstrapSession();
                    }
                } catch (_) {}

                const url = buildReceiptUrl('pdf', { download: '1' });
                triggerHiddenPdfDownload(url);
            });
        }
        if (emailBtn) {
            emailBtn.addEventListener('click', async () => {
                let prefillEmail = '';
                try {
                    if (txId && window.db?.transactions?.getById) {
                        const tx = await window.db.transactions.getById(txId);
                        prefillEmail = String(tx?.contact_email || tx?.contact?.email || '').trim();

                        if (!prefillEmail && tx?.contact_id && window.db?.contacts?.getById) {
                            try {
                                const c = await window.db.contacts.getById(tx.contact_id);
                                prefillEmail = String(c?.email || '').trim();
                            } catch (_) {
                                // ignore
                            }
                        }
                    }
                } catch (_) {}

                const recipientEmail = await showPrompt('Send receipt to email address:', { defaultValue: prefillEmail, title: 'Email Receipt', iconType: 'prompt', placeholder: 'email@example.com' });
                if (recipientEmail === null) return;
                if (!recipientEmail.trim()) {
                    showAlert('Please enter an email address.', { iconType: 'warning' });
                    return;
                }
                
                const email = recipientEmail.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    showAlert('Please enter a valid email address.', { iconType: 'warning' });
                    return;
                }

                emailBtn.disabled = true;
                const originalText = emailBtn.innerHTML;
                emailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                try {
                    const emailHtml = await generateEmailHtml();
                    if (!emailHtml) {
                        throw new Error('Failed to generate email content');
                    }

                    const txTitle = document.getElementById('txTitle')?.textContent || 'Receipt';
                    const subject = `Your Cash Receipt - ${txTitle}`;

                    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpybm5oYXJ1ZGxneHV2ZXdxcnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTkxMDgsImV4cCI6MjA4Mjg3NTEwOH0.kQLRMVrl_uYYzZwX387uFs_BAXc9c5v7EhcvGhPR7v4';

                    const res = await fetch('https://zrnnharudlgxuvewqryj.supabase.co/functions/v1/send-receipt-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${anonKey}`
                        },
                        body: JSON.stringify({
                            to: email,
                            subject: subject,
                            html: emailHtml
                        })
                    });

                    let data = null;
                    try {
                        data = await res.json();
                    } catch (_) {
                        data = null;
                    }
                    if (!res.ok) {
                        const msg =
                            data?.error?.message ||
                            (typeof data?.error === 'string' ? data.error : '') ||
                            (data ? JSON.stringify(data) : '') ||
                            `HTTP ${res.status}`;
                        throw new Error(msg || 'Failed to send email');
                    }

                    showAlert('Receipt sent successfully to ' + email, { iconType: 'success' });
                } catch (err) {
                    console.error('Email send error:', err);
                    showAlert('Failed to send email: ' + (err.message || 'Unknown error'), { iconType: 'error' });
                } finally {
                    emailBtn.disabled = false;
                    emailBtn.innerHTML = originalText;
                }
            });
        }

        async function generateEmailHtml() {
            try {
                if (!txId || !window.db?.transactions?.getById) return null;
                
                const tx = await window.db.transactions.getById(txId);
                if (!tx) return null;

                let cashBox = tx.cash_box;
                if (!cashBox && tx.cash_box_id && window.db?.cashBoxes?.getById) {
                    cashBox = await window.db.cashBoxes.getById(tx.cash_box_id);
                }

                let profile = null;
                try {
                    profile = window.db?.profiles?.getCurrent ? await window.db.profiles.getCurrent() : null;
                } catch (_) {}

                const currency = cashBox?.currency || 'USD';
                const formatMoney = (amt) => {
                    try {
                        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amt) || 0);
                    } catch (_) {
                        return `$${(Number(amt) || 0).toFixed(2)}`;
                    }
                };

                const safeText = (v, fb) => (v === undefined || v === null ? '' : String(v).trim()) || fb || '';
                
                const cbSeq = cashBox?.sequence_number || tx.cash_box_sequence;
                const txSeq = tx.tx_sequence_in_box;
                const receiptId = (cbSeq && txSeq) ? `SN${cbSeq}-${String(txSeq).padStart(3, '0')}` : safeText(tx.receipt_number, '—');
                const cashBoxCode = cbSeq ? `SN-${String(cbSeq).padStart(3, '0')}` : '—';

                const txDate = tx.transaction_date || tx.created_at;
                const dateStr = txDate ? new Date(txDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

                const companyName = safeText(profile?.company_name || profile?.full_name || cashBox?.name, '—');
                const companyAddress = safeText(profile?.address, '');
                const contactName = safeText(tx.contact_name || tx.contact?.name, '—');
                const contactAddress = safeText(tx.contact_address || tx.contact?.address, '');

                const items = Array.isArray(tx.line_items) ? tx.line_items : [];
                const effectiveItems = items.length ? items : [{ description: tx.description || '—', amount: tx.amount }];
                const itemsHtml = effectiveItems.map(it => 
                    `<tr><td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${safeText(it.description, '—')}</td><td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;font-weight:700;">${formatMoney(it.amount)}</td></tr>`
                ).join('');

                const total = formatMoney(tx.amount);
                const notesText = safeText(tx.notes, '');
                const notesHtml = notesText ? `<div style="background:#f0f9ff;border-left:4px solid #059669;padding:16px;border-radius:4px;margin-bottom:20px;"><div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#666;margin-bottom:8px;">Notes</div><div style="font-size:13px;color:#333;line-height:1.6;">${notesText}</div></div>` : '';

                const pdfParams = new URLSearchParams();
                pdfParams.set('v', 'receipt-20260206-23');
                pdfParams.set('demo', '1');
                pdfParams.set('download', '1');
                pdfParams.set('preview', '0');
                pdfParams.set('demoCompany', companyName);
                pdfParams.set('demoAddress', companyAddress);
                pdfParams.set('demoContact', contactName);
                pdfParams.set('demoContactAddress', contactAddress);
                pdfParams.set('demoDate', dateStr);
                pdfParams.set('demoCashBoxId', cashBoxCode);
                pdfParams.set('demoReceiptId', receiptId);
                pdfParams.set('demoCurrency', currency);
                if (notesText) pdfParams.set('demoNote', notesText);

                const itemsParam = effectiveItems
                    .slice(0, 5)
                    .map((it) => {
                        const d = safeText(it?.description, '').replace(/\|/g, '/').replace(/;/g, ',');
                        const a = Number(it?.amount);
                        const amt = Number.isFinite(a) ? String(a) : '';
                        return `${d}|${amt}`;
                    })
                    .join(';');
                if (itemsParam) pdfParams.set('demoItems', itemsParam);
                pdfParams.set('demoAmount', String(Number.isFinite(Number(tx.amount)) ? Number(tx.amount) : 0));

                for (const [key, value] of Object.entries(displayOptions)) {
                    pdfParams.set(key, String(value));
                }
                pdfParams.set('itemsMode', receiptMode === 'quick' ? 'single' : 'full');
                pdfParams.set('recordedBy', '0');
                for (const [key, value] of Object.entries(receiptText)) {
                    const v = String(value || '').trim();
                    if (v) pdfParams.set(key, v);
                }

                let storedLogo = '';
                try { storedLogo = localStorage.getItem(RECEIPT_LOGO_KEY) || ''; } catch (_) {}
                if (storedLogo) {
                    pdfParams.set('logoKey', RECEIPT_LOGO_KEY);
                } else if (receiptLogoUrl) {
                    pdfParams.set('logoUrl', receiptLogoUrl);
                }
                if (currentTxIsVoided) pdfParams.set('void', '1');

                const pdfUrl = `${window.location.origin}/spendnote-pdf-receipt.html?${pdfParams.toString()}`;

                const isVoided = tx.status === 'voided';
                const voidWatermark = isVoided ? `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-18deg);font-size:86px;font-weight:900;letter-spacing:4px;color:rgba(120,120,120,0.12);text-transform:uppercase;pointer-events:none;z-index:3;">VOID</div>` : '';

                return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cash Receipt</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;background-color:#f5f5f5;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;width:600px;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:28px 24px;background-color:#059669;">
                <div style="font-size:24px;line-height:1.2;font-weight:900;color:#ffffff;margin:0;">Cash Receipt</div>
                <div style="font-size:14px;line-height:1.4;font-weight:500;color:#eafff7;margin-top:8px;">Your receipt is ready</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="font-size:12px;color:#666666;line-height:1.5;">
                      <strong style="color:#000000;">Date:</strong> ${dateStr}
                    </td>
                    <td align="right" style="font-size:12px;color:#666666;line-height:1.5;">
                      <strong style="color:#000000;">Cash Box ID:</strong> ${cashBoxCode}<br />
                      <strong style="color:#000000;">Receipt ID:</strong> ${receiptId}
                    </td>
                  </tr>
                </table>

                <div style="height:2px;background-color:#000000;margin:16px 0 18px 0;"></div>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td width="50%" valign="top" style="padding-right:10px;">
                      <div style="font-size:11px;font-weight:700;color:#999999;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">From</div>
                      <div style="font-size:14px;font-weight:800;color:#000000;margin-bottom:4px;">${companyName}</div>
                      <div style="font-size:13px;color:#666666;line-height:1.5;">${companyAddress.replace(/\n/g, '<br>')}</div>
                    </td>
                    <td width="50%" valign="top" style="padding-left:10px;">
                      <div style="font-size:11px;font-weight:700;color:#999999;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">To</div>
                      <div style="font-size:14px;font-weight:800;color:#000000;margin-bottom:4px;">${contactName}</div>
                      <div style="font-size:13px;color:#666666;line-height:1.5;">${contactAddress.replace(/\n/g, '<br>')}</div>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin-top:18px;border:1px solid #e0e0e0;border-radius:8px;">
                  <tr>
                    <td style="background-color:#f8fafc;padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;color:#666666;border-bottom:1px solid #e0e0e0;">Description</td>
                    <td align="right" style="background-color:#f8fafc;padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;color:#666666;border-bottom:1px solid #e0e0e0;">Amount</td>
                  </tr>
                  ${effectiveItems
                    .slice(0, 5)
                    .map((it) => {
                      const desc = safeText(it?.description, '—');
                      const amt = formatMoney(it?.amount);
                      return `<tr><td style="padding:10px 8px;font-size:13px;border-bottom:1px solid #f0f0f0;">${desc}</td><td align="right" style="padding:10px 8px;font-size:13px;font-weight:700;border-bottom:1px solid #f0f0f0;">${amt}</td></tr>`;
                    })
                    .join('')}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin-top:18px;">
                  <tr>
                    <td style="background-color:#059669;color:#ffffff;padding:14px 16px;border-radius:8px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Total handed over</td>
                    <td align="right" style="background-color:#059669;color:#ffffff;padding:14px 16px;border-radius:8px;font-size:22px;font-weight:900;">${total}</td>
                  </tr>
                </table>

                ${notesText ? `
                <div style="margin-top:18px;background-color:#f0f9ff;border-left:4px solid #059669;padding:14px 12px;">
                  <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#666666;margin-bottom:8px;">Notes</div>
                  <div style="font-size:13px;color:#333333;line-height:1.6;">${notesText}</div>
                </div>
                ` : ''}

                ${currentTxIsVoided ? `
                <div style="margin-top:18px;color:#666666;font-size:12px;">This receipt is marked as VOID.</div>
                ` : ''}

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin-top:24px;">
                  <tr>
                    <td align="center">
                      <a href="${pdfUrl}" style="display:inline-block;background-color:#059669;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:8px;font-size:14px;font-weight:700;">Download PDF Receipt</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 24px;background-color:#fafafa;border-top:1px solid #e0e0e0;">
                <div style="font-size:14px;font-weight:700;color:#000000;margin-bottom:10px;">SpendNote</div>
                <div style="font-size:12px;color:#999999;line-height:1.6;">
                  Proof of cash handoff. Not a tax document.<br />
                  2026 SpendNote. All rights reserved.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
            } catch (err) {
                console.error('Generate email HTML error:', err);
                return null;
            }
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
                    const ok = await showConfirm('Void this transaction?\n\nThis is irreversible.', { title: 'Void Transaction', iconType: 'danger', okLabel: 'Void', danger: true });
                    if (!ok) return;

                    const prev = voidBtn.innerHTML;
                    voidBtn.disabled = true;
                    voidBtn.innerHTML = '<i class="fas fa-ban"></i> Voiding…';

                    try {
                        const res = await window.db?.transactions?.voidTransaction?.(txId, null);
                        if (!res || res.success !== true) {
                            const msg = String(res?.error || 'Failed to void transaction.');
                            if (msg.includes('INSUFFICIENT_BALANCE_FOR_VOID')) {
                                showAlert('Cannot void: this would make the cash box balance negative.\n\nDeposit funds first, or create a separate correction (expense) transaction.', { iconType: 'error' });
                            } else {
                                showAlert(msg, { iconType: 'error' });
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

