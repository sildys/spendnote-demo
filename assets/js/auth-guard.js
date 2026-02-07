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
        // Skip auth redirect for receipt templates with public tokens or demo mode
        if (isReceiptTemplate && (hasPublicToken || isDemo)) {
            return;
        }
        // For iframes with bootstrap=1, try to establish session but don't redirect on failure
        if (isReceiptTemplate && isInIframe && sp.get('bootstrap') === '1') {
            // Try to bootstrap session for iframe
            const tryBootstrapForIframe = async () => {
                try {
                    const bootstrapKey = 'spendnote.session.bootstrap';
                    const bootstrapData = localStorage.getItem(bootstrapKey);
                    if (!bootstrapData) return;

                    const parsed = JSON.parse(bootstrapData);
                    const accessToken = String(parsed?.access_token || '').trim();
                    const refreshToken = String(parsed?.refresh_token || '').trim();
                    if (!accessToken || !refreshToken) return;

                    await window.supabaseClient.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                } catch (_) {}
            };
            await tryBootstrapForIframe();
            return; // Don't redirect iframe on auth failure
        }
        // Skip redirect for iframes entirely (but session bootstrap above will help)
        if (isReceiptTemplate && isInIframe) {
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
        const wantBootstrapWait = (() => {
            try {
                return sp && (sp.get('bootstrap') === '1');
            } catch (_) {
                return false;
            }
        })();

        const tryBootstrapFromLocalStorage = async () => {
            try {
                const bootstrapKey = 'spendnote.session.bootstrap';
                const bootstrapData = localStorage.getItem(bootstrapKey);
                if (!bootstrapData) return false;

                const parsed = JSON.parse(bootstrapData);
                const accessToken = String(parsed?.access_token || '').trim();
                const refreshToken = String(parsed?.refresh_token || '').trim();
                if (!accessToken || !refreshToken) return false;

                // Set the session
                const result = await window.supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                // Verify session was actually established
                if (result?.data?.session) {
                    return true;
                }

                // If setSession didn't return session, wait and check again
                await new Promise(r => setTimeout(r, 100));
                const check = await window.supabaseClient.auth.getSession();
                return Boolean(check?.data?.session);
            } catch (e) {
                return false;
            }
        };

        const requestSessionFromOpener = async () => {
            try {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({ type: 'SPENDNOTE_REQUEST_SESSION' }, window.location.origin);
                    return true;
                }
            } catch (_) {}
            return false;
        };

        await tryBootstrapFromLocalStorage();
        ({ data: { session }, error } = await getSessionSafe());

        if (!session || error) {
            await requestSessionFromOpener();
        }

        if (wantBootstrapWait) {
            const deadline = Date.now() + 8000;
            let attempts = 0;
            while (Date.now() < deadline) {
                attempts++;
                ({ data: { session }, error } = await getSessionSafe());
                if (session && !error) break;
                
                // Wait with exponential backoff (100ms, 150ms, 200ms, 250ms... capped at 500ms)
                const delay = Math.min(100 + (attempts * 50), 500);
                await new Promise((r) => setTimeout(r, delay));
                
                // Try bootstrap again
                const bootstrapped = await tryBootstrapFromLocalStorage();
                if (bootstrapped) {
                    // Double-check session after successful bootstrap
                    ({ data: { session }, error } = await getSessionSafe());
                    if (session && !error) break;
                }
            }
        }
    }
    
    if (!session || error) {
        // Not authenticated - redirect to login
        window.location.href = '/spendnote-login.html';
    }
})();
