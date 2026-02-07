// Auth Guard - Redirect to login if not authenticated
// This script should be included on all app pages (not on public pages like index, login, signup)

(async function() {
    // #region agent log
    console.log('[DEBUG auth-guard v20260207-2210] loaded', window.location.pathname);
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:init',message:'auth-guard start',data:{isInIframe,pathname:window.location.pathname,search:window.location.search},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    try {
        const path = String(window.location.pathname || '').toLowerCase();
        const file = path.split('/').filter(Boolean).pop() || '';
        isReceiptTemplate =
            file.startsWith('spendnote-') &&
            file.includes('receipt') &&
            (file.includes('pdf') || file.includes('email') || file.includes('a4'));
        sp = new URLSearchParams(window.location.search);
        // #region agent log
        console.log('[DEBUG auth-guard] detect', {
            path,
            file,
            isReceiptTemplate,
            isInIframe,
            bootstrap: sp.get('bootstrap'),
            isDemo: sp.get('demo') === '1',
            hasPublicToken: sp.has('publicToken')
        });
        // #endregion
        hasPublicToken = sp.has('publicToken');
        isDemo = sp.get('demo') === '1';
        // Skip auth redirect for receipt templates with public tokens or demo mode
        if (isReceiptTemplate && (hasPublicToken || isDemo)) {
            // #region agent log
            console.log('[DEBUG auth-guard] skip auth redirect (public/demo)');
            // #endregion
            return;
        }
        // For iframes with bootstrap=1, try to establish session but don't redirect on failure
        if (isReceiptTemplate && isInIframe && sp.get('bootstrap') === '1') {
            // Try to bootstrap session for iframe
            const tryBootstrapForIframe = async () => {
                try {
                    const bootstrapKey = 'spendnote.session.bootstrap';
                    const bootstrapData = localStorage.getItem(bootstrapKey);
                    // #region agent log
                    console.log('[DEBUG auth-guard] iframe bootstrap key', {
                        hasData: !!bootstrapData,
                        len: bootstrapData?.length || 0
                    });
                    // #endregion
                    if (!bootstrapData) return;

                    const parsed = JSON.parse(bootstrapData);
                    const accessToken = String(parsed?.access_token || '').trim();
                    const refreshToken = String(parsed?.refresh_token || '').trim();
                    if (!accessToken || !refreshToken) return;

                    const setRes = await window.supabaseClient.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                    // #region agent log
                    console.log('[DEBUG auth-guard] iframe setSession', {
                        hasSession: !!setRes?.data?.session,
                        error: setRes?.error?.message || null
                    });
                    // #endregion
                } catch (_) {}
            };
            await tryBootstrapForIframe();
            return; // Don't redirect iframe on auth failure
        }
        // Skip redirect for iframes entirely (but session bootstrap above will help)
        if (isReceiptTemplate && isInIframe) {
            // #region agent log
            console.log('[DEBUG auth-guard] skip auth redirect (iframe)');
            // #endregion
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
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:tryBootstrap',message:'bootstrap data check',data:{hasData:!!bootstrapData,dataLen:bootstrapData?.length||0},timestamp:Date.now(),hypothesisId:'B,C'})}).catch(()=>{});
                // #endregion
                // #region agent log
                console.log('[DEBUG auth-guard] bootstrap data check', {
                    hasData: !!bootstrapData,
                    len: bootstrapData?.length || 0
                });
                // #endregion
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
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:afterSetSession',message:'setSession result',data:{hasSession:!!result?.data?.session,error:result?.error?.message||null},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                // #region agent log
                console.log('[DEBUG auth-guard] setSession result', {
                    hasSession: !!result?.data?.session,
                    error: result?.error?.message || null
                });
                // #endregion

                // Verify session was actually established
                if (result?.data?.session) {
                    return true;
                }

                // If setSession didn't return session, wait and check again
                await new Promise(r => setTimeout(r, 100));
                const check = await window.supabaseClient.auth.getSession();
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:afterRecheck',message:'session recheck',data:{hasSession:!!check?.data?.session},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                // #region agent log
                console.log('[DEBUG auth-guard] session recheck', {
                    hasSession: !!check?.data?.session
                });
                // #endregion
                return Boolean(check?.data?.session);
            } catch (e) {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:bootstrapError',message:'bootstrap exception',data:{err:e?.message||String(e)},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
                // #endregion
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
    
    // #region agent log
    console.log('[DEBUG auth-guard] final check - hasSession:', !!session, 'hasError:', !!error, 'isReceiptTemplate:', isReceiptTemplate);
    fetch('http://127.0.0.1:7243/ingest/67fbcfb9-05d9-4fc4-9d50-823ee0474032',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth-guard.js:finalCheck',message:'final session decision',data:{hasSession:!!session,hasError:!!error,errorMsg:error?.message||null,isReceiptTemplate,wantBootstrap:sp?.get('bootstrap')==='1'},timestamp:Date.now(),hypothesisId:'C,E'})}).catch(()=>{});
    // #endregion
    if (!session || error) {
        // Not authenticated - redirect to login
        window.location.href = '/spendnote-login.html';
    }
})();
