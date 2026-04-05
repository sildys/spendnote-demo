# Progress (canonical)

This is the **single canonical “where we are”** file.

If a chat thread freezes / context is lost: in the new thread say:
- **“Read `PROGRESS.md` and continue from there.”**

## AI assistant guidance

- Keep responses minimal and task-focused.
- Prefer implementing fixes over explaining them.
- Avoid long explanations, hedging, or repetitive confirmations.
- Be professional and forward-looking (anticipate edge cases, choose robust solutions).
- **Chat a termék tulajdonossal:** magyar (kivéve, ha mást kér).
- **PROGRESS.md** (státusz, „Where we are now”, teendők): **magyar**, hogy egy helyen követhető legyen a magyar egyeztetés.
- **Az app felhasználói felülete:** kizárólag **angol** — UI szöveg, toast, modal, **email sablonok és küldött emailek** mind angolul; ne írjunk felhasználónak magyar szöveget, ne kétnyelvű (HU+EN) üdvözlőket.
- Aim for the **fastest, most ideal** solution that is still robust.
- Do **everything you can autonomously** (code changes, refactors, searches, commits) without asking.
- Ask me only for:
  - decisions (choice between options)
  - external configuration steps you cannot access (e.g. Supabase/Cloudflare dashboards)

## Launch roadmap (ordered checklist)

- [x] **REPO-1** Rename GitHub repo: `spendnote-demo` → `spendnote` (update local `git remote`, verify Vercel still auto-deploys, confirm GitHub Actions still runs)
- [x] **DEC-L1** Decide onboarding structure (chosen: 1=A, 2=B)
  - Signup success: in-page vs new `spendnote-welcome.html`
  - Next steps: success only vs success + dismissable dashboard panel
- [x] **DEC-TRIAL** Trial without card upfront (decision): **14 days OR 20 transactions** (whichever comes first). At limit: **view-only**, **no export**. Invites: **Pro only**.
- [x] **P0** Production-ready acceptance criteria (baseline)
  - [x] Client error tracking: Sentry CDN loader + `captureException` backend hibákra
  - [x] Edge Function logging: strukturált error response-ok, Supabase Dashboard Logs
  - [x] Smoke test checklist documented (`SMOKE_CHECKLIST.md`: auth, create transaction, receipt print/PDF/email, invite)
  - [x] Abuse protection: `send-invite-email` rate limit RPC (3/target, 12/caller per 10 perc); Supabase Auth beépített rate limit
  - [x] Cloudflare baseline: `RL-HighRisk-Paths` rate limit rule aktív (free tier max); Managed Rules → Cloudflare Pro-val később
  - ⚠️ **TODO premier előtt:** Cloudflare Pro előfizetés + Managed Ruleset bekapcsolás + további WAF szabályok bővítése
- [x] **L1a** Onboarding UI (core, tier-agnosztikus): registration success state + post-login next steps (Cash Box → Transaction → Receipt), invite explanation — **kész** (`spendnote-welcome.html`)
- [x] **L2** Email pack (6 templates): HTML template pack kész (`supabase/email-templates/*`) — welcome, confirmation, invite, invite-accepted, password-reset, password-changed + trigger/recipient mapping dokumentálva (`supabase/email-templates/README.md`) + SpendNote logó (receipt icon + wordmark) bekerült minden template-be
- [x] **L3** Email delivery implementation: runtime wired (`send-invite-email` + `send-user-event-email`) for invite, welcome, invite-accepted-admin, password-changed; remaining manual step: Supabase Auth template editorben confirm/reset HTML bemásolása (`supabase/email-templates/SUPABASE-SETUP.md`)
- [x] **L3b** Email conversion overhaul: all 6 existing templates rewritten for better conversion (action-oriented copy, indigo CTA buttons, personalized subjects). 3 new templates added: `first_transaction_created`, `trial_expiry_warning`, `upgrade_confirmed`. Edge function (`send-user-event-email`) updated with new handlers. Client-side triggers added in `dashboard.html` and `dashboard-form.js`.
- [x] **L4** Role-based Settings UI: Owner/Admin vs User (hide non-owned sections) — **kész** (`user-settings` + `team` oldalon role-alapú megjelenítés/tiltás).
- [x] **L5** Access control UX: user sees only assigned cash boxes; admin can assign/revoke cash box access in UI — **kész** (`spendnote-team.html` cash box grant/revoke, user scope szűrés).
- [x] **DB-TEAM-1** Team/org/invite DB versioning alignment: `invites` tábla + `spendnote_create_invite` RPC + RLS policies → `supabase-migrations/030_invites_table_and_create_invite_rpc.sql`; `database/schema.sql` + `database/SCHEMA-DOCUMENTATION.md` frissítve a kanonikus modellel.
- [x] **M1** Mobile strategy + responsive MVP completed (2026-02-18)
- [x] **S1** Subscription rules spec — **kész** (`S1-SPEC.md`): trial modell, csomag limitek, feature flag kulcsok, downgrade/törlés viselkedés dokumentálva.
- [x] **S2** Stripe prep (ready to plug in): subscription state data model + feature flags + UI placeholders + webhook handling plan — **kész** (`031_profiles_billing_state_and_preview_tier.sql`, `SpendNoteBilling`, User Settings billing summary placeholder)
- [x] **L1b** Onboarding UI (tier-specifikus): Free/Standard/Pro variánsok + **meghívott user** welcome ág implementálva (`spendnote-welcome.html`, 2026-02-26)
- [x] **DEPLOY-1** Migration plan: move from Vercel/demo domain to Cloudflare on `spendnote.app` (hosting target, caching rules)
- [x] **DEPLOY-2** Cloudflare DNS + SSL + redirects: decide canonical host (`spendnote.app` vs `www`), configure 301s and safe HSTS
- [x] **DEPLOY-3** Supabase for new domain: update Site URL + allowed redirect URLs; test login/signup/invite flows on `spendnote.app`
- [x] **M1** Mobile redesign complete: bottom nav bar, card lists, modal bottom sheet, tx detail 2×2 grid (2026-02-18)
- [x] **DEPLOY-4** Cutover rehearsal + go-live checklist: staging URL, smoke tests, rollback plan
- [ ] **S3** Stripe integration: checkout, customer portal, webhooks, live mode rollout + enforcement activation — **skeleton in place** (`create-checkout-session`, `create-portal-session`, `stripe-webhook`), production secrets/live test pending
- [x] **O1** Google OAuth: signup/login UI flow + provider/dashboard whitelist + account-linking policy validálva/lezárva (2026-02-26)
- [x] **MKT-1** Market scan + positioning: direct/adjacent alternatives + SpendNote differentiation + keyword list — **lezárva**, pozicionálás kész
- [x] **MKT-2** SEO content plan: 3 landing pages kész — `petty-cash-receipt-generator`, `cash-handoff-receipt`, `small-business-cash-receipt` (2026-02-27); sitemap frissítve, noindex → index, IRS/adó framing eltávolítva, cash handoff pozícionálás
- [x] **CLEAN-1** Codebase cleanup pass — **kész:** 3 unused footer template + `unified-styles.css` törölve (~500 sor), `dashboard.css` ~100 sor dead code eltávolítva (duplikált FIX blokkok, category hide, v23-v26 verziócímkék normalizálva), `supabase-config.js` scaffolding kommentek eltávolítva
- [x] **P3-1** Polish: Landing/FAQ/Terms refinements + edge cases + final UX consistency pass — **kész:** pricing og:image javítva, Organization schema sameAs (nem létező Twitter/LinkedIn) eltávolítva, tartalom/copy rendben

## App audit alapján megoldandó feladatok (2026-02-25)

### Kritikus (kötelező)

- [x] **AUDIT-C1** Org-aware RLS bevezetése `cash_boxes` táblára (`org_memberships` alapú hozzáférés, ne csak `user_id = auth.uid()`).
- [x] **AUDIT-C2** Org-aware RLS bevezetése `contacts` táblára (`org_memberships` alapú hozzáférés, ne csak `user_id = auth.uid()`).
- [x] **AUDIT-C3** Org-aware RLS bevezetése `transactions` táblára (`org_memberships` alapú hozzáférés, ne csak `user_id = auth.uid()`).
- [x] **AUDIT-C4** `orgs` RLS és policy-k visszaemelése a kanonikus `database/schema.sql` fájlba (migrációval szinkronban).

### Magas prioritás

- [x] **AUDIT-H1** Email megerősítés enforce ellenőrzése és UI visszajelzés megerősítetlen accountokra.
- [x] **AUDIT-H2** Jelszó erősség validáció (signup + password change) minimum policy-val.
- [x] **AUDIT-H3** Cash box törlés áthelyezése atomi szerver oldali RPC-be (kliens oldali többlépcsős delete helyett).
- [x] **AUDIT-H4** Audit log bevezetése kritikus eseményekre (role change, member remove, cash box update, void).
- [x] **AUDIT-H5** Void tranzakció role-korlát szigorítása (legalább Owner/Admin), vagy kötelező részletes naplózás.
- [x] **AUDIT-H6** Contact CRUD konzisztencia javítása User role esetben (owner-id mismatch + RLS következmények rendezése).

### Közepes prioritás

- [x] **AUDIT-M1** Onboarding/empty-state flow első belépésre — **kész:** welcome oldal (`spendnote-welcome.html`) + auto-létrehozott default USD cash box (`018_auto_create_default_cash_box.sql`); új felhasználó 1 percen belül el tud indulni.
- [x] **AUDIT-M2** ~~Tranzakció szerkesztés~~ — **by design: nincs.** Tranzakciók immutábilisak, kizárólag void lehetséges.
- [x] **AUDIT-M3** ~~Tranzakció törlés~~ — **by design: nincs.** Kizárólag void használható, törlés nem lehetséges.
- [x] **AUDIT-M4** Tranzakció export (CSV/PDF) a history nézetből — **már implementálva.**
- [x] **AUDIT-M5** Kontakt kereső/szűrő hozzáadása contact list oldalon — **már implementálva.**
- [x] **AUDIT-M6** ~~Receipt limit szerver oldali enforce~~ — **kész:** preview cap server-side enforce a `spendnote_create_transaction` RPC-ben (`032_spendnote_create_transaction_preview_server_guard.sql`), kliens oldali ellenőrzés továbbra is UX előellenőrzés.
- [x] **AUDIT-M7** ~~Cash box archiválás~~ — **elvetve.** Nem lesz archiválás, cash box törölhető vagy aktív.
- [x] **AUDIT-M8** ~~Email change flow~~ — **elvetve.** Nem szükséges; account törlés + újraregisztráció elérhető.
- [~] **AUDIT-M9** 2FA/MFA opció értékelése és roadmap döntés — **halasztva**, lehetséges hogy később kerül rá sor.
- [x] **AUDIT-M10** Legacy táblák (`team_members`, `cash_box_access`) deprecate + schema cleanup terv.

### Alacsony prioritás

- [ ] **AUDIT-L1** Dark mode támogatás (design token/CSS variable alap).
- [ ] **AUDIT-L2** i18n előkészítés (szövegek kivezetése forrásfájlba).
- [ ] **AUDIT-L3** Offline read-only baseline (service worker) felmérés.
- [ ] **AUDIT-L4** In-app notification center igény és minimum scope definiálás.
- [x] **AUDIT-L5** `spendnote-faq-old.html` kivezetés (törlés vagy redirect).
- [ ] **AUDIT-L6** Sentry environment tagging és release címkézés finomítása.
- [ ] **AUDIT-L7** Contact list pagination nagy adathalmazra.

## Where we are now (last updated: 2026-04-06 — Tier gating lezárva, billing hátralék)

### Nyelv: PROGRESS vs app (kanonikus)

- **PROGRESS + fejlesztői kommunikáció:** magyar.
- **SpendNote app (production UI + emailek):** **csak angol.** Bármilyen új üzenet (upgrade/downgrade toast, email, gating szöveg) implementáláskor angol copy; nincs magyar user-facing szöveg az appban.

### 2026-04-06 — Billing / csomagok: **minden tier client gating rendben**

**Kész (kód + visszajelzés):**
- Invite UX rendben.
- **Free**, **Standard**, **Pro** (és **Preview** dev): feature flag térkép kanonikus helye `SpendNoteFeatures._FLAGS` (`assets/js/supabase-config.js`), paywallok és modálok a fő folyamatokon egyeztetve (`S1-SPEC.md` / `S2-STRIPE-PLAN.md`).
- **Standard** ellenőrizve: új tx (nincs 20/200 kliens cap), CSV/PDF export, max 2 cash box + upgrade modal, org-szintű logo engedélyezett, Pro-only: custom receipt labels, email receipt, team invite, **custom ID prefix** (Pro modal + mentéskor SN), per-cash-box logo továbbra Pro felé (`can_customize_labels` proxy a cash box settings inline scriptben — viselkedés rendben).
- **Cash box settings UX:** új kassza **currency** mező `<select>` (nem datalist); **ID prefix** upgrade modal szöveg frissítve (angol copy).
- **Void:** UI korábban tévesen csak org `owner`/`admin` szerepkörnél engedélyezett → szóló / org-nélküli tulajoknál (Standard, Free, stb.) a gomb tiltva volt, holott az RPC (`spendnote_void_transaction`) a kassza tulajdonost is engedi. **Javítva:** void kizárólag org szerepkör **`user`** (meghívott tag) esetén tiltva UI-n; bulk void ugyanígy (`transaction-detail-ui.js`, `transaction-history-data.js`). Commit: `b249946` (és kapcsolódó cache-bust HTML).

**Hátra (nem tier-gating):**
- **Downgrade viselkedés (2026-04-06):** Első hullám kész — `066_tier_downgrade_cash_box_locks.sql` + Stripe webhook (`applyCashBoxTierDowngrade` / `clearCashBoxTierLocks`) + dashboard owner modal + RPC `spendnote_resolve_tier_cash_boxes` + `CASH_BOX_TRANSACTIONS_BLOCKED` a create RPC-ben. **Hátra még:** downgrade email/toast copy, Pro→Standard team tag „locked out” üzenet, egyéb edge case-ek (lásd V1 Launch §5).
- **Teljes lemondás:** Stripe `customer.subscription.deleted` → `free`; nincs dedikált downgrade UX/email.
- **Üzenetek:** Upgrade után van dashboard **toast** (angol) + `upgrade_confirmed` email. **Downgrade** (vagy Pro→Standard) felé: még nincs párhuzamos toast/email — ha készül, **csak angol** szöveg + külön email handler (ne keverjük az upgrade copyval).
- **S3 Stripe:** checkout / webhook / live teszt — lásd roadmap checklist.

---

### 2026-04-05 frissítés — Receipt / logó architektúra, tranzakció részlete snapshot, előnézet URL-limit

**Cél:** Logó és receipt megjelenés **adatbázis** és **tranzakció-snapshot** köré rendezése; localStorage nélkül; előnézetek megbízhatóak maradjanak hosszú `data:` URL esetén is.

**1) Logó: nincs localStorage (app-wide)**
- Receipthez kötődő logó **nem** tárolódik böngésző `localStorage`-ban (profil / cash box / `logoKey` / legacy `proLogo` kulcsok eltávolítva).
- Források: **Supabase** (`profiles.account_logo_url`, `cash_boxes.cash_box_logo_url`) + nyugta URL **`logoUrl`** paraméter; tranzakciós nyugta: **`txId` + bootstrap**.
- Érintett többek között: `assets/js/logo-editor.js`, `assets/js/user-settings.js`, `assets/js/cash-box-settings-data.js`, `spendnote-cash-box-settings.html`, `spendnote-pdf-receipt.html`, `spendnote-email-receipt.html`, `spendnote-receipt-print-two-copies.html`.
- Cash box logó mentés: ha hiányzik az oszlop / nem támogatott séma → **hiba**, nem „csak lokális” fallback.
- **Commit:** `b8fb190`

**2) Hosszú logó URL az előnézet iframe-ben → `postMessage`**
- Böngésző **URL-hossz limit** miatt a cash box **beállítások** előnézete és a **tranzakció részlete** iframe: ha a logó hosszabb ~2048 karakternél vagy `data:`, akkor `previewLogoInject=1` + szülő `postMessage({ spendnote: 'previewLogo', logoUrl })` (same-origin, `source === parent`).
- Nyugta oldalak: `previewLogoInject` + (`demo=1` **vagy** érvényes `txId`).
- **Commitok:** `5c3f885`, `b015661`

**3) Tranzakció részlete / már létező receipt: csak snapshot**
- **Logó a nyugtán:** kizárólag `transactions.sender_profile_logo_url_snapshot` — **nem** élő cash box, **nem** aktuális profil logó (`receiptLogoUrl`, bootstrap `preferredLogo` összhangban).
- **Címkék** (`receipt_title`, stb.) és **toggle-ok** (`receipt_show_*`): kizárólag a **tranzakció sor** mezői; **nincs** visszaesés az élő `cash_boxes` értékekre. Üres/NULL snapshotnál: beépített default szövegek és default láthatóság (séma komment szerint eredetileg is ez volt a kliens fallback).
- **Commitok:** `e8472de`, `ffe8be4`
- Köztes „cash box előbb mint snapshot” próba (`67d8c35`) **visszavonva** a fenti szabályra.

**4) Kapcsolódó korábbi alap (ugyanazon időszak / előtte)**
- Receipt snapshot mezők tranzakciókon, cash box receipt toggle mentés, tx detail `logo_settings` enrich: **`d8686a8`** és kapcsolódó migrációk (`064`, `065` jelleg).

**5) Termék / QA jegyzet**
- **Teamkezelés** admin oldalon stabilnak tapasztalva (meghívás, szerepek, cash box hozzárendelés) — részletes kódváltozás ebben a PROGRESS blokkban nem részletezve, státusz: működik.

**Következő lehetséges lépés (nem kötelező):**
- `logo_settings` (nagyítás/pozíció) jelenleg tx detail iframe URL-ben még a **beágyazott cash box**-ból jöhet; tökéletes történelmi hűséghez később **tranzakció-szintű snapshot** kellene (séma + insert).

---

### 2026-04-04 frissítés — Welcome email + login flow fix + teljes email audit

**Welcome email + login flow — ROOT CAUSE + FIX:**
- A welcome email nem működött: 3 különböző helyen próbálta küldeni (supabase-config.js, spendnote-login.html, spendnote-welcome.html) → race condition + inkonzisztens viselkedés
- Az Edge Function-ök NEM voltak `--no-verify-jwt` flag-gel deployolva → a Supabase gateway 401-et adott minden functions.invoke hívásra (a DB hívások RLS+anon key-jel mentek, ezért azok működtek)
- A `SPENDNOTE_EMAIL_FROM` secret "invite"-ra volt állítva → rossz feladó név
- A `DEFAULT_POST_LOGIN_PATH` `/app`-ra mutatott (nem létező URL) → javítva `dashboard.html`-re
- A new user detekció `auth.created_at` alapú volt → törölt-újra-létrehozott fiókoknál nem ismerte fel újnak → javítva profil-alapú detekció (profiles tábla lekérdezés)

**Elvégzett javítások:**
1. ✅ Welcome email küldés centralizálva → egyetlen pont: **dashboard.html currency confirm "Continue" gomb**
2. ✅ Welcome email küldés eltávolítva: `supabase-config.js` (`ensureProfile` + `signUp`), `spendnote-login.html`, `spendnote-welcome.html` page load
3. ✅ `spendnote-welcome.html` Save/Skip gombok is hívják a `sendWelcomeEmail()`-t (fallback)
4. ✅ `DEFAULT_POST_LOGIN_PATH` javítva: `/app` → `dashboard.html`
5. ✅ New user detekció: profil-alapú (profiles tábla), nem `created_at` timestamp → fedezi törölt-újra-létrehozott fiókokat
6. ✅ **Összes Edge Function újra deployolva `--no-verify-jwt` flag-gel** (7 db):
   - `send-user-event-email`, `send-invite-email`, `delete-account`, `create-checkout-session`, `create-portal-session`, `update-subscription`, `stripe-webhook`
