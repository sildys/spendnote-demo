// Nav Loader - Loads shared navigation HTML into all pages
// This eliminates duplicate nav HTML across 10+ files

const BOTTOM_NAV_HTML = `
<nav class="bottom-nav" id="bottomNav" aria-label="Main navigation">
    <a href="dashboard.html" class="bottom-nav-item" data-page="dashboard">
        <span class="bottom-nav-icon"><i class="fas fa-home"></i></span>
        <span class="bottom-nav-label">Home</span>
    </a>
    <a href="spendnote-transaction-history.html" class="bottom-nav-item" data-page="transactions">
        <span class="bottom-nav-icon"><i class="fas fa-exchange-alt"></i></span>
        <span class="bottom-nav-label">Transactions</span>
    </a>
    <a href="dashboard.html#new-transaction" class="bottom-nav-item bottom-nav-fab" id="bottomNavFab" data-action="new-tx">
        <span class="bottom-nav-icon"><i class="fas fa-plus"></i></span>
    </a>
    <a href="spendnote-contact-list.html" class="bottom-nav-item" data-page="contacts">
        <span class="bottom-nav-icon"><i class="fas fa-users"></i></span>
        <span class="bottom-nav-label">Contacts</span>
    </a>
    <a href="spendnote-cash-box-list.html" class="bottom-nav-item" data-page="cash-boxes">
        <span class="bottom-nav-icon"><i class="fas fa-box"></i></span>
        <span class="bottom-nav-label">Cash Boxes</span>
    </a>
</nav>
`;

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
        <button class="nav-hamburger" id="navHamburger" aria-label="Open menu" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <ul class="nav-links" id="navLinks">
            <li><a href="dashboard.html" class="nav-cash-item" data-page="dashboard">Dashboard</a></li>
            <li><a href="spendnote-cash-box-list.html" class="nav-cash-item" data-page="cash-boxes">Cash Boxes</a></li>
            <li><a href="spendnote-transaction-history.html" id="navTransactions" class="nav-cash-item" data-page="transactions">Transactions</a></li>
            <li><a href="spendnote-contact-list.html" class="nav-cash-item" data-page="contacts">Contacts</a></li>
            <li class="nav-mobile-new-tx">
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
                        <div id="orgContextDropdownInfo" class="org-context-dropdown-info" style="display:none;"></div>
                        <a href="spendnote-team.html" class="user-dropdown-item" id="dropdownTeamLink">
                            <i class="fas fa-users"></i>
                            Team
                        </a>
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

function renderAppNav(container, options = {}) {
    if (!container) return;

    const includeBottomNav = options.includeBottomNav !== false;

    container.innerHTML = NAV_HTML;

    // Inject bottom nav once (app pages)
    if (includeBottomNav && !document.getElementById('bottomNav')) {
        const bnEl = document.createElement('div');
        bnEl.innerHTML = BOTTOM_NAV_HTML;
        document.body.appendChild(bnEl.firstElementChild);
    }

    highlightCurrentPage();
    initNavEvents();

    // Ensure avatar/identity gets refreshed even if main.js loads after nav.
    (function scheduleIdentityRefresh() {
        let tries = 0;
        const tick = () => {
            tries += 1;
            if (typeof window.refreshUserNav === 'function') {
                window.refreshUserNav();
                return;
            }
            if (tries < 40) {
                setTimeout(tick, 100);
            }
        };
        setTimeout(tick, 0);
    })();
}

function loadNav(containerId = 'nav-container') {
    const container = document.getElementById(containerId);
    if (container) {
        renderAppNav(container, { includeBottomNav: true });
    }
}

async function ensureAuthenticatedNavOnPublicPage(options = {}) {
    const containerId = options.containerId || 'nav-container';
    const includeBottomNav = options.includeBottomNav === true;

    const ensureAppNavStyles = () => {
        try {
            const existing = document.querySelector('link[href*="assets/css/app-layout.css"]');
            if (existing) {
                // If stylesheet is already loaded (or has no sheet info yet), continue.
                if (existing.sheet) return Promise.resolve();
                return new Promise((resolve) => {
                    let done = false;
                    const finish = () => {
                        if (done) return;
                        done = true;
                        resolve();
                    };
                    existing.addEventListener('load', finish, { once: true });
                    existing.addEventListener('error', finish, { once: true });
                    setTimeout(finish, 1200);
                });
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/css/app-layout.css?v=21';
            document.head.appendChild(link);

            return new Promise((resolve) => {
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    resolve();
                };
                link.addEventListener('load', finish, { once: true });
                link.addEventListener('error', finish, { once: true });
                setTimeout(finish, 1200);
            });
        } catch (_) {
            return Promise.resolve();
        }
    };

    try {
        if (!window.supabaseClient?.auth?.getSession) return false;
        const { data } = await window.supabaseClient.auth.getSession();
        const session = data?.session || null;
        if (!session) return false;

        await ensureAppNavStyles();

        let container = document.getElementById(containerId);
        if (!container) {
            const existingNav = document.querySelector('nav.site-nav');
            if (!existingNav) return false;
            container = document.createElement('div');
            container.id = containerId;
            existingNav.replaceWith(container);
        }

        renderAppNav(container, { includeBottomNav });
        return true;
    } catch (_) {
        return false;
    }
}

