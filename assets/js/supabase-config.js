// Supabase Configuration
const SUPABASE_URL = 'https://zrnnharudlgxuvewqryj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpybm5oYXJ1ZGxneHV2ZXdxcnlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTkxMDgsImV4cCI6MjA4Mjg3NTEwOH0.kQLRMVrl_uYYzZwX387uFs_BAXc9c5v7EhcvGhPR7v4';

try {
    const host = String(window.location.hostname || '').toLowerCase();
    if (host === 'www.spendnote.app') {
        const u = new URL(String(window.location.href || ''));
        u.hostname = 'spendnote.app';
        window.location.replace(u.toString());
    }
} catch (_) {
    // ignore
}

if (window.SpendNoteDebug) console.log('SpendNote supabase-config.js build 20260216-2135');
window.__spendnoteSupabaseConfigBuild = '20260216-2135';

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

try {
    if (!window.__spendnoteClientErrorLoggingInstalled) {
        window.__spendnoteClientErrorLoggingInstalled = true;

        window.__spendnoteClientErrorLogState = window.__spendnoteClientErrorLogState || {
            lastTs: 0,
            inProgress: false
        };

        const __spendnoteInsertClientErrorLog = async (payload) => {
            try {
                const st = window.__spendnoteClientErrorLogState;
                const now = Date.now();
                if (st.inProgress) return;
                if (now - (st.lastTs || 0) < 2000) return;
                st.lastTs = now;
                st.inProgress = true;

                const { data: { user }, error } = await supabaseClient.auth.getUser();
                if (error) {
                    if (String(error.message || '').toLowerCase().includes('session')) return;
                    return;
                }
                if (!user) return;

                const baseRow = {
                    user_id: user.id,
                    page_url: String(window.location.href || ''),
                    user_agent: String(navigator.userAgent || ''),
                    metadata: {
                        build: String(window.__spendnoteSupabaseConfigBuild || '')
                    }
                };

                const row = Object.assign({}, baseRow, payload || {});
                row.metadata = Object.assign({}, baseRow.metadata || {}, (payload && payload.metadata) ? payload.metadata : {});

                await supabaseClient.from('client_error_logs').insert(row);
            } catch (_) {
                // ignore
            } finally {
                try { window.__spendnoteClientErrorLogState.inProgress = false; } catch (_) {}
            }
        };

        window.addEventListener('error', (event) => {
            try {
                const msg = String(event?.message || 'Unknown error');
                const err = event?.error;
                __spendnoteInsertClientErrorLog({
                    message: msg,
                    source: String(event?.filename || ''),
                    lineno: Number.isFinite(event?.lineno) ? Number(event.lineno) : null,
                    colno: Number.isFinite(event?.colno) ? Number(event.colno) : null,
                    stack: err?.stack ? String(err.stack) : null,
                    metadata: {
                        type: 'window.error',
                        name: err?.name ? String(err.name) : null
                    }
                });
            } catch (_) {
                // ignore
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            try {
                const reason = event?.reason;
                const msg = String(reason?.message || reason || 'Unhandled promise rejection');
                __spendnoteInsertClientErrorLog({
                    message: msg,
                    stack: reason?.stack ? String(reason.stack) : null,
                    metadata: {
                        type: 'unhandledrejection',
                        name: reason?.name ? String(reason.name) : null
                    }
                });
            } catch (_) {
                // ignore
            }
        });
    }
} catch (_) {
    // ignore
}

const __spendnoteInviteTokenKey = 'spendnote.inviteToken.pending';

const __spendnotePersistInviteTokenFromUrl = () => {
    try {
        const sp = new URLSearchParams(window.location.search);
        const inviteToken = sp.get('inviteToken');
        if (!inviteToken) return;
        localStorage.setItem(__spendnoteInviteTokenKey, String(inviteToken));
    } catch (_) {
        // ignore
    }
};

const __spendnoteEnsureProfileForCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) return;

        try {
            const { data: existing, error: selErr } = await supabaseClient
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();
            if (!selErr && existing?.id) return;
        } catch (_) {
            // ignore
        }

        const email = String(user.email || '').trim();
        const fullName = String(user.user_metadata?.full_name || '').trim() || (email ? email.split('@')[0] : 'User');
        if (!email) return;

        try {
            await supabaseClient
                .from('profiles')
                .insert([{ id: user.id, email, full_name: fullName }]);
        } catch (_) {
            // ignore
        }
    } catch (_) {
        // ignore
    }
};

const __spendnoteAutoAcceptMyInvites = async () => {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;
        console.warn('[invite-auto] Calling spendnote_auto_accept_my_invites...');
        const r = await supabaseClient.rpc('spendnote_auto_accept_my_invites');
        console.warn('[invite-auto] result:', JSON.stringify(r?.data || r?.error));
        if (r?.error) {
            console.warn('[invite-auto] error:', r.error?.message || r.error);
        } else if (r?.data?.accepted > 0) {
            console.warn('[invite-auto] Auto-accepted', r.data.accepted, 'invite(s) for', r.data.email);
            try { localStorage.removeItem(__spendnoteInviteTokenKey); } catch (_) {}
        }
        return r?.data;
    } catch (e) {
        console.warn('[invite-auto] exception:', e?.message || e);
        return null;
    }
};

const __spendnoteTryAcceptPendingInviteToken = async () => {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            return;
        }
    } catch (_) {
        return;
    }
    let token = '';
    try {
        token = String(localStorage.getItem(__spendnoteInviteTokenKey) || '').trim();
    } catch (_) {
        token = '';
    }
    if (!token) {
        console.warn('[invite-accept] No invite token in localStorage, trying auto-accept by email...');
        await __spendnoteAutoAcceptMyInvites();
        return;
    }
    console.warn('[invite-accept] Found token in localStorage, length=' + token.length);

    try {
        await __spendnoteEnsureProfileForCurrentUser();
        console.warn('[invite-accept] ensureProfile done');
    } catch (ep) {
        console.warn('[invite-accept] ensureProfile error (non-fatal):', ep);
    }

    try {
        console.warn('[invite-accept] Calling spendnote_accept_invite_v2...');
        const r = await supabaseClient.rpc('spendnote_accept_invite_v2', { p_token: token });
        console.warn('[invite-accept] v2 result:', JSON.stringify({ data: r?.data, error: r?.error }));
        if (r?.error) throw r.error;
        try { localStorage.removeItem(__spendnoteInviteTokenKey); } catch (_) {}
        console.warn('[invite-accept] SUCCESS via v2');
        return;
    } catch (e1) {
        console.error('[invite-accept] v2 failed:', e1?.message || e1);
        try {
            console.warn('[invite-accept] Trying fallback spendnote_accept_invite...');
            const r2 = await supabaseClient.rpc('spendnote_accept_invite', { p_token: token });
            console.warn('[invite-accept] fallback result:', JSON.stringify({ data: r2?.data, error: r2?.error }));
            if (r2?.error) throw r2.error;
            try { localStorage.removeItem(__spendnoteInviteTokenKey); } catch (_) {}
            console.warn('[invite-accept] SUCCESS via fallback');
        } catch (e2) {
            console.error('[invite-accept] BOTH token RPCs FAILED. v2:', e1?.message || e1, 'fb:', e2?.message || e2);
            console.warn('[invite-accept] Trying auto-accept by email as last resort...');
            await __spendnoteAutoAcceptMyInvites();
        }
    }
};

