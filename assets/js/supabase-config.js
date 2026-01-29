// Supabase Configuration
const SUPABASE_URL = 'https://zrnnharudlgxuvewqryj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vg44Z7eJacwji3iLii0Dxg_mQlSfwi-';

if (window.SpendNoteDebug) console.log('SpendNote supabase-config.js build 20260129-1339');
window.__spendnoteSupabaseConfigBuild = '20260129-1339';

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
            const { error } = await supabaseClient
                .from('cash_boxes')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Error deleting cash box:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        }
    },

    // Contacts
    contacts: {
        async getAll() {
            const { data, error } = await supabaseClient
                .from('contacts')
                .select('*')
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
                    .order('transaction_date', { ascending: false });

                if (withCreatedAtOrder) {
                    query = query.order('created_at', { ascending: false });
                }

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

        async getById(id) {
            const attemptJoined = await supabaseClient
                .from('transactions')
                .select(`
                    *,
                    cash_box:cash_boxes(id, name, color, currency),
                    contact:contacts(id, name, email, phone, address)
                `)
                .eq('id', id)
                .single();

            if (!attemptJoined.error && attemptJoined.data) {
                return attemptJoined.data;
            }

            if (attemptJoined.error) {
                console.warn('Joined transaction fetch failed, falling back to plain select:', attemptJoined.error);
            }

            const fallback = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single();

            if (fallback.error) {
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
        }
    }
};

// Export for use in other files
window.supabaseClient = supabaseClient;
window.auth = auth;
window.db = db;
