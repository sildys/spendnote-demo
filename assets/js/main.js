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

const SN_CONSENT_STORAGE_KEY = 'spendnote.cookieConsent.v1';
const SN_STRICT_CONSENT_COUNTRIES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'CH', 'GB'
]);

function readConsentState() {
    try {
        const raw = localStorage.getItem(SN_CONSENT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            analytics: parsed.analytics === true,
            regionMode: parsed.regionMode === 'strict' ? 'strict' : 'open',
            country: String(parsed.country || '').trim().toUpperCase(),
            savedAt: Number(parsed.savedAt || 0)
        };
    } catch (_) {
        return null;
    }
}

function writeConsentState(nextState) {
    try {
        localStorage.setItem(SN_CONSENT_STORAGE_KEY, JSON.stringify({
            analytics: nextState.analytics === true,
            regionMode: nextState.regionMode === 'strict' ? 'strict' : 'open',
            country: String(nextState.country || '').trim().toUpperCase(),
            savedAt: Date.now()
        }));
    } catch (_) {
        // ignore
    }
}

function detectCountryCode() {
    const timeout = (ms) => new Promise((resolve) => {
        setTimeout(() => resolve(''), ms);
    });
    const readTrace = fetch('/cdn-cgi/trace', { credentials: 'same-origin', cache: 'no-store' })
        .then((resp) => (resp.ok ? resp.text() : ''))
        .then((body) => {
            const match = String(body || '').match(/(?:^|\n)loc=([A-Z]{2})(?:\n|$)/);
            return match ? String(match[1] || '').trim().toUpperCase() : '';
        })
        .catch(() => '');
    return Promise.race([readTrace, timeout(1600)]);
}

function ensureConsentStyles() {
    if (document.getElementById('snConsentStyles')) return;
    const style = document.createElement('style');
    style.id = 'snConsentStyles';
    style.textContent = `
        .sn-consent-banner {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: 16px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
            color: #0f172a;
            font-size: 13px;
            line-height: 1.45;
        }
        .sn-consent-banner strong { font-size: 14px; }
        .sn-consent-actions {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .sn-consent-btn {
            border: 1px solid #cbd5e1;
            background: #f8fafc;
            color: #0f172a;
            border-radius: 8px;
            padding: 8px 12px;
            font-weight: 600;
            cursor: pointer;
        }
        .sn-consent-btn.sn-consent-accept {
            background: #059669;
            border-color: #059669;
            color: #ffffff;
        }
        @media (max-width: 640px) {
            .sn-consent-banner { left: 10px; right: 10px; bottom: 10px; }
            .sn-consent-btn { width: 100%; }
        }
    `;
    document.head.appendChild(style);
}

function renderStrictConsentBanner(onDecision) {
    const existing = document.getElementById('snConsentBanner');
    if (existing) existing.remove();
    ensureConsentStyles();

    const banner = document.createElement('div');
    banner.id = 'snConsentBanner';
    banner.className = 'sn-consent-banner';
    banner.innerHTML = `
        <div>
            <strong>Cookie beállítások</strong><br>
            Csak a működéshez szükséges sütik aktívak alapból. Az analitikai mérésekhez engedélyezés szükséges.
        </div>
        <div class="sn-consent-actions">
            <button type="button" class="sn-consent-btn" data-consent="necessary">Csak szükséges</button>
            <button type="button" class="sn-consent-btn sn-consent-accept" data-consent="all">Összes elfogadása</button>
        </div>
    `;
    banner.querySelectorAll('button[data-consent]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const all = btn.getAttribute('data-consent') === 'all';
            banner.remove();
            onDecision(all);
        });
    });
    document.body.appendChild(banner);
}

