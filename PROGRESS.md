# Progress (canonical)

This is the **single canonical “where we are”** file.

If a chat thread freezes / context is lost: in the new thread say:
- **“Read `PROGRESS.md` and continue from there.”**

## AI assistant guidance

- Keep responses minimal and task-focused.
- Prefer implementing fixes over explaining them.
- Avoid long explanations, hedging, or repetitive confirmations.
- Be professional and forward-looking (anticipate edge cases, choose robust solutions).
- Communicate in **Hungarian only**.
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
- [ ] **L1a** Onboarding UI (core, tier-agnosztikus): registration success state + post-login next steps (Cash Box → Transaction → Receipt), invite explanation
- [ ] **L2** Email pack (4 only): define copy + triggers + recipients (Welcome/Account created; Email confirmation; You’ve been invited; Invite accepted/user activated → admin)
- [ ] **L3** Email delivery implementation: Resend + Edge Functions/hooks + templates
- [x] **L4** Role-based Settings UI: Owner/Admin vs User (hide non-owned sections) — **kész** (`user-settings` + `team` oldalon role-alapú megjelenítés/tiltás).
- [x] **L5** Access control UX: user sees only assigned cash boxes; admin can assign/revoke cash box access in UI — **kész** (`spendnote-team.html` cash box grant/revoke, user scope szűrés).
- [x] **DB-TEAM-1** Team/org/invite DB versioning alignment: `invites` tábla + `spendnote_create_invite` RPC + RLS policies → `supabase-migrations/030_invites_table_and_create_invite_rpc.sql`; `database/schema.sql` + `database/SCHEMA-DOCUMENTATION.md` frissítve a kanonikus modellel.
- [x] **M1** Mobile strategy + responsive MVP completed (2026-02-18)
- [x] **S1** Subscription rules spec — **kész** (`S1-SPEC.md`): trial modell, csomag limitek, feature flag kulcsok, downgrade/törlés viselkedés dokumentálva.
- [ ] **S2** Stripe prep (ready to plug in): subscription state data model + feature flags + UI placeholders + webhook handling plan
- [ ] **L1b** Onboarding UI (tier-specifikus): Free/Standard/Pro variánsok, lock/upgrade CTA-k és limit üzenetek az S1/S2 döntések alapján
- [x] **DEPLOY-1** Migration plan: move from Vercel/demo domain to Cloudflare on `spendnote.app` (hosting target, caching rules)
- [x] **DEPLOY-2** Cloudflare DNS + SSL + redirects: decide canonical host (`spendnote.app` vs `www`), configure 301s and safe HSTS
- [x] **DEPLOY-3** Supabase for new domain: update Site URL + allowed redirect URLs; test login/signup/invite flows on `spendnote.app`
- [x] **M1** Mobile redesign complete: bottom nav bar, card lists, modal bottom sheet, tx detail 2×2 grid (2026-02-18)
- [x] **DEPLOY-4** Cutover rehearsal + go-live checklist: staging URL, smoke tests, rollback plan
- [ ] **S3** Stripe integration: checkout, customer portal, webhooks, live mode rollout + enforcement activation
- [ ] **O1** Google OAuth (later): Supabase OAuth + account linking rules + UX
- [ ] **MKT-1** Market scan + positioning: direct/adjacent alternatives + SpendNote differentiation + keyword list
- [ ] **MKT-2** SEO content plan: 3 landing pages (petty cash misspellings/alternatives) + “cash handoff receipt” positioning + CTA alignment to onboarding (L1/L2)
- [ ] **CLEAN-1** Codebase cleanup pass: remove unused/dead code, dedupe helpers, normalize versioned assets, performance + reliability polish
- [ ] **P3-1** Polish: Landing/FAQ/Terms refinements + edge cases + final UX consistency pass

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

