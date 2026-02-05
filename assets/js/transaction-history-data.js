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
            return new Intl.NumberFormat('en-US', {
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
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

    function getContactDisplayId(tx) {
        const seq = Number(tx?.contact?.sequence_number);
        if (Number.isFinite(seq) && seq > 0) {
            return `CONT-${String(seq).padStart(3, '0')}`;
        }
        return '—';
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
            const c = cb && cb.currency ? safeText(cb.currency, '').trim().toUpperCase() : '';
            if (c) currencies.add(c);
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
        const currency = safeText(qs('#filterCurrency')?.value, '').trim().toUpperCase();
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

    function renderLoadingRow(tbody) {
        if (!tbody) return;
        tbody.innerHTML = '';
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="10" style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-weight: 700;">Loading…</td>';
        tbody.appendChild(tr);
    }

    function renderTableRows(tbody, txs) {
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!txs || txs.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="10" style="padding: 24px 10px; text-align: center; color: var(--text-muted); font-weight: 700;">No transactions found.</td>';
            tbody.appendChild(tr);
            return;
        }

        txs.forEach((tx) => {
            const t = safeText(tx.type, '').toLowerCase();
            const isIncome = t === 'income';
            const isVoided = safeText(tx.status, 'active').toLowerCase() === 'voided';
            const cashBoxColor = normalizeHexColor(tx.cash_box?.color || '#059669');
            const cashBoxRgb = hexToRgb(cashBoxColor);
            const currency = tx.cash_box?.currency || 'USD';

            const tr = document.createElement('tr');
            tr.style.setProperty('--cashbox-rgb', cashBoxRgb);
            tr.style.setProperty('--cashbox-color', cashBoxColor);
            tr.tabIndex = 0;

            const displayId = getDisplayId(tx);
            const contactName = safeText(tx.contact?.name || tx.contact_name, '—');
            const contactId = getContactDisplayId(tx);
            const createdBy = safeText(tx.created_by_user_name || tx.created_by, '—');

            const initials = getInitials(createdBy === '—' ? '' : createdBy);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#10b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
            const avatarUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

            const pillClass = isVoided ? 'void' : (isIncome ? 'in' : 'out');
            const pillIcon = isVoided ? 'fa-ban' : (isIncome ? 'fa-arrow-down' : 'fa-arrow-up');
            const pillLabel = isVoided ? 'VOID' : (isIncome ? 'IN' : 'OUT');

            tr.innerHTML = `
                <td><input type="checkbox" class="row-checkbox" data-tx-id="${safeText(tx.id, '')}"></td>
                <td>
                    <div class="tx-type-pill ${pillClass}">
                        <span class="quick-icon"><i class="fas ${pillIcon}"></i></span>
                        <span class="quick-label">${pillLabel}</span>
                    </div>
                </td>
                <td><span class="tx-id">${displayId}</span></td>
                <td><span class="tx-date">${formatDateShort(tx.transaction_date || tx.created_at)}</span></td>
                <td><span class="cashbox-badge" style="--cb-color: ${cashBoxColor};">${safeText(tx.cash_box?.name, 'Unknown')}</span></td>
                <td><span class="tx-contact">${contactName}</span></td>
                <td><span class="tx-contact-id">${contactId}</span></td>
                <td><span class="tx-amount ${isIncome ? 'in' : 'out'} ${isVoided ? 'voided' : ''}">${formatCurrency(tx.amount, currency)}</span></td>
                <td><div class="tx-createdby"><div class="user-avatar user-avatar-small"><img src="${avatarUrl}" alt="${createdBy}"></div></div></td>
                <td>
                    <div class="tx-actions">
                        <button type="button" class="tx-action btn-duplicate" data-tx-id="${safeText(tx.id, '')}" data-cash-box-id="${safeText(tx.cash_box_id || tx.cash_box?.id, '')}" data-direction="${isIncome ? 'in' : 'out'}" data-amount="${safeText(tx.amount, '')}" data-date="${safeText(tx.transaction_date || tx.created_at, '')}" data-contact-id="${safeText(tx.contact_id || tx.contact?.id, '')}" data-description="${encodeURIComponent(safeText(tx.description, ''))}" data-contact-name="${encodeURIComponent(safeText(contactName, ''))}">
                            <i class="fas fa-copy"></i>
                            <span>Duplicate</span>
                        </button>
                        <a href="spendnote-transaction-detail.html?id=${encodeURIComponent(tx.id)}" class="tx-action btn-view">
                            <span>View</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
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

        // Counts should reflect the active filter result
        const list = Array.isArray(filteredList) ? filteredList : [];
        if (elTotal) elTotal.textContent = String(list.length);

        if (elBoxes) {
            const unique = new Set();
            list.forEach((tx) => {
                const id = safeText(tx?.cash_box_id || tx?.cash_box?.id, '').trim();
                if (id) unique.add(id);
            });
            elBoxes.textContent = String(unique.size);
        }

        // Monetary stats sum the FILTERED list (only when currency filter is active)
        if (selectedCurrency) {
            let totalIn = 0;
            let totalOut = 0;
            list.forEach((tx) => {
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

            const labelEl = qs('#paginationText', infoEl);
            if (labelEl) {
                labelEl.textContent = text;
            } else {
                infoEl.textContent = text;
                const select = qs('#perPageSelect');
                if (select) infoEl.insertAdjacentElement('afterbegin', select);
            }
        }

        if (!container) return;
        container.innerHTML = '';

        const totalPages = Math.max(1, Math.ceil(totalCount / state.perPage));

        const mkBtn = (label, page, opts) => {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn';
            if (label === '<') {
                btn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            } else if (label === '>') {
                btn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            } else {
                btn.textContent = label;
            }
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
        const debug = Boolean(window.SpendNoteDebug);
        if (debug) console.log('[TxHistory] loadTransactionsPage called');
        const tbody = qs('#transactionsTable tbody');
        if (tbody && !window.__txHistoryInitialLoadingRendered) {
            window.__txHistoryInitialLoadingRendered = true;
            renderLoadingRow(tbody);
        }
        if (!window.db || !window.db.transactions || !window.db.cashBoxes) {
            const tries = (window.__txHistoryInitTries || 0) + 1;
            window.__txHistoryInitTries = tries;
            if (debug) console.log('[TxHistory] db not ready, retry', tries);

            if (tries < 20) {
                setTimeout(loadTransactionsPage, 150);
                return;
            }

            console.error('[TxHistory] db never initialized');
            updateStatsFromList([], null, [], []);
            renderErrorRow(tbody, 'App database not initialized.');
            return;
        }
        if (debug) console.log('[TxHistory] db ready, fetching data...');

        renderLoadingRow(tbody);

        const pagination = qs('.pagination-controls');
        const paginationInfo = qs('.pagination-info');
        const perPageSelect = qs('#perPageSelect');

        const state = {
            direction: 'all',
            sort: { key: 'date', direction: 'desc' },
            pagination: getPaginationState(),
            cashBoxes: [],
            cashBoxById: new Map(),
            totalTxCount: 0,
            contactByQuery: new Map()
        };

        const txSelect = 'id, cash_box_id, type, amount, description, receipt_number, transaction_date, created_at, contact_id, contact_name, created_by_user_id, created_by_user_name, cash_box_sequence, tx_sequence_in_box, status, voided_at, voided_by_user_name, contact:contacts(id, name, sequence_number)';

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
        const urlCashBoxId = urlParams.get('cashBoxId');
        // NOTE: Do NOT use localStorage.activeCashBoxId here - it would filter out all transactions
        // that don't belong to the dashboard's active cash box. Only filter by URL param.

        const cashBoxById = state.cashBoxById;

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

        Promise.resolve()
            .then(async () => {
                const contacts = await window.db.contacts.getAll();
                const contactDatalist = qs('#contactDatalist');
                if (contactDatalist) {
                    contactDatalist.innerHTML = '';
                    (Array.isArray(contacts) ? contacts : []).forEach((c) => {
                        const seq = Number(c?.sequence_number);
                        const displayId = (Number.isFinite(seq) && seq > 0) ? `CONT-${String(seq).padStart(3, '0')}` : '';
                        const opt = document.createElement('option');
                        const name = safeText(c?.name, '');
                        const id = safeText(c?.id, '');
                        opt.value = name || id;
                        opt.label = displayId ? `${name || id} (${displayId})` : (name || id);
                        contactDatalist.appendChild(opt);

                        if (displayId && id) {
                            state.contactByQuery.set(displayId.toLowerCase(), id);
                        }

                        if (displayId) {
                            const opt2 = document.createElement('option');
                            opt2.value = displayId;
                            opt2.label = name || id;
                            contactDatalist.appendChild(opt2);
                        }
                    });
                }
            })
            .catch(() => {
                // ignore contacts datalist failures
            });

        Promise.resolve()
            .then(async () => {
                const user = await window.auth.getCurrentUser();
                const team = await window.db.teamMembers.getAll();
                const createdBySelect = qs('#filterCreatedBy');
                if (createdBySelect && user) {
                    const current = safeText(createdBySelect.value, '');
                    createdBySelect.innerHTML = '';

                    const optAll = document.createElement('option');
                    optAll.value = '';
                    optAll.textContent = 'All team members';
                    createdBySelect.appendChild(optAll);

                    const me = document.createElement('option');
                    me.value = user.id;
                    me.textContent = safeText(user.user_metadata?.full_name || user.email, 'Me');
                    createdBySelect.appendChild(me);

                    (Array.isArray(team) ? team : []).forEach((tm) => {
                        const member = tm?.member;
                        const id = safeText(member?.id || tm?.member_id, '');
                        if (!id || id === user.id) return;
                        const label = safeText(member?.full_name || member?.email || tm?.invited_email, id);
                        const opt = document.createElement('option');
                        opt.value = id;
                        opt.textContent = label;
                        createdBySelect.appendChild(opt);
                    });

                    if (current) createdBySelect.value = current;
                }
            })
            .catch(() => {
                // ignore created-by select failures
            });

        Promise.resolve()
            .then(async () => {
                const stats = await window.db.transactions.getStats({});
                state.totalTxCount = Number(stats?.count) || 0;
            })
            .catch(() => {
                state.totalTxCount = 0;
            });

        try {
            if (debug) console.log('[TxHistory] Fetching cash boxes...');
            const cashBoxes = await window.db.cashBoxes.getAll({ select: 'id, name, color, currency' });
            state.cashBoxes = Array.isArray(cashBoxes) ? cashBoxes : [];
            if (debug) console.log('[TxHistory] Got', state.cashBoxes.length, 'cash boxes');

            state.cashBoxes.forEach((cb) => {
                if (cb && cb.id) {
                    cashBoxById.set(String(cb.id), cb);
                }
            });

            const cashBoxDatalist = qs('#cashBoxDatalist');
            ensureCashBoxDatalist(cashBoxDatalist, state.cashBoxes);

            // Populate currency filter dropdown
            const currencySelect = qs('#filterCurrency');
            ensureCurrencySelectOptions(currencySelect, state.cashBoxes);

            applyAutoDefaults();

            if (debug) console.log('[TxHistory] Data loaded (server-side mode)');
        } catch (e) {
            console.error('[TxHistory] Failed to load:', e);
            updateStatsFromList([], null, [], []);
            renderErrorRow(tbody, `Failed to load transactions: ${e && e.message ? e.message : e}`);
            return;
        }

        if (debug) console.log('[TxHistory] Setting up event listeners...');
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

        // Currency filter should apply immediately (common expectation)
        const currencySelect = qs('#filterCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
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
            if (bulkActions) {
                const enabledActions = qsa('.bulk-action-btn:not(:disabled)', bulkActions).length;
                bulkActions.classList.toggle('show', count > 0 && enabledActions > 0);
            }
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

        function escapeCsv(value) {
            const s = value === undefined || value === null ? '' : String(value);
            const needs = /[\n\r\t",]/.test(s);
            const escaped = s.replace(/"/g, '""');
            return needs ? `"${escaped}"` : escaped;
        }

        function downloadTextFile(content, filename, mime) {
            const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 500);
        }

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

        const exportCsvBtn = qs('#exportCSV');
        const exportPdfBtn = qs('#exportPDF');
        const bulkDeleteBtn = qs('#bulkDelete');

        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => {
                window.print();
            });
        }

        if (debug) console.log('[TxHistory] All setup done, calling render()');

        const buildServerQuery = () => {
            const filters = getFiltersFromUi(state);

            if (filters.contactQuery) {
                const mapped = state.contactByQuery.get(String(filters.contactQuery).toLowerCase());
                if (mapped) {
                    filters.contactQuery = mapped;
                }
            }

            // Resolve currency into cash box ids
            let currencyCashBoxIds = null;
            if (filters.currency) {
                currencyCashBoxIds = state.cashBoxes
                    .filter((cb) => safeText(cb?.currency, '').trim().toUpperCase() === filters.currency)
                    .map((cb) => cb.id);
            }

            let cashBoxIds = null;
            if (filters.cashBoxId) {
                cashBoxIds = [filters.cashBoxId];
            } else if (filters.cashBoxQuery) {
                const q = filters.cashBoxQuery;
                const matches = state.cashBoxes
                    .filter((cb) => {
                        const name = safeText(cb?.name, '').toLowerCase();
                        const id = safeText(cb?.id, '').toLowerCase();
                        return name.includes(q) || id.includes(q);
                    })
                    .map((cb) => cb.id);
                if (matches.length) cashBoxIds = matches;
            }

            if (currencyCashBoxIds && cashBoxIds) {
                const set = new Set(currencyCashBoxIds);
                cashBoxIds = cashBoxIds.filter((id) => set.has(id));
            } else if (currencyCashBoxIds) {
                cashBoxIds = currencyCashBoxIds;
            }

            const type = filters.direction === 'in'
                ? 'income'
                : (filters.direction === 'out' ? 'expense' : null);

            return {
                filters,
                cashBoxIds,
                type
            };
        };

        const hasAnyActiveFilter = (ctx) => {
            const f = ctx?.filters || {};
            const hasCashBox = Boolean(f.cashBoxId || f.cashBoxQuery);
            const hasCurrency = Boolean(f.currency);
            const hasDir = Boolean(f.direction && f.direction !== 'all');
            const hasText = Boolean(f.txIdQuery || f.contactQuery);
            const hasCreated = Boolean(f.createdById);
            const hasDates = Boolean(f.dateFrom || f.dateTo);
            const hasAmount = (f.amountMin !== null && f.amountMin !== undefined) || (f.amountMax !== null && f.amountMax !== undefined);
            return hasCashBox || hasCurrency || hasDir || hasText || hasCreated || hasDates || hasAmount;
        };

        const scanFilteredCashBoxIds = async (ctx) => {
            const key = JSON.stringify({
                f: ctx?.filters || {},
                type: ctx?.type || null
            });

            if (state.__cashBoxIdsScanCacheKey === key && state.__cashBoxIdsScanCacheValue instanceof Set) {
                return state.__cashBoxIdsScanCacheValue;
            }

            const seen = new Set();
            const perPage = 1000;
            const maxRows = 5000;
            let page = 1;
            let total = null;

            while (true) {
                const res = await window.db.transactions.getPage({
                    select: 'cash_box_id',
                    page,
                    perPage,
                    cashBoxIds: null,
                    type: ctx?.type || null,
                    createdByUserId: ctx?.filters?.createdById || null,
                    startDate: ctx?.filters?.dateFrom || null,
                    endDate: ctx?.filters?.dateTo || null,
                    amountMin: ctx?.filters?.amountMin,
                    amountMax: ctx?.filters?.amountMax,
                    txIdQuery: ctx?.filters?.txIdQuery || null,
                    contactQuery: ctx?.filters?.contactQuery || null,
                    sortKey: 'date',
                    sortDir: 'desc'
                });

                total = total === null ? (Number(res?.count) || 0) : total;
                const rows = Array.isArray(res?.data) ? res.data : [];
                rows.forEach((r) => {
                    const id = safeText(r?.cash_box_id, '').trim();
                    if (id) seen.add(id);
                });

                if (rows.length < perPage) break;
                if ((page * perPage) >= (total || 0)) break;
                if ((page * perPage) >= maxRows) break;
                page += 1;
            }

            state.__cashBoxIdsScanCacheKey = key;
            state.__cashBoxIdsScanCacheValue = seen;
            return seen;
        };

        const getFilteredCashBoxCount = async (ctx) => {
            const ids = Array.isArray(ctx?.cashBoxIds) ? ctx.cashBoxIds.filter(Boolean) : null;
            if (ids) return ids.length;

            if (!hasAnyActiveFilter(ctx)) {
                return state.cashBoxes.length || 0;
            }

            const seen = await scanFilteredCashBoxIds(ctx);
            return seen.size;
        };

        const updateStats = async (serverCtx) => {
            let currency = serverCtx.filters.currency;

            const elTotal = qs('#statTotalTransactions');
            const elBoxes = qs('#statCashBoxes');
            if (elTotal) elTotal.textContent = String(Number(serverCtx.filteredTxCount) || 0);
            if (elBoxes) {
                try {
                    const boxes = await getFilteredCashBoxCount(serverCtx);
                    elBoxes.textContent = String(Number(boxes) || 0);
                } catch (_) {
                    elBoxes.textContent = String(state.cashBoxes.length || 0);
                }
            }

            const elIn = qs('#statTotalIn');
            const elOut = qs('#statTotalOut');
            const elNet = qs('#statNetBalance');
            const elTodayIn = qs('#statTodayIn');
            const elTodayOut = qs('#statTodayOut');

            if (!currency) {
                const ids = Array.isArray(serverCtx.cashBoxIds) ? serverCtx.cashBoxIds.filter(Boolean) : [];
                if (ids.length) {
                    const currencies = new Set();
                    ids.forEach((id) => {
                        const cb = cashBoxById.get(String(id));
                        const c = safeText(cb?.currency, '').trim().toUpperCase();
                        if (c) currencies.add(c);
                    });
                    if (currencies.size === 1) {
                        currency = Array.from(currencies)[0];
                    }
                }
            }

            if (!currency && hasAnyActiveFilter(serverCtx)) {
                try {
                    const ids = await scanFilteredCashBoxIds(serverCtx);
                    if (ids && ids.size) {
                        const currencies = new Set();
                        ids.forEach((id) => {
                            const cb = cashBoxById.get(String(id));
                            const c = safeText(cb?.currency, '').trim().toUpperCase();
                            if (c) currencies.add(c);
                        });
                        if (currencies.size === 1) {
                            currency = Array.from(currencies)[0];
                        }
                    }
                } catch (_) {
                    // ignore
                }
            }

            if (!currency) {
                if (elIn) elIn.textContent = '—';
                if (elOut) elOut.textContent = '—';
                if (elNet) elNet.textContent = '—';
                if (elTodayIn) elTodayIn.textContent = '—';
                if (elTodayOut) elTodayOut.textContent = '—';
                return;
            }

            const stats = await window.db.transactions.getStats({
                cashBoxIds: serverCtx.cashBoxIds || null,
                type: serverCtx.type || null,
                createdByUserId: serverCtx.filters.createdById || null,
                startDate: serverCtx.filters.dateFrom || null,
                endDate: serverCtx.filters.dateTo || null,
                amountMin: serverCtx.filters.amountMin,
                amountMax: serverCtx.filters.amountMax,
                txIdQuery: serverCtx.filters.txIdQuery || null,
                contactQuery: serverCtx.filters.contactQuery || null,
                status: 'active'
            });

            const totalIn = Number(stats?.totalIn);
            const totalOut = Number(stats?.totalOut);
            if (elIn) elIn.textContent = formatCurrency(Number.isFinite(totalIn) ? totalIn : 0, currency);
            if (elOut) elOut.textContent = formatCurrency(Number.isFinite(totalOut) ? totalOut : 0, currency);
            if (elNet) elNet.textContent = formatCurrency((Number.isFinite(totalIn) ? totalIn : 0) - (Number.isFinite(totalOut) ? totalOut : 0), currency);

            if (elTodayIn || elTodayOut) {
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
                const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

                const dailyStats = await window.db.transactions.getStats({
                    cashBoxIds: serverCtx.cashBoxIds || null,
                    type: serverCtx.type || null,
                    createdByUserId: serverCtx.filters.createdById || null,
                    startDate: todayStart,
                    endDate: todayEnd,
                    amountMin: serverCtx.filters.amountMin,
                    amountMax: serverCtx.filters.amountMax,
                    txIdQuery: serverCtx.filters.txIdQuery || null,
                    contactQuery: serverCtx.filters.contactQuery || null,
                    status: 'active'
                });

                const todayIn = Number(dailyStats?.totalIn);
                const todayOut = Number(dailyStats?.totalOut);
                if (elTodayIn) elTodayIn.textContent = formatCurrency(Number.isFinite(todayIn) ? todayIn : 0, currency);
                if (elTodayOut) elTodayOut.textContent = formatCurrency(Number.isFinite(todayOut) ? todayOut : 0, currency);
            }
        };

        const mapSortKey = (key) => {
            if (key === 'amount') return 'amount';
            if (key === 'type') return 'type';
            if (key === 'id') return 'id';
            if (key === 'cashbox') return 'cash_box';
            if (key === 'contact') return 'contact';
            if (key === 'contact_id') return 'contact_id';
            if (key === 'created_by') return 'created_by';
            return 'date';
        };

        async function render() {
            const serverCtx = buildServerQuery();

            // Short-circuit empty intersection (currency + cashbox query)
            if (Array.isArray(serverCtx.cashBoxIds) && serverCtx.cashBoxIds.length === 0) {
                serverCtx.filteredTxCount = 0;
                await updateStats(serverCtx);
                renderTableRows(tbody, []);
                state.pagination.onChange = render;
                renderPagination(pagination, paginationInfo, state.pagination, 0);
                if (selectAllHeader) selectAllHeader.checked = false;
                updateBulk();
                return;
            }

            renderLoadingRow(tbody);
            const pageRes = await window.db.transactions.getPage({
                select: txSelect,
                page: state.pagination.page,
                perPage: state.pagination.perPage,
                cashBoxIds: serverCtx.cashBoxIds || null,
                currency: serverCtx.filters.currency || null,
                type: serverCtx.type || null,
                createdByUserId: serverCtx.filters.createdById || null,
                startDate: serverCtx.filters.dateFrom || null,
                endDate: serverCtx.filters.dateTo || null,
                amountMin: serverCtx.filters.amountMin,
                amountMax: serverCtx.filters.amountMax,
                txIdQuery: serverCtx.filters.txIdQuery || null,
                contactQuery: serverCtx.filters.contactQuery || null,
                sortKey: mapSortKey(state.sort.key),
                sortDir: state.sort.direction
            });

            if (pageRes && pageRes.error) {
                console.error('[TxHistory] getPage error:', pageRes.error);
                renderErrorRow(tbody, String(pageRes.error || 'Failed to load transactions.'));
                state.pagination.onChange = render;
                renderPagination(pagination, paginationInfo, state.pagination, 0);
                if (selectAllHeader) selectAllHeader.checked = false;
                updateBulk();
                return;
            }

            serverCtx.filteredTxCount = Number(pageRes?.count) || 0;

            const rows = (Array.isArray(pageRes?.data) ? pageRes.data : []).map((tx) => {
                if (tx && !tx.cash_box && tx.cash_box_id) {
                    tx.cash_box = cashBoxById.get(String(tx.cash_box_id)) || null;
                }
                return tx;
            });

            // On pages that don't show the system-wide cash box count (e.g. Cash Box Detail),
            // display the filtered total instead of the global total.
            const pageTotalEl = qs('#statTotalTransactions');
            const boxesEl = qs('#statCashBoxes');
            if (pageTotalEl && !boxesEl) {
                pageTotalEl.textContent = String(Number(pageRes?.count) || 0);
            }

            await updateStats(serverCtx);

            renderTableRows(tbody, rows);

            state.pagination.onChange = render;
            renderPagination(pagination, paginationInfo, state.pagination, Number(pageRes?.count) || 0);

            if (selectAllHeader) selectAllHeader.checked = false;
            updateBulk();
        }

        async function exportFilteredCsv() {
            if (!window.db || !window.db.transactions) return;
            const serverCtx = buildServerQuery();
            if (Array.isArray(serverCtx.cashBoxIds) && serverCtx.cashBoxIds.length === 0) {
                downloadTextFile('Transaction ID,Type,Date,Cash Box,Cash Box ID,Currency,Contact,Contact ID,Amount,Created by,Description,Receipt Number,Transaction UUID\n', 'transactions.csv', 'text/csv;charset=utf-8');
                return;
            }

            const btn = exportCsvBtn;
            const prevText = btn ? btn.textContent : '';
            if (btn) btn.disabled = true;
            if (btn) btn.textContent = 'Exporting…';

            try {
                const exportPerPage = 1000;
                const first = await window.db.transactions.getPage({
                    select: txSelect,
                    page: 1,
                    perPage: exportPerPage,
                    cashBoxIds: serverCtx.cashBoxIds || null,
                    type: serverCtx.type || null,
                    createdByUserId: serverCtx.filters.createdById || null,
                    startDate: serverCtx.filters.dateFrom || null,
                    endDate: serverCtx.filters.dateTo || null,
                    amountMin: serverCtx.filters.amountMin,
                    amountMax: serverCtx.filters.amountMax,
                    txIdQuery: serverCtx.filters.txIdQuery || null,
                    contactQuery: serverCtx.filters.contactQuery || null,
                    sortKey: mapSortKey(state.sort.key),
                    sortDir: state.sort.direction
                });

                const total = Number(first?.count) || 0;
                const maxRows = 10000;
                let allowedTotal = total;

                if (total > maxRows) {
                    const proceed = confirm(`This export matches ${total} transactions. Exporting more than ${maxRows} rows may be slow.\n\nClick OK to export the first ${maxRows} rows, or Cancel to adjust filters.`);
                    if (!proceed) return;
                    allowedTotal = maxRows;
                }

                const all = [];
                const firstRows = Array.isArray(first?.data) ? first.data : [];
                all.push(...firstRows);

                const pages = Math.ceil(allowedTotal / exportPerPage);
                for (let p = 2; p <= pages; p += 1) {
                    const res = await window.db.transactions.getPage({
                        select: txSelect,
                        page: p,
                        perPage: exportPerPage,
                        cashBoxIds: serverCtx.cashBoxIds || null,
                        type: serverCtx.type || null,
                        createdByUserId: serverCtx.filters.createdById || null,
                        startDate: serverCtx.filters.dateFrom || null,
                        endDate: serverCtx.filters.dateTo || null,
                        amountMin: serverCtx.filters.amountMin,
                        amountMax: serverCtx.filters.amountMax,
                        txIdQuery: serverCtx.filters.txIdQuery || null,
                        contactQuery: serverCtx.filters.contactQuery || null,
                        sortKey: mapSortKey(state.sort.key),
                        sortDir: state.sort.direction
                    });
                    const rows = Array.isArray(res?.data) ? res.data : [];
                    all.push(...rows);
                    if (all.length >= allowedTotal) break;
                }

                const cashBoxByIdLocal = cashBoxById;
                const header = [
                    'Transaction ID',
                    'Type',
                    'Date',
                    'Cash Box',
                    'Cash Box ID',
                    'Currency',
                    'Contact',
                    'Contact ID',
                    'Amount',
                    'Created by',
                    'Description',
                    'Receipt Number',
                    'Transaction UUID'
                ].join(',');

                const lines = [header];
                all.slice(0, allowedTotal).forEach((tx) => {
                    const cb = cashBoxByIdLocal.get(String(tx?.cash_box_id)) || null;
                    const currency = safeText(cb?.currency, '');
                    const type = safeText(tx?.type, '');
                    const date = formatDateShort(tx?.transaction_date || tx?.created_at);
                    lines.push([
                        escapeCsv(getDisplayId(tx)),
                        escapeCsv(type),
                        escapeCsv(date),
                        escapeCsv(safeText(cb?.name, '')),
                        escapeCsv(safeText(tx?.cash_box_id, '')),
                        escapeCsv(currency),
                        escapeCsv(safeText(tx?.contact_name, '')),
                        escapeCsv(getContactDisplayId(tx)),
                        escapeCsv(String(tx?.amount ?? '')),
                        escapeCsv(safeText(tx?.created_by_user_name, '')),
                        escapeCsv(safeText(tx?.description, '')),
                        escapeCsv(safeText(tx?.receipt_number, '')),
                        escapeCsv(safeText(tx?.id, ''))
                    ].join(','));
                });

                const csv = lines.join('\n');
                downloadTextFile(csv, 'transactions.csv', 'text/csv;charset=utf-8');
            } finally {
                if (btn) btn.disabled = false;
                if (btn) btn.textContent = prevText;
            }
        }

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                exportFilteredCsv();
            });
        }

        // bulkDeleteBtn intentionally disabled until admin-only void workflow is implemented

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