7. ✅ `SPENDNOTE_EMAIL_FROM` secret beállítva: `SpendNote <no-reply@spendnote.app>`
8. ✅ Cache-busting frissítve: `supabase-config.js` → `v=20260404-0150` (26 HTML fájlban), `dashboard-form.js` → `v=20260404-1`

**Email copy polish (ChatGPT finomhangolás):**
- ✅ **Welcome email**: subject → "You're in — now track your first cash movement", CTA → "Start tracking your cash (30 sec)", subtitle → "One step left: start tracking your cash."
- ✅ **First transaction email**: subject → "Your first cash movement is on record", CTA → "Record the next one (30 sec)", opening → "Good. You're now tracking your cash."
- ✅ Minden emailből eltávolítva "Reply to this email" → helyette: FAQ link + support@spendnote.app
- ✅ Minden emailben `hello@spendnote.app` → `support@spendnote.app`

**Bug fix:**
- ✅ `first_transaction_created` email küldés ki volt véve a `gtag` feltétel mögül → ad blocker / inkognitó esetén nem ment ki → most mindig fut

**Összesen 7 email típus — mind működik:**
| # | Email | Trigger | Feladó |
|---|-------|---------|--------|
| 1 | Welcome | Dashboard currency confirm Continue | SpendNote |
| 2 | Password changed | supabase-config.js updatePassword() | SpendNote |
| 3 | Invite accepted (admin) | supabase-config.js invite accept | SpendNote |
| 4 | First transaction | dashboard-form.js (1. tranzakció) | SpendNote |
| 5 | Trial expiry warning | dashboard.html (3 nap hátra) | SpendNote |
| 6 | Upgrade confirmed | dashboard.html (tier upgrade) | SpendNote |
| 7 | Team invite | send-invite-email Edge Function | SpendNote |

**Commitok:** `794b652` → `f01afcb` (7 commit)

---

**PENDING feladatok:**
- [x] Team invite — custom modal + bekötés *(késznek jelölve — tulaj visszajelzés)*
- [x] Free csomag gating — *(késznek jelölve)*
- [x] **Standard** (és tier-keresztmetszet) gating — **lezárva** (lásd fenti 2026-04-06 blokk: paywallok, void UI, ID prefix, currency select)
- [~] Downgrade / többlet cash box: **S1 §4** első hullám — migráció `066`, Stripe webhook lock/clear, dashboard owner modal, create RPC `CASH_BOX_TRANSACTIONS_BLOCKED`; hátra: downgrade email/toast, team tag locked-out UX
- [ ] Downgrade (és opcionálisan csomagváltás) **angol** in-app + email értesítés — upgrade mintájára, külön copy
- [ ] Spot-check / regresszió: új oldalak vagy szerepkör-él esetek (nem blokkoló a tier launchra)
- [ ] Free tier: 20 tx / 14 nap — regresszió teszt
- [ ] Pricing → signup flow ellenőrzés
- [ ] Checkout + webhook teszt (4242 kártya)

---

## Where we are now (last updated: 2026-03-29 — Domain repositioning: template → pain/anti-template)

### 2026-03-29 frissítés — SEO domain repositioning (template cluster átfordítás)

**Stratégiaváltás:**
- A template cluster (voucher template, receipt template, log template) sok megjelenést hoz, de rossz intenttel (letölthető fájlt várnak, nem SaaS-t)
- Nem több traffic kell — hanem **más traffic** (problem/pain intent)
- Meglévő top impression oldalak átírása anti-template / pain-first angle-re

**Elkészült (2026-03-29):**
- ✅ `what-is-petty-cash` — Wikipedia explainer → pain page ("You Have Petty Cash. Where Did It Go?"), definíció lecsúsztatva 40%-ra
- ✅ `cash-receipt-template` — template page → anti-template page ("You Downloaded a Template. Now Where Is It?"), intent mapping + hard positioning blokkok

**Következő batch (2-3 nap várakozás után):**
- 🔴 `petty-cash-voucher-template` (378 megjelenés) — anti-template átírás
- 🔴 `petty-cash-voucher-sample` (187 megjelenés) — együtt kezelni a voucher template-tel
- 🔴 `petty-cash-log-template` (137 megjelenés) — kulcs oldal, log = tracking → legközelebb a termékhez

**Később (2. kör):**
- 🟡 `cash-refund-receipt` (138 megjelenés) — pain irányba vihető
- 🟡 `how-to-manage-petty-cash-small-business` (120 megjelenés) — túl általános, nehéz

**Ne nyúlj hozzá (jó pozícióban vannak):**
- 🟢 `petty-cash-how-much-to-keep` (poz 14.2) — arany, ne piszkáld
- 🟢 `cash-drawer-reconciliation` (poz 25.6) — jó irány
- 🟢 `employee-cash-advance-receipt` (poz 21.1) — use case oldal, békén hagyni
- 🟢 Phase 4 oldalak (who-has-the-cash, boss-cant-see) — page 1-2, ne nyúlj hozzá

---

## Korábbi frissítés (2026-03-26 — SEO szünet + Google Ads terv + Stripe QA hétvégén)

### 2026-03-26 frissítés — SEO szünet, Google Ads terv, Stripe QA menetrend

**SEO státusz — SZÜNET → REPOSITIONING (2026-03-29-tól aktív):**
- A "template" / "petty cash voucher" kulcsszavak poz 50-100 → reménytelen (DA ~5 vs Canva DA 70-90)
- Az organikus kattintások 16/28 nap — nem elég a növekedéshez
- Phase 4 oldalak (who-has-the-cash, boss-cant-see) beindexelés alatt — várjuk az eredményt
- **Új döntés (2026-03-29):** nem új oldalak kellenek, hanem a meglévő top impression oldalak átfordítása template → pain/anti-template angle-re
- Az SEO a háttérben dolgozik, de nem ez a növekedési motor rövid távon.

**Eddigi eredmények (28 nap):**
- 16 kattintás, 3 regisztráció (18.75% signup rate — kiemelkedő!)
- 1 aktív user aki végigpróbálta az appot (UK charity)
- 8 oldal volt page 1-en rövid ideig (freshness boost, de visszaestek)
- Bing: poz 3-8 "app for petty cash" típusú keresésekre (de nem indexeli a többi oldalt)

**Google Ads terv (Stripe élesítés után):**
- **Budget:** $10/nap ($300/hó keret)
- **Kulcsszavak:** "petty cash app", "cash tracking app", "petty cash tracking app", "simple petty cash software"
- **Negative keywords:** "free template", "excel", "download", "printable"
- **Landing page-ek:** `who-has-the-cash-right-now` és `boss-cant-see-where-cash-goes` (A/B teszt)
- **Geotargeting:** US + UK
- **Becsült eredmény (18.75% signup rate alapján):** ~120-150 klikk/hó → 22-28 regisztráció/hó
- **Cél:** validáció (fizetnek-e?), nem profit. Első hét után optimalizálás.

**Hétvégi Stripe QA menetrend (2026-03-29/30):**
1. Feature gating ellenőrzés — saját fiókkal tesztelünk (SQL-lel free→standard→pro átállítás)
2. Tier falak + üzenetek összegyűjtése — hol, milyen szöveggel ütközik a user falba
3. Pricing → signup flow ellenőrzés
4. Checkout + webhook teszt (test mode, 4242 kártya)
5. Debug cleanup (console.log-ok eltávolítása)
6. Élesítési checklist előkészítés
7. **UTOLSÓ:** Preview userek átállítása (csak miután minden más kész és tesztelve)

**Sorrend a végleges élesítésig:**
- Stripe QA (hétvége) → Stripe élesítés (adószám után) → Google Ads indítás → Onboarding/retention javítás (30+ reg adatai alapján)

## Where we are now (last updated: 2026-03-21 — SEO CTR optimization Phase 1 + Phase 2)

### 2026-03-21 frissítés — SEO Performance Analysis + Title/Meta Rewrite (13 oldal KÉSZ)

**Google Search Console elemzés eredménye:**
- 47 indexelt oldal, ~1700+ megjelenés összesen, de mindössze ~10 kattintás
- Átlagos pozíció ~50 — a legtöbb oldal 3-5. oldalon van a keresőben
- Fő probléma: "template" kulcsszavakra (cash receipt template, petty cash voucher template) túl erős a verseny (Canva, Template.net)
- Alacsony domain authority (új domain, kevés backlink)
- Intent mismatch: a "template" keresők letölthető fájlt várnak, nem SaaS tool-t

**Azonosított "majdnem page 1" oldalak (pozíció 5-26):**
- 13 oldal, amelyek már relatíve jól rankelnek de alacsony CTR-rel
- Ezekre fókuszáltunk: title tag + meta description átírás

**Elvégzett változtatások (commit `74ae773`):**
1. `two-person-cash-count-policy.html` (pos 5.1) — "Rules + Sign-Off Template"
2. `babysitter-cash-payment-receipt.html` (pos 8.5) — "Instant Proof for Families"
3. `tutor-cash-payment-receipt.html` (pos 9.4) — "Instant Proof per Session"
4. `petty-cash-security-tips.html` (pos 10) — "Prevent Theft & Fraud"
5. `event-cash-handling.html` (pos 10.8) — "Float Setup, Tracking & Close-Out"
6. `digital-petty-cash-book.html` (pos 11.7) — "Replace Your Paper Ledger"
7. `petty-cash-how-much-to-keep.html` (pos 12.9) — "Float Formula + Examples"
8. `custom-cash-receipt-with-logo.html` (pos 14.9) — "Free to Create"
9. `school-money-collection-tracker.html` (pos 15.4) — "See Who Paid"
10. `cash-handoff-receipt.html` (pos 15.9) — "Document Every Internal Transfer"
11. `employee-cash-advance-receipt.html` (pos 16.6) — "Instant Proof of Payment"
12. `cash-refund-receipt.html` (pos 18.4) — "Instant Refund Documentation"
13. `cash-drawer-reconciliation.html` (pos 26.3) — "Step-by-Step Close-Out Guide"

**Minden oldalon frissítve:** `<title>`, `<meta name="description">`, `og:title`, `og:description`, `twitter:title`, `twitter:description`

**Stratégia:**
- "| SpendNote" brand suffix eltávolítva — 12+ karakter felszabadult klikkelhetó szövegnek
- Action/benefit szavak hozzáadva — "Instant Proof", "Free to Create", "See Who Paid"
- Meta description-ök beszélgetősek lettek — "Paying your babysitter in cash?" típusú kérdések
- Fő kulcsszó előre került minden title-ben
- Minden title 60 karakter alatt — teljes SERP láthatóság

**Várt hatás:** CTR javulás 2-4 héten belül, pozíció javulás 4-6 héten belül (top 3 jelölt page 1-re: two-person-cash-count-policy, babysitter-receipt, tutor-receipt)

### 2026-03-21 frissítés — SEO Phase 2: Title/Meta Rewrite (maradék 31 oldal + index.html KÉSZ)

**Elvégzett változtatások (commit `1fa0096`):**
- Maradék 31 SEO oldal + index.html title + meta description átírása — ugyanaz a stratégia mint Phase 1
- "| SpendNote" / "- SpendNote" suffix eltávolítva minden oldalról
- Benefit/action szuffixok hozzáadva (pl. "— Track Every Disbursement", "— Find the Gap", "— Why Teams Switch")
- Meta description-ök beszélgetős, kérdés formátumúra átírva
- og:title, og:description, twitter:title, twitter:description szinkronizálva minden oldalon
- index.html landing page: "SpendNote — Petty Cash Tracking & Receipts for Teams"

**Frissített oldalak (31 + index.html = 32 oldal × 6 tag = 192 tag):**
cash-count-sheet-template, cash-deposit-receipt, cash-discrepancy-between-shifts, cash-paid-out-log, cash-payment-received-proof, cash-receipt-template, construction-site-petty-cash, contractor-advance-payment-receipt, daily-cash-report-template, digital-receipt-book, handyman-cash-payment-receipt, how-to-fill-out-petty-cash-voucher, how-to-manage-petty-cash-small-business, how-to-start-petty-cash-box, how-to-track-cash-payments, manage-petty-cash-remotely, office-expense-reimbursement-form, petty-cash-app-vs-excel, petty-cash-audit-checklist, petty-cash-does-not-balance, petty-cash-log-template, petty-cash-policy-template, petty-cash-receipt-generator, petty-cash-reconciliation, petty-cash-replenishment-form, petty-cash-voucher-sample, petty-cash-voucher-template, small-business-cash-receipt, what-is-petty-cash, where-to-keep-petty-cash, who-took-money-from-cash-box, index.html

**Összesen Phase 1 + Phase 2:** 13 + 32 = 45 oldal, 270 tag frissítve

### 2026-03-21 — CTR framing konklúzió + Phase 3 terv

**Tanulság a Phase 1-2 title rewrite-ból:**
A title-ök SEO szempontból rendben vannak (keyword elöl, nincs stuffing, nincs clickbait), de sok title túl "leíró" maradt — funkciót mond, nem szituációt/pain-t. A meta description-ök már beszélgetős stílusúak, de a title-ök egy részénél hiányzik a pszichológiai CTR trigger.

**Példák a különbségre:**
| Jelenlegi (leíró) | Jobb (pain/szituáció framing) |
|---|---|
| Cash Refund Receipt — Instant Refund Documentation | Need to Refund Cash? Use This Simple Receipt (Free) |
| Employee Cash Advance Receipt — Instant Proof of Payment | Gave an Employee Cash? Create a Signed Receipt in 30s |
| Petty Cash How Much to Keep? Float Formula + Examples | How Much Petty Cash Should You Keep? (Simple Rule) |

**Fontos:** ez NEM keyword változtatás és NEM agresszívebb SEO — csak jobb copywriting a title-ben. Nulla SEO kockázat, mert nem változik a relevancia, csak a framing.

**Ahol a framing MÁR jó volt:**
- "Petty Cash Doesn't Balance? Here's Why + How to Fix It" — szituáció + megoldás
- "Who Took Money From the Cash Box? Find Out Fast" — pain + trigger
- Meta description-ök szinte mind kérdés formátumúak

**Egyéb elvégzett változtatások (2026-03-21):**
- 404.html: GA4 `page_not_found` event hozzáadva (page_path + referrer tracking) — commit `d3e6145`
- `_redirects`: "kitalálható" URL-ekre redirect hozzáadva (pricing.html, faq.html, login.html, stb.)
- Backlink beküldések: AlternativeTo, Capterra, WebsiteLaunches (jóváhagyás alatt)

**Következő lépések (SEO Phase 3 — PENDING):**
1. **7-10 nap várakozás** — ne nyúlj semmihez, hagyd hogy a Google indexelje az új title/meta-kat
2. **GSC-ben újraindexelés kérése** az összes frissített URL-re (45 oldal) — FOLYAMATBAN (22 beküldve, 11 holnap, 12 ráér)
3. **CTR elemzés** — GSC-ben megnézni: melyik oldalaknál marad 0% CTR top 15-ös pozícióban
4. **Title framing csere (3-5 oldal)** — CSAK azoknál amelyek top 15-ben vannak de 0% CTR → szituáció/pain framing (nem keyword csere, csak copywriting)
5. Tartalom megerősítés a top 3-5 oldalon (új H2-k GSC query-k alapján)
6. Backlink építés folytatása (LinkedIn company page, Crunchbase, heti Reddit/Quora)

### 2026-03-22 — Backlink státusz + Pozíció elemzés + Product Angle felismerés

**Backlink státusz:**
| Oldal | Státusz | DA |
|-------|---------|-----|
| SaasHub | LIVE | ~55 |
| WebsiteLaunches | LIVE | ~30 |
| G2 | LIVE | ~90 |
| SourceForge | Jóváhagyás alatt | ~85 |
| AlternativeTo | Jóváhagyás alatt | ~60 |
| Capterra | Jóváhagyás alatt | ~80 |

**GSC pozíció elemzés (2026-03-22, 7 napos adat):**
- 8 oldal van page 1-en (pozíció < 10): homepage (2.0), how-to-start-petty-cash-box (4.0), digital-petty-cash-book (5.0), two-person-cash-count-policy (5.3), manage-petty-cash-remotely (6.5), babysitter-cash-payment-receipt (7.3), cash-drawer-reconciliation (8.3), who-took-money-from-cash-box (9.5)
- Több oldal JAVULT a korábbi adatokhoz képest (digital-petty-cash-book: 11.7→5.0, cash-drawer-reconciliation: 26.3→8.3)
- Legnagyobb volumenű oldal: petty-cash-how-much-to-keep (93 megjelenés, pozíció 13.1) — ha top 10-be kerül, az hozza a kattintásokat

**Kulcs felismerés — product angle élesítés:**

A SpendNote valójában nem "petty cash app" — hanem **"cash accountability tool"**: ki kezeli a pénzt, elszámolt-e, mennyi van még nála, a főnök lássa távolról.

A jelenlegi SEO oldalak "petty cash" + "receipt" + "template" kulcsszavakra céloznak — ez jó alap, de hiányzik az éles use case angle. A valós user nem "petty cash"-t keres, hanem:
- "honnan tudom hol a pénz?"
- "elszámolt-e a kolléga?"
- "hogyan követem az irodai készpénzt?"

**SEO Phase 4 terv — "Cash Accountability" angle oldalak (PLANNED, építés: ~április eleje):**

**3 core oldal (ezeket építjük):**

| # | Slug | Title angle | Miért erős |
|---|------|------------|-----------|
| 1 | who-has-the-cash-right-now | Who Has the Cash Right Now? Track It Instantly | Core pain — a legerősebb angle az egész listában |
| 2 | cash-advance-not-returned | Employee Didn't Return Cash Advance? What to Do | Konkrét szituáció, niche fájdalom |
| 3 | boss-cant-see-where-cash-goes | Can't See Where Your Team's Cash Goes? Fix That | Emotional trigger — frusztráció, nem feature |

**+1 opcionális (ha a core 3 jól teljesít):**

| # | Slug | Title angle | Feltétel |
|---|------|------------|---------|
| 4 | track-cash-between-employees | Track Cash Between Employees — Who Gave, Who Got | Csak ha jól elkülönül a `cash-handoff-receipt`-től (az = dokumentum/proof, ez = kontroll/visibility) |

**Kanibalizáció-kezelés — fontos tanulság:**
A kanibalizáció nem topic overlap, hanem **intent overlap**. Két oldal szólhat hasonló témáról, ha a user szándéka más:
- `cash-handoff-receipt` = "csinálj bizonylatot" (dokumentálás intent)
- `track-cash-between-employees` = "kinél van most a pénz?" (kontroll/visibility intent)
- → ha a tartalom/framing világosan elkülöníti az intentet, megférnek
- Aranyszabály: **1 oldal = 1 intent** (nem 1 topic)

**Fontos:** NEM "petty cash" keyword-ök, hanem szituáció/pain alapú. Célcsoport: irodavezető, kisvállalkozó, csapatvezető aki távolról akarja látni a pénzt.

**Bing Webmaster Tools adatok (2026-03-24):**
- "app for petty cash" → pozíció **8** (page 1!)
- "petty cash management app" → pozíció **7**
- "i need a simple app for keeping track of petty cash" → pozíció **3**
- Tanulság: az emberek appot/megoldást keresnek, nem template-et

**Teljesítmény (2026-03-24):** hétfő-kedd ~10 kattintás, 1 UK charity regisztráció, legjobb napi GSC: 4 kattintás / 3.1% CTR

**Időzítés (felgyorsítva):**
1. **2026-03-24: 2 core oldal megépítése** — a Google gyorsabban indexel mint vártuk
2. Teljesítmény figyelés 2 hétig
3. Ha jól megy: további oldalak + meglévő oldalak angle finomítása

