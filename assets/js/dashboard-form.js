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

        const submitButtons = Array.from(e.currentTarget.querySelectorAll('button[type="submit"]'));
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
                window.location.href = '/spendnote-login.html';
                return;
            }

            const user = await window.auth.getCurrentUser();
            if (!user) {
                window.location.href = '/spendnote-login.html';
                return;
            }

            const isUuid = function(value) {
                return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));
            };

            if (!isUuid(formData.cashBox)) {
                alert('Please create and select a Cash Box first.');
                return;
            }

            const parseAmount = window.parseModalAmount || function(v) { return parseFloat(String(v || '').replace(/,/g, '.')) || 0; };
            const amountValue = parseAmount(formData.amount);
            
            if (!Number.isFinite(amountValue) || amountValue <= 0) {
                alert('Please enter a valid amount.');
                return;
            }

            const description = (document.getElementById('modalDescription')?.value || '').trim();
            if (!description) {
                alert('Description is required.');
                return;
            }

            const contactName = String(formData.ContactName || '').trim();
            if (!contactName) {
                alert('Contact Name is required.');
                return;
            }
            const contactOtherId = String(document.getElementById('modalContactCompanyId')?.value || '').trim() || null;

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

            if (payload.type === 'expense') {
                const cb = payload.cash_box_id && window.db?.cashBoxes?.getById
                    ? await window.db.cashBoxes.getById(payload.cash_box_id)
                    : null;
                const currentBalance = Number(cb?.current_balance);
                const balance = Number.isFinite(currentBalance) ? currentBalance : 0;
                if (finalAmount > balance) {
                    alert('Not enough funds in this Cash Box.');
                    return;
                }
            }

            // Ensure contact exists
            let ensuredContact = null;
            const shouldSaveContact = Boolean(document.getElementById('modalSaveContact')?.checked);
            if (!payload.contact_id && shouldSaveContact && window.db?.contacts?.getOrCreate && typeof window.db.contacts.getOrCreate === 'function') {
                ensuredContact = await window.db.contacts.getOrCreate({
                    name: contactName,
                    address: payload.contact_address
                });
            } else if (!payload.contact_id && shouldSaveContact && window.db?.contacts?.create && typeof window.db.contacts.create === 'function') {
                ensuredContact = await window.db.contacts.create({
                    user_id: user.id,
                    name: contactName,
                    address: payload.contact_address,
                    notes: null
                });
            }

            if (shouldSaveContact && ensuredContact && ensuredContact.success === false) {
                alert(ensuredContact?.error || 'Could not save contact. Please try again.');
                return;
            }

            // Create transaction
            console.log('[TxSave] Creating transaction with payload:', payload);
            const result = await window.db.transactions.create(payload);
            console.log('[TxSave] Result:', result);
            if (!result || !result.success) {
                const raw = String(result?.error || '').trim();
                const lower = raw.toLowerCase();
                let msg = raw || 'Failed to create transaction.';
                if (lower.includes('permission denied') || lower.includes('row level security') || lower.includes('rls')) {
                    msg = 'Permission denied (RLS). Please log out and log in again. If the problem persists, your profile row may be missing.';
                } else if (lower.includes('foreign key') && (lower.includes('profiles') || lower.includes('user_id'))) {
                    msg = 'Could not save: profile not found for this user. Please log out and log in again.';
                } else if (lower.includes('jwt') || lower.includes('session')) {
                    msg = 'Your session expired. Please log in again.';
                }
                alert(msg);
                return;
            }

            const addAnother = Boolean(document.getElementById('modalAddAnother')?.checked);

            // Reload dashboard data
            if (typeof loadDashboardData === 'function') {
                await loadDashboardData();
            }

            // Handle print receipt action
            if (action === 'done-receipt') {
                if (typeof window.closeModal === 'function') window.closeModal();
                alert('Transaction saved. Printing is not implemented yet.');
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
            alert(error?.message || 'Failed to create transaction.');
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
