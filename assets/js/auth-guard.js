// Auth Guard - Redirect to login if not authenticated
// This script should be included on all app pages (not on public pages like index, login, signup)

(async function() {
    let isReceiptTemplate = false;
    let sp = null;
    let hasPublicToken = false;
    let isDemo = false;
    let isInIframe = false;
    try {
        isInIframe = window.self !== window.top;
    } catch (_) {
        isInIframe = true;
    }
    try {
        const path = String(window.location.pathname || '').toLowerCase();
        const file = path.split('/').filter(Boolean).pop() || '';
        isReceiptTemplate =
            file.startsWith('spendnote-') &&
            file.includes('receipt') &&
            (file.includes('pdf') || file.includes('email') || file.includes('a4'));
        sp = new URLSearchParams(window.location.search);
        hasPublicToken = sp.has('publicToken');
        isDemo = sp.get('demo') === '1';
        // Skip auth redirect for receipt templates in iframes, public tokens, or demo mode
        if (isReceiptTemplate && (hasPublicToken || isDemo || isInIframe)) {
            return;
        }
    } catch (_) {
        // ignore
    }

    if (!window.supabaseClient) {
        window.location.href = '/spendnote-login.html';
        return;
    }

    try {
        if (!window.__spendnoteAuthGuardMessageBound) {
            window.__spendnoteAuthGuardMessageBound = true;
            window.addEventListener('message', async (event) => {
                try {
                    if (!event || event.origin !== window.location.origin) return;
                    const data = event.data || {};
                    const type = data.type;
                    if (!type) return;

                    if (type === 'SPENDNOTE_REQUEST_SESSION') {
                        const { data: { session } } = await window.supabaseClient.auth.getSession();
                        if (!session || !event.source || typeof event.source.postMessage !== 'function') return;
                        event.source.postMessage({
                            type: 'SPENDNOTE_SESSION',
                            access_token: session.access_token,
                            refresh_token: session.refresh_token
                        }, event.origin);
                        return;
                    }

                    if (type === 'SPENDNOTE_SESSION') {
                        const accessToken = String(data.access_token || '').trim();
                        const refreshToken = String(data.refresh_token || '').trim();
                        if (!accessToken || !refreshToken) return;
                        await window.supabaseClient.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });
                    }
                } catch (_) {
                    // ignore
                }
            });
        }
    } catch (_) {
        // ignore
    }

    const getSessionSafe = async () => {
        try {
            return await window.supabaseClient.auth.getSession();
        } catch (e) {
            return { data: { session: null }, error: e };
        }
    };

    // Check if user is authenticated
    let { data: { session }, error } = await getSessionSafe();

    if ((!session || error) && isReceiptTemplate && !(hasPublicToken || isDemo)) {
        // Try to get session from opener window via postMessage
        let sessionReceived = false;
        
        const sessionPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), 5000);
            
            const handler = async (event) => {
                try {
                    if (event.origin !== window.location.origin) return;
                    if (event.data?.type !== 'SPENDNOTE_SESSION') return;
                    
                    const accessToken = String(event.data.access_token || '').trim();
                    const refreshToken = String(event.data.refresh_token || '').trim();
                    if (!accessToken || !refreshToken) return;
                    
                    await window.supabaseClient.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                    
                    sessionReceived = true;
                    clearTimeout(timeout);
                    window.removeEventListener('message', handler);
                    resolve(true);
                } catch (_) {}
            };
            
            window.addEventListener('message', handler);
        });
        
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: 'SPENDNOTE_REQUEST_SESSION' }, window.location.origin);
                await sessionPromise;
            }
        } catch (_) {}
        
        if (sessionReceived) {
            ({ data: { session }, error } = await getSessionSafe());
        }
    }
    
    if (!session || error) {
        // Not authenticated - redirect to login
        window.location.href = '/spendnote-login.html';
    }
})();
