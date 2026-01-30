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
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: curr,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(safe);
        } catch (_) {
            return `$${safe.toFixed(2)}`;
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
        const cbSeq = Number(tx?.cash_box_sequence || tx?.cash_box?.sequence_number);
        if (Number.isFinite(cbSeq) && cbSeq > 0) {
            return `CR-${String(cbSeq).padStart(3, '0')}`;
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
            if (!tx.cash_box && tx.cash_box_id && window.db?.cashBoxes?.getById) {
                tx.cash_box = await window.db.cashBoxes.getById(tx.cash_box_id);
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
        const contactName = safeText(tx.contact?.name || tx.contact_name, '—');
        const contactId = safeText(tx.contact_id, '—');

        setText(qs('#txTitle'), `Transaction ${displayId}`);
        setInnerHtml(qs('#txMetaDate'), `<i class="fas fa-calendar"></i> ${formatDateShort(txDate)}`);
        setInnerHtml(qs('#txMetaRecorder'), `<i class="fas fa-user"></i> Logged by ${createdBy}`);

        const badge = qs('#txMetaStatus');
        if (badge) {
            badge.textContent = isIncome ? 'IN' : 'OUT';
            badge.classList.toggle('in', isIncome);
            badge.classList.toggle('out', !isIncome);
        }

        setText(qs('#txCashBoxName'), cashBoxName);
        setText(qs('#txCashBoxCode'), cashBoxCode ? cashBoxCode : '');

        const settingsLabel = cashBoxName && cashBoxName !== 'Unknown'
            ? `${cashBoxName}${cashBoxCode ? ` (${cashBoxCode})` : ''}`
            : '—';
        setText(qs('#txCashBoxSettingsLabel'), settingsLabel);

        setHtml(qs('#txIdCode'), `<code>${displayId}</code>`);
        setText(qs('#txDateLong'), formatDateLong(txDate));
        setText(qs('#txContactName'), contactName);
        setText(qs('#txAdditionalInfo'), contactId);

        setText(qs('#txCreatedBy'), `${createdBy} on ${formatDateTimeShort(createdAt)}`);

        const directionLabel = qs('#txDirectionLabel');
        if (directionLabel) {
            directionLabel.textContent = isIncome ? 'Cash IN (Received)' : 'Cash OUT (Paid)';
            directionLabel.classList.toggle('in', isIncome);
            directionLabel.classList.toggle('out', !isIncome);
        }

        const amountCard = qs('#txAmountCard');
        if (amountCard) {
            amountCard.classList.toggle('in', isIncome);
            amountCard.classList.toggle('out', !isIncome);
        }

        setText(qs('#txAmountValue'), formatCurrency(tx.amount, currency));

        const lineItems = normalizeLineItems(tx.line_items);
        const lineItemsBody = qs('#txLineItemsBody');
        if (lineItemsBody) {
            const items = lineItems.length ? lineItems : [{ description: safeText(tx.description, '—'), amount: Number(tx.amount) }];
            const rows = items
                .map((it) => {
                    const desc = safeText(it.description, '—');
                    const amt = formatCurrency(it.amount, currency);
                    return `<tr><td>${desc}</td><td>${amt}</td></tr>`;
                })
                .join('');

            const total = lineItems.length ? computeLineItemsTotal(lineItems) : Number(tx.amount) || 0;
            const totalRow = `<tr class="table-total"><td><strong>Total</strong></td><td><strong>${formatCurrency(total, currency)}</strong></td></tr>`;

            lineItemsBody.innerHTML = `${rows}${totalRow}`;
        }

        setText(qs('#txNote'), safeText(tx.notes, ''));

        if (document.title) {
            document.title = `Transaction ${displayId} - SpendNote`;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadTransactionDetail();
    });
})();
