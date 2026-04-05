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
        .sn-consent-banner a {
            color: #059669;
            text-decoration: underline;
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
            <strong>Cookie Settings</strong><br>
            We use essential cookies to operate SpendNote. Analytics cookies help us improve the service and are only enabled with your consent. <a href="spendnote-privacy.html#cookies">Learn more</a>
        </div>
        <div class="sn-consent-actions">
            <button type="button" class="sn-consent-btn" data-consent="necessary">Essential Only</button>
            <button type="button" class="sn-consent-btn" data-consent="all">Accept All</button>
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
    },

    reopenConsentBanner() {
        const country = String(this._state?.country || '').trim().toUpperCase();
        renderStrictConsentBanner((allowAnalytics) => {
            this._state = { analytics: allowAnalytics, regionMode: this._state?.regionMode || 'strict', country };
            writeConsentState(this._state);
            if (!allowAnalytics) {
                window.location.reload();
            }
        });
    }
};

async function updateOrgContextIndicator() {
    const dashboardEl = document.getElementById('dashboardOrgContext');
    const dropInfo = document.getElementById('orgContextDropdownInfo');
    const teamLink = document.getElementById('dropdownTeamLink');

    const hide = () => {
        if (dashboardEl) dashboardEl.style.display = 'none';
        if (dropInfo) dropInfo.style.display = 'none';
    };

    try {
        if (!window.SpendNoteOrgContext?.getSelectionState) { hide(); return; }

        const state = await window.SpendNoteOrgContext.getSelectionState();
        const memberships = Array.isArray(state?.memberships) ? state.memberships : [];
        const orgId = String(state?.orgId || state?.selectedOrgId || '').trim();
        const role = String(state?.role || state?.selectedRole || '').trim().toLowerCase();

        const isPro = Boolean(state?.isPro);
        if (teamLink) {
            // Pro/preview only; org members with role "user" cannot manage team — hide entry (team-page redirects if opened directly).
            const hideForInvitedMember = role === 'user';
            teamLink.style.display = isPro && !hideForInvitedMember ? '' : 'none';
        }

        if (!orgId || !isPro) { hide(); return; }

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
            dropInfo.innerHTML = `<span class="org-context-dropdown-user">${userLabel}</span><span class="org-context-dropdown-meta"><span class="org-context-dropdown-role">${roleLabel}</span> &middot; <span class="org-context-dropdown-org">${identityLabel}</span></span>`;
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


function ensurePageTipStyles() {
    if (document.getElementById('snPageTipStyles')) return;
    const style = document.createElement('style');
    style.id = 'snPageTipStyles';
    style.textContent = `
        .sn-page-tip {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: rgba(5,150,105,0.06);
            border: 1px solid rgba(5,150,105,0.15);
            border-radius: 10px;
            margin: 0 0 12px 0;
            font-size: 13px;
            line-height: 1.4;
            color: #0f172a;
        }
        .sn-page-tip > i { color: #059669; font-size: 14px; flex-shrink: 0; }
        .sn-page-tip-text { flex: 1; }
        .sn-page-tip-text strong { font-weight: 700; }
        .sn-page-tip-dismiss {
            width: 22px; height: 22px;
            display: flex; align-items: center; justify-content: center;
            background: transparent; border: none;
            color: #94a3b8; font-size: 14px; cursor: pointer;
            border-radius: 6px; flex-shrink: 0; transition: all 0.15s;
        }
        .sn-page-tip-dismiss:hover { background: rgba(0,0,0,0.05); color: #334155; }
        @media (max-width: 768px) {
            .sn-page-tip { padding: 8px 12px; font-size: 12px; gap: 8px; border-radius: 8px; }
        }
    `;
    document.head.appendChild(style);
}

window.showPageTip = function showPageTip(pageKey, html, opts) {
    var TIPS_KEY = 'spendnote.tips.v1';
    var targetSel = (opts && opts.target) || '.main-content';
    var insertMode = (opts && opts.insert) || 'prepend';

    function readTips() {
        try { var r = localStorage.getItem(TIPS_KEY); return r ? JSON.parse(r) : {}; } catch(_) { return {}; }
    }
    function writeTips(t) {
        try { localStorage.setItem(TIPS_KEY, JSON.stringify(t)); } catch(_) {}
    }

    var tips = readTips();
    if (tips[pageKey]) return;

    var checkTxCount = function(cb) {
        var dbApi = window.db;
        if (dbApi && dbApi.transactions && typeof dbApi.transactions.getAll === 'function') {
            dbApi.transactions.getAll({ select: 'id', limit: 3 }).then(function(txs) {
                cb(txs ? txs.length : 0);
            }).catch(function() { cb(0); });
        } else {
            cb(0);
        }
    };

    var render = function() {
        ensurePageTipStyles();
        var target = document.querySelector(targetSel);
        if (!target) return;
        if (document.getElementById('snPageTip_' + pageKey)) return;

        var tip = document.createElement('div');
        tip.className = 'sn-page-tip';
        tip.id = 'snPageTip_' + pageKey;
        tip.innerHTML = '<i class="fas fa-lightbulb"></i><div class="sn-page-tip-text">' + html + '</div><button type="button" class="sn-page-tip-dismiss" title="Dismiss"><i class="fas fa-times"></i></button>';
        tip.querySelector('.sn-page-tip-dismiss').addEventListener('click', function() {
            var t = readTips(); t[pageKey] = true; writeTips(t);
            tip.style.transition = 'opacity 0.2s, transform 0.2s';
            tip.style.opacity = '0'; tip.style.transform = 'translateY(-6px)';
            setTimeout(function() { tip.remove(); }, 250);
        });

        if (insertMode === 'after' && opts && opts.afterEl) {
            var ref = document.querySelector(opts.afterEl);
            if (ref && ref.parentNode) { ref.parentNode.insertBefore(tip, ref.nextSibling); return; }
        }
        if (insertMode === 'before' && opts && opts.beforeEl) {
            var bef = document.querySelector(opts.beforeEl);
            if (bef && bef.parentNode) { bef.parentNode.insertBefore(tip, bef); return; }
        }
        var firstChild = target.querySelector('.page-header');
        if (firstChild && firstChild.nextSibling) {
            target.insertBefore(tip, firstChild.nextSibling);
        } else {
            target.prepend(tip);
        }
    };

    var go = function() {
        checkTxCount(function(count) {
            if (count >= 3) {
                var t = readTips(); t[pageKey] = true; writeTips(t);
                return;
            }
            render();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(go, 200); }, { once: true });
    } else {
        setTimeout(go, 200);
    }
};

function injectCookieSettingsLink() {
    document.querySelectorAll('.app-footer-links-simple').forEach((linksDiv) => {
        if (linksDiv.querySelector('[data-cookie-settings]')) return;
        const privacyLink = linksDiv.querySelector('a[href*="privacy"]');
        const cookieLink = document.createElement('a');
        cookieLink.href = '#';
        cookieLink.textContent = 'Cookie Settings';
        cookieLink.setAttribute('data-cookie-settings', '1');
        cookieLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.SpendNoteConsent?.reopenConsentBanner) {
                window.SpendNoteConsent.reopenConsentBanner();
            }
        });
        if (privacyLink && privacyLink.nextSibling) {
            privacyLink.parentNode.insertBefore(cookieLink, privacyLink.nextSibling);
        } else {
            linksDiv.appendChild(cookieLink);
        }
    });
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
    injectCookieSettingsLink();
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