**2 új SEO oldal KÉSZ + finomhangolva + indexelés kérve (2026-03-24):**
- `who-has-the-cash-right-now.html` — title: "Simple Petty Cash Tracking App — See Who Has the Cash Now" — H1: "Who Has the Cash Right Now?" — problem-first sales landing
- `boss-cant-see-where-cash-goes.html` — title: "Can't See Where Your Cash Is Going? — Fix That Today" — emotional trigger, owner frusztráció
- 4 kör ChatGPT finomhangolás: hero hook, copy felezve, CTA átírva, kulcsszavak beszőve, meta desc frissítve
- Sitemap.xml + resources oldal frissítve (belső linkek)
- GSC indexelés kérés beküldve (mindkét oldal + resources)
- Bing: csak landing page indexelve 4 hét után — Google a fő csatorna
- Következő: 2 hét figyelés → ha jó: cash-advance-not-returned

### 2026-03-23 — UK charity signup + nonprofit szegmens felismerés

**Új signup:** UK-s jótékonysági szervezet, céges email. Ez az első valódi "target user":
- Fizetőképes piac (UK)
- Céges domain (nem gmail)
- Szervezet ami készpénzzel dolgozik, elszámolás kell neki, proof kell

**Validáció:** ha egy ilyen user magától rátalált, az azt jelenti:
- Az SEO oldalak működnek (valószínűleg a title változtatás hatása)
- A charity/nonprofit szegmens valós célcsoport

**Új szegmens azonosítva: nonprofits / charities / community orgs**
Jellemzők: sok készpénz, kis kifizetések, elszámolási kötelezettség, önkéntesek kezelik a pénzt, proof kell.

**Potenciális SEO oldalak (Phase 5 — PLANNED, tervezés):**

| # | Slug | Angle | Megjegyzés |
|---|------|-------|-----------|
| 1 | charity-cash-tracking | Track Cash at Your Charity — Every Pound Accounted For | Általános charity cash management |
| 2 | nonprofit-petty-cash | Nonprofit Petty Cash — Simple Rules for Small Teams | Petty cash specifikusan nonprofit-oknak |
| 3 | fundraiser-cash-handling | Fundraiser Cash Handling — Receipt Every Transaction | Gyűjtések, események, bake sale-ek |
| 4 | church-cash-management | Church Cash Management — Track Offerings & Expenses | Egyházi pénzkezelés (nagy piac US-ben) |
| 5 | volunteer-cash-receipt | Volunteer Cash Receipt — Proof for Every Handoff | Önkéntesek közötti pénz mozgás |

**JOGI KORLÁT — FONTOS:**
- NEM használunk "donation receipt" / "donation proof" kifejezést — sok országban (UK Gift Aid, US IRS 501(c)(3), EU) ez adóigazolás, szabályozott dokumentum
- A SpendNote NEM adóigazolást generál — hanem "payment receipt" / "cash receipt" / "transaction record" / "proof of payment"
- Minden charity SEO oldalon ezt egyértelműen jelezni kell: "This is not a tax receipt or official donation acknowledgment"
- Biztonságos kifejezések: cash receipt, payment receipt, transaction record, proof of payment, cash tracking

---

## Where we are now (last updated: 2026-03-18 — SEO progress + pending tasks)

### 2026-03-18 frissítés — SEO Batch 1 + Resource Center + tervek (KÉSZ + PENDING)

**Elkészült:**
- **SEO Batch 1 (5 oldal)** — LIVE + indexelve (what-is-petty-cash, where-to-keep-petty-cash, petty-cash-security-tips, two-person-cash-count-policy, petty-cash-how-much-to-keep)
- **Hub page linkek** — `how-to-manage-petty-cash-small-business.html`-ből 5 in-context link az új oldalakra
- **Resource Center** — `spendnote-resources.html` létrehozva: 44 cikk, 6 kategória, kereső mező, auth-aware nav, BreadcrumbList structured data
- **Footer "Resources" link** — hozzáadva mind az 51 HTML oldalhoz
- **Sitemap** — 47 URL (frissítve)
- **seoplan.md** — Daily Cash Tracking klaszter beépítve (6 új oldal idea + 5 keyword expansion task meglévő oldalakra)
- **Indexable oldalak:** 47

**Hétvégére PENDING feladatok:**

1. **SEO Batch 2** — 11 oldal hátra (7 Service Provider + 3 Excel/Spreadsheet + 1 bonus)
2. **Daily Cash Tracking klaszter** — 3 TOP PICK oldal: `restaurant-cash-count-sheet`, `retail-cash-reconciliation`, `store-daily-cash-log` + keyword expansion meglévő oldalakra
3. **Stripe bekötés** — KÓD KÉSZ, `STRIPE_LIVE=false` GATE AKTÍV (2026-03-20):
   - ✅ Stripe Dashboard: Products + Prices létrehozva (TEST MODE, adószám pending)
   - ✅ Price ID-k (test): Standard $19/mo, $190/yr | Pro $29/mo, $290/yr | Extra Seat $5/mo
   - ✅ DB: `seat_count` mező hozzáadva (migration 037)
   - ✅ Edge Functions deploy-olva (`--no-verify-jwt`): `create-checkout-session`, `update-subscription`, `stripe-webhook`, `create-portal-session`
   - ✅ Frontend: `SpendNoteStripe.updateSubscription()`, pricing page smart buttons + seat selector, user settings gomb szétválasztás
   - ✅ Team page: seat limit enforcement (Pro only invites, seat count check), seat counter (ikon + progress bar)
   - ✅ Nav menü: Team menüpont + org context csak Pro/preview usereknél jelenik meg
   - ✅ Team page gate: nem-Pro userek redirect → pricing (`?minPlan=pro&feature=Team Management`)
   - ✅ Supabase Secrets feltöltve (8 db), Webhook endpoint Active
   - ✅ Stripe test checkout TESZTELVE — működik (Pro yearly checkout megnyílt)
   - ✅ **`STRIPE_LIVE = false`** gate aktív (`supabase-config.js`):
     - Pricing page: Standard/Pro gombok → "Coming Soon" (disabled)
     - User Settings: "Change Plan" rejtve, "Manage Billing" → disabled, "Cancel" rejtve
     - Minden `_invoke()` hívás blokkolva: "Billing is not yet available"
   - ⏳ Customer Portal config: test módban nem menthető, live módra marad (adószám után)
   - **Élesítéskor:** `STRIPE_LIVE = false` → `true` + live Stripe keys + Customer Portal config
   - **Billing szabályok:**
     - Plan váltás (upgrade/downgrade) a jelenlegi billing periódus VÉGÉN lép érvénybe, NINCS proration
     - Visszatérítés csak ha <20 tranzakció készült az adott billing periódusban
     - Extra seat mindig $5/hó, éves Pro plan esetén is
     - Pro csomag 3 usert tartalmaz, felette extra seat szükséges
   - ⏳ **PENDING QA — teljes flow ellenőrzés (élesítés előtt):**
     - **Tier falak + üzenetek:**
       - [ ] free/standard user → Team oldal redirect? Nav Team link rejtve?
       - [ ] Hol, milyen szöveggel ütközik a user falba? (üzenetek összegyűjtése)
       - [ ] Cash Box limit: Free=1, Standard=2, Pro=unlimited — be van kényszerítve?
       - [ ] Tranzakció limit: preview=200 — mi történik elérésnél? Üzenet?
       - [ ] Feature gating: custom logo upload (Standard+), receipt layouts (Standard+), CSV export (Standard+), email receipts (Pro) — le vannak zárva?
     - **Pricing + signup flow:**
       - [ ] "Start Free" gomb → mi történik be nem jelentkezett usernél?
       - [ ] Bejelentkezett preview user → "Get Started" / "Coming Soon" helyes?
       - [ ] Éves/havi toggle: helyes árak, "Save $X" számítás
     - **Checkout + webhook ciklus:**
       - [ ] Standard/Pro "Get Started" → Stripe Checkout megnyílik
       - [ ] Sikeres fizetés → webhook → profil frissül? (tier, billing_status, stripe_customer_id, seat_count)
       - [ ] Sikertelen fizetés → mi történik? past_due kezelés?
     - **Plan váltás + seat:**
       - [ ] Pro → Standard, Standard → Pro, seat szám módosítás
       - [ ] Seat selector → "Update Seats" gomb → update-subscription hívás
     - **Billing portal + cancel:**
       - [ ] Manage Billing → Stripe Customer Portal megnyílik?
       - [ ] Cancel subscription → periódus végén jár le? Profil frissül?
     - **Team:**
       - [ ] Team invite: seat limit elérve → upgrade prompt?
       - [ ] Seat counter: valós adatot mutat? Invite/remove után frissül?
     - **Downgrade kezelés:**
       - [ ] Pro → Standard: mi történik a team memberekkel? Extra cash box-okkal?
       - [ ] Standard → Free: mi történik a 2. cash box-szal? Tranzakciókkal?
     - **Preview → éles migráció:**
       - [ ] Meglévő preview userek: maradnak preview-ban, vagy kell plan választás?
       - [ ] Preview → Free átállás stratégia (ha billing megy élesbe)
     - **Élesítési checklist:**
       - [ ] `STRIPE_LIVE = false` → `true` (`supabase-config.js`)
       - [ ] Stripe test keys → live keys (Supabase Secrets csere)
       - [ ] Stripe Webhook endpoint: új live endpoint + signing secret
       - [ ] Customer Portal config (live módban): legal policies, branding, cancel settings
       - [ ] Statement descriptor: `SPENDNOTE`
       - [ ] Edge Functions újra deploy (ha secret-ek változnak)
       - [ ] supabase-config.js cache verzió bump
     - **Cleanup:**
       - [ ] Debug console.log-ok eltávolítása (team-page.js profil logok)
4. ~~**Google OAuth consent screen**~~ — KÉSZ (2026-03-20):
   - Google Cloud Console Branding: app név → SpendNote, logó, privacy/terms linkek
   - Google Groups: SpendNote Support csoport (support@spendnote.app)
   - Supabase Custom Domain AKTÍV: `api.spendnote.app` → a Google login most `spendnote.app`-ot mutat
   - Google Cloud Credentials: `https://api.spendnote.app/auth/v1/callback` redirect URI hozzáadva
   - Cloudflare DNS: CNAME `api` → `zrnnharudlgxuvewqryj.supabase.co` + TXT `_acme-challenge.api`
5. ~~**PDF download funkció**~~ — TÖRÖLVE: már rég működik (`spendnote-pdf-receipt.html` + Transaction Detail PDF gomb)
6. ~~**Receipt Preview**~~ — ELVETVA (2026-03-20): nem éri meg, a Cash Box Settings preview már lefedi, a form maga a preview, a 30 mp-es gyors nyomtatási flow-t nem szabad bonyolítani

---

## Where we are now (last updated: 2026-03-13 — Legal docs + cookie consent GDPR compliance)

### 2026-03-13 frissítés — Legal dokumentumok átírása + cookie consent GDPR szabványosítás (KÉSZ)

- **Terms of Service teljes átírás (14 szekció):**
  - Sildsys, LLC (Delaware LLC) azonosítva mint üzemeltető
  - Cég cím: 1111 S Governors Ave, B #45989, Dover, DE 19904, US
  - Stripe, Inc. nevesítve mint payment processor (§6.2), Stripe ToS/Privacy linkkel
  - Preview / Early Access szekció hozzáadva (§3): funkciók változhatnak, 200 receipt limit, árak változhatnak GA előtt
  - 30 napos pénzvisszafizetési garancia — **csak ha <20 tranzakció** a billing periódusban
  - Azonnali és végleges account + adat törlés (nem 30 napos export)
  - Disclaimer of Warranties (§9), Indemnification (§11) szekciók hozzáadva
  - Governing law: State of Delaware (§12), AAA arbitráció, class action waiver
  - Acceptable Use: money laundering / fake receipt sorok eltávolítva (nem a mi felelősségünk)
  - Cash box leírás javítva: "within one or more Cash Boxes" (nem "across")
- **Privacy Policy teljes átírás (12 szekció):**
  - Sildsys, LLC mint data controller
  - Service provider tábla: Stripe, Cloudflare, Supabase (EU Frankfurt), Resend, Google Analytics, Microsoft Clarity
  - Supabase lokáció: **EU (Frankfurt, Germany)** — GDPR erős jel
  - GDPR + CCPA jogok szekció (§8.1, §8.2)
  - International Data Transfers szekció (§7) — SCCs, data transfer frameworks
  - Azonnali törlés ígéret — nincs backup retention mention, nincs data copy
  - Payment adatokat kizárólag Stripe kezeli