window.SpendNoteConsent = window.SpendNoteConsent || {
    _initPromise: null,
    _state: null,

    async init() {
        if (this._initPromise) return this._initPromise;

        this._initPromise = (async () => {
            const stored = readConsentState();
            const country = String((stored && stored.country) || (await detectCountryCode()) || '').trim().toUpperCase();
            const isStrict = SN_STRICT_CONSENT_COUNTRIES.has(country);

            if (!isStrict) {
                if (!stored || stored.regionMode !== 'open') {
                    this._state = { analytics: true, regionMode: 'open', country };
                    writeConsentState(this._state);
                } else {
                    this._state = { ...stored, country: country || stored.country };
                }
                return this._state;
            }

            if (stored && stored.regionMode === 'strict') {
                this._state = { ...stored, country: country || stored.country, regionMode: 'strict' };
                return this._state;
            }

            this._state = { analytics: false, regionMode: 'strict', country };

            await new Promise((resolve) => {
                const start = () => {
                    renderStrictConsentBanner((allowAnalytics) => {
                        this._state = { analytics: allowAnalytics, regionMode: 'strict', country };
                        writeConsentState(this._state);
                        resolve();
                    });
                };
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', start, { once: true });
                } else {
                    start();
                }
            });

            return this._state;
        })();

        return this._initPromise;
    },

    canLoadAnalytics() {
        return Boolean(this._state?.analytics === true);
    }
};

async function updateOrgContextIndicator() {
    const dashboardEl = document.getElementById('dashboardOrgContext');
    const dropInfo = document.getElementById('orgContextDropdownInfo');

    const hide = () => {
        if (dashboardEl) dashboardEl.style.display = 'none';
        if (dropInfo) dropInfo.style.display = 'none';
    };

    try {
        if (!window.SpendNoteOrgContext?.getSelectionState) { hide(); return; }

        const state = await window.SpendNoteOrgContext.getSelectionState();
        const memberships = Array.isArray(state?.memberships) ? state.memberships : [];
        const isPro = Boolean(state?.isPro);
        const orgId = String(state?.orgId || state?.selectedOrgId || '').trim();
        const role = String(state?.role || state?.selectedRole || '').trim().toLowerCase();

        if (!isPro || !orgId) { hide(); return; }

        const roleLabel = role === 'owner' ? 'Owner' : (role === 'admin' ? 'Admin' : 'User');
        const shortOrg = orgId.slice(0, 8);
        const orgName = String(state?.orgName || '').trim();
        const identityLabel = orgName || `Workspace ${shortOrg}`;
        let userLabel = '';
        try {
            if (window.db?.profiles?.getCurrent) {
                const p = await window.db.profiles.getCurrent();
                const fullName = String(p?.full_name || '').trim();
                const email = String(p?.email || '').trim();
                userLabel = fullName || email;
            }
        } catch (_) {
            // ignore
        }
        if (!userLabel) userLabel = roleLabel;

        if (dropInfo) {
            dropInfo.innerHTML = `<span class="org-context-dropdown-user">${userLabel}</span><span class="org-context-dropdown-role">${roleLabel}</span><span class="org-context-dropdown-org">Team: ${identityLabel}</span>`;
            dropInfo.style.display = 'flex';
        }

        if (dashboardEl) {
            dashboardEl.textContent = `Org: ${identityLabel} \u00b7 ${roleLabel} \u00b7 Switch via Log out \u2192 Log in`;
            dashboardEl.style.display = memberships.length > 1 ? 'inline-flex' : 'none';
        }
    } catch (_) {
        hide();
    }
}

window.updateMenuColors = updateMenuColors;

