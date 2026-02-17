// SpendNote - Main JavaScript

function updateMenuColors(color) {
    if (!color) return;

    document.documentElement.style.setProperty('--active', color);
    try {
        const hex = String(color || '').trim();
        if (/^#?[0-9a-f]{6}$/i.test(hex)) {
            const h = hex.startsWith('#') ? hex.slice(1) : hex;
            const r = parseInt(h.slice(0, 2), 16);
            const g = parseInt(h.slice(2, 4), 16);
            const b = parseInt(h.slice(4, 6), 16);
            if ([r, g, b].every((n) => Number.isFinite(n))) {
                document.documentElement.style.setProperty('--active-rgb', `${r}, ${g}, ${b}`);
            }
        }
    } catch (_) {
        // ignore
    }
}

window.updateMenuColors = updateMenuColors;

function initSpendNoteNav() {
    if (window.__spendnoteNavInitDone) {
        return;
    }
    window.__spendnoteNavInitDone = true;

    // Mobile menu toggle (if needed in future)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Load and apply saved active cash box color
    try {
        const savedColor = localStorage.getItem('activeCashBoxColor');
        const savedRgb = localStorage.getItem('activeCashBoxRgb');
        if (savedColor && savedRgb) {
            document.documentElement.style.setProperty('--active', savedColor);
            document.documentElement.style.setProperty('--active-rgb', savedRgb);
            updateMenuColors(savedColor);
        }
    } catch (_) {
        // ignore
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

    // Populate user identity in nav
    setTimeout(() => {
        if (typeof window.refreshUserNav === 'function') {
            window.refreshUserNav();
        } else {
            updateUserNav();
        }
    }, 0);

    // Real logout + auth refresh when Supabase is available
    if (window.auth && window.db && window.supabaseClient) {
        bindLogoutLinks();

        if (!window.__spendnoteAuthListenerBound && window.supabaseClient?.auth?.onAuthStateChange) {
            window.__spendnoteAuthListenerBound = true;
            window.supabaseClient.auth.onAuthStateChange(() => {
                setTimeout(() => {
                    window.refreshUserNav?.();
                }, 0);
            });
        }
    }

    // Global New Transaction button behavior:
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', (event) => {
            if (typeof window.openModal === 'function' && document.getElementById('createTransactionModal')) {
                return;
            }
            event.preventDefault();
            window.location.href = 'dashboard.html#new-transaction';
        });
    }

    highlightMarketingNav();
}

function highlightMarketingNav() {
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    if (!links.length) return;
    const hasDataPage = links.some((link) => link?.dataset?.page);
    if (hasDataPage) return;

    const rawPath = window.location.pathname || '';
    let currentFile = rawPath.split('/').filter(Boolean).pop() || 'index.html';
    if (!currentFile.includes('.')) currentFile = `${currentFile}.html`;
    const currentNormalized = currentFile.toLowerCase();

    links.forEach((link) => link.classList.remove('active'));
    links.forEach((link) => {
        const href = String(link.getAttribute('href') || '').trim();
        if (!href || href.startsWith('#') || href.startsWith('http')) return;
        const hrefFile = href.split('?')[0].split('#')[0].split('/').filter(Boolean).pop();
        if (hrefFile && hrefFile.toLowerCase() === currentNormalized) {
            link.classList.add('active');
        }
    });
}

// Navigation menu functionality
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpendNoteNav);
} else {
    initSpendNoteNav();
}

const MAIN_AVATAR_SCOPE_USER_KEY = 'spendnote.user.avatar.activeUserId.v1';
const MAIN_AVATAR_KEY_PREFIX = 'spendnote.user.avatar.v2';
const MAIN_AVATAR_COLOR_KEY_PREFIX = 'spendnote.user.avatarColor.v2';
const MAIN_AVATAR_SETTINGS_KEY_PREFIX = 'spendnote.user.avatarSettings.v2';
const MAIN_LEGACY_AVATAR_KEY = 'spendnote.user.avatar.v1';
const MAIN_LEGACY_AVATAR_COLOR_KEY = 'spendnote.user.avatarColor.v1';
const MAIN_LEGACY_AVATAR_SETTINGS_KEY = 'spendnote.user.avatarSettings.v1';
const MAIN_AVATAR_BASE_SIZE = 96;
const MAIN_AVATAR_MIN_SCALE = 0.5;
const MAIN_AVATAR_MAX_SCALE = 3;

