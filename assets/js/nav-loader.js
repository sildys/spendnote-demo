// Nav Loader - Loads shared navigation HTML into all pages
// This eliminates duplicate nav HTML across 10+ files

const NAV_HTML = `
<nav class="site-nav">
    <div class="nav-container">
        <a href="dashboard.html" class="logo">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6 C10 4.89543 10.8954 4 12 4 L36 4 C37.1046 4 38 4.89543 38 6 L38 38 L36 40 L34 38 L32 40 L30 38 L28 40 L26 38 L24 40 L22 38 L20 40 L18 38 L16 40 L14 38 L12 40 L10 38 Z" fill="url(#nav-logo-gradient)"/>
                <path d="M32 4 L38 10 L32 10 Z" fill="#000000" opacity="0.25"/>
                <path d="M32 4 L32 10 L38 10" stroke="#047857" stroke-width="1.5" stroke-linejoin="round"/>
                <line x1="14" y1="14" x2="30" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                <line x1="14" y1="19" x2="26" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
                <line x1="14" y1="24" x2="30" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
                <line x1="14" y1="29" x2="22" y2="29" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
                <path d="M10 36 L12 38 L14 36 L16 38 L18 36 L20 38 L22 36 L24 38 L26 36 L28 38 L30 36 L32 38 L34 36 L36 38 L38 36" stroke="#047857" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                    <linearGradient id="nav-logo-gradient" x1="24" y1="4" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#059669"/>
                        <stop offset="100%" stop-color="#10b981"/>
                    </linearGradient>
                </defs>
            </svg>
            <span>SpendNote</span>
        </a>
        <ul class="nav-links">
            <li><a href="dashboard.html" class="nav-cash-item" data-page="dashboard">Dashboard</a></li>
            <li><a href="spendnote-cash-box-list.html" class="nav-cash-item" data-page="cash-boxes">Cash Boxes</a></li>
            <li><a href="spendnote-transaction-history.html" id="navTransactions" class="nav-cash-item" data-page="transactions">Transactions</a></li>
            <li><a href="spendnote-contact-list.html" class="nav-cash-item" data-page="contacts">Contacts</a></li>
            <li>
                <button class="btn btn-primary nav-new-transaction-btn" id="addTransactionBtn">
                    <i class="fas fa-plus"></i>
                    <span class="btn-text">New Transaction</span>
                </button>
            </li>
            <li class="user-avatar-wrapper" id="userAvatarBtn">
                <div class="user-avatar">
                    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="User">
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-menu">
                        <a href="spendnote-user-settings.html" class="user-dropdown-item">
                            <i class="fas fa-cog"></i>
                            Settings
                        </a>
                        <div class="user-dropdown-divider"></div>
                        <a href="#" class="user-dropdown-item" data-action="logout">
                            <i class="fas fa-sign-out-alt"></i>
                            Log out
                        </a>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</nav>
`;

function loadNav(containerId = 'nav-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = NAV_HTML;
        highlightCurrentPage();
        initNavEvents();
    }
}

function initNavEvents() {
    if (window.__spendnoteNavEventsBound) {
        return;
    }
    window.__spendnoteNavEventsBound = true;

    // User avatar dropdown (delegated)
    document.addEventListener('click', (e) => {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (!userAvatarBtn || !userDropdown) {
            return;
        }

        const clickedAvatar = e.target && (e.target.closest ? e.target.closest('#userAvatarBtn') : null);
        const clickedDropdown = e.target && (e.target.closest ? e.target.closest('#userDropdown') : null);

        if (clickedAvatar) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
            return;
        }

        if (!clickedDropdown) {
            userDropdown.classList.remove('show');
        }
    });

    // Logout (delegated)
    document.addEventListener('click', async (e) => {
        const logoutLink = e.target && (e.target.closest ? e.target.closest('[data-action="logout"]') : null);
        if (!logoutLink) {
            return;
        }

        e.preventDefault();

        try {
            if (window.auth && typeof window.auth.signOut === 'function') {
                await window.auth.signOut();
            }
        } finally {
            try {
                localStorage.removeItem('activeCashBoxColor');
                localStorage.removeItem('activeCashBoxRgb');
                localStorage.removeItem('activeCashBoxId');
            } catch (_) {
                // ignore
            }
            window.location.href = 'spendnote-login.html';
        }
    });

    // New Transaction button
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const hasModal = Boolean(document.getElementById('createTransactionModal'));
    const canOpenModal = typeof window.openModal === 'function';

    if (addTransactionBtn && !addTransactionBtn.dataset.navBound) {
        addTransactionBtn.dataset.navBound = '1';

        // Dashboard: open modal
        if (hasModal && canOpenModal) {
            addTransactionBtn.addEventListener('click', (event) => {
                event.preventDefault();
                window.openModal(event);
            });
        } else {
            // Other pages: navigate to dashboard and open modal via hash
            addTransactionBtn.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.href = 'dashboard.html#new-transaction';
            });
        }
    }

    // Update user info if available
    if (window.auth && typeof window.updateUserNav === 'function') {
        window.updateUserNav();
    }
}

function highlightCurrentPage() {
    const currentPathname = window.location.pathname || '';
    const currentFile = (currentPathname.split('/').filter(Boolean).pop() || 'dashboard.html').toLowerCase();
    const pageMap = {
        'dashboard': ['dashboard.html'],
        'cash-boxes': ['spendnote-cash-box-list.html', 'spendnote-cash-box-detail.html', 'spendnote-cash-box-settings.html'],
        'transactions': ['spendnote-transaction-history.html', 'spendnote-transaction-detail.html', 'spendnote-create-transaction.html'],
        'contacts': ['spendnote-contact-list.html', 'spendnote-contact-detail.html']
    };

    const links = Array.from(document.querySelectorAll('.nav-links a'));
    links.forEach((link) => link.classList.remove('active'));

    // 1) Prefer data-page mapping (high-level sections)
    let matched = false;
    links
        .filter((link) => link && link.dataset && link.dataset.page)
        .forEach((link) => {
            const page = link.dataset.page;
            const isActive = pageMap[page]?.some((file) => currentFile === String(file).toLowerCase());
            if (isActive) {
                link.classList.add('active');
                matched = true;
            }
        });

    // 2) Fallback: exact filename match against href (covers edge cases)
    if (!matched) {
        links.forEach((link) => {
            const href = (link.getAttribute('href') || '').trim();
            if (!href || href.startsWith('#') || href.startsWith('http')) {
                return;
            }

            const hrefFile = href.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
            if (hrefFile && hrefFile.toLowerCase() === currentFile) {
                link.classList.add('active');
            }
        });
    }
}

// Export
window.loadNav = loadNav;
window.NAV_HTML = NAV_HTML;