/** Normalize profile avatar_color for team lists (#RGB / #RRGGBB). */
function spendNoteParseProfileAvatarColorHex(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    const body = s.startsWith('#') ? s.slice(1) : s;
    if (/^[0-9a-f]{6}$/i.test(body)) return `#${body.toLowerCase()}`;
    if (/^[0-9a-f]{3}$/i.test(body)) {
        const a = body[0];
        const b = body[1];
        const c = body[2];
        return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
    }
    return null;
}

function spendNoteEscapeHtmlText(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function spendNoteEscapeHtmlAttr(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');
}

/** Team / settings lists: show member photo + crop/zoom from avatar_settings when available. */
window.SpendNoteMemberAvatar = {
    render(options = {}) {
        const displayName = String(options.displayName || '').trim() || '—';
        const initialsArg = String(options.initials || '').trim();
        const ini = initialsArg || getInitials(displayName);
        const fallbackBg = String(options.fallbackBg || '#6366f1').trim();
        const explicitColor = spendNoteParseProfileAvatarColorHex(options.avatarColor);
        const avatarUrl = String(options.avatarUrl || '').trim();
        const settings = options.avatarSettings;
        const slotSizeOpt = Number(options.slotSize);
        const slot = Number.isFinite(slotSizeOpt) && slotSizeOpt > 0 ? slotSizeOpt : 36;
        const rootClass = String(options.rootClass || 'member-avatar').trim() || 'member-avatar';
        const photoClass = rootClass === 'team-avatar' ? 'team-avatar--photo' : 'member-avatar--photo';

        if (avatarUrl && isValidAvatarSource(avatarUrl)) {
            // Never use list-index placeholder behind a real profile photo; that looked like an "owner-assigned" color.
            const ringBg = explicitColor || '#e5e7eb';
            const transform = buildMainAvatarTransform(settings, slot);
            return `<div class="${rootClass} ${photoClass}" style="background:${spendNoteEscapeHtmlAttr(ringBg)}" role="img" aria-label="${spendNoteEscapeHtmlAttr(displayName)}"><img src="${spendNoteEscapeHtmlAttr(avatarUrl)}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;border-radius:50%;transform-origin:50% 50%;transform:${spendNoteEscapeHtmlAttr(transform)}"/></div>`;
        }
        const initialsBg = explicitColor || fallbackBg;
        return `<div class="${rootClass}" style="background:${spendNoteEscapeHtmlAttr(initialsBg)}">${spendNoteEscapeHtmlText(ini)}</div>`;
    }
};

async function updateUserNav() {
    const nameEls = document.querySelectorAll('.user-name');
    const navAvatarImg = document.querySelector('#userAvatarBtn .user-avatar img');
    const avatarImgs = navAvatarImg ? [navAvatarImg] : [];

    if (!nameEls.length && !avatarImgs.length) {
        await updateOrgContextIndicator();
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

    const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Account';
    const avatarUrl = String(
        profile?.avatar_url
        || user?.user_metadata?.avatar_url
        || user?.user_metadata?.picture
        || ''
    ).trim();
    const avatarColorFromDb = String(profile?.avatar_color || user?.user_metadata?.avatar_color || '').trim();
    const avatarSettings = profile?.avatar_settings || user?.user_metadata?.avatar_settings || null;

    nameEls.forEach((el) => {
        el.textContent = displayName;
    });

    if (avatarImgs.length) {
        const customAvatar = avatarUrl && isValidAvatarSource(avatarUrl) ? avatarUrl : '';

        if (customAvatar) {
            avatarImgs.forEach((img) => {
                img.src = customAvatar;
                img.alt = displayName;
                const slotSize = Number(img?.clientWidth || img?.getBoundingClientRect?.().width || 40);
                img.style.transformOrigin = '50% 50%';
                img.style.transform = buildMainAvatarTransform(avatarSettings, slotSize);
            });
        } else {
            const avatarColor = avatarColorFromDb || '#10b981';
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
    const initials = parts
        .slice(0, 2)
        .map((part) => String(part || '').charAt(0).toUpperCase())
        .join('');
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
// S2: LOCK / UPGRADE UI HELPER
// ========================================
window.SpendNoteUpgrade = {
    _overlayId: 'sn-upgrade-overlay',

    _planLabel: { free: 'Free', standard: 'Standard', pro: 'Pro' },

    _planUrl: '/spendnote-pricing.html',

    _buildPlanUrl(requiredPlan, feature) {
        try {
            const url = new URL(this._planUrl, window.location.origin);
            const plan = String(requiredPlan || '').trim().toLowerCase();
            if (plan === 'standard' || plan === 'pro') {
                url.searchParams.set('minPlan', plan);
            }
            const featureLabel = String(feature || '').trim();
            if (featureLabel) {
                url.searchParams.set('feature', featureLabel);
            }
            return `${url.pathname}${url.search}${url.hash}`;
        } catch (_) {
            return this._planUrl;
        }
    },

    _escapeOverlayText(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    showLockOverlay(opts) {
        const { feature = '', requiredPlan = 'standard' } = opts || {};

        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planLabel = this._planLabel[requiredPlan] || 'paid';
        const planUrl = this._buildPlanUrl(requiredPlan, feature);
        const esc = (t) => this._escapeOverlayText(t);
        const feat = esc(feature);
        const title = 'Unlock this feature';
        const body = feat
            ? `Upgrade to use <strong>${feat}</strong>.<br>It’s included in the <strong>${esc(planLabel)}</strong> plan and above.`
            : `This is included in the <strong>${esc(planLabel)}</strong> plan and above.`;

        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">${title}</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">${body}</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              View plans
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Compare plans on the next screen</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    /** Control-loss framing (invite blocked at seat cap): same trigger as before, conversion-focused copy. */
    showSeatLimitUpgrade(_seatLimit) {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Team visibility');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">You can&apos;t track who has the cash.</div>
            <div style="font-size:14px;color:#475569;margin-bottom:16px;line-height:1.55;">Right now, only you can record transactions.</div>
            <div style="font-size:14px;color:#475569;margin-bottom:10px;line-height:1.6;">Once cash leaves your hands, you lose visibility.</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Invite your team and track every handoff &mdash; who took it, when, and why.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;box-shadow:0 4px 16px rgba(79,70,229,0.3);">
              Upgrade to Pro &rarr;
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showLockBadge(el, requiredPlan) {
        if (!el) return;
        el.style.position = 'relative';
        const old = el.querySelector('.sn-lock-badge');
        if (old) old.remove();
        const badge = document.createElement('span');
        badge.className = 'sn-lock-badge';
        const label = this._planLabel[requiredPlan] || 'Pro';
        badge.style.cssText = 'position:absolute;top:6px;right:6px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;color:#64748b;display:flex;align-items:center;gap:4px;pointer-events:none;';
        badge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>${label}`;
        el.appendChild(badge);
    },

    async showCashBoxUpgrade(onClose) {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const tier = await window.SpendNoteFeatures?.getTier?.() || 'free';
        const isStandard = tier === 'standard';
        const targetPlan = isStandard ? 'pro' : 'standard';
        const title = isStandard
            ? "You've reached 2 cash boxes"
            : "You're tracking cash in only one place";
        const body = isStandard
            ? "Upgrade to Pro for unlimited cash boxes."
            : "Multiple locations need multiple cash boxes.<br>Upgrade to track everything.";
        const cta = isStandard ? 'Upgrade to Pro' : 'Unlock full control';
        const small = isStandard ? 'Unlimited cash boxes on Pro' : 'Standard: 2 cash boxes · Pro: unlimited';

        const planUrl = this._buildPlanUrl(targetPlan, 'Cash Boxes');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">${title}</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">${body}</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              ${cta}
            </a>
            <div style="font-size:12px;color:#94a3b8;margin-top:12px;line-height:1.4;">${small}</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => { overlay.remove(); if (typeof onClose === 'function') onClose(); };
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showLogoUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('standard', 'Custom Logo');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Make your receipts look professional</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Add your logo to every receipt and look more professional.<br>Without it, your receipts stay generic.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Add your logo
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Appears on every receipt automatically</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showPerBoxLogoUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Per-Location Logo');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Use different logos for each cash box</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Assign a separate logo to each cash box.<br>Without it, all receipts use the same logo.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Set logos per cash box
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Great for teams, projects, or multiple setups</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showCsvUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('standard', 'CSV Export');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Export your data to Excel</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Download your transactions as a CSV file for reporting or accounting.<br>Without it, your data stays locked in the app.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Export to Excel
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Use in Excel or send to your accountant</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showPdfUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('standard', 'PDF Receipts');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Download your receipts as PDF</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Download receipts as PDF to save or send later.<br>Without it, you can only print.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Download as PDF
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Save and send anytime</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showLabelsUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Custom Labels');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Customize your receipts</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Rename fields and labels to match your workflow.<br>Without it, your receipts stay fixed.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Customize receipts
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Adapt to your own process</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showIdPrefixUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Custom ID Prefix');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 7V5a2 2 0 1 1 4 0v2"/><rect x="3" y="7" width="18" height="13" rx="2"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Use your own receipt numbering</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Match receipts to your internal system (client, project, or location).<br>Default prefix is fine for testing &mdash; not for real use.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Unlock custom prefixes
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Included with Pro</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showEmailUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Email Receipts');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Send receipts instantly</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Email receipts directly from the app.<br>No downloads, no attachments.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Send via email
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Sent instantly to your client</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showTrialExpiredUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('standard', 'Trial Expired');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Your free trial has ended</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Upgrade to keep adding transactions.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Upgrade now
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Unlimited transactions on paid plans</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showTransactionLimitUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('standard', 'Transaction Limit');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">You can't add more transactions</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Your Free plan limit is reached.<br>Upgrade to continue adding transactions.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Continue tracking
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Unlimited transactions on paid plans</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    showTeamUpgrade() {
        const existing = document.getElementById(this._overlayId);
        if (existing) existing.remove();

        const planUrl = this._buildPlanUrl('pro', 'Team Access');
        const overlay = document.createElement('div');
        overlay.id = this._overlayId;
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;padding:20px;';
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.18);max-width:420px;width:100%;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;position:relative;">
            <button type="button" id="sn-upgrade-overlay-close" style="position:absolute;top:14px;right:14px;appearance:none;border:none;background:none;color:#94a3b8;cursor:pointer;padding:4px;line-height:1;" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#eef2ff,#e0e7ff);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div style="font-size:19px;font-weight:800;color:#0f172a;margin-bottom:10px;line-height:1.3;">Share access to your cash</div>
            <div style="font-size:14px;color:#475569;margin-bottom:24px;line-height:1.6;">Let your team manage cash together.<br>Without it, everything depends on one person.</div>
            <a href="${planUrl}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4f46e5;color:#fff;border-radius:10px;padding:13px 28px;font-size:15px;font-weight:700;text-decoration:none;width:100%;box-sizing:border-box;">
              Unlock team access
            </a>
            <button type="button" id="sn-upgrade-overlay-secondary" style="appearance:none;border:none;background:none;color:#cbd5e1;font-size:12px;font-weight:400;cursor:pointer;margin-top:14px;padding:4px;">Not now</button>
            <div style="font-size:12px;color:#94a3b8;margin-top:8px;line-height:1.4;">Set roles and permissions</div>
          </div>
        `;
        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        document.getElementById('sn-upgrade-overlay-close').addEventListener('click', close);
        document.getElementById('sn-upgrade-overlay-secondary').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        const escHandler = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
    },

    async guardFeature(flag, featureLabel, requiredPlan) {
        if (!window.SpendNoteFeatures) return true;
        const allowed = await window.SpendNoteFeatures.can(flag);
        if (!allowed) {
            this.showLockOverlay({ feature: featureLabel, requiredPlan: requiredPlan || 'standard' });
            return false;
        }
        return true;
    }
};

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