function normalizeMainAvatarSettings(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const scaleNum = Number(src.scale);
    const scale = Number.isFinite(scaleNum)
        ? Math.max(MAIN_AVATAR_MIN_SCALE, Math.min(MAIN_AVATAR_MAX_SCALE, scaleNum))
        : 1;
    const xNum = Number(src.x);
    const yNum = Number(src.y);
    return {
        scale: Math.round(scale * 100) / 100,
        x: Number.isFinite(xNum) ? xNum : 0,
        y: Number.isFinite(yNum) ? yNum : 0
    };
}

function buildMainAvatarTransform(rawSettings, slotSizePx) {
    const settings = normalizeMainAvatarSettings(rawSettings);
    const slot = Number(slotSizePx);
    const ratio = Number.isFinite(slot) && slot > 0 ? (slot / MAIN_AVATAR_BASE_SIZE) : 1;
    const x = Math.round(settings.x * ratio * 100) / 100;
    const y = Math.round(settings.y * ratio * 100) / 100;
    return `translate(${x}px, ${y}px) scale(${settings.scale})`;
}

async function updateUserNav() {
    const nameEls = document.querySelectorAll('.user-name');
    const navAvatarImg = document.querySelector('#userAvatarBtn .user-avatar img');
    const avatarImgs = navAvatarImg ? [navAvatarImg] : [];

    if (!nameEls.length && !avatarImgs.length) {
        return;
    }

    let user = null;
    try {
        user = await window.auth.getCurrentUser();
    } catch (_) {
        user = null;
    }

    let profile = null;
    if (user) {
        try {
            profile = await window.db.profiles.getCurrent();
        } catch (error) {
            if (window.SpendNoteDebug) console.warn('Unable to load profile for nav:', error);
        }
    }

    const userId = String(user?.id || '').trim();
    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Account';
    const avatarUrl = String(profile?.avatar_url || user?.user_metadata?.avatar_url || '').trim();
    const avatarColorFromDb = String(profile?.avatar_color || user?.user_metadata?.avatar_color || '').trim();
    const avatarSettingsFromDb = profile?.avatar_settings || user?.user_metadata?.avatar_settings || null;
    const scopedAvatarKey = userId ? `${MAIN_AVATAR_KEY_PREFIX}.${userId}` : '';
    const scopedAvatarColorKey = userId ? `${MAIN_AVATAR_COLOR_KEY_PREFIX}.${userId}` : '';
    const scopedAvatarSettingsKey = userId ? `${MAIN_AVATAR_SETTINGS_KEY_PREFIX}.${userId}` : '';

    let avatarSettings = avatarSettingsFromDb;
    if (!avatarSettings && scopedAvatarSettingsKey) {
        try {
            const rawSettings = localStorage.getItem(scopedAvatarSettingsKey);
            avatarSettings = rawSettings ? JSON.parse(rawSettings) : null;
        } catch (_) {
            avatarSettings = null;
        }
    }

    try {
        if (userId) {
            localStorage.setItem(MAIN_AVATAR_SCOPE_USER_KEY, userId);
            localStorage.removeItem(MAIN_LEGACY_AVATAR_KEY);
            localStorage.removeItem(MAIN_LEGACY_AVATAR_COLOR_KEY);
            localStorage.removeItem(MAIN_LEGACY_AVATAR_SETTINGS_KEY);
            if (avatarSettingsFromDb && scopedAvatarSettingsKey) {
                localStorage.setItem(scopedAvatarSettingsKey, JSON.stringify(normalizeMainAvatarSettings(avatarSettingsFromDb)));
            }
        } else {
            localStorage.removeItem(MAIN_AVATAR_SCOPE_USER_KEY);
        }
    } catch (_) {}

    nameEls.forEach((el) => {
        el.textContent = displayName;
    });

    if (avatarImgs.length) {
        let customAvatar = '';
        try {
            if (scopedAvatarKey) {
                customAvatar = String(localStorage.getItem(scopedAvatarKey) || '').trim();
            }
        } catch (_) {}

        if (!customAvatar && avatarUrl) {
            customAvatar = avatarUrl;
            try {
                if (scopedAvatarKey) localStorage.setItem(scopedAvatarKey, customAvatar);
            } catch (_) {}
        }

        if (customAvatar) {
            avatarImgs.forEach((img) => {
                img.src = customAvatar;
                img.alt = displayName;
                const slotSize = Number(img?.clientWidth || img?.getBoundingClientRect?.().width || 40);
                img.style.transformOrigin = '50% 50%';
                img.style.transform = buildMainAvatarTransform(avatarSettings, slotSize);
            });
        } else {
            let avatarColor = '#10b981';
            try {
                if (avatarColorFromDb) {
                    avatarColor = avatarColorFromDb;
                    if (scopedAvatarColorKey) localStorage.setItem(scopedAvatarColorKey, avatarColor);
                } else if (scopedAvatarColorKey) {
                    avatarColor = localStorage.getItem(scopedAvatarColorKey) || '#10b981';
                }
            } catch (_) {}

            const initials = getInitials(displayName);
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff" stroke="${avatarColor}" stroke-width="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', sans-serif" font-size="24" font-weight="800" fill="${avatarColor}">${initials}</text></svg>`;
            const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;

            avatarImgs.forEach((img) => {
                img.src = dataUrl;
                img.alt = displayName;
                img.style.transform = '';
                img.style.transformOrigin = '';
            });
        }
    }
}

