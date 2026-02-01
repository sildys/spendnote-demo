(function () {
    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function safeText(value, fallback) {
        const v = value === undefined || value === null ? '' : String(value);
        return v.trim() ? v : (fallback || '—');
    }

    function normalizeHexColor(hex) {
        const h = String(hex || '').trim();
        if (!h) return '#059669';
        if (/^#[0-9a-f]{6}$/i.test(h)) return h;
        if (/^[0-9a-f]{6}$/i.test(h)) return `#${h}`;
        return '#059669';
    }

    function hexToRgb(hex) {
        const normalized = normalizeHexColor(hex);
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
        if (!m) return '5, 150, 105';
        return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
    }

    function formatCurrency(amount, currency) {
        const n = Number(amount);
        const safe = Number.isFinite(n) ? n : 0;
        const curr = safeText(currency, 'USD');

        const sn = (typeof window !== 'undefined' && window.SpendNote) ? window.SpendNote : null;
        if (sn && typeof sn.formatCurrency === 'function') {
            return sn.formatCurrency(safe, curr);
        }

        const defaultLocaleByCurrency = {
            USD: 'en-US',
            EUR: 'de-DE',
            GBP: 'en-GB',
            HUF: 'hu-HU',
            JPY: 'ja-JP',
            CHF: 'de-CH',
            CAD: 'en-CA',
            AUD: 'en-AU'
        };

        const resolvedLocale = defaultLocaleByCurrency[curr] || 'en-US';

        try {
            return new Intl.NumberFormat(resolvedLocale, {
                style: 'currency',
                currency: curr,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(safe);
        } catch (_) {
            return `${safe.toFixed(2)} ${curr}`;
        }
    }

    function formatDateLong(value) {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function formatDateShort(value) {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatDateTimeShort(value) {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        const date = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const time = dt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        return `${date} - ${time}`;
    }

    function getDisplayId(tx) {
        const cbSeq = tx?.cash_box_sequence;
        const txSeq = tx?.tx_sequence_in_box;
        if (cbSeq && txSeq) {
            const txSeqStr = String(txSeq).padStart(3, '0');
            return `SN${cbSeq}-${txSeqStr}`;
        }

        const receipt = safeText(tx?.receipt_number, '');
        if (receipt) return receipt;

        const id = safeText(tx?.id, '');
        if (!id) return '—';
        return id.length > 10 ? `${id.slice(0, 8)}…` : id;
    }

    function getCashBoxCode(tx) {
        const cbSeq = Number(tx?.cash_box?.sequence_number || tx?.cash_box_sequence);
        if (Number.isFinite(cbSeq) && cbSeq > 0) {
            return `SN-${String(cbSeq).padStart(3, '0')}`;
        }
        return '';
    }

    function setText(el, text) {
        if (!el) return;
        el.textContent = text;
    }

    function setInnerHtml(el, html) {
        if (!el) return;
        el.innerHTML = html;
    }

    function setHtml(el, html) {
        if (!el) return;
        el.innerHTML = html;
    }

    function computeLineItemsTotal(lineItems) {
        return lineItems.reduce((sum, it) => {
            const v = Number(it?.amount);
            return sum + (Number.isFinite(v) ? v : 0);
        }, 0);
    }

    function normalizeLineItems(raw) {
        if (!Array.isArray(raw)) return [];
        return raw
            .map((it) => ({
                description: safeText(it?.description, ''),
                amount: Number(it?.amount)
            }))
            .filter((it) => it.description || Number.isFinite(it.amount));
    }

    function resolveCashBoxIconClass(iconValue) {
        const raw = safeText(iconValue, '').trim();
        const sn = (typeof window !== 'undefined' && window.SpendNote) ? window.SpendNote : null;
        const mapped = (sn && typeof sn.getIconClass === 'function') ? sn.getIconClass(raw) : '';

        if (mapped && /^fa-/.test(mapped)) return mapped;
        if (/^fa-/.test(raw)) return raw;
        return 'fa-building';
    }

    async function loadTransactionDetail() {
        if (!window.db?.transactions?.getById) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (!id) {
            return;
        }

        const tx = await window.db.transactions.getById(id);
        if (!tx) {
            return;
        }

        try {
            if (tx.cash_box_id && window.db?.cashBoxes?.getById) {
                const latestCashBox = await window.db.cashBoxes.getById(tx.cash_box_id);
                if (latestCashBox) {
                    tx.cash_box = latestCashBox;
                }
            }
            if (!tx.contact && tx.contact_id && window.db?.contacts?.getById) {
                tx.contact = await window.db.contacts.getById(tx.contact_id);
            }
        } catch (_) {
            // ignore enrich failures
        }

        const cashBoxName = safeText(tx.cash_box?.name, 'Unknown');
        const cashBoxCode = getCashBoxCode(tx);
        const cashBoxColor = normalizeHexColor(tx.cash_box?.color || '#059669');
        const cashBoxRgb = hexToRgb(cashBoxColor);
        const currency = safeText(tx.cash_box?.currency, 'USD');

        document.documentElement.style.setProperty('--active', cashBoxColor);
        document.documentElement.style.setProperty('--active-rgb', cashBoxRgb);
        try {
            localStorage.setItem('activeCashBoxColor', cashBoxColor);
            localStorage.setItem('activeCashBoxRgb', cashBoxRgb);
            if (tx.cash_box?.id) localStorage.setItem('activeCashBoxId', String(tx.cash_box.id));
        } catch (_) {
            // ignore
        }

        if (typeof window.updateMenuColors === 'function') {
            window.updateMenuColors(cashBoxColor);
        }

        const displayId = getDisplayId(tx);
        const tType = safeText(tx.type, '').toLowerCase();
        const isIncome = tType === 'income';

        const txDate = tx.transaction_date || tx.created_at;
        const createdAt = tx.created_at || tx.transaction_date;

        const createdBy = safeText(tx.created_by_user_name || tx.created_by, '—');
        const contactName = safeText(tx.contact_name || tx.contact?.name, '—');
        const contactId = safeText(tx.contact_id, '—');

        // Set Cash Box Header
        setText(qs('#txCashBoxName'), cashBoxName);
        setText(qs('#txCashBoxId'), cashBoxCode || '—');
        
        // Set cash box icon and color
        const cashBoxIcon = qs('#txCashBoxIcon');
        if (cashBoxIcon) {
            const iconEl = cashBoxIcon.querySelector('i');
            const iconClass = resolveCashBoxIconClass(tx.cash_box?.icon);
            if (iconEl) {
                iconEl.className = `fas ${iconClass}`;
            }
            
            // Set icon background color to cash box color
            cashBoxIcon.style.background = cashBoxColor;
            cashBoxIcon.style.boxShadow = `0 2px 8px rgba(${cashBoxRgb}, 0.25)`;
        }

        setText(qs('#txTitle'), displayId);
        setInnerHtml(qs('#txMetaDate'), `<i class="fas fa-calendar"></i> ${formatDateShort(txDate)}`);

        const typeWatermark = qs('#txTypeWatermark');
        if (typeWatermark) {
            typeWatermark.textContent = isIncome ? 'IN' : 'OUT';
            typeWatermark.classList.toggle('out', !isIncome);
        }

        const topBar = qs('#txTopbar');
        if (topBar) {
            topBar.classList.toggle('in', isIncome);
            topBar.classList.toggle('out', !isIncome);
        }

        setText(qs('#txContactName'), contactName);
        setText(qs('#txContactId'), contactId);
        setText(qs('#txContactOtherId'), safeText(tx.contact_custom_field_1, '—'));
        setText(qs('#txContactAddress'), safeText(tx.contact_address || tx.contact?.address, '—'));

        const createdByValue = qs('#txCreatedBy');
        if (createdByValue) {
            createdByValue.textContent = createdBy;
        }

        const createdByAvatar = qs('#txCreatedByAvatar');
        if (createdByAvatar) {
            const avatarUrl = safeText(
                tx.created_by_user_avatar_url || tx.created_by_avatar_url || tx.created_by_avatar,
                ''
            );
            if (avatarUrl && /^https?:\/\//i.test(avatarUrl)) {
                createdByAvatar.src = avatarUrl;
                createdByAvatar.style.display = 'block';
            } else {
                createdByAvatar.removeAttribute('src');
                createdByAvatar.style.display = 'none';
            }
        }

        const headerAmount = qs('#txHeaderAmount');
        if (headerAmount) {
            headerAmount.classList.toggle('in', isIncome);
            headerAmount.classList.toggle('out', !isIncome);
        }

        const amountValue = qs('#txAmountValue');
        if (amountValue) {
            amountValue.textContent = formatCurrency(tx.amount, currency);
            amountValue.classList.toggle('in', isIncome);
            amountValue.classList.toggle('out', !isIncome);
        }

        const lineItems = normalizeLineItems(tx.line_items);
        const lineItemsBody = qs('#txLineItemsBody');
        if (lineItemsBody) {
            const baseItems = lineItems.length ? lineItems : [{ description: safeText(tx.description, '—'), amount: Number(tx.amount) }];
            const maxRows = 5;

            const rows = baseItems
                .slice(0, maxRows)
                .map((it) => {
                    const desc = safeText(it.description, '—');
                    const amt = formatCurrency(it.amount, currency);
                    return `<tr><td>${desc}</td><td>${amt}</td></tr>`;
                });

            while (rows.length < maxRows) {
                rows.push('<tr><td>&nbsp;</td><td>&nbsp;</td></tr>');
            }

            const total = lineItems.length ? computeLineItemsTotal(lineItems) : Number(tx.amount) || 0;
            const totalRow = `<tr class="table-total"><td><strong>Total</strong></td><td><strong>${formatCurrency(total, currency)}</strong></td></tr>`;

            lineItemsBody.innerHTML = `${rows.join('')}${totalRow}`;
        }

        const noteText = safeText(tx.notes, '');
        setText(qs('#txNote'), noteText);
        const noteSection = qs('#txNoteSection');
        if (noteSection) {
            noteSection.style.display = noteText && noteText !== '—' ? 'block' : 'none';
        }

        if (document.title) {
            document.title = `Transaction ${displayId} - SpendNote`;
        }

        try {
            const profile = window.db?.profiles?.getCurrent
                ? await window.db.profiles.getCurrent()
                : null;
            if (typeof window.onTransactionDetailDataLoaded === 'function') {
                window.onTransactionDetailDataLoaded({
                    tx,
                    cashBox: tx.cash_box || null,
                    profile
                });
            }
        } catch (_) {
            if (typeof window.onTransactionDetailDataLoaded === 'function') {
                window.onTransactionDetailDataLoaded({
                    tx,
                    cashBox: tx.cash_box || null,
                    profile: null
                });
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadTransactionDetail();
    });
})();
