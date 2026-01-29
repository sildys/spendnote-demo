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

    function getInitials(name) {
        const parts = safeText(name, '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (parts.length === 0) return 'SN';
        const first = parts[0]?.[0] || '';
        const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : (parts[0]?.[1] || '');
        return (first + last).toUpperCase().slice(0, 2) || 'SN';
    }

    function getDisplayId(tx) {
        // Use Supabase sequence numbers if available (SN{cash_box_seq}-{tx_seq})
        const cbSeq = tx?.cash_box_sequence;
        const txSeq = tx?.tx_sequence_in_box;
        if (cbSeq && txSeq) {
            const txSeqStr = String(txSeq).padStart(3, '0');
            return `SN${cbSeq}-${txSeqStr}`;
        }
        // Fallback to receipt_number or truncated UUID
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

    function ensureCashBoxDatalist(datalistEl, cashBoxes) {
        if (!datalistEl) return;
        datalistEl.innerHTML = '';

        (cashBoxes || []).forEach((box) => {
            if (!box) return;
            const opt = document.createElement('option');
            const name = safeText(box.name, '');
            const id = safeText(box.id, '');
            opt.value = name || id;
            opt.label = id ? `${name || id} (${id})` : (name || id);
            datalistEl.appendChild(opt);
        });
    }

    function ensureContactDatalist(datalistEl, txs) {
        if (!datalistEl) return;
        datalistEl.innerHTML = '';

        const seen = new Set();
        (txs || []).forEach((tx) => {
            const name = safeText(tx?.contact?.name || tx?.contact_name, '');
            const id = safeText(tx?.contact_id, '');
            if (!name && !id) return;

            const label = id ? `${name || id} (${id})` : (name || id);
            const value = name || id;
            const key = `${value}||${label}`;
            if (seen.has(key)) return;
            seen.add(key);

            const opt = document.createElement('option');
            opt.value = value;
            opt.label = label;
            datalistEl.appendChild(opt);
        });
    }

    function getCashBoxIdFromQuery(query, cashBoxes) {
        const q = safeText(query, '').trim().toLowerCase();
        if (!q) return null;

        // Exact ID match
        const exactId = (cashBoxes || []).find((b) => safeText(b?.id, '').toLowerCase() === q);
        if (exactId && exactId.id) return exactId.id;

        // Exact name match
        const exactName = (cashBoxes || []).find((b) => safeText(b?.name, '').trim().toLowerCase() === q);
        if (exactName && exactName.id) return exactName.id;

        // Partial match: name contains query
        const partial = (cashBoxes || []).find((b) => safeText(b?.name, '').toLowerCase().includes(q));
        if (partial && partial.id) return partial.id;

        return null;
    }

    function ensureCreatedBySelectOptions(selectEl, txs) {
        if (!selectEl) return [];

        const map = new Map();
        (txs || []).forEach((tx) => {
            const id = safeText(tx?.created_by_user_id || tx?.created_by, '');
            const name = safeText(tx?.created_by_user_name || tx?.created_by, '');
            if (!id && !name) return;
            const key = id || name;
            if (!map.has(key)) map.set(key, name || id);
        });

        const entries = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
        entries.sort((a, b) => a.name.localeCompare(b.name));

        const current = safeText(selectEl.value, '');
        selectEl.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = '';
        optAll.textContent = 'All team members';
        selectEl.appendChild(optAll);

        entries.forEach((u) => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = u.name;
            selectEl.appendChild(opt);
        });

        if (current) selectEl.value = current;
        return entries;
    }

    function ensureCurrencySelectOptions(selectEl, cashBoxes) {
        if (!selectEl) return;

        // Collect unique currencies from cash boxes
        const currencies = new Set();
        cashBoxes.forEach((cb) => {
            if (cb && cb.currency) currencies.add(cb.currency);
        });

        selectEl.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = '';
        optAll.textContent = 'All Currencies';
        selectEl.appendChild(optAll);

        // Sort currencies alphabetically
        [...currencies].sort().forEach((currency) => {
            const opt = document.createElement('option');
            opt.value = currency;
            opt.textContent = currency;
            selectEl.appendChild(opt);
        });
    }

    function getFiltersFromUi(state) {
        const cashBoxQuery = safeText(qs('#filterCashBoxQuery')?.value, '');
        const cashBoxId = getCashBoxIdFromQuery(cashBoxQuery, state.cashBoxes);
        const currency = safeText(qs('#filterCurrency')?.value, '');
        const txIdQuery = safeText(qs('#filterTxId')?.value, '').toLowerCase();
        const contactQuery = safeText(qs('#filterContactQuery')?.value, '').toLowerCase();
        const createdById = safeText(qs('#filterCreatedBy')?.value, '');

        const dateFrom = safeText(qs('#filterDateFrom')?.value, '');
        const dateTo = safeText(qs('#filterDateTo')?.value, '');

        const amountMin = safeText(qs('#filterAmountMin')?.value, '');
        const amountMax = safeText(qs('#filterAmountMax')?.value, '');

        return {
            cashBoxQuery: safeText(cashBoxQuery, '').toLowerCase(),
            cashBoxId: cashBoxId || null,
            currency: currency || null,
            direction: state.direction,
            txIdQuery,
            contactQuery,
            createdById: createdById || null,
            dateFrom: dateFrom || null,
            dateTo: dateTo || null,
            amountMin: amountMin ? Number(amountMin) : null,
            amountMax: amountMax ? Number(amountMax) : null
        };
    }

    function applyFilters(allTx, filters) {
        return allTx.filter((tx) => {
            if (filters.txIdQuery) {
                const display = getDisplayId(tx).toLowerCase();
                const raw = safeText(tx?.id, '').toLowerCase();
                const receipt = safeText(tx?.receipt_number, '').toLowerCase();
                if (!display.includes(filters.txIdQuery) && !raw.includes(filters.txIdQuery) && !receipt.includes(filters.txIdQuery)) {
                    return false;
                }
            }

            if (filters.cashBoxId) {
                if (String(tx.cash_box_id || tx.cash_box?.id || '') !== String(filters.cashBoxId)) {
                    return false;
                }
            } else if (filters.cashBoxQuery) {
                const cbName = safeText(tx.cash_box?.name, '').toLowerCase();
                const cbId = safeText(tx.cash_box_id || tx.cash_box?.id, '').toLowerCase();
                if (!cbName.includes(filters.cashBoxQuery) && !cbId.includes(filters.cashBoxQuery)) return false;
            }

            // Filter by currency (cash box's currency)
            if (filters.currency && tx.cash_box?.currency !== filters.currency) {
                return false;
            }

            if (filters.direction && filters.direction !== 'all') {
                const t = safeText(tx.type, '').toLowerCase();
                const dir = t === 'income' ? 'in' : (t === 'expense' ? 'out' : '');
                if (dir !== filters.direction) return false;
            }

            if (filters.contactQuery) {
                const name = safeText(tx.contact?.name || tx.contact_name, '').toLowerCase();
                const cid = safeText(tx.contact_id, '').toLowerCase();
                if (!name.includes(filters.contactQuery) && !cid.includes(filters.contactQuery)) return false;
            }

            if (filters.createdById) {
                const rawId = safeText(tx.created_by_user_id || tx.created_by, '');
                if (String(rawId) !== String(filters.createdById)) return false;
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
            tr.tabIndex = 0;

            const displayId = getDisplayId(tx);
            const contactName = safeText(tx.contact?.name || tx.contact_name, '—');
            const contactId = safeText(tx.contact_id, '');
            const createdBy = safeText(tx.created_by_user_name || tx.created_by, '—');

            const initials = getInitials(createdBy === '—' ? '' : createdBy);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#10b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
            const avatarUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-tx-id="${safeText(tx.id, '')}"></td>
                <td>
                    <div class="tx-type-pill ${isIncome ? 'in' : 'out'}">
                        <span class="quick-icon"><i class="fas ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></span>
                        <span class="quick-label">${isIncome ? 'IN' : 'OUT'}</span>
                    </div>
                </td>
                <td><span class="tx-id">${displayId}</span></td>
                <td><span class="tx-date">${formatDateShort(tx.transaction_date || tx.created_at)}</span></td>
                <td><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${safeText(tx.cash_box?.name, 'Unknown')}</span></td>
                <td><span class="tx-Contact">${contactName}</span></td>
                <td><span class="tx-contact-id">${contactId}</span></td>
                <td><span class="tx-amount ${isIncome ? 'in' : 'out'}">${formatCurrency(tx.amount, currency)}</span></td>
                <td><div class="tx-createdby"><div class="user-avatar user-avatar-small"><img src="${avatarUrl}" alt="${createdBy}"></div></div></td>
                <td>
                    <a href="spendnote-transaction-detail.html?id=${encodeURIComponent(tx.id)}" class="tx-action btn-view">
                        <span>View</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </td>
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

    function updateStatsFromList(filteredList, selectedCurrency, allTx, allCashBoxes) {
        const elTotal = qs('#statTotalTransactions');
        const elIn = qs('#statTotalIn');
        const elOut = qs('#statTotalOut');
        const elNet = qs('#statNetBalance');
        const elBoxes = qs('#statCashBoxes');

        // Total counts always show ALL in system (not filtered)
        if (elTotal) elTotal.textContent = String(allTx ? allTx.length : 0);
        if (elBoxes) elBoxes.textContent = String(allCashBoxes ? allCashBoxes.length : 0);

        // Monetary stats sum the FILTERED list (only when currency filter is active)
        if (selectedCurrency) {
            let totalIn = 0;
            let totalOut = 0;
            filteredList.forEach((tx) => {
                const type = safeText(tx.type, '').toLowerCase();
                const amt = Number(tx.amount);
                if (type === 'income') totalIn += Number.isFinite(amt) ? amt : 0;
                if (type === 'expense') totalOut += Number.isFinite(amt) ? amt : 0;
            });
            if (elIn) elIn.textContent = formatCurrency(totalIn, selectedCurrency);
            if (elOut) elOut.textContent = formatCurrency(totalOut, selectedCurrency);
            if (elNet) elNet.textContent = formatCurrency(totalIn - totalOut, selectedCurrency);
        } else {
            // Multiple currencies - can't sum, show placeholder
            if (elIn) elIn.textContent = '—';
            if (elOut) elOut.textContent = '—';
            if (elNet) elNet.textContent = '—';
        }
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
            updateStatsFromList([], null, [], []);
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
        // NOTE: Do NOT use localStorage.activeCashBoxId here - it would filter out all transactions
        // that don't belong to the dashboard's active cash box. Only filter by URL param.

        const cashBoxById = new Map();

        const applyAutoDefaults = () => {
            const cashBoxQueryInput = qs('#filterCashBoxQuery');
            const cashBoxGroup = qs('#filterGroupCashBox');

            if (cashBoxQueryInput && cashBoxGroup) {
                // If only one cash box exists, prefill the filter
                if (state.cashBoxes.length === 1) {
                    const only = state.cashBoxes[0];
                    cashBoxQueryInput.value = safeText(only.name, only.id);
                } else if (urlCashBoxId) {
                    const pre = state.cashBoxes.find((b) => String(b?.id) === String(urlCashBoxId));
                    cashBoxQueryInput.value = pre ? safeText(pre.name, pre.id) : urlCashBoxId;
                }
            }

            const currencySelect = qs('#filterCurrency');
            const currencyGroup = qs('#filterGroupCurrency');
            if (currencySelect && currencyGroup) {
                const currencyOptions = qsa('option', currencySelect).filter((o) => safeText(o.value, ''));
                if (currencyOptions.length === 1) currencySelect.value = currencyOptions[0].value;
            }

            const createdBySelect = qs('#filterCreatedBy');
            const createdByGroup = qs('#filterGroupCreatedBy');
            if (createdBySelect && createdByGroup) {
                const real = qsa('option', createdBySelect).filter((o) => safeText(o.value, ''));
                if (real.length === 1) createdBySelect.value = real[0].value;
            }
        };

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

            // Only pre-select cash box if explicitly passed via URL (e.g. from cash box detail page)
            ensureCashBoxSelectOptions(cashBoxSelect, state.cashBoxes, urlCashBoxId || null);

            const cashBoxDatalist = qs('#cashBoxDatalist');
            ensureCashBoxDatalist(cashBoxDatalist, state.cashBoxes);

            // Populate currency filter dropdown
            const currencySelect = qs('#filterCurrency');
            ensureCurrencySelectOptions(currencySelect, state.cashBoxes);

            console.log('[TxHistory] Fetching transactions...');
            const txSelect = 'id, cash_box_id, type, amount, description, notes, receipt_number, transaction_date, created_at, contact_id, contact_name, created_by_user_id, created_by_user_name, cash_box_sequence, tx_sequence_in_box';
            state.allTx = await window.db.transactions.getAll({ select: txSelect });
            console.log('[TxHistory] Got', (state.allTx || []).length, 'transactions');

            // Attach cash box object from local lookup (no join required)
            state.allTx = (Array.isArray(state.allTx) ? state.allTx : []).map((tx) => {
                if (tx && !tx.cash_box && tx.cash_box_id) {
                    tx.cash_box = cashBoxById.get(String(tx.cash_box_id)) || null;
                }
                return tx;
            });

            const createdBySelect = qs('#filterCreatedBy');
            const createdByGroup = qs('#filterGroupCreatedBy');
            const createdByUsers = ensureCreatedBySelectOptions(createdBySelect, state.allTx);

            const contactDatalist = qs('#contactDatalist');
            ensureContactDatalist(contactDatalist, state.allTx);

            applyAutoDefaults();

            console.log('[TxHistory] Data loaded, using Supabase sequence numbers');
        } catch (e) {
            console.error('[TxHistory] Failed to load:', e);
            updateStatsFromList([], null, [], []);
            renderErrorRow(tbody, `Failed to load transactions: ${e && e.message ? e.message : e}`);
            return;
        }

        console.log('[TxHistory] Setting up event listeners...');
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

        // Apply Filters button - filters only apply when clicked
        const applyFiltersBtn = qs('#applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                state.pagination.page = 1;
                render();
            });
        }

        // Clear Filters button - reset all filter inputs and re-render
        const clearFiltersBtn = qs('#clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                // Reset all filter inputs
                qsa('.filter-input', qs('#filterPanel')).forEach((el) => {
                    el.value = '';
                });
                qsa('.filter-select', qs('#filterPanel')).forEach((el) => {
                    el.selectedIndex = 0;
                });

                applyAutoDefaults();

                // Reset direction tabs to "All"
                tabs.forEach((t) => t.classList.remove('active'));
                const allTab = tabs.find((t) => t.dataset.filter === 'all');
                if (allTab) allTab.classList.add('active');
                state.direction = 'all';
                state.pagination.page = 1;
                render();
            });
        }

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
                    const row = cb.closest('tr');
                    if (row) row.classList.toggle('is-selected', cb.checked);
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
                    const row = target.closest('tr');
                    if (row) row.classList.toggle('is-selected', target.checked);
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

        console.log('[TxHistory] All setup done, calling render()');

        function render() {
            console.log('[TxHistory] render() called, allTx count:', state.allTx.length);
            const filters = getFiltersFromUi(state);
            console.log('[TxHistory] filters:', JSON.stringify(filters));
            let visible = applyFilters(state.allTx, filters);
            console.log('[TxHistory] after filter:', visible.length);
            visible = sortTransactions(visible, state.sort);

            // Pass selected currency for stats (null if "All Currencies" - no monetary totals)
            // Total counts always show all in system, monetary stats show filtered
            updateStatsFromList(visible, filters.currency, state.allTx, state.cashBoxes);

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
