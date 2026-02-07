// Supabase Configuration
const SUPABASE_URL = 'https://zrnnharudlgxuvewqryj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpybm5oYXJ1ZGxneHV2ZXdxcnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTkxMDgsImV4cCI6MjA4Mjg3NTEwOH0.kQLRMVrl_uYYzZwX387uFs_BAXc9c5v7EhcvGhPR7v4';

if (window.SpendNoteDebug) console.log('SpendNote supabase-config.js build 20260207-2100');
window.__spendnoteSupabaseConfigBuild = '20260207-2100';

// If you previously used localStorage persistence, clean it up so tab-close logout works immediately.
// Supabase stores sessions under a project-specific key like: sb-<project-ref>-auth-token
try {
    const legacyKeys = [
        'sb-zrnnharudlgxuvewqryj-auth-token',
        'supabase.auth.token'
    ];

    legacyKeys.forEach((key) => {
        try {
            localStorage.removeItem(key);
        } catch (_) {
            // ignore
        }
    });
} catch (_) {
    // ignore
}

// Initialize Supabase client
var supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // Use sessionStorage so closing the browser/tab will drop the session
        // (user must log in again unless they explicitly keep the tab open)
        storage: (typeof window !== 'undefined' && window.sessionStorage) ? window.sessionStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Bootstrap session management - allows receipt tabs to restore session from localStorage
const __spendnoteWriteBootstrapSession = (session) => {
    try {
        if (session?.access_token && session?.refresh_token) {
            localStorage.setItem('spendnote.session.bootstrap', JSON.stringify({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                ts: Date.now()
            }));
            return true;
        }
    } catch (_) {}
    return false;
};

// Exposed function to write fresh bootstrap before opening receipt tabs
window.writeBootstrapSession = async () => {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            return __spendnoteWriteBootstrapSession(session);
        }
    } catch (_) {}
    return false;
};

try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            try {
                localStorage.removeItem('spendnote.session.bootstrap');
            } catch (_) {}
            return;
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            __spendnoteWriteBootstrapSession(session);
        }
    });

    (async () => {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            __spendnoteWriteBootstrapSession(session);
        } catch (_) {}
    })();
} catch (_) {}

let transactionsJoinSupported = true;

function isUuid(value) {
    const v = String(value || '').trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function parseSnDisplayId(value) {
    const v = String(value || '').trim();
    const full = /^sn(\d+)-(\d+)$/i.exec(v);
    if (full) {
        return { cashBoxSequence: Number(full[1]), txSequenceInBox: Number(full[2]), partialCashBoxSequence: null };
    }

    const cbOnly = /^sn(\d+)(?:-|$)/i.exec(v);
    if (cbOnly && v.includes('-')) {
        return { cashBoxSequence: null, txSequenceInBox: null, partialCashBoxSequence: Number(cbOnly[1]) };
    }

    return null;
}

function applyTxIdQueryToTransactionsQuery(query, txIdQuery) {
    const q = String(txIdQuery || '').trim();
    if (!q) return query;

    const sn = parseSnDisplayId(q);
    if (sn && Number.isFinite(sn.cashBoxSequence) && Number.isFinite(sn.txSequenceInBox)) {
        return query
            .eq('cash_box_sequence', sn.cashBoxSequence)
            .eq('tx_sequence_in_box', sn.txSequenceInBox);
    }

    if (sn && Number.isFinite(sn.partialCashBoxSequence)) {
        return query.eq('cash_box_sequence', sn.partialCashBoxSequence);
    }

    if (isUuid(q)) {
        return query.eq('id', q);
    }

    return query.ilike('receipt_number', `%${q}%`);
}

function applyContactQueryToTransactionsQuery(query, contactQuery) {
    const q = String(contactQuery || '').trim();
    if (!q) return query;
    if (isUuid(q)) {
        return query.eq('contact_id', q);
    }
    return query.ilike('contact_name', `%${q}%`);
}

function formatContactDisplayId(sequenceNumber) {
    const n = Number(sequenceNumber);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `CONT-${String(n).padStart(3, '0')}`;
}

function parseContactDisplayId(value) {
    const v = String(value || '').trim();
    const m = /^cont-(\d+)$/i.exec(v);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}

function normalizeContactQuery(value) {
    const v = String(value || '').trim().toLowerCase();
    const m = /^cont-(\d+)$/.exec(v);
    if (!m) return v;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n <= 0) return v;
    return `cont-${String(n).padStart(3, '0')}`;
}

