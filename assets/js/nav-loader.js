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
            <li><a href="dashboard.html" class="nav-cash-item" data-page="dashboard"><i class="fas fa-chart-line"></i> Dashboard</a></li>
            <li><a href="spendnote-cash-box-list.html" class="nav-cash-item" data-page="cash-boxes"><i class="fas fa-box-open"></i> Cash Boxes</a></li>
            <li><a href="spendnote-transaction-history.html" id="navTransactions" class="nav-cash-item" data-page="transactions"><i class="fas fa-exchange-alt"></i> Transactions</a></li>
            <li><a href="spendnote-contact-list.html" class="nav-cash-item" data-page="contacts"><i class="fas fa-address-book"></i> Contacts</a></li>
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
                <span class="user-name"></span>
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
    // User avatar dropdown
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatarBtn && userDropdown) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (!userAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // New Transaction button
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', (event) => {
            // On dashboard with modal
            if (typeof window.openModal === 'function' && document.getElementById('createTransactionModal')) {
                event.preventDefault();
                window.openModal();
                return;
            }
            // On other pages - navigate to dashboard
            event.preventDefault();
            window.location.href = 'dashboard.html#new-transaction';
        });
    }

    // Logout links
    document.querySelectorAll('[data-action="logout"]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.auth && typeof window.auth.logout === 'function') {
                await window.auth.logout();
            }
            window.location.href = 'spendnote-login.html';
        });
    });

    // Update user info if available
    if (window.auth && typeof window.updateUserNav === 'function') {
        window.updateUserNav();
    }
}

function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const pageMap = {
        'dashboard': ['dashboard.html', '/'],
        'cash-boxes': ['spendnote-cash-box-list.html', 'spendnote-cash-box-detail.html', 'spendnote-cash-box-settings.html'],
        'transactions': ['spendnote-transaction-history.html', 'spendnote-transaction-detail.html', 'spendnote-create-transaction.html'],
        'contacts': ['spendnote-contact-list.html', 'spendnote-contact-detail.html']
    };

    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        const page = link.dataset.page;
        const isActive = pageMap[page]?.some(path => currentPath.includes(path));
        link.classList.toggle('active', isActive);
    });
}

// Export
window.loadNav = loadNav;
window.NAV_HTML = NAV_HTML;