function initNavEvents() {
    if (window.__spendnoteNavEventsBound) {
        return;
    }
    window.__spendnoteNavEventsBound = true;

    // Hamburger menu toggle
    const hamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('nav-open');
            hamburger.classList.toggle('nav-hamburger--open', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('nav-mobile-open', isOpen);
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.site-nav') && navLinks.classList.contains('nav-open')) {
                navLinks.classList.remove('nav-open');
                hamburger.classList.remove('nav-hamburger--open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-mobile-open');
            }
        });
        // Close on nav link click (mobile)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-open');
                hamburger.classList.remove('nav-hamburger--open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-mobile-open');
            });
        });
    }

    // User avatar dropdown (delegated)
    document.addEventListener('click', (e) => {
        const userAvatarBtn = document.getElementById('userAvatarBtn');
        const userDropdown = document.getElementById('userDropdown');
        const mobileAvatarBtn = document.getElementById('mobileUserAvatarBtn');
        const mobileDropdown = document.getElementById('mobileUserDropdown');

        if ((!userAvatarBtn || !userDropdown) && (!mobileAvatarBtn || !mobileDropdown)) {
            return;
        }

        const clickedAvatar = e.target && (e.target.closest ? e.target.closest('#userAvatarBtn') : null);
        const clickedDropdown = e.target && (e.target.closest ? e.target.closest('#userDropdown') : null);
        const clickedMobileAvatar = e.target && (e.target.closest ? e.target.closest('#mobileUserAvatarBtn') : null);
        const clickedMobileDropdown = e.target && (e.target.closest ? e.target.closest('#mobileUserDropdown') : null);

        if (clickedAvatar && userDropdown) {
            e.preventDefault();
            userDropdown.classList.toggle('show');
            if (mobileDropdown) mobileDropdown.classList.remove('show');
            return;
        }

        if (clickedMobileAvatar && mobileDropdown) {
            e.preventDefault();
            mobileDropdown.classList.toggle('show');
            if (userDropdown) userDropdown.classList.remove('show');
            return;
        }

        if (!clickedDropdown && userDropdown) {
            userDropdown.classList.remove('show');
        }
        if (!clickedMobileDropdown && mobileDropdown) {
            mobileDropdown.classList.remove('show');
        }
    });

    // Logout (delegated)
    document.addEventListener('click', async (e) => {
        const logoutLink = e.target && (e.target.closest ? e.target.closest('[data-action="logout"]') : null);
        if (!logoutLink) {
            return;
        }

        e.preventDefault();
        if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }
        if (typeof e.stopImmediatePropagation === 'function') {
            e.stopImmediatePropagation();
        }

        try {
            sessionStorage.setItem('spendnote.intent.logout.v1', String(Date.now()));
        } catch (_) {
            // ignore
        }

        try {
            if (window.auth && typeof window.auth.signOut === 'function') {
                await window.auth.signOut();
            }
        } finally {
            try {
                localStorage.removeItem('activeCashBoxColor');
                localStorage.removeItem('activeCashBoxRgb');
                localStorage.removeItem('activeCashBoxId');
                localStorage.removeItem('spendnote.user.avatar.activeUserId.v1');
                localStorage.removeItem('spendnote.user.avatar.v1');
                localStorage.removeItem('spendnote.user.avatarColor.v1');
                localStorage.removeItem('spendnote.user.avatarSettings.v1');
            } catch (_) {
                // ignore
            }
            window.location.href = 'index.html';
        }
    }, true);

    // New Transaction button (top nav)
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

    // Bottom nav FAB button
    // On mobile (≤768px): always go to dedicated new-transaction page
    // On desktop: open modal if available, else navigate to dashboard
    const bottomFab = document.getElementById('bottomNavFab');
    if (bottomFab && !bottomFab.dataset.navBound) {
        bottomFab.dataset.navBound = '1';
        bottomFab.addEventListener('click', (event) => {
            event.preventDefault();
            if (window.innerWidth <= 768) {
                window.location.href = 'spendnote-new-transaction.html';
                return;
            }
            const hasModalNow = Boolean(document.getElementById('createTransactionModal'));
            const canOpenNow = typeof window.openModal === 'function';
            if (hasModalNow && canOpenNow) {
                window.openModal(event);
            } else {
                window.location.href = 'dashboard.html#new-transaction';
            }
        });
    }

    // Update user info if available
    if (window.auth && typeof window.updateUserNav === 'function') {
        window.updateUserNav();
    }
}

function highlightCurrentPage() {
    const currentPathname = window.location.pathname || '';
    const rawFile = (currentPathname.split('/').filter(Boolean).pop() || '').toLowerCase();
    let currentFile = rawFile;
    if (!currentFile) {
        currentFile = 'dashboard.html';
    } else if (currentFile === 'index.html') {
        currentFile = 'dashboard.html';
    } else if (!currentFile.includes('.')) {
        currentFile = `${currentFile}.html`;
    }
    const pageMap = {
        'dashboard': ['dashboard.html'],
        'cash-boxes': ['spendnote-cash-box-list.html', 'spendnote-cash-box-detail.html', 'spendnote-cash-box-settings.html'],
        'transactions': ['spendnote-transaction-history.html', 'spendnote-transaction-detail.html'],
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

    // Bottom nav active state
    const bottomLinks = Array.from(document.querySelectorAll('.bottom-nav-item[data-page]'));
    bottomLinks.forEach((link) => link.classList.remove('active'));
    bottomLinks.forEach((link) => {
        const page = link.dataset.page;
        const isActive = pageMap[page]?.some((file) => currentFile === String(file).toLowerCase());
        if (isActive) link.classList.add('active');
    });
}

// Export
window.loadNav = loadNav;
window.NAV_HTML = NAV_HTML;
window.ensureAuthenticatedNavOnPublicPage = ensureAuthenticatedNavOnPublicPage;