- **Cookie consent banner GDPR szabványosítás:**
  - Magyar szöveg → **angol** ("Cookie Settings" / "Essential Only" / "Accept All")
  - Privacy Policy link hozzáadva a bannerben ("Learn more" → privacy#cookies)
  - Egyenrangú gombok — mindkettő azonos stílusú, nincs dark pattern (zöld "Accept All" eltávolítva)
  - `reopenConsentBanner()` metódus hozzáadva a consent visszavonáshoz
  - "Cookie Settings" link dinamikusan injektálva **minden footer**-be (45 oldal) — consent withdrawal GDPR-kötelező
  - Cache bump: main.js v33 → v34 (22 HTML fájl frissítve)
- **Fontos szabályok rögzítve:**
  - User személyneve SOHA nem jelenhet meg publikus oldalon
  - Backup SOHA nem használható egyéni törölt account visszaállítására (privacy ígéret)
  - Footer copyright marad "SpendNote" (brand) — Sildsys, LLC csak a jogi dokumentumokban
- **Commitok:** `ce66aff`, `bdfa970`, `32f1fdb`, `d1960fb`, `f6a9862`, `d3d1a9a`, `71950ad`, `80ff2c6`

## Where we are now (last updated: 2026-02-27 — email logo + SVG fix + UI javítások)

### 2026-02-27 frissítés — Email logo integráció + SVG path fix + UI javítások (KÉSZ)

- **SpendNote receipt icon + wordmark logó bekerült minden email template-be:**
  - Shared renderer (`supabase/functions/_shared/email-templates.ts`): `LOGO_SVG` konstans + `appCard` fehér header sávba table-layout logo blokk (icon + "SpendNote" felirat).
  - Mind a 6 statikus HTML template frissítve: welcome, email-confirmation, invite, invite-accepted-admin, password-reset, password-changed.
  - `send-user-event-email` és `send-invite-email` Edge Function-ök redepleyolva.
- **Receipt icon SVG path javítva (az összes oldalon):**
  - Hibás vegyes `M10 6 C10 4.89543 10.8954 4 12 4 L36 4...` path → helyes `M12 4 C10.895 4 10 4.895 10 6 L10 38...` alak.
  - 32 HTML fájlban javítva (összes app + SEO + marketing oldal + email template-ek).
- **Forgot-password auth-icon igazítás:**
  - `.auth-icon` CSS `justify-content: flex-start` → `center` — kulcs és boríték ikon középre igazítva.
- **Dashboard Invite banner bekötve:**
  - „Invite" gomb mostantól `spendnote-team.html`-re navigál.
- **Commitok:** `ad0f170`, `d24118c`, `bef18fb`, `901f04b`, `45379c0`

## Where we are now (last updated: 2026-02-26 late night — OAuth zárás + 4-way welcome variánsok)

### 2026-02-26 késő esti frissítés — User Settings logo + mobil pénznem regressziók (KÉSZ)

- **Receipt logo baseline persistence hiba lezárva (User Settings):**
  - `assets/js/logo-editor.js`: baseline kezelés megerősítve; mentett állapot reload után az új 100% alapállapot.
  - `assets/js/user-settings.js`: load/save után baseline UI visszaállítás enforce, régi localStorage zoom/pozíció felülírás semlegesítve.
  - Eredmény: megszűnt a mentés utáni visszaugrás (pl. 280% állapot), preview stabil.
- **Google OAuth production zárás (KÉSZ):**
  - Felhasználói visszajelzés alapján a Google belépés/regisztráció működik production környezetben.
  - Login oldalon is egységesítve a Google account chooser kérés (`prompt=select_account`), így login/signup viselkedés konzisztens.
  - Supabase provider + URL Configuration és Google Cloud callback URI ellenőrzés megtörtént.
  - Account-linking policy döntés rögzítve: egyező, verified email esetén auto-link ugyanarra az account identity-re.
  - `GOOGLE-OAUTH-PROD-CHECKLIST.md` lezárva.
- **L1b onboarding welcome variánsok lezárva (KÉSZ):**
  - `spendnote-welcome.html` most 4 ágat kezel: Free / Standard / Pro / Invited user.
  - Variáns-választás: org role + subscription tier alapján történik.
  - Meghívott user ágban a Receipt Identity blokk rejtve van, és mentéskor csak profil mezők frissülnek.
- **Mobil new transaction pénznem kijelzés regresszió lezárva:**
  - `assets/js/dashboard-modal.js`: `applyModalCurrencyUi` export `window` alá a standalone oldal számára.
  - `spendnote-new-transaction.html`: cash box váltásnál és preset line-item injektálás után explicit currency UI refresh.
  - Eredmény: fő összeg prefix, line item prefixek és total a kiválasztott cash box pénznemét követik (nem fix `$`).
- **Stripe go-live előkészítő dokumentáció elkészült:**
  - Új fájl: `STRIPE-GO-LIVE-CHECKLIST.md` (secret mapping, webhook eseménylista, E2E teszt script, rollout guardrail).
- **Receipt preview placeholder leakage fix (KÉSZ):**
  - `spendnote-receipt-print-two-copies.html`, `spendnote-pdf-receipt.html`, `spendnote-email-receipt.html`: `demoCompany` fallback `Acme Corporation` -> `—`.
  - Eredmény: ha nincs valós cégnév/profilnév, nem jelenik meg mesterséges cégadat a FROM blokkban.
- **Cash box settings logo toggle regresszió fix (KÉSZ):**
  - `spendnote-cash-box-settings.html`: a preview URL építés most tiszteletben tartja a `displayOptions.logo=0` állapotot.
  - Logo kikapcsoláskor kötelezően `logo=0` megy a receipt preview-ba, és a `logoKey` fallback nem írja felül.

## Where we are now (last updated: 2026-02-26 — Stripe S3 skeleton + server-side preview guard)

### 2026-02-26 frissítés — Billing/Stripe előkészítés + guard hardening (RÉSZBEN VALIDÁLVA)

- **S3 Stripe skeleton állapot (kód kész):**
  - `create-checkout-session`, `create-portal-session`, `stripe-webhook` Edge Function implementálva és frontendről meghívva.
  - Hiányzó lépések: production Stripe secret-ek, webhook endpoint beállítás, end-to-end live teszt.
- **Upgrade UX flow javítás:**
  - Lock overlay "View Plans" most `minPlan` + `feature` contextet ad át a pricing oldalnak.
  - Pricing oldal a javasolt csomagot kiemeli (`recommended` highlight), toggle váltás után is.
- **Server-side enforcement (Stripe előtt):**
  - Új migráció: `supabase-migrations/032_spendnote_create_transaction_preview_server_guard.sql`.
  - `spendnote_create_transaction` RPC-ben preview cap guard: limit felett `PREVIEW_RECEIPT_LIMIT_REACHED`.
  - SQL manuálisan lefuttatva Supabase-ben; végső runtime validáció (célzott preview profillal) következő sessionben lezárandó.
- **Google regisztráció flow hardening:**
  - `spendnote-signup.html`: Google OAuth indítás előtt kötelező Terms + preview checkbox ellenőrzés.
  - Redirect/loading állapot javítva; OAuth opciókhoz `prompt=select_account` hozzáadva.

### 2026-02-25 esti zárás — Receipt FROM/TO swap + Account Settings regresszió fix (KÉSZ)

- **Receipt FROM/TO swap (IN tranzakcióknál):**
  - `spendnote-receipt-print-two-copies.html`, `spendnote-pdf-receipt.html`, `spendnote-email-receipt.html` javítva.
  - IN tranzakciónál: contact = FROM, company = TO.
  - OUT tranzakciónál: company = FROM, contact = TO.
  - `isIncome` boolean alapján kondicionális logika minden receipt template-ben.
  - company/contact `otherId` is felcserélve a típus alapján.
- **Onboarding wizard Other ID mentés bugfix:**
  - `spendnote-welcome.html` (már meglévő wizard): a `receiptOtherId` mező értéke korábban nem mentődött el. Javítva: most `phone` mezőként kerül a profilba.
- **Cash box settings preview — live profil adat:**
  - `spendnote-cash-box-settings.html`: `DUMMY_PROFILE` helyett a valódi DB profil töltődik be a preview-ba.
  - `demoCompanyId` URL param most a `profile.phone` értékét kapja.
- **Account Settings regresszió fix (`setAvatarStorageUserId` undefined):**
  - `user-settings.js`: `setAvatarStorageUserId()` hívások eltávolítva (függvény nem létezett → `ReferenceError` → az egész init csendben összeomlott).
  - Eredmény: Full Name, Email, Display Name, Address, logo mind helyesen töltődik be.
- **Logo editor preview fix:**
  - Preview box mostantól mindig `scale(1)`-en mutatja a logót (nem overflowl ki a dobozból).
  - A zoom % kijelző továbbra is mutatja a valódi értéket.
  - A zoom/drag beállítások csak a receipten érvényesülnek.
- **Preview entitlement policy (implementálva):**
  - Új / fallback profile létrehozáskor `profiles.subscription_tier = preview`.
  - Preview felhasználók minden feature-höz hozzáférnek (`SpendNoteFeatures.preview` = full access).
  - Egyetlen enforce limit: max **200 aktív tranzakció** létrehozás (create-time check), utána csak read-only.
- **Commitok:** `f77f6e3`, `366642b`, `df45b99`, `9008084`, `6c03a40`, `4725ca4`, `e2d7229`, `068ff7a`, `c608ef6`, `0b97055`, `7a744dd`

## Where we are now (last updated: 2026-02-25 — összes magas prioritású audit feladat lezárva)

### 2026-02-25 frissítés — AUDIT-H1/H2/H4 implementáció (KÉSZ)

- **AUDIT-H1 — Email verification enforce:**
  - `auth-guard.js`: defense-in-depth `email_confirmed_at` ellenőrzés session szinten; ha null, sign-out + redirect `/spendnote-login.html?emailUnconfirmed=1`.
  - `spendnote-login.html`: `emailUnconfirmed=1` paramra automatikus resend UI megjelenítés + hibaüzenet.
- **AUDIT-H2 — Jelszó erősség policy:**
  - Közös `window.SpendNotePasswordPolicy` bevezetése `supabase-config.js`-ben (min 8 karakter, uppercase, lowercase, szám/speciális).
  - Policy alkalmazva: `spendnote-signup.html`, `spendnote-reset-password.html`, `assets/js/user-settings.js`.
  - Hint szöveg frissítve reset-password oldalon.
- **AUDIT-H4 — Audit log:**
  - Új migráció: `supabase-migrations/028_audit_log.sql`.
  - `audit_log` tábla: org-scoped, owner-only SELECT, append-only.
  - `spendnote_write_audit_log()` belső SECURITY DEFINER helper (nem hívható közvetlenül kliensből).
  - `spendnote_get_audit_log()` RPC owner-only olvasásra.
  - `spendnote_void_transaction` és `spendnote_delete_cash_box` RPC-k frissítve audit log írással.
  - `org_memberships` trigger: role change és member remove automatikus naplózás.
  - Frontend: `window.auditLog.getEntries(orgId)` API wrapper.
  - Dokumentáció frissítve: `database/schema.sql`, `database/README.md`, `database/SCHEMA-DOCUMENTATION.md`.

### 2026-02-25 frissítés — Dead code cleanup: M2/M3/M7 (KÉSZ)

- **M2/M3 — Tranzakció szerkesztés/törlés by design elvetve:**
  - `transactions.delete()` halott metódus eltávolítva `supabase-config.js`-ből.
  - Legacy cascade delete fallback eltávolítva `cashBoxes.delete()`-ből (kizárólag RPC marad).
- **M7 — Cash box archiválás elvetve:**
  - `is_active` oszlop eltávolítva: `database/schema.sql`, `database/SCHEMA-DOCUMENTATION.md`, `database/seed-data.sql`.
  - Új migráció: `supabase-migrations/029_drop_is_active_and_dead_code_cleanup.sql` — oszlop droppolva live DB-ből.
- Audit dokumentumok (`APP_AUDIT.md`, `APP_AUDIT_HU.md`) frissítve: M2/M3/M7 „by design / elvetve" státuszra.

### 2026-02-25 frissítés — Audit 2. kör security hardening (KÉSZ)

**Lezárt és pushra kész változtatások (mai kör):**

- Új migráció: `supabase-migrations/026_org_security_and_atomic_delete.sql`
  - org-aware RLS policy-k `cash_boxes` / `contacts` / `transactions` táblákra,
  - `spendnote_void_transaction` auth átállítás `org_memberships` owner/admin modellre,
  - új atomi RPC: `spendnote_delete_cash_box`.
- Frontend jogosultsági javítás:
  - `transaction-detail-ui.js`: void gomb role-check átállítva `orgMemberships.getMyRole()` logikára (Owner/Admin). *Későbbi finomítás (2026-04-06): szóló tulaj / nem–`user` org tag számára is engedélyezve a UI, tiltás csak meghívott `user` szerepnél — lásd „Where we are now”.*
- Frontend adatszűrés hardening:
  - `supabase-config.js`: org scope szűrés hozzáadva transactions és contacts lekérdezésekhez (`getAll`/`getPage`/`getStats`/`getById`).
- Contact CRUD konzisztencia:
  - contact create/getOrCreate `user_id` most a bejelentkezett felhasználóra áll.
- Kanonikus schema szinkron:
  - `database/schema.sql` frissítve org táblákkal, `org_id` oszlopokkal és org-aware policy-kkel.

### 2026-02-25 frissítés — Legacy FAQ cleanup (KÉSZ)

- `spendnote-faq-old.html` törölve a repóból.
- `_redirects` frissítve 301 átirányítással:
  - `/spendnote-faq-old` -> `/spendnote-faq.html`
  - `/spendnote-faq-old.html` -> `/spendnote-faq.html`

### 2026-02-25 frissítés — Legacy team/access DB cleanup (KÉSZ)

- Új migráció: `supabase-migrations/027_deprecate_legacy_team_tables.sql`
  - `cash_box_access` -> `cash_box_memberships` adatmigráció (idempotens `ON CONFLICT DO NOTHING`),
  - legacy táblák törlése: `cash_box_access`, `team_members`.
- `database/schema.sql` kanonikus séma tisztítva: legacy táblák/policy-k eltávolítva.
- Dokumentáció frissítve org-alapú modellre:
  - `database/README.md`
  - `database/SCHEMA-DOCUMENTATION.md`
- Kód cleanup:
  - `assets/js/supabase-config.js` legacy `cash_box_access` törlési fallback eltávolítva.
  - `supabase/functions/delete-account/index.ts` komment frissítve a kanonikus modellel.

### 2026-02-25 frissítés — Password reset + dropdown context + account deletion (KÉSZ)

**Lezárt és pusholt változtatások (mai kör):**

- **Password reset flow end-to-end javítva:**
  - `spendnote-forgot-password.html` valós Supabase reset küldés,
  - `spendnote-reset-password.html` új jelszó beállító oldal,
  - recovery callback átirányítás login oldalról reset-password oldalra,
  - Supabase template placeholder hiba azonosítva/javítva (`{{ .ConfirmationURL }}`), kattintható reset link helyreállítva.
- **Dropdown org-context megbízhatóság + vizuális finomhangolás:**
  - `updateUserNav()` early-return ágon is lefut az org/team context frissítés,
  - dropdown kontextus UI tömörítve: név hangsúlyos, meta sorban `Role · Team`.
- **Fióktörlés funkció implementálva (frontend + backend):**
  - új Supabase Edge Function: `supabase/functions/delete-account/index.ts`,
  - új frontend wrapper: `window.auth.deleteAccount()` (`assets/js/supabase-config.js`),
  - Settings oldalon működő törlési flow:
    - `DELETE` szöveg megerősítés,
    - 5 másodperces visszaszámlálás,
    - role-függő warning (Owner: teljes org törlés; Admin/User: saját fiók törlés),
    - sikeres törlés után local/session storage tisztítás + redirect.
- **Tranzakció szűrő edge-case javítás:**
  - `created_by_user_id = NULL` (törölt user) esetben a `created_by_user_name` fallback alapján is működik a Created By szűrés.
- **Deploy lezárás:**
  - `delete-account` Edge Function deployolva a Supabase projektre (`zrnnharudlgxuvewqryj`).

**Mai commitok:**

- `e6891da` — dropdown org-context refresh fix
- `e8393c6` — dropdown context UI compact redesign
- `3dfc68b` — account deletion feature set + deleted-user filter fix

### 2026-02-24 frissítés — Team Name + org context UI/DB hardening (RÉSZBEN KÉSZ)

**Lezárt és pusholt változtatások (mai kör):**

- Team Name kezelés átállítva DB-alapú org mezőre (`orgs.name`) az org context megjelenítéshez.
- Team oldalon Team Name szerkesztés bekerült owner/admin jogosultsággal.
- Login org választó és nav dropdown org-context rész human-readable Team Name megjelenítésre állítva.
- Dropdown UI finomítva: user név + role + `Team: <név>`.
- Cache-verziók szinkronizálva oldalak között (`main.js`, `app-layout.css`, `supabase-config.js`), hogy minden nézet azonosan töltse az új org-context logikát.
- Új migráció: `supabase-migrations/025_orgs_team_name_rls.sql`
  - org tagok SELECT `orgs` sorra,
  - owner/admin UPDATE jogosultság Team Name-re.

**Fontos státusz:**

- A team kezelés ezzel **még nincs lezárva**.
- Kifejezetten nyitott és kötelező következő scope:
  - Admin vs User regisztrációs folyamat (role-alapú onboarding/entry)
  - Role-based Settings oldalak teljesítése (admin/user külön kezelés)
  - Team management végleges lezárása csak ezek után

### 2026-02-24 frissítés — Landing mobil teljesítmény optimalizálás (KÉSZ első kör + KÉSZ második kör)

**Lezárt és pusholt változtatások (mai kör):**

- Landing `index.html` mobil LCP/CLS fókuszú hardening:
  - Google Fonts + Font Awesome async/deferred preload minta,
  - hero screenshot helyfoglalás stabilizálás (`aspect-ratio`) + explicit méret attribútumok,
  - első hero screenshot magas prioritású betöltés (`fetchpriority="high"`, preload),
  - tömörített reszponzív hero képvariánsok (`960w`/`1280w`) + `srcset`.

**Mért eredmény (mobil Lighthouse):**

- Performance: **55 -> 77**
- LCP: **~6.0s -> ~4.1s**
- CLS: **~0.329 -> ~0.067**

**Nyitott következő kör (opcionális további javuláshoz):**

- render-blocking további csökkentés,
- unused CSS/JS további vágása,
- kontraszt (a11y) hibák javítása pricing blokkokban.

### 2026-02-23 frissítés — org context safety + role downgrade guard (KÉSZ)

**Lezárt és pushra kész változtatások:**

- Pro multi-org org-context kezelés szigorítva:
  - `supabase-config.js`: bevezetve `SpendNoteOrgContext` (selected org tárolás user szinten),
  - `getMyOrgContext()` most a kiválasztott orgot használja,
  - Pro + 2+ org esetén org választás kötelező, ha nincs selected org.
- Login flow frissítve (`spendnote-login.html`):
  - belépés után kötelező org választás prompt, ha Pro multi-org és hiányzik selected org.
- Auth guard frissítve (`assets/js/auth-guard.js`):
  - ha org választás kell, app oldalról visszairányít loginra (`returnTo` megtartva).
- UX policy implementálva:
  - appon belüli org váltás nincs,
  - org váltás kizárólag `Log out -> Log in` útvonalon.
- Dashboard jelzés:
  - megjelenik az aktív org+role információs chip Pro multi-org kontextusban.
- Role safety migration:
  - új: `supabase-migrations/023_prevent_role_downgrade_on_invite_accept.sql`,
  - invite elfogadáskor same-org owner/admin role nem downgrade-elhető userre.

### 2026-02-23 frissítés — P0+ backend throttling (invite edge) (KÉSZ)

**Lezárt és pushra kész változtatások:**

- Új migráció: `supabase-migrations/022_edge_function_rate_limit.sql`
  - `edge_rate_limits` tábla,
  - `spendnote_consume_rate_limit(p_key, p_limit, p_window_seconds)` RPC.
- `send-invite-email` edge function frissítve:
  - per-caller limit (org + user),
  - per-target email limit,
  - limit túllépésnél `429` + `Retry-After` + részletes hiba payload.
- Kompatibilitási viselkedés:
  - ha a migráció még nincs deployolva, a function nem blockol (backward compatible fallback).

### 2026-02-23 frissítés — P0/3 abuse/WAF baseline (KÉSZ a jelenlegi Free plan kereten)

**Cloudflare audit eredmény (képernyőképes validáció):**

- WAF managed ruleset: **ON** (Always active).
- Security Events: **van blokkolási esemény** (managed rules -> Block), tehát edge védelem aktív.
- Challenge passage: **30 perc** konfigurálva.
- Bot Fight Mode: **ON** (JS Detections ON).
- Rate limiting rules: **1 aktív** (`RL-HighRisk-Paths`, Block) — Free plan rule limit miatt.

**Megjegyzés a korlátról:**

- Cloudflare Free plan rule limit elérve; további endpoint-specifikus rate limit csak szabálycsere vagy upgrade mellett adható hozzá.
- Jelenlegi minimum baseline cél teljesítve: bot védelem + aktív edge rate limit + aktív edge blokkolási események.

### 2026-02-23 frissítés — P0/1 backend hibaláthatóság első kör (KÉSZ)

**Lezárt és pusholt javítások (mai kör):**

- Közös backend hiba pipeline bevezetve (`assets/js/supabase-config.js`):
  - request reference kinyerés (`x-request-id` / `x-supabase-request-id` / `cf-ray`),
  - egységes fetch error parse,
  - egységes user message builder,
  - strukturált backend log + Sentry capture.
- Team invite kritikus útvonal javítva:
  - RPC (`spendnote_create_invite`) hibák részletesebb logolása kontextussal,
  - `send-invite-email` Edge hívás hibáinak egységes parse + log + felhasználói hibaüzenet (Ref azonosítóval).
- Receipt email kritikus útvonal javítva:
  - `transaction-detail-ui.js` `send-receipt-email` hívás átállítva az egységes backend error pipeline-ra.
- Cache-bust frissítés:
  - `spendnote-transaction-detail.html` `transaction-detail-ui.js?v=46`.
- P0/2 formalizálás:
  - release smoke checklist dokumentálva: `SMOKE_CHECKLIST.md`.
  - gyors manuális smoke futás rögzítve (`2026-02-23`): PASS (auth, IN/OUT tx, print/PDF/email receipt, invite).

### 2026-02-23 zárás — SEO/copy finomítás + indexelési follow-up (KÉSZ)

**Lezárt és pusholt javítások (mai kör):**

- **Billing copy ellentmondás feloldva** (`spendnote-faq.html`, `spendnote-pricing.html`):
  - különválasztva: lemondás vs visszatérítés logika,
  - upgrade: azonnali, proratált különbözet,
  - downgrade: következő megújuláskor lép életbe,
  - refund: 30 napos feltétel tisztázva, ezen kívül nincs prorata visszatérítés.
- **Billing FAQ layout regresszió javítva** (`spendnote-faq.html`):
  - hibás `faq-card` markup helyreállítva (trial kártya),
  - grid és lenyíló viselkedés visszaállt.
- **Landing copy frissítve** (`index.html`):
  - "Designed for speed: one form → PDF → done." -> "Űrlap, nyomtat, kész."
- **Cash handoff SEO hero copy puhítva** (`cash-handoff-receipt.html`):
  - "Clear accountability for every handoff." -> "Clear record for every handoff."
- **Search Console operatív lépés lezárva**:
  - módosított indexelhető oldalakra új indexelési kérés beküldve.

**Mostani fókusz (aktív):**

- P0 baseline hardening (Cloudflare minimum): kész a jelenlegi plan kereten.
- P0 baseline hardening (backend): invite throttling kész; további edge endpointokra ugyanennek a mintának az átvitele opcionális.
- Onboarding + registration wizard előkészítés (Pro org-step kötelező meghatározással).
- Team/org/invite modell és szerepkörös settings terv (DB-TEAM-1, L4/L5).

### 2026-02-22 zárás — SEO go-live stabilizáció (KÉSZ)

**Lezárt és pusholt javítások (mai kör):**

- **Indexelhető nyilvános készlet rögzítve 4 oldalra:**
  - `/`, `/faq`, `/petty-cash-receipt-generator`, `/cash-handoff-receipt`.
- **`petty-cash-receipt-generator.html` SEO finomítások:**
  - OG/Twitter képhivatkozás javítva élő assetre,
  - `SoftwareApplication` schema bővítve (image + operatingSystem),
  - `FAQPage` JSON-LD hozzáadva,
  - képeknél `loading="lazy"`,
  - belső link a `cash-handoff-receipt` oldalra.
- **`cash-handoff-receipt.html` SEO finomítások:**
  - print receipt kép beillesztve SEO alt/captionnel,
  - `Article` schema bővítve (`image`, `datePublished`, `dateModified`),
  - belső link a petty cash generator oldalra.
- **`index.html` + `spendnote-faq.html` meta/markup tisztítás:**
  - hibás OG/Twitter képutak javítva,
  - `index.html` Organization schema logo URL javítva élő URL-re.
- **Hitelességi ellenőrzés (KÉSZ):**
  - publikus SEO oldalakon nincs `aggregateRating`/`ratingValue` (nincs kamu értékelés).
- **Sitemap stratégia frissítve (KÉSZ):**
  - `sitemap.xml` leszűkítve a jelenleg indexelhető 4 oldalra,
  - friss sitemap URL: `https://spendnote.app/sitemap.xml`.
- **Search Console lépések (KÉSZ):**
  - mind a 4 indexelhető URL-re új indexelési kérés elküldve.

**Mostani fókusz:**

- 1 hétig nincs új SEO oldal publikálás.
- FAQ szövegjavítás után célzott újraindexelés.
- Fő fókusz visszakerül az app belső hibajavításaira/fejlesztésére.

### 2026-02-21 esti zárás — release polish (KÉSZ)

**Lezárt és pusholt javítások (mai kör):**

- **Standalone New Transaction duplicate prefill fix** (mobil oldal)
  - duplicate nyitáskor prefill már helyesen tölti: cash box, direction, amount, description,
    contact mezők, note, line item-ek.
- **New Transaction mobil elmozdulás fix**
  - footer pozícionálás stabilizálva (translateX középre igazítás helyett stabil left/right alapú igazítás).
- **User Settings desktop width regresszió fix**
  - tartalom szélessége újra konzisztens a nav/footer konténer szélességével.
- **Landing Features mobil kártya finomhangolás**
  - kisebb ikon footprint mobilon, jobb arányok.
- **Privacy oldal mobil overflow fixek**
  - táblázat/cella tördelés és szélesség hardening mobilon.
- **Privacy tartalmi javítások**
  - email címek egységesítve `legal@spendnote.app`-ra,
  - 11. pontból a „Contact form” sor törölve.
- **Footer konzisztencia javítások (globális)**
  - dupla © probléma megszüntetve,
  - footer link igazítás desktopon rendezve,
  - footer logó + tagline egységesítve oldalak között.
- **Cloudflare monitoring baseline (KÉSZ)**
  - Web Analytics ellenőrizve,
  - Health Check notification/alert flow beállítva emailre.
- **Sentry hibalog baseline (KÉSZ)**
  - Sentry Browser SDK bekötve globálisan (`assets/js/main.js`),
  - teszthiba beérkezése validálva az Issues nézetben.
- **Google/Search baseline (KÉSZ)**
  - Search Console property aktív,
  - sitemap (`/sitemap.xml`) sikeresen beküldve,
  - indexelés kérés elküldve `/` és `/faq` URL-ekre,
  - canonical clean URL-ekhez `_redirects` szabályok megerősítve (`/faq`, `/pricing`).
- **Landing image SEO jelölések (KÉSZ)**
  - részletesebb `alt` + `title` attribútumok,
  - `ImageObject` JSON-LD hozzáadva.
- **Preview limit enforcement (KÉSZ)**
  - tényleges create-time ellenőrzés bekötve: **200 aktív receipt** limiten a tranzakció mentése blokkol,
  - egységes hibaüzenet megjelenik a UI-ban: `Preview limit reached (200 receipts)...`,
  - cache-bust frissítve: `supabase-config.js` + `dashboard-form.js` betöltések (`dashboard.html`, `spendnote-new-transaction.html`).

**Állapot:**

- Dashboard + mobilnézet megjelenés: **kész**.
- Funkcionális core flow-k (felhasználói teszt alapján): **működnek**.
- Jelen állapotban a rendszer **élőbe rakható**.
- Monitoring + SEO minimum baseline: **bekonfigurálva**.
- Preview számláló limit (200 receipt) enforcement: **bekonfigurálva**.

**Következő fő scope (alapos kör, becslés: ~6-8 hét):**

- SEO oldalak + FAQ mély overhaul
  - intent-alapú tartalomfinomítás, strukturális javítások, internal linking, schema minőség.
- Onboarding flow újratervezés + implementáció
  - signup utáni vezetett lépések, role-based útvonalak, completion state.
- Regisztrációs varázsló (multi-step signup)
  - validációs UX, hibakezelés, progress és completion logika.
- Visszaigazoló/email flow teljes kör
  - trigger mátrix, sablonok, küldési logika, kézbesítés-ellenőrzés.
- Team management teljes újragondolás
  - szerepkörök, invite lifecycle, cash-box access modell, edge case-ek.
- Billing/subscription igazítás az új team + onboarding modellhez.

**Következő operatív lépés (rutin):**

- Heti 5 perces ellenőrzés:
  - Sentry új issue-k,
  - Search Console index státusz (`/`, `/faq`),
  - Cloudflare analytics/alert állapot,
  - rövid core smoke (login + new tx + receipt).

### 2026-02-21 frissítés — mobil reszponzivitás + onboarding irány

**Ma lezárt technikai javítások:**

- **Cash Box Detail mobil kártyanézet bekapcsolva** (`spendnote-cash-box-detail.html`)
  - `#txCardList` konténer hozzáadva a table wrapper mellé.
  - `@media (max-width: 480px)`: táblázat rejtve, kártyalista látható.
  - `@media (max-width: 768px)`: szűk nézetben fallback oszlopcsökkentés.
- **Duplicate gomb mobil route javítás** (`assets/js/main.js`)
  - Mobil/touch/coarse pointer környezetben duplicate már a standalone oldalra visz:
    - `spendnote-new-transaction.html?...#new-transaction`
  - Desktopon marad a dashboard/modal útvonal.
- **Cache-bust**
  - `main.js?v=23` frissítve:
    - `spendnote-cash-box-detail.html`
    - `spendnote-transaction-history.html`

**Mai termék/onboarding irány (dokumentált döntési javaslat):**

- Alapállapot marad: signup után automatikus default **USD cash box**.
- Megerősítve: új regisztrálóknál a default cash box létrehozás/megnyitás már működik.
- Új irány: első belépésnél **first-run setup modal** kérje be a receipten kötelezően megjelenő identitás mező(ke)t (pl. receipt display name).
- A **Settings** maradjon a kanonikus szerkesztési hely, de ne legyen kötelező első navigációs lépés a legelső receipt előtt.
- Team Management ismert hiány: userenként több cash box jogosultság kezelésének logikája jelenleg nem megfelelő; ezt **post-preview** javítjuk.

**Mai commit (kész):** `0a2319e`

### Preview sprint terv (7-8 nap, scope lock)

**Cél:** preview indulás minimál kockázattal, SEO/indexelés elindítása mellett.

1. **Nap 1-2:** landing + SEO oldalak mobil audit és javítás
   - Érintett oldalak: `index.html`, `spendnote-pricing.html`, `spendnote-faq.html`, `spendnote-terms.html`, `spendnote-privacy.html` + 2 SEO oldal
   - Breakpointok: 430 / 390 / 375 px
   - Fókusz: overflow, hero/CTA, footer/legal blokkok
2. **Nap 3:** vizuális konzisztencia és konverziós tisztítás marketing oldalakon
3. **Nap 4:** SEO release minimum
   - Csak landing + 2 SEO oldal legyen indexelhető
   - sitemap/robots ellenőrzés
   - GSC URL beküldés előkészítés
4. **Nap 5:** regresszió kör (marketing felületek)
5. **Nap 6:** preview deploy + utóellenőrzés
6. **Nap 7-8:** buffer (csak blocker hibák)

**Kifejezetten post-preview:**
- Team multi-cash-box jogosultság logika javítás
- Email templatek (L2/L3)
- Nem kritikus app-belső fejlesztések

### Preview sprint — Day 1 státusz (kész)

- Marketing oldalak mobil audit + kritikus javítások lezárva:
  - `index.html`, `spendnote-pricing.html`, `spendnote-faq.html`, `spendnote-terms.html`, `spendnote-privacy.html`
  - SEO oldalakból javítva: `cash-handoff-receipt.html`, `petty-cash-receipt-template.html`
- Közös mobil hardening (`assets/css/main.css`):
  - preview banner elemek és footer disclaimer (`<=480px`) overflow-biztosítása.
- FAQ:
  - `faq-grid` min-width csökkentés (`380/320` -> `300/280`), plusz `<=480px` spacing fixek.
- Pricing:
  - `<=480px` tipográfia/toggle/card spacing szűkítés.
- Terms/Privacy:
  - `<=768px` és `<=480px` paddings csökkentve, TOC link wrap javítva.
  - Privacy data table mobilon horizontálisan görgethető.
- SEO readiness baseline:
  - gyökér `robots.txt` létrehozva,
  - `sitemap.xml` ellenőrizve.

### Feltárt hiányosságlista (a reszponzivitás + email confirmation témán túl)

> Cél: stabil beta kiadás minimális scope-pal.

#### P0 — Beta előtt kötelező

- [ ] **Client error tracking** bekötése (Sentry vagy ekvivalens), hogy a production JS hibák visszakövethetők legyenek.
- [ ] **Edge Function hibamonitoring**: non-2xx hibák látható logolása + gyors hibakeresési útvonal.
- [x] **Formális smoke checklist** dokumentálva (`SMOKE_CHECKLIST.md`) és release-rutinra kijelölve.
- [ ] **Abuse protection minimum**: rate limit email/invite endpointokra.
- [ ] **Cloudflare baseline védelem**: minimális, biztonságos WAF/bot szabályok.
- [ ] **Beta enforcement**: preview/free limitek tényleges enforce-ja (ne csak UI szöveg).

#### P1 — Erősen ajánlott a beta stabilitáshoz

- [ ] **Desktop-only kommunikáció** landing + signup felületen (amíg mobil UX teljesen stabil).
- [ ] **Terms/Privacy beta nyelvezet** ellenőrzés/frissítés (preview státusz, korlátozások).
- [ ] **Safari/cross-browser auth regresszió kör** (normál + private mód) release előtt.
- [x] **SEO/indexing hygiene (baseline kész)**: `robots.txt` él, fake `aggregateRating` eltávolítva, indexelhető készlet 4 oldalra rögzítve (`/`, `/faq`, `/petty-cash-receipt-generator`, `/cash-handoff-receipt`).
- [ ] **GA4 baseline + Search Console** alapbeállítás és mérés ellenőrzés.

#### P2 — Beta után (de már látható hiány)

- [ ] **Role-based settings UI** teljesítése (Owner/Admin/User differenciált felület).
- [ ] **Cash box hozzáférés-kezelés UX** (assign/revoke) teljes körűen.
- [ ] **Stripe/billing stack** (checkout, portal, webhook, enforcement) — beta során de-scope-olható.

### Modal header alignment fix — COMPLETE (2026-02-19)

A create transaction modal fejlécében az IN/OUT gombok és a cash box selector 4px-el el voltak tolva egymáshoz képest.

**Root cause:** `.modal-header` `display: grid`-et használt két wrapper div-vel (`.modal-header-left`, `.modal-header-right`), amelyek eltérő vertikális centering kontextust hoztak létre.

**Fix:**
- `.modal-header`: `display: grid` → `display: flex; align-items: center; height: 72px; gap: 12px`
- Wrapper div-ek (`modal-header-left`, `modal-header-right`) eltávolítva a HTML-ből
- Minden elem (direction buttons, cashbox, watermark, close) közvetlen flex child
- `margin-right: auto` a `.modal-direction-primary`-ra a bal/jobb elválasztáshoz
- Watermark megmaradt és helyesen pozícionált

**Cleanup (104 sor törölve):**
- `!important` override blokk törölve a `dashboard.css` végéről
- Inline `<style>` blokk törölve a `dashboard.html` `<head>`-ből
- Inline `style` attribútumok törölve a modal header elemekről
- `.modal-header-left` / `.modal-header-right` CSS szabályok törölve

**JS safety net:** `dashboard-modal.js`-ben `requestAnimationFrame` + `translateY` korrekció megtartva (>0.5px eltérés esetén aktiválódik — jelenleg inaktív, CSS fix elegendő).

**Commitok:** `50dd264`, `2b9c085`, `e33a9b7`, `f053d9d`, `fd994ef`, `5fbae35`, `4026544`

---

### Mobile redesign — COMPLETE (2026-02-18 session 3)

Full "profi app" mobilnézet implementálva. Minden változtatás CSS+JS szinten, nem CSS-only hack.

**Változtatások:**

1. **Bottom navigation bar** (`nav-loader.js` + `app-layout.css`)
   - 5 elem: Home, Transactions, + FAB (zöld kör), Contacts, Cash Boxes
   - Frosted glass háttér, safe-area padding (notch-os telefonok)
   - Aktív tab: zöld ikon + kis dot indicator
   - FAB: kiemelkedő zöld kör, press animáció
   - Hamburger menu + top nav linkek rejtve mobilon — bottom nav veszi át
   - User avatar dropdown: fixed pozíció a bottom nav fölé igazítva
   - Minden oldalon egyszerre hat (nav-loader.js-ben injektálva)

2. **Dashboard tx kártya-lista** (`dashboard-data.js` + `dashboard.css`)
   - `renderRows()` most mindkét nézetet generálja: `<tr>` a táblázatba + `.tx-card` a `#txCardList`-be
   - Mobilon: táblázat rejtve (`display:none`), kártyalista látható (`display:flex`)
   - Kártya: ikon pill (IN/OUT/VOID), összeg jobbra, contact/description subline, dátum, chevron
   - CSS: `@media (max-width: 768px)` vált

3. **Modal bottom sheet** (`dashboard.css`)
   - `modal-container`: `border-radius: 20px 20px 0 0`, `max-height: 92dvh`, flex column
   - `modal-header`: sticky top, `z-index: 10`
   - `modal-body`: `overflow-y: auto`, `-webkit-overflow-scrolling: touch`
   - `modal-footer`: sticky bottom, `padding-bottom: env(safe-area-inset-bottom)`
   - Inputok: `font-size: 16px !important` (iOS zoom megelőzés), `min-height: 44px`

4. **Transaction History kártya-lista** (`transaction-history-data.js` + HTML)
   - `renderTableRows()` kiterjesztve: kártyák generálása `#txCardList`-be
   - `@media (max-width: 480px)`: táblázat rejtve, kártyalista látható
   - Régi column-hiding CSS hack-ek eltávolítva

5. **Contact lista kártya-lista** (`spendnote-contact-list.html`)
   - Avatar initials generálás (2 betű, zöld gradient kör)
   - `contactCardList` div a table-wrapper mellett
   - `@media (max-width: 480px)`: táblázat rejtve, kártyalista látható
   - Régi column-hiding CSS hack-ek eltávolítva

6. **Transaction Detail mobilnézet** (`transaction-detail.css`)
   - Összeg: `position: static`, `font-size: 36px`, középre igazítva (hero display)
   - Action gombok: `display: grid; grid-template-columns: 1fr 1fr` (2×2 rács)
   - Pro Options: `collapsible-content:not(.open) { display: none }` — mobilon alapból összecsukva
   - Inputok: `font-size: 16px !important`

7. **Shared tx-card CSS** (`app-layout.css`)
   - `.tx-card-list`, `.tx-card`, `.tx-card-pill`, `.tx-card-body` stb. áthelyezve `dashboard.css`-ből `app-layout.css`-be
   - Így tx-history és contact-list is örökli (mindkét oldal betölti az `app-layout.css`-t)
   - `app-layout.css` cache-bust: `v14` → `v15` minden oldalon

**Commitok:**
- `2ee902e` — bottom navigation bar
- `3b072d6` — dashboard card list + modal bottom sheet
- `b7818bb` — transaction history card list
- `ae03f59` — contact list card view + avatar initials
- `48c8310` — transaction detail 2×2 grid + hero amount
- `1651f59` — shared tx-card CSS refactor to app-layout.css
- `f2e6f11` — cache-bust app-layout.css v15

**Következő lépések (mobil):**
- Cash box list mobilnézet (alacsony prioritás)
- Tesztelés valódi eszközön (iOS Safari, Android Chrome)

---

- 2026-02-18 thread summary (cash box + receipt fixes):
  - Cash Box Settings logo persistence is now schema-compatible:
    - Save no longer hard-fails when `cash_box_logo_url` column is missing.
    - Local fallback logo storage per cash box: `spendnote.cashBox.{id}.logo.v1`.
    - Cash Box Settings logo load now resolves DB logo first, then local fallback.
    - Compatibility handling downgrades missing `cash_box_logo_url` to non-fatal capability fallback.
  - Production hotfix:
    - Fixed `ReferenceError: cashBoxId is not defined` in Cash Box Settings loader (`loadCashBoxData`).
  - Receipts date format normalized to US (`MM/DD/YYYY`):
    - Updated Print-2-copies/PDF/Email receipt templates date formatter.
    - Updated transaction-detail demo receipt date formatting.
    - Bumped receipt cache params / asset versions to force online refresh.
  - Cash Box Settings UI cleanup:
    - Removed "Quick preset: Logo, addresses, line items, total, signatures" block.
  - Commits in this thread:
    - `92e9e01`, `ae8c41d`, `fa68a3d`, `38bebed`

- Receipt logo stabilization (today):
  - `assets/js/logo-editor.js` stabilized for real-world usage:
    - immediate init support + robust upload flow
    - delayed profile sync no longer overwrites fresh user edits (`hasUserEdited`)
    - snapshot writes debounced to avoid rapid DB updates
    - same-file re-upload works (file input reset)
  - `assets/js/user-settings.js` updated so `LogoEditor.init()` runs immediately on `DOMContentLoaded` (independent from DB/profile loading).
  - `spendnote-user-settings.html` cache-bust query params updated for `logo-editor.js` and `user-settings.js`.
  - Receipt logo sizing by channel:
    - Print: unchanged (baseline)
    - PDF: reduced to `160x80` in `spendnote-pdf-receipt.html`
    - Email: increased to `240x120` in `spendnote-email-receipt.html`

- Marketing polish (evening session):
  - Footer redesigned with dark gradient background (matching early access banner style):
    - Gradient: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)`
    - Logo updated with green gradient fill + drop-shadow glow
    - Modern pill-style disclaimer with green accent
    - Link hover effects with animated underline
    - Footer description updated: "Complete cash visibility for your team. Instant receipts, full history."
  - Pricing page improvements:
    - Replaced internal app buttons (Upgrade/Downgrade/Current Plan) with marketing CTAs (Get Started/Start Free)
    - All pricing buttons now link to signup page
    - "2 receipt templates" → "Customizable receipt layouts" across all pricing displays
  - Pro plan feature refinements:
    - "Custom receipt wording" → "Customizable text & labels (localization)" (now first feature)
    - Feature order optimized: localization first, then user count, then unlimited features
  - User Settings page pricing features synchronized with landing/pricing pages
  - Commits: `df73941`, `751d531`, `8eee347`, `b84cad2`, `c7b2c9a`, `450e4ac`, `1596956`, `68a8f51`

- Marketing polish & SEO (late night session):
  - FAQ Page Redesign:
    - Modern, card-based grid layout with central search and category tabs
    - Lightened background gradients (slate/teal) for better readability
    - Content refined based on user feedback & SEO best practices
    - Added critical trust/billing questions (downgrade, refund, support)
    - Implemented `FAQPage` JSON-LD structured data for Google Snippets
  - UX Improvements:
    - Auto-create default USD Cash Box for new users (via Supabase trigger)
    - Updated `handle_new_user` migration
  - SEO Optimization:
    - `index.html`: Meta tags, Open Graph, Canonical, `SoftwareApplication` schema
    - `spendnote-pricing.html`: H1 fix, `Product` schema with pricing offers
    - `sitemap.xml` generated for public pages
  - SEO landing pages created (6 intents): template, generator, handoff, receipt book, small business, carbonless
    - Copy/layouts done; only final refinements remain
  - Commits: `93e0c0f`, `517dcff`, `54c2780`, `f28a501`, `01b41fa`

- Invites/Team hotfixes (PM):
  - Fixed DB check constraint so invite acceptance can set status to `active` (`invites_status_check`).
  - RLS policies added on `profiles` so org members can read each other's minimal profile (name/email).
  - Frontend hardened: `teamMembers.getAll()` fetches `profiles` separately and falls back to accepted invite email if profile missing; signup → login link preserves `inviteToken`.
  - Auto-accept-by-email fallback implemented (runs when no token or token-RPC fails).
  - Resend domain verified for spendnote.app; Edge Function updated with `reply_to` and personalized subject (deploy pending).
  - Go-live smoke: invite accept → inviter sees Active / no Pending — PASSED.
  - Migration 015 applied + verified in SQL Editor (`spendnote_accept_invite_v2`, `spendnote_auto_accept_my_invites` present; orphan membership check returned 0 rows).
  - README updated with 2026-02-13 PM hotfixes summary.
  - SEO safety lock for preview prep: `noindex` enabled across pages (including landing) until landing polish is finished.
  - Timeline update:
    - Beta/preview ships in the next few days.
    - Launch target is ~6 weeks: pricing + company setup + Stripe, mobile view, and final polish.
  - Indexing plan during beta:
    - Only the landing page + 2 SEO pages should be indexable.
    - Keep all internal/app pages `noindex`.
  - Onboarding decision:
    - After signup/first valid session, auto-create a default USD Cash Box (starting balance: 0).
    - Goal: first receipt can be created in ~30 seconds with a ready-to-use USD cash box.
  - Tomorrow plan: landing polish + preview disclaimer UX + GA4 baseline + Google Search Console setup.
- Responsive implementation (2026-02-18 session):
  - Hamburger menu: nav-loader.js + main.css + app-layout.css (375/768px)
  - Transaction History: column hiding at 768px (Contact ID, Created By) and 480px (+ Cash Box, Contact)
  - Dashboard: table column hiding, modal bottom-sheet on mobile
  - Contact List: column hiding at 768px and 480px
  - Cash Box List/Settings: mobile layout fixes
  - Landing: hero stack, browser mockup, features/pricing/footer mobile
  - All existing responsive CSS verified and extended
  - Breakpoints: 375px / 768px / 1280px
- Transaction Detail console error storm fix (2026-02-18 session):
  - Root cause: invite acceptance flow in `supabase-config.js` kept calling invite RPCs on normal app pages when stale invite token state was present.
  - Reduced error noise: invite logs gated behind `window.SpendNoteDebug`.
  - Safety guard: invite accept flow now skips all RPC calls when no explicit invite token exists.
  - Retry storm prevention: stale invite token is cleared after dual invite RPC failure.
  - Profile fetch stabilization: `db.profiles.getCurrent()` validates user id and handles missing rows quietly.
  - Cache-bust: transaction detail now loads `supabase-config.js` with updated query version to ensure fix rollout.
- Landing carousel polish (2026-02-18 session):
  - Real screenshots added: dashboard, transaction history, receipt
  - Browser mockup frame (macOS traffic lights + URL bar that updates per slide)
  - Slide-in entrance animations: hero text from left, mockup from right
  - 7s autoplay, fade transition, caption + dots in footer bar
  - Black border cropped from screenshot images (PowerShell)
- ✅ Auto-create default Cash Box on signup: migration verified and working
- ✅ fake `aggregateRating` eltávolítva a publikus SEO oldalakról.
- ✅ `robots.txt` hozzáadva a repo rootba.
- ✅ Contact emails live and working:
  - `feedback@spendnote.app` → preview banner
  - `support@spendnote.app` → FAQ page
  - `legal@spendnote.app` → Terms of Service
  - All `mailto:` links verified working
- TODO: desktop-only notice on landing preview banner + signup page.
- ✅ Beta acceptance checkbox on signup page: done
 
 - GitHub repo is now: `https://github.com/sildys/spendnote` ✅
 - Local git `origin` points to the new repo ✅
 - GitHub Actions: green ✅
 - Vercel:
   - Project renamed to `spendnote` ✅
 - Cloudflare Pages config committed:
   - `_redirects` (clean URLs like `/login`, `/signup`) 
   - `_headers` (immutable caching for `/assets/*`, but **no-cache** for critical auth/nav scripts)
     - `assets/js/nav-loader.js`
     - `assets/js/auth-guard.js`
     - `assets/js/supabase-config.js`
 - Cloudflare Pages prod fixes committed:
   - Fixed `ERR_TOO_MANY_REDIRECTS` on clean routes like `/dashboard` (Clean URLs + `_redirects` interaction)
   - Enforced canonical host: `www.spendnote.app` → `spendnote.app`
   - Logout now returns to landing (`index.html`) and is auth-guard compatible