function formatCashBoxDisplayId(sequenceNumber) {
    const n = Number(sequenceNumber);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `SN-${String(n).padStart(3, '0')}`;
}

function parseCashBoxDisplayId(value) {
    const v = String(value || '').trim().toLowerCase();
    const m = /^(cb|sn)-(\d+)$/.exec(v);
    if (!m) return null;
    const n = Number(m[2]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}

function normalizeCashBoxQuery(value) {
    const v = String(value || '').trim().toLowerCase();
    const m = /^(cb|sn)-(\d+)$/.exec(v);
    if (!m) return v;
    const n = Number(m[2]);
    if (!Number.isFinite(n) || n <= 0) return v;
    return `${m[1]}-${String(n).padStart(3, '0')}`;
}

function normalizeTxIdQuery(value) {
    const v = String(value || '').trim().toLowerCase();
    const m = /^sn(\d+)-(\d+)$/.exec(v);
    if (!m) return v;
    const cb = Number(m[1]);
    const seq = Number(m[2]);
    if (!Number.isFinite(cb) || cb <= 0 || !Number.isFinite(seq) || seq <= 0) return v;
    return `sn${String(cb)}-${String(seq).padStart(3, '0')}`;
}

try {
    window.SpendNoteIds = window.SpendNoteIds || {};
    Object.assign(window.SpendNoteIds, {
        isUuid,
        parseSnDisplayId,
        formatContactDisplayId,
        parseContactDisplayId,
        normalizeContactQuery,
        formatCashBoxDisplayId,
        parseCashBoxDisplayId,
        normalizeCashBoxQuery,
        normalizeTxIdQuery
    });
} catch (_) {

}

// Auth helper functions
var auth = {
    // Get current user
    async getCurrentUser(options = {}) {
        if (!auth.__userCache) {
            auth.__userCache = { user: null, ts: 0, promise: null };
        }

        const ttlMs = 2000;
        const now = Date.now();
        const force = Boolean(options && options.force);

        if (!force && auth.__userCache.user && (now - auth.__userCache.ts) < ttlMs) {
            return auth.__userCache.user;
        }

        if (!force && auth.__userCache.promise) {
            return await auth.__userCache.promise;
        }

        auth.__userCache.promise = (async () => {
            try {
                const { data: { user }, error } = await supabaseClient.auth.getUser();
                if (error) {
                    // Don't log "session missing" as error - it's expected when not logged in
                    if (!error.message?.includes('session') && window.SpendNoteDebug) {
                        console.error('Error getting user:', error);
                    }
                    auth.__userCache.user = null;
                    auth.__userCache.ts = now;
                    return null;
                }
                auth.__userCache.user = user || null;
                auth.__userCache.ts = now;
                return auth.__userCache.user;
            } catch (e) {
                // Catch any unexpected errors silently
                auth.__userCache.user = null;
                auth.__userCache.ts = now;
                return null;
            }
        })();

        try {
            return await auth.__userCache.promise;
        } finally {
            auth.__userCache.promise = null;
        }
    },

    // Sign up new user
    async signUp(email, password, fullName) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });
        if (error) {
            console.error('Error signing up:', error);
            return { success: false, error: error.message };
        }
        if (auth.__userCache) {
            auth.__userCache.user = null;
            auth.__userCache.ts = 0;
            auth.__userCache.promise = null;
        }
        return { success: true, user: data.user };
    },

    // Sign in user
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error('Error signing in:', error);
            return { success: false, error: error.message };
        }
        if (auth.__userCache) {
            auth.__userCache.user = null;
            auth.__userCache.ts = 0;
            auth.__userCache.promise = null;
        }
        return { success: true, user: data.user, session: data.session };
    },

    // Sign out user
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
        if (auth.__userCache) {
            auth.__userCache.user = null;
            auth.__userCache.ts = 0;
            auth.__userCache.promise = null;
        }
        return { success: true };
    },

    // Reset password
    async resetPassword(email) {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/spendnote-login.html`
        });
        if (error) {
            console.error('Error resetting password:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return user !== null;
    },

    // Redirect to login if not authenticated
    async requireAuth() {
        const isAuth = await this.isAuthenticated();
        if (!isAuth) {
            window.location.href = '/spendnote-login.html';
            return false;
        }
        return true;
    }
};

try {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (!auth.__userCache) {
            auth.__userCache = { user: null, ts: 0, promise: null };
        }
        auth.__userCache.user = session?.user || null;
        auth.__userCache.ts = Date.now();
        auth.__userCache.promise = null;
    });
} catch (e) {

}

// Database helper functions
var db = {
    // Cash Boxes
    cashBoxes: {
        async getAll(options = {}) {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return [];
            }

            const select = (options && typeof options.select === 'string' && options.select.trim())
                ? options.select
                : '*';

            // Prefer stable user-defined ordering (sort_order), fallback to creation order
            const primaryQuery = await supabaseClient
                .from('cash_boxes')
                .select(select)
                .eq('user_id', user.id)
                .order('sort_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: true });

            if (!primaryQuery.error) {
                return primaryQuery.data || [];
            }

            console.warn('Cash boxes sort_order query failed, falling back to created_at order:', primaryQuery.error);

            const fallbackQuery = await supabaseClient
                .from('cash_boxes')
                .select(select)
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (fallbackQuery.error) {
                console.error('Error fetching cash boxes:', fallbackQuery.error);
                return [];
            }

            return fallbackQuery.data || [];
        },

        async getMaxSortOrder() {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return 0;
            }

            const { data, error } = await supabaseClient
                .from('cash_boxes')
                .select('sort_order')
                .eq('user_id', user.id)
                .order('sort_order', { ascending: false, nullsFirst: false })
                .limit(1);

            if (error) {
                console.warn('Could not fetch max sort_order (column may be missing):', error);
                return 0;
            }

            const max = data?.[0]?.sort_order;
            const numericMax = Number(max);
            return Number.isFinite(numericMax) ? numericMax : 0;
        },

        async getById(id) {
            const { data, error } = await supabaseClient
                .from('cash_boxes')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                console.error('Error fetching cash box:', error);
                return null;
            }
            return data;
        },

        async create(cashBox) {
            if (window.SpendNoteDebug) console.log('Creating cash box via RPC:', cashBox);
            
            // Use RPC function to bypass schema cache issue
            const { data, error } = await supabaseClient.rpc('create_cash_box', {
                p_name: cashBox.name,
                p_user_id: cashBox.user_id,
                p_currency: cashBox.currency || 'USD',
                p_color: cashBox.color || '#059669',
                p_icon: cashBox.icon || 'building',
                p_current_balance: cashBox.current_balance || 0
            });
            
            if (window.SpendNoteDebug) console.log('RPC result:', { data, error });
            
            if (error) {
                console.error('Error creating cash box:', error);
                return { success: false, error: error.message };
            }
            
            if (window.SpendNoteDebug) console.log('Cash box created with ID:', data);
            return { success: true, data: { ...cashBox, id: data } };
        },

        async update(id, updates) {
            const { error } = await supabaseClient
                .from('cash_boxes')
                .update(updates)
                .eq('id', id);
            if (error) {
                console.error('Error updating cash box:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        },

        async delete(id) {
            try {
                const user = await auth.getCurrentUser();
                if (!user) {
                    console.error('No authenticated user');
                    return { success: false, error: 'Not authenticated' };
                }

                // 1) Delete related transactions
                const txDelete = await supabaseClient
                    .from('transactions')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('cash_box_id', id);

                if (txDelete.error) {
                    console.error('Error deleting cash box transactions:', txDelete.error);
                    return { success: false, error: txDelete.error.message };
                }

                // 2) Delete related access rows
                const accessDelete = await supabaseClient
                    .from('cash_box_access')
                    .delete()
                    .eq('cash_box_id', id);

                if (accessDelete.error) {
                    console.error('Error deleting cash box access:', accessDelete.error);
                    return { success: false, error: accessDelete.error.message };
                }

                // 3) Delete the cash box itself
                const boxDelete = await supabaseClient
                    .from('cash_boxes')
                    .delete()
                    .eq('id', id);

                if (boxDelete.error) {
                    console.error('Error deleting cash box:', boxDelete.error);
                    return { success: false, error: boxDelete.error.message };
                }

                return { success: true };
            } catch (err) {
                console.error('Error deleting cash box:', err);
                return { success: false, error: err?.message || 'Delete failed' };
            }
        }
    },

    // Contacts
    contacts: {
        async getAll() {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return [];
            }

            const { data, error } = await supabaseClient
                .from('contacts')
                .select('*')
                .eq('user_id', user.id)
                .order('name', { ascending: true });
            if (error) {
                console.error('Error fetching contacts:', error);
                return [];
            }
            return data;
        },

        async getById(id) {
            const { data, error } = await supabaseClient
                .from('contacts')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                console.error('Error fetching contact:', error);
                return null;
            }
            return data;
        },

        async create(contact) {
            const { data, error } = await supabaseClient
                .from('contacts')
                .insert([contact])
                .select()
                .single();
            if (error) {
                console.error('Error creating contact:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async getOrCreate(contact) {
            const user = await auth.getCurrentUser();
            if (!user) {
                return { success: false, error: 'Not authenticated' };
            }

            const name = (contact?.name || '').trim();
            if (!name) {
                return { success: false, error: 'Contact name is required' };
            }

            const email = (contact?.email || '').trim() || null;

            let lookup = supabaseClient
                .from('contacts')
                .select('*')
                .eq('user_id', user.id)
                .eq('name', name);

            if (email) {
                lookup = lookup.eq('email', email);
            }

            const { data: existing, error: existingError } = await lookup
                .order('created_at', { ascending: true })
                .limit(1);

            if (!existingError && existing && existing.length) {
                return { success: true, data: existing[0] };
            }

            const createPayload = {
                user_id: user.id,
                name,
                email,
                phone: (contact?.phone || '').trim() || null,
                address: (contact?.address || '').trim() || null,
                notes: (contact?.notes || '').trim() || null
            };

            return await this.create(createPayload);
        },

        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('contacts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                console.error('Error updating contact:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('contacts')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error deleting contact:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        },

        async bulkDelete(ids) {
            if (!Array.isArray(ids) || ids.length === 0) {
                return { success: false, error: 'No IDs provided' };
            }
            const { error } = await supabaseClient
                .from('contacts')
                .delete()
                .in('id', ids);
            if (error) {
                console.error('Error bulk deleting contacts:', error);
                return { success: false, error: error.message };
            }
            return { success: true, count: ids.length };
        }
    },

    // Transactions
    transactions: {
        async getAll(filters = {}) {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return [];
            }

            const runQuery = async ({ select, withCreatedAtOrder }) => {
                let query = supabaseClient
                    .from('transactions')
                    .select(select)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .order('transaction_date', { ascending: false });

                if (!filters.includeSystem) {
                    query = query.or('is_system.is.null,is_system.eq.false');
                }

                if (filters.status) {
                    query = query.eq('status', filters.status);
                }

                // created_at ordering is always applied above to ensure newest transactions appear first

                if (filters.cashBoxId) {
                    query = query.eq('cash_box_id', filters.cashBoxId);
                }
                if (filters.type) {
                    query = query.eq('type', filters.type);
                }
                if (filters.startDate) {
                    query = query.gte('transaction_date', filters.startDate);
                }
                if (filters.endDate) {
                    query = query.lte('transaction_date', filters.endDate);
                }
                if (filters.limit) {
                    query = query.limit(filters.limit);
                }

                return await query;
            };

            const requestedSelect = (filters && typeof filters.select === 'string' && filters.select.trim())
                ? filters.select
                : '*';

            const result = await runQuery({ select: requestedSelect, withCreatedAtOrder: false });

            if (result.error) {
                console.error('Error fetching transactions:', result.error);
                return [];
            }

            return result.data || [];
        },

        async getPage(options = {}) {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return { data: [], count: 0 };
            }

            const select = (options && typeof options.select === 'string' && options.select.trim())
                ? options.select
                : '*';

            const page = Number(options.page) || 1;
            const perPage = Number(options.perPage) || 10;
            const from = Math.max(0, (page - 1) * perPage);
            const to = Math.max(from, from + perPage - 1);

            const buildQuery = (sel) => {
                let query = supabaseClient
                    .from('transactions')
                    .select(sel, { count: 'exact' })
                    .eq('user_id', user.id);

                if (!options.includeSystem) {
                    query = query.or('is_system.is.null,is_system.eq.false');
                }

                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.cashBoxId) query = query.eq('cash_box_id', options.cashBoxId);
                if (options.cashBoxIds && Array.isArray(options.cashBoxIds) && options.cashBoxIds.length) {
                    query = query.in('cash_box_id', options.cashBoxIds);
                }
                if (options.type) query = query.eq('type', options.type);
                if (options.createdByUserId) query = query.eq('created_by_user_id', options.createdByUserId);

                if (options.startDate) query = query.gte('transaction_date', options.startDate);
                if (options.endDate) query = query.lte('transaction_date', options.endDate);

                if (options.amountMin !== undefined && options.amountMin !== null && options.amountMin !== '') {
                    query = query.gte('amount', options.amountMin);
                }
                if (options.amountMax !== undefined && options.amountMax !== null && options.amountMax !== '') {
                    query = query.lte('amount', options.amountMax);
                }

                query = applyTxIdQueryToTransactionsQuery(query, options.txIdQuery);
                query = applyContactQueryToTransactionsQuery(query, options.contactQuery);

                const sortKey = String(options.sortKey || 'date');
                const sortDir = String(options.sortDir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
                const asc = sortDir === 'asc';

                if (sortKey === 'amount') {
                    query = query.order('amount', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'type') {
                    query = query.order('type', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'id') {
                    query = query.order('cash_box_sequence', { ascending: asc, nullsFirst: false });
                    query = query.order('tx_sequence_in_box', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'cash_box') {
                    query = query.order('cash_box_id', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'contact') {
                    query = query.order('contact_name', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'contact_id') {
                    query = query.order('contact_id', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else if (sortKey === 'created_by') {
                    query = query.order('created_by_user_name', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: false });
                } else {
                    // Sort by created_at first (includes time), then transaction_date as fallback
                    query = query.order('created_at', { ascending: asc, nullsFirst: false });
                    query = query.order('transaction_date', { ascending: asc, nullsFirst: false });
                }

                return query;
            };

            const stripMissingColumnFromSelect = (sel, missingColumn) => {
                const col = String(missingColumn || '').trim();
                if (!col) return sel;
                const re = new RegExp('(^|,)\\s*' + col.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\s*(?=,|$)', 'gi');
                const next = String(sel || '')
                    .replace(re, '$1')
                    .replace(/,\s*,/g, ',')
                    .replace(/^\s*,\s*/g, '')
                    .replace(/\s*,\s*$/g, '')
                    .trim();
                return next || sel;
            };

            const run = async (sel) => {
                const q = buildQuery(sel);
                return await q.range(from, to);
            };

            let { data, error, count } = await run(select);

            if (error && typeof error.message === 'string') {
                const msg = error.message;
                const m = msg.match(/column\s+transactions\.([a-zA-Z0-9_]+)\s+does\s+not\s+exist/i);
                if (m && m[1]) {
                    const fallbackSelect = stripMissingColumnFromSelect(select, m[1]);
                    if (fallbackSelect && fallbackSelect !== select) {
                        const retry = await run(fallbackSelect);
                        data = retry.data;
                        error = retry.error;
                        count = retry.count;
                    }
                }
            }

            if (error) {
                const detail = typeof error === 'object' ? JSON.stringify(error) : String(error);
                console.error('Error fetching transactions page:', error);
                return { data: [], count: 0, error: error.message ? `${error.message} (${detail})` : detail };
            }

            return { data: data || [], count: Number(count) || 0 };
        },

        async getStats(options = {}) {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return { count: 0, totalIn: null, totalOut: null };
            }

            try {
                const { data: rpcData, error: rpcError } = await supabaseClient.rpc('spendnote_transactions_stats', {
                    p_user_id: user.id,
                    p_cash_box_ids: (options.cashBoxIds && Array.isArray(options.cashBoxIds) && options.cashBoxIds.length) ? options.cashBoxIds : null,
                    p_type: options.type || null,
                    p_created_by_user_id: options.createdByUserId || null,
                    p_start_date: options.startDate || null,
                    p_end_date: options.endDate || null,
                    p_amount_min: (options.amountMin !== undefined && options.amountMin !== null && options.amountMin !== '') ? options.amountMin : null,
                    p_amount_max: (options.amountMax !== undefined && options.amountMax !== null && options.amountMax !== '') ? options.amountMax : null,
                    p_tx_id_query: options.txIdQuery || null,
                    p_contact_query: options.contactQuery || null,
                    p_status: options.status || null
                });

                if (!rpcError && rpcData) {
                    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
                    return {
                        count: Number(row?.count) || 0,
                        totalIn: Number(row?.total_in ?? row?.totalIn) || 0,
                        totalOut: Number(row?.total_out ?? row?.totalOut) || 0
                    };
                }
            } catch (_) {
                // ignore rpc failures
            }

            let query = supabaseClient
                .from('transactions')
                .select('id,type,amount,status,is_system', { count: 'exact' })
                .eq('user_id', user.id)
                .or('is_system.is.null,is_system.eq.false');

            // Fallback stats should ignore voided transactions (the reversal handles balance)
            if (!options.status) {
                query = query.eq('status', 'active');
            } else {
                query = query.eq('status', options.status);
            }

            if (options.cashBoxId) query = query.eq('cash_box_id', options.cashBoxId);
            if (options.cashBoxIds && Array.isArray(options.cashBoxIds) && options.cashBoxIds.length) {
                query = query.in('cash_box_id', options.cashBoxIds);
            }
            if (options.type) query = query.eq('type', options.type);
            if (options.createdByUserId) query = query.eq('created_by_user_id', options.createdByUserId);

            if (options.startDate) query = query.gte('transaction_date', options.startDate);
            if (options.endDate) query = query.lte('transaction_date', options.endDate);

            if (options.amountMin !== undefined && options.amountMin !== null && options.amountMin !== '') {
                query = query.gte('amount', options.amountMin);
            }
            if (options.amountMax !== undefined && options.amountMax !== null && options.amountMax !== '') {
                query = query.lte('amount', options.amountMax);
            }

            query = applyTxIdQueryToTransactionsQuery(query, options.txIdQuery);
            query = applyContactQueryToTransactionsQuery(query, options.contactQuery);

            const { data, error, count } = await query.limit(5000);
            if (error) {
                console.error('Error fetching transaction stats:', error);
                return { count: 0, totalIn: null, totalOut: null, error: error.message };
            }

            let totalIn = 0;
            let totalOut = 0;
            (data || []).forEach((tx) => {
                const amt = Number(tx?.amount);
                const type = String(tx?.type || '').toLowerCase();
                const status = String(tx?.status || 'active').toLowerCase();
                if (status !== 'active') return;
                if (!Number.isFinite(amt)) return;
                if (type === 'income') totalIn += amt;
                if (type === 'expense') totalOut += amt;
            });

            return { count: Number(count) || 0, totalIn, totalOut };
        },

        async voidTransaction(id, reason) {
            const txId = String(id || '').trim();
            if (!txId) return { success: false, error: 'Missing transaction id' };

            const { data, error } = await supabaseClient.rpc('spendnote_void_transaction', {
                p_tx_id: txId,
                p_reason: reason || null
            });

            if (error) {
                return { success: false, error: error.message };
            }

            const row = Array.isArray(data) ? data[0] : data;
            return { success: true, data: row };
        },

        async getById(id) {
            const txId = String(id || '').trim();
            if (!txId) return null;
            // #region agent log
            console.log('[DEBUG db.transactions.getById] start', { txId });
            // #endregion

            if (transactionsJoinSupported) {
                const attemptJoined = await supabaseClient
                    .from('transactions')
                    .select(`
                        *,
                        cash_box:cash_boxes(id, name, color, currency, icon, sequence_number),
                        contact:contacts(id, name, email, phone, address, sequence_number)
                    `)
                    .eq('id', txId)
                    .single();

                if (!attemptJoined.error && attemptJoined.data) {
                    // #region agent log
                    console.log('[DEBUG db.transactions.getById] joined success', { txId });
                    // #endregion
                    return attemptJoined.data;
                }

                if (attemptJoined.error) {
                    // #region agent log
                    console.log('[DEBUG db.transactions.getById] joined error', {
                        txId,
                        message: attemptJoined.error?.message || null,
                        code: attemptJoined.error?.code || null
                    });
                    // #endregion
                    const msg = String(attemptJoined.error?.message || '');
                    const detail = String(attemptJoined.error?.details || '');
                    const isSchemaCacheRelationshipError =
                        msg.includes('Could not find a relationship') ||
                        msg.includes('schema cache') ||
                        detail.includes('Could not find a relationship') ||
                        detail.includes('schema cache') ||
                        String(attemptJoined.error?.code || '') === 'PGRST200';

                    if (isSchemaCacheRelationshipError) {
                        transactionsJoinSupported = false;
                    } else {
                        console.warn('Joined transaction fetch failed, falling back to plain select:', attemptJoined.error);
                    }
                }
            }

            const fallback = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('id', txId)
                .single();

            if (fallback.error) {
                // #region agent log
                console.log('[DEBUG db.transactions.getById] fallback error', {
                    txId,
                    message: fallback.error?.message || null,
                    code: fallback.error?.code || null
                });
                // #endregion
                console.error('Error fetching transaction:', fallback.error);
                return null;
            }

            const tx = fallback.data || null;
            if (!tx) return null;

            try {
                if (tx.cash_box_id) {
                    const { data: cb } = await supabaseClient
                        .from('cash_boxes')
                        .select('id, name, color, currency')
                        .eq('id', tx.cash_box_id)
                        .single();
                    if (cb) tx.cash_box = cb;
                }

                if (tx.contact_id) {
                    const { data: contact } = await supabaseClient
                        .from('contacts')
                        .select('id, name, email, phone, address')
                        .eq('id', tx.contact_id)
                        .single();
                    if (contact) tx.contact = contact;
                }
            } catch (_) {
                // ignore enrich failures
            }

            return tx;
        },

        async create(transaction) {
            // Prefer atomic RPC: insert transaction + enforce balance rules under a row lock.
            // Fallback to direct insert if RPC is not installed.
            try {
                const rpc = await supabaseClient.rpc('spendnote_create_transaction', { p_tx: transaction });
                if (!rpc.error) {
                    const row = Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
                    const id = row?.transaction_id || row?.transactionId || row?.id;
                    if (id) {
                        return { success: true, data: { id } };
                    }
                    return { success: false, error: 'Transaction created but no id returned.' };
                }

                const msg = String(rpc.error?.message || '');
                const code = String(rpc.error?.code || '');
                const isMissingRpc = code === '42883' || msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist');
                if (!isMissingRpc) {
                    if (msg.includes('INSUFFICIENT_BALANCE')) {
                        return { success: false, error: 'INSUFFICIENT_BALANCE' };
                    }
                    console.error('Error creating transaction (RPC):', rpc.error);
                    return { success: false, error: rpc.error.message || 'Failed to create transaction.' };
                }
            } catch (e) {
                // ignore and fallback below
            }

            const { data, error } = await supabaseClient
                .from('transactions')
                .insert([transaction])
                .select()
                .single();
            if (error) {
                console.error('Error creating transaction:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async update(id, updates) {
            const { data, error } = await supabaseClient
                .from('transactions')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                console.error('Error updating transaction:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async delete(id) {
            const { error } = await supabaseClient
                .from('transactions')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error deleting transaction:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        }
    },

    // Profiles
    profiles: {
        async getCurrent() {
            const user = await auth.getCurrentUser();
            if (!user) return null;

            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        },

        async update(updates) {
            const user = await auth.getCurrentUser();
            if (!user) return { success: false, error: 'Not authenticated' };

            const { data, error } = await supabaseClient
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();
            if (error) {
                console.error('Error updating profile:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        }
    },

    // Team Members (Pro feature)
    teamMembers: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('team_members')
                .select(`
                    *,
                    member:profiles!member_id(id, full_name, email)
                `)
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching team members:', error);
                return [];
            }
            return data;
        },

        async invite(email, role) {
            const user = await auth.getCurrentUser();
            if (!user) return { success: false, error: 'Not authenticated' };

            const { data, error } = await supabaseClient
                .from('team_members')
                .insert([{
                    owner_id: user.id,
                    invited_email: email,
                    role: role,
                    status: 'pending'
                }])
                .select()
                .single();
            if (error) {
                console.error('Error inviting team member:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async updateRole(memberId, role) {
            const { data, error } = await supabaseClient
                .from('team_members')
                .update({ role })
                .eq('id', memberId)
                .select()
                .single();
            if (error) {
                console.error('Error updating team member role:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async remove(memberId) {
            const { error } = await supabaseClient
                .from('team_members')
                .delete()
                .eq('id', memberId);
            if (error) {
                console.error('Error removing team member:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        }
    },

    // Cash Box Access (Pro team feature)
    cashBoxAccess: {
        async grant(cashBoxId, userId) {
            const user = await auth.getCurrentUser();
            if (!user) return { success: false, error: 'Not authenticated' };

            const { data, error } = await supabaseClient
                .from('cash_box_access')
                .insert([{
                    cash_box_id: cashBoxId,
                    user_id: userId,
                    granted_by: user.id
                }])
                .select()
                .single();
            if (error) {
                console.error('Error granting cash box access:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async revoke(cashBoxId, userId) {
            const { error } = await supabaseClient
                .from('cash_box_access')
                .delete()
                .eq('cash_box_id', cashBoxId)
                .eq('user_id', userId);
            if (error) {
                console.error('Error revoking cash box access:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        },

        async getForCashBox(cashBoxId) {
            const { data, error } = await supabaseClient
                .from('cash_box_access')
                .select(`
                    *,
                    user:profiles!user_id(id, full_name, email)
                `)
                .eq('cash_box_id', cashBoxId);
            if (error) {
                console.error('Error fetching cash box access:', error);
                return [];
            }
            return data;
        },

        async getForUser(userId) {
            const { data, error } = await supabaseClient
                .from('cash_box_access')
                .select(`
                    *,
                    cash_box:cash_boxes!cash_box_id(id, name, color)
                `)
                .eq('user_id', userId);
            if (error) {
                console.error('Error fetching user cash box access:', error);
                return [];
            }
            return data;
        }
    }
};

// Export for use in other files
window.supabaseClient = supabaseClient;
window.auth = auth;
window.db = db;
