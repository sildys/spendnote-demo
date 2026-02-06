// Auth Guard - Redirect to login if not authenticated
// This script should be included on all app pages (not on public pages like index, login, signup)

(async function() {
    try {
        const path = String(window.location.pathname || '').toLowerCase();
        const isReceiptTemplate =
            path.endsWith('/spendnote-pdf-receipt.html') ||
            path.endsWith('/spendnote-email-receipt.html') ||
            path.endsWith('/spendnote-receipt-a4-two-copies.html');
        const sp = new URLSearchParams(window.location.search);
        const hasPublicToken = sp.has('publicToken');
        const isDemo = sp.get('demo') === '1';
        if (isReceiptTemplate && (hasPublicToken || isDemo)) {
            return;
        }
    } catch (_) {
        // ignore
    }

    if (!window.supabaseClient) {
        window.location.href = '/spendnote-login.html';
        return;
    }

    // Check if user is authenticated
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (!session || error) {
        // Not authenticated - redirect to login
        window.location.href = '/spendnote-login.html';
    }
})();