// Helper function for initials
function getInitials(name) {
    if (!name) return 'U';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('');
    return initials || 'U';
}

// Export to window
window.updateUserNav = updateUserNav;

async function waitForUserNavReady(maxMs = 4000) {
    const start = Date.now();
    while ((Date.now() - start) < maxMs) {
        const hasAvatarSlot = Boolean(document.querySelector('#userAvatarBtn .user-avatar img'));
        if (!hasAvatarSlot) {
            await new Promise(r => setTimeout(r, 60));
            continue;
        }

        // Don't block rendering on auth. We can render a localStorage avatar immediately.
        return true;
    }
    return false;
}

window.refreshUserNav = async () => {
    try {
        const ok = await waitForUserNavReady();
        if (!ok) return;
        await window.updateUserNav();
    } catch (_) {
        // ignore
    }
};

function bindLogoutLinks() {
    const logoutLinks = Array.from(document.querySelectorAll('[data-action="logout"], .user-dropdown-item'))
        .filter((link) => link.dataset.action === 'logout' || link.textContent.trim().toLowerCase().includes('log out'));

    if (!logoutLinks.length) {
        return;
    }

    logoutLinks.forEach((link) => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Show visual feedback
            link.style.opacity = '0.5';
            link.style.pointerEvents = 'none';

            try {
                await window.auth.signOut();
                // Clear any cached data
                localStorage.removeItem('activeCashBoxColor');
                localStorage.removeItem('activeCashBoxRgb');
                localStorage.removeItem('activeCashBoxId');
            } catch (error) {
                console.error('Logout failed:', error);
            }
            
            // Redirect after signOut completes
            window.location.href = 'index.html';
        });
    });
}