__spendnotePersistInviteTokenFromUrl();

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
    if (!window.__spendnoteAuthCallbackPromise) {
        window.__spendnoteAuthCallbackPromise = (async () => {
            try {
                const url = new URL(String(window.location.href || ''));
                const sp = url.searchParams;
                const hp = new URLSearchParams(String(url.hash || '').replace(/^#/, ''));

                const code = String(sp.get('code') || '').trim();
                const token_hash = String(sp.get('token_hash') || hp.get('token_hash') || '').trim();
                const type = String(sp.get('type') || hp.get('type') || '').trim();
                const accessToken = String(hp.get('access_token') || '').trim();

                if (!code && !(token_hash && type) && !accessToken) {
                    return { handled: false, success: false, type: null, error: null };
                }

                const cleanupUrl = () => {
                    try {
                        const cleaned = new URL(url.toString());
                        cleaned.searchParams.delete('code');
                        cleaned.searchParams.delete('token_hash');
                        cleaned.searchParams.delete('type');
                        cleaned.searchParams.delete('next');
                        cleaned.hash = '';
                        const qs = cleaned.searchParams.toString();
                        const nextUrl = `${cleaned.pathname}${qs ? `?${qs}` : ''}`;
                        window.history.replaceState({}, '', nextUrl);
                    } catch (_) {}
                };

                const afterSession = async (session) => {
                    try {
                        __spendnoteWriteBootstrapSession(session);
                    } catch (_) {}
                    try {
                        const u = session?.user || null;
                        const displayName = String(u?.user_metadata?.full_name || u?.email || '').trim();
                        if (displayName) {
                            localStorage.setItem('spendnote.user.fullName.v1', displayName);
                        }
                    } catch (_) {}
                    try {
                        await __spendnoteTryAcceptPendingInviteToken();
                    } catch (_) {}
                };

                if (code) {
                    try {
                        await new Promise((r) => setTimeout(r, 0));
                    } catch (_) {}

                    const { data: preData } = await supabaseClient.auth.getSession();
                    if (preData?.session) {
                        cleanupUrl();
                        await afterSession(preData.session);
                        return { handled: true, success: true, type: type || null, error: null };
                    }

                    const { data, error } = await supabaseClient.auth.exchangeCodeForSession(code);
                    if (error) {
                        return { handled: true, success: false, type: type || null, error: String(error.message || error) };
                    }
                    cleanupUrl();
                    if (data?.session) {
                        await afterSession(data.session);
                    }
                    return { handled: true, success: true, type: type || null, error: null };
                }

                if (token_hash && type) {
                    if (type !== 'signup') {
                        return { handled: false, success: false, type, error: null };
                    }
                    const { data, error } = await supabaseClient.auth.verifyOtp({ token_hash, type });
                    if (error) {
                        return { handled: true, success: false, type, error: String(error.message || error) };
                    }
                    cleanupUrl();
                    if (data?.session) {
                        await afterSession(data.session);
                    }
                    return { handled: true, success: true, type, error: null };
                }

                try {
                    await new Promise((r) => setTimeout(r, 0));
                } catch (_) {}

                const { data: { session } } = await supabaseClient.auth.getSession();
                cleanupUrl();
                if (session) {
                    await afterSession(session);
                }
                return { handled: true, success: Boolean(session), type: type || null, error: null };
            } catch (e) {
                try { console.error('Auth callback failed:', e); } catch (_) {}
                return { handled: true, success: false, type: null, error: String(e?.message || e || 'Auth callback failed') };
            }
        })();
    }
} catch (_) {}

try {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            try {
                localStorage.removeItem('spendnote.session.bootstrap');
                localStorage.removeItem('spendnote.user.fullName.v1');
            } catch (_) {}
            return;
        }

        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            __spendnoteWriteBootstrapSession(session);
            try {
                const u = session?.user || null;
                const displayName = String(u?.user_metadata?.full_name || u?.email || '').trim();
                if (displayName) {
                    localStorage.setItem('spendnote.user.fullName.v1', displayName);
                }
            } catch (_) {}
            try {
                __spendnoteTryAcceptPendingInviteToken();
            } catch (_) {}
        }
    });

    (async () => {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            __spendnoteWriteBootstrapSession(session);
            if (session) {
                await __spendnoteTryAcceptPendingInviteToken();
            }
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
    const m = /^sn-(\d+)$/.exec(v);
    if (!m) return null;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
}

function normalizeCashBoxQuery(value) {
    const v = String(value || '').trim().toLowerCase();
    const m = /^sn-(\d+)$/.exec(v);
    if (!m) return v;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n <= 0) return v;
    return `sn-${String(n).padStart(3, '0')}`;
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

const TX_CASH_BOX_SNAPSHOT_COLUMNS = Object.freeze([
    'cash_box_name_snapshot',
    'cash_box_currency_snapshot',
    'cash_box_color_snapshot',
    'cash_box_icon_snapshot',
    'cash_box_id_prefix_snapshot'
]);

function normalizeCashBoxIdPrefix(value) {
    const raw = String(value || '').trim();
    if (!raw) return 'SN';
    const up = raw.toUpperCase();
    if (up === 'REC-') return 'SN';
    return up;
}

function getCashBoxIdPrefixStorageKey(cashBoxId) {
    const id = String(cashBoxId || '').trim();
    if (!id) return '';
    return `spendnote.cashBox.${id}.idPrefix.v1`;
}

function readStoredCashBoxIdPrefix(cashBoxId) {
    try {
        const key = getCashBoxIdPrefixStorageKey(cashBoxId);
        if (!key) return '';
        const raw = localStorage.getItem(key);
        if (!raw) return '';
        return normalizeCashBoxIdPrefix(raw);
    } catch (_) {
        return '';
    }
}

function writeStoredCashBoxIdPrefix(cashBoxId, prefix) {
    try {
        const key = getCashBoxIdPrefixStorageKey(cashBoxId);
        if (!key) return;
        localStorage.setItem(key, normalizeCashBoxIdPrefix(prefix || 'SN'));
    } catch (_) {
        // ignore
    }
}

function resolvePreferredCashBoxIdPrefix(snapshotPrefixValue, livePrefixValue, cashBoxId) {
    const snapshotRaw = String(snapshotPrefixValue || '').trim();
    const liveRaw = String(livePrefixValue || '').trim();
    const snapshotPrefix = snapshotRaw ? normalizeCashBoxIdPrefix(snapshotRaw) : '';
    const livePrefix = liveRaw ? normalizeCashBoxIdPrefix(liveRaw) : '';
    const storedPrefix = readStoredCashBoxIdPrefix(cashBoxId);

    if (snapshotPrefix && snapshotPrefix !== 'SN') return snapshotPrefix;
    if (livePrefix && livePrefix !== 'SN') return livePrefix;
    if (storedPrefix && storedPrefix !== 'SN') return storedPrefix;
    return snapshotPrefix || livePrefix || storedPrefix || 'SN';
}

function applyStoredCashBoxIdPrefixFallback(row) {
    if (!row || typeof row !== 'object') return row;
    const next = { ...row };
    const cashBoxId = String(next.id || '').trim();
    if (!cashBoxId) return next;

    const dbPrefix = String(next.id_prefix || '').trim();
    const normalizedDbPrefix = dbPrefix ? normalizeCashBoxIdPrefix(dbPrefix) : '';
    const storedPrefix = readStoredCashBoxIdPrefix(cashBoxId);

    if (storedPrefix && (!normalizedDbPrefix || normalizedDbPrefix === 'SN')) {
        next.id_prefix = storedPrefix;
    } else if (normalizedDbPrefix) {
        next.id_prefix = normalizedDbPrefix;
    }

    return next;
}

function normalizeCashBoxCurrency(value) {
    const raw = String(value || '').trim().toUpperCase();
    return /^[A-Z]{3}$/.test(raw) ? raw : '';
}

function normalizeCashBoxColor(value) {
    const raw = String(value || '').trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
    if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`;
    return '';
}

function buildTxCashBoxSnapshot(tx, cashBox) {
    const row = (cashBox && typeof cashBox === 'object') ? cashBox : {};
    const snapshot = {};
    const cashBoxId = String(tx?.cash_box_id || row?.id || '').trim();

    const name = String(tx?.cash_box_name_snapshot || row?.name || '').trim();
    if (name) snapshot.name = name;

    const currency = normalizeCashBoxCurrency(tx?.cash_box_currency_snapshot || row?.currency);
    if (currency) snapshot.currency = currency;

    const color = normalizeCashBoxColor(tx?.cash_box_color_snapshot || row?.color);
    if (color) snapshot.color = color;

    const icon = String(tx?.cash_box_icon_snapshot || row?.icon || '').trim();
    if (icon) snapshot.icon = icon;

    const idPrefix = resolvePreferredCashBoxIdPrefix(
        tx?.cash_box_id_prefix_snapshot,
        row?.id_prefix,
        cashBoxId
    );
    if (idPrefix) snapshot.id_prefix = idPrefix;

    return snapshot;
}

function applyTxCashBoxSnapshot(tx) {
    if (!tx || typeof tx !== 'object') return tx;
    const baseCashBox = (tx.cash_box && typeof tx.cash_box === 'object')
        ? { ...tx.cash_box }
        : {};
    const snapshot = buildTxCashBoxSnapshot(tx, baseCashBox);
    const merged = Object.assign({}, baseCashBox, snapshot);
    tx.cash_box = Object.keys(merged).length ? merged : null;
    return tx;
}

function applyTxCashBoxSnapshotToPayload(payload, cashBox) {
    const next = payload && typeof payload === 'object' ? { ...payload } : {};
    const snapshot = buildTxCashBoxSnapshot(next, cashBox);

    const name = String(next.cash_box_name_snapshot || snapshot.name || '').trim();
    next.cash_box_name_snapshot = name || null;

    const currency = normalizeCashBoxCurrency(next.cash_box_currency_snapshot || snapshot.currency);
    next.cash_box_currency_snapshot = currency || null;

    const color = normalizeCashBoxColor(next.cash_box_color_snapshot || snapshot.color);
    next.cash_box_color_snapshot = color || null;

    const icon = String(next.cash_box_icon_snapshot || snapshot.icon || '').trim();
    next.cash_box_icon_snapshot = icon || null;

    const idPrefix = resolvePreferredCashBoxIdPrefix(
        next.cash_box_id_prefix_snapshot,
        snapshot.id_prefix,
        next.cash_box_id || cashBox?.id
    );
    next.cash_box_id_prefix_snapshot = idPrefix || 'SN';

    return next;
}

function extractMissingTransactionsColumn(error) {
    const message = String(error?.message || '');
    const details = String(error?.details || '');
    const hint = String(error?.hint || '');
    const text = [message, details, hint].filter(Boolean).join(' ');
    if (!text) return '';

    const hasTransactionsContext = /transactions/i.test(text);
    const patterns = [
        /column\s+transactions\.([a-zA-Z0-9_]+)\s+does\s+not\s+exist/i,
        /column\s+"?([a-zA-Z0-9_]+)"?\s+of\s+relation\s+"?transactions"?\s+does\s+not\s+exist/i,
        /could\s+not\s+find\s+the\s+'([a-zA-Z0-9_]+)'\s+column\s+of\s+'transactions'\s+in\s+the\s+schema\s+cache/i,
        /could\s+not\s+find\s+the\s+"([a-zA-Z0-9_]+)"\s+column\s+of\s+"transactions"\s+in\s+the\s+schema\s+cache/i,
        /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i
    ];

    for (const re of patterns) {
        const match = re.exec(text);
        if (!match || !match[1]) continue;
        const column = String(match[1]).trim().toLowerCase();
        if (!column) continue;
        if (hasTransactionsContext || TX_CASH_BOX_SNAPSHOT_COLUMNS.includes(column)) {
            return column;
        }
    }

    return '';
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
    async signUp(email, password, fullName, options = {}) {
        const emailRedirectTo = options?.emailRedirectTo ? String(options.emailRedirectTo) : null;
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                },
                ...(emailRedirectTo ? { emailRedirectTo } : {})
            }
        });
        if (error) {
            if (window.SpendNoteDebug) console.error('Error signing up:', error);
            return { success: false, error: error.message };
        }
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            return { success: false, error: 'Email already registered. Please log in instead.' };
        }
        if (auth.__userCache) {
            auth.__userCache.user = null;
            auth.__userCache.ts = 0;
            auth.__userCache.promise = null;
        }
        return { success: true, user: data.user, session: data.session || null, needsEmailConfirmation: !data.session };
    },

    // Sign in user
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            if (window.SpendNoteDebug) console.error('Error signing in:', error);
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
            if (window.SpendNoteDebug) console.error('Error signing out:', error);
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
            if (window.SpendNoteDebug) console.error('Error resetting password:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    async resendSignupConfirmation(email, options = {}) {
        const emailRedirectTo = options?.emailRedirectTo ? String(options.emailRedirectTo) : null;
        try {
            const { error } = await supabaseClient.auth.resend({
                type: 'signup',
                email,
                options: {
                    ...(emailRedirectTo ? { emailRedirectTo } : {})
                }
            });
            if (error) {
                if (window.SpendNoteDebug) console.error('Error resending confirmation:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (e) {
            const msg = String(e?.message || 'Failed to resend confirmation.');
            if (window.SpendNoteDebug) console.error('Error resending confirmation (exception):', e);
            return { success: false, error: msg };
        }
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

        if (__orgContextCache) {
            __orgContextCache.orgId = null;
            __orgContextCache.ownerUserId = null;
            __orgContextCache.ts = 0;
            __orgContextCache.promise = null;
        }
    });
} catch (e) {

}

var __orgContextCache = { orgId: null, ownerUserId: null, ts: 0, promise: null };

async function getMyOrgContext() {
    const user = await auth.getCurrentUser();
    if (!user) return { orgId: null, ownerUserId: null };

    const now = Date.now();
    if (__orgContextCache.orgId && (now - (__orgContextCache.ts || 0)) < 30_000) {
        return { orgId: __orgContextCache.orgId, ownerUserId: __orgContextCache.ownerUserId };
    }

    if (__orgContextCache.promise) {
        return await __orgContextCache.promise;
    }

    __orgContextCache.promise = (async () => {
        const { data: memberships, error: memError } = await supabaseClient
            .from('org_memberships')
            .select('org_id,role,created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (memError) {
            __orgContextCache.orgId = null;
            __orgContextCache.ownerUserId = null;
            __orgContextCache.ts = Date.now();
            __orgContextCache.promise = null;
            return { orgId: null, ownerUserId: null };
        }

        const list = Array.isArray(memberships) ? memberships : [];
        const pick = (role) => list.find((m) => String(m?.role || '').toLowerCase() === role);
        const chosen = pick('owner') || pick('admin') || list[0] || null;
        const orgId = chosen?.org_id || null;
        let ownerUserId = null;

        if (orgId) {
            const { data: orgRow, error: orgError } = await supabaseClient
                .from('orgs')
                .select('owner_user_id')
                .eq('id', orgId)
                .single();
            if (!orgError) {
                ownerUserId = orgRow?.owner_user_id || null;
            }
        }

        __orgContextCache.orgId = orgId;
        __orgContextCache.ownerUserId = ownerUserId;
        __orgContextCache.ts = Date.now();
        __orgContextCache.promise = null;
        return { orgId, ownerUserId };
    })();

    return await __orgContextCache.promise;
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

            const ctx = await getMyOrgContext();
            const orgId = ctx?.orgId || null;

            let myRole = null;
            if (orgId) {
                try {
                    const { data: memRow, error: memErr } = await supabaseClient
                        .from('org_memberships')
                        .select('role')
                        .eq('org_id', orgId)
                        .eq('user_id', user.id)
                        .single();
                    if (!memErr) {
                        myRole = String(memRow?.role || '').toLowerCase() || null;
                    }
                } catch (_) {
                    // ignore
                }
            }

            const isOrgAdminLike = myRole === 'owner' || myRole === 'admin';

            // Users should not see all cash boxes in the org; only those assigned via cash_box_memberships.
            if (orgId && !isOrgAdminLike) {
                const { data: memData, error: memErr } = await supabaseClient
                    .from('cash_box_memberships')
                    .select('cash_box_id')
                    .eq('user_id', user.id);

                if (memErr) {
                    console.error('Error fetching cash box memberships:', memErr);
                    return [];
                }

                const ids = (Array.isArray(memData) ? memData : [])
                    .map((r) => r?.cash_box_id)
                    .filter(Boolean);

                if (!ids.length) {
                    return [];
                }

                let qb = supabaseClient
                    .from('cash_boxes')
                    .select(select)
                    .in('id', ids)
                    .order('sort_order', { ascending: true, nullsFirst: false })
                    .order('created_at', { ascending: true });

                qb = qb.eq('org_id', orgId);

                const { data: boxes, error: boxErr } = await qb;
                if (boxErr) {
                    console.error('Error fetching cash boxes for user:', boxErr);
                    return [];
                }

                return (boxes || []).map(applyStoredCashBoxIdPrefixFallback);
            }

            // Prefer stable user-defined ordering (sort_order), fallback to creation order
            let q1 = supabaseClient
                .from('cash_boxes')
                .select(select);
            if (orgId) {
                q1 = q1.eq('org_id', orgId);
            }
            const primaryQuery = await q1
                .order('sort_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: true });

            if (!primaryQuery.error) {
                return (primaryQuery.data || []).map(applyStoredCashBoxIdPrefixFallback);
            }

            console.warn('Cash boxes sort_order query failed, falling back to created_at order:', primaryQuery.error);

            let q2 = supabaseClient
                .from('cash_boxes')
                .select(select);
            if (orgId) {
                q2 = q2.eq('org_id', orgId);
            }
            const fallbackQuery = await q2
                .order('created_at', { ascending: true });

            if (fallbackQuery.error) {
                console.error('Error fetching cash boxes:', fallbackQuery.error);
                return [];
            }

            return (fallbackQuery.data || []).map(applyStoredCashBoxIdPrefixFallback);
        },

        async getMaxSortOrder() {
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return 0;
            }

            const ctx = await getMyOrgContext();
            const orgId = ctx?.orgId || null;

            let q = supabaseClient
                .from('cash_boxes')
                .select('sort_order');
            if (orgId) {
                q = q.eq('org_id', orgId);
            }
            const { data, error } = await q
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
            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return null;
            }

            const ctx = await getMyOrgContext();
            const orgId = ctx?.orgId || null;

            let myRole = null;
            if (orgId) {
                try {
                    const { data: memRow, error: memErr } = await supabaseClient
                        .from('org_memberships')
                        .select('role')
                        .eq('org_id', orgId)
                        .eq('user_id', user.id)
                        .single();
                    if (!memErr) {
                        myRole = String(memRow?.role || '').toLowerCase() || null;
                    }
                } catch (_) {
                    // ignore
                }
            }

            const isOrgAdminLike = myRole === 'owner' || myRole === 'admin';

            if (orgId && !isOrgAdminLike) {
                const { data: memRow, error: memErr } = await supabaseClient
                    .from('cash_box_memberships')
                    .select('cash_box_id')
                    .eq('user_id', user.id)
                    .eq('cash_box_id', id)
                    .limit(1);

                if (memErr) {
                    return null;
                }

                const hasMembership = Array.isArray(memRow) ? Boolean(memRow[0]?.cash_box_id) : false;
                if (!hasMembership) {
                    return null;
                }

                let q = supabaseClient
                    .from('cash_boxes')
                    .select('*')
                    .eq('id', id);
                q = q.eq('org_id', orgId);

                const { data, error } = await q.single();
                if (error) return null;
                return applyStoredCashBoxIdPrefixFallback(data);
            }

            let q = supabaseClient
                .from('cash_boxes')
                .select('*')
                .eq('id', id);
            if (orgId) {
                q = q.eq('org_id', orgId);
            }
            const { data, error } = await q.single();
            if (error) {
                console.error('Error fetching cash box:', error);
                return null;
            }
            return applyStoredCashBoxIdPrefixFallback(data);
        },

        async getBySequence(sequenceNumber) {
            const seq = Number(sequenceNumber);
            if (!Number.isFinite(seq) || seq <= 0) {
                return null;
            }

            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return null;
            }

            const ctx = await getMyOrgContext();

            let myRole = null;
            if (ctx?.orgId) {
                try {
                    const { data: memRow, error: memErr } = await supabaseClient
                        .from('org_memberships')
                        .select('role')
                        .eq('org_id', ctx.orgId)
                        .eq('user_id', user.id)
                        .single();
                    if (!memErr) {
                        myRole = String(memRow?.role || '').toLowerCase() || null;
                    }
                } catch (_) {
                    // ignore
                }
            }

            const isOrgAdminLike = myRole === 'owner' || myRole === 'admin';

            if (ctx?.orgId && !isOrgAdminLike) {
                const { data: memData, error: memErr } = await supabaseClient
                    .from('cash_box_memberships')
                    .select('cash_box_id')
                    .eq('user_id', user.id);

                if (memErr) {
                    return null;
                }

                const ids = (Array.isArray(memData) ? memData : [])
                    .map((r) => r?.cash_box_id)
                    .filter(Boolean);

                if (!ids.length) {
                    return null;
                }

                const { data, error } = await supabaseClient
                    .from('cash_boxes')
                    .select('*')
                    .eq('org_id', ctx.orgId)
                    .eq('sequence_number', seq)
                    .in('id', ids)
                    .limit(1);

                if (error) {
                    return null;
                }

                const row = Array.isArray(data) ? data[0] : data;
                return row ? applyStoredCashBoxIdPrefixFallback(row) : null;
            }

            let query = supabaseClient
                .from('cash_boxes')
                .select('*')
                .eq('sequence_number', seq);

            if (ctx?.orgId) {
                query = query.eq('org_id', ctx.orgId);
            }

            const { data, error } = await query.single();

            if (error) {
                return null;
            }

            return applyStoredCashBoxIdPrefixFallback(data);
        },

        async create(cashBox) {
            const ctx = await getMyOrgContext();
            const currentUser = await auth.getCurrentUser();
            const ownerUserId = ctx?.ownerUserId || cashBox.user_id;
            const orgId = ctx?.orgId || null;
            const normalizedPrefix = normalizeCashBoxIdPrefix(cashBox?.id_prefix || 'SN');

            const extractMissingCashBoxesColumn = (error) => {
                const text = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ');
                if (!text) return '';
                const patterns = [
                    /column\s+cash_boxes\.([a-zA-Z0-9_]+)\s+does\s+not\s+exist/i,
                    /column\s+"?([a-zA-Z0-9_]+)"?\s+of\s+relation\s+"?cash_boxes"?\s+does\s+not\s+exist/i,
                    /could\s+not\s+find\s+the\s+'([a-zA-Z0-9_]+)'\s+column\s+of\s+'cash_boxes'\s+in\s+the\s+schema\s+cache/i,
                    /could\s+not\s+find\s+the\s+"([a-zA-Z0-9_]+)"\s+column\s+of\s+"cash_boxes"\s+in\s+the\s+schema\s+cache/i,
                    /column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i
                ];
                for (const re of patterns) {
                    const m = re.exec(text);
                    if (m && m[1]) return String(m[1]).trim().toLowerCase();
                }
                return '';
            };

            const makeInsertPayload = (userId) => ({
                name: cashBox?.name,
                user_id: userId,
                currency: cashBox?.currency || 'USD',
                color: cashBox?.color || '#059669',
                icon: cashBox?.icon || 'building',
                current_balance: cashBox?.current_balance || 0,
                initial_balance: cashBox?.current_balance || 0,
                org_id: orgId,
                id_prefix: normalizedPrefix || 'SN'
            });

            const directInsertUserIds = [];
            const primaryInsertUserId = String(ownerUserId || '').trim();
            const currentInsertUserId = String(currentUser?.id || '').trim();
            if (primaryInsertUserId) directInsertUserIds.push(primaryInsertUserId);
            if (currentInsertUserId && currentInsertUserId !== primaryInsertUserId) {
                directInsertUserIds.push(currentInsertUserId);
            }

            let lastInsertError = null;

            // Prefer direct insert so id_prefix is persisted at creation time.
            try {
                for (let i = 0; i < directInsertUserIds.length; i++) {
                    let payload = makeInsertPayload(directInsertUserIds[i]);

                    for (let attempt = 0; attempt < 6; attempt++) {
                        const { data, error } = await supabaseClient
                            .from('cash_boxes')
                            .insert([payload])
                            .select('*')
                            .single();

                        if (!error) {
                            const resolvedData = applyStoredCashBoxIdPrefixFallback(data);
                            if (resolvedData?.id) {
                                writeStoredCashBoxIdPrefix(resolvedData.id, resolvedData.id_prefix || normalizedPrefix || 'SN');
                            }
                            return { success: true, data: resolvedData };
                        }

                        lastInsertError = error;

                        const missingColumn = extractMissingCashBoxesColumn(error);
                        if (missingColumn && Object.prototype.hasOwnProperty.call(payload, missingColumn)) {
                            const nextPayload = { ...payload };
                            delete nextPayload[missingColumn];
                            payload = nextPayload;
                            continue;
                        }

                        break;
                    }
                }
            } catch (_) {
                // ignore and fallback to RPC
            }

            if (window.SpendNoteDebug && lastInsertError) {
                console.log('Direct cash box insert fallback to RPC due error:', lastInsertError);
            }

            if (window.SpendNoteDebug) console.log('Creating cash box via RPC fallback:', cashBox);

            const hasPrefixRpcMismatch = (rpcErr, paramName) => {
                const errText = String(rpcErr?.message || '').toLowerCase();
                const code = String(rpcErr?.code || '').toUpperCase();
                return (
                    errText.includes(String(paramName || '').toLowerCase()) &&
                    (
                        errText.includes('does not exist') ||
                        errText.includes('unexpected') ||
                        errText.includes('could not find the function') ||
                        errText.includes('schema cache') ||
                        code === 'PGRST202' ||
                        code === '404'
                    )
                );
            };

            // Fallback to legacy RPC path.
            let rpcResult = await supabaseClient.rpc('create_cash_box', {
                p_name: cashBox.name,
                p_user_id: ownerUserId,
                p_currency: cashBox.currency || 'USD',
                p_color: cashBox.color || '#059669',
                p_icon: cashBox.icon || 'building',
                p_current_balance: cashBox.current_balance || 0,
                p_id_prefix: normalizedPrefix || 'SN'
            });

            if (rpcResult?.error && hasPrefixRpcMismatch(rpcResult.error, 'p_id_prefix')) {
                rpcResult = await supabaseClient.rpc('create_cash_box', {
                    p_name: cashBox.name,
                    p_user_id: ownerUserId,
                    p_currency: cashBox.currency || 'USD',
                    p_color: cashBox.color || '#059669',
                    p_icon: cashBox.icon || 'building',
                    p_current_balance: cashBox.current_balance || 0,
                    p_prefix: normalizedPrefix || 'SN'
                });
            }

            if (rpcResult?.error && hasPrefixRpcMismatch(rpcResult.error, 'p_prefix')) {
                rpcResult = await supabaseClient.rpc('create_cash_box', {
                    p_name: cashBox.name,
                    p_user_id: ownerUserId,
                    p_currency: cashBox.currency || 'USD',
                    p_color: cashBox.color || '#059669',
                    p_icon: cashBox.icon || 'building',
                    p_current_balance: cashBox.current_balance || 0
                });
            }

            if (window.SpendNoteDebug) console.log('RPC fallback result:', rpcResult);

            if (rpcResult?.error) {
                console.error('Error creating cash box:', rpcResult.error);
                return { success: false, error: rpcResult.error.message };
            }

            const createdId = rpcResult?.data;
            if (!createdId) {
                return { success: false, error: 'Cash box created but no id returned.' };
            }

            let persistedPrefix = '';
            try {
                const { data: createdRow } = await supabaseClient
                    .from('cash_boxes')
                    .select('id, id_prefix')
                    .eq('id', createdId)
                    .maybeSingle();

                persistedPrefix = normalizeCashBoxIdPrefix(createdRow?.id_prefix || '');

                if (normalizedPrefix && normalizedPrefix !== 'SN' && (!persistedPrefix || persistedPrefix === 'SN')) {
                    const prefixUpdate = await supabaseClient
                        .from('cash_boxes')
                        .update({ id_prefix: normalizedPrefix })
                        .eq('id', createdId)
                        .select('id, id_prefix')
                        .maybeSingle();
                    if (!prefixUpdate?.error) {
                        persistedPrefix = normalizeCashBoxIdPrefix(prefixUpdate?.data?.id_prefix || persistedPrefix);
                    }
                }
            } catch (_) {
                // ignore prefix verification/update failures
            }

            const effectivePrefix = resolvePreferredCashBoxIdPrefix('', persistedPrefix, createdId);
            const finalPrefix = (effectivePrefix === 'SN' && normalizedPrefix && normalizedPrefix !== 'SN')
                ? normalizedPrefix
                : (effectivePrefix || normalizedPrefix || 'SN');
            writeStoredCashBoxIdPrefix(createdId, finalPrefix);

            if (window.SpendNoteDebug) console.log('Cash box created with ID:', createdId);
            return { success: true, data: { ...cashBox, id: createdId, id_prefix: finalPrefix } };
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
                    .eq('cash_box_id', id);

                if (txDelete.error) {
                    console.error('Error deleting cash box transactions:', txDelete.error);
                    return { success: false, error: txDelete.error.message };
                }

                // 2) Delete related access rows
                const membershipDelete = await supabaseClient
                    .from('cash_box_memberships')
                    .delete()
                    .eq('cash_box_id', id);

                if (membershipDelete.error) {
                    console.error('Error deleting cash box memberships:', membershipDelete.error);
                    return { success: false, error: membershipDelete.error.message };
                }

                try {
                    const legacyDelete = await supabaseClient
                        .from('cash_box_access')
                        .delete()
                        .eq('cash_box_id', id);

                    void legacyDelete;
                } catch (_) {

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

        async getBySequence(sequenceNumber) {
            const seq = Number(sequenceNumber);
            if (!Number.isFinite(seq) || seq <= 0) {
                return null;
            }

            const user = await auth.getCurrentUser();
            if (!user) {
                console.error('No authenticated user');
                return null;
            }

            const ctx = await getMyOrgContext();

            let query = supabaseClient
                .from('contacts')
                .select('*')
                .eq('sequence_number', seq);

            if (ctx?.orgId) {
                query = query.eq('org_id', ctx.orgId);
            }

            const { data, error } = await query.single();

            if (error) {
                return null;
            }

            return data;
        },

        async create(contact) {
            let payload = contact ? { ...contact } : {};
            try {
                const user = await auth.getCurrentUser();
                if (user) {
                    const ctx = await getMyOrgContext();
                    if (ctx?.orgId && !payload.org_id) payload.org_id = ctx.orgId;
                    if (!payload.user_id) payload.user_id = ctx?.ownerUserId || user.id;
                }
            } catch (_) {
                // ignore
            }

            const { data, error } = await supabaseClient
                .from('contacts')
                .insert([payload])
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

            const ctx = await getMyOrgContext();

            const name = (contact?.name || '').trim();
            if (!name) {
                return { success: false, error: 'Contact name is required' };
            }

            const email = (contact?.email || '').trim() || null;

            let lookup = supabaseClient
                .from('contacts')
                .select('*')
                .eq('name', name);

            if (ctx?.orgId) {
                lookup = lookup.eq('org_id', ctx.orgId);
            }

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
                user_id: ctx?.ownerUserId || user.id,
                org_id: ctx?.orgId || null,
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
                    ;

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

            let activeSelect = select;
            let { data, error, count } = await run(activeSelect);

            for (let attempt = 0; attempt < 8 && error; attempt++) {
                const missingColumn = extractMissingTransactionsColumn(error);
                if (!missingColumn) break;

                const fallbackSelect = stripMissingColumnFromSelect(activeSelect, missingColumn);
                if (!fallbackSelect || fallbackSelect === activeSelect) break;

                activeSelect = fallbackSelect;
                const retry = await run(activeSelect);
                data = retry.data;
                error = retry.error;
                count = retry.count;
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

            let query = supabaseClient
                .from('transactions')
                .select('id,type,amount,status,is_system', { count: 'exact' })
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
            if (window.SpendNoteDebug) console.log('[DEBUG db.transactions.getById] start', { txId });
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
                    if (window.SpendNoteDebug) console.log('[DEBUG db.transactions.getById] joined success', { txId });
                    // #endregion
                    return applyTxCashBoxSnapshot(attemptJoined.data);
                }

                if (attemptJoined.error) {
                    // #region agent log
                    if (window.SpendNoteDebug) console.log('[DEBUG db.transactions.getById] joined error', {
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
                if (window.SpendNoteDebug) console.log('[DEBUG db.transactions.getById] fallback error', {
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
                        .select('id, name, color, currency, icon, sequence_number, id_prefix')
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

            return applyTxCashBoxSnapshot(tx);
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

            let insertPayload = { ...(transaction || {}) };

            try {
                const cashBoxId = String(insertPayload.cash_box_id || '').trim();
                if (cashBoxId) {
                    const cashBoxRes = await supabaseClient
                        .from('cash_boxes')
                        .select('id, name, currency, color, icon, id_prefix')
                        .eq('id', cashBoxId)
                        .maybeSingle();

                    if (!cashBoxRes.error && cashBoxRes.data) {
                        insertPayload = applyTxCashBoxSnapshotToPayload(insertPayload, cashBoxRes.data);
                    }
                }
            } catch (_) {
                // ignore snapshot enrichment failures
            }

            let workingPayload = { ...insertPayload };
            let lastError = null;

            for (let attempt = 0; attempt < 6; attempt++) {
                const { data, error } = await supabaseClient
                    .from('transactions')
                    .insert([workingPayload])
                    .select()
                    .single();

                if (!error) {
                    return { success: true, data };
                }

                lastError = error;
                const missingColumn = extractMissingTransactionsColumn(error);
                const canStripSnapshotColumn = Boolean(
                    missingColumn &&
                    TX_CASH_BOX_SNAPSHOT_COLUMNS.includes(missingColumn) &&
                    Object.prototype.hasOwnProperty.call(workingPayload, missingColumn)
                );

                if (!canStripSnapshotColumn) {
                    console.error('Error creating transaction:', error);
                    return { success: false, error: error.message };
                }

                const nextPayload = { ...workingPayload };
                delete nextPayload[missingColumn];
                workingPayload = nextPayload;
            }

            if (lastError) {
                console.error('Error creating transaction:', lastError);
                return { success: false, error: lastError.message };
            }

            return { success: false, error: 'Failed to create transaction.' };
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

    orgMemberships: {
        async getMyOrgId() {
            const ctx = await getMyOrgContext();
            return ctx?.orgId || null;
        },

        async getMyRole() {
            const user = await auth.getCurrentUser();
            if (!user) return null;
            const ctx = await getMyOrgContext();
            if (!ctx?.orgId) return null;

            const { data, error } = await supabaseClient
                .from('org_memberships')
                .select('role')
                .eq('org_id', ctx.orgId)
                .eq('user_id', user.id)
                .single();
            if (error) return null;
            return data?.role || null;
        },

        async getOrgOwnerUserId() {
            const ctx = await getMyOrgContext();
            return ctx?.ownerUserId || null;
        }
    },

    // Team Members (Pro feature)
    teamMembers: {
        async getAll() {
            const ctx = await getMyOrgContext();
            const orgId = ctx?.orgId;
            if (!orgId) return [];

            const membersRes = await supabaseClient
                .from('org_memberships')
                .select('org_id,user_id,role,created_at')
                .eq('org_id', orgId)
                .order('created_at', { ascending: true });

            if (membersRes.error) {
                console.error('Error fetching org members:', membersRes.error);
                return [];
            }

            const rows = membersRes.data || [];
            const userIds = Array.from(new Set(rows.map((m) => m?.user_id).filter(Boolean)));

            let profilesById = new Map();
            if (userIds.length) {
                const profRes = await supabaseClient
                    .from('profiles')
                    .select('id,full_name,email')
                    .in('id', userIds);
                if (!profRes.error) {
                    profilesById = new Map((profRes.data || []).map((p) => [p.id, p]));
                }
            }

            let acceptedEmailByUserId = new Map();
            const acceptedInvRes = await supabaseClient
                .from('invites')
                .select('accepted_by,invited_email,status')
                .eq('org_id', orgId)
                .eq('status', 'active');
            if (!acceptedInvRes.error) {
                for (const it of acceptedInvRes.data || []) {
                    const uid = it?.accepted_by || null;
                    const em = String(it?.invited_email || '').trim();
                    if (uid && em) acceptedEmailByUserId.set(uid, em);
                }
            }

            const members = rows.map((m) => {
                const uid = m?.user_id || '';
                let memberObj = profilesById.get(uid) || null;
                if (!memberObj) {
                    const invitedEmail = acceptedEmailByUserId.get(uid) || '';
                    let synthName = '';
                    if (invitedEmail) {
                        try {
                            synthName = invitedEmail.split('@')[0] || '';
                            synthName = synthName.replace(/[._-]+/g, ' ').trim();
                            synthName = synthName ? (synthName.charAt(0).toUpperCase() + synthName.slice(1)) : '';
                        } catch (_) {}
                    }
                    if (invitedEmail) {
                        memberObj = { id: uid, full_name: synthName || invitedEmail, email: invitedEmail };
                    }
                }
                return {
                    id: uid,
                    org_id: m?.org_id || orgId,
                    member_id: uid,
                    member: memberObj,
                    role: m?.role || 'user',
                    status: 'active'
                };
            });

            const invitesRes = await supabaseClient
                .from('invites')
                .select('id,invited_email,role,status,created_at')
                .eq('org_id', orgId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            const memberEmails = new Set(
                members
                    .map((m) => String(m?.member?.email || '').trim().toLowerCase())
                    .filter(Boolean)
            );

            const invites = invitesRes?.error
                ? []
                : (invitesRes.data || []).map((i) => {
                    return {
                        id: i?.id || '',
                        org_id: orgId,
                        invited_email: i?.invited_email || null,
                        role: i?.role || 'user',
                        status: i?.status || 'pending',
                        member: null,
                        member_id: null
                    };
                }).filter((i) => {
                    const email = String(i?.invited_email || '').trim().toLowerCase();
                    if (!email) return true;
                    return !memberEmails.has(email);
                });

            return [...members, ...invites];
        },

        async invite(email, role) {
            const ctx = await getMyOrgContext();
            if (!ctx?.orgId) return { success: false, error: 'No org' };

            const { data, error } = await supabaseClient.rpc('spendnote_create_invite', {
                p_org_id: ctx.orgId,
                p_invited_email: email,
                p_role: role || 'user',
                p_expires_at: null
            });

            if (error) {
                console.error('Error creating invite:', error);
                return { success: false, error: error.message };
            }

            const row = Array.isArray(data) ? data[0] : data;

            let emailSent = false;
            let emailError = null;

            try {
                const token = row?.token;
                if (token) {
                    const link = `${window.location.origin}/spendnote-signup.html?inviteToken=${encodeURIComponent(token)}&invitedEmail=${encodeURIComponent(String(email || '').trim())}`;
                    const sessionRes = await supabaseClient.auth.getSession();
                    let accessToken = String(sessionRes?.data?.session?.access_token || '');
                    if (!accessToken) throw new Error('Not authenticated');

                    const looksLikeJwt = (v) => {
                        const s = String(v || '');
                        return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(s);
                    };

                    if (!looksLikeJwt(accessToken)) {
                        try {
                            await supabaseClient.auth.refreshSession();
                            const s2 = await supabaseClient.auth.getSession();
                            accessToken = String(s2?.data?.session?.access_token || '');
                        } catch (_) {
                            // ignore
                        }
                    }

                    if (!looksLikeJwt(accessToken)) {
                        throw new Error('Session is invalid. Please log out and log in again.');
                    }

                    const doRequest = async (jwt) => {
                        return await fetch(`${SUPABASE_URL}/functions/v1/send-invite-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${jwt}`,
                                'apikey': SUPABASE_ANON_KEY
                            },
                            body: JSON.stringify({
                                invitedEmail: email,
                                inviteLink: link,
                                role: row?.role || role || 'user',
                                inviteToken: token
                            })
                        });
                    };

                    let resp = await doRequest(accessToken);

                    if (resp.status === 401) {
                        try {
                            await supabaseClient.auth.refreshSession();
                            const s2 = await supabaseClient.auth.getSession();
                            const nextToken = String(s2?.data?.session?.access_token || '');
                            if (looksLikeJwt(nextToken)) resp = await doRequest(nextToken);
                        } catch (_) {
                            // ignore
                        }
                    }

                    if (resp.status === 401) {
                        try {
                            await supabaseClient.auth.signOut();
                        } catch (_) {
                            // ignore
                        }
                    }

                    const text = await resp.text();
                    let payload = null;
                    try {
                        payload = text ? JSON.parse(text) : null;
                    } catch (_) {
                        payload = null;
                    }

                    if (!resp.ok) {
                        emailSent = false;
                        if (resp.status === 401) {
                            emailError = 'Session expired/invalid. Please log in again.';
                        } else {
                            emailError = payload?.detail || payload?.error || text || `HTTP ${resp.status}`;
                        }
                    } else {
                        emailSent = true;
                    }
                }
            } catch (err) {
                emailSent = false;
                emailError = err?.message || String(err);
            }

            return { success: true, data: row, emailSent, emailError };
        },

        async updateInviteRole(inviteId, role) {
            const ctx = await getMyOrgContext();
            if (!ctx?.orgId) return { success: false, error: 'No org' };

            const nextRole = String(role || '').toLowerCase() === 'admin' ? 'admin' : 'user';
            const { data, error } = await supabaseClient
                .from('invites')
                .update({ role: nextRole })
                .eq('org_id', ctx.orgId)
                .eq('id', inviteId)
                .select('id,role,status,invited_email')
                .single();

            if (error) {
                console.error('Error updating invite role:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        },

        async updateRole(memberId, role) {
            const ctx = await getMyOrgContext();
            if (!ctx?.orgId) return { success: false, error: 'No org' };

            const nextRole = String(role || '').toLowerCase() === 'admin' ? 'admin' : 'user';
            const { data, error } = await supabaseClient
                .from('org_memberships')
                .update({ role: nextRole })
                .eq('org_id', ctx.orgId)
                .eq('user_id', memberId)
                .select('org_id,user_id,role')
                .single();

            if (error) {
                console.error('Error updating org member role:', error);
                return { success: false, error: error.message };
            }

            return { success: true, data };
        },

        async remove(memberId) {
            const ctx = await getMyOrgContext();
            if (!ctx?.orgId) return { success: false, error: 'No org' };

            const membershipDelete = await supabaseClient
                .from('org_memberships')
                .delete()
                .eq('org_id', ctx.orgId)
                .eq('user_id', memberId)
                .select('user_id');

            if (membershipDelete.error) {
                console.error('Error removing org membership:', membershipDelete.error);
                return { success: false, error: membershipDelete.error.message };
            }

            if (Array.isArray(membershipDelete.data) && membershipDelete.data.length) {
                return { success: true };
            }

            // Pending invite removal: prefer SECURITY DEFINER RPC (RLS-safe)
            try {
                const { data, error } = await supabaseClient.rpc('spendnote_delete_invite', {
                    p_invite_id: memberId
                });

                if (!error) {
                    const payload = Array.isArray(data) ? data[0] : data;
                    if (payload?.success) {
                        return { success: true };
                    }
                }
            } catch (_) {
                // ignore
            }

            const inviteDelete = await supabaseClient
                .from('invites')
                .delete()
                .eq('org_id', ctx.orgId)
                .eq('id', memberId)
                .select('id');

            if (inviteDelete.error) {
                console.error('Error deleting invite:', inviteDelete.error);
                return { success: false, error: inviteDelete.error.message };
            }

            if (!Array.isArray(inviteDelete.data) || !inviteDelete.data.length) {
                return { success: false, error: 'Invite was not deleted (not found or not allowed).' };
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
                .from('cash_box_memberships')
                .insert([{
                    cash_box_id: cashBoxId,
                    user_id: userId,
                    role_in_box: 'user'
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
                .from('cash_box_memberships')
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
                .from('cash_box_memberships')
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
                .from('cash_box_memberships')
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