## If you close the IDE now (folder rename resume)

 - Folder rename target (cosmetic):
   - from: `c:\SpendNote projekt\spendnote-demo`
   - to: `c:\SpendNote projekt\spendnote-git`
 - After rename: open the project from `c:\SpendNote projekt\spendnote-git`.
 - Sanity checks to run (optional):
   - `git status`
   - `git remote -v`
 - Migration decisions (final domain):
   - Canonical host: `https://spendnote.app` (apex)
   - Redirect: `https://www.spendnote.app` → apex
   - Keep Vercel as fallback for **24–48h** after go-live
 - Simplified cutover plan file (local): `C:\Users\sild\.windsurf\plans\spendnote-cloudflare-cutover-577247.md`
 - Next milestone after folder rename: **Cloudflare Pages Phase 1** (deploy to `*.pages.dev`, smoke test `/`, `/login`, `/signup`).

## Immediate next steps (Cloudflare Pages + spendnote.app)

1) **Local folder rename (optional but recommended)**
   - Rename folder on disk:
     - from: `c:\SpendNote projekt\spendnote-demo`
     - to: `c:\SpendNote projekt\spendnote-git`
   - Close IDE before rename (prevents file locks), then re-open the new folder.
   - Quick sanity checks in terminal:
     - `git status`
     - `git remote -v`