function initSentryMonitoring() {
    if (window.__spendnoteSentryInitDone) return;
    window.__spendnoteSentryInitDone = true;

    const host = String(window.location && window.location.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return;

    if (!window.SpendNoteConsent?.canLoadAnalytics?.()) return;
    if (document.querySelector('script[data-spendnote-sentry="1"]')) return;

    const s = document.createElement('script');
    s.src = 'https://js-de.sentry-cdn.com/3109ed7fcfb26be5b6d35c5e7cf52275.min.js';
    s.crossOrigin = 'anonymous';
    s.async = true;
    s.dataset.spendnoteSentry = '1';
    document.head.appendChild(s);
}

function normalizeFooterBranding() {
    const brands = document.querySelectorAll('.app-footer .app-footer-brand');
    if (!brands.length) return;

    brands.forEach((brand, idx) => {
        const desc = brand.querySelector('.app-footer-brand-desc');
        if (desc) {
            desc.innerHTML = 'Complete cash visibility for your team.<br>Instant receipts, full history.';
        }

        const logoLink = brand.querySelector('.app-footer-brand-logo');
        if (!logoLink) return;
        const svg = logoLink.querySelector('svg');
        if (!svg) return;

        const currentSvg = svg.outerHTML;
        if (currentSvg.includes('footer-logo-gradient')) return;

        const gradientId = `footer-logo-gradient-${idx}`;
        svg.outerHTML = `<svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6 C10 4.89543 10.8954 4 12 4 L36 4 C37.1046 4 38 4.89543 38 6 L38 38 L36 40 L34 38 L32 40 L30 38 L28 40 L26 38 L24 40 L22 38 L20 40 L18 38 L16 40 L14 38 L12 40 L10 38 Z" fill="url(#${gradientId})"/><path d="M32 4 L38 10 L32 10 Z" fill="#000000" opacity="0.25"/><path d="M32 4 L32 10 L38 10" stroke="#047857" stroke-width="1.5" stroke-linejoin="round"/><line x1="14" y1="14" x2="30" y2="14" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/><line x1="14" y1="19" x2="26" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/><line x1="14" y1="24" x2="30" y2="24" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/><line x1="14" y1="29" x2="22" y2="29" stroke="white" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><path d="M10 36 L12 38 L14 36 L16 38 L18 36 L20 38 L22 36 L24 38 L26 36 L28 38 L30 36 L32 38 L34 36 L36 38 L38 36" stroke="#047857" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="${gradientId}" x1="24" y1="4" x2="24" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#059669"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs></svg>`;
    });
}

function initSpendNoteNav() {
    if (window.__spendnoteNavInitDone) {
        return;
    }
    window.__spendnoteNavInitDone = true;

    window.SpendNoteConsent?.init?.().finally(() => {
        initSentryMonitoring();
    });

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

    normalizeFooterBranding();
    highlightMarketingNav();
}

const SN_NUMBER_FIT_TEXT_SELECTOR = [
    '.register-balance',
    '.tx-card-amount',
    '.tx-amount',
    '.stat-value',
    '#txHeaderAmount .value',
    '#txAmountValue',
    '[data-number-autofit]'
].join(',');

const SN_NUMBER_FIT_INPUT_SELECTOR = [
    'input[type="number"]',
    'input[inputmode="numeric"]',
    'input[inputmode="decimal"]',
    'input[id*="amount" i]',
    'input[name*="amount" i]'
].join(',');

function fitNumericTextElement(el) {
    if (!(el instanceof HTMLElement)) return;
    const text = String(el.textContent || '').trim();
    if (!text || !/\d/.test(text)) return;

    const computed = window.getComputedStyle(el);
    const storedBase = Number(el.dataset.snFitBaseFont || 0);
    const baseFont = Number.isFinite(storedBase) && storedBase > 0
        ? storedBase
        : parseFloat(computed.fontSize) || 16;
    el.dataset.snFitBaseFont = String(baseFont);

    if (computed.display === 'inline') {
        el.style.display = 'inline-block';
    }
    el.style.maxWidth = '100%';
    el.style.whiteSpace = 'nowrap';
    el.style.textOverflow = 'clip';
    el.style.overflow = 'hidden';
    el.style.transform = 'none';
    el.style.transformOrigin = '';

    const availableWidth = el.clientWidth || (el.parentElement ? el.parentElement.clientWidth : 0);
    if (!availableWidth || availableWidth <= 0) return;

    el.style.fontSize = `${baseFont}px`;
    if (el.scrollWidth <= availableWidth + 0.5) return;

    const minFont = Math.max(6, Math.floor(baseFont * 0.3));
    let low = minFont;
    let high = baseFont;
    let best = minFont;

    for (let i = 0; i < 10; i += 1) {
        const mid = (low + high) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollWidth <= availableWidth + 0.5) {
            best = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    el.style.fontSize = `${best}px`;

    const overflowRatio = el.scrollWidth > 0 ? (availableWidth / el.scrollWidth) : 1;
    if (overflowRatio < 0.995) {
        const clampedRatio = Math.max(0.65, Math.min(1, overflowRatio));
        if (clampedRatio < 1) {
            const isRightAligned = computed.textAlign === 'right' || computed.justifyContent === 'flex-end';
            el.style.transformOrigin = isRightAligned ? 'right center' : 'left center';
            el.style.transform = `scaleX(${clampedRatio})`;
        }
    }

}

function fitNumericInputElement(input) {
    if (!(input instanceof HTMLInputElement)) return;
    const value = String(input.value || '').trim();

    const computed = window.getComputedStyle(input);
    const storedBase = Number(input.dataset.snFitBaseFont || 0);
    const baseFont = Number.isFinite(storedBase) && storedBase > 0
        ? storedBase
        : parseFloat(computed.fontSize) || 16;
    input.dataset.snFitBaseFont = String(baseFont);

    if (!value) {
        input.style.fontSize = `${baseFont}px`;
        return;
    }

    const charCount = value.replace(/\s+/g, '').length;
    if (charCount <= 10) {
        input.style.fontSize = `${baseFont}px`;
        return;
    }

    const minFont = Math.max(10, Math.floor(baseFont * 0.55));
    const reduced = baseFont - (charCount - 10) * 0.55;
    input.style.fontSize = `${Math.max(minFont, reduced)}px`;
}

function fitAllNumericElements(root = document) {
    const textNodes = root.querySelectorAll(SN_NUMBER_FIT_TEXT_SELECTOR);
    textNodes.forEach((el) => fitNumericTextElement(el));

    const inputs = root.querySelectorAll(SN_NUMBER_FIT_INPUT_SELECTOR);
    inputs.forEach((input) => {
        fitNumericInputElement(input);
        if (input.dataset.snFitInputBound === '1') return;
        input.dataset.snFitInputBound = '1';
        input.addEventListener('input', () => fitNumericInputElement(input));
        input.addEventListener('change', () => fitNumericInputElement(input));
    });
}

function initGlobalNumberAutoFit() {
    if (window.__snNumberAutoFitInitDone) return;
    window.__snNumberAutoFitInitDone = true;

    let framePending = false;
    const scheduleFit = () => {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(() => {
            framePending = false;
            fitAllNumericElements(document);
        });
    };

    scheduleFit();
    window.addEventListener('load', scheduleFit);
    window.addEventListener('resize', scheduleFit);
    window.addEventListener('orientationchange', scheduleFit);

    const observer = new MutationObserver(scheduleFit);
    observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true
    });
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
    document.addEventListener('DOMContentLoaded', initGlobalNumberAutoFit);
} else {
    initSpendNoteNav();
    initGlobalNumberAutoFit();
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

function isValidAvatarSource(value) {
    const src = String(value || '').trim();
    if (!src) return false;
    return /^data:image\//i.test(src) || /^https?:\/\//i.test(src);
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
                if (customAvatar && !isValidAvatarSource(customAvatar)) {
                    customAvatar = '';
                    localStorage.removeItem(scopedAvatarKey);
                }
            }
        } catch (_) {}

        if (!customAvatar && avatarUrl && isValidAvatarSource(avatarUrl)) {
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

    await updateOrgContextIndicator();
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

    const shouldUseStandaloneNewTransaction = () => {
        try {
            // Use standalone page only on phone-sized layouts.
            // Touch-enabled desktops/tablets in desktop view should keep dashboard modal flow.
            return window.matchMedia('(max-width: 768px)').matches;
        } catch (_) {
            return false;
        }
    };

    // If on dashboard and duplicateTransaction is available, use it to fetch full data
    if (typeof window.duplicateTransaction === 'function' && document.getElementById('createTransactionModal')) {
        window.duplicateTransaction(txId);
        return;
    }
    if (typeof window.duplicateTransaction === 'function') {
        window.duplicateTransaction(txId);
    } else {
        // Navigate to dashboard (desktop) or standalone page (mobile) with duplicate parameter
        const params = new URLSearchParams();
        params.set('duplicate', txId);
        if (preset.cashBoxId) params.set('cashBoxId', preset.cashBoxId);
        if (preset.direction) params.set('direction', preset.direction);
        if (preset.amount !== undefined && preset.amount !== null) params.set('amount', String(preset.amount));
        if (preset.contactId) params.set('contactId', String(preset.contactId));
        if (preset.contactName) params.set('contactName', String(preset.contactName));
        if (preset.description) params.set('description', String(preset.description));
        if (shouldUseStandaloneNewTransaction()) {
            window.location.href = 'spendnote-new-transaction.html?' + params.toString() + '#new-transaction';
        } else {
            window.location.href = 'dashboard.html?' + params.toString() + '#new-transaction';
        }
    }
});
