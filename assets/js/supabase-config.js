// Supabase Configuration
const SUPABASE_URL = 'https://zrnnharudlgxuvewqryj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Vg44Z7eJacwji3iLii0Dxg_mQlSfwi-';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helper functions
const auth = {
    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error getting user:', error);
            return null;
        }
        return user;
    },

    // Sign up new user
    async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
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
        return { success: true, user: data.user };
    },

    // Sign in user
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            console.error('Error signing in:', error);
            return { success: false, error: error.message };
        }
        return { success: true, user: data.user, session: data.session };
    },

    // Sign out user
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    // Reset password
    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

// Database helper functions
const db = {
    // Cash Boxes
    cashBoxes: {
        async getAll() {
            const { data, error } = await supabase
                .from('cash_boxes')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Error fetching cash boxes:', error);
                return [];
            }
            return data;
        },

        async getById(id) {
            const { data, error } = await supabase
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
            const { data, error } = await supabase
                .from('cash_boxes')
                .insert([cashBox])
                .select()
                .single();
            if (error) {
                console.error('Error creating cash box:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async update(id, updates) {
            const { data, error } = await supabase
                .from('cash_boxes')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                console.error('Error updating cash box:', error);
                return { success: false, error: error.message };
            }
            return { success: true, data };
        },

        async delete(id) {
            const { error } = await supabase
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
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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

        async update(id, updates) {
            const { data, error } = await supabase
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
            const { error } = await supabase
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
            let query = supabase
                .from('transactions')
                .select(`
                    *,
                    cash_box:cash_boxes(id, name, color, currency),
                    contact:contacts(id, name)
                `)
                .order('transaction_date', { ascending: false });

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

            const { data, error } = await query;
            if (error) {
                console.error('Error fetching transactions:', error);
                return [];
            }
            return data;
        },

        async getById(id) {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    cash_box:cash_boxes(id, name, color, currency),
                    contact:contacts(id, name, email, phone, address)
                `)
                .eq('id', id)
                .single();
            if (error) {
                console.error('Error fetching transaction:', error);
                return null;
            }
            return data;
        },

        async create(transaction) {
            const { data, error } = await supabase
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
            const { data, error } = await supabase
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
            const { error } = await supabase
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

            const { data, error } = await supabase
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

            const { data, error } = await supabase
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
            const { data, error } = await supabase
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

            const { data, error } = await supabase
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
            const { data, error } = await supabase
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
            const { error } = await supabase
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

            const { data, error } = await supabase
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
            const { error } = await supabase
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
            const { data, error } = await supabase
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
window.supabaseClient = supabase;
window.auth = auth;
window.db = db;