2) **Create Cloudflare Pages project (from GitHub)**
   - Cloudflare Dashboard → **Pages** → **Create a project** → **Connect to Git**
   - Select repo: `sildys/spendnote`
   - Build settings (static):
     - Framework preset: **None**
     - Build command: *(empty / none)*
     - Output directory: `/`
     - Production branch: `main`
   - Deploy and open the generated `*.pages.dev` URL.
   - Smoke: `/<login|signup|dashboard>` should load (via `_redirects`).

3) **Attach the real domain**
   - Cloudflare Pages → project → **Custom domains** → add: `spendnote.app`
   - Decide canonical host:
     - Option A: `spendnote.app` (recommended)
     - Option B: `www.spendnote.app`
   - Ensure SSL is active.

4) **Supabase Auth URL config update for the new domain**
   - Supabase → Auth → URL Configuration
     - Site URL: `https://spendnote.app`
     - Additional Redirect URLs: include `https://spendnote.app` and the `*.pages.dev` URL during rollout
   - Smoke test on `spendnote.app`: login/signup + invite accept.

5) **Keep Vercel as fallback briefly, then remove it**
   - Keep Vercel alive for 1–2 days after cutover.
   - After Cloudflare is stable: archive/disable Vercel project and set any legacy subdomain redirects if needed.

## Weekly cadence (time budget)

- **Mon–Thu:** evenings only (2–3 hours when possible; not every day)
- **Fri–Sun:** long-form sprint blocks (as much as sustainable)

## Next 2 weeks: Beta ship (priority)

- **Goal:** Public landing + public signup + usable app in **beta/test mode** on Cloudflare.

- **Open questions (decisions)**
  - **Q1:** Include **Google OAuth signup/login** in the beta scope? (Yes/No)

- **Beta Definition of Done (ship criteria)**
  - [x] Cloudflare Pages deploy from `main` is green
  - [x] Custom domain is live with SSL, canonical host decided and working
  - [x] Supabase Auth URL Configuration updated for the final domain (Site URL + Redirect URLs)
  - [x] Landing is public + indexable, and links to Terms + Privacy
  - [x] Signup/login works on production domain (email-confirm flow included)
  - [x] Beta disclaimer is visible and is **explicitly accepted** during signup
  - [ ] Beta is clearly communicated as **desktop-only** on landing + signup ← missing
  - [ ] Free beta mode active (unlimited during beta; 1 user + 1 cash box) ← preview banner mentions 100 tx, but no enforcement yet
  - [ ] Minimal client error logging is live (JS errors captured for signed-in users) ← not done
  - [ ] Smoke test passes on production domain: auth, create transaction, receipt ← not formally done

- **Week 1 (ship infrastructure + surfaces)**
  - [x] Cloudflare Pages: connect GitHub repo, production deploy on `main`
  - [x] Custom domain: `spendnote.app` (canonical host decision + DNS/SSL)
  - [x] Supabase Auth URL configuration: Site URL + Additional Redirect URLs
  - Landing SEO baseline:
    - [x] `robots.txt`
    - [x] `sitemap.xml` ← generated
    - [x] Canonical + OG/Twitter meta ← done on index.html, pricing, faq
  - [x] Landing CTA: **Start free beta** → signup ← "Start Free - No Card Required" button present
  - [x] Legal pages wired everywhere: Terms + Privacy linked from footer

- **Week 2 (beta safety + free beta mode)**
  - [x] Beta disclaimer acceptance checkbox on signup (link to Terms/Privacy)
  - [ ] Desktop-only notice on landing + signup ← not done
  - [ ] Terms/Privacy updated to reflect beta/test period ← not verified
  - [ ] Beta entitlements enforced (preview: 100 tx; free: 20 tx) ← banner text exists, no enforcement
  - [ ] Smoke test checklist on `spendnote.app` (auth + create transaction + receipt)

- **Deferred until after beta ship:** team management / invites / role management / responsive & mobile view (M1)

## Current state (last updated: 2026-02-11)
- **Dashboard** ✅
  - Transaction modal fully wired to Supabase:
    - **Transaction create** via `db.transactions.create()` with full payload
    - **Robust error handling** (INSUFFICIENT_BALANCE, RLS, profile missing, session expired)
    - **Balance validation** (UI-side check prevents negative balance on expense)
    - **Contact linking** (uses selected contact UUID when available; otherwise lightweight lookup)
    - **Save to Contacts** (creates new contact if checkbox enabled)
    - **Verification** (debug-only: checks transaction exists after insert)
    - **Dashboard reload** after successful save
    - **Receipt flow** ("Done & Print" opens receipt in selected format)
  - Cash box cards display **`SN-###`** from `cash_boxes.sequence_number` (not derived index).
  - Hash deep-link open supports `cashBoxId=SN-###` and resolves to UUID.

  - Latest Transactions table (dashboard):
    - Uses unified table-style rendering (consistent with other transaction tables).
    - Shows newest 5 only (no pagination).
    - VOID indicator is consistent (pill + struck-through amount).
    - Hover tooltips for long text (Description / Cash Box / Contact).
    - Row open UX requires 2 clicks to open detail (armed-row state).
    - Avoids embedded joins for transactions page fetch to prevent PostgREST schema-cache relationship errors.
- **Contacts**
  - Contacts list + detail are wired to Supabase.
  - UI shows **Contact ID as `CONT-###`** using `sequence_number`.
  - Contacts list **View column + bottom pagination** aligned with Transaction History UI.
  - Contacts list row open UX requires **2 clicks** (armed row) to open Contact Detail (matches transaction tables).
  - Contacts List performance: uses Supabase RPC **`spendnote_contacts_stats()`** to populate:
    - `#` (active tx count)
    - `Boxes` dot list
    - `Last Tx` (ID + date)
  - Verification: Contacts List stores stats source (`rpc` vs `scan`) in `window.__spendnoteContactsStatsSource` (logs only with `SpendNoteDebug`).
  - Contact "Other ID" is stored in `contacts.phone` and is snapshot-stored onto transactions as `contact_custom_field_1` for receipts.
- **Transaction History** ✅
  - Loads from Supabase (server-side pagination + filters).
  - Does **not** auto-filter by the previously selected Cash Box (dashboard active cash box).
  - Hides system/reversal transactions (`is_system=true`) and treats legacy `is_system=NULL` as non-system.
  - Currency filter values are normalized (uppercase) and apply correctly.
  - Stats cards reflect the active filters:
    - `Total Transactions`: filtered result count
    - `Cash Boxes`: cash boxes in the filtered result
  - Monetary totals:
    - `Total IN / Total OUT / Net Balance` compute when the filtered result resolves to a single currency
    - otherwise they show `—`
  - Voided transactions:
    - show a distinct **VOID** badge
    - amount is dimmed + struck-through
    - reversal/writeback is not visible as a separate transaction
  - Contact ID column is intentionally minimal: **shows `—`** when there is no saved contact sequence.
  - Filter mapping:
    - Contact filter accepts `CONT-###` and maps to UUID internally
    - Cash Box filter accepts `SN-###` and maps to UUID internally
    - Transaction query normalizes `SNx-y` to `SNx-yyy`
  - No UUIDs shown in Cash Box / Contact suggestions.

  - Row open UX requires 2 clicks to open detail (armed-row state).
- **Transaction Detail + Receipt Preview** ✅
  - Receipt preview iframe now loads real Supabase data (transaction + cash box + profile).
  - All receipt-related UI controls (toggles, Pro text fields) are initialized from `cash_boxes.receipt_*` settings.
  - Logo preview supports `logoUrl` (from Supabase) or `logoKey` (localStorage override).
  - Quick receipt behavior:
    - Receipt IDs are shown by default in Quick mode.
    - `itemsMode=single|full` controls quick vs detailed line item rendering.
    - In `itemsMode=single`, exactly one row is filled and its amount equals the Total (grid still shows 5 rows).
    - `recordedBy=0` hides the recorded-by line.
  - Receipt templates (Print-2-copies/PDF/Email) fully populate from transaction data:
    - Company name/address from profile
    - Contact name/address from transaction snapshot fields
    - Line items table + total from `tx.line_items` / `tx.amount`
    - Notes (hidden if empty)
    - **Cash Box ID: `SN-###`** (from `cash_boxes.sequence_number`)
    - **Receipt ID: `SN{cash_box_sequence}-{tx_sequence_in_box}`**
    - **Other ID: from `contact_custom_field_1`** (not cash box code)
  - **Print (2 copies) receipt**: date displays correctly, "Recorded by" line removed.
  - Void feedback:
    - amount is dimmed + struck-through
    - shows **Voided by + date**
    - receipt previews include a diagonal grey **VOID** watermark (Print-2-copies/PDF/Email)
  - Pro badge styling unified across the app (consistent orange badge with crown icon).
  - URL hardening: invalid/missing `txId` redirects to Transaction History.
  - Duplicate button works even when opened via `SNx-yyy` (uses loaded transaction UUID).

- **Receipt print flow (new tab)** ✅
  - Print/receipt templates can open in a new tab/window (`bootstrap=1`).
  - Auth/session persistence uses `sessionStorage`, so new tabs may start without a session.
  - **FIXED (2026-02-07)**: Root cause of login flicker/redirect:
    - Receipt templates defined a global `isUuid` which collided with `supabase-config.js` and caused a `SyntaxError`.
    - Result: `supabaseClient` was never created, `auth-guard` redirected to login, which bounced back to Dashboard (flicker).
    - Fix: rename template helper `isUuid` -> `isUuidParam` (Print-2-copies/PDF/Email).
  - Follow-up hardening:
    - Exposed `window.writeBootstrapSession()` for on-demand fresh token writing
    - Dashboard modal calls `writeBootstrapSession()` BEFORE opening receipt window
    - Transaction Detail Print/PDF buttons call `writeBootstrapSession()` before opening
    - Receipt iframe preview also writes fresh bootstrap before loading
    - `auth-guard.js` properly waits for session establishment after `setSession()`
    - Increased timeout + exponential backoff for bootstrap waiting (8s total)
    - iframes with `bootstrap=1` now attempt session restoration
    - Receipt templates verify auth session is established (not just `window.db` available)
- **Receipt Export (PDF/Print)** ✅
  - **PDF download**: Letter size (8.5" x 11"), white background, receipt at top with 10mm margins.
  - **PDF download flow**: hidden iframe triggers download without visible preview or popup.
  - **PDF file name**: `SpendNote_<ReceiptID>.pdf`.
  - **Print (2 copies)**: opens normal window with auto-print; no more tiny offscreen popup.
  - **Line items**: no 4-item limit; all items display on both Print-2-copies and PDF receipts.
  - **Cache-busting**: receipt URLs use versioned `v` param to force reload after updates.

- **Email Receipts (server-sent)** ✅
  - **Send from Transaction Detail only**.
  - Supabase **Edge Function** `send-receipt-email` + Resend (`RESEND_API_KEY` secret).
  - Email uses an **email-client compatible** layout.
  - Email includes a **public PDF link** (recipient does not need an account).
  - Email address autocomplete deferred until roles + final contacts model.

- **Bulk Actions & Export (Transaction History & Cash Box Detail)** ✅
  - **Bulk Void**: void multiple selected transactions at once
  - **Bulk Export CSV**: export selected rows with user-facing IDs only
  - **Bulk Export PDF**: export selected rows with professional overlay
  - **Filtered Export CSV**: export all filtered transactions (pagination, max 500)
  - **Filtered Export PDF**: export all filtered transactions with:
    - SpendNote-branded header with receipt logo (green gradient)
    - All active filters displayed in grid layout
    - Transaction table with zebra striping
    - Net balance summary per currency (IN/OUT/Net)
    - Generated timestamp and branding footer
    - Print-friendly (no popup blockers)
  - CSV exports use **only user-facing IDs** (no database UUIDs):
    - Transaction ID: `SN{cash_box_seq}-{tx_seq}` format
    - Cash Box ID: `SN-{seq}` format or name
    - Contact ID: `CONT-{seq}` format
  - PDF overlay uses brand colors only (green for IN, gray for OUT, black text)

- **Canonical URL params (app-wide)** ✅
  - Cash Box: `cashBoxId`
  - Contact: `contactId`
  - Transaction: `txId`
  - Legacy `id=` fallbacks removed.

- **UUID validation centralization** ✅
  - UUID validation is centralized via `window.SpendNoteIds.isUuid` (removed scattered regex fallbacks).

- **Cache-busting / immutable deploy hardening** ✅
  - Critical JS/CSS assets were version-bumped across pages to avoid stale cached builds.

- **Modal UX** ✅
  - Reduced first modal-open layout shift/flicker via scrollbar compensation.
- **Cash Box pages**
  - Cash Box Detail: accepts `id`/`cashBoxId` as UUID or `SN-###` and resolves to UUID; displays `SN-###` code.
  - Cash Box Settings: accepts `id`/`cashBoxId` as UUID or `SN-###` and resolves to UUID; displays `SN-###` in subtitle.
  - Cash Box Settings: receipt preview uses demo data (Print-2-copies/PDF/Email) and respects quick/detailed + toggles.
  - Cash Box Settings: receipt preview layout/height + zoom behavior matches Transaction Detail.
  - Cash Box Settings: removed inline `onclick` handlers (bindings live in JS).
  - Cash Box Settings: Danger Zone hard delete implemented (shows transaction count, requires typing `DELETE`, deletes cash box + cascaded transactions).
  - Cash Box List: delete modal subtitle ready for dynamic data.
  - Cash Box List: shows per-cash-box transaction count (active, non-system).

- **Navigation** ✅
  - Active page menu item is underlined.
  - Active page detection works for pretty URLs (e.g. `/dashboard` as well as `dashboard.html`).

- **User Settings (Profile) / Avatar** ✅
  - Profile section redesigned.
  - Avatar upload + remove works.
  - Monogram avatar uses **outline style** (neutral fill, colored ring + colored letters).
  - Monogram palette updated to a **softer** selection (less saturated).
  - Avatar personalization persistence (client-side):
    - `spendnote.user.avatar.v1`
    - `spendnote.user.avatarColor.v1`
    - `spendnote.user.fullName.v1`
  - Nav avatar refresh is robust across pages (waits for auth/nav load).
  - Removed colored ring/border around avatars (neutral border only).

- **Tables (Created by avatar)** ✅
  - Dashboard + Transaction History tables use saved avatar image/color (no hardcoded green SVG).
  - Dashboard falls back to the current user's saved full name when `created_by_user_name` is missing.

- **Duplicate transaction** ✅
  - Duplicate always uses the **current date** (today), not the original transaction date.
  - Duplicate clears receipt/transaction identifier so a **new** one is generated.

- **ID stabilization (display IDs)** ✅
  - Cash Boxes: accept `SN-###` for deep links/filters; resolve to UUID internally.
  - Contacts: accept `CONT-###` for deep links/filters; resolve to UUID internally.
  - Transactions: Transaction Detail accepts `SNx-yyy` and resolves to UUID.
  - Legacy `CB-###` prefix support removed.

- **Permissions / org model (Supabase)** ✅
  - Tables: `orgs`, `org_memberships`, `cash_box_memberships`, `invites`, `audit_log`.
  - Roles: `owner` / `admin` / `user`.
  - Cash box access is enforced via `cash_box_memberships` (admins default to all cash boxes via auto-memberships).
  - Contacts are org-scoped (shared across cash boxes).
  - Invite flow:
    - Create invite via RPC `spendnote_create_invite`.
    - Accept invite via RPC `spendnote_accept_invite`.
    - Frontend accepts `inviteToken` on login/signup and calls accept RPC.
    - User Settings shows pending invites + provides an invite link to copy.

## 2026-02-11 thread summary (canonical)