- [ ] **AUDIT-M1** Onboarding/empty-state flow első belépésre (első cash box → első tranzakció → első receipt).
- [x] **AUDIT-M2** ~~Tranzakció szerkesztés~~ — **by design: nincs.** Tranzakciók immutábilisak, kizárólag void lehetséges.
- [x] **AUDIT-M3** ~~Tranzakció törlés~~ — **by design: nincs.** Kizárólag void használható, törlés nem lehetséges.
- [x] **AUDIT-M4** Tranzakció export (CSV/PDF) a history nézetből — **már implementálva.**
- [x] **AUDIT-M5** Kontakt kereső/szűrő hozzáadása contact list oldalon — **már implementálva.**
- [x] **AUDIT-M6** ~~Receipt limit szerver oldali enforce~~ — **beolvad a subscription/billing implementációba (S1–S3).** Preview limit kliens oldalon marad.
- [x] **AUDIT-M7** ~~Cash box archiválás~~ — **elvetve.** Nem lesz archiválás, cash box törölhető vagy aktív.
- [x] **AUDIT-M8** ~~Email change flow~~ — **elvetve.** Nem szükséges; account törlés + újraregisztráció elérhető.
- [ ] **AUDIT-M9** 2FA/MFA opció értékelése és roadmap döntés.
- [x] **AUDIT-M10** Legacy táblák (`team_members`, `cash_box_access`) deprecate + schema cleanup terv.

### Alacsony prioritás

- [ ] **AUDIT-L1** Dark mode támogatás (design token/CSS variable alap).
- [ ] **AUDIT-L2** i18n előkészítés (szövegek kivezetése forrásfájlba).
- [ ] **AUDIT-L3** Offline read-only baseline (service worker) felmérés.
- [ ] **AUDIT-L4** In-app notification center igény és minimum scope definiálás.
- [x] **AUDIT-L5** `spendnote-faq-old.html` kivezetés (törlés vagy redirect).
- [ ] **AUDIT-L6** Sentry environment tagging és release címkézés finomítása.
- [ ] **AUDIT-L7** Contact list pagination nagy adathalmazra.

## Where we are now (last updated: 2026-02-25 este — receipt FROM/TO fix + settings oldal regressziók javítva)

### 2026-02-25 esti zárás — Receipt FROM/TO swap + Account Settings regresszió fix (KÉSZ)

- **Receipt FROM/TO swap (IN tranzakcióknál):**
  - `spendnote-receipt-print-two-copies.html`, `spendnote-pdf-receipt.html`, `spendnote-email-receipt.html` javítva.
  - IN tranzakciónál: contact = FROM, company = TO.
  - OUT tranzakciónál: company = FROM, contact = TO.
  - `isIncome` boolean alapján kondicionális logika minden receipt template-ben.
  - company/contact `otherId` is felcserélve a típus alapján.
- **Onboarding wizard Other ID mentés:**
  - `spendnote-welcome.html`: `receiptOtherId` mező értéke `phone` mezőként mentve a profilba.
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
  - `transaction-detail-ui.js`: void gomb role-check átállítva `orgMemberships.getMyRole()` logikára (Owner/Admin).
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

## Next focus (pick one)
- **Marketing oldalak mobil optimalizálása (következő session első feladat):** `index.html`, `spendnote-pricing.html`, `spendnote-faq.html`, `spendnote-terms.html`, `spendnote-privacy.html` — 430/390/375px töréspontok, overflow, hero/CTA/footer/legal blokkok.
- **Preview scope lock (7-8 nap):** onboardingban csak a kötelező receipt identity first-run modal készül el; az email templatek (L2/L3) post-preview feladatok.
- **Preview scope lock (kiegészítés):** a Team multi-cash-box assignment/logika javítás **nem preview blocker**, külön post-preview workstream.
- Landing polish for public preview (copy, CTA, preview messaging, trust/legal links).
- Add visible contact email on landing (footer + clear `mailto:`) for inbound questions.
- Preview disclaimer UX on landing + signup (signup explicit acceptance).
- GA4 baseline on landing (`page_view` + signup CTA click event) + Search Console setup.
- Onboarding: auto-create a default USD Cash Box (starting balance 0) after signup/first session.
- Build SEO page #1: `petty-cash-log-software` intent page (angle: replace handwritten/duplicate receipt book with searchable digital cash handoff receipts; US keywords: "receipt book", "duplicate receipt book", "carbonless receipt book"; copy + layout + meta + canonical + internal links).
- Build SEO page #2: `cash-handoff-receipt-app` intent page (copy + layout + meta + canonical + internal links).
- Create a demo account with typical US cash box names, addresses, and transactions for screenshots (SEO pages + landing).
- Populate the demo account data in Supabase tables so it is usable for screenshots/videos.
- After landing is ready: enable indexing for landing + these 2 SEO pages only; keep internal/app pages `noindex`.
- Deploy updated `send-invite-email` Edge Function (reply_to + personalized subject), then monitor inbox placement for 48h.

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
