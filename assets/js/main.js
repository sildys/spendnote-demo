// SpendNote - Main JavaScript

// Navigation menu functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle (if needed in future)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Load and apply saved active cash box color
    const savedColor = localStorage.getItem('activeCashBoxColor');
    const savedRgb = localStorage.getItem('activeCashBoxRgb');
    
    if (savedColor && savedRgb) {
        // Apply saved colors to CSS variables
        document.documentElement.style.setProperty('--active', savedColor);
        document.documentElement.style.setProperty('--active-rgb', savedRgb);
        
        // Update menu item colors
        const navCashItems = document.querySelectorAll('.nav-cash-item');
        navCashItems.forEach(item => {
            item.style.color = savedColor;
        });
        
        const otherNavItems = document.querySelectorAll('.nav-links a:not(.nav-cash-item):not(.btn)');
        otherNavItems.forEach(item => {
            item.style.color = savedColor;
        });
        
        // Update New Transaction button background color (keep text white)
        const newTransactionBtn = document.querySelector('.nav-new-transaction-btn');
        if (newTransactionBtn) {
            newTransactionBtn.style.background = `linear-gradient(135deg, ${savedColor}, ${savedColor})`;
            newTransactionBtn.style.color = 'white';
        }
    }
    
    // User avatar dropdown
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatarBtn && userDropdown) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userAvatarBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }

    // Populate user identity in nav + real logout (only on app pages)
    if (window.auth && window.db && window.supabaseClient) {
        updateUserNav();
        bindLogoutLinks();
    }
});

async function updateUserNav() {
    const nameEls = document.querySelectorAll('.user-name');
    const avatarImgs = document.querySelectorAll('.user-avatar img');

    if (!nameEls.length && !avatarImgs.length) {
        return;
    }

    const user = await window.auth.getCurrentUser();
    if (!user) {
        return;
    }

    let profile = null;
    try {
        profile = await window.db.profiles.getCurrent();
    } catch (error) {
        console.warn('Unable to load profile for nav:', error);
    }

    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || 'Account';
    const avatarUrl = user.user_metadata?.avatar_url || null;

    nameEls.forEach((el) => {
        el.textContent = displayName;
    });

    if (avatarImgs.length) {
        if (avatarUrl) {
            avatarImgs.forEach((img) => {
                img.src = avatarUrl;
                img.alt = displayName;
            });
        } else {
            const initials = getInitials(displayName);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#10b981"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
            const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

            avatarImgs.forEach((img) => {
                img.src = dataUrl;
                img.alt = displayName;
            });
        }
    }
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
    return initials || 'U';
}

function bindLogoutLinks() {
    const logoutLinks = Array.from(document.querySelectorAll('.user-dropdown-item'))
        .filter((link) => link.textContent.trim().toLowerCase().includes('log out'));

    if (!logoutLinks.length) {
        return;
    }

    logoutLinks.forEach((link) => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                await window.auth.signOut();
            } catch (error) {
                console.error('Logout failed:', error);
            }
            window.location.href = 'index.html';
        });
    });
}

// Utility functions
const SpendNote = {
    // Format currency
    formatCurrency: function(amount, currency = 'USD', locale = (navigator.language || 'en-US')) {
        const numericAmount = Number(amount);
        const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency || 'USD'
            }).format(safeAmount);
        } catch (error) {
            // Fallback for invalid currency/locale
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(safeAmount);
        }
    },
    
    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },
    
    // Show notification
    showNotification: function(message, type = 'info') {
        // Simple alert for now, can be enhanced later
        alert(message);
    }
};

// Export for use in other scripts
window.SpendNote = SpendNote;