### Auth (launch readiness) — IN PROGRESS
- Frontend changes (pushed to GitHub):
  - `auth.signUp(email, password, fullName, { emailRedirectTo })` implemented.
  - Signup shows **"check your email"** state when Supabase returns no session.
  - Login handles unconfirmed email errors and offers **Resend confirmation email**.
  - New helper: `auth.resendSignupConfirmation(email, { emailRedirectTo })`.
  - Google OAuth redirects preserve `inviteToken`.
- Supabase manual action: **Confirm sign up / email confirmation enabled** in Dashboard.
- Remaining manual actions:
  - Supabase **URL Configuration**: set Site URL + Additional Redirect URLs for:
    - `/spendnote-login.html`
    - `/spendnote-signup.html`
    - `/dashboard.html`
    - `/spendnote-user-settings.html`

### DEC-TRIAL — COMPLETED (decision)
- Trial ends at **14 days OR 20 transactions** (whichever comes first).
- After limit: **view-only**, **no export**.
- Team invites: **Pro only** (no invites on Free/Standard).

### Team/invites — PARTIAL
- Pending invite UI revoke now hard-deletes invites via RPC (RLS-safe):
  - New `SECURITY DEFINER` function: `public.spendnote_delete_invite(p_invite_id uuid)`
  - Frontend uses the RPC and falls back to direct delete.
  - Status: verified working in UI.

- Invite acceptance v2 (default cash box memberships) was implemented:
  - Migration file: `supabase-migrations/008_accept_invite_v2_default_cashbox_memberships.sql`
  - RPC: `public.spendnote_accept_invite_v2(p_token text)`
    - creates/updates `org_memberships`
    - updates invite status to `active`
    - assigns default `cash_box_memberships`:
      - admin -> all org cash boxes
      - user -> first org cash box
  - Frontend calls v2 with fallback to v1.
  - `inviteToken` is persisted to localStorage and auto-accepted on first valid session.
  - Current issue: invite may still remain `pending`.
    - Likely cause: function deployed without `SET row_security = off` (RLS blocks the update/insert).
    - Recommended fix: redeploy `spendnote_accept_invite_v2` with `SET row_security = off` and re-test.

### Cache-busting
- Multiple pages had `supabase-config.js?v=` bumped to ensure the latest auth/invite logic loads after deploy.

- **Frontend data layer migration** ✅
  - `assets/js/supabase-config.js` updated to rely on RLS (removed client-side `user_id` filtering).
  - `teamMembers` wrapper now reads `org_memberships` + `invites`.
  - `cashBoxAccess` wrapper now reads/writes `cash_box_memberships`.
  - Cache-busting bumped across app pages.

- **RLS recursion hotfix (critical)** ✅
  - Resolved `infinite recursion detected in policy` errors for:
    - `cash_box_memberships`
    - `org_memberships`
  - Fix approach:
    - Drop recursive policies.
    - Recreate policies using `SECURITY DEFINER` helper functions with `row_security = off` to avoid policy loops.

- **Invite email delivery (Edge Function)** ✅
  - Edge Function: `send-invite-email` — fully working, deployed via GitHub Actions.
  - Workflow: `.github/workflows/deploy-supabase-functions.yml`
  - Deployed with `--no-verify-jwt` (function handles auth internally via `auth.getUser()`).
  - Uses Resend API for delivery; FROM address: `invite@spendnote.app` (domain verified in Resend).
  - Invite token security: DB stores only `token_hash` (SHA-256); Edge Function hashes incoming plaintext token before lookup.
  - Client calls Edge Function via manual `fetch` (not `functions.invoke`) to surface concrete error messages from Resend/Edge Function.
  - On email failure, falls back to showing the invite link for manual copy.
  - Required GitHub Secrets:
    - `SUPABASE_ACCESS_TOKEN`
    - `SUPABASE_PROJECT_REF`
  - Required Supabase Edge Functions Secrets:
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `RESEND_API_KEY`
    - `SPENDNOTE_EMAIL_FROM` (e.g. `invite@spendnote.app`)
    - `SPENDNOTE_APP_URL`
    - `SPENDNOTE_INVITE_SUBJECT`

- **Supabase pgcrypto wrappers for invite tokens** ✅
  - Some Supabase projects have `pgcrypto` installed under schema `extensions`, which breaks unqualified calls like `gen_random_bytes(...)` / `digest(text, ...)`.
  - Fixed by enabling `pgcrypto` and adding `public.gen_random_bytes(int)` + `public.digest(text,text)` wrappers.

- **Invite token uniqueness / collision fix** ✅
  - Symptom: `duplicate key value violates unique constraint "invites_org_token_unique"`.
  - Fix: `spendnote_create_invite` RPC rewritten:
    - Generates random token via `gen_random_bytes(24)`, stores `token_hash` (SHA-256 hex), returns plaintext token in `jsonb` response.
    - If pending invite exists for same `org_id + invited_email`, regenerates token and updates existing row.
    - Retries up to 5× on token hash collision.
  - `invites` table columns: `id`, `org_id`, `invited_email`, `role`, `token_hash`, `status`, `created_by`, `accepted_by`, `created_at`, `expires_at`.

## Key decisions / invariants
- **“Unsaved contact” indicator**: keep it minimal in Transaction History.
  - If there is no saved contact/sequence, show **`—`** (no extra `CONT-*` placeholder marker).
- **Profiles vs auth.users**: app tables use `public.profiles(id)` as the user FK (not `auth.users`).

## Useful reference notes
- Detailed recovered notes from the frozen thread:
  - `SESSION-NOTES-2026-01-30.md`

## Recent commits (high level)
- `e00a7ec` Fix print receipt: remove 4-item limit in transaction loading section
- `261a67d` Remove 4-item limit on print 2-copies receipt - show all line items
- `7338406` Change PDF format from Legal to Letter
- `3ebee71` Fix PDF: place receipt at top of page, not centered vertically
- `cdf64b3` Add white background to PDF page and center receipt with margins
- `dd2bf35` Fix PDF export: remove download-mode during capture so receipt is visible
- `55effe9` Fix hidden iframe viewport for PDF download; bump receipt cache params
- `f964a6e` Cash Box Settings: init function on load
- `c3eca8c` Dashboard: use SN-### cash box display code
- `6247202` Print receipt: show date only; remove recorded-by; unify cash box code to SN-###
- `3d23334` Receipts: remove demo placeholders and fix cash box/other id mapping
- `f53ec9c` Transaction Detail: bind receipt controls and previews to Supabase data
- `4ce4d87` Unified Pro badge styling across the app
- `ede2407` Duplicate: always use current date and generate new receipt
- `5fc9f00` Monogram avatars: outline ring + colored initials
- `4487807` Dashboard: created-by avatar fallback uses current user name

## Completed (previously "Next focus")
- ~~**B)** Stabilize core IDs everywhere~~ ✅ (done: canonical URL params, SN-###/CONT-###/SNx-yyy resolution, UUID validation centralized)
- ~~**C)** Contacts list: replace remaining placeholder columns~~ ✅ (done: `spendnote_contacts_stats()` RPC populates #, Boxes, Last Tx)
- ~~**D)** Replace all native `alert()`/`confirm()`/`prompt()` with custom branded modals~~ ✅
  - Created `assets/js/modal-dialogs.js`: Promise-based `showAlert`, `showConfirm`, `showPrompt`
  - Added branded dialog CSS to `assets/css/main.css` (section 13)
  - Replaced ~90+ native dialog calls across 10 JS files + 7 HTML files
  - `modal-dialogs.js` included in all 11 app HTML pages
  - Consistent icon types: info, success, warning, error, danger
  - Destructive confirms use red danger styling; prompts for email, void reason, delete confirmation

## Paywall / Subscription rendszer — Állapot (2026-04-06, előző összefoglaló: 2026-03-29)