// Utility functions
const SpendNote = {
    // Format currency
    formatCurrency: function(amount, currency = 'USD', locale = null) {
        const numericAmount = Number(amount);
        const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

        const currencyText = (currency || 'USD').toString().trim();
        const isIsoCode = /^[A-Z]{3}$/.test(currencyText);

        const defaultLocaleByCurrency = {
            USD: 'en-US',
            EUR: 'de-DE',
            GBP: 'en-GB',
            HUF: 'hu-HU',
            JPY: 'ja-JP',
            CHF: 'de-CH',
            CAD: 'en-CA',
            AUD: 'en-AU'
        };

        const resolvedLocale = locale || defaultLocaleByCurrency[currencyText] || 'en-US';

        if (!isIsoCode) {
            const formatted = new Intl.NumberFormat(resolvedLocale).format(safeAmount);
            return currencyText ? `${formatted} ${currencyText}` : formatted;
        }

        try {
            return new Intl.NumberFormat(resolvedLocale, {
                style: 'currency',
                currency: currencyText
            }).format(safeAmount);
        } catch (error) {
            const formatted = new Intl.NumberFormat(resolvedLocale).format(safeAmount);
            return currencyText ? `${formatted} ${currencyText}` : formatted;
        }
    },

    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
        return result
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '5, 150, 105';
    },

    getIconClass: function(iconName) {
        const iconMap = {
            'building': 'fa-building',
            'calendar': 'fa-calendar-alt',
            'wallet': 'fa-wallet',
            'bullhorn': 'fa-bullhorn',
            'store': 'fa-store',
            'piggy-bank': 'fa-piggy-bank',
            'chart-line': 'fa-chart-line',
            'coins': 'fa-coins',
            'exclamation-triangle': 'fa-exclamation-triangle',
            'dollar': 'fa-dollar-sign',
            'home': 'fa-home',
            'briefcase': 'fa-briefcase',
            'chart': 'fa-chart-line',
            'star': 'fa-star',
            'flag': 'fa-flag',
            'heart': 'fa-heart',
            'bolt': 'fa-bolt',
            'gift': 'fa-gift',
            'tag': 'fa-tag',
            'bell': 'fa-bell'
        };
        const key = String(iconName || '').trim();
        return iconMap[key] || 'fa-building';
    },

    getColorClass: function(color) {
        const colorMap = {
            '#059669': 'green',
            '#10b981': 'green',
            '#f59e0b': 'orange',
            '#3b82f6': 'blue',
            '#8b5cf6': 'purple',
            '#ef4444': 'red',
            '#ec4899': 'pink'
        };
        const key = String(color || '').trim().toLowerCase();
        return colorMap[key] || 'green';
    },

    getInitials: getInitials,
    
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
        if (typeof showAlert === 'function') {
            showAlert(message, { iconType: type });
        } else {
            alert(message);
        }
    }
};

SpendNote.updateMenuColors = updateMenuColors;

// Export for use in other scripts
window.SpendNote = SpendNote;

// ========================================
// DUPLICATE TRANSACTION HANDLER
// ========================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-duplicate[data-tx-id]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    
    const txId = btn.dataset.txId;
    if (!txId) return;

    const decode = (v) => {
        if (v === undefined || v === null) return '';
        try { return decodeURIComponent(String(v)); } catch { return String(v); }
    };

    const preset = {
        cashBoxId: btn.dataset.cashBoxId || null,
        direction: btn.dataset.direction || null,
        amount: decode(btn.dataset.amount || ''),
        contactId: btn.dataset.contactId || '',
        contactName: decode(btn.dataset.contactName || ''),
        description: decode(btn.dataset.description || ''),
        transactionId: ''
    };

    // If on dashboard and duplicateTransaction is available, use it to fetch full data
    if (typeof window.duplicateTransaction === 'function' && document.getElementById('createTransactionModal')) {
        window.duplicateTransaction(txId);
        return;
    }
    if (typeof window.duplicateTransaction === 'function') {
        window.duplicateTransaction(txId);
    } else {
        // Navigate to dashboard with duplicate parameter and prefill fields
        const params = new URLSearchParams();
        params.set('duplicate', txId);
        if (preset.cashBoxId) params.set('cashBoxId', preset.cashBoxId);
        if (preset.direction) params.set('direction', preset.direction);
        if (preset.amount !== undefined && preset.amount !== null) params.set('amount', String(preset.amount));
        if (preset.contactId) params.set('contactId', String(preset.contactId));
        if (preset.contactName) params.set('contactName', String(preset.contactName));
        if (preset.description) params.set('description', String(preset.description));
        window.location.href = 'dashboard.html?' + params.toString() + '#new-transaction';
    }
});
