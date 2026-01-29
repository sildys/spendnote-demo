// Nav Loader - Loads shared navigation HTML into all pages
// This eliminates duplicate nav HTML across 10+ files

const NAV_HTML = `
<nav class="top-nav">
    <div class="nav-container">
        <a href="dashboard.html" class="nav-logo">
            <svg class="nav-logo-icon" width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6 C10 4.89543 10.8954 4 12 4 L36 4 C37.1046 4 38 4.89543 38 6 L38 38 L36 40 L34 38 L32 40 L30 38 L28 40 L26 38 L24 40 L22 38 L20 40 L18 38 L16 40 L14 38 L12 40 L10 38 Z" fill="url(#nav-logo-gradient)"/>
                <circle cx="17" cy="14" r="3" fill="white"/>
                <rect x="23" y="12" width="10" height="2" rx="1" fill="white" opacity="0.9"/>
                <rect x="23" y="16" width="6" height="2" rx="1" fill="white" opacity="0.7"/>
                <rect x="14" y="22" width="20" height="2" rx="1" fill="white" opacity="0.5"/>
                <rect x="14" y="26" width="20" height="2" rx="1" fill="white" opacity="0.5"/>
                <rect x="14" y="30" width="14" height="2" rx="1" fill="white" opacity="0.5"/>
                <defs>
                    <linearGradient id="nav-logo-gradient" x1="10" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stop-color="var(--active, #059669)"/>
                        <stop offset="1" stop-color="var(--active, #059669)"/>
                    </linearGradient>
                </defs>
            </svg>
            <span class="nav-logo-text">SpendNote</span>
        </a>
        <ul class="nav-links">
            <li><a href="dashboard.html" class="nav-cash-item" data-page="dashboard"><i class="fas fa-chart-line"></i> Dashboard</a></li>
            <li><a href="spendnote-cash-box-list.html" class="nav-cash-item" data-page="cash-boxes"><i class="fas fa-cash-register"></i> Cash Boxes</a></li>
            <li><a href="spendnote-transaction-history.html" id="navTransactions" class="nav-cash-item" data-page="transactions"><i class="fas fa-exchange-alt"></i> Transactions</a></li>
            <li><a href="spendnote-contact-list.html" class="nav-cash-item" data-page="contacts"><i class="fas fa-address-book"></i> Contacts</a></li>
            <li>
                <button class="btn btn-primary nav-new-transaction-btn" id="addTransactionBtn">
                    <i class="fas fa-plus"></i>
                    <span class="btn-text">New Transaction</span>
                </button>
            </li>
            <li class="nav-user-menu">
                <div class="user-avatar" id="userAvatarBtn">
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