### KÉSZ (gated + működik):
- ✅ **Feature flag rendszer** (`_FLAGS` in `supabase-config.js`) — 4 tier: preview, free, standard, pro; **`can_customize_id_prefix`** (Pro + preview), Standard/Free → SN + upgrade modal
- ✅ **Új kassza currency** — `<select>` ISO listával (nem datalist); szerkesztés: currency továbbra zárolt
- ✅ **Tier detection** DB-ből (`profiles.subscription_tier`)
- ✅ **Cash box limit** — free=1, standard=2, pro=∞ (create-nél ellenőrizve, tier-aware modal)
- ✅ **Transaction limit** — free=20 tx, preview=200, standard/pro=∞ — kliens + szerver guard (migration 039)
- ✅ **CSV export gating** — free blocked, dedicated upgrade modal
- ✅ **PDF download gating** — free=print only, Standard+ kap PDF, dedicated modal
- ✅ **Email receipt gating** — dedicated upgrade modal (Pro only)
- ✅ **Logo upload gating** — toggle locked + dimmed free-ben, dedicated upgrade modal
- ✅ **Logo receipt display** — ha nincs feltöltött logó, "Company logo" placeholder elrejtve (minden tierben, minden template: print, PDF, email)
- ✅ **Custom labels gating** — readonly inputs + upgrade modal (Pro only)
- ✅ **Team access gating** — cash box settings header + link intercepted, dedicated showTeamUpgrade modal
- ✅ **Team invite gating** — `guardFeature` in team-page.js
- ✅ **Upgrade modalok** konverziós copy-val: cashBox (tier-aware), logo, csv, pdf, labels, email, team, transactionLimit, trialExpired, generic lockOverlay, **custom ID prefix** (`showIdPrefixUpgrade`)
- ✅ **Stripe Edge Functions** léteznek: create-checkout-session, create-portal-session, stripe-webhook, update-subscription
- ✅ **Client-side Stripe wiring** (`SpendNoteStripe` in supabase-config.js + user-settings.js)
- ✅ **Void transaction** — javított RPC (migration 038): parameter name fix, cash box owner auth fallback, correct INSERT columns, org_id NULL guard az audit loghoz; **UI (2026-04-06):** void elérhető szóló tulajnak és Owner/Adminnak, kizárólag org **`user`** (meghívott) tiltva — egyezik az RPC-jogosultsággal
- ✅ **Receipt print settings** — Done&Print és transaction detail receipt most a cash box settings display options-t és a can_upload_logo tier check-et használja
- ✅ **14-day free trial** — kliens-oldali check (user.created_at) + szerver-oldali guard (migration 040) + dedikált showTrialExpiredUpgrade modal
- ✅ **Trial warning banner** — dashboard tetején T-3 naptól, dinamikus countdown, date-based dismiss (másnap újra jön), "Upgrade now →" CTA
- ✅ **Cash box upgrade modal tier-aware** — Free user → Standard (1→2 box), Standard user → Pro (2→∞ box), különböző copy
- ✅ **Upgrade celebration toast** — tier változás detektálása localStorage-ból, "You're on [Plan]! All your new features are ready." success modal
- ✅ **Pro onboarding flow** — team page: ha nincs org → "Start working with your team" modal, team név bekérés, RPC (migration 041: spendnote_ensure_org_for_pro), skip → empty state marad team page-en
- ✅ **Upgrade overlay click fix** — CSS `pointer-events: none` javítás dashboard modal-open állapotban (#sn-upgrade-overlay kivétel hozzáadva)

### Free tier limitek:
| Limit | Érték | Enforcement |
|-------|-------|-------------|
| Cash box-ok | **1** | Kliens |
| Userek | **1** | Kliens |
| Tranzakciók | **20** | Kliens + szerver (RPC) |
| Trial időszak | **14 nap** (utána tx blocked) | Kliens + szerver (RPC) |
| CSV export | ❌ | Kliens |
| PDF letöltés | ❌ (csak print) | Kliens |
| Email receipt | ❌ | Kliens |
| Logo feltöltés | ❌ (toggle locked) | Kliens |
| Custom labels | ❌ | Kliens |
| Team invite | ❌ | Kliens |

### Standard tier:
| Feature | Státusz |
|---------|---------|
| CSV export | ✅ feloldva |
| PDF export | ✅ feloldva |
| Logo feltöltés | ✅ feloldva |
| Unlimited tx | ✅ nincs limit |
| Max 2 cash box | ✅ enforce + upgrade modal → Pro |
| Email receipt | ❌ → showEmailUpgrade → Pro |
| Custom labels | ❌ → showLabelsUpgrade → Pro |
| Team access | ❌ → showTeamUpgrade → Pro |

### Pro tier:
| Feature | Státusz |
|---------|---------|
| Minden Standard feature | ✅ feloldva |
| Email receipt | ✅ feloldva |
| Custom labels | ✅ feloldva |
| Team access | ✅ feloldva |
| Unlimited cash boxes | ✅ |
| Max 3 users (seat) | ✅ enforce in team-page.js |
| Org auto-create | ✅ RPC + onboarding modal |

### Migrációk futtatandók (Supabase SQL Editor):
| Migration | Leírás | Állapot |
|-----------|--------|---------|
| 038_fix_void_auth_fallback.sql | Void transaction auth + INSERT fix | ✅ futtatva |
| 039_free_tier_transaction_limit_server_guard.sql | Free 20 tx szerver guard | ✅ futtatva |
| 040_free_trial_expiry_server_guard.sql | Free 14 nap trial szerver guard | ✅ futtatva |
| 041_ensure_org_for_pro.sql | Pro onboarding: org + owner membership auto-create | **futtatandó** |

### Bugfixek (2026-03-29 session):
- **Void transaction** — 4 rétegű hiba javítva: parameter name mismatch, auth logic (solo user), INSERT column names/types, audit_log org_id NULL
- **Receipt logo placeholder** — "Company logo" szöveg eltávolítva ha nincs tényleges logó (print, PDF, email template), bootstrap fázis visszaállítja ha Supabase-ből jön logó
- **Logo toggle lock** — free tierben disabled + unchecked + dimmed, click → showLogoUpgrade modal, timing fix (await initCashBoxSettings)
- **Print settings mismatch** — Done&Print és transaction detail receipt most a cash box display settings-t és tier check-et használja
- **Upgrade overlay pointer-events** — dashboard.css modal-open rule kiegészítve #sn-upgrade-overlay kivétellel

### Post-payment onboarding (activation):

**Standard upgrade:**
- ✅ Celebration toast: "You're on Standard! All your new features are ready." (localStorage tier change detection)
- ✅ Nincs setup flow / modal — user azonnal visszakerül a flow-ba
- Filozófia: friction removal, nem capability unlock → ne adj feladatot, csak megerősítést

**Pro upgrade:**
- ✅ Celebration toast: "You're on Pro! All your new features are ready."
- ✅ Team page onboarding modal: "You now have access to team features" context + "Start working with your team" + team name input
- ✅ Skip → marad team page-en empty state-tel ("No team yet / Invite people when you're ready" + "Create team" gomb)
- ✅ RPC: `spendnote_ensure_org_for_pro` — org + owner membership auto-create
- Filozófia: capability unlock → guided next step, de lehetőség nem feladat

**Még finomítandó (post-payment flow audit):**
- ⏳ Végigmenni a teljes post-payment flow-n mindkét csomagra (Standard + Pro) — itt szokott elfolyni 30-40% activation
- ⏳ Ellenőrizni: Stripe checkout → redirect back → toast megjelenik → megfelelő oldal töltődik
- ⏳ Pro: team page-re irányítás Stripe checkout után (return_url)
- ⏳ Standard: dashboard-ra visszatérés, sima folytatás

### NEM KÉSZ / Következő lépések:
- ⚠️ **`STRIPE_LIVE = false`** (`supabase-config.js` ~302) — checkout/portal client-oldalon kikapcsolva
- ⏳ **Stripe end-to-end teszt** — pricing → checkout → subscription aktív → tier frissül → limitek feloldva
- ⏳ **Post-payment onboarding audit** — végigmenni a flow-n, Stripe redirect → toast → activation
- ⏳ **Downgrade flow** — kidolgozva (2026-04-03), részletek a V1 Launch terv szekció alatt
- ⏳ **Preview → Free átállás** — meglévő preview userek tierje átírása, 30% kupon generálás
- ⏳ **Preview banner eltávolítása/frissítése** — SEO oldalakon + app oldalakon
- ⏳ **Pricing oldal optimalizálás** — copy, positioning, conversion

---

## V1 Launch terv — Team, Billing, Onboarding, In-app (2026-04-03 session)

Teljes terv kidolgozva. Cél: app launch-ready állapotba hozása.

### 1. Team member modell

A meghívott user **nem kap saját subscription-t**. Tagság nélküli felhasználó, aki az org owner előfizetésén keresztül dolgozik.

**Team member profilja:**
- `profiles.subscription_tier = 'team_member'` — új tier, nincs saját előfizetés
- Nincs trial, nincs trial countdown, nincs trial banner
- Nem lát pricing/upgrade/billing UI-t — az owner dolga
- `_FLAGS`-be új tier: `team_member` — minimális saját jogok, minden az org owner-től jön

**Feature öröklés:**
- `SpendNoteFeatures.getTier()` bővítése: ha `tier === 'team_member'` ÉS van aktív org context → az org owner `subscription_tier`-jét használja
- Owner tier lekérdezése: `org_memberships` (role=owner) + `profiles` join
- Opcionálisan: új RPC `spendnote_get_effective_tier` szerver-oldalon

**UI korlátozások team membernek:**
- Pricing oldal: rejtve vagy redirect a dashboard-ra
- User Settings billing szekció: rejtve — "Your access is managed by [org name]"
- Upgrade modalok: nem jelennek meg, helyette "Contact your team admin"
- Trial banner: nem jelenik meg

**Ha eltávolítják az org-ból:**
- Locked out állapot: dashboard helyett üres oldal
- Üzenet: "You no longer have access to [org name]. Contact your admin to be re-invited, or create your own account."
- "Create your own account" → pricing page, `subscription_tier` átíródik `free`-re, indul a 14 napos trial

**Egy user = egy kontextus (V1 szabályok):**
- Egy user egyszerre csak egy org-hoz tartozhat
- Ha már van org-ja, új meghívást nem fogadhat el: "You're already part of [Org Name]. Leave that team first to join another."
- Ha az email címhez már tartozik aktív fiók (saját subscription):
  1. Első ajánlat: "This email already has a SpendNote account. Use a different email address to join as a team member."
  2. Ha mégis ezzel az emaillel: "Your personal account will be paused. Your data stays safe and comes back if you leave the team." Accept = tier → `team_member`, saját cash box-ok rejtve.
  3. Stripe figyelmeztetés fizető usernél: "You'll also need to cancel your personal subscription in Billing settings to stop being charged." (V1-ben manuális, nem auto-cancel)
- Nincs org switcher, nincs dual-context V1-ben

**Edge case-ek és guardok:**
- Free (lejárt trial) user + invite: zéró friction, elfogadja → `team_member`, azonnal dolgozhat
- Pro owner-t (akinek VAN csapata) meghívják: kemény blokk: "You're the owner of [Org Name] with active team members. You cannot join another organization."
- Owner subscription lejár/downgrade (Pro → Standard/Free): team member-ek bejelentkezéskor: "Your team's subscription has expired. Contact [owner email] to restore access."
- Team member önkéntes kilépés: "Leave team" gomb a Settings-ben → locked out state
- Owner NEM léphet ki a saját org-jából: V1-ben nincs "Leave" gomb az owner-nek
- Signup flow invite token-nel: `__spendnoteEnsureProfileForCurrentUser`-ben: ha van `inviteToken` localStorage-ban → `subscription_tier = 'team_member'`, nem `preview`
- Újrameghívás eltávolítás után: új `org_membership` sor, tier marad `team_member`, azonnal működik
- Önmeghívás: kliens-oldalon blokkolva: "You can't invite yourself."

### 2. Seat billing flow (block + redirect)

Amikor a Pro owner a seat limitnél (default 3) több embert próbál meghívni:
- Blokkolás + üzenet: "You've used all 3 included seats. Add more seats to invite another team member."
- "Manage seats" gomb → Stripe Portal vagy pricing page, ahol megveszi az extra seat-et (+$5/mo/seat)
- Utána visszajön, meghívhat

**Javítandó/építendő:**
- `team-page.js`: seat limit modal átírása block+redirect UX-szel
- `supabase-config.js`: `createCheckoutSession()` — `extraSeats` paraméter bekötése (jelenleg kimarad a payload-ból!)
- `spendnote-pricing.html`: `seat_count` betöltése a profile-ból (profile query nem select-eli jelenleg)
- `create-checkout-session/index.ts`: validálni `extraSeats`/`quantity` Stripe line item-be kerülését
- `stripe-webhook/index.ts`: `seat_count` update ellenőrzése subscription update-nél

### 3. Conversion-oriented onboarding email rendszer

#### State machine (viselkedés-alapú, nem idő-alapú)

| State | Feltétel |
|-------|----------|
| SignedUp | regisztrált, még semmi nem történt |
| NoTransaction | belépett, de nincs mentett tranzakció |
| PartialActivation | megnyitotta a new transaction formot, de nem fejezte be |
| FirstTransaction | létrehozta az első tranzakciót (AHA MOMENT) |
| MultipleTransactions | több tranzakció, rendszeres használat |
| TrialEnding | D+11, trial lejárat közeledik |
| Expired | D+14, trial lejárt, nincs subscription |
| WinBack | D+21, utolsó próbálkozás |

Minden email implicit kérdése: eljutott-e az aha momentig (első tranzakció)? Ha nem → oda tolja. Ha igen → ownership érzés erősítése + upgrade felé visz.

#### Solo user email sequence (14 napos trial)

**D+0: Welcome** (trigger: signup)
- "Your cash box is ready. Most people record their first transaction in under 30 seconds. You don't need to set anything up first. No setup. No team needed. No config."
- CTA: "Record your first transaction"

**D+1: Activation nudge** (trigger: state = NoTransaction, signup > 24h)
- "Someone took cash from the box. End of day, the numbers don't add up. That's the moment SpendNote is built for. Record what happened — amount, who, why — and you'll have a receipt and a record in 30 seconds."
- CTA: "Record it now"

**D+1/D+2: PartialActivation nudge** (trigger: state = PartialActivation)
- "You were one step away from recording your first transaction. It takes 30 seconds to finish it."
- CTA: "Complete your first transaction"
- Magasabb conversion rate mint a hideg nudge — a user már mutatott szándékot

**D+3 — HA state = NoTransaction:**
- Konkrét use-case sztorik: café owner, small office, construction crew
- "They all started with one transaction."
- CTA: "Create your first one"
- Utolsó "puha" próbálkozás. Ha ezután sem aktiválódik, D+7-et NEM kap.

**D+3 — HA state = FirstTransaction / MultipleTransactions:**
- "You recorded your first transaction. Good. Record the next one as well. Then the next. That's how you stop guessing where your cash went."
- CTA: "Open your dashboard"

**D+7: Mid-trial value** (trigger: state = FirstTransaction/MultipleTransactions CSAK)
- "You tracked [X] transactions this week. You now know where your cash went. You have a receipt for every movement. Without this, you wouldn't have this record. That's control."
- CTA: "See plans"
- Counterfactual thinking trigger. Inaktív user NEM kap emailt.

**D+11 (T-3): Trial warning** (mindenki kapja)
- Aktív: "Your free trial ends in 3 days. You've recorded [X] transactions worth [$Y]. Those records stay — but you won't be able to add new ones."
- Inaktív: "Right now, if cash moves, you have no record of it. You still have time to change that."

**D+13 (T-1): Last day**
- "Tomorrow your trial expires. Your system will be paused — no new transactions, no new receipts. $19/month. Less than one misplaced cash receipt costs you. Or one missing transaction."

**D+14: Expired**
- "You can't create new transactions anymore. Your records are here. Your receipts are here. Nothing is lost. Your system is paused. Upgrade anytime to unpause."

**D+21: Win-back** (utolsó email, utána STOP)
- "We're keeping your [X] transactions and receipts safe. Upgrade whenever you're ready — they'll be waiting."

#### Fizető user emailek

**Payment confirmation** (trigger: stripe webhook — checkout.session.completed)
- Standard: "You're set up to track your cash properly. No more guessing where the money went. Next step: keep recording every cash movement."
- Pro: "Next step: invite your team and track together. Most teams invite their first person within 24 hours."

**Pro +48h: Team invite reminder** (trigger: Pro tier > 48h + 0 invites)
- "You have 3 team seats ready. Most teams invite at least one person within 24 hours."

#### Meghívott team member email

**Accept után: Welcome to team** (trigger: invite accepted)
- "You've joined [Org Name]. [Owner name] has given you [role] access."
- Rövid, nincs trial, nincs pricing.

#### Upgrade/downgrade emailek

**Plan downgrade notify** (trigger: webhook — subscription_tier csökken, pl. Pro→Standard)
- Owner-nek: "Your plan has changed to [Standard]. Here's what's different now:"
- Lista amit elveszített (team access, custom labels, stb.)
- "Your data is safe. Upgrade anytime to restore full access."
- CTA: "Upgrade back"

**Subscription canceled** (trigger: webhook — user aktívan cancel-el a Stripe Portal-on)
- Owner-nek: "Your [Pro/Standard] subscription has been canceled. It stays active until [period end date]."
- "After that, your plan changes to Free. Your data stays safe."
- CTA: "Change your mind? Resubscribe"

**Payment failed** (trigger: webhook — invoice.payment_failed)
- Owner-nek: "Your payment for [Pro/Standard] failed. Update your payment method to keep your plan."
- "If not resolved, your subscription will be canceled and your plan will change to Free."
- CTA: "Update payment method" → Stripe Portal
- EZ A LEGFONTOSABB REVENUE RECOVERY EMAIL — involuntary churn 20-30%-a menthető

**Subscription deleted** (trigger: webhook — customer.subscription.deleted, Stripe retry végleges kudarc)
- Owner-nek: "Your subscription has ended. Your plan is now Free."
- Lista amit elveszített + "Your data is safe. Upgrade anytime."
- CTA: "Resubscribe"

**Team access revoked** (trigger: owner tier Pro → Standard/Free)
- Team member-eknek (az org összes nem-owner tagjának): "Your team's subscription has expired. You no longer have access to [Org Name]."
- "Contact [owner name] at [owner email] to restore access, or create your own account."
- CTA: "Create your own account" → pricing page

#### Technikai infrastruktúra

**`email_log` tábla** (nem flag-ek a profiles-on):
```sql
CREATE TABLE email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now()
);
CREATE INDEX idx_email_log_user ON email_log(user_id, email_type);
```

**`pg_cron` job:** Naponta egyszer fut, lekérdezi a user-eket state alapján (signup dátum + tranzakció szám + email_log), meghívja `send-user-event-email` edge function-t.

**PartialActivation tracking:** `profiles.opened_transaction_form_at` timestamp mező, kliens-oldalon mentve amikor a user megnyitja a new transaction formot.

**Copy workflow (email + in-app szövegek):**
1. Cursor megírja a draft szöveget a tervben leírt irányok alapján
2. Átadás ChatGPT-nek kontrollra — copy review, konverziós finomítás, tone check
3. ChatGPT feedback visszahozása Cursor-ba
4. Cursor implementálja a végleges verziót a kódba
Ez minden email template-re és in-app onboarding szövegre (checklist, empty states, nudge-ök, modals) vonatkozik.

### 4. In-app onboarding (behavior forcing flow)

Egyetlen cél: **first transaction 30 másodpercen belül**. Minden más másodlagos.

#### 4a. First login: Currency auto-detect + cash box creation

1. **Auto-detect** pénznem IP/locale alapján (HU → HUF, UK → GBP, US → USD)
2. **Minimal modal** (max 3 másodperc): "We set your currency to **HUF**." + [Change] + [Continue]
   - Nem kérdés, hanem visszaigazolás. A user nem választ, hanem jóváhagy.
3. **Cash box auto-create** a kiválasztott pénznemmel. Continue után egyből dashboard.

#### 4b. Dashboard onboarding (3 réteg)

**1. Checklist banner** (dashboard tetején, max 3 lépés):
- ✓ Cash box created → Record your first transaction → View your receipt
- CTA gomb: "Record your first transaction"
- Ha minden kész: banner eltűnik örökre

**2. Guided empty states** (ez konvertál):
- Dashboard (0 tranzakció): "No transactions yet. If cash moves and you don't record it, you lose track. Record your first transaction in 30 seconds." [Record transaction]
- Transactions lista (üres): "Your transactions will appear here. Start with your first one." [Record transaction]
- Receipt nézet (nincs még): "Every transaction creates a receipt. Create one to see how it works." [Record transaction]
- Mindenhol UGYANAZ a CTA: **"Record transaction"**

**3. Micro nudge** (első belépés után 5-10 mp):
- Toast: "Most users record their first transaction in under 30 seconds."
- Egyszer jelenik meg, utána soha.

#### Post-first-transaction

Azonnal toast: "Nice. Now record the next one. That's how you stay in control." + [Record another]
Checklist frissül: ✓ Cash box created ✓ First transaction → View your receipt

#### Szabályok

- Max 1 lépés, max 1 döntés, max 3 másodperc a currency selection-nél
- Nincs product tour, nincs tooltip flow, nincs setup wizard
- A dashboard NEM hagy mást csinálni, mint az első tranzakciót
- Ha a user 10-15 másodpercen belül nem indítja el az első tranzakciót, az onboarding UX nem elég erős

### 5. Upgrade / Downgrade flow

#### Alapelv: "Soft lock"

Minden adat megmarad és látható, de az AKCIÓK a jelenlegi tier-hez igazodnak. Nincs adatvesztés, nincs törlés, nincs archiválás. A user folyamatosan látja, amije volt — ami upgrade motiváció.

#### Upgrade (bármely irány: Free→Standard, Free→Pro, Standard→Pro)

- Stripe webhook frissíti `profiles.subscription_tier`-t
- Feature flags azonnal az új tier-t tükrözik, minden "just works"
- Cash box-ok: ha volt readonly (downgrade-ből), mind aktívvá válik újra
- Team members: ha Pro-ra upgrade-el, azonnal elérhető a Team page
- Celebration toast megjelenik ("You're on [Plan]!")
- Payment confirmation email megy (Standard: feature lista, Pro: + "invite your team")

#### Downgrade: Pro → Standard

**Cash box-ok (ha több van mint a Standard limit = 2):**
- Következő bejelentkezéskor modal: "Your plan allows 2 active cash boxes. You have [X]. Select which ones to keep active."
- A választás **egyszer történik meg és végleges** (amíg nem upgrade-el vissza)
- Amíg nem választ: az összes cash box **readonly** (nem tud egyikben sem tranzakciót rögzíteni)
- Kiválasztott cash box-ok: aktívak (tranzakció rögzíthető)
- Nem kiválasztott cash box-ok: readonly — megtekinthető, lekérdezhető, de nem rögzíthető benne új tranzakció
- Ha később visszaupgrade-el Pro-ra: mindegyik cash box újra aktív. Ha megint downgrade-el, újra választ.
- Technikai: `cash_boxes.is_active` boolean flag, vagy `cash_boxes.deactivated_at` timestamp

**Team members:**
- Azonnal locked out: "Your team's subscription has expired. Contact [owner email] to restore access."
- Org és membership adatok megmaradnak DB-ben
- Owner nem fér hozzá a Team page-hez (Standard-nél rejtve)
- Ha visszaupgrade-el Pro-ra: team members azonnal újra működnek (membership megvan)

**Custom labels:**
- Régi tranzakciókon megjelennek (historikus adat)
- Új tranzakcióknál nem választhatóak (feature locked, upgrade prompt)

**Email receipt:**
- Feature locked, upgrade prompt
- Korábban emailben küldött receipt-ek nem érintettek

**Export:**
- Standard-nél CSV és PDF elérhető (nincs változás)

#### Downgrade: Standard → Free

**Cash box-ok (ha több van mint a Free limit = 1):**
- Ugyanaz a flow mint Pro→Standard: választ 1 aktív cash box-ot
- Választás egyszer, végleges

**Export:**
- CSV és PDF locked, csak print
- Meglévő exportok/PDF-ek nem érintettek

**Logo:**
- Feature locked
- Régi tranzakciók receipt-jein megmarad a logó (historikus)
- Új receipt-eken nem jelenik meg

**Tranzakció limit:**
- Free = 20 tx limit élesedik
- Ha 50 tranzakciója van: nem tud újat, upgrade prompt
- Meglévő tranzakciók megtekinthetőek, kereshetőek

**Trial:**
- NEM indul újra 14 napos trial. Aki egyszer fizetett és lemondta, nem kap új trial-t.

#### Downgrade: Pro → Free (cancel)

Pro→Standard + Standard→Free szabályok együtt alkalmazandók. Cash box választás: 1 aktív.

#### Payment failed (past_due)

- `billing_status = 'past_due'`, DE `subscription_tier` NEM változik
- Stripe retry periódus (~2-3 hét, 3-4 próbálkozás)
- User Settings-ben: "Payment failed. Update your payment method." + Stripe Portal link
- Ha végül nem sikerül: Stripe `subscription.deleted` → tier → `free`, downgrade flow élesedik

#### Grace period

- V1-ben nincs explicit grace period
- Operatív grace: a `past_due` állapot maga a grace period (Stripe retry)
- Ha a subscription törlődik, a downgrade azonnal érvényes

### 6. Guardok és jogi követelmények

**Email unsubscribe (CAN-SPAM):**
- Drip/onboarding emailek (D+0 — D+21) aljára unsubscribe link kötelező
- `profiles.email_opt_out` boolean flag (default false)
- pg_cron job kihagyja az opt-out user-eket a drip email küldésnél
- Tranzakciós emaileknél (payment failed, plan changed, invite, password reset) NEM kell unsubscribe — ezek account-related, nem marketing

**Account deletion + team:**
- Owner NEM törölheti a fiókját amíg van aktív team member
- Üzenet: "Remove all team members first, then delete your account."
- Solo user (nincs team): normális törlés, delete-account edge function
- Team member (nem owner): törölheti a saját fiókját, org_membership törlődik vele

### 7. Meglévő bugok javítása

- `createCheckoutSession` nem küldi az `extraSeats`-et — payload-ból hiányzik
- Pricing page nem tölti be a `seat_count`-ot — profile query nem select-eli
- Cash box access grant invite-kor nem működik — `member_id` nem létezik invite időpontjában; accept flow-ba kell mozgatni
- `trial_ends_at` nem szinkronizálódik a Stripe webhook-ból — Stripe trialing állapotban a dátum nem íródik profiles-ba
- Pricing FAQ ellentmondás — "20+ transactions" vs "20 transactions or fewer" a money-back guarantee-nél

### 8. Conversion tracking (teljes)

**GA4 funnel események** (gtag custom events, pár sor kliens-oldali kód):
- `signup_completed` — sikeres regisztráció
- `first_login` — első belépés a dashboard-ra
- `currency_selected` — pénznem visszaigazolás a currency modal-ban
- `transaction_form_opened` — new transaction form megnyitása (PartialActivation)
- `first_transaction_created` — AHA moment, első tranzakció mentve
- `second_transaction_created` — rendszeres használat jele
- `checkout_started` — pricing page-ről checkout indítása
- `upgrade_completed` — sikeres fizetés, tier váltás
- `trial_warning_shown` — T-3 dashboard banner megjelent
- `invite_sent` — Pro user meghívást küldött

**Email tracking (Resend API):**
- Resend automatikusan trackeli: open, click, bounce, complaint
- Resend webhook-ok → `email_log` táblába: `opened_at`, `clicked_at` mezők hozzáadása
- Ezzel mérhető: melyik email típus hoz legtöbb open/click-et
- Attribution: ha a user emailben lévő linkre kattint és utána upgrade-el, az email_log + profiles.subscription_tier változás időpontja összeköthető

**Conversion attribution:**
- UTM paraméterek az email CTA linkeken: `?utm_source=email&utm_medium=drip&utm_campaign=d7_midtrial`
- GA4-ben mérhető: melyik email campaign hozta a checkout_started / upgrade_completed eseményt
- Egyszerű attribution: utolsó email kattintás → upgrade időpont (email_log.clicked_at vs profiles tier change timestamp)

**Admin stats oldal** (`/spendnote-admin.html`, csak owner email-lel elérhető):

Metrics:
- Userek: total, tier bontás (free/standard/pro/team_member), új regisztrációk (ma/hét/hónap)
- Activation funnel: signup → first login → first transaction → upgrade (számok + %)
- Revenue: MRR, aktív subscriptionök, seat-ek
- Trial: aktív trial-ok, lejártak, conversion rate
- Email: küldött/megnyitott/kattintott arányok (email_log)
- State machine: hány user van melyik állapotban (NoTransaction, PartialActivation, FirstTransaction, stb.)
- Churn: past_due, canceled, downgraded az elmúlt 30 napban

Chartok:
- Signup trend (daily/weekly line chart)
- Funnel vizualizáció (signup → activation → upgrade, bar/funnel chart)
- MRR trend (line chart)
- Email performance (open/click rate per email type, bar chart)

Technikai:
- Egy RPC (`spendnote_admin_stats`) ami összegyűjti az adatokat a meglévő táblákból
- Chart.js vagy hasonló lightweight chart library
- Hozzáférés: `profiles.email` === owner email (hardcoded guard, vagy admin role check)

### 9. Stripe end-to-end teszt + STRIPE_LIVE

- Migration 041 futtatása (Pro onboarding org auto-create)
- Stripe teszt módban végigmenni: pricing → checkout → subscription aktív → tier frissül → feature-ök feloldva
- Post-payment redirect (Standard → dashboard, Pro → team page)
- `STRIPE_LIVE = true` átkapcsolás ha minden működik

### Implementációs sorrend / prioritás

1-2-7-9 a kritikus path (team + billing + bugfixes + Stripe E2E)
3 (email rendszer) párhuzamosan építhető
4a-4b (in-app onboarding) párhuzamosan építhető
5 (upgrade/downgrade flow) a Stripe E2E-vel együtt tesztelhető
6 (guardok) kis feladatok, bármikor beilleszthetőek
8 (conversion tracking) az in-app onboarding és email rendszer mellé épül — GA4 események az onboarding kódba kerülnek, Resend tracking az email infraba

---

## Korábbi "Next focus" (archív)
- ~~Marketing oldalak mobil optimalizálása~~ (alacsonyabb prioritás most)
- ~~Preview scope lock~~ (preview lezárás alatt)
- ~~Build SEO page #1-#2~~ (kész: who-has-the-cash, boss-cant-see)
- Deploy updated `send-invite-email` Edge Function (post-launch)

## Backlog (UX + bugs)
- **High**
  - Optional: add invite resend/revoke actions in UI.
- **High (upcoming)**
  - Permissions & roles (owner/admin/user) + org/team model:
    - Add `orgs` table (explicit org/team).
    - Multi-location (e.g. multiple restaurants) is handled as **multiple orgs**.
    - Add per-cash-box memberships (`cash_box_memberships`) with role per cash box.
    - Admins default to access for **all** cash boxes via auto-created memberships (still enforced via `cash_box_memberships` so it can be restricted later).
    - Contacts are org-level (shared across cash boxes).
    - Implement real invite flow (token/link) and acceptance.
    - No extra notifications for access changes (user sees access appear/disappear in UI).
    - Audit log: owner-only visibility, append-only (immutable) in v1.
    - Enforce access via RLS for cash_boxes / transactions / contacts.
    - Owner-only: subscription + account/cash box delete.
    - Admin: create cash boxes, invite/add users, void transactions.
    - User: record only in cash boxes they are a member of.
- **Medium**
  - Table column widths need adjustment.
  - Navigation underline styling is still inconsistent.
  - "Save to Contacts" checkbox: add a short inline hint ("so you can reuse it later").
- **Low**
  - Footer redesign.
