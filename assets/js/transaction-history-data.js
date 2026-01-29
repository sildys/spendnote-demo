(function () {
    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
        return Array.from((root || document).querySelectorAll(sel));
    }

    function safeText(value, fallback) {
        const v = value === undefined || value === null ? '' : String(value);
        return v.trim() ? v : (fallback || '');
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

    function formatDateShort(value) {
        const dt = value ? new Date(value) : null;
        if (!dt || Number.isNaN(dt.getTime())) return '—';
        return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function getDisplayId(tx) {
        const receipt = safeText(tx?.receipt_number, '');
        if (receipt) return receipt;
        const id = safeText(tx?.id, '');
        if (!id) return '—';
        return id.length > 10 ? `${id.slice(0, 8)}…` : id;
    }

    function ensureCashBoxSelectOptions(selectEl, cashBoxes, selectedId) {
        if (!selectEl) return;
        const existing = qsa('option', selectEl).map((o) => o.value);
        const hasRealIds = cashBoxes.some((cb) => cb && cb.id && existing.includes(cb.id));

        if (hasRealIds) {
            if (selectedId) selectEl.value = selectedId;
            return;
        }

        selectEl.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = '';
        optAll.textContent = 'All Cash Boxes';
        selectEl.appendChild(optAll);

        cashBoxes.forEach((box) => {
            const opt = document.createElement('option');
            opt.value = box.id;
            opt.textContent = safeText(box.name, box.id);
            selectEl.appendChild(opt);
        });

        if (selectedId) {
            selectEl.value = selectedId;
        }
    }

    function getFiltersFromUi(state) {
        const cashBoxId = safeText(qs('#filterRegister')?.value, '');
        const contactNameQuery = safeText(qs('#filterContact')?.value, '').toLowerCase();
        const contactIdQuery = safeText(qs('#filterContactId')?.value, '').toLowerCase();
        const recorderQuery = safeText(qs('#filterRecorder')?.value, '').toLowerCase();

        const dateFrom = safeText(qs('#filterDateFrom')?.value, '');
        const dateTo = safeText(qs('#filterDateTo')?.value, '');

        const amountMin = safeText(qs('#filterAmountMin')?.value, '');
        const amountMax = safeText(qs('#filterAmountMax')?.value, '');

        return {
            cashBoxId: cashBoxId || null,
            direction: state.direction,
            contactNameQuery,
            contactIdQuery,
            recorderQuery,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            amountMin: amountMin ? Number(amountMin) : null,
            amountMax: amountMax ? Number(amountMax) : null
        };
    }

    function applyFilters(allTx, filters) {
        return allTx.filter((tx) => {
            if (filters.cashBoxId && String(tx.cash_box_id || tx.cash_box?.id || '') !== String(filters.cashBoxId)) {
                return false;
            }

            if (filters.direction && filters.direction !== 'all') {
                const t = safeText(tx.type, '').toLowerCase();
                const dir = t === 'income' ? 'in' : (t === 'expense' ? 'out' : '');
                if (dir !== filters.direction) return false;
            }

            if (filters.contactNameQuery) {
                const name = safeText(tx.contact?.name || tx.contact_name, '').toLowerCase();
                if (!name.includes(filters.contactNameQuery)) return false;
            }

            if (filters.contactIdQuery) {
                const cid = safeText(tx.contact_id, '').toLowerCase();
                if (!cid.includes(filters.contactIdQuery)) return false;
            }

            if (filters.recorderQuery) {
                const recorder = safeText(tx.created_by_user_name || tx.created_by, '').toLowerCase();
                if (!recorder.includes(filters.recorderQuery)) return false;
            }

            if (filters.dateFrom || filters.dateTo) {
                const raw = tx.transaction_date || tx.created_at;
                const dt = raw ? new Date(raw) : null;
                if (!dt || Number.isNaN(dt.getTime())) return false;
                const d = dt.toISOString().slice(0, 10);
                if (filters.dateFrom && d < filters.dateFrom) return false;
                if (filters.dateTo && d > filters.dateTo) return false;
            }

            const amt = Number(tx.amount);
            if (filters.amountMin !== null && Number.isFinite(filters.amountMin) && (!Number.isFinite(amt) || amt < filters.amountMin)) {
                return false;
            }
            if (filters.amountMax !== null && Number.isFinite(filters.amountMax) && (!Number.isFinite(amt) || amt > filters.amountMax)) {
                return false;
            }

            return true;
        });
    }

    function sortTransactions(list, sort) {
        const dir = sort.direction === 'asc' ? 1 : -1;
        const key = sort.key;

        const getVal = (tx) => {
            if (key === 'type') return safeText(tx.type, '').toLowerCase();
            if (key === 'date') return Date.parse(tx.transaction_date || tx.created_at || '') || 0;
            if (key === 'amount') return Number(tx.amount) || 0;
            if (key === 'cashbox') return safeText(tx.cash_box?.name, '').toLowerCase();
            if (key === 'contact') return safeText(tx.contact?.name || tx.contact_name, '').toLowerCase();
            if (key === 'contact_id') return safeText(tx.contact_id, '').toLowerCase();
            if (key === 'created_by') return safeText(tx.created_by_user_name || tx.created_by, '').toLowerCase();
            if (key === 'id') return safeText(tx.receipt_number || tx.id, '').toLowerCase();
            return '';
        };

        return [...list].sort((a, b) => {
            const av = getVal(a);
            const bv = getVal(b);
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return String(a?.id || '').localeCompare(String(b?.id || '')) * dir;
        });
    }

    function renderTableRows(tbody, txs) {
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!txs || txs.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="10" style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-weight: 600;">No transactions yet.</td>';
            tbody.appendChild(tr);
            return;
        }

        txs.forEach((tx) => {
            const t = safeText(tx.type, '').toLowerCase();
            const isIncome = t === 'income';
            const cashBoxColor = normalizeHexColor(tx.cash_box?.color || '#059669');
            const cashBoxRgb = hexToRgb(cashBoxColor);
            const currency = tx.cash_box?.currency || 'USD';

            const tr = document.createElement('tr');
            tr.style.setProperty('--cashbox-rgb', cashBoxRgb);
            tr.style.setProperty('--cashbox-color', cashBoxColor);

            const displayId = getDisplayId(tx);
            const contactName = safeText(tx.contact?.name || tx.contact_name, '—');
            const contactId = safeText(tx.contact_id, '');
            const createdBy = safeText(tx.created_by_user_name || tx.created_by, '—');

            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-tx-id="${safeText(tx.id, '')}"></td>
                <td><span class="tx-direction ${isIncome ? 'in' : 'out'}">${isIncome ? 'IN' : 'OUT'}</span></td>
                <td><span class="tx-id">${displayId}</span></td>
                <td><span class="tx-date">${formatDateShort(tx.transaction_date || tx.created_at)}</span></td>
                <td><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${safeText(tx.cash_box?.name, 'Unknown')}</span></td>
                <td><span class="tx-Contact">${contactName}</span></td>
                <td><span class="tx-contact-id">${contactId}</span></td>
                <td><span class="tx-amount ${isIncome ? 'in' : 'out'}">${formatCurrency(tx.amount, currency)}</span></td>
                <td><span class="tx-recorder">${createdBy}</span></td>
                <td><a href="spendnote-transaction-detail.html?id=${encodeURIComponent(tx.id)}" class="action-btn">View</a></td>
            `;

            tbody.appendChild(tr);
        });
    }

    function renderErrorRow(tbody, message) {
        if (!tbody) return;
        tbody.innerHTML = '';
        const tr = document.createElement('tr');
        const text = message ? String(message) : 'Failed to load transactions.';
        tr.innerHTML = `<td colspan="10" style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-weight: 700;">${text}</td>`;
        tbody.appendChild(tr);
    }

    function updateStatsFromList(list) {
        const elTotal = qs('#statTotalTransactions');
        const elIn = qs('#statTotalIn');
        const elOut = qs('#statTotalOut');
        const elNet = qs('#statNetBalance');
        const elBoxes = qs('#statCashBoxes');

        let totalIn = 0;
        let totalOut = 0;
        const cashBoxes = new Set();

        list.forEach((tx) => {
            const type = safeText(tx.type, '').toLowerCase();
            const amt = Number(tx.amount);
            if (type === 'income') totalIn += Number.isFinite(amt) ? amt : 0;
            if (type === 'expense') totalOut += Number.isFinite(amt) ? amt : 0;
            const cb = tx.cash_box?.name || tx.cash_box_id;
            if (cb) cashBoxes.add(String(cb));
        });

        if (elTotal) elTotal.textContent = String(list.length);
        if (elIn) elIn.textContent = formatCurrency(totalIn, 'USD');
        if (elOut) elOut.textContent = formatCurrency(totalOut, 'USD');
        if (elNet) elNet.textContent = formatCurrency(totalIn - totalOut, 'USD');
        if (elBoxes) elBoxes.textContent = String(cashBoxes.size);
    }

    function getPaginationState() {
        const perPageEl = qs('#perPageSelect');
        const perPage = perPageEl ? Number(perPageEl.value) : 10;
        return {
            perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : 10,
            page: 1
        };
    }

    function renderPagination(container, infoEl, state, totalCount) {
        if (infoEl) {
            const from = totalCount === 0 ? 0 : (state.page - 1) * state.perPage + 1;
            const to = Math.min(totalCount, state.page * state.perPage);
            const text = `Showing ${from}-${to} of ${totalCount}`;

            const select = qs('#perPageSelect', infoEl);
            infoEl.textContent = text;
            if (select) infoEl.appendChild(select);
        }

        if (!container) return;
        container.innerHTML = '';

        const totalPages = Math.max(1, Math.ceil(totalCount / state.perPage));

        const mkBtn = (label, page, opts) => {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn';
            btn.textContent = label;
            if (opts?.active) btn.classList.add('active');
            if (opts?.disabled) btn.disabled = true;
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                state.page = page;
                state.onChange();
            });
            return btn;
        };

        container.appendChild(mkBtn('<', Math.max(1, state.page - 1), { disabled: state.page <= 1 }));

        const windowSize = 5;
        const half = Math.floor(windowSize / 2);
        let start = Math.max(1, state.page - half);
        let end = Math.min(totalPages, start + windowSize - 1);
        start = Math.max(1, end - windowSize + 1);

        if (start > 1) {
            container.appendChild(mkBtn('1', 1, { active: state.page === 1 }));
            if (start > 2) {
                const dots = document.createElement('button');
                dots.className = 'pagination-btn';
                dots.textContent = '...';
                dots.disabled = true;
                container.appendChild(dots);
            }
        }

        for (let p = start; p <= end; p += 1) {
            container.appendChild(mkBtn(String(p), p, { active: state.page === p }));
        }

        if (end < totalPages) {
            if (end < totalPages - 1) {
                const dots = document.createElement('button');
                dots.className = 'pagination-btn';
                dots.textContent = '...';
                dots.disabled = true;
                container.appendChild(dots);
            }
            container.appendChild(mkBtn(String(totalPages), totalPages, { active: state.page === totalPages }));
        }

        container.appendChild(mkBtn('>', Math.min(totalPages, state.page + 1), { disabled: state.page >= totalPages }));
    }

    async function loadTransactionsPage() {
        console.log('[TxHistory] loadTransactionsPage called');
        const tbody = qs('#transactionsTable tbody');
        if (!window.db || !window.db.transactions || !window.db.cashBoxes) {
            const tries = (window.__txHistoryInitTries || 0) + 1;
            window.__txHistoryInitTries = tries;
            console.log('[TxHistory] db not ready, retry', tries);

            if (tries < 20) {
                setTimeout(loadTransactionsPage, 150);
                return;
            }

            console.error('[TxHistory] db never initialized');
            updateStatsFromList([]);
            renderErrorRow(tbody, 'App database not initialized.');
            return;
        }
        console.log('[TxHistory] db ready, fetching data...');

        const cashBoxSelect = qs('#filterRegister');
        const pagination = qs('.pagination-controls');
        const paginationInfo = qs('.pagination-info');
        const perPageSelect = qs('#perPageSelect');

        const state = {
            direction: 'all',
            sort: { key: 'date', direction: 'desc' },
            pagination: getPaginationState(),
            allTx: [],
            cashBoxes: []
        };

        const filterHeader = qs('#filterHeader');
        const filterPanel = qs('#filterPanel');
        const filterIcon = qs('#filterToggleIcon');
        if (filterHeader && filterPanel && filterIcon) {
            filterHeader.addEventListener('click', (e) => {
                if (e && e.target && e.target.closest && e.target.closest('.filter-tab')) {
                    return;
                }
                const isHidden = filterPanel.style.display === 'none' || filterPanel.style.display === '';
                filterPanel.style.display = isHidden ? 'block' : 'none';
                filterIcon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const urlCashBoxId = urlParams.get('cashboxId');
        const savedCashBoxId = localStorage.getItem('activeCashBoxId');

        const cashBoxById = new Map();

        try {
            console.log('[TxHistory] Fetching cash boxes...');
            const cashBoxes = await window.db.cashBoxes.getAll({ select: 'id, name, color, currency' });
            state.cashBoxes = Array.isArray(cashBoxes) ? cashBoxes : [];
            console.log('[TxHistory] Got', state.cashBoxes.length, 'cash boxes');

            state.cashBoxes.forEach((cb) => {
                if (cb && cb.id) {
                    cashBoxById.set(String(cb.id), cb);
                }
            });

            const desiredCashBox = urlCashBoxId || savedCashBoxId;
            ensureCashBoxSelectOptions(cashBoxSelect, state.cashBoxes, desiredCashBox);

            console.log('[TxHistory] Fetching transactions...');
            const txSelect = 'id, cash_box_id, type, amount, description, notes, receipt_number, transaction_date, created_at, contact_id, contact_name, created_by_user_id, created_by_user_name';
            state.allTx = await window.db.transactions.getAll({ select: txSelect });
            console.log('[TxHistory] Got', (state.allTx || []).length, 'transactions');

            // Attach cash box object from local lookup (no join required)
            state.allTx = (Array.isArray(state.allTx) ? state.allTx : []).map((tx) => {
                if (tx && !tx.cash_box && tx.cash_box_id) {
                    tx.cash_box = cashBoxById.get(String(tx.cash_box_id)) || null;
                }
                return tx;
            });
        } catch (e) {
            console.error('[TxHistory] Failed to load:', e);
            updateStatsFromList([]);
            renderErrorRow(tbody, `Failed to load transactions: ${e && e.message ? e.message : e}`);
            return;
        }

        const tabs = qsa('.filter-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                tabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                state.direction = safeText(tab.dataset.filter, 'all');
                state.pagination.page = 1;
                render();
            });
        });

        const filterInputs = qsa('.filter-select, .filter-input');
        filterInputs.forEach((el) => {
            el.addEventListener('change', () => {
                state.pagination.page = 1;
                render();
            });
            el.addEventListener('input', () => {
                state.pagination.page = 1;
                render();
            });
        });

        if (perPageSelect) {
            perPageSelect.addEventListener('change', () => {
                state.pagination.perPage = Number(perPageSelect.value) || 10;
                state.pagination.page = 1;
                render();
            });
        }

        const selectAllHeader = qs('#selectAllHeader');
        if (selectAllHeader) {
            selectAllHeader.addEventListener('change', () => {
                qsa('.row-checkbox', tbody).forEach((cb) => {
                    cb.checked = Boolean(selectAllHeader.checked);
                });
                updateBulk();
            });
        }

        function updateBulk() {
            const count = qsa('.row-checkbox:checked', tbody).length;
            const bulkActions = qs('#bulkActions');
            const selectedCount = qs('#selectedCount');
            if (selectedCount) selectedCount.textContent = String(count);
            if (bulkActions) bulkActions.classList.toggle('show', count > 0);
        }

        if (tbody) {
            tbody.addEventListener('change', (e) => {
                const target = e.target;
                if (target && target.classList && target.classList.contains('row-checkbox')) {
                    updateBulk();
                }
            });
        }

        const sortMap = {
            1: 'type',
            2: 'id',
            3: 'date',
            4: 'cashbox',
            5: 'contact',
            6: 'contact_id',
            7: 'amount',
            8: 'created_by'
        };

        qsa('#transactionsTable thead th.sortable').forEach((th, idx) => {
            th.addEventListener('click', () => {
                const key = sortMap[idx + 1];
                if (!key) return;

                if (state.sort.key === key) {
                    state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sort.key = key;
                    state.sort.direction = 'asc';
                }

                qsa('#transactionsTable thead th.sortable').forEach((t) => t.classList.remove('asc', 'desc'));
                th.classList.add(state.sort.direction);

                render();
            });
        });

        function render() {
            const filters = getFiltersFromUi(state);
            let visible = applyFilters(state.allTx, filters);
            visible = sortTransactions(visible, state.sort);

            updateStatsFromList(visible);

            const totalCount = visible.length;
            const startIdx = (state.pagination.page - 1) * state.pagination.perPage;
            const slice = visible.slice(startIdx, startIdx + state.pagination.perPage);

            renderTableRows(tbody, slice);

            const paginationState = {
                perPage: state.pagination.perPage,
                page: state.pagination.page,
                onChange: render
            };
            renderPagination(pagination, paginationInfo, paginationState, totalCount);
            state.pagination.page = paginationState.page;

            if (selectAllHeader) selectAllHeader.checked = false;
            updateBulk();
        }

        render();
    }

    // Expose for explicit invocation (like dashboard pattern)
    window.loadTransactionsPage = loadTransactionsPage;

    // Also try on DOMContentLoaded as fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadTransactionsPage();
        });
    } else {
        // DOM already ready, call directly
        loadTransactionsPage();
    }
})();
