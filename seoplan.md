# 🛡️ STRATEGIC GUARDRAILS — 2026-05-01 ESTE (`/petty-cash-app` Google-discoverability micro-sprint + 3-page SoftwareApplication schema annual-price alignment)

> **Ez most a legfrissebb iránymutatás.** A 04-28-ös guardrails-blokk (lentebb) a **megelőző** állapotot rögzíti — a stratégiai irányt megerősíti, csak a teendőlistát váltja le.

## A. Mit csináltunk ma (2026-05-01) — felhasználói override a 04-28-i `## A. NE PISZKÁLJUK` szabályra

A 04-28-i guardrails **tiltotta** az internal-link átépítést (`Új internal-link átépítés` a tilos listán) a 2026-04-29 → 2026-05-19 moratórium alatt. A felhasználó 2026-05-01 18:16 GMT+2-kor explicit zöld jelzést adott mind a 3 javasolt fix-re ("egyébként mehet mind a három módosítás, csináld"). A változtatások mind **technical SEO szintűek** (schema + 2 belső link + 2 anchor-szöveg), nem új URL és nem H1/H2 rewrite — kockázat-szempontból ekvivalensek a 04-29 00:30-as `employee-cash-advance-receipt` content-mismatch-fix-szel.

**Diagnózis (a sprint indokolása):** A `/petty-cash-app` oldal **továbbra sem jelenik meg Google-on** "petty cash app", "online petty cash app", "browser-based petty cash app" intent-query-kre, holott **Bing már TOP 1-3-ban rangsorolja** (04-28-i live SERP-evidence). 3 root-cause:
1. **Hiányzó homepage→/petty-cash-app belső link** — a homepage (legmagasabb authority a domainen) nem linkelt erre az oldalra. A 13 incoming internal link mind alacsonyabb-authority oldalakról jött (related-cardok). A leg-nagyobb értékű link-equity transfer kimaradt.
2. **Hiányzó SoftwareApplication schema a `/petty-cash-app`-en** — csak `Article` + `FAQPage` schema volt. Google nem kapott explicit "ez egy software" jelet, ami "app"-intent query-knél kritikus.
3. **Anchor-text over-optimization** — 13 incoming linkből ~10 az "Petty Cash App" / "petty cash app" exact-match anchor-szöveg variánsait használta. Anchor-diversity zéró.

**Plus mellékfelfedezés:** SoftwareApplication schema árazási inkonzisztencia 3 oldalon — `index.html` + `spendnote-pricing.html` + (újonnan hozzáadott) `petty-cash-app.html` 3 különböző "SpendNote" SoftwareApplication-entitást deklaráltak 3 különböző ár-claim-mel. Ennek 04-18-i (`a23bffd`) eredete dokumentálva a `PROGRESS.md`-ben (post-mortem szekció).

### A.1 Commit `421e5b9` — `/petty-cash-app` discoverability micro-sprint

| Oldal | Mit | Cél |
|---|---|---|
| `index.html` (hero subnote, 1563. sor) | Új belső link → `/petty-cash-app`, anchor: **"browser-based petty cash app"**, inline style: `color: inherit; font-weight: inherit; text-decoration: underline;` (csak underline; betűszín és súly nem változik a felhasználó UI-kérése szerint) | Direkt link-equity transfer a homepage-ről (legmagasabb authority az oldalon) |
| `index.html` (features description, 1638. sor) | Új belső link → `/petty-cash-app`, anchor: **"SpendNote petty cash app"**, ugyanaz az inline-style | Második homepage-link, **eltérő anchor** (anchor-diversity), a meglévő `/petty-cash-receipt-generator` és `/petty-cash-policy-template` inline-linkek mellé |
| `petty-cash-app.html` (3. JSON-LD blokk) | **Új `SoftwareApplication` schema** (Article + FAQPage mellé) — `applicationCategory: BusinessApplication`, `applicationSubCategory: "Petty Cash Management"`, `alternateName: "SpendNote Petty Cash App"`, `operatingSystem: "Web Browser (Chrome, Safari, Firefox, Edge)"`, full `featureList` (8 elem), 2 offer (`$0` Free + `$15.83` Standard, P1Y annual) | Explicit "ez software, nem cikk" jel Google-nak — "app"-intent query-knél kritikus |
| `cash-float-vs-petty-cash.html` (189. sor) | Inline anchor variáció: "petty cash app" → **"browser-based petty cash app"** | Anchor-diversity, exact-match-burden csökkentése |
| `petty-cash-how-much-to-keep.html` (106. sor) | Inline anchor variáció: "petty cash app" → **"cloud petty cash tool"** | Anchor-diversity, exact-match-burden csökkentése |
| `tools/validate-schema.mjs` | 16-soros Node.js helper a JSON-LD blokkok lokális gyors-validálására (`node tools/validate-schema.mjs <file.html>`) | Rich Results Test előtti smoke-check |

**Anchor-diversity stratégia (NEM piszkáltuk):** A 11 related-card link a cluster-oldalakon ("Related Resources" szekciók) **változatlan maradt** — strukturált navigációs elemek, az UX-konzisztencia értékesebb mint az anchor-variáció. Csak a body-text inline anchor-okat variáltuk (2 hely).

### A.2 Commit `03d39a8` — SoftwareApplication schema 3-oldalas annual-price alignment

| Fájl | Schema offer-ek **ELŐTT** | Schema offer-ek **UTÁN** |
|---|---|---|
| `index.html` (line 37-79 SoftwareApplication) | `$0` Free + `$19` Standard (P1M monthly) + `$29` Pro (P1M monthly) | `$0` Free + `$15.83` Standard (P1Y annual, $190/yr) + `$24.17` Pro (P1Y annual, $290/yr) |
| `spendnote-pricing.html` (line 44-91 SoftwareApplication) | `$0` Free + `$19.00` Standard (MO) + `$29.00` Pro (MO) | `$0` Free + `$15.83` Standard (MO + P1Y annual) + `$24.17` Pro (MO + P1Y annual) |
| `petty-cash-app.html` (3. JSON-LD blokk) | `$0` Free + `$15.83` Standard (no Pro) | `$0` Free + `$15.83` Standard (P1Y) + `$24.17` Pro (P1Y) — Pro hozzáadva |

Minden offer-en új `description: "Billed annually — $X/yr"` + új `priceSpecification.billingDuration: "P1Y"` — Google explicit `annual prepaid, displayed per-month` szignált kap.

**Pricing toggle JS data NEM változott:** `index.html` (line 2025-2073) és `spendnote-pricing.html` (line 845-925) `pricingData` objektumban a `monthly: { standard: '$19', pro: '$29' }` változatlan. A `$19/$29` ott reális, felhasználó által átkapcsolható monthly billing cycle-érték — ez nem schema claim, hanem UI toggle-data.

## B. Új moratórium: 2026-05-01 → 2026-05-15

**Tilos (változatlan a 04-28-i listához képest, csak az újraszámlálás új):**
- Új oldal
- Új title-rewrite
- Új H1/H2 átírás
- Új internal-link átépítés (a mai 2 homepage-link kivételével — a többit **NE** bővítsük tovább)
- Új meta-tweak hullám

**Megengedett (változatlan):**
- Indexelési kérés (egyenként, max 5/nap kvóta)
- Sitemap resubmit
- Search Console figyelése (heti max 1×)
- GSC export napi/heti mentése

**Cél:** Hagyni a Google-t feldolgozni a teljes 04-25 → 05-01 közötti tartalmi + technikai changes-flowt (3 új oldal + 4 meta-tweak + cloud/online framing + Pro Custom Labels conversion-content + employee-cash-advance B variáns + mai 3-fix sprint) mielőtt újabb hullámot indítunk.

## C. Indexelési teendő — felhasználó GSC-n holnap (2026-05-02)

Prioritás-sorrendben (5/nap kvóta belefér):

| # | URL | Indok |
|---|---|---|
| 1 | `https://spendnote.app/petty-cash-app` | TOP PRIORITÁS — sprint elsődleges célpontja, új SoftwareApplication schema + új homepage incoming link |
| 2 | `https://spendnote.app/` | 2 új belső link `/petty-cash-app`-re + SoftwareApplication schema árazás javítva |
| 3 | `https://spendnote.app/spendnote-pricing` | SoftwareApplication schema árazás 3-oldalas alignement keretében javítva |
| 4 | *(opcionális)* `https://spendnote.app/cash-float-vs-petty-cash` | Inline anchor variáció |
| 5 | *(opcionális)* `https://spendnote.app/petty-cash-how-much-to-keep` | Inline anchor variáció |

**Rich Results Test elsőként (request indexing előtt):**
- `https://search.google.com/test/rich-results?url=https%3A%2F%2Fspendnote.app%2F`
- `https://search.google.com/test/rich-results?url=https%3A%2F%2Fspendnote.app%2Fpetty-cash-app`
- `https://search.google.com/test/rich-results?url=https%3A%2F%2Fspendnote.app%2Fspendnote-pricing`

Mindháromnak látnia kell a `SoftwareApplication` item-et 3 offer-rel ($0, $15.83, $24.17). Ha igen → request indexing.

## D. Új 14-napos checkpoint: 2026-05-15

A 04-28-i `B. 14-napos checkpoint (2026-05-12)` változatlanul érvényes a 04-25 sprintre — az ottani 6 értékelési pont marad. A mai (05-01) sprintnek **saját** 14-napos checkpointja van **2026-05-15-én**:

1. **`/petty-cash-app` Pages → Queries audit** — bejönnek-e új "app"-intent query impressziók? (most: 0)
2. **`/petty-cash-app` average position** — javul-e? (most: nem rangsorol)
3. **SoftwareApplication rich result** — megjelenik-e a SERP-en (price, rating, etc.)? GSC > Enhancements szekció.
4. **Homepage `/` Pages → Queries** — változik-e a `simple petty cash software` (jelenleg pos 3.2) körüli query-mix?
5. **Anchor-diverzifikációs hatás** — a 2 inline-anchor változás mérhető-e a `cash-float-vs-petty-cash` és `petty-cash-how-much-to-keep` query-profilján?
6. **Pricing schema árazás konzisztencia** — Google Knowledge Graph árazás frissül-e $15.83-ra? (Bing Webmaster Tools-on is mérhető.)

**Decision-tree a 2026-05-15 checkpoint-on:**

| Kimenet | Action |
|---|---|
| Pos 30 alatt 2-3 "app"-intent query a `/petty-cash-app`-en | ✅ Stratégia működik, csak idő. Várunk tovább 14 napot. |
| 0 új query impresszió, de SoftwareApplication rich result megjelenik | ⚠️ Schema van, de cluster authority gyenge. **H1 rewrite** + **further internal link injection** mehet. |
| 0 mozgás semmin, Bing pos 1-3 marad | ❌ Google-specifikus probléma (nem content). **Direkt outreach + AlternativeTo / Capterra retry + Reddit organic mention** szükséges. Lehet hogy a `/petty-cash-app` **content rewrite** kell (more user-facing, fewer SEO-flags). |

## E. Mit nem csináltunk MA (átmentve későbbre)

Felhasználó **3 ajánlatot kapott** (IndexNow ping script / AlternativeTo listing draft / Reddit post draft) ma este — **egyiket sem rendelte meg**. Ezek a backlogban maradnak, post-2026-05-15 checkpoint döntéshez kötve:

- **F.M.1 IndexNow API ping helper script** — `tools/indexnow-ping.mjs`. Bing/Yandex/Yep instant URL-update notification. ~30 perc impl, ingyenes, nincs daily limit. Akkor érdemes ha 05-15-re Google nem mozdul de Bing-en tovább erősíteni akarjuk a `/petty-cash-app`-et.
- **F.M.2 AlternativeTo listing draft** — submission szöveg `/petty-cash-app`-re mint "alternative to QuickBooks Petty Cash, NetSuite Petty Cash, Excel petty cash sheet". Indexelhető backlink + qualified traffic. Akkor érdemes ha 05-15-re Google nem mozdul és külső authority-jelekkel akarjuk pumpálni.
- **F.M.3 Reddit / IndieHackers post draft** — 1 értékes 300-500 szavas post r/smallbusiness vagy r/Bookkeeping subreddit-en, természetesen említve a `/petty-cash-app`-et és/vagy `/petty-cash-how-much-to-keep`-et. Reddit linkek nofollow-ek de Google általuk fedezi fel az új URL-eket (crawl discovery).

Külön capterra-retry / SourceForge-update / SaaSHub-refresh / G2 Featured Comparison submission **továbbra is felhasználói feladat** — nincs erre AI-tooling.

## F. Compliance-border policy — HARD RULE (felhasználói direktíva, 2026-05-02 01:30)

**Pozicionálás (felhasználói szóhasználattal):**

> SpendNote = operatív nyilvántartó + receipt-generáló eszköz. **NEM hivatalos könyvelési szoftver, NEM tax-tool, NEM legal-advisor.** Csak nyilvántartó és receipt-adó eszköz a kliens operatív rétegén; az accountant / bookkeeper / tax-advisor a felette dolgozó réteg.

**Tilos oldal-jelölt vagy content-bővítés bármelyik alábbi területen:**

- **Tax-advice** — IRS/HMRC/ATO/CRA-rules, deduction-rules, 1099/W-9/W-2-tanácsadás, sales-tax/VAT/GST treatment, payroll-tax kalkuláció.
- **Accounting principles** — journal entries, GAAP/IFRS, double-entry, ledger-treatment, chart-of-accounts mapping.
- **Legal-template-content** — legal disclaimer-writing, contract clauses, employment-law-related, statutory-wage-statement-pótlás.
- **Compliance-szabályok** — donor-receipt rules (charity, nonprofit, 501(c)(3), Gift Aid), Form 990, Charity Commission filings, country-specific regulatory compliance.
- **External / tax / compliance-audit procedure** — audit-procedure-tanácsadás kifelé (NOT internal owner-audit, ami OK).
- **Donor-receipts / charity / nonprofit** — már SKIPPED a F.2-ben (jogi kockázat), itt explicit megerősítve.

**Kötelező pozicionálás minden tax/legal-adjacent jelöltnél:**

> SpendNote helps you record and prove. Your accountant classifies, files, and reports. Different jobs.

**SERP-validation előtt minden új jelöltnél explicit compliance-border-check kötelező.** Ha a query top-5-jében dominál tax-authority (Investopedia, IRS.gov, QuickBooks-blog tax-tag, Bench/Pilot, Avalara, AccountingTools), automatikus SKIP.

### F.1 Disclaimer-coverage TIER standard (minden új landing-jelöltre)

Minden új tax/legal-adjacent oldal **kötelezően TIER A-szintű disclaimert kap** (a `payroll-cash-receipt.html` mintára):

1. **`.top-disclaimer` box** közvetlenül a hero alá, az első H2 előtt — sárga warning-style border (`#f59e0b`), `fas-triangle-exclamation` ikon, "Read this first — what SpendNote does and does not do" headline-nal.
2. **Dedikált H2 szekció** "This Is Not a [X]" formában, strukturált "It is / It is not" listával.
3. **`.disclaimer-box` reminder** a CTA fölé, restating a fő kockázati pontokat.
4. **2 dedikált FAQ** ("Is this a [tax/legal/payroll] document?" — "No. ..." + 1 másik border-clarification).
5. **JSON-LD FAQPage entries** mindkét FAQ-ról — schema-szintű disclaimer is.

**TIER B (single in-body disclaimer-box, no dedicated H2)** és **TIER C (footer-only)** **NEM elfogadható** új landing-jelöltön. A jelenlegi pages közül a 2026-05-02-i compliance-hardening sweep-pel mind TIER A-ra vagy TIER A-near-re lettek emelve.

### F.2 2026-05-02 audit-eredmény (8 borderline meglévő oldal státusza)

**TIER A (változatlanul jó, no action):**

- `payroll-cash-receipt.html` — best-in-class reference (top-disclaimer + "not this" red box + reminder + 2 FAQ + schema)
- `employee-cash-advance-receipt.html`
- `contractor-advance-payment-receipt.html`
- `cash-deposit-receipt.html`

**Hardening végrehajtva 2026-05-02-en (commit `a3ef5cf`):**

- `petty-cash-policy-template.html` (TIER C → TIER A) — top-disclaimer + reminder a CTA fölé. Single highest-risk page on the site (template-letöltés).
- `office-expense-reimbursement-form.html` (TIER C → TIER A) — top-disclaimer.
- `cash-refund-receipt.html` (TIER B → TIER A-near) — dedikált H2 "This Is Not a Credit Note or Tax Document" + "It is / It is not" lista.
- `petty-cash-audit-checklist.html` (TIER B → TIER A-near) — dedikált H2 "Internal Audit vs External / Tax Audit — What This Checklist Covers".

**Megjegyzés:** A `cash-refund-receipt` és `petty-cash-audit-checklist` még nem teljes TIER A (nincs schema-szintű FAQ-disclaimer + nincs `.top-disclaimer` warning-banner). De a meglévő disclaimer-box + új H2 + meglévő FAQ-k együttesen elég coverage-et adnak. Schema-szintű disclaimer-bővítés a következő nagyobb compliance-pass-ban (post-2026-05-15) mehet.

### F.3 8 brainstorm-bucket átszűrve a hard-rule alapján (2026-05-02)

A 2026-05-02 01:30-i brainstorm-session-ben összegyűjtött 8 új angle-bucket átszűrve a F. policy-vel:

- ✅ **15 jelölt tiszta** (azonnal SERP-validation-re mehetnek post-checkpoint)
- ⚠️ **9 jelölt át kell keretezni** (compliance-border-fit framing-gel működhetnek)
- ❌ **5 jelölt SKIP** (`petty-cash-stolen-what-to-do`, `petty-cash-accounting-entries`, `petty-cash-tax-season-prep`, `mint-vs-spendnote`, korábbról `petty-cash-for-church/charity/nonprofit`)

A teljes szűrt lista a `PROGRESS.md`-ben a 2026-05-02 brainstorm-szekciója alatt.

### F.3.A Bucket-onkénti rationale + target-keyword + priority-ranking — 2026-05-02 02:10 (full recovery)

**Felhasználói pushback (2026-05-02 02:08):** *"a korábbi ötleteidet elmentetted már, mielőtt beleszóltam a saját gondolataimmal?"* — kiderült hogy a F.3 szekció **csak névsort + dispositiont mentett**, a brainstorm "miért"-jét (rationale, target-keyword, priority) **nem**.

**Beismerés a F.3 inkonzisztenciára:** Az F.3 összegzés "15 ✅ / 9 ⚠️ / 5 ❌" számai **félrevezetőek voltak** — a "15" valójában csak az iparág-vertikál bucket darabszáma, nem a total ✅ szám. A teljes accurate összegzés: **36 ✅ + 12 ⚠️ + 5 ❌ = 53 jelölt** 8 bucket-ben.

#### Bucket 1 — Iparág-vertikál (15 ✅)

**Rationale:** A `petty-cash` cluster eddig generic small-business-targeted volt. Az iparág-specifikus content **15 long-tail landing-jelöltet** ad, ahol az intent **explicit** (pl. "petty cash veterinary clinic" konkrét pain-pointot keres: gyógyszer-rendelés készpénzben, állat-tulajdonos-előleg-készpénzben). Mindegyik vertikál: saját query-tér (alacsony konkurencia), konkrét use-case-ek (real-world példák a content-be), social-proof potenciál (case-study).

| Slug | Target-keyword | Risk-impact tier |
|---|---|---|
| `petty-cash-for-veterinary-clinic` | `petty cash veterinary clinic` | Med-impact, low-risk |
| `petty-cash-for-auto-repair-shop` | `petty cash auto repair shop` | **High** (cash-heavy) |
| `petty-cash-for-property-management` | `property management petty cash` | Medium |
| `petty-cash-for-cleaning-business` | `cleaning business petty cash` | Medium |
| `petty-cash-for-daycare` | `daycare petty cash management` | **High** (cash-heavy, parent-payments) |
| `petty-cash-for-salon` | `hair salon petty cash` | **High** (very cash-heavy, tip-pool overlap) |
| `petty-cash-for-food-truck` | `food truck petty cash` | Medium-high |
| `petty-cash-for-dentist-office` | `dental office petty cash` | Medium |
| `petty-cash-for-coffee-shop` | `coffee shop petty cash` | Medium-high |
| `petty-cash-for-barbershop` | `barbershop petty cash` | Medium |
| `petty-cash-for-nail-salon` | `nail salon petty cash` | Medium-high |
| `petty-cash-for-spa` | `spa petty cash management` | Medium |
| `petty-cash-for-hvac-business` | `hvac business petty cash` | Low-medium |
| `petty-cash-for-landscaping` | `landscaping business petty cash` | Low-medium |
| `petty-cash-for-photography-studio` | `photography studio petty cash` | Low |

**Top 5 quick-win** (cash-heavy + low-SaaS-competition): salon → daycare → auto-repair → coffee-shop → food-truck.

#### Bucket 2 — Role-driven (4 ✅ + 2 ⚠️)

**Rationale:** Pivot "what kind of business"-ról "who is the person managing it"-re. **Persona-targeting** — különböző role-ok különbözőképp guglinak ugyanarra a problémára.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `petty-cash-for-office-manager` | `office manager petty cash` | ✅ Direct fit, leggyakoribb persona |
| `petty-cash-for-executive-assistant` | `executive assistant petty cash management` | ✅ EA-k gyakran custodianok |
| `petty-cash-for-construction-site-foreman` | `construction foreman site cash` | ✅ Field-cash, ad-hoc beszerzések |
| `petty-cash-for-restaurant-manager` | `restaurant manager cash float` | ✅ Tip-pool/till-overlap, óvatos vocabulary |
| `petty-cash-for-bookkeeper` | `bookkeeper petty cash workflow` | ⚠️ Bookkeeper persona → tax/accounting territory pull-risk |
| `petty-cash-for-hr-manager` | `hr manager office cash advances` | ⚠️ HR + cash-advance → payroll territory pull-risk |

**⚠️ átkeretezés-mód:**
- **`bookkeeper-role`**: framing = "what your bookkeeper expects from you" (operations-side, NOT accounting-side). Tilos: journal entries, GAAP, ledger treatment, debit/credit. Megengedett: receipt-handoff workflow, monthly export, "what to deliver to bookkeeper".
- **`hr-manager-role`**: framing = "office cash for incidentals" (snacks, taxis, office-supplies for new hires). Tilos: employee advances, payroll-deductions, garnishment, tip-pooling. Ha bármilyen payroll-vocab kell → SKIP.

#### Bucket 3 — Use-case (5 ✅ + 1 ⚠️)

**Rationale:** What the cash actually gets used for. **Specific-scenario** landings, very targeted long-tail. Mindegyik egy mini-pain-point a felhasználó workflow-jában.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `petty-cash-for-office-snacks` | `office snacks petty cash` | ✅ Klasszikus use-case, evergreen |
| `petty-cash-for-parking-fees` | `parking fees petty cash office` | ✅ Urban-office pain |
| `petty-cash-for-team-lunches` | `team lunch petty cash` | ✅ Egyszerű, gyakori |
| `petty-cash-for-postage-mailing` | `postage petty cash log` | ✅ Recurring small expense |
| `petty-cash-for-emergency-repairs` | `emergency repairs office petty cash` | ✅ HVAC-failure / lock-replace pain |
| `petty-cash-for-client-gifts` | `client gifts cash log` | ⚠️ Gift-tax-territory adjacent |

**⚠️ átkeretezés-mód:**
- **`client-gifts-use-case`**: framing = "tracking the cash spent on small client gifts so the bookkeeper can categorize later". Tilos: IRS gift-tax limit ($25/person/year), deductibility, business-entertainment classification. Megengedett: "tracking the spend, the receipt, and who received what — your accountant decides the category".

#### Bucket 4 — Pain-driven (3 ✅ + 1 ⚠️ + 1 ❌)

**Rationale:** **Crisis/anxiety queries** — a leg-magasabb-converting search-intent. User már fáj neki, **NOW** keres megoldást.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `petty-cash-receipt-missing` | `petty cash receipt missing what to do` | ✅ Heti-szintű probléma |
| `petty-cash-custodian-quitting` | `petty cash custodian leaving handoff` | ✅ Transition-pain, magas conversion |
| `petty-cash-multiple-people-accessing` | `multiple people accessing petty cash chaos` | ✅ Scale-pain |
| `petty-cash-balance-doesnt-match-ledger` | `petty cash balance ledger mismatch` | ⚠️ Cannibalization-risk — meglévő `petty-cash-does-not-balance.html` overlap |
| `petty-cash-stolen-what-to-do` | `petty cash stolen office what to do` | ❌ Police/insurance/legal territory |

**⚠️ átkeretezés-mód:**
- **`balance-vs-ledger-mismatch`**: KILL vagy MERGE — a meglévő `petty-cash-does-not-balance.html` (2026-04-15 előtt készült) **erősen overlap**. Nem érdemes új landing, viszont a meglévő oldalt **bővíteni** lehet "ledger mismatch" angle-lel.

#### Bucket 5 — Comparison (2 ✅ + 3 ⚠️ + 1 ❌)

**Rationale:** "X vs Y" landings active comparison-mode user-eknek. **Magas commercial intent.**

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `quickbooks-petty-cash-alternative` | `quickbooks petty cash alternative` | ✅ Magas-volume, generic pain |
| `expensify-vs-spendnote-petty-cash` | `expensify vs spendnote petty cash` | ✅ Konkrét tool-comparison |
| `pleo-vs-spendnote` | `pleo alternative small office` | ⚠️ Pleo Europe-focused, brand-comparison-policy kérdés |
| `wave-vs-spendnote-petty-cash` | `wave accounting petty cash alternative` | ⚠️ Wave ≈ free-accounting, scope-mismatch |
| `freshbooks-vs-spendnote-petty-cash` | `freshbooks petty cash alternative` | ⚠️ FreshBooks = invoicing-first, scope-mismatch |
| `mint-vs-spendnote` | `mint petty cash alternative` | ❌ Mint shutdown 2024 + personal-vs-business intent-mismatch |

**⚠️ átkeretezés-mód:**
- **`pleo` / `wave` / `freshbooks`**: ezek **full SaaS-platformok** ahol a petty-cash csak sub-feature. Framing = "a focused petty-cash tool vs. an all-in-one platform that includes petty cash". Honest scope-comparison: SpendNote = receipt-handoff focus, vs. = full accounting/expense-management. NEM kell mind a 3 — érdemes 1 indítani (Pleo legjobb jelölt: petty-cash a központi positioning-jukban).

#### Bucket 6 — Workflow-concept (3 ✅ + 1 ⚠️ + 1 ❌)

**Rationale:** **Educational concepts** ami comparison/awareness traffic-et hoz. Top-of-funnel user-ek "what is X" / "X vs Y" / "when to X" query-kkel.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `when-to-replenish-petty-cash` | `when to replenish petty cash` | ✅ Practical, frequent question |
| `petty-cash-vs-change-fund` | `petty cash vs change fund difference` | ✅ Confused-vocabulary clarification |
| `petty-cash-vs-cash-drawer` | `petty cash vs cash drawer` | ✅ Confused-vocabulary clarification |
| `imprest-system-petty-cash` | `imprest system petty cash explained` | ⚠️ Academic-accounting term |
| `petty-cash-journal-entries` | `petty cash journal entries gaap` | ❌ GAAP/journal-entries territory |

**⚠️ átkeretezés-mód:**
- **`imprest-system-explained`**: framing = "how the float-based system works **in practice**" — operations-focused. Tilos: journal-entry-mechanics, debit/credit, ledger-account-postings. Megengedett: "fixed float, replenish-when-low, the cash + receipts always equal the float" workflow-magyarázat.

#### Bucket 7 — Migration (4 ✅, all clean)

**Rationale:** **Switching-moment queries** — user éppen váltani készül egy rendszerről másikra. **Magas commercial intent**, transition-pain.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `corporate-card-switch-to-petty-cash` | `switch from corporate card petty cash` | ✅ Reverse-trend (legtöbben card-ra váltanak) |
| `quickbooks-petty-cash-migration` | `migrate quickbooks petty cash dedicated tool` | ✅ QB-sub-ledger → dedicated-tool flow |
| `csv-export-petty-cash-for-accountant` | `petty cash csv export accountant` | ✅ Workflow-handoff focus |
| `replace-paper-petty-cash-with-app` | `replace paper petty cash app` | ✅ ⚠️ Cannibalization-warning a `digital-petty-cash-book`-kal (lásd F.4 SERP-test) |

**⚠️ post-F.4-finding**: A 4. jelölt (`replace-paper-petty-cash-with-app`) overlap-ben van a `digital-petty-cash-book` és `digital-receipt-book` jelenlegi top-1-2 dominanciájával. Vagy KILL, vagy radically-different angle (pl. "30-day migration plan" step-by-step vs. a meglévő concept-pages).

#### Bucket 8 — Seasonal (3 ⚠️ + 1 ❌ + 1 ❌)

**Rationale:** **Time-of-year queries** — Q4 audit, year-end, new-year setup. Volume-spike specific időszakokban. **DE** mindegyik közeledik a tax/audit-territory-hoz, ezért 0 azonnali ✅.

| Slug | Target-keyword | Disposition + magyarázat |
|---|---|---|
| `petty-cash-year-end-checklist` | `petty cash year-end checklist` | ⚠️ Year-end → tax/audit territory pull |
| `petty-cash-q4-audit-prep` | `petty cash q4 audit preparation` | ⚠️ Audit territory pull |
| `petty-cash-setup-new-business` | `setup petty cash new small business` | ⚠️ "Starting a business" tax-territory pull |
| `petty-cash-tax-season-prep` | `petty cash tax season preparation` | ❌ Explicit tax pozicionálás |
| `petty-cash-for-nonprofit-charity` | `nonprofit petty cash management` | ❌ Donor-receipt jogi kockázat (501c3) |

**⚠️ átkeretezés-mód:**
- **`year-end-checklist`**: framing = "what to **gather and hand off to your bookkeeper** at year-end" (operations handoff). Tilos: tax-deductions, write-offs, year-end-tax-prep. Megengedett: reconciliation-checklist, receipt-archive-export, custodian-handover-if-changing.
- **`q4-audit-prep`**: framing = "**internal Q4 reconciliation**" (cleanup before bookkeeper review). Tilos: external-audit-prep, IRS-audit, tax-audit. Megengedett: "your own monthly/quarterly self-check before you hand over to anyone".
- **`setup-new-business`**: framing = "**first 30 days of cash tracking**" — operations-only. Tilos: business-registration, EIN, sales-tax-setup, business-license. Megengedett: "you've opened the doors, here's how to start tracking petty cash from day 1".

### F.3.B Top 5 priority quick-win — full ranking (post-2026-05-15 SERP-validation queue)

A 36 ✅-ből risk-adjusted impact-szerint sorba rendezve (HIGH-impact + LOW-risk + low-competitive):

| # | Slug | Bucket | Indok |
|---|---|---|---|
| **1** | `petty-cash-for-salon` | Industry | Very cash-heavy, low SaaS competition, clear pain-point, magas regional-search-volume |
| **2** | `petty-cash-for-daycare` | Industry | Cash-heavy, parents pay cash for events/snacks/extras, recurring intent |
| **3** | `petty-cash-for-auto-repair-shop` | Industry | Cash-heavy (parts-runners), older-demographic less-likely-to-use-card |
| **4** | `expensify-vs-spendnote-petty-cash` | Comparison | Magas commercial intent, active comparison-mode |
| **5** | `petty-cash-custodian-quitting` | Pain | Transition-pain, **HIGH conversion** intent (crisis-moment) |

**6-10**: `petty-cash-receipt-missing` (Pain), `quickbooks-petty-cash-alternative` (Comparison), `petty-cash-for-coffee-shop` (Industry), `petty-cash-for-food-truck` (Industry), `when-to-replenish-petty-cash` (Workflow).

### F.3.C ⚠️ átkeretezés-mód összegzés (12 jelölt)

| Bucket | Jelölt | Átkeretezés egy-mondatban |
|---|---|---|
| Role | `bookkeeper-role` | "What your bookkeeper expects from you" — operations-side, NO journal entries |
| Role | `hr-manager-role` | "Office cash for incidentals" — NOT employee advances/payroll |
| Use-case | `client-gifts` | "Track the spend, your accountant categorizes" — NO gift-tax-limits |
| Pain | `balance-vs-ledger-mismatch` | KILL vagy MERGE meglévő `petty-cash-does-not-balance`-szal |
| Comparison | `pleo-vs-spendnote` | "Focused tool vs all-in-one platform" — honest scope-comparison |
| Comparison | `wave-vs-spendnote` | Ugyanaz framing |
| Comparison | `freshbooks-vs-spendnote` | Ugyanaz framing |
| Workflow | `imprest-system-explained` | "How the float-based system works in practice" — NO journal mechanics |
| Migration | `replace-paper-with-app` | KILL vagy radically-different angle (cannibalization F.4 alapján) |
| Seasonal | `year-end-checklist` | "What to hand off to your bookkeeper at year-end" — NO tax-deductions |
| Seasonal | `q4-audit-prep` | "Internal Q4 reconciliation" — NO external/tax audit |
| Seasonal | `setup-new-business` | "First 30 days of cash tracking" — NO business-registration |

### F.3.D ❌ SKIP-jelöltek + indok (5 jelölt)

| Jelölt | SKIP-indok | Mit lehetne csinálni helyette |
|---|---|---|
| `petty-cash-stolen-what-to-do` | Police/insurance/legal territory | Esetleg `petty-cash-security-tips`-en (létező TIER A-near) egy "If theft is suspected" sub-section, prevention-focus |
| `petty-cash-accounting-entries` | GAAP/journal-entries territory | NOTHING — ez tisztán accountant-territory |
| `petty-cash-tax-season-prep` | Explicit tax pozicionálás | Az `year-end-checklist` átkeretezés (lásd F.3.C) közelebbről lefedi az op-side-ot |
| `mint-vs-spendnote` | Mint shutdown 2024 + personal-vs-business intent-mismatch | Ha valaha hasonló jön → frame: "from personal-finance app to business cash log" |
| `petty-cash-for-nonprofit-charity` | Donor-receipt jogi kockázat (501c3-rules) | NOTHING — túl-szabályozott terület, jogi-tanácsadás-szükség |

### F.3.E Methodology-tanulság (2026-05-02 02:10 felhasználói pushback)

**A felhasználói pushback ("a korábbi ötleteidet elmentetted már?") mutatott rá hogy a F.3 dokumentáció hiányos volt:**

- **Mit mentettem ✓**: jelölt-nevek + disposition (✅/⚠️/❌)
- **Mit NEM mentettem ✗**: bucket-rationale, target-keyword, ⚠️-átkeretezés-mód, ❌-indok, priority-ranking
- **F.3.A→F.3.D-vel pótolva**

**Új methodology-rule (F. policy-bővítés):** Minden brainstorm-session output **kötelezően tartalmazza**:
1. Bucket-onkénti rationale (miért ez a kategória?)
2. Jelöltenkénti target-keyword (mire céloz?)
3. Disposition + indok (✅/⚠️/❌ MIÉRT?)
4. ⚠️ esetén explicit átkeretezés-mód
5. Priority-ranking (top-N quick-win)

A "csak névsor" mentés **NEM elég** — egy hét múlva visszanézve nem fogom tudni ki miért került ✅ vagy ⚠️ alá.

### F.4 Felhasználói extra-brainstorm 4 új bucket — 2026-05-02 01:50 (vita-/félreértés-elkerülés + everyday vocab + spreadsheet + carbonless paper)

**Felhasználói felvetés:** *"esetleg más szavakat vagy más megközelítést mit használhatnánk. egyrészt az igazoás kp kiadásról vagy igazolás kb átvételről, a viták vagy a félreértések elkerülése miatt. vagy más hétköznapi szavak használata mint money vagy mittudomén mit használnak amerikában... nem csak excellel hasonlítanám hanem google sheettel is... olyasmivel ami hétköznapi, carbonless nyugtatömbbel..."*

**4 új angle-bucket azonosítva** (F. compliance-border-check átfutva, 24/24 jelölt clean):

- **Bucket 9 — Dispute prevention / proof framing** (7 jelölt: `proof-of-cash-handover`, `avoid-petty-cash-disputes`, `did-i-give-him-the-money`, `cash-payment-without-witness`, `proof-i-paid-the-contractor-cash`, `proof-i-paid-the-employee-cash`, `cash-receipt-template-prevent-disputes`)
- **Bucket 10 — Everyday/colloquial vocabulary** (5 jelölt: `office-money-tracker`, `track-office-money-app`, `simple-money-tracking-small-team`, `company-cash-log-app`, `office-money-box-tracker`)
- **Bucket 11 — Spreadsheet expansion (Google Sheets / Numbers / Notion / Airtable)** (4 jelölt: `petty-cash-google-sheets-vs-app`, `petty-cash-spreadsheet-vs-app` umbrella, `airtable-petty-cash-vs-spendnote`, `notion-petty-cash-tracker-vs-app`)
- **Bucket 12 — Physical/analog alternatives (carbonless receipt books, paper logs)** (4 jelölt: `carbonless-receipt-book-vs-app`, `digitize-paper-cash-log`, `paper-petty-cash-log-vs-app`, `triplicate-receipt-book-vs-app`)

**Lay-vocabulary blacklist (Bucket 10 melléktermék — F.-policy bővítés):** `slush fund` (corruption), `walking-around money` (US political bribery), `off the books cash` (tax-evasion), `under the table` (illegal payment), `kickback` (bribery), `cash on hand` (banking/accounting term — F.-tilos territory).

#### F.4.A Élő SERP-validation 10 query-n (2026-05-02 01:55, WebSearch-tool)

A 4 bucket-ből 8 prioritált query + 2 bonus pain-trigger query lefuttatva. Eredmények:

**MI MÁR DOMINÁLUNK 7/10 query-n (TOP 1 vagy TOP 5):**

| Query | Top eredmény | SpendNote helyezés | Bucket |
|---|---|---|---|
| `petty cash google sheets template alternative app` | **`spendnote.app/index.html`** | **TOP 1** | 11 |
| `notion petty cash template tracker` | Notion templates × 4 | **TOP 5** (`petty-cash-log-template`) | 11 |
| `carbonless receipt book vs app digital alternative` | **`spendnote.app/digital-receipt-book`** | **TOP 1** | 12 |
| `replace paper petty cash receipt book digital` | 4/5 SpendNote-oldal a top 5-ben! | TOP 1+2+3+5 | 12 |
| `paper petty cash log book alternative small office` | **`spendnote.app/petty-cash-log-template`** | **TOP 1** | 12 |
| `how to avoid disputes over petty cash small team` | beancount.io | **TOP 2 + TOP 3** (`security-tips` + `how-to-manage-pcsb`) | 9 |
| `how to prove cash payment to employee no receipt` | findlaw.com (legal) | **TOP 2** (`payroll-cash-receipt`) | bonus 9 |

**F.-tilos area 1/10:**

| Query | SERP top-5 | Diagnózis |
|---|---|---|
| `proof of cash payment without receipt small business 2026` | beancount, AOL-IRS, Torrington-IRS, sparkreceipt-IRS | **F.-tilos**: IRS/tax-territory dominál — auto-SKIP |

**SaaS-fal / brand-confusion 2/10:**

| Query | SERP top-5 | Diagnózis |
|---|---|---|
| `office money tracker app small business` | FreshBooks, CNBC, Expensify, Reddit, Wave | SaaS-óriás verseny — SKIP (közvetlen FreshBooks/Expensify-fal) |
| `track company cash app simple` | Cash.app × 4, digitalcitizen | **Brand-confusion**: Cash App (Square brand) dominál — SKIP |

#### F.4.B 4 kulcs-felfedezés ami megváltoztatja a stratégiát

**1. NE új landing Bucket 11/12-re — már TOP 1-en vagyunk.** Egy új `petty-cash-google-sheets-vs-app` vagy `carbonless-receipt-book-vs-app` landing **content-cannibalize-elne** a meglévő dominanciával. **Helyette: meglévő oldalak augmentation** post-2026-05-15-en (lásd F.4.C hibrid-koncepció).

**2. Bucket 9 már lefedve, DE noindex-paradox.** A `how to avoid disputes over petty cash` query-n MÁR TOP 2-3-ban vagyunk, **DE** a `how-to-manage-petty-cash-small-business` **noindex**! Tipikus Bing-discovery-pattern (mint 04-29-i F.2.J `how much petty cash should i keep` TOP 1 felfedezés). **Action**: 2026-05-15-i checkpoint-on újra-megfontolni a noindex-státuszát.

**3. Bucket 10 (everyday vocabulary) — DEAD-END.** A "money" + "company" + "office" terminológia túlságosan brand/SaaS/personal-finance-territory-szennyezett. **NE menjünk ide.** Vocabulary-blacklist tovább bővítve (lásd F.4.A vége).

**4. TIER A disclaimer bizonyítottan működik.** A `payroll-cash-receipt` TOP 2-ben van legal-authority-falon (FindLaw, SetarehLaw, JustAnswer) — Google érti hogy mi NEM legal-tool vagyunk a multilayered disclaimer miatt. **Retroaktív validáció** a 2026-05-02 hardening döntésnek (commit `a3ef5cf`).

#### F.4.C Hibrid-koncepció (C kontingens output) — `digital-receipt-book.html` augmentation

A SERP-evidence alapján **NEM új landing**, hanem **a meglévő `digital-receipt-book.html` augmentation** egy új H2-vel ami a 4-bucket query-tért lefedi (Bucket 9 disputes + 10 office-cash light vocab + 11 spreadsheet + 12 carbonless paper):

**Új H2 javaslat (post-2026-05-15 implementation):** "Why a Paper Receipt Book or Spreadsheet Won't Prevent Cash Disputes"

```
Lead: When two people agree on a cash handover, the question isn't
"did the money change hands?" — it's "can we prove it tomorrow, next
month, or two years from now?" A paper receipt book sits in one
drawer. A Google Sheet lives in one person's account. Neither one is
what you reach for when a partner says "I never got that money."

Sub-headers:
1. The carbonless receipt book — "instant, but bound to one place"
2. The Excel or Google Sheet — "everyone edits, no one signs"
3. The 'I'll text you the receipt' workflow — "until somebody loses
   the thread"

Closing: SpendNote = a third option. Printable+signed PDF receipt
with a unique ID. Searchable years later. Plus TIER A disclaimer:
"Not a credit note, payslip, or accounting record."
```

#### F.4.D Backlog — 1 valós új landing-jelölt (post-2026-05-15)

**`notion-petty-cash-vs-app`** — egyetlen jelölt ami **valós new-landing-potenciálú**:
- A `notion petty cash template tracker` query-n MI MÁR TOP 5-ben vagyunk (`petty-cash-log-template`)
- Top 4 mind Notion native template (Daily Petty Cash, community templates)
- NINCS SaaS-óriás a top 5-ben
- Notion-user audience tech-forward, magas conversion-intent
- **Realisztikus pos 3-5** dedikált landinggel
- **F.-policy clean** (no tax/legal angle, pure tool-comparison)

**Trigger feltétel a 2026-05-15 checkpoint-on:** ha a `petty-cash-log-template` Bing-en stabilan rangsorol és Google-on is impressziókat kap a Notion-relevant query-kre, akkor `notion-petty-cash-vs-app.html` mehet a post-checkpoint listára.

#### F.4.E Konzekvencia összefoglaló

A 4 új bucket × 20 jelölt × 10 SERP-test eredménye:

- **0 azonnali új landing** szükséges (moratórium-szellemű)
- **1 hibrid-augmentation** kandidatúra: `digital-receipt-book.html` új H2 (post-2026-05-15)
- **1 new-landing kandidatúra**: `notion-petty-cash-vs-app.html` (post-2026-05-15, trigger-feltételes)
- **1 noindex-revision kandidatúra**: `how-to-manage-petty-cash-small-business.html` (post-2026-05-15, ha bevált a Bing-discovery-pattern)
- **Vocabulary blacklist bővítve** 6 új tételle (a F. policy-be permanently)

**Stratégiai tanulság**: A felhasználói brainstorm-pushback ("more vocabulary, more angles") gyakran megerősíti, hogy **MÁR jobban lefedjük a területet, mint ahogy a saját self-assessment alapján gondoltuk**. A `petty-cash` cluster mély és széles, és a Bing-discovery-pattern (`how much petty cash should i keep` 04-29-en, `how to avoid disputes` 05-02-én) azt mutatja, hogy a **GSC-data 4-8 hetes lag-je miatt nem látjuk reálisan, mi rangsorol már most**. SERP-evidence > GSC-export.

#### F.4.F Methodology-revision — a SERP-test értéke aszimmetrikus (2026-05-02 02:16 felhasználói pushback)

**Felhasználói pushback (2026-05-02 02:02):** *"ezt nem értem, ha ilyen jó helyeken vagyunk, akkor miért nem kattint senki????"* — kiderült hogy a "MI MÁR DOMINÁLUNK 7/10 query-n" claim **WebSearch-tool-eredményen alapul**, ami **nem feltétlenül egyezik a Google US ranking-jével**. A claim ellentmond a klikk-adatok hiányának.

**Felhasználói filozófia (2026-05-02 02:16):** *"egyelőre elég az az ellenőrzés amit csinálsz, abból legalább azt megtudjuk hogy mivel nem szabad foglalkozzunk, hogy hova rangsorola google az tökmindegy, úgyse tudunk vele semmit csinálni, majd kiderül az export adatokból"* — pragmatikus átkeretezés: a SERP-test értékét nem dobjuk el, csak újra-pozicionáljuk.

**Új methodology-rule (F. policy-bővítés):** A SERP-test értéke **aszimmetrikus**:

| Evidence-típus | Megbízhatóság | Action-érték |
|---|---|---|
| **Negatív evidence** (F-tilos territory, SaaS-fal, brand-confusion) | **MEGBÍZHATÓ** akkor is, ha a tool nem Google — mert ezek a SERP-territory-pattern-ek minden search engine-n hasonlóak (IRS dominál tax-query-n Bing-en is, Cash App brand-name foglal "cash app"-keresést akárhol) | **Bizalom magas**: ezek a query-k **biztosan SKIP-elendők** |
| **Pozitív evidence** (TOP 1, TOP 5) | **PRELIMINARY** — Google US ranking-en lehet más, geo-personalization, AI Overview-effect, query-volume-faktor együttesen befolyásolják | **Csak hipotézis**: GSC-impression-data validálja vagy cáfolja |

**Konzekvencia:** A SERP-test **kiváló SKIP-szűrő** (negatív-side), és **csak gyenge promóter** (pozitív-side). Használat:

1. **F-policy-screening** (negatív): WebSearch-test ELÉG bizonyíték F-tilos jelölt SKIP-eléséhez
2. **Pozitív-claim validation**: WebSearch-test "TOP 1" eredménye **kiegészítendő** GSC-impression-data audit-tal mielőtt prioritás-ranking-be kerül
3. **Top-N priority-ranking**: a F.3.B "Top 5 quick-win" risk-tier-besorolásom **post-checkpoint újra-validálandó**

**Felhasználói filozófia mint alapelv:** *"hova rangsorol a google, az tökmindegy, úgyse tudunk vele semmit csinálni"* — amit nem tudunk befolyásolni, azzal **ne foglalkozzunk**. A figyelem a **befolyásolható dolgokra** koncentrálódik:
- Mit írunk meg (új landing, ahol nem-tilos)
- Mit nem írunk meg (F-tilos, SaaS-fal, brand-confusion)
- Mit augmentálunk (meglévő top-1 oldalak)
- Hogyan disclaimer-positionálunk (TIER A standard)

A pontos Google-ranking **kimenet, nem bemenet** — ezt majd GSC-export méri. **Methodology-prioritás**: SKIP-decisions > priority-rankings.

## H. Title-policy / honest-claims-rule — HARD RULE (felhasználói direktíva, 2026-05-02 03:00)

**Trigger:** A `petty-cash-how-much-to-keep` snippet-rewrite után audit derítette ki, hogy a 04-25-i `8a1efe2` commit **nem cleanup-olta végig** a "Free / Template / (Free) / Free checklist included" claim-eket — **6 oldalon** (4 indexed + 2 noindex) maradt félrevezető SERP-snippet ahol **nincs valós letölthető fájl**. A `petty-cash-replenishment-form` GSC pos=39.0 (impression van, klikk nincs) ennek a bait-and-switch trust-penalty-jának egyértelmű jele.

**HARD RULE:** A SERP snippet-ekben (title, meta description, og/twitter title/description, Article schema headline/description) **NEM SZEREPELHETNEK** az alábbi claim-szavak / -kifejezések, **HACSAK** az adott oldalon **NINCS valós letölthető artifact** (PDF, .xlsx, .docx, képfájl `<a download>`-link mögött):

| Tiltott szó / kifejezés | Mit jelent (Google SERP-ben) | Mit várnak el |
|---|---|---|
| **Free** (Free Template, Free Form, Free Guide, Free Checklist, Free PDF, Free Printable) | Ingyenes letölthető artifact most azonnal | Letölthető fájl `<a download>` linken |
| **Template** | Sablon-fájl (Excel, Word, PDF) letöltésre | Letölthető template fájl |
| **Sample** | Minta-dokumentum letöltésre | Letölthető minta fájl |
| **Checklist** ("Free checklist included") | Letölthető ellenőrző-lista | Letölthető PDF/print |
| **PDF** ("Free PDF", "PDF Download") | PDF-fájl letöltésre | Letölthető PDF link |
| **Form (Free)** / Form Download | Letölthető form fájl | Letölthető template/form |
| **Download** ("Download Now", "Free Download") | Bármilyen letölthető fájl | `<a download>`-link |
| **Printable** ("Free Printable", "Printable + Digital") | Print-ready PDF letöltésre | Letölthető print-PDF |

**Mit szabad ehelyett:** edukációs / how-to / process-explainer címek, melyek **a koncepciót / formátumot / mezőket / folyamatot** mutatják be. Példák a 2026-05-02-i 6-oldalas batch-fix-ből:

| ❌ Régi cím (bait-and-switch) | ✅ Új cím (honest, edukációs) |
|---|---|
| Free Petty Cash Voucher Template — Printable + Digital | Petty Cash Voucher — Format, Fields, How to Fill Out |
| Petty Cash Replenishment Request Form (Free) | Petty Cash Replenishment Request — Process and Approval |
| Cash Count Sheet Template — Count by Denomination | Cash Count Sheet — Denominations, Total, Reconcile |
| Daily Cash Report Template — End-of-Day Summary | Daily Cash Report — End-of-Day Summary for Small Teams |
| Petty Cash Log Template — Track Every Transaction | Petty Cash Log — Auto-Built from Every Receipt You Generate |
| (meta) "...Free checklist included." | (meta) "...add up the receipts, compare to the expected float, document any difference." |

**Miért HARD RULE (felhasználói policy-pillér):**

1. **Bait-and-switch trust-penalty:** Google a CTR-t és bounce-rate-et figyeli. Ha a felhasználó "Free Template"-re kattint és nem talál downloadot, **vissza-bouncel < 5 sec alatt** → **negatív SERP-signal** → degradálja a rankingot. (Pos=39.0 a `petty-cash-replenishment-form`-on ennek a hatásnak a manifesztációja.)

2. **Korábbi felhasználói intuíció megerősítve (04-25-i emlék):** *"a template szót szándékosan száműztük mindenhonnan mert akkor a 80dik oldalon landolunk"* — a memória részben pontatlan volt (valójában csak `petty-cash-policy-template.html` címét ürítettük ki 03-29-en), DE a **szándék helyes**: a tisztán "template" intent-fal ahol QuickBooks/Smartsheet/Microsoft/Vertex42/Wave Apps a top 10, oda nem kell forrásnak lennünk. Az F.3.D `❌ SKIP-jelöltek` listán (`petty-cash-template-excel`, `printable-petty-cash-receipt-pdf`, `cash-receipt-pdf-download`) ugyanez a logika.

3. **Kompetitor SERP-realitás:** A "Free Template / PDF / Download" kategória SERP-jét **letöltést kínáló oldalak** dominálják. Mi nem tudunk nekik felfutni a "letölthető fájl"-on (mert SaaS-konverziót akarunk, nem ingyenes Excel-template-et adunk), csak az **edukációs / process-content**-en, ahol kevésbé van fal.

4. **Konverziós kontextus:** SpendNote SaaS — a felhasználó-célunk **regisztráljon a digital alternative-re**, nem letöltse az Excel-t. A "template" traffic pontosan a **rossz intent**: aki Excel-template-et akar, az nem akar SaaS-előfizetést. Lásd F-policy `📋 BLACKLIST: használhatatlan-vocabulary` szekciót — ugyanez a logika title-szinten is érvényes.

**Audit-checklist (jövőbeli új oldal előtt, KÖTELEZŐ):**
- [ ] Nincs "Free / Template / Sample / Checklist / PDF / Download / Printable / Form (Free)" a `<title>`-ben?
- [ ] Nincs ugyanezekből a `<meta name="description">`-ben?
- [ ] Nincs ugyanezekből az `og:title` / `twitter:title`-ben?
- [ ] Nincs ugyanezekből az `og:description` / `twitter:description`-ben?
- [ ] Nincs ugyanezekből az `Article` schema `headline` / `description`-ben?
- [ ] Ha mégis VAN ilyen szó, **TÉNYLEGESEN VAN-E `<a href="..." download>` letölthető fájl** az oldalon?

**Kivétel — ami ENGEDÉLYEZETT:**

- **"Free 14-day trial" / "Free trial" / "Free for 14 days"** — pontos állítás az app-trial-ról. Megengedett a hero-pricing-note-ban, body-content-ben, CTA-ban. **DE NEM** a `<title>`-ben, **NEM** a `meta description`-ben, **NEM** az `og:title` / `twitter:title`-ben (mert ott a "Free" szó SERP-snippet kontextusban a letölthető-template-et asszociál a felhasználó számára, nem a 14-napos próbát).
- **`petty-cash-policy-template.html`** filename — a 03-29-i refaktor óta a `<title>` "Petty Cash Policy" és NEM tartalmazza a "template" szót. A filename-ben benne maradt URL-stabilitás miatt (canonical, GSC-history). **Ez OK.**

**Audit-státusz (2026-05-02 03:00):**
- ✅ **Indexed bait-and-switch oldalak (4):** mind javítva (`petty-cash-replenishment-form`, `petty-cash-reconciliation`, `cash-count-sheet-template`, `daily-cash-report-template`).
- ✅ **Noindex bait-and-switch oldalak (2):** mind javítva preventívan (`petty-cash-voucher-template`, `petty-cash-log-template`) — ha valaha visszaindexáljuk őket, már honest-claims állapotban lesznek.
- ✅ **Sitemap `<lastmod>`** frissítve mind a 4 indexed URL-en `2026-05-02`-re.
- ✅ **Schema `dateModified`** frissítve mind a 6 fájlban `2026-05-02` / `2026-05-02T03:00:00+00:00`-ra.
- ✅ **JSON-LD validation:** 12/12 blokk valid (Article + FAQPage mindegyikben).

**Methodology-konzekvencia:** A 04-25-i 8a1efe2 commit-tanulság — a "trust-fix sweep"-ek **ne csak `<title>`-t és heading-et** módosítsanak, hanem **a teljes head-block-ot** (meta description + og/twitter + schema). Az audit-checklist ezt a hiányt zárja ki a jövőre nézve.

## I. Apposing pilot Phase 1 — page-type conversion hipotézis-teszt (2026-05-02 21:30, ChatGPT Codex-strategy session után)

**Kontextus:** A felhasználó megosztott egy ChatGPT Codex-szel folytatott multi-turn SEO-strategy-session-t. A közös konklúzió: **page-type conversion** — a SpendNote-oldalak Google szemében inkább "Article"-ok mint "SoftwareApplication landing"-ek, ezért a Google "content site"-ként, nem "tool-first" oldalként olvas. Ez magyarázhatja, miért nem kapunk áttörést "petty cash app" intent-query-kre, holott Bing már TOP 1-3-ban rangsorolja a `/petty-cash-app`-ot.

**Codex-javaslatok kritikai szűrése (mit fogadtunk el, mit nem):**

| Codex-javaslat | Verdict | Indok |
|---|---|---|
| `SoftwareApplication` schema bővítés a tool-intent oldalakra | ✅ ELFOGADVA | Low-risk, high-signal. A `/petty-cash-app` 05-01-i sprint-ben már megkapta. |
| Additív "tool-page" blokkok (Switch Trigger Score, Owner-Away Scenario, Receipt-Only vs Full Handoff Record) | ✅ ELFOGADVA | Új URL nélkül, edukációs/process-content marad, de explicit tool-action framing. |
| Hero H1-rewrite a `/petty-cash-app-vs-excel`-en ("When to Switch (and Why Teams Do)") | ✅ ELFOGADVA (felhasználói B-választás) | Kockázat (CTR-csökkenés a "vs excel" exact-match query-n), de a tool-intent stronger signal a comparison-cikk-jelleg helyett. **Ez a hipotézis-teszt központi vállalása.** |
| Új URL-cluster (`/petty-cash-software`, `/petty-cash-tracker-app`, `/petty-cash-management-tool`, `/petty-cash-log-app`) | ❌ ELUTASÍTVA | Felhasználói intuíció: *"már sokszorosan le vannak uralva a nagy szoftvercégek által, nekem valami olyan rés kell ahhol előre is tudok jutni"*. Konzisztens a F.4.A Bing-evidence-szel (QuickBooks/Smartsheet/Microsoft fal). |
| `/expensify-vs-spendnote-petty-cash` comparison oldal | ❌ ELUTASÍTVA | Trademark-rizikó kis brand-nek + Expensify nem direct competitor petty-cash-en. |
| External entity validation (product directories, "alternative to X" mentions, backlink-szerzés) | ❌ ELUTASÍTVA | Ütközik a `## E. Csatorna-stratégia` policy-vel: *"NINCS IDEJE Reddit-postingra, Product Hunt-launchra, B2B outreach-re"*. |
| 8-oldalas batch-rewrite mind a 8 prio-oldalon | ❌ ELUTASÍTVA | Lavina-effect kockázat + moratórium. **Pilot kell:** 3 oldal először, mérés a 2026-05-15 checkpoint-on. |
| Codex-vocabulary: "audit trail", "evidence trail", "governance", "immutable history", "user-attributed entry" | ⚠️ ÁTKERETEZVE | Túl-formalizálva → auditor/compliance-vibe (F. policy ütközés). Csere: "transaction history", "linked receipt", "review routine", "full transaction log", "who-recorded entry". *Megjegyzés: a meglévő szövegekben már van több "audit trail" használat technical-context-ben (Excel limitation vs App feature) — ezek MARADNAK, mert nem accounting-kontextusban vannak. Csak az ÚJ Codex-szövegekben kerüljük.* |
| Internal-link anchor diverzifikáció (Codex utolsó megjegyzése) | ✅ ELFOGADVA | Ne mind `petty cash app` exact-match anchor legyen. Új blokkokban: "See live cash balances from any device", "Track every handoff in one searchable place". |

**Phase 1 scope (3 oldal, additív bővítés):**

| Oldal | Mit kap | Kockázat |
|---|---|---|
| `/petty-cash-app-vs-excel` | + `SoftwareApplication` schema + Hero H1+subhead rewrite + Switch Trigger Score blokk (`<h2>` Side-by-Side után) | **KÖZEPES** — H1-rewrite kockázat (CTR-érzékeny exact-match query). Ez a core-hipotézis-teszt. |
| `/manage-petty-cash-remotely` | + `SoftwareApplication` schema + Owner-Away Scenario blokk (`<h2>` CTA után, "When Remote Management Matters Most" előtt) | **ALACSONY** — H1 érintetlen, csak additív. |
| `/cash-handoff-receipt` | + `SoftwareApplication` schema + Receipt-Only vs Full Handoff Record blokk (`<h2>` "Digital vs Paper" után, "Also see" előtt) | **ALACSONY** — H1 érintetlen, csak additív. |

**Mit NEM nyúltunk Phase 1-ben (szándékosan):**
- ❌ `/petty-cash-app` (a 05-01-i sprint hatását mérnünk kell, nincs duplázás)
- ❌ Hero/H1 a 2 low-risk oldalon (`/manage-petty-cash-remotely`, `/cash-handoff-receipt`)
- ❌ Új URL-ek
- ❌ A maradék 5 prio-oldal a Codex-listájáról (`/petty-cash-does-not-balance`, `/petty-cash-receipt-generator`, `/cash-payment-received-proof`, `/petty-cash-reconciliation`, plus a Codex P3 ajánlások)
- ❌ Meglévő `<title>`/meta description-ök (kontent-friss SERP-snippet-érzékeny → moratórium logika)
- ❌ Meglévő "audit trail"/"accountability" szóhasználat a `/petty-cash-app-vs-excel` body-ban (technical-context-ben helyén van)

**Hipotézis (pilot success criteria a 2026-05-15 checkpoint-on):**

1. **Core test (`/petty-cash-app-vs-excel`):** A `SoftwareApplication` schema + tool-intent H1 megemeli-e a `petty cash app vs excel` query-pos-t **vagy** új query-cluster-eken (pl. `petty cash app vs spreadsheet`, `when to switch from excel to app`) megjelenik-e új impression-flow?
   - **Sikeres**: pos megőrzve VAGY javítva + új query-cluster-impression
   - **Bukott**: pos-csökkenés a régi exact-match query-n + nincs új cluster-impression
2. **Low-risk test (`/manage-petty-cash-remotely`, `/cash-handoff-receipt`):** A `SoftwareApplication` schema + új H2-blokk megemeli-e ezeket az oldalakat olyan query-clusterekre amik tool-jelleget keresnek (pl. `cash app for office manager`, `track cash handoff online`)?
   - **Sikeres**: új impression-flow VAGY pos-emelkedés meglévő query-ken
   - **Bukott**: nincs változás vagy pos-csökkenés

**Kill criteria (Phase 2 NEM indul, ha):**
- A `/petty-cash-app-vs-excel` core query (`petty cash app vs excel`) pos-csökken **>5 hely** a 2026-05-15-i checkpoint-ra → H1-rewrite hipotézis bukott, **rollback szükséges** (a régi H1-re vissza).
- Egyik oldalon sincs új query-cluster-impression → "page-type conversion" hipotézis nem reprodukál, **NE skálázzunk** a maradék 5 oldalra.

**Go criteria (Phase 2 indulhat, ha):**
- Legalább 1/3 oldalon mérhető pos-emelkedés vagy új query-cluster-megjelenés → skálázás a Codex P2-3 oldalakra (`/petty-cash-does-not-balance`, `/petty-cash-receipt-generator`, `/cash-payment-received-proof`, `/petty-cash-reconciliation`).

**Anchor-text diverzifikáció (Codex utolsó megjegyzés alapján — F.policy bővítés):**

Az új tool-intent blokkok internal-link anchor-szövegei **NEM lehetnek** mind exact-match `petty cash app`. Helyette: action-driven vagy benefit-driven anchor-ok. Pl. ami most bekerült:
- "See live cash balances from any device" (manage-remotely → /petty-cash-app)
- "Track every handoff in one searchable place" (cash-handoff → /petty-cash-app)
- "Record cash handoffs online" (példa jövőbeli use-case-re)
- "Track your first cash box" (példa jövőbeli use-case-re)

**Implementáció-státusz (2026-05-02 21:30):**
- ✅ 3 oldal SoftwareApplication schema beillesztve (másolva a `/petty-cash-app`-ról, URL/description/featureList page-specifikusra adaptálva)
- ✅ 3 oldal dateModified frissítve `2026-05-02T19:30:00+00:00`-ra
- ✅ 3 oldal sitemap `<lastmod>` frissítve `2026-05-02`-re
- ✅ 1 hero H1+subhead rewrite (vs-excel)
- ✅ 3 új H2-blokk beillesztve (Switch Trigger Score, Owner-Away Scenario, Receipt-Only vs Full Handoff Record)
- ✅ Anchor-text diverzifikáció (a 2 új /petty-cash-app-link különböző natural anchor-rel)
- ✅ JSON-LD validation: **9/9 blokk valid** (3 oldal × Article + SoftwareApplication + FAQPage)

**Update (2026-05-02 21:45) — Codex follow-up: schema page-specifikusra cserélve:**

Codex küldött részletes javaslatokat a 3 oldal pontos schema-jára. Két szakmai eltérés volt az általam beillesztett schemától:

1. **`applicationSubCategory`** — Codex page-specifikus értékeket használ (`"Remote Petty Cash Tracking"`, `"Cash Handoff Recording"`), én konzisztens `"Petty Cash Management"`-et használtam mind a 3 oldalon.
2. **`featureList`** — Codex page-fókuszú 5-elemes listákat használ (csak az adott oldal use-case-ére releváns feature-ök), én az app teljes 7-8 elemes funkciólistáját toldottam be minden oldalra.

**Szakmai értékelés:** A page-specifikus megoldás jobb URL-szintű intent-relevance-re (a Google érti, hogy az ADOTT URL milyen specifikus use-case-t fed le), és az entity-konzisztencia ettől nem csökken (mert `name`/`alternateName`/`applicationCategory`/`creator`/`publisher` mindenhol "SpendNote"). A redundáns featureList gyengébb URL-szintű signal volt.

**Csere implementálva mind a 3 oldalon (Codex közvetlen 2 javaslat + 1 oldalra magamtól page-specifikus):**

| Oldal | `applicationSubCategory` | `featureList` (5 elem) |
|---|---|---|
| `/petty-cash-app-vs-excel` | "Petty Cash Tracking (Spreadsheet Replacement)" | Auto-balance / Receipt per transaction / Timestamped log / Multi-cash-box / Role-based access (mind Excel-replacement-fókuszú) |
| `/manage-petty-cash-remotely` | "Remote Petty Cash Tracking" | View balance remotely / Review by user-time / Open linked receipts / Track multiple boxes / Use from any device |
| `/cash-handoff-receipt` | "Cash Handoff Recording" | Record handoff in real time / Link receipt proof / Track who-when / Running balance impact / Printable/shareable records |

**Methodology-bővítés (F.policy):** A `SoftwareApplication` schemák jövőben **page-specifikus `applicationSubCategory` + `description` + `featureList`** szerkezetűek legyenek (csak a `name` / `alternateName` / `applicationCategory` / `creator` / `publisher` / `offers` konzisztens). Ez maximalizálja az URL-szintű intent-relevance-t és megőrzi az entity-konzisztenciát.

**JSON-LD re-validation Codex-csere után:** **9/9 blokk valid** (változatlan).

**Következő mérési pont:** 2026-05-15 GSC Pages → Queries audit a 3 érintett URL-en. A kill/go criteria-t ott alkalmazzuk.

## J. Codex fórum-research (2026-05-03 00:00) — pain-language insights + post-checkpoint backlog

**Trigger:** Codex fórum/Reddit kutatást végzett a SpendNote target-audience nyelvéről. Kulcsmegfigyelése: az emberek **nem** "petty cash app"-pal beszélnek, hanem **fájdalom-nyelven**.

### J.1 5 user-segment azonosítva (Codex listája + Compliance-border check)

| Segment | Fájdalom | Compliance-border kockázat |
|---|---|---|
| **Nonprofit treasurer / event organizer** | volunteers, cash donations, envelopes, two-person count, missing receipts | ⚠️ **MAGAS** — donor receipts (IRS $250 rule, Form 990, Charity Commission filings) territory. Lásd F.3.D SKIP-jelöltek. |
| **Restaurant / bar / café manager** | safe cash, drawer transfers, staff payouts, short drawer, "who touched the cash" | ⚠️ **KÖZEPES** — tip-pool / wage-deduction / FLSA US labor law territory **TILOS** (új F-policy bővítés). De a tisztán operational cash-tracking része OK. |
| **Bookkeeper / office manager kis cégeknél** | hó végén crumpled receipts, owner/client nem dokumentál semmit, QuickBooks-ba csak utólag kerül be | ✅ **ALACSONY** — ez a SpendNote core-segment-je. |
| **Multi-location small operator** | nincs ott fizikailag, de látni akarja, kinél van a cash | ✅ **ALACSONY** — `/manage-petty-cash-remotely` Apposing Phase 1 oldal pontosan ezt fedi. |
| **(Emergent) Small office with shared envelope/log** | "fat envelope of crumpled receipts", "we use a paper log/register and it sucks" | ✅ **ALACSONY** — F.4 Bucket 12 (carbonless paper) + Bucket 11 (spreadsheet) wedge. |

### J.2 Pain-language vocabulary — új resource a F-policy-be

A Codex fórum-research alapján gyűjtött **8 fájdalom-kifejezés** (használható post-checkpoint copy-tweak-eken, hero/CTA-ban, body-content-ben — de ÚJ landing-en is mint H1/H2/intro):

| Fájdalom-kifejezés | Forrás-kontextus | Megengedett használat |
|---|---|---|
| "short a drawer" / "short drawer" | restaurant/bar POS-threadek | OK — operational cash-discrepancy nyelve |
| "missing receipts" | smallbusiness threads | OK — már sokszor használjuk |
| "fat envelope of crumpled receipts" | bookkeeping kontextus | OK — colorful, memorable, non-formal |
| "who handled the cash?" / "who took that $80?" | dispute kontextus | OK — már használjuk a /cash-handoff-receipt új blokkban |
| "employees don't upload receipts" | smallbusiness reconcile-frustráció | OK — empathy-driven |
| "how do I reconcile petty cash?" | bookkeeping how-to | OK — már van /petty-cash-reconciliation |
| "cash came from events / volunteers / drawers" | nonprofit/restaurant kontextus | ⚠️ "volunteers" — donor-receipt territory közelében; használat csak operational kontextusban |
| "we use a paper log/register and it sucks" | bookkeeping migration-pain | OK — F.4 Bucket 11 (spreadsheet) + Bucket 12 (paper) wedge |

### J.3 Pain-language hero/CTA copy-fragments (post-checkpoint use, NEM most)

Codex 4 konkrét copy-mondatot javasolt — ezek **NEM kerülnek be most** (moratórium + Apposing-mérés-noise), de **2026-05-15 utáni copy-tweak backlog-ban**:

- "Stop chasing cash receipts at month-end."
- "Know who has the cash before month-end."
- "No more chasing staff for missing petty cash slips."
- "Record cash in/out with a receipt before it disappears into a drawer."
- "For teams that still use envelopes, cash boxes, and paper logs."

**Hova illeszthető (post-checkpoint, ha Apposing Phase 1 sikeres):**
- `/petty-cash-app` hero subhead — pain-language reframing
- `/cash-handoff-receipt` H2 vagy intro — "Stop chasing cash receipts at month-end" anchor
- `/petty-cash-app-vs-excel` — esetleges Phase 2 H1-finomítás (DE csak ha a Phase 1 H1-rewrite mérhetően jó)
- Új landing-ek H1/intro-jában

### J.4 3 nyelvi klaszter post-checkpoint backlog (gap-analízis)

A Codex 3 nyelvi klasztert javasol — összevetés a meglévő oldalakkal:

| Codex-cluster | Meglévő coverage | Post-checkpoint action |
|---|---|---|
| **cash handoff log** | ✅ MÁR VAN: `/cash-handoff-receipt` (Apposing Phase 1) | Csak copy-tweak (pain-language vocab) — NEM új landing |
| **petty cash receipt for employee** | ⚠️ Részleges: `/petty-cash-receipt-generator` (general), `/employee-cash-advance-receipt` (advance-specifikus). HIÁNYZIK: dedikált "petty cash receipt for employee expenses" landing. | Megfontolandó új landing post-checkpoint, de SERP-validation szükséges előbb (lásd F.4.F: pozitív evidence = preliminary) |
| **cash drawer / safe cash tracking** | ⚠️ Részleges: `/cash-drawer-reconciliation` (általános), `/cash-discrepancy-between-shifts` (shift-specifikus). HIÁNYZIK: "safe cash tracking", "drawer transfers", "shift handoff cash" konkrét query-targeting. | Új vertikum-wedge — restaurant/bar/café (ld. J.5) |

### J.5 Restaurant/bar/café wedge — új vertikum (post-checkpoint kandidát)

**Codex erős insight:** ToastPOS (és más POS-ok) **nem kezelik** a petty cash / safe cash / drawer transfer problémát. Ez **konkrét piaci rés**.

**Potenciális query-cluster (post-checkpoint SERP-validation szükséges):**
- `cash drawer chaos restaurant`
- `safe cash tracking bar`
- `shift handoff cash log`
- `drawer transfers small restaurant`
- `cash in cash out bar staff`

**Kapcsolódó meglévő oldal:** `/petty-cash-for-restaurant-manager` — F.3 brainstorm jelölt, eddig nem implementáltuk. Ha post-checkpoint zöld jel jön, ez a wedge belépő.

**F-policy bővítés (J.5 melléktermék) — TILOS-territory tovább specifikálva:**
- ❌ `tip pool tracking` / `tip-out distribution` / `pooled tip records` — FLSA tip-credit / state-level tip-pooling rules (US labor law)
- ❌ `wage deduction for cash shortage` / `register short pay deduction` — tilos sok államban (CA, NY); employee misclassification kockázat
- ❌ `cash advance loan to employee` (mint loan, kamattal) — payday-lending regulatory territory
- ✅ MEGENGEDETT: `cash advance receipt` (mint operational document), `cash drawer reconciliation` (operational), `shift cash handoff` (operational), `safe cash tracking` (operational, no-payment-decision)

### J.6 Validáció a meglévő F.-stratégiánkkal

**Codex megerősíti** (nincs új cselekvés szükséges):
- F.4 Bucket 9 (Dispute prevention): pain-vocabulary átfedés erős
- F.4 Bucket 11 (Spreadsheet) + Bucket 12 (Carbonless paper): "paper log/register that sucks" pontos megerősítés
- ## E. Csatorna-stratégia: "Reddit nem szabad direkt-promo-postolással berontani"
- ## F. Compliance-border: óvatosság nonprofit/charity territory-n
- ## I. Apposing Phase 1: `/cash-handoff-receipt` Receipt-Only vs Full Handoff Record blokk pontosan a Codex "shared cash handoff log" wedge-jét fedi

**Codex kiegészít** (új resource a F-policy-be):
- 8 pain-language fájdalom-kifejezés (J.2)
- 4 hero/CTA copy-fragment post-checkpoint-ra (J.3)
- Restaurant/bar/café wedge mint új vertikum (J.5)
- TILOS-territory kibővítve: tip-pool, wage-deduction, cash-advance-loan (J.5)

### J.7 Post-checkpoint action-plan (2026-05-15 utánra, sorrendben)

**Step 1 — Apposing Phase 1 mérés (2026-05-15):**
- GSC Pages → Queries audit a 3 érintett URL-en
- Kill/go criteria alkalmazása (ld. ## I.)
- Ha bukott: rollback `/petty-cash-app-vs-excel` H1-en, J.2-J.5 STOP

**Step 2 — Pain-language copy-tweak meglévő oldalakon (csak ha Step 1 sikeres):**
- `/petty-cash-app` hero subhead pain-language reframing (1 oldal, 1 commit, low-risk)
- `/cash-handoff-receipt` intro pain-language anchor ("Stop chasing cash receipts at month-end")
- 1-2 hét várakozás → mérés

**Step 3 — Új landing megfontolás (csak ha Step 2 mérhetően jó):**
- `/petty-cash-receipt-for-employee-expenses` (J.4 cluster) — SERP-validation előbb
- VAGY `/cash-drawer-tracking-for-restaurant` (J.5 vertikum-wedge) — SERP-validation előbb

**Step 4 — Restaurant/bar/café wedge (csak ha Step 3 sikeres):**
- `/petty-cash-for-restaurant-manager` (F.3 jelölt) — implementáció + 4-5 supporting page
- TILOS-territory szigorú betartása (tip-pool, wage-deduction)

### J.8 Mit NE csináljunk most (kritikus)

1. **NE új landing** — moratórium 2026-05-15-ig.
2. **NE pain-language copy-tweak a most-pusholt 3 Apposing-oldalon** (vs-excel, manage-remotely, cash-handoff). A Google **most kezdi feldolgozni** (24-72 óra). Másik H1-tweak NOW = noise → 2026-05-15-i hipotézis-mérés értelmét veszti.
3. **NE Reddit-postot/PH-launchot** — ütközik ## E. csatorna-stratégia-vel és Codex maga is figyelmeztet.
4. **NE nyúljunk a `/petty-cash-app` hero-jához** — a 05-01-i sprint hatását mérnünk kell.

### J.9 Methodology-tanulság — a Codex-research értéke aszimmetrikus (F.4.F bővítés)

**A 2026-05-02 02:16-i F.4.F policy bővítve:** Ahogy a SERP-test értéke aszimmetrikus (negatív evidence megbízható, pozitív preliminary), úgy a **fórum/Reddit-research értéke is aszimmetrikus**:

- **Pain-language vocabulary** — **MEGBÍZHATÓ** (ezt a felhasználók TÉNYLEG így mondják, kvalitatív evidence, alacsony bias)
- **Vertikum-wedge identification** (restaurant/bar/café) — **MEGBÍZHATÓ** (Toast POS-thread-ek konkrét piaci rést jeleznek)
- **Konkrét query-volume / ranking-claim** — **NEM MEGBÍZHATÓ** (Reddit-thread ≠ Google-search-volume; SERP-validation szükséges)
- **Konkrét segment-conversion-claim** ("nonprofit treasurer = legközelebb a vásárláshoz") — **PRELIMINARY** (analitikai következtetés, nem mért)

**Konzekvencia:** A Codex pain-language vocab + wedge-identifikáció **azonnal F-policy-be kerül**. A query-volume + segment-conversion claim-ek **SERP-validation után** kerülnek backlog-ba.

### J.10 Köznyelvi vocabulary expansion (2026-05-03 00:08) — Codex follow-up

**Trigger:** Codex második research-batch — a "petty cash" köznyelvi szinonimáit gyűjtötte össze. Kulcsmegfigyelése: az emberek **gyakran nem "petty cash"-nek hívják** a fizikai készpénzt, hanem **fizikai-helyzet-alapú** vagy **geo-specifikus** vocabulary-t használnak.

#### J.10.1 Köznyelvi vocabulary-katalógus (16 alternatíva + geo-tag)

| Vocabulary | Geo / kontextus | Compliance-border check |
|---|---|---|
| **cash box** | US/UK iroda, nonprofit, event | ✅ Operational |
| **cash drawer** / **drawer** | US retail, café, étterem ("the drawer is short") | ✅ Operational (NE wage-deduction kontextus) |
| **till** | 🇬🇧🇦🇺 UK/Commonwealth — kassza/pénztár ("cash in the till") | ✅ Operational, geo-specifikus |
| **float** / **cash float** | 🇬🇧🇦🇺 UK/AU — váltópénz/induló készpénz ("till float") | ✅ Operational, geo-specifikus |
| **cash tin** | 🇬🇧🇦🇺 UK/AU — kis fémdoboz pénznek (iroda) | ✅ Operational, geo-specifikus |
| **kitty** / **office kitty** | 🇬🇧🇦🇺 UK/AU — közös kis pénzalap | ✅ Operational, geo-specifikus |
| **cash envelope** | Nonprofit, event, school, church | ⚠️ KÖZEPES — donor-receipt territory közelében (charity context óvatosan) |
| **cash fund** / **petty cash fund** | Formálisabb, de még nem accountingos | ✅ Operational |
| **office cash** | Laikus megfogalmazás | ✅ Operational |
| **change fund** | Retail/event váltópénz-alap | ✅ Operational |
| **safe cash** | Étterem/retail kasszán kívüli készpénz | ✅ Operational (NE tip-pool kontextus) |
| **cash on hand** | Accountingosabb, de kisvállalkozók is használják | ⚠️ FIGYELEM — accounting-decision-context territory közelében |
| **cash log** / **cash book** | Record-keeping (NEM maga a pénz, hanem a nyilvántartás) | ✅ Operational |
| **cash slip** / **petty cash slip** | A papír nyugta/voucher | ✅ Operational |
| **paid out** / **cash payout** | Étterem/retail kifizetés | ✅ Operational (NE wage-deduction vagy tip-pool) |
| **who has the cash** | Pure pain-language vocabulary | ✅ Operational |

#### J.10.2 13 Codex-javasolt long-tail query gap-analízis

A Codex 13 long-tail query-cluster-t javasol target-ként. Itt a teljes gap-analízis a meglévő 87 HTML-oldalunkkal:

| Codex query-cluster | Coverage | Meglévő oldal | Action (post-checkpoint) |
|---|---|---|---|
| `cash box tracker` | ⚠️ **Részleges** | `/who-took-money-from-cash-box`, `/where-to-keep-petty-cash`, `/how-to-start-petty-cash-box`, `/construction-site-petty-cash` | Esetleg új landing post-checkpoint, VAGY meglévő H1/title finomítás |
| `cash drawer log` | ⚠️ **Részleges** | `/cash-drawer-reconciliation`, `/cash-discrepancy-between-shifts` | Új landing megfontolható ("log" intent ≠ "reconciliation" intent) |
| `cash handoff receipt` | ✅ **Teljes** | `/cash-handoff-receipt` (Apposing Phase 1) | — |
| `cash in cash out log` | ⚠️ **Részleges** | `/cash-paid-out-log` (csak "out") | "in" intent hiányzik — esetleg meglévő bővítés |
| `employee cash receipt` | ⚠️ **Részleges** | `/employee-cash-advance-receipt` (advance-only), `/payroll-cash-receipt` (payroll-only) | General "employee cash receipt" intent hiányzik — új landing megfontolható |
| `cash envelope tracker` | ❌ **HIÁNYZIK** | — | Új landing kandidát (⚠️ nonprofit-context óvatosan) |
| `cash float tracker` | ⚠️ **Részleges** | `/cash-float-vs-petty-cash` (comparative, NEM tracker) | UK/AU geo-fókuszú új landing kandidát |
| `office cash log` | ❌ **HIÁNYZIK** | — | Új landing kandidát |
| `cash payout receipt` | ⚠️ **Részleges** | `/cash-paid-out-log` (log-only), `/payroll-cash-receipt` (payroll) | General "cash payout receipt" hiányzik |
| `safe cash log` | ❌ **HIÁNYZIK** | — | Új landing kandidát (restaurant/retail wedge — J.5-tel együtt) |
| `cash drawer reconciliation` | ✅ **Teljes** | `/cash-drawer-reconciliation` | — |
| `missing petty cash receipts` | ⚠️ **Részleges** | `/petty-cash-does-not-balance`, `/petty-cash-security-tips` | Dedikált "missing receipts" landing megfontolható |
| `who has the cash` | ✅ **Teljes** | `/who-has-the-cash-right-now`, `/boss-cant-see-where-cash-goes` | — |

**Összesítés:** 13/13 Codex query-clusterből → **3 teljes coverage**, **7 részleges**, **3 hiányzik teljesen**. A SpendNote vocabulary-coverage **jobb mint vártam** (a /who-has-the-cash-right-now, /cash-float-vs-petty-cash, /cash-paid-out-log, /who-took-money-from-cash-box tudatos vocabulary-játszmák voltak).

#### J.10.3 Geo-vakfolt — UK/AU vocabulary nincs lefedve

**Új insight:** A meglévő 87 HTML-oldalból **egyik sem** céloz UK/AU-specifikus vocabulary-t (`till`, `kitty`, `cash tin`, `till float`). Ez **geo-blindspot**.

**Releváns query-jelöltek post-checkpoint SERP-validation-re:**
- `office kitty tracker` (UK/AU)
- `till float app` (UK/AU)
- `cash tin tracker` (UK/AU)
- `till reconciliation small shop` (UK)
- `petty cash kitty record` (UK)

**Kockázat-értékelés:**
- **Pro:** UK/AU SERP-ek gyakran kevésbé telítettek mint a US (kisebb verseny), és a SpendNote .app TLD nem geo-locked
- **Con:** GSC adat-bázisunk dominánsan US/IN — UK/AU traffic elenyésző jelenleg, ezért SERP-validation prioritása alacsony
- **Verdikt:** Post-checkpoint backlog **alsó prioritás**, csak ha Step 2 (pain-language copy-tweak) és Step 3 (új landing US-vocabulary-re) sikeres lett

#### J.10.4 F-policy bővítés — vocabulary használati szabályok

A J.10.1 katalógusból **3 vocabulary-szó** kapott figyelmeztető tagot — ezeket a szabályok dokumentálandók:

1. **`cash on hand`** — ⚠️ accounting-decision-context territory közelében
   - ✅ **MEGENGEDETT**: "Track your cash on hand across multiple boxes" (operational)
   - ❌ **TILOS**: "Calculate cash on hand for your balance sheet" (accounting-decision)
   - ❌ **TILOS**: "Determine cash on hand for tax purposes" (tax-decision)

2. **`cash envelope`** — ⚠️ donor-receipt territory közelében (charity context)
   - ✅ **MEGENGEDETT**: "Track cash collected in envelopes at events" (operational)
   - ✅ **MEGENGEDETT**: "Record what was collected in each cash envelope" (operational)
   - ❌ **TILOS**: "Generate IRS-compliant donation envelope receipts" (donor-receipt territory)
   - ❌ **TILOS**: "Issue tax-deductible cash envelope receipts" (tax-decision)

3. **`paid out` / `cash payout`** — ⚠️ wage-deduction / tip-pool territory közelében
   - ✅ **MEGENGEDETT**: "Record cash paid out to vendor" (operational)
   - ✅ **MEGENGEDETT**: "Track who got cash paid out and why" (operational)
   - ❌ **TILOS**: "Deduct cash payout from staff wages" (wage-deduction territory — FLSA)
   - ❌ **TILOS**: "Distribute tip pool cash payouts" (tip-pool territory — FLSA)

#### J.10.5 Köznyelvi vocabulary integráció — post-checkpoint sorrend

A J.7 4-step action-plan **NEM változik**, csak a **Step 2 (pain-language copy-tweak)** kibővül vocabulary-szavakkal:

**Step 2.A — Pain-language hero/CTA copy-tweak** (J.3-ból, változatlan):
- "Stop chasing cash receipts at month-end."
- "Know who has the cash before month-end."

**Step 2.B — Vocabulary-diversification a body-content-ben** (J.10 új):
- A meglévő "petty cash" first-mention-ek mellé **természetes módon** beszúrt vocabulary-szinonimák, hogy a Google semantic-clustering-je felismerje a vocabulary-átfedést
- Pl. `/petty-cash-app`-on: "...your petty cash (or cash box, cash drawer, or office float)..."
- Pl. `/cash-handoff-receipt`-en: "...for cash handoffs from cash boxes, drawers, tills, or safe cash..."
- **NE túlzásba vinni** — keyword-stuffing kockázat (1-2 mention/oldal max)

**Step 3.A — Új landing-prioritás (post-checkpoint, ha Step 2 mérhetően jó)** — **3 hiányzó cluster sorrendben**:
1. `cash envelope tracker` (J.10.2 #6) — DE compliance-border óvatosan (J.10.4 #2)
2. `office cash log` (J.10.2 #8) — alacsony kockázat
3. `safe cash log` (J.10.2 #10) — restaurant/bar wedge-tel összefonódik (J.5)

**Step 3.B — Részleges-coverage finomítás (post-checkpoint, ha Step 3.A sikeres):**
- `cash box tracker` — meglévő 4 oldal valamelyikének H1/title finomítása (NEM új landing)
- `cash drawer log` — meglévő `/cash-drawer-reconciliation` H2-bővítés VAGY új landing
- `employee cash receipt` (general) — meglévő `/employee-cash-advance-receipt` body-bővítés VAGY új landing
- `missing petty cash receipts` — meglévő `/petty-cash-does-not-balance` H2-bővítés VAGY új landing

**Step 4.B — Geo-specifikus UK/AU vocabulary (csak ha Step 4 restaurant-wedge sikeres):**
- `till float app` / `office kitty tracker` / `cash tin tracker` SERP-validation
- Ha SERP-en valódi piaci rés van, **1 dedikált UK/AU vocabulary landing** kísérlet

#### J.10.6 Mit NE csináljunk most (J.8-cal egyenértékű, megerősítés)

1. **NE új landing** — moratórium 2026-05-15-ig, függetlenül attól, hogy a Codex vocabulary-listája milyen erős
2. **NE vocabulary-keyword-stuffing** a meglévő oldalakon — még post-checkpoint sem (1-2 mention/oldal max)
3. **NE UK/AU geo-pivot** — alacsony prioritás, csak post-Step-4
4. **NE érintsük a most-pusholt oldalakat** (Apposing Phase 1, /petty-cash-app) — mérési ablak

#### J.10.7 Methodology-megerősítés (J.9 alkalmazása)

A J.10 vocabulary-katalógus **MEGBÍZHATÓ** (ezt a felhasználók TÉNYLEG így mondják — kvalitatív evidence, alacsony bias). A 13 query-cluster **PRELIMINARY** (Codex hipotézis, NEM SERP-validált) — minden új landing előtt SERP-validation szükséges (F.4.A módszertan szerint).

**Pozitív SERP-jel = preliminary go.** **Negatív SERP-jel (QuickBooks/Smartsheet/Microsoft fal) = STOP, függetlenül a vocabulary-erőtől.**

### J.11 Codex 3rd batch (2026-05-03 00:15) — strategic synthesis: viral loop audit + persona-mapping + entity-trust listings

**Trigger:** Codex harmadik research-batch — szintetizáló javaslat a 4 fájdalom-klaszter köré + viral loop ("Created with SpendNote" footer) + entity-trust listings (SourceForge, G2 0-review state) + konkrét fórum-evidence linkek (Square paid in/out, Toast drawer discrepancy).

#### J.11.1 Viral loop audit — mostani PDF/email receipt footer státusz

**Audit eredmény (2026-05-03 00:13):** A SpendNote tényleges PDF/print receipt footer **funkcionálisan** tartalmazza a Codex által javasolt viral loop attribution-t, de **strukturálisan különbözik**.

**Mostani footer szöveg** (`spendnote-pdf-receipt.html`, `spendnote-receipt-print-two-copies.html`):

```
SpendNote — Proof of cash handoff. Not a tax document. — https://spendnote.app/ [+ QR code]
```

**Codex-javasolt footer szöveg:**

```
Created with SpendNote — simple cash handoff receipts for teams
```

**Összehasonlító mátrix:**

| Funkció | Mostani | Codex-javaslat | Verdikt |
|---|---|---|---|
| Brand-attribution | ✅ "SpendNote" | ✅ "SpendNote" | egyenértékű |
| Compliance disclaimer | ✅ "Not a tax document" | ❌ hiányzik | **mostani jobb** (F-policy Tier B követelmény) |
| Kattintható URL | ✅ `https://spendnote.app/` | ❌ hiányzik | **mostani jobb** (acquisition-hook) |
| QR-kód mobile-scan | ✅ van | ❌ hiányzik | **mostani jobb** (mobile-acquisition) |
| Value-prop tagline | ❌ nincs | ✅ "simple cash handoff receipts for teams" | **Codex jobb** (pozícionálás) |
| "for teams" pozícionálás | ❌ nincs | ✅ van | **Codex jobb** (B2B-jel) |

**Verdikt:** a mostani footer **erősebb** compliance + acquisition-hook szempontból, **gyengébb** pozícionálás-tagline szempontból. A Codex-javaslat **NEM lecserélés**, hanem **kombinálás** post-checkpoint.

**Javasolt kombináció (Step 2.C):**

```
SpendNote · Proof of cash handoff for teams · Not a tax document · spendnote.app [+ QR]
```

Ez megőrzi mind a 4 mostani előnyt + hozzáadja a "for teams" B2B-pozícionálást + cleaner middle-dot szeparátorokat + rövidebb URL-megjelenítést (`spendnote.app` vs. `https://spendnote.app/`).

**Update (2026-05-03 00:30) — Step 2.C VÉGREHAJTVA:** A felhasználó B opciót választotta (részleges lazítás a moratóriumon, Apposing-mérés-protection mellett). A footer-csere végrehajtva mindkét érintett NOINDEX fájlban:
- `spendnote-pdf-receipt.html` (1 helyen)
- `spendnote-receipt-print-two-copies.html` (2 helyen — két-másolat layout)

Indoklás a moratóriumon belüli kivételre: ezek a fájlok **NOINDEX** + **NEM marketing landing-ek** + a footer **shared component nem érintik a SEO-méréseket** (Apposing Phase 1 / how-much-to-keep snippet-rewrite mind érintetlen). Brand-perception-shock-kockázat alacsony (kevés user lát PDF-et most, 0 click). Long-term hatás: minden új PDF-en megjelenik a value-prop tagline → viral loop élesedik.

#### J.11.2 4-fájdalom-klaszter persona-mapping (J.1 continuation, konkrétabb)

A J.1 5 user-segment-listáját Codex konkrétabb 4 fájdalom-klaszterbe szintetizálta. Mind a 4 már szerepel a J.10 post-checkpoint backlog-ban — itt csak a persona-fókusz és Codex-vocabulary mapping rögzítése:

| Codex 4-klaszter | Target persona | Codex-vocabulary | Meglévő coverage | Backlog-step |
|---|---|---|---|---|
| **Cash drawer / paid out** | Retail, café, restaurant manager | "drawer is short", "paid out", "shift review", "safe cash", "cash in/out" | ⚠️ J.10.2 részleges (`/cash-drawer-reconciliation`, `/cash-discrepancy-between-shifts`, `/cash-paid-out-log`) | J.10.5 Step 3.A #3 + J.5 restaurant-wedge |
| **Cash handoff receipt** | Small teams, contractors, office managers | "cash handoff", "who took the cash", "small team cash" | ✅ J.10.2 teljes (`/cash-handoff-receipt` Apposing Phase 1) | — |
| **Cash envelope / event cash** | Nonprofit, school, church, PTO treasurer | "cash collection record", "event cash handoff", "volunteer cash count form", "two-person cash count receipt" | ⚠️ Részleges (`/two-person-cash-count-policy`, `/event-cash-handling`, `/school-money-collection-tracker`) | J.10.5 Step 3.A #1 (`cash envelope tracker` ⚠️ compliance-óvatosan) |
| **Missing petty cash receipts** | Bookkeeper, admin, owner | "missing receipts", "fat envelope of crumpled receipts", "month-end chasing" | ⚠️ J.10.2 részleges (`/petty-cash-does-not-balance`, `/petty-cash-security-tips`) | J.10.5 Step 3.B (dedikált "missing receipts" landing megfontolható) |

**Konzekvencia:** J.10.5 action-plan **változatlan** — csak a persona-fókusz pontosabb a copy-tweak-ekhez (Step 2.A pain-language hero-knál és Step 3.A új landing intro-knál tudni, melyik személyt szólítjuk meg).

#### J.11.3 Entity-trust listings — SourceForge, G2 0-review state

**Codex-evidence:** SourceForge és G2 már listázza a SpendNote-ot, **de 0 review** (Codex linkek: `SourceForge SpendNote`, `G2 SpendNote`).

**Codex-claim:** "Egyetlen valódi review többet érhet, mint még 5 új landing."

**Értékelés:**
- ✅ **Megbízható** — entity-trust signals (review-count, brand-citations) **bizonyítottan** befolyásolják a Google E-E-A-T scoring-ot
- ✅ Egyezik a 2026-04-25-i `## E. csatorna-stratégia`-val (külső entity-validation = bizalmi jel, nem közvetlen forgalom)
- ⚠️ **DE compliance-border**: SpendNote-nak **NEM szabad** közvetlenül kérni review-t fizetésért / kedvezményért (G2 ToS, FTC endorsement guidelines)

**Hova illeszkedik a meglévő stratégiánkba:**
- `## E. csatorna-stratégia` már kategorizálja a listings-strategy-t mint "**alacsony idő, magas compliance-tudatosság**"
- A 0-review state **nem akut probléma** (a SpendNote még pre-launch growth fázisban van), de **post-checkpoint Step 1 melléktevékenység** lehet: a meglévő free-userek között identifikálni 1-2 elégedett earlyt, és **finoman** kérdezni egy authentic G2/Capterra review-ról (NEM SourceForge — alacsony quality-signal)

**Action (J.11 → backlog):**
- Post-checkpoint Step 0.A (paralel a Step 1-gyel, nem-blokkoló): G2 (vagy Capterra ha Capterra-rejection rendezhető) authentic review-acquisition pilot — **1-2 elégedett free-user** identifikálása + finoman megkérdezés (NO incentive, NO scripted text)

**Update (2026-05-03 00:30) — Step 0.A KICK-OFF (B opció keretében):**

Manuális outreach-protokoll, a felhasználó hajtja végre saját Supabase user-listából:

**1. User-identification kritériumok (kit kérdezzünk):**
- Free plan user, aktív last 30 days (legalább 5 transaction logged)
- Legalább 2 hete regisztrált (not brand-new — legyen valós tapasztalata)
- NEM panaszkodott support-ban (ha van support log)
- **Max 2 user** (pilot — nem mass-outreach)

**2. Outreach-csatorna:**
- Email a regisztrációkor megadott címre (NEM in-app notification — túl marketing-szerű)
- Subject: `Quick question about your SpendNote experience` (3-line email, NOT survey, NOT formal)
- **TILOS**: incentive ("if you review, we give you Pro free for X months") — FTC endorsement guidelines + G2 ToS megsértése

**3. Email-template (G2-acquisition pilot, 2026-05-03):**

```
Subject: Quick question about your SpendNote experience

Hi [first name],

Noticed you've been using SpendNote for [X weeks] now — really appreciate it.
Quick honest question: would you be open to writing a short G2 review about
your experience? Even 2-3 sentences helps a lot. No pressure if not your thing.

Here's the direct link if you'd like:
[G2 SpendNote review URL]

Thanks either way,
[Founder name]
```

**4. Compliance-ellenőrzések (KRITIKUS — F-policy + FTC):**
- NE ígérjünk semmit cserébe (Pro upgrade, kedvezmény, lottósorsolás → mind FTC-szabálysértés)
- NE diktáljunk szöveget ("please mention X feature" → G2 ToS sértés)
- NE follow-up-oljunk 1x-nél többször (spam-jellegű)
- IF user nem válaszol: **STOP**, NE küldj reminder-t

**5. Sikerkritérium:**
- 1 valódi G2 review **30 napon belül** = pilot SUCCESS → bővíthető 5-10 user batch-re
- 0 review 30 napon belül = pilot DEAD-END → Capterra-rejection-investigation prioritás
- Negatív review = **VÁRT** (nem feltétlenül baj, ha konstruktív → product-feedback signal)

**6. Mérés (PROGRESS.md napló):**
- Outreach küldés dátuma + N user
- Open/reply rate (ha mérhető)
- Review-megjelenés dátuma G2-n
- Review-rating (csillagok) + körülbelüli sentiment

#### J.11.4 Konkrét fórum-evidence — Square paid in/out, Toast drawer discrepancy

Codex 3 konkrét fórum-link-et adott a J.5 restaurant-wedge megerősítésére:
1. **Square paid in/out thread** — userek nem tudják, hogyan vegyenek ki pénzt a kasszából vásárlásra úgy, hogy nyoma legyen → konkrét SpendNote use-case
2. **Toast drawer discrepancy thread** — shift review undo után eltűnt/összekuszálódott a drawer mozgás → konkrét fájdalom
3. **Bookkeeping petty cash procedure thread** — receipt-into-box workflow szétesik a gyakorlatban → /petty-cash-does-not-balance + missing-receipts use-case

**Konzekvencia (J.5 megerősítés):**
- A restaurant/bar/café wedge **nem hipotézis** — Toast/Square fórumokon **konkrét, dokumentált** fájdalom van
- A J.5 backlog-ot ez **megerősíti**, NEM bővíti (action-plan változatlan)
- A `/petty-cash-for-restaurant-manager` (F.3 brainstorm jelölt) **prioritása emelkedik** post-Step-3 backlog-ban — de SERP-validation még szükséges (POS-tools versenyhelyzete: Toast, Square, Lightspeed, Clover, Lavu)

#### J.11.5 Codex meta-claim értékelés — "ne neked kell 100 userrel beszélgetni"

**Codex-claim:** "Nem neked kell kézzel 100 userrel beszélgetni, hanem olyan felületeket kell építeni, ahol a fájdalom már most keresésként / fórumkérdésként létezik."

**Értékelés:**
- ✅ **Stratégiailag igaz** — content-mediated user-acquisition (SEO + entity-trust) a SpendNote bottleneck-fázisának (1-developer, 0-marketing-budget) **legmagasabb-leverage** stratégiája
- ✅ Egyezik a `## E. csatorna-stratégia`-val ("nincs idő Reddit-postingra, B2B outreach-re, kvalitatív user-interjúra")
- ⚠️ **DE NEM teljes** — **kvalitatív user-input** (akár 5-10 user) **mérhetetlen-érték** lenne a copy-pozícionálás finomítására (mit jelent "for teams"? Hány fős a "small team"? Mi a "month-end chasing" konkrét workflow-ja?)
- **Verdikt:** a SEO/listings-stratégia helyes, **DE** post-Step-3 (új landing-validation) ajánlott legalább **1-2 free-user follow-up email-interjú** (**NEM** survey, **NEM** focus group, hanem `Hey, what made you sign up?` típusú 3-soros email, alacsony idő-investáció)

#### J.11.6 Mit NE csináljunk most (J.8 + J.10.6 megerősítés + 2 új tilos)

1. **NE PDF/email receipt footer-tweak** — Codex value-prop tagline kombinálás post-checkpoint Step 2.C, NEM most (brand-perception-shock-kockázat)
2. **NE G2/Capterra/SourceForge review-acquisition kampány most** — moratórium-fókusz a 2026-05-15-i mérésen, post-Step 0.A backlog
3. **NE `/petty-cash-for-restaurant-manager` landing most** — J.5 wedge SERP-validation szükséges post-Step-3
4. **NE direkt fórum-poszt a Codex által linkelt Square/Toast threadekben** — ## E. csatorna-stratégia + J.8 megerősítés

#### J.11.7 Methodology-pontosítás — Codex-claim audit-protokoll (J.9 + J.10.7 finomítás)

A 3 batch-en keresztüli Codex-research-ek alapján egységesített **3-szintű megbízhatósági protokoll** (új F-policy):

| Codex-claim típus | Megbízhatóság | Action |
|---|---|---|
| **Vocabulary / pain-language gyűjtemény** (J.2, J.10.1) | ✅ MEGBÍZHATÓ | F-policy-ben azonnal rögzíthető |
| **Vertikum-wedge identification** (J.5 restaurant, J.11.3 entity-trust) | ✅ MEGBÍZHATÓ | Backlog-ba kerülhet, post-checkpoint implementáció |
| **Konkrét fórum-evidence linkek** (J.11.4) | ✅ MEGBÍZHATÓ | Wedge-megerősítésként használható, NEM mint quantitative evidence |
| **Persona-mapping** (J.11.2) | ⚠️ PRELIMINARY | Copy-fókusz finomításához OK, NEM ranking-claim |
| **Konkrét query-volume / ranking-claim** | ❌ NEM MEGBÍZHATÓ | SERP-validation kötelező (F.4.A) |
| **Konkrét segment-conversion-claim** | ⚠️ PRELIMINARY | Csak post-Step-3 user-feedback után erősítendő |
| **Strategic meta-recommendation** ("ne 100 userrel beszélgess") | ⚠️ NÜANSZ-FÜGGŐ | Egységes elfogadás kockázatos — case-by-case értékelés szükséges |

## J.12 Codex independent action audit (2026-05-03 00:35) — index.html unauthorized draft + revert

**Trigger:** A Step 2.C (viral footer) végrehajtása alatt a Codex (másik agent másik környezetben) **párhuzamosan** és **engedély nélkül** módosította az `index.html` head-jét + SoftwareApplication schemáját. A felhasználó leállította a Codex-et, és kérte a változtatások revert-elését (a B opció kifejezetten kizárta a marketing landing-ek érintését).

### J.12.1 Codex draft pontos tartalma (head-only — body NEM érintett)

**6 sor változás + 9 új sor** (mind `<head>`-ben):

#### 1. meta description (head line 12)
- **Régi:** `Track every cash movement, generate instant receipts, and keep your team accountable. SpendNote replaces paper logs and spreadsheets. Free to start.`
- **Új:** `Record who took cash, who received it, and what it was for. SpendNote creates cash handoff receipts, cash box logs, and searchable history for small teams.`
- **Értékelés:** ⚠️ Pain-language wedge (J.3 Step 2.A copy-fragment — post-checkpoint kéne); + a "Free to start" eltávolítása (honest-claims-rule ## H. szerint OK, ha tényleg downloadable artifact nélkül van)

#### 2. `<title>` (line 31) — KRITIKUS VÁLTOZTATÁS
- **Régi:** `SpendNote — Petty Cash Tracking & Receipts for Teams`
- **Új:** `SpendNote — Cash Handoff Tracking & Receipts for Teams`
- **Értékelés:** ❌ **MAJOR hipotézis-váltás** — "Petty Cash" eltűnik a homepage `<title>`-ből, ami az aktív ranking-keyword. Ez NEM copy-tweak, hanem **brand-fókusz-shift**. Top-impression URL-en NEM Step 2.A scope-ba tartozik, hanem post-Step-3 döntés legalább.

#### 3-4. og:title + og:description (lines 18-19)
- (Mint title + meta description új verzió)
- ⚠️ **Mojibake bug**: `ÔÇö` (UTF-8 mishandling az `—` em-dash helyett) — azonnali visual bug minden FB share-en

#### 5-6. twitter:title + twitter:description (lines 25-26)
- (Mint og:* — szintén mojibake)
- ⚠️ Same mojibake bug

#### 7. SoftwareApplication schema description (line 42)
- **Régi:** `Track every cash movement, generate instant receipts, and keep your team accountable.`
- **Új:** `Record who took cash, who received it, and what it was for. SpendNote creates cash handoff receipts, cash box logs, and searchable history for small teams.`
- **Értékelés:** ⚠️ J.10/J.11 page-specific schema (Step 3.A scope)

#### 8. + új mező: `applicationSubCategory: "Cash Handoff Tracking"` (line 45)
- **Értékelés:** ⚠️ Konzisztens a J.11.4 / J.10.5 schema-strategy-vel, DE magát a változtatást post-Step 3.A scope-ba terveztük

#### 9. + új mező: `featureList` 6 item (lines 47-53)
- "Record cash handoffs with named parties"
- "Generate printable PDF receipts"
- "Track cash paid out from boxes and drawers"
- "See who has the cash right now"
- "Search transaction history by box, person, and date"
- "Export PDF and CSV records"
- **Értékelés:** ⚠️ Page-specific featureList — konzisztens a J.10.5 metodikával, DE NEM most-scope

### J.12.2 Két önállóan elegendő ok a revertra

1. **Mojibake bug** (3 occurrence: og:title, twitter:title, és valószínűleg `<title>` is) — `ÔÇö` az `—` em-dash mishandling-je. Azonnali visual-bug minden Facebook/Twitter/X share-en + esetleg Google SERP-en is.

2. **`<title>` brand-fókusz-shift** "Petty Cash" → "Cash Handoff" — homepage = top-impression URL, "Petty Cash" aktív ranking-keyword. Title-shift → ranking-shock-kockázat → az **összes folyamatban lévő hipotézis-mérés megsemmisítése** (Apposing Phase 1 vs-excel/manage-remotely/cash-handoff + how-much-to-keep snippet-rewrite).

### J.12.3 Mit MENTSÜNK MEG a Codex draft-jéből post-checkpoint backlog-ra

A Codex 9 változtatásából **5 elem értékes** (post-checkpoint Step 2.A vagy Step 3.A scope-ba illeszthető), 4 elem pedig **revert-tartandó** (`<title>` shift + 3 mojibake).

**MEGTARTANDÓ post-checkpoint (Step 2.A — pain-language meta description):**

```
<meta name="description" content="Record who took cash, who received it, and what it was for. SpendNote creates cash handoff receipts, cash box logs, and searchable history for small teams.">
```

(Ugyanez og:description, twitter:description, schema.description — DE em-dash NORMÁLISAN: `&mdash;` HTML-entity vagy U+2014 UTF-8 byte, NEM `ÔÇö`!)

**MEGTARTANDÓ post-checkpoint (Step 3.A — page-specific schema fields):**

```json
"applicationSubCategory": "Cash Handoff Tracking",
"featureList": [
  "Record cash handoffs with named parties",
  "Generate printable PDF receipts",
  "Track cash paid out from boxes and drawers",
  "See who has the cash right now",
  "Search transaction history by box, person, and date",
  "Export PDF and CSV records"
]
```

**REVERT-TARTANDÓ (NE használjuk post-checkpoint sem):**

- `<title>` shift "Petty Cash" → "Cash Handoff" — too aggressive a homepage-en. Helyette: post-checkpoint csak **alcímként** lehet "Cash Handoff" megemlítve (pl. `SpendNote — Petty Cash & Cash Handoff Tracking for Teams` — keyword-megőrző hibrid), DE ez SERP-validation után döntendő.
- Mojibake `ÔÇö` (3 occurrence) — encoding-bug, mindenképp tilos. Helyette: `&mdash;` HTML-entity (jelenlegi konvenció a kódbázisban, ld. még más HTML-fájlokat is).

### J.12.4 Methodology-tanulság — multi-agent koordinációs F-policy

**Új F-policy (J.12.4):** ha párhuzamosan dolgozó AI-agent (Codex, ChatGPT, vagy bármi más) önállóan módosít fájlt a SpendNote workspace-ben, a folyamat:

1. **Stop**: a koordináló agent (jelen esetben Cursor/Opus) **azonnal** auditálja a `git status`-t
2. **Diff-mentés**: a változtatások mentése **ref-fájlba** (`.codex-XXX-draft-YYYY-MM-DD.diff` vagy hasonló)
3. **Audit + risk-reasoning**: minden változtatás külön értékelése (J.7 Step-scope alapján: most VAGY post-checkpoint VAGY soha)
4. **Revert (default)** ha bármi a moratórium-protected URL-eken van (Apposing 4 + how-much-to-keep + bármi top-impression)
5. **Inline mentés a `seoplan.md`-be** (text-form, encoding-fix-szel) post-checkpoint backlog-ként
6. **Diff-fájl törölhető** miután az inline mentés megvan

**Miért fontos:** A multi-agent setup (külön agent külön környezetben) hasznos a brainstorming-fázisban (Codex 1-2-3 batch-research **EXTRÉM ÉRTÉKES** volt), DE veszélyes az élesvégrehajtási fázisban — a koordinátor agent-nek (Opus) **központi audit-protokoll** kell.

### J.12.5 Implementáció (ezen a commit-on)

- ✅ Codex draft mentve `.codex-index-draft-2026-05-03.diff`-be (lokálisan, nem committed — átkerül text-formában a J.12.3-ba ezen a commit-on, majd a diff-fájl törölhető)
- ✅ `index.html` revert-elve `git checkout HEAD -- index.html`
- ✅ J.12 szekció dokumentálva (5 sub-szekció: J.12.1-J.12.5)
- ✅ Új F-policy: multi-agent koordinációs protokoll (J.12.4)
- ✅ Post-checkpoint backlog frissítve: 5 értékes Codex-element (Step 2.A meta-description + Step 3.A schema fields) MENTVE inline; 4 revert-tartandó (title-shift + mojibake) ELUTASÍTVA

### J.12.6 EPILOGUE (2026-05-03 00:53) — opció-C felhasználói override → Codex draft RE-APPLIED encoding-fix-szel

**Trigger:** A J.12 revert után a felhasználó explicite közölte, hogy a multi-pivot SERP-validation alatt félreértelmeztem a UI-választását. A felhasználó a Full Execute (C opció) mellett döntött a UI-ban, én a textuális "a b mert..." választ B opciónak (Partial Relaxation) értelmeztem. A felhasználó reprimand-je után az alábbi végrehajtás történt:

**1. `index.html` re-apply (encoding-fix-szel):**
- meta description, og:title/description, twitter:title/description, `<title>` — mind a J.12.3-ban "MEGTARTANDÓ post-checkpoint" verzió alkalmazva
- Mojibake fix: `&mdash;` HTML-entity (NEM `ÔÇö`)
- `<title>` shift "Petty Cash" → "Cash Handoff" — **a J.12.3-ban "REVERT-TARTANDÓ"-ként megjelölt verzió IS alkalmazva** (felhasználói override felülírja az Opus risk-judgment-jét)
- SoftwareApplication schema: `applicationSubCategory: "Cash Handoff Tracking"` + 6-elemű `featureList` hozzáadva

**2. 3 alacsony-traffic landing pain-language tweak (Step 2.A scope eredetileg post-checkpoint, NOW):**
- `cash-paid-out-log.html` → `<title>` "Record Every Cash That Leaves the Drawer" + meta description "Drawer short at end of shift?..." pain-hook
- `event-cash-handling.html` → `<title>` "Shared Cash Log for Volunteers & Booths" + meta description "Event cash flying around between volunteers and booths?..." pain-hook
- `petty-cash-does-not-balance.html` → `<title>` "Petty Cash Short? — Stop Chasing Receipts, Find the Missing Money" + meta description "Stop chasing receipts at month-end..." pain-hook

**3. `who-has-the-cash-right-now.html` body-bővítés:**
- Új `<h2>Office Cash Log: One Shared View for the Whole Team</h2>` szekció + 4-elemű use-case bullet list
- Office cash log + cash drawers + event floats + multi-location vocabulary
- **Indok:** A SERP-test pivot-3 megerősítette, hogy ez az URL MÁR Google #1 az `office cash tracking app online` query-re — bővítés a top-1 megerősítéséért, NEM új landing kanibalizálás

**4. Tudatosan elhagyott risk-elemek (post-checkpoint maradnak vagy soha):**
- `<title>` hibrid alternatíva (`SpendNote — Petty Cash & Cash Handoff Tracking for Teams`) → most **NEM** lett használva, a tisztán "Cash Handoff" verzió ment ki (felhasználói explicit "csináld meg a Codex javaslatait")
- 3 új landing (`/cash-envelope-tracker`, `/office-cash-log`, `/safe-cash-log`) — **HOLD**: a 6-query SERP-pivot-validation 5/6-ban negatív lett, a Codex 2. SERP-gap-hunting iteráció eredményét várjuk (J.13)

**Mérési kockázat (tudatosan vállalt):**
- Homepage `<title>` shift = ranking-shock kockázat az aktív "petty cash" keyword-en
- 3 + 1 landing copy-tweak = a Phase 1 Apposing hipotézis-mérés (Article→SoftwareApplication conversion) "tiszta" mérési-ablaka degradált
- A 14-napos checkpoint (## B) most **2026-05-17-re csúszik** (másfél hét a 04-29 → 05-19 moratórium-ablakhoz képest), és a hipotézisek **összemosódnak** a pain-language wedge-csel
- Indok a vállalásra: **0 klikk a teljes site-on** + **csökkenő impression-trend** = a "tiszta mérés" elhanyagolható értékű, mert nincs mit mérni; gyors iteráció > tiszta A/B

## J.13 SERP-pivot-validation eredmény + Codex 2nd gap-hunting iteráció (waiting state)

### J.13.1 6-query SERP-pivot-validation eredmény (2026-05-03 00:45)

A J.12.6 "Full Execute" override előtt 6 SERP-query-t teszteltem (3 eredeti + 3 pivot), 3 új landing-jelölt validálására. A pivot-validation döntésszerepe már nem aktuális (a felhasználó override-ja után az új landing-ek nem SERP-test alapon történnek), DE az evidence dokumentálandó későbbi referenciára.

| Cluster | Query | Top 5 SERP-tartalom | Verdikt |
|---|---|---|---|
| `/cash-envelope-tracker` | `cash envelope tracker app online` | Dave Ramsey envelope-budgeting apps (személyes pénzügy, NEM cash collection) | ❌ Intent-mismatch |
| `/office-cash-log` | `office cash log spreadsheet template` | Excel + Google Sheets template-letöltések | ❌ Template-fal |
| `/safe-cash-log` | `safe cash log restaurant tracking` | POS-tools + Excel templates + Toast Community thread | ⚠️ MIXED |
| `/cash-envelope-tracker` (pivot) | `event cash collection log nonprofit volunteer` | Nonprofit how-to guide-ok + 1-2 template, **NINCS SaaS-fal** | ⚠️ MAYBE-GO |
| `/office-cash-log` (pivot) | `office cash tracking app online` | **#1 SpendNote `/who-has-the-cash-right-now`** + #2 `/index.html` | ✅ MÁR top-1 — bővít, ne új landing |
| `/safe-cash-log` (pivot) | `restaurant safe drop log app` | Food-safety apps (`log app` → temperature logs!) + Toast | ❌ Vocab-csapda |

**Konklúzió:**
- 3 eredeti landing-jelöltből 0 jó (template-fal vagy intent-mismatch)
- 3 pivot-jelöltből 1 MAYBE-GO (event-cash-collection-log nonprofit), 1 redundáns (office cash log → meglévő top-1 bővítendő, nem új URL), 1 csapda
- A **pivot-3 felfedezés** (`/who-has-the-cash-right-now` MÁR Google #1 az `office cash tracking app online`-ra) → bővítés Step 2.A scope-ban végrehajtva (J.12.6 / 3. pont)

### J.13.2 Codex 2nd SERP-gap-hunting iteráció (waiting state)

**Felhasználói döntés (2026-05-03 00:54):** A 3 új landing-jelölt többségi NO-GO eredménye után a felhasználó a Codex-et küldte rá egy **2. SERP-gap-hunting iterációra** — más query-cluster-ek vagy más vocab-szögek után, hátha talál olyan rést, ahol a SERP nem fal, és ahol a SpendNote kompetitív landinggel be tud jönni.

**Codex 2nd gap-hunting receiving-template (mit várunk vissza):**

Minden javasolt új cluster-re a Codex-nek a következő evidence-csomagot kell visszaadnia, hogy a 10-percen-belüli execution lehetséges legyen:

1. **Target-query** (1 fő + 2-3 long-tail variáns)
2. **SERP top 5 audit** — domain + page-type-szel (Excel-template? SaaS-landing? Forum thread? Wikipedia/Investopedia?)
3. **NO-walled-garden evidence** — magyarul: nincs Investopedia/Wikipedia/QuickBooks/Shopify a top 3-ban, mert akkor esélytelen
4. **Pain-language sample** — fórum/Reddit/Quora idézet a target-keresőre
5. **Compliance check** — F-policy (## F.) szerint: érinti-e a payroll/donor-receipt/tax-deductible/loan/wage-deduction zónát? Ha igen → REJECT
6. **SpendNote feature-fit** — melyik létező feature/H2-block fedi le a query-t (nem írunk új feature-t SEO-ért)
7. **Cannibalization-check** — érinti-e meglévő top-30 ranking-keyword-et? (ha igen → bővítés a meglévőn, NEM új URL)

**Implementációs cél:** ha a Codex 1-2 valid clusterrel jön vissza (mindegyik 7/7 pont megfelel), 1 cluster = 1 új landing, 10-15 perc per landing.

**Ha Codex 0 valid clustert hoz:** ez nem kudarc — azt jelenti, hogy a "petty cash" / "cash handoff" / "cash log" semantic-tér jelenleg **kompetitíven telített** rövidtávon, és az értékesebb action: **meglévő top-30-as ranking-ek bővítése + `dateModified` re-crawl-trigger sweep**.

### J.13.3 Az új landing-ek mérési-protokollja (ha Codex 2nd gap-hunting talál rést)

Mivel a J.12.6-ban a homepage `<title>` shift és 3 landing pain-language tweak már degradálta a Phase 1 Apposing hipotézis-mérési-ablakát, **a 14-napos checkpoint (## B) most 2026-05-17-re csúszik** (eredetileg 05-12). Ha Codex talál rést és ezen iterációban új landing(ek) is kimennek, akkor:

- A 14-napos checkpoint 2026-05-19-re csúszik (3 nappal tovább, az új landing-ek minimum 14-nap indexelési-ablakához)
- A new-landing performance-mérése **különálló kohorszként** értékelendő (nem mosható össze a Phase 1 Apposing 3-oldalas kohorsszal)
- A new-landing `<lastmod>` és sitemap-resubmit kötelező commit után

### J.13.4 Codex 2nd batch eredmény (2026-05-03 01:00) — 5 cluster + cannibalization-audit + 1 új URL + 3 meglévő bővítés

**Codex 2nd batch beérkezett** (a J.13.2 receiving-template alapján): 5 új cluster + 5 megerősített "elhagyandó" cluster.

**Codex 5 új cluster:**

| # | Cluster | SERP top 5 | Forum/PDF evidence | SpendNote feature-fit |
|---|---|---|---|---|
| 1 | `cash handover receipt form` / `cash handoff receipt` | Jotform / Scribd / form-template, gyenge SaaS-kategória | Jotform cash handover receipt form | ★★★★★ — core feature |
| 2 | `cash box request form` / `PTO cash box request form` | PTO Today, helyi PTO oldalak, PDF-ek | PTO Today cash box request form | ★★★★ — operational handoff |
| 3 | `event cash count sheet` / `post-event cash count form` | Templateroller, church/school PDF-ek | Templateroller cash counting sheet for events | ★★★ — close-out flow |
| 4 | `cash box log` + event/PTO/fundraiser context | sportsklub/policy oldalak, PDF-ek | McKinney Ice Hockey cash box log policy (két volunteer, starting cash, closeout) | ★★★★ — core feature |
| 5 | `petty cash envelope` (film/production) | GreenSlate, Wrapbook, Revolution | GreenSlate petty cash envelope, Wrapbook petty cash | ★★ — specializált niche |

**Codex 5 megerősített elhagyandó (Codex saját ELHAGY-listája):**
- `cash drawer reconciliation` (POS/restaurant — Toast/Lightspeed/Lavu)
- `cash collection tracker` (SAP/AR)
- `cash envelope tracker` (Dave Ramsey personal budgeting)
- `cash float tracker` (POS/hotel)
- `missing receipts` (expense management OCR óriások)

**Cannibalization-audit (Opus végrehajtott, J.12.4 protocol szerint):**

| Codex cluster | Meglévő SpendNote URL | Cannibalization | Akció |
|---|---|---|---|
| 1. cash handover receipt form | `/cash-handoff-receipt` (handover már szerepel meta+H1-ben) | ★★★★★ TELJES MATCH | **BŐVÍT a meglévőn** — `form` keyword integration title+meta+H2 |
| 2. PTO cash box request form | NINCS | ✅ tiszta | **ÚJ landing**: `/cash-box-request-form` |
| 3. event cash count sheet | `/cash-count-sheet-template` (általános) | ⚠️ részleges overlap | **BŐVÍT a meglévőn** — új H2 "Event Cash Count Sheet & Post-Event Close-Out" |
| 4. cash box log fundraiser/event/PTO | `/event-cash-handling` (most "Shared Cash Log for Volunteers & Booths" tweak) + `/who-has-the-cash-right-now` (most office cash log H2) | ⚠️ részleges overlap | **BŐVÍT a meglévőn** — új H2 "Cash Box Log for Fundraisers, PTAs, PTOs & Booster Clubs" az event-cash-handling-en |
| 5. petty cash envelope (film) | NINCS | ✅ tiszta | **DEFER** — Codex maga is mondja "csak ha érdemes film felé nyitni" |

**Eredmény: 1 új URL + 3 meglévő bővítés + 1 defer.**

#### J.13.4.1 Új landing: `/cash-box-request-form` (Codex #2)

- **`<title>`:** `Cash Box Request Form — Hand Off & Get It Back, Every Time`
- **Meta description (pain-hook):** `Volunteers grabbing the cash box at an event? Track every request — who took it, how much was inside, and when it came back — instead of guessing at close-out.`
- **H1:** `Cash Box Request Form`
- **Hero subtitle:** Pain-vocab opening (PTA bake sale, fundraiser, game night, school dance, registration table)
- **Body szerkezet (8 H2):** When You Need / Lifecycle 5-Step (Request → Handoff → Track → Close Out → Return) / What to Include / PTA-PTO-School-Volunteer Use Cases / Why Paper Isn't Enough / From Paper to Live Log / FAQ / Related
- **Schema:** Article + FAQPage (5 Q) + SoftwareApplication page-specific (`applicationSubCategory: "Cash Box Request Tracking"` + 6-elemű `featureList`)
- **Compliance (Tier B disclaimer — strengthened a school/nonprofit donor-receipt zóna miatt):** `SpendNote tracks the operational cash box workflow — who held the box, what came in, what went out. SpendNote is not a donor receipt system, not a charitable contribution tracker, and not a tax document. For 501(c)(3) donor receipts (US IRS $250 rule), Form 990 reporting, UK Gift Aid claims, or any tax-deductible donation acknowledgment, your treasurer, accountant, or dedicated nonprofit accounting tool handles those.`
- **Internal link diversification (5 anchor):** `/cash-handoff-receipt`, `/event-cash-handling`, `/who-has-the-cash-right-now`, `/cash-count-sheet-template`, `/petty-cash-policy-template`
- **Sitemap:** új sor `priority 0.8`, `lastmod 2026-05-03`

#### J.13.4.2 `/cash-handoff-receipt` bővítés (Codex #1)

- **`<title>` rewrite:** `Cash Handoff Receipt (Handover) — Sign & Print` → `Cash Handover Receipt Form — Sign & Print Cash Handoff`
- **Meta description rewrite:** "for shift changes and internal transfers" → "for shift changes, **volunteer handoffs**, and internal transfers"
- **og:title + twitter:title:** ugyanaz, `Cash Handover Receipt Form — Sign & Print Cash Handoff`
- **Article schema headline + description:** frissítve "form" + "volunteer handoffs" inclusion-nel
- **Új use-case-box body-ban:** `Volunteer & Event Handoffs` — PTA bake sales, school fundraisers, sports concession stands, festival booths + internal link `/cash-box-request-form`
- **dateModified:** 2026-05-02 → 2026-05-03

#### J.13.4.3 `/event-cash-handling` bővítés (Codex #4)

- Új `<h2>Cash Box Log for Fundraisers, PTAs, PTOs & Booster Clubs</h2>` szekció (a "How SpendNote Works for Events" után, a "Frequently Asked Questions" előtt)
- 5-elemű use-case bullet list: bake sale tables, ticket booths, raffle stands, snack bars + treasurer-shared visibility
- Internal link: `/cash-box-request-form` (request flow) + `/cash-count-sheet-template` (close-out denomination count)
- Pain-vocab: "binder at the treasurer's table", "whose handwriting is this?", "send me your version"
- (Title + meta description már a J.12.6-ban "Shared Cash Log for Volunteers & Booths"-ra állítva — nem érintve)

#### J.13.4.4 `/cash-count-sheet-template` bővítés (Codex #3)

- Új `<h2>Event Cash Count Sheet & Post-Event Close-Out</h2>` szekció (a "When to Use" után, a "From Paper Sheet" előtt)
- 3-bekezdéses content + Codex value-prop blockquote: "A cash count sheet tells you the total after the event. SpendNote records every cash handoff *during* the event — so the close-out count actually has something to be compared against."
- Internal link: `/cash-box-request-form` (request flow) + `/event-cash-handling` (operational backbone)
- Meta description rewrite: + "Plus event & post-event close-out flow."
- dateModified: 2026-05-02 → 2026-05-03

#### J.13.4.5 DEFER: `/petty-cash-envelope` film/production (Codex #5)

NEM most. Codex maga is megjegyezte: "Erős intent, de specializált és verseny van. Csak akkor mennék rá, ha Opus szerint érdemes film/production felé nyitni." Indok: SpendNote pozitionálás operational team-cash-handoff (PTA/SMB/event), NEM film-production-specific (GreenSlate/Wrapbook erős industry-fit). Backlog: ha 14-napos checkpoint mutatja hogy a `/cash-box-request-form` PTA-cluster traffic-ot húz, akkor érdemes film-production angle-t **különálló kohorszban** is teszt-landing-ezni, DE most a fókusz a PTA/SMB/event vertical.

### J.13.5 Indexing-prioritás (felhasználói task — opcionális, GSC kvóta-figyelve max 5/nap)

Új URL → első indexelés:
1. **`https://spendnote.app/cash-box-request-form`** (P0 — új landing, GSC URL Inspection → "Request Indexing")

Bővített URL-ek → re-crawl trigger:
2. `https://spendnote.app/cash-handoff-receipt` (P1 — `<title>` shift "form"-ra)
3. `https://spendnote.app/event-cash-handling` (P1 — új H2 cash-box-log szekció)
4. `https://spendnote.app/cash-count-sheet-template` (P1 — új H2 event-cash-count szekció)

A J.12.6-os 5 URL-t (homepage + 4 landing) **az előző commit-tal együtt** kell indexelni (max 5/nap kvóta!).

### J.13.6 Sitemap-resubmit Bing Webmaster Tools-on is

A `<lastmod>` 9 oldalon frissült 2026-05-03-ra ezzel az iterációval:
- `/` (homepage)
- `/cash-paid-out-log`
- `/event-cash-handling`
- `/petty-cash-does-not-balance`
- `/who-has-the-cash-right-now`
- `/cash-handoff-receipt` (új)
- `/cash-count-sheet-template` (új)
- `/cash-box-request-form` (új URL)

**Bing Webmaster Tools** sitemap-resubmit ajánlott a 9 frissített URL-re, mert a Bing crawl-szabad kapacitása nagyobb, mint Google-é, és gyorsabban jelennek meg az eredmények ott. (3 új oldal + 4 meta-tweak + cloud/online framing + Pro Custom Labels conversion-content után, sleep-on-it fázis) — REFERENCIA

## J.14 GSC indexing-audit (2026-05-05) — sitemap ↔ noindex koherencia-szabály

**Trigger:** Felhasználó a GSC `Indexelés > Oldalak` riportban "káoszt" jelzett (Indexelt 46 / Nem indexelt 33). 6 GSC screenshot diagnózisa után 5 anomália került azonosításra:

### J.14.1 Az 5 anomália

| # | URL | Sitemap | Meta robots | GSC státusz | Diagnózis |
|---|-----|---------|-------------|-------------|-----------|
| 1 | `/how-to-manage-petty-cash-small-business` | **VAN** | `noindex, follow` | "Feltérképezve – jelenleg nincs indexelve" (gyaníthatóan) | **ÖNMAGUNKKAL HARCOLUNK** — sitemap mondja "indexeld", meta robots mondja "ne indexeld" |
| 2 | `/cash-box-request-form` | VAN | `index, follow` | Még nincs az indexed-listán (49 példa) | NORMÁL — új URL (2 napos), indexing-request 2026-05-03-án ment ki, Google 2-7 nap szokott |
| 3 | `/babysitter-cash-payment-receipt` | VAN | `index, follow` | NINCS az indexed-listán | "Feltérképezve – jelenleg nincs indexelve" gyaníthatóan — minőség/duplikátum-szignál |
| 4 | `/petty-cash-log-template` | NINCS (kivettük 2026-04-10) | `noindex, follow` | MÉG INDEXELT (utolsó crawl 2026-03-03) | NORMÁL ZAJ — Google őrzi a régi indexet, mert nem crawl-olta újra a noindex óta |
| 5 | `/what-is-petty-cash` | NINCS (kivettük 2026-04-10) | `noindex, follow` | MÉG INDEXELT (utolsó crawl 2026-04-09) | UGYANAZ — várjuk a következő re-crawlot |

### J.14.2 Root cause: a `69907f4` commit (2026-04-28) "previously missing" hiba

A `7fba051` commit (2026-04-10) szándékosan kivette a sitemap-ből a 6 noindex-elt oldalt (köztük `/how-to-manage-petty-cash-small-business`). 18 nappal később a `69907f4` commit-üzenet azt írta: "*also added the previously missing how-to-manage-petty-cash-small-business URL*" — vagyis **véletlenül "hibásnak gondolva" visszatette**, anélkül hogy ellenőrizte volna a meta robots tag-et. Klasszikus self-foot-shooting: a Google a sitemap-utasítást követve crawl-olta, majd a meta robots ütközés miatt nem indexelte → a 3 "Feltérképezve – jelenleg nincs indexelve" egyik biztos lakója lett 1 hete.

### J.14.3 Fix (2026-05-05) — 1 sor a sitemap-ből

`sitemap.xml`: `/how-to-manage-petty-cash-small-business` URL block törölve (50 → 49 URL). A `.html` fájl noindex marad — szándékosan, mert a 04-10-i "worst performers" döntés érvényben van.

### J.14.4 ÚJ KOHERENCIA-SZABÁLY (preventív)

**Sitemap-be tett URL-eknek `index, follow` (vagy hiányzó) meta robots-szal kell rendelkezniük.** A két jelzésnek mindig **egybe kell hangoznia**, különben a Google "Feltérképezve – jelenleg nincs indexelve" buktatóba kerül és minőség-szignált is leoszt érte.

**Audit-script** (manuálisan futtatható ellenőrzés, ad-hoc commit-előtt):

```bash
# pszeudo-Node, sitemap.xml-ben szereplő minden URL <-> .html fájl meta robots koherencia-check
node -e "const fs=require('fs');const xml=fs.readFileSync('sitemap.xml','utf8');const urls=[...xml.matchAll(/<loc>([^<]+)</loc>/g)].map(m=>m[1].replace('https://spendnote.app',''));for(const u of urls){let f=u==='/'?'index.html':u.slice(1)+'.html';if(!fs.existsSync(f)){console.log('MISSING FILE:',u);continue;}const c=fs.readFileSync(f,'utf8');const m=c.match(/<meta\s+name=[\"']robots[\"']\s+content=[\"']([^\"']+)/i);if(m && m[1].toLowerCase().includes('noindex'))console.log('CONFLICT:',u,'['+m[1]+']');}"
```

**Mikor futtassuk:** minden olyan commit ELŐTT, ami `sitemap.xml`-t VAGY HTML-fájl `<meta name="robots">` tag-et érint.

### J.14.5 Felhasználói GSC-teendők (a fix után)

1. **Sitemap-resubmit** GSC-ben (Indexelés > Sitemapek → újra "Beküldés"), hogy a Google észrevegye az URL-eltávolítást → így a `/how-to-manage-petty-cash-small-business` "Feltérképezve – jelenleg nincs indexelve" sorból "Kizárva noindex címke miatt" sorba költözik (legitim kategória, nem minőség-leszámolás).
2. **Diagnózis-ellenőrzés:** GSC > Indexelés > Oldalak > "Feltérképezve – jelenleg nincs indexelve" sorra kattintva a 3 érintett URL listája megjelenik. **Várt eredmény** a fix után 1-2 héten belül:
   - `/how-to-manage-petty-cash-small-business` → eltűnik (átkerül "noindex" sorba)
   - `/cash-box-request-form` → eltűnik (indexelődik)
   - `/babysitter-cash-payment-receipt` → marad (külön analízis kell — minőség, vagy belső link-erősítés a `/handyman`/`/tutor`/`/contractor` cluster-társakból)
3. **Indexing-request NEM kell** a `/how-to-manage-petty-cash-small-business`-re — szándékosan elengedjük (worst performer, 04-10-i döntés érvényes).
4. **`/babysitter-cash-payment-receipt`-re** opcionálisan indexing-request beadható (ha kvóta engedi), DE előtte érdemes 1-2 internal linket adni hozzá a hasonló thematikájú `/tutor-cash-payment-receipt` és `/handyman-cash-payment-receipt` oldalakból, hogy ne csak a sitemap-ből és a homepage footer-ből legyen elérhető.

### J.14.6 Tanulság

- A `index, follow` és `noindex, follow` címkék **státuszkódot** jelentenek a Google-nak; a sitemap **felfedezési listát**. A kettőnek egybe kell csengenie, különben a sitemap "promise"-ot követő Googlebot a meta robots-tól rosszallás-jelet kap.
- A "Feltérképezve – jelenleg nincs indexelve" kategória **minőség-szignált is hordoz**: a Google nemcsak hogy nem indexel, de a domain-szintű minőség-pontszámodat is rontja, ha sok URL-ed kerül ide. Ezért az ilyen konfliktusokat **azonnal** rendezni kell.
- "Previously missing" típusú commit-üzeneteknél (különösen multi-agent környezetben) ALAPSZABÁLY: ellenőrizni a meta robots tag-et a fájl head-jében — NE feltételezzük, hogy "csak véletlen volt kihagyva".

### J.14.7 `/babysitter-cash-payment-receipt` audience-pivot + teljes tartalom-átírás (2026-05-05 21:35)

**Trigger:** A J.14.5 alapján a felhasználó kért belső linkeket erre az URL-re, mert a 3 "Feltérképezve – jelenleg nincs indexelve" egyik gyanús lakója. Az audit során kiderült: a 4 cluster-társ + `/spendnote-resources` MÁR linkel kifelé `/babysitter`-re — tehát **nem link-szám hiány** a probléma. A felhasználó kérte: "a title és a meta nem szorul javításra a babysitter oldalon? Az egész oldalt írd át ha szükséges, mert nem tudom milyen zagyvaság van benne."

**Diagnózis:** Az oldal **audience-perspective inkonzisztens** volt — a meta description **szülő-szemszögből** szólított ("Paying your babysitter in cash?"), de a hero + 4 use-case-box + How It Works + FAQ **a babysitter szemszögéből** beszélt ("Family pays YOU"). Ez tipikus zagyvaság: a Google sem érti, ki a kereső közönség, és a SERP-snippet sem ad világos pain-point-ot egy konkrét audiencre.

**Pivotálás:** Kettős audience (parent + sitter), semleges hangnem. A fő keresési intent valójában **több szülőt** takar (Child and Dependent Care Credit / Dependent Care FSA tracking, házi-költségvetés), mint sittert — de mindkét közönséget meg kell szólítani egyszerre.

**Mit írtunk át (single commit):**

| Elem | ELŐTTE | UTÁNA |
|---|---|---|
| `<title>` | `Babysitter Cash Payment Receipt — Instant Proof for Families` | `Babysitter Cash Payment Receipt — Track Every Sitter Payment` |
| Meta description | `Paying your babysitter in cash? Create a receipt in 30 seconds as proof for both sides. Track every payment by family, date, and amount.` | `Paying your babysitter in cash? Log every payment in 30 seconds and keep one searchable record both the family and the sitter can check — no template, no paper slips.` |
| OG/Twitter title+desc | szinkron a régi-vel | szinkron az új-jal |
| Article schema headline | `Babysitter Payment Receipt - Track Every Payment` | `Babysitter Cash Payment Receipt — Track Every Sitter Payment` |
| Article schema description | sitter-only | kettős audience + "Not a tax document" |
| H1 | `Babysitter Payment Receipt` | `Babysitter Cash Payment Receipt` (alignment a title-vel) |
| Hero p | sitter-szemszög (`Family pays you`) | semleges (`Cash on the kitchen counter, then days later: "wait, did we pay you for last Thursday?"`) |
| CTA button | `Create Babysitting Payment Receipt` | `Track Every Babysitter Payment` |
| Why H2 | `Why Keep Receipts for Babysitting?` (sitter-only Johnson példa) | `Why Both Sides Want a Receipt for Cash Babysitting` (kettős perspektíva) |
| Who 4 use-case-box | mind sitter-szempontú (Regular Babysitters / Nannies / Occasional Sitters / Tutors) | kettős (Families Paying Sitters / Babysitters & Nannies / Parents Tracking Multi-Sitter / Tutors+Cash-Paid Helpers) — 2 parent + 2 sitter |
| How It Works | `Open SpendNote AFTER THE FAMILY PAYS YOU` (sitter only) | `After cash changes hands, open SpendNote ... Tap IN if sitter, OUT if family` (semleges, mindkét oldal) |
| Disclaimer-box | általános "not tax doc" | erősített: explicit említi Form W-10, Form 2441, 1099, Schedule H, Dependent Care FSA — mind amit SpendNote NEM csinál |
| `This Is Not a Tax Document` H2 | általános 2-bullet | TIER A disclaimer: "Especially Not for the Child Care Credit", explicit Form-felsorolás, "use a tax professional / nanny payroll service" |
| FAQ | 4 sitter-only kérdés | **7 kérdés** kettős audience: 2 parent (`Do I need to give...?` + `Can families track multiple sitters?`), 2 sitter (`Should a babysitter give...?` + `Multiple families?`), 1 közös tax (`Is it a tax document?`), **1 compliance-border (`Does this help with CCTC/FSA?`)**, 1 cluster-bridge (tutors/nannies/dog walkers) |
| FAQPage schema | 4 kérdés | 7 kérdés szinkron a HTML-lel |

**Compliance-border erősítés (TIER A disclaimer szint):**

A US Child and Dependent Care Credit (Form 2441) és Dependent Care FSA téma **különösen veszélyes terület** — sok kereső azt hiszi, hogy egy "babysitter receipt template" elég lesz a tax credit-hez. Az új tartalom **explicit** kimondja:
- A Form W-10 (sitter TIN/SSN) SpendNote-ból NEM jön
- A Form 2441 (a credit maga) SpendNote-ból NEM jön
- A 1099 / Schedule H (nanny payroll) SpendNote-ból NEM jön
- A Dependent Care FSA reimbursement SpendNote-ból NEM jön
- "Use SpendNote for the cash record; use a tax professional or tax software for the credit claim" — egyértelmű határvonal

Ez a J.10 (köznyelvi vocabulary) és F-policy (compliance border) szerint **TIER A** disclaimer-szint, mert specifikus form-okat NEVEZÜNK MEG amit NEM csinálunk. A tax-keresőket **proaktívan** elirányítjuk a megfelelő toolhoz/szakemberhez ahelyett, hogy hagynánk őket azt hinni, "lesz nálunk valami credit form is".

**Kapcsolódó: 4 cluster-társ anchor-diverzifikáció (single commit):**

| Forrás | RÉGI anchor | ÚJ anchor + extra |
|---|---|---|
| `/tutor` floor-link | `Babysitter cash payment receipt` | `cash receipts for babysitters and nannies` + **új inline kontextus-link** a "Why Tutors Need Receipts" után (cross-cluster bridge: same family multi-service contact) |
| `/handyman` floor-link | `Babysitter cash payment receipt` | `babysitting payment receipt for families` |
| `/contractor` floor-link | `Babysitter cash payment receipt` | `nanny & babysitter cash receipts` |
| `/cash-payment-received-proof` | már jó (inline + külön) | NEM piszkáljuk |
| `/spendnote-resources` | `Babysitter Payment Receipt` | NEM piszkáljuk (resources-list legitim szintenként ismétlődő anchor) |

### J.14.8 Sitemap lastmod bump (4 URL)

`<lastmod>` 2026-04-26 → 2026-05-05 az alábbi 4 URL-en:
- `/babysitter-cash-payment-receipt` (full content rewrite)
- `/tutor-cash-payment-receipt` (1 inline link + 1 anchor)
- `/handyman-cash-payment-receipt` (1 anchor)
- `/contractor-advance-payment-receipt` (1 anchor)

### J.14.9 Future image-uniqueness backlog (NEM most)

A `/tutor-cash-payment-receipt` oldal a `/babysitter`-ből kölcsönzi mind a 3 SEO-illusztrációt (`assets/images/seo/babysitter/babysitter-*.png`). Ez **erős duplikátum-szignál Google szerint** — két különböző URL-en ugyanaz az image-fingerprint = "ugyanaz a content gyanú". A `/handyman` és `/contractor` is megosztják egymás között a `contractor/contractor-*.png` képeket.

**Backlog tétel** (nem most, mert nem akarunk újabb large-scope sprint-et indítani a 14-napos checkpoint előtt):
- 3 új tutor-specifikus képet generálni: `assets/images/seo/tutor/tutor-cash-payment-print-receipt.png`, `tutor-cash-payment-entry-form.png`, `tutor-payment-history-transaction-list.png`
- (esetleg) 3 új handyman-specifikus képet — `assets/images/seo/handyman/handyman-*.png`
- A target page sitemap `lastmod` bump és (kvóta engedi) GSC indexing-request

**Várható hatás:** image-fingerprint diversification → Google "thin/duplicate content" gyanúja csökken → a `/tutor` (és potenciálisan `/handyman`) oldal indexelési minőség-pontszáma javul.

### J.14.10 Felhasználói GSC-teendők a J.14.7 fix után (opcionális)

1. **GSC indexing-request** `/babysitter-cash-payment-receipt`-re (ha kvóta van) — most már jelentős content-rewrite + audience-pivot + 7 FAQ + erősített compliance-disclaimer van, friss `dateModified` = 2026-05-05. Friss-szignál + tartalom-frissesség **erős re-crawl trigger**.
2. **Sitemap-resubmit** GSC-ben (mind a 4 cluster-társ `lastmod`-ja frissült).
3. **Várt eredmény 1-2 hét múlva:** a `/babysitter` átkerül a "Feltérképezve – jelenleg nincs indexelve" sorból az "Indexelt" sorba. Ha NEM, akkor az image-uniqueness backlog (J.14.9) válik elsőbbségi tétellé.

## J.14.11 `/babysitter` audience-pivot RÉSZLEGES VISSZAVONÁS (B-opció, 2026-05-05 22:00) — sitter-primary + multi-sitter household secondary, alkalmi szülő explicit elhárítása

**Trigger:** A J.14.7-es kettős audience (parent + sitter, egyenrangú) átírást a felhasználó **azonnal megkérdőjelezte** ezzel a kérdéssel: *"akkor ezt a trackert mi a szülőknek ajánljuk???"*. A kérdés **valós ellentmondást** tárt fel az új tartalom és a SpendNote core pozícionálása közt.

### J.14.11.1 Az ellentmondás

| Hely | Pozícionálás |
|---|---|
| `index.html` `<title>` | `Cash Handoff Tracking & Receipts **for Teams**` |
| `index.html` meta description | `...for **small teams**` |
| `spendnote-pricing.html` | `**$15.83/mo**`, `**Solo users & small teams**`, `+$5/user` |
| `spendnote-pricing.html` meta | `Track **petty cash**` (business-vocabulary) |
| `/tutor`, `/handyman`, `/contractor` cluster-társak | mind **service-provider** szemszögből |
| `/babysitter` (J.14.7 átírás után) | **kettős audience egyenrangúan** — sitter ÉS szülő egyformán szólítva ⚠️ ELLENTMOND |

**A baj amit J.14.7 nyitott:** egy alkalmi szülő rákattan a `Track Every Babysitter Payment` CTA-ra → meglátja a `$15.83/hó` pricing-et → **bouncel**. Ez **rosszabb mint az eredeti**, mert a Google a high bounce rate-et minőség-szignálnak veszi (helpful content update).

### J.14.11.2 A 3 audience-szegmens valódi piaci-fit-je

| Szegmens | Fizetne $15.83/hó-t? | Indoklás |
|---|---|---|
| **Sitter/nanny aki HETI cash-t kap több családtól** | ✅ IGEN | Tracking valódi pain (hány session, melyik család tartozik, recurring payment history) |
| **Multi-sitter household manager** (1 nappali nanny + 2 backup sitter + 1 esti tinédzser) | ✅ IGEN | Sok contact + recurring + valódi spreadsheet-elhárítási vágy |
| **Alkalmi szülő** (havi 2× $80 sitter pénteken) | ❌ NEM | Notes app vagy 1 sor Excel elég → bait-and-switch ha SpendNote-ra utaljuk |

A J.14.7 átírás mind a 3-at egyformán szólította meg → a 3. (legtömegesebb) bouncel.

### J.14.11.3 3 opció a felhasználói megfontolásra

A felhasználó kérte ki a véleményemet, és én **B-t** ajánlottam:

- **A) BACKTRACK 100% sitter-only**: legtisztább konzisztencia, de a multi-sitter household manager szegmenst is "kidobja"
- **B) RÉSZLEGES BACKTRACK** ⭐ (felhasználó választása): sitter-primary, 1 use-case-box megmarad a multi-sitter household manager-nek (tényleg fizetne!), alkalmi szülőt **explicit elhárítjuk** egy új H2-vel ("Heads-Up: This Is for Sitters Who Deal with Cash Often")
- **C) MARAD AHOGY J.14.7 LETTE**: max forgalom-pool, de bait-and-switch kockázat

### J.14.11.4 B-opció implementáció (1 commit, csak `/babysitter-cash-payment-receipt.html`)

| Elem | J.14.7 (kettős, egyenrangú) | J.14.11 (B-opció: sitter-primary, multi-sitter HH secondary) |
|---|---|---|
| `<title>` | `Track Every Sitter Payment` | **`Track Cash from Every Family`** (sitter-side, "every family" = multi-family sitter persona) |
| Meta description | szülő-nyitó (`Paying your babysitter in cash?`) | **sitter-nyitó** (`Sit for several families, all in cash?`) |
| OG/Twitter sync | egyenrangú | sitter-nyitó sync |
| Article schema headline | `Track Every Sitter Payment` | `Track Cash from Every Family` |
| Article schema description | "How families and babysitters can document..." | "How babysitters and nannies who get paid in cash by multiple families log every payment..." |
| H1 | marad | marad (`Babysitter Cash Payment Receipt`) |
| Hero p | semleges (`Cash on the kitchen counter, then days later`) | **sitter-narratíva** (`You sit for the Garcias on Tuesdays, the Johnsons on Thursdays...`) |
| CTA | `Track Every Babysitter Payment` | **`Track Every Family's Payments`** (sitter-side aktív) |
| Why H2 | `Why Both Sides Want a Receipt` | **`Why a Babysitter Needs a Receipt for Every Cash Session`** (sitter-side) |
| **ÚJ H2** | nem volt | **`Heads-Up: This Is for Sitters Who Deal with Cash Often`** — explicit elhárítja az alkalmi-sittert + alkalmi-szülőt, megnevezve a $15.83/hó pricing-et és a Notes app/Excel alternatívát ("don't buy a tool you don't need") |
| Who 4 use-case-box | 2 parent + 2 sitter | **3 sitter + 1 multi-sitter household manager** (Regular Multi-Family Babysitters / Nannies Paid Weekly / **Household Managers Tracking Multiple Sitters** / Tutors+Helpers); a Household Manager box-ban **explicit kizárás**: "(For an occasional Friday-night sitter, you don't need this — the Notes app is enough.)" |
| What | semleges (`Family name (sitter side) or sitter name (family side)`) | **sitter-side** (`Family name — Who paid you`) |
| How It Works | semleges (`Tap IN if sitter, OUT if family`) | **sitter-side** (`Tap "IN" (you're receiving cash)`) |
| Disclaimer-box | TIER A | TIER A megmarad, de finomítva a sitter-szempont előtérbe (`If the sitter needs to report... or if a family wants to claim CCTC...`) |
| Tax H2 | TIER A | TIER A megmarad, de bullet-ek és szöveg sitter-szempontú nyitással |
| FAQ | 7 kérdés (2 parent + 2 sitter + 1 közös tax + 1 CCTC + 1 cluster bridge) | **6 kérdés** (2 sitter + 1 közös tax + **1 multi-sitter household manager** [explicit pricing-mention + alkalmi szülő elhárítás] + 1 CCTC + 1 cluster bridge) |
| FAQPage schema | 7 kérdés | 6 kérdés szinkron |

### J.14.11.5 Az új "Heads-Up" H2 mint E-E-A-T-szignál

Az új második H2 (`Heads-Up: This Is for Sitters Who Deal with Cash Often`) az E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness) Google-szignál egyik kulcseleme: **proaktívan elirányítjuk a rossz közönséget**. A szöveg explicit:

> Be honest with yourself: **SpendNote is a paid tool from $15.83/month** and earns its keep when you have several families, several rates, or several months of cash payment history to keep straight. If you sit for one family every other Friday, the Notes app or a single Excel row will do — **don't buy a tool you don't need**.

Ez **counter-intuitive SEO-mozdulat** (eltagad érdekeltséget!), de a Google helpful-content update óta **erősen jutalmazza** az ilyen "honesty signal"-okat: a kereső közönség egy részét tudatosan kizárjuk, hogy a maradék közönség jobban konvertáljon.

### J.14.11.6 Tanulság — "AUDIENCE-FIT KOHERENCIA" új SEO-szabály (preventív)

**Új szabály a F-policy-ba (vocabulary blacklist mintájára):** Egy SEO-landing page-en az **audience-fit-nek koherensnek kell lennie a SpendNote core pozícionálásával** (`for teams` / `Solo users & small teams`, $15.83/hó+ business-pricing).

**Tilos:**
- Olyan személyt konzumer-szempontból megszólítani CTA-val, aki a $15.83/hó pricing-tier szempontból **nem fizetne** (alkalmi szülő, family budget-tracking, household-finance, personal expense tracking)
- "Both-sides" framing a céloldal hero-ban / fő CTA-ban, ha az egyik oldal nem fizetne

**Megengedett:**
- Konzumer-szempont **secondary** szegmensként, ha valós piaci-fit van (pl. multi-sitter household manager, multi-volunteer event organizer)
- Konzumer-szempont **informational** szinten (FAQ, side-context), de **nem hard-CTA**
- **E-E-A-T-szignál**: explicit elhárítás a rossz audience-től ("ha alkalmi sittered van, ez NEM neked való — Notes app elég")

**Audit-kérdés** minden új SEO-landing-nél: "Ez az olvasó tényleg fizetne $15.83/hó-t a SpendNote-ért, vagy bouncelni fog amikor megnyitja a pricing-page-et?" Ha a válasz NEM a fő audience-re, **nem írjuk meg neki a CTA-t**.

### J.14.11.7 Felhasználói GSC-teendők (J.14.11 fix után)

> **2026-05-05 23:50 — felhasználói döntés (J.14.10 + J.14.11 + J.14.12 + J.14.13 + cluster-link sweep mindegyikére kiterjesztve):** **NEM kérünk** indexing-request-et és **NEM csinálunk** sitemap-resubmit-et a mai (2026-05-05) változtatásokra. Indok: a 04-30 körüli hétvégi tartalmi-dömpinget a Google még nem dolgozta fel (van olyan friss URL ami még indexelve sincs), úgyhogy a kvóta-égetés értelmetlen lenne. A friss `lastmod` (sitemap.xml) + `dateModified` (Article schema) a következő organikus crawl-cycle-en jelez. A lenti pontok (`indexing-request`, `sitemap-resubmit`) csak referencia — most NEM hajtjuk végre.

1. ~~**GSC indexing-request** `/babysitter`-re (ha kvóta van) — major content rewrite + friss `dateModified` 2026-05-05T22:00 = erős re-crawl trigger~~ — **NEM most** (lásd fenti döntés)
2. ~~**Sitemap-resubmit** GSC-ben (a `/babysitter` `lastmod` 2026-05-05 marad — már a J.14.7-tel friss)~~ — **NEM most**
3. **Várt eredmény 1-2 hét múlva** (organikus crawl, nem manuális push):
   - A SERP-snippet konkrét sitter-pain-point-tal jelenik meg (`Sit for several families, all in cash?`)
   - A bounce rate alacsonyabb mint J.14.7 lett volna (alkalmi szülő nem kattant rá, csak akit megfog a "several families" pain)
   - A `/babysitter` átkerül a "Feltérképezve – jelenleg nincs indexelve" sorból az "Indexelt"-be

## J.14.12 `/digital-petty-cash-book` MULTI-SITE PIVOT (2026-05-05 23:00) — téma-audit alapú teljes átírás, dual-keyword stratégia

### J.14.12.1 Trigger + 0. lépés (téma-audit ELŐSZÖR, szöveg-fix UTÁNA)

**Trigger:** Felhasználó: *"ma ezt az oldalt nézd még meg, mert nagyon mélyen van: https://spendnote.app/digital-petty-cash-book"*. Ez a heti-modell (2-3 oldal/hét mély-átírás) első konkrét feladata, miután a J.14.11 lezáródott és a J.15 backlog rögzítve lett.

**Új SEO-meta-szabály a J.14.12-ből: TÉMA-AUDIT ELŐSZÖR.** Mielőtt belefognánk egy "mély oldalt fel kell hozni" feladatba, **0. lépésként** kötelező eldönteni: ez a téma egyáltalán hozható-e fel? A 4 sors-opció (A átírás / B noindex / C redirect / D törlés) közüli választás MEGELŐZI a szöveg-szintű audit-ot. Anélkül egyébként hetekig csiszolhatunk egy oldalt, ami **eleve zero-volume query-re** céloz, és semmilyen szöveg-átírás nem fogja felhozni.

### J.14.12.2 SERP-elemzés (6 query) — cannibalization-felfedezés

A `digital petty cash book` cluster jelenlegi 4 oldala próbál ugyanazért az intent-ért versenyezni → Google nem tudja eldönteni melyik a "fő" oldal → mind alacsonyabb pozícióra kerül.

| Query | SERP-pos (mi) | Top 5 versenytárs | Verseny | Sikerpotenciál |
|---|---|---|---|---|
| `petty cash app vs excel` | **#1** + #2 (saját `/how-to-start-petty-cash-box`) | spendnote, spendnote, pemo.io, pocketclear, enerpize | gyenge | EGYÉRTELMŰ NYERTES (niche-protect) |
| `digital receipt book` | **#2** | ceipto.com #1, leafstash, mmcreceipt, spendnote/small-business | közepes (ceipto) | push #1-re reális (jövő-heti backlog) |
| `digital petty cash book` | **#1** | usepetty.cash, enkash, swipey | gyenge | DE 0 impr GSC-ben → **zero-volume megerősítve** |
| `petty cash book online` | nem top 5 | usepetty.cash, jotform, **spendnote homepage**, pettycashweb, **spendnote/petty-cash-log-template** | közepes | cannibalization (nem az `/digital-petty-cash-book` jön be, hanem 2 másik saját oldal) |
| `petty cash app` | nem top 5 (a HOMEPAGE jön be) | usepetty.cash, **spendnote homepage**, jettycash, pleo, play.google | erős | másik cannibalization → jövő-heti audit (J.14.13 jelölt) |
| `petty cash book` (generic) | NEM versenyzünk | fitsmallbusiness, smallbusiness.chron, accountingtools, beginner-bookkeeping, shopify | erős, info-intent | helyes — tool-oldal nem nyer info-intent-re |

### J.14.12.3 GSC-evidencia (felhasználói screenshot) — friss SERP-jel, dual-keyword pivot kiváltó

**`/digital-petty-cash-book` GSC OLDALAK riportja:** 0 kattintás, **2 megjelenés**, 0% CTR, **#80 pos**. A 2 impression **MIND** az `online cash book` query-re jött (LEKÉRDEZÉSEK riportból).

**Két kulcsfelismerés:**
1. A `digital petty cash book` (a régi primary keyword) GYAKORLATILAG ZERO-VOLUME — annak ellenére, hogy #1 vagyunk rajta.
2. A `online cash book` (3-szavas, sokkal generikusabb) **SERP-en kezd impression-t hozni** (#80). Google már próbálgatja ezt az oldalt erre a query-re matchelni.

→ **Dual-keyword stratégia indokolt**: tartani a meglévő #1-poz-t (`digital petty cash book`) és push-olni az új jelet (`online cash book`).

### J.14.12.4 Felhasználói döntések (4 sors-opció + 4 angle-opció)

**Sors-opciók:**
- A) Átírás új angle-lel — **felhasználó választotta** (*"jó lenne inkább valami új egyedit kitalálni erre az oldalra, ha redirecteljük akkor még kevesebb oldalunk lesz"*)
- B) NOINDEX + sitemap-removal
- C) 301 redirect → `/petty-cash-app-vs-excel`
- D) Teljes törlés

**Angle-opciók:**
- A1) Migration story (paper/Excel → digital playbook)
- **A2) Multi-site / multi-cash-box angle** — **felhasználó választotta** (*"nekem is a multi location tűnik a legjobbnak"*)
- A3) Industry-specific examples (legal/medical/school/construction)
- A4) Examples + visual format gallery

**Indok az A2-re (felhasználó + asszisztens egyetért):**
1. **USP-fit ✓** — A SpendNote VALÓDI USP-je a multi cash box. A versenytársak (usepetty.cash, enkash, swipey, expensly, ecashbooks, ftax, ajons) JELLEMZŐEN 1-cashbox-fókuszúak.
2. **Pricing-fit ★★★★★** — $15.83/hó × 2-4 site = természetes ár-érzet.
3. **Cannibalization-kockázat NULLA** — egyik cluster-társ (`/petty-cash-app`, `/petty-cash-app-vs-excel`, `/digital-receipt-book`) sem érinti a multi-site angle-t.
4. **SERP-differenciátor** — sem a `digital petty cash book`, sem az `online cash book` top 5-ben EGYIK SEM multi-site specializált.
5. **Audience-fit J.14.11.6 ✓** — a multi-site operations leader természetes paying persona.

**Felhasználói döntések 3 további pontban (a body restructure előtt):**
1. Primary persona: **(a) Generic "operations leader"** + 4 sub-vertikál use-case-box ✓
2. `digital petty cash book` keyword maradjon Title-ben + H1-ben + 1× hero p-ben ✓
3. Pricing-note frissítés az új standardra (`Free 14-day trial...`) ✓

### J.14.12.5 Implementáció (1 commit, 3 fájl)

**A. `/digital-petty-cash-book.html` (full content rewrite, dual-keyword):**

| Elem | Régi | Új |
|---|---|---|
| `<title>` | `Digital Petty Cash Book Online — Log Transactions in Seconds` | **`Online Petty Cash Book for Multi-Site Teams — One Dashboard, Many Cash Boxes`** (~75 char, mobil-on enyhén csonk de első 25 char-ban a kulcs) |
| Meta description | `Replace your paper or Excel petty cash book with an online tracker...` (generikus) | **`Running petty cash across two or three locations? Replace per-site paper books and Excel files with one online petty cash book — every cash box on its own running balance, all on one dashboard.`** (pain-point + persona + USP) |
| OG/Twitter | sync title+description | sync title+description |
| Article schema headline + description | sync | sync (`dateModified`: 2026-04-16 → **2026-05-05T22:55:00+00:00**) |
| H1 | `Digital Petty Cash Book` | **`Online Petty Cash Book for Multi-Site Teams`** |
| Hero p | `Build your digital petty cash book automatically — every receipt becomes a searchable ledger entry.` (1-mondat termék-feature) | **multi-szempontú pain-narratíva** (`Running petty cash across two locations? Three sites? A school office plus a half-dozen clubs?...`) + meglévő `digital petty cash book` keyword 1× beemelve (`Some teams call this an online petty cash book or a digital petty cash book — same idea, same problem it solves.`) |
| Subline | `Small teams • Simple tracking • No accounting complexity` | **`Multi-site teams • Per-site running balances • One dashboard`** |
| CTA | `Start Free Trial` (generikus) | **`Track Every Cash Box From One Place`** (audience-action) |
| Pricing-note | `Start free. Paid plans from $15.83/month. No credit card required.` (régi A-kategória) | **`Free 14-day trial. Paid plans from $15.83/month. No credit card required.`** (J.15.A batch-fix előrejátszva ezen az 1 oldalon) |

**Body teljes restructure** (a 3 régi H2 + feature-grid helyett):

| # | H2 | Tartalom |
|---|---|---|
| 1 | `Why a Multi-Site Team Needs an Online Cash Book, Not a Paper Stack` | 2 paragrafus pain-narratíva (paper book + per-site Excel nem skálázódik 2+ helyre, end-of-month chaos) + meglévő dashboard-kép |
| 2 | `Heads-Up: Built for Teams Running 2+ Cash Boxes` | **J.14.11.6 AUDIENCE-FIT KOHERENCIA** alkalmazása: explicit `$15.83/hó` mention + 1-cashbox single-office user explicit elhárítása (`do not buy a tool you will not use`) + 4 paying persona felsorolva |
| 3 | `Who This Is For` | **4 use-case-box**: Multi-Site Small Business Owner / School Office or Club Treasurer / Construction or Field-Site Project Manager / Multi-Department Operations Manager |
| 4 | `How One Dashboard Manages Many Cash Boxes` | 4 feature-card átírva: Per-Site Cash Box Per-Site Balance / Role-Based Access Per Site / Searchable Across All Sites / One Export All Sites + meglévő transaction-detail kép |
| 5 | `Original Record Stays Visible` | F-policy szótisztítva (`ledger entry` → `logged transaction / record`, `void system instead of deletion` → `void instead of delete`) |
| 6 | (TIER B inline disclaimer-box, NEM H2) | előtte csak footer-only-ben volt; most inline TIER B disclaimer a CTA után |
| 7 | `This Is Not Accounting Software` | explicit "It does / It does not" lista (border-szakasz: nem journal entry, nem invoice, nem payroll, nem tax-return-filing) |
| 8 | `Frequently Asked Questions` | FAQ 3 → **5 kérdés** mind multi-site-fókuszú (how many cash boxes / role-based per location / real-time balance update / export all sites in one CSV / does this replace bookkeeper) |

FAQPage schema sync 5 kérdéssel. Új CSS osztályok hozzáadva (másolva a babysitter-stílusból): `.use-case-box`, `.disclaimer-box`, `.faq-section`, `.faq-item`.

**B. Floor-link anchor diversification** (a `/digital-petty-cash-book`-ról 8 cluster-társra mutató belső link multi-site framing-re):

| Régi anchor | Új anchor |
|---|---|
| `Cash float vs petty cash` | `cash float vs petty cash explained` |
| `Office expense reimbursement form` | `multi-department reimbursement form` |
| `Petty cash reconciliation` | `petty cash reconciliation across sites` |
| `Petty cash receipt generator` | `per-site petty cash receipt generator` |
| `Petty cash app vs Excel` | `why teams switch from Excel to a petty cash app` |
| `Digital receipt book` | `digital receipt book` (változatlan) |
| `Manage petty cash remotely` | `remote multi-site petty cash management` |
| `Petty cash app` | `petty cash app for small teams` |

**C. Sitemap `<lastmod>` bump:** `/digital-petty-cash-book` 2026-04-28 → **2026-05-05**.

### J.14.12.6 F-policy szóhasználat-tisztítás

A régi tartalom 5× használta a `ledger entry` accounting-szakkifejezést + `permanent ledger entry` + `void system instead of deletion` — mind TIER B-C disclaimer-szintet várt volna, de csak footer-disclaimer volt rajta.

| Régi (accounting-vibe) | Új (semleges) | Hányszor cserélve |
|---|---|---|
| `ledger entry` | `logged transaction` / `record` | 5× |
| `permanent ledger entry` | (kihagyva, "logged transaction with date, parties, and amount") | 1× |
| `void system instead of deletion` | `void instead of delete (original record stays visible)` | 1× |
| `ledger book` | `paper book` | 2× |
| `digital ledger` | `online cash book` | 2× |

Hozzáadott TIER B inline disclaimer-box: `SpendNote is a digital cash handoff tracker, not accounting software. Every logged transaction... is not a journal entry, not a tax document, and not a substitute for your bookkeeper, accountant, or accounting system.` — F-policy szerinti tax+accounting border egyértelmű.

### J.14.12.7 Másodlagos felfedezések (jövő-heti backlog, NEM most)

A SERP-elemzés mellékterméke 2 új candidate a heti-modellbe:

1. **`/petty-cash-app` "indexed but not ranked" (NEM cannibalization)** (kezelve: J.14.13, 2026-05-05 23:35) — eredeti megfogalmazásom hibás volt; a `petty cash app` query-n a homepage van top 5-ben (#2), de a `/petty-cash-app` URL **0 impr** soha (felhasználói GSC-evidencia) → **ez nem cannibalization** (cannibalization-hoz mindkét oldal kéne ranked legyen), hanem **homepage-overshadow / authority-deficit**. A homepage a `petty cash app` query-n KONVERTÁL is (felhasználó: "ma is regisztráltak rajta keresztül") → **homepage off-limits**. Részletes diagnózis és a homepage-mentes 3-opciós (A freshness + B-light cluster-link + C-light long-tail) implementáció a J.14.13-ban. **Helyes névhasználat backlog-előrejelzéskor:** "indexed-but-not-ranked audit" / "homepage-overshadow audit" — NE "cannibalization" amíg mindkét oldal nem rangsorol.

2. **`/digital-receipt-book` push #2 → #1** (jelölt: J.14.14, két hét múlva) — most #2 ceipto.com mögött. Egy fókuszált javítás (pain-point hero + use-case-boxok) push-olhat #1-re. Versenytársak: ceipto.com (template product), leafstash.com (OCR), mmcreceipt.com (scanning). **Heti-modell prioritás 2.**

### J.14.12.8 Felhasználói GSC-teendő + várt eredmény

**Felhasználói GSC-teendő (2026-05-05 23:50 felhasználói döntés — lásd J.14.11.7 átfogó megjegyzés):** **NEM kérünk** indexing-request-et és **NEM csinálunk** sitemap-resubmit-et — a felhasználó kifejezetten kiterjesztette ezt a döntést **mind a 4 mai változtatásra** (babysitter J.14.11, digital-petty-cash-book J.14.12, petty-cash-app J.14.13, cluster-link sweep). Indok: a 04-30 körüli hétvégi dömpinget a Google még nem dolgozta fel (van olyan friss URL ami még nincs is indexelve), úgyhogy a kvóta-égetés értelmetlen lenne. Organikus crawl-cycle-re várunk — a friss `lastmod` (sitemap.xml) + `dateModified` (Article schema) jelzi a freshness-t a következő crawl-on.

**Várt eredmény 2-4 hét múlva (mérendő):**
- `digital petty cash book` query: #1 marad (a fő keyword még benne van Title + H1 + hero p + URL-ben)
- `online cash book` query: #80 → várhatóan top 30-50 (organic push, dual-keyword strategy)
- `online petty cash book` query: új belépés, valószínűleg top 50-be
- Multi-site long-tail: `multi site petty cash`, `multi location cash book`, `multi department petty cash` — várt új impression-ok

**Sikermetrika (mit nézzünk a 2026-05-19-i checkpoint-on):**
- Compound-impression növekedés (mind a 4 query együtt)
- `online cash book` pos legalább top 50-ben
- Bounce rate alacsonyabb mint a régi tartalmon (audience-fit fix)

### J.14.12.9 Új SEO-szabály: "TÉMA-AUDIT ELŐSZÖR, SZÖVEG-FIX UTÁNA"

**Új preventív SEO-szabály a J.14.12-ből** (rögzítendő F-policy mellé mint G-policy alapelv):

> Minden olyan landing oldalnál, ahol a felhasználó "mélyen van" jelzést ad, **0. lépésként KÖTELEZŐ téma-audit** mielőtt a szöveg-szintű audit elindul. A 0. lépés tartalma:
>
> 1. **SERP-elemzés** az oldal fő query-jére + 2-3 plauzibilis variánsra
> 2. **Cannibalization-check**: melyik más saját oldalunk verseng ugyanazért az intent-ért
> 3. **GSC-evidencia kérés** a felhasználótól (impressions, top queries, position) — ha van
> 4. **4 sors-opció** értékelés evidence-vezérelten: (A) átírás új angle-lel, (B) noindex, (C) 301 redirect, (D) törlés
> 5. **Felhasználói döntés** a sors-opcióról MIELŐTT bármilyen szöveg-fix elindul
>
> Anélkül hogy ez a 0. lépés lefutott volna, a szöveg-fix lehet hogy egy zero-volume query-re ráncosítja a copy-t — és hiába a 8-pontos szöveg-audit (J.15.3), a forgalmi-felső-plafon ettől nem nő.

**Mikor érvényes:** minden heti-modell 2-3 oldal-átírás kezdetén; minden "miért nincs forgalom?" felhasználói kérdésnél.

**Mikor NEM kell:** ha a felhasználó már döntött a sors-opcióról és csak a szöveget kéri javítani.

## J.14.13 `/petty-cash-app` LONG-TAIL DIVERSIFICATION + cluster-authority push (2026-05-05 23:35) — homepage-mentes "indexed but not ranked" kezelés

### J.14.13.1 Trigger + diagnózis-korrekció

**Trigger:** Felhasználói reakció a J.14.12.7-es backlog-jelölésre: *"ok, akkor még azt találd ki hogy azzal a petty cash app oldallal mi a lófaszt csináljunk, azt találtuk ki hub oldalnak erre most benyögöd hogy kannibalizálja a landinget.... még egyetlen egyszer sem jelenítette meg a Google"*. Felhasználói GSC-státusz-megerősítés: **Indexed**.

**Két diagnózis-korrekció (J.14.12.7-ből):**

1. **A "hub-oldal" megnevezés sosem volt pontos** a `/petty-cash-app`-ra. Ez egy **dedikált, fókuszált product landing page** volt 2026-04-25 óta (Bing query-data alapján), `priority=0.9` sitemap, 3 schema-típus, 04-28-i micro-sprint 2 homepage-link + 2 inline anchor-variáció + GSC indexing-request prioritás-1.

2. **A "cannibalization" megnevezés is hibás** volt a J.14.12.7-ben. Cannibalization akkor van, ha **mindkét oldal rangsorol** és egymást rontják. Itt a `/petty-cash-app` **0 impr soha** (felhasználói GSC) → nem rangsorol semmire → tehát NEM cannibalization. A pontos diagnózis: **"indexed but not ranked"** = **"homepage-overshadow"** = **authority-deficit**.

### J.14.13.2 Pontos diagnózis (homepage-audit)

| Hely | Tartalmaz `petty cash app` substring-et? |
|---|---|
| Homepage `<title>` (`SpendNote — Cash Handoff Tracking & Receipts for Teams`) | NEM |
| Homepage meta description (`Record who took cash, who received it, and what it was for...`) | NEM |
| Homepage OG/Twitter | NEM |
| Homepage body (1576. sor inline link `browser-based petty cash app` + 1651. sor inline link `SpendNote petty cash app`) | IGEN — 2× a 04-28-i micro-sprint során hozzáadva |

A homepage tehát **explicit nem akarja megnyerni** a `petty cash app` query-t (Title/meta-ben nincs benne), mégis #2-en van a SERP-en. **3 plauzibilis ok kombinálódik:**

1. **Brand-DA**: a homepage sokkal magasabb DA-jú mint egy 10-napos landing — Google brand-keyword közelében soha nem dobja le top 5-ből
2. **Tartalmi proximity**: `Cash Handoff Tracking + Receipts + Teams + cash box` Google-szemmel ≈ `petty cash app` intent
3. **A 04-28-i 2 belső link "visszaüt"**: amikor a homepage-ről `petty cash app` és `SpendNote petty cash app` anchor-szöveggel linkeltünk a `/petty-cash-app`-ra, **Google-nak elmondtuk: "a homepage releváns a petty cash app-ról"**. Anchor-text 2-irányban dolgozik: nemcsak a célt, hanem a forrást is "tag-eli". Ezt ironikusan **mi okoztuk** a 04-28-i discoverability micro-sprintben.

### J.14.13.3 Felhasználói constraint + opció-szűkítés

**Felhasználói instrukció (kritikus):** *"nem nyúlhatsz a homepage-hez, legalább jó helyen van és ma is regisztráltak rajta keresztül"* → **homepage off-limits**.

Indok 2 oldalról:
- A homepage az aktív conversion-csatorna a `petty cash app` query-n (a SERP impr → homepage → registration-flow tényleg konvertál)
- Bármilyen Title/anchor változás potenciálisan ronthat (és/vagy más query-ket is befolyásolhat — `cash handoff`, `cash receipts for teams`)

**Lehetőség-szűrés:**

| Opció | Mit | Homepage-érintő? | Kockázat | Döntés |
|---|---|---|---|---|
| A) Freshness-only | `dateModified` + sitemap `lastmod` bump + GSC reindex-request | nem | nulla | **mehet** |
| B-light) Cluster-link sweep | 3-5 cluster-társról új belső link (anchor-diversity) | nem | alacsony | **mehet** |
| C-light) Long-tail tartalom-bővítés | új H2 + use-case-box-ok más target-query-re | nem | alacsony | **mehet** |
| D) Homepage Title-tweak | pl. `Cash Handoff Receipts for Small Teams` | **igen** | közepes | **kizárva** |
| E) Homepage anchor-revízió | `browser-based petty cash app` → `cloud-based cash tracking app for teams` | **igen** | alacsony | **kizárva** |
| F) Passzív várás | csak GSC reindex-request | nem | nulla | nem most |

**Felhasználói döntés:** **A + B-light + C-light** (a 3 homepage-mentes opció) együtt, 1 commit-ban.

### J.14.13.4 C-light: long-tail tartalom-bővítés a `/petty-cash-app`-on

**Új angle: `Petty Cash App for Multi-Site Teams`** — célzott long-tail magnet, NEM versenyez a homepage-dzsel (a homepage `Cash Handoff` általános pozícionálása NEM ütközik a multi-site specifikus angle-vel).

**Beillesztés:** a `Who Uses a Petty Cash App?` H2 utáni floor-paragraph (`If you are a nonprofit specifically...`) UTÁN, a `<div class="cta-box">` ELŐTT.

**Tartalom-szerkezet:**

| Elem | Tartalom |
|---|---|
| H2 | `Petty Cash App for Multi-Site Teams` |
| 1. paragrafus | Pain-narratíva: 1-cashbox = easy case; 2+ locations = chaos (3 paper book + 3 Excel + 3 different "wait, why doesn't this match?" at month-end) |
| 2. paragrafus | SpendNote-megoldás: 1 cash box per site, per-site running balance, role-based access, 1 dashboard |
| use-case-box 1 | **Multi-Location Small Business** (2-4 shops, franchise, multi-site clinic, food trucks) |
| use-case-box 2 | **School Office & Club Treasurers** (1 main office + PTA + athletics + library + clubs) |
| use-case-box 3 | **Construction & Field-Site Project Managers** (2-3 sites + site supplies/parking/cash purchases) |
| Cluster-bridge | 1 paragrafus a `/digital-petty-cash-book`-ra utalva (`online petty cash book` anchor) — **NEM ütközik**, mert az "online cash book" intent, ez "petty cash app" intent |

**Long-tail target-query-k (NEM ütközik a homepage-dzsel):**
- `petty cash app for multi-site teams`
- `multi site petty cash app`
- `petty cash app for multiple locations`
- `multi-location petty cash app`
- `school petty cash app`
- `construction petty cash app`
- `petty cash app for multi-clinic`
- `petty cash app for franchise`

**CSS:** új `.use-case-box` osztály a sűrített style-blokkban (oldal-stílus-konzisztens).

### J.14.13.5 A: freshness signal

- Article schema `dateModified`: 2026-04-28T22:00:00 → **2026-05-05T23:30:00+00:00**
- Sitemap `<lastmod>`: 2026-04-28 → **2026-05-05**

### J.14.13.6 B-light: cluster-link sweep (5 új link, anchor-diversity)

**Cluster-link audit eredménye (sweep ELŐTT):**

| Cluster-társ | Link a `/petty-cash-app`-ra? | Anchor / hely |
|---|---|---|
| `/cash-float-vs-petty-cash` | IGEN (2 link) | inline `browser-based petty cash app` + related-card `Petty Cash App` |
| `/petty-cash-how-much-to-keep` | IGEN | inline `cloud petty cash tool` |
| `/manage-petty-cash-remotely` | IGEN (2 link) | inline `See live cash balances from any device` + related-card `Petty Cash App` |
| `/cash-handoff-receipt` | IGEN | inline `Track every handoff in one searchable place` |
| `/how-to-start-petty-cash-box` | IGEN | related-card `Petty Cash App` |
| `/petty-cash-receipt-generator` | NEM | — sweep-célpont |
| `/small-business-cash-receipt` | NEM | — sweep-célpont |
| `/petty-cash-policy-template` | NEM | — sweep-célpont |
| `/petty-cash-reconciliation` | NEM | — sweep-célpont |
| `/what-is-petty-cash` | NEM | — sweep-célpont |

**5 új link (mind anchor-diversity-vel, NO `petty cash app` exact substring):**

| Cluster-társ | Új anchor | Hova |
|---|---|---|
| `/petty-cash-receipt-generator` | `cloud petty cash tracker for teams` | inline a "saved with searchable history" paragraph utáni új mondatban |
| `/small-business-cash-receipt` | `web-based petty cash tracker for small businesses` | inline a "No single place to check the history" szakaszban (a régi `SpendNote` szót cseréltük linkre) |
| `/petty-cash-policy-template` | `team petty cash tracking tool` | inline új paragrafus a "multi cash funds" figcaption után |
| `/petty-cash-reconciliation` | `cloud-based petty cash tool for multi-site teams` | inline a step-list után, a CTA-box előtt |
| `/what-is-petty-cash` | `cloud petty cash management tool` | inline a "skip the paper and start digital" mondat bővítésével |

**Anchor-stratégia szabály (új):** Új internal-link a `/petty-cash-app`-ra **TILOS** a `petty cash app` exact 3-szavas substring anchor-szöveggel — kerüljük el a Google-overload-ot ami a 04-28-i micro-sprint óta már problémát okoz a homepage-overshadow miatt. Megengedett: `cloud petty cash tracker / web-based petty cash tracker / team petty cash tracking tool / cloud petty cash management tool` típusú variációk (a `petty cash app` 3 szó nem szerepel együtt).

**Sweep utáni állapot:** **összesen 10 cluster-link** a `/petty-cash-app`-ra, anchor-diversity-vel — egyetlen homepage-érintés nélkül.

### J.14.13.7 Felhasználói GSC-teendő + várt eredmény

**Felhasználói GSC-teendő (2026-05-05 23:50 felhasználói döntés — lásd J.14.11.7 átfogó megjegyzés):** **NEM kérünk** indexing-request-et és **NEM csinálunk** sitemap-resubmit-et — kiterjesztett döntés mind a 4 mai változtatásra (babysitter / digital-petty-cash-book / petty-cash-app / 5 cluster-link). Ugyanaz az indok: a hétvégi dömping organikus feldolgozása még folyamatban van, kvóta-megőrzés szükségesebb URL-eknek (pl. még indexeletlen oldalak). A friss `dateModified` + 5 új cluster-link a következő organikus crawl-on jelez.

**Várt eredmény 2-4 hét múlva (mérendő):**
- Első impression-ok long-tail query-kre (`petty cash app for multi-site`, `multi site petty cash app`, `petty cash app for multiple locations`, `school petty cash app`)
- A `petty cash app` exact-match query-n NEM várunk azonnali változást — a homepage marad #2 (és ott konvertál)
- **Sikermetrika a 2026-05-19-i checkpoint-on:** első nem-nulla impression a `/petty-cash-app` URL-en GSC-ben
- **Failure-jel:** ha 4 hét múlva is 0 impr → escalation: az E opció (homepage anchor-revízió, NEM Title-tweak) újra-mérlegelése

### J.14.13.8 Új SEO-szabály: "0 IMPR DIAGNÓZIS-FA"

**Új preventív SEO-szabály a J.14.13-ból** (G-policy alapelv-bővítés):

> Ha egy URL **0 impression**-t kap GSC-ben (sosem jelent meg semmilyen query-re), a kezelés a 4-féle GSC-státusz alapján különbözik:
>
> | Státusz | Diagnózis | Kezelés |
> |---|---|---|
> | **NOT INDEXED** | Google nem fedezte fel | indexing-request push, sitemap resubmit |
> | **DISCOVERED – NOT INDEXED** | Google tudja hogy létezik, nem crawlolta | indexing-request push, belső linkek növelése, sitemap resubmit |
> | **CRAWLED – NOT INDEXED** | Google crawlolta, "nem érdemes indexelni" | quality rewrite (babysitter-szindróma — J.14.7/J.14.11) |
> | **INDEXED – NOT RANKED** | Google indexelte, nincs query amin top 100-ba kerül | **authority-build** (cluster-link sweep) + **long-tail diversification** (új H2 más target-query-re) — **EZ a `/petty-cash-app` esete** |
>
> **Tilos terminológiai tévesztés:** a "cannibalization" megnevezést csak akkor használjuk, ha **MINDKÉT** oldal rangsorol és egymást rontják a SERP-en. Ha az egyik oldal 0 impr-t kap, az **NEM** cannibalization, hanem "homepage-overshadow" / "indexed but not ranked" / "authority-deficit". A pontos terminológia befolyásolja a kezelést.
>
> **Anchor-stratégia mellékterméke:** ha a homepage-ről több belső linket adunk a célzott landing-re EXACT-MATCH anchor-szöveggel, az **fordított hatást** is kifejt — a homepage is tageli magát a kulcsszóra Google-szemmel. Anchor-diversity ITT IS érvényes.

## J.14.14 `/cash-handoff-receipt` audit (2026-05-10 13:45) — visszavont snippet-fix, "0% CTR ≠ snippet-baj" tanulság

### J.14.14.1 Trigger + felhasználói korrekció

**Trigger:** A 2026-05-09 → 05-10-i heti GSC-elemzés (`Where we are now` 2026-05-10 13:25) alapján az asszisztens javasolta egy "snippet-revízió" sprint-et a `/cash-handoff-receipt`-re, mert page 1-en TOP 1-5 helyen rangsorolt 5 query-n (`cash handover sheet`, `cash handover format`, `cash hand over format`, `handover receipt`, `cash handover receipt`) **0% CTR**-rel (32 megj./hét, 0 klikk).

**Felhasználói korrekció (2026-05-10 13:36):** *"vagyis állj, az az oldal nem szorul átírásra vagy frissítésre, ha már egyszer hozzányúlunk, tudod elterveztük a minőségi és tartalmi revizítót apránként és a neten is ellenőrizd az ötelteidet mielőtt bármit is átírsz"*. Két kulcs-tanulság:

1. **Heti modell konzisztencia**: ha hozzányúlunk egy oldalhoz, **teljes revizíró** (body + Title + meta + schema + cluster + audience-fit), nem izolált snippet-fix. A heti modellünk (J.14.7→J.14.13) eddig minden esetben body+meta+schema+cluster együtt-revíziót tartalmazott.
2. **SERP-evidence ELŐTT, ötlet UTÁN**: a légből kapott Title-javaslat fail-mode — a Google már bizonyítja milyen snippet-eket jutalmaz a query-kre, ezt kell olvasni először.

### J.14.14.2 SERP-evidencia (3 query, élő Google-találat 2026-05-10)

| Query | Top 5 SERP | Domináns intent |
|---|---|---|
| `cash handover sheet` (4 megj./hét, mi #1) | SafetyCulture template / pdfFiller form / US Legal Forms / Scribd PDF / Vertex42 Excel | **PDF/Excel template-letöltés** — egyetlen SaaS sincs a top 5-ben |
| `cash handover receipt between employees shift change` | **4 SpendNote a top 5-ben** (`/cash-handoff-receipt` #1, `/cash-discrepancy-between-shifts` #2, `/small-business-cash-receipt` #4, `/cash-drawer-reconciliation` #5) | tool-intent — itt mi domináljuk, csak a query ritka |
| `handover receipt cash format example` | SpendNote #1, signNow Excel-guide, SafetyCulture, US Legal Forms, examples.com | vegyes — template + how-to-format |

**Kulcskövetkeztetés:** A 0% CTR **NEM** Title/Description-bug, hanem **query-intent mismatch**: a `cash handover sheet` keresők letölthető PDF-et akarnak (a top 5 más eredménye mind az), mi #1-en vagyunk mert a contentünk relevant — **de a klikker rácsap, lát egy SaaS app-ot, és visszamegy a Vertex42 PDF-re**. Bármilyen snippet-tweak ezt **NEM oldja meg**, sőt: ha "no template needed" promise-ra váltunk, **rangsor-vesztés** kockázat (kihúznánk a `template`/`format`/`sheet` szavakat amik most behozzák a #1-et).

### J.14.14.3 Body + cluster audit eredménye

- **Body**: 7 use-case-box, 5 FAQ schema, Article + SoftwareApplication + FAQPage schema mind friss (`dateModified` 2026-05-03), audience-fit OK, F-policy compliant, conversion-fit OK, 8 cluster-link már van.
- **Cluster-státusz**: **21 másik HTML oldal linkel** rá → ez egy **cluster-hub** (nem cluster-versenyző). Nincs cannibalization.
- **GSC**: stabilan #1-5 page 1-en több query-n, a 0% CTR konzisztens (nem napi zaj).

### J.14.14.4 Sors-opciók (4 választás, nem egyenlő risk-profil)

| # | Opció | Risk | Választás |
|---|---|---|---|
| **A** | **Hagyjuk békén most** (NEM nyúlunk hozzá) | Nincs (status quo) | ✅ **VÁLASZTOTT** |
| B | Title/Description tool-intent-erősítés (`Sign & Print` még explicitebb) | Magas — `template`/`format`/`sheet` szavak kihúzása → rangsor-vesztés | ❌ |
| C | Komplett cluster-bővítés (új `/cash-handover-template` standalone landing template-letöltési intent-re) | Nagy munka — J.15 site-wide auditba való | 🔄 J.15 backlog-ba |
| D | Csak `dateModified` bump (manipulatív freshness-signal) | Alacsony, de 0 üzleti hatás | ❌ |

### J.14.14.5 Felhasználói döntés (2026-05-10 13:46)

**Opció A** — `/cash-handoff-receipt` változatlan marad. **Body / Title / Description / schema EGY SOR sem módosul.** Az Opció C (új `/cash-handover-template` standalone landing) bekerül a J.15 backlogba mint cluster-bővítési jelölt, post-checkpoint sprint-re.

### J.14.14.6 Új SEO-szabály: "0% CTR ≠ snippet-baj" (G-policy alapelv-bővítés)

> **Page 1-en rangsoroló oldal 0% CTR-rel — diagnózis-fa:**
>
> | Lépés | Mit nézzünk | Diagnózis |
> |---|---|---|
> | **0. (kötelező)** | **Élő SERP-elemzés** a top 5-10 versenytárson — milyen oldal-fajta dominál a query-n? (template / blog / SaaS / how-to / e-commerce) | A user-intent itt derül ki, NEM a query szavaiból |
> | 1. | Mi vagyunk-e a top 5-ben **fajta-szempontból outlier**? (pl. mi SaaS, többiek mind PDF) | **Query-intent mismatch** — nem snippet-baj |
> | 2. | A top 5 más SaaS-ek snippet-stílusa hogyan különbözik? | Ha nincs más SaaS → ld. 1. pont; ha van más SaaS és magasabb CTR-rel → snippet-tanulság |
> | 3. | A title/description ígér-e **konkrét végeredményt** ami a query-intent-re válaszol? | Ha nem → snippet-fix indokolt; ha igen → query-intent mismatch |
>
> **Kezelés a diagnózis szerint:**
> - **Query-intent mismatch (a `/cash-handoff-receipt` esete):** snippet-fix **TILOS** önmagában — `cluster-bővítés` kell (új landing a hiányzó intent-re), VAGY békén hagyás. A snippet-tweak kihúzná a #1 pozíciót adó kulcsszavakat.
> - **Valódi snippet-baj:** Title/Description átírás indokolt, de **MINDIG** body+meta együtt-revízió heti modell szerint, NEM izolált meta-fix.
>
> **Tilos lépés:** "page 1 / 0 klikk" mintára azonnal Title-tweaket javasolni anélkül hogy a SERP-en megnéznénk milyen versenytárs-fajta van ott.

### J.14.14.7 Lessons learned (asszisztens-saját tanulság)

1. **A "page 1 / 0 klikk" pattern self-evidence-nek tűnik snippet-bug-ra, de nem az.** A query-intent (template-letöltés vs. SaaS-tool) explicit ellenőrzése **0. lépés** kell hogy legyen.
2. **A heti modell konzisztencia**: ha javaslunk egy oldal-modositast, az mindig **teljes revizíró** kell hogy legyen (body+meta+schema+cluster), nem izolált meta-fix. Az asszisztens javaslata "csak Title/Meta" formában a heti modellt sértené.
3. **A J.14.12.9 `TÉMA-AUDIT ELŐSZÖR` szabály kiterjesztése**: nem csak "deep" oldalakra (rosszul rangsorolóakra) érvényes, hanem **page 1 0% CTR oldalakra is** — mindkét eset előtt SERP-evidencia és sors-opciók kötelező.

## J.14.15 AI-OVERVIEW-VULNERABILITY MAPPING + content-strategy pivot (2026-05-15 13:25) — informational query-családok klikk-cannibalizációja, fókusz-shift a tool/commercial intent zónába

### J.14.15.1 Trigger + felhasználói intuíció

**Trigger:** A 2026-05-15-i 7-napos GSC-elemzés (606 megj./hét, 4 klikk, 0,66% CTR — iparági benchmark 3,4%-hoz képest 87%-os underperformance) szisztematikus CTR-anomáliát mutatott TOP 10 page 1 oldalakon is. Az asszisztens kezdeti hipotézise "snippet-stílus / brand-recognition / SERP-feature-competition" volt — de a felhasználó éles megfigyelése pontosabban beazonosította a root-cause-t:

> *"az egyik leganagyobb problléma szerintem, hogy az információs oldalak hiába tűnnek page egynek, valószínűleg nincsenek is az első oldalaon a google ai lófasza miatt"* (felhasználó, 2026-05-15 13:15)

A hipotézis: a Google **AI Overviews / SGE (Search Generative Experience)** funkció **informational query-knél** elnyeli a SERP felső 60-80%-át, az organikus listát scroll-alá nyomja, és a teljes választ kiteszi az AI-overlay-ben → a user **nem klikkel** annak ellenére hogy a SpendNote-content oldalt **citáció-forrásként** használja.

### J.14.15.2 SERP-evidencia (4 élő query-teszt, 2026-05-15 13:18)

| Query | Heti megj. | Heti klikk | AI Overview? | SERP-fajta | Citáció? |
|---|---|---|---|---|---|
| `how much petty cash should be on hand` | 137 | 1 | **IGEN — TELJES VÁLASZ** (formula + business-type táblázat + parameters) | **AI-dominált informational** | SpendNote `/petty-cash-how-much-to-keep` #3, **idézik 3×** (`[3]`) |
| `where to keep petty cash` | 46 | 1 | **IGEN — TELJES VÁLASZ** (storage + security + best practices) | **AI-dominált informational** | SpendNote `/petty-cash-security-tips` #1, **idézik 4×** (`[1]`). A `/where-to-keep-petty-cash` URL **nincs is a top 5 link-listában** annak ellenére hogy heti átlag poz 9,15! |
| `petty cash app` | (nincs URL-szintű impr — homepage rangsorol) | (homepage konvertál: 50% conv-ráta) | **NEM — APP-LISTING SERP** | **Tool/commercial — AI-immune** | "Several petty cash management apps are available..." SpendNote **#1**, JettyCash, Pleo, Petty Cash (Google Play) — alkalmazás-katalógus, NEM AI-válasz |
| `cash handover sheet` | 4 | 0 | **IGEN — DOKUMENTUM-MAGYARÁZAT** + J.14.14 template-intent mismatch is rákumulálódik | **Vegyes (AI + template)** | SpendNote `/cash-handoff-receipt` #4, idézik 1× — DUPLA-akadály: AI-Overview + template-intent |

**Verifikáció**: 4 független Google-keresés, mind 2026-05-15 13:18 körül, US/EN locale-ban (a SpendNote primary piaca). Az AI Overview a 4 query-ből 3 esetén explicit megjelent — **75% prevalence az informational/dokumentum-jellegű query-családon**, **0% prevalence a tool/commercial query-családon**.

### J.14.15.3 Query-családi tipologizálás (új SEO-szótár)

A 4-es minta alapján a SpendNote query-portfolio **3 nagy AI-Overview-szerinti** kategóriába esik:

| Kategória | Query-példák | AI-Overview-prevalence | Klikk-potenciál (ha page 1) | Üzleti érték |
|---|---|---|---|---|
| **A. INFORMATIONAL** (`how X works`, `how much`, `where to`, `what is`, `why does`, `how to do X`) | `how much petty cash should be on hand`, `where to keep petty cash`, `what is petty cash`, `petty cash how much to keep`, `how to track cash payments`, `how to fill out petty cash voucher` | **80-95% — AI-dominálta** | **5-15%-a annak amit a poz alapján várnánk** (azért nem 0%, mert ~5-15% user mégis scrollol, vagy a query nuance miatt szerencsénk van) | **Nagyon alacsony direct-conversion**; közepes brand-citation-érték long-term |
| **B. TEMPLATE/DOCUMENT** (`X template`, `X format`, `X sheet`, `X form`, `X PDF`, `X Excel`, `free X`, `X printable`) | `cash handover sheet`, `cash handover format`, `petty cash log template`, `cash receipt template`, `petty cash voucher template` | **40-70% (vegyes)** — vagy AI-Overview vagy template-letöltés-SERP | **0-5%** — a `/cash-handoff-receipt` esete (J.14.14) bizonyítja |
| **C. TOOL/COMMERCIAL** (`X app`, `X software`, `X tracker`, `X system`, `X solution`, `X tool`, `online X`, `cloud X`, `digital X`, `web-based X`) | `petty cash app`, `petty cash software`, `petty cash management app`, `digital petty cash book`, `online petty cash book`, `cloud petty cash tracker` | **0-15% — AI-immune** (vagy app-listing SERP, vagy tradicionális organic) | **40-70%** — vagy a SpendNote-ot választják, vagy egy másik vendor-t (de a click MEGTÖRTÉNIK) | **Magas direct-conversion** — a homepage 50% conv-ráta is ezt bizonyítja |

**Plus 2 kisebb kategória:**

- **D. GEO/SPECIFIC LONG-TAIL** (`X for Y`, `X in Z country`, `X for [vertical]`): vegyes AI-prevalence; klikk-potenciál közepes; üzleti érték magas mert vertical-targeted.
- **E. BRAND/NAVIGATIONAL** (`spendnote`, `spendnote app`, `spendnote pricing`): 0% AI-Overview; 60-80% klikk; legmagasabb conversion. Most még 0 ilyen volume mert a brand nem ismert.

### J.14.15.4 Üzleti következmény — a CTR-anomália magyarázata

A SpendNote heti 606 megjelenése **így bomlik szét**:

| Kategória | Heti megj. (becslés) | Reális klikk-potenciál | Megjegyzés |
|---|---|---|---|
| A. Informational | ~350 | ~5-10 klikk/hét max | A nagy "felszívás" — AI-Overview-cannibalization |
| B. Template/document | ~30 | ~0 klikk | J.14.14 megerősítve |
| C. Tool/commercial | ~20 | ~3-6 klikk/hét (jelenleg, ha page 1-en vagyunk) | **Itt van a futurism** — még alacsony volume, de magas conv |
| D. Geo/specific long-tail | ~50 | ~2-4 klikk/hét | Vegyes |
| E. Brand | ~5-10 | ~3-7 klikk/hét | Most még low-volume |
| **Egyéb low-volume long-tail** | ~150 | ~1-2 klikk/hét | Zaj |
| **TOTAL várható** | 606 | **10-22 klikk/hét** | Magyarázza a tényleges 4 klikket — **a SpendNote nem CTR-bug-ban szenved, hanem traffic-mix-bug-ban** |

**Kulcskövetkeztetés:** A "page 1 informational rangsor" **nem üzleti érték önmagában** — csak brand-citation és long-term recognition. A direct-conversion **kizárólag a C+D+E kategóriákból** várható. **A SEO-effort 80%-át a C+D-be kell terelni**, az A+B-t fenntartani de NEM expandálni.

### J.14.15.5 Új SEO-szabály: "AI-OVERVIEW-VULNERABILITY-CHECK ÚJ TARTALOM ELŐTT" (G-policy alapelv-bővítés)

> **Új landing / új cluster-page tervezésekor a 0. lépés (kötelező):**
>
> 1. **AI-Overview-jelenlét-teszt**: a tervezett primary keyword Google-keresés US/EN locale-ban. Megjelenik az "AI Overview" (vagy "Overview from AI") panel a SERP tetején? IGEN/NEM rögzítendő a content-tervben.
> 2. **Query-családi besorolás (J.14.15.3)**: A/B/C/D/E kategóriákba sorolás. Ha A vagy B → **figyelmeztető szignál**, ha C vagy D → **zöld szignál**.
> 3. **Sors-opciók AI-Overview-vulnerable query esetén:**
>    - **Opció 1 — STOP**: ne csináljunk landinget erre a query-re. A traffic illuzórikus, klikk nem jön.
>    - **Opció 2 — TOOL-PIVOT**: ha lehet, dolgozzuk át a query-célt **tool-intent variánsra** (pl. `how to track petty cash` helyett `petty cash tracker app for [vertical]`).
>    - **Opció 3 — VÁLLALT BRAND-CITATION-PLAY**: szándékosan írjuk meg az oldalt **AI-citation-friendly stílusban** (rövid, definitív válaszok, számszerű adatok, idézhető listák), és tudatosítsuk hogy az érték brand-citation, NEM klikk. Csak akkor érdemes, ha a query magas volume-ú és brand-építés-célú.
>
> **Tilos lépés:** AI-Overview-vulnerable query-re landing-content gyártás anélkül hogy az AI-Overview-jelenlétet 0. lépésként ellenőriznénk. A J.15.1.B (`copy-pasta hero rewrite` 5 informational oldalon) ezért downgrade-elve P1 → P3 a J.14.15.6-ban.
>
> **Mérési-keret:** AI-Overview-citation-tracking — 4-6 hetes intervallumokban a SpendNote-citáció-aránya az AI-Overview-ban (manuális SERP-check-tel). Ha nő → brand-recognition épül; ha 0 marad → a content nem AI-friendly, javítás kell.

### J.14.15.6 J.15 backlog priorítás-shuffle (közvetlen következmény)

A J.14.15.3-as kategorizálás alapján a J.15 SITE-WIDE CONTENT AUDIT BACKLOG (lentebb) tételei **átrendezésre kerülnek** a következőképpen:

| J.15 tétel | Eredeti priorítás | **Új priorítás (J.14.15 után)** | Indok |
|---|---|---|---|
| **A. Pricing-note batch-fix** | P1 | ✅ **TELJESÍTVE** (2026-05-10) | — |
| **B. Copy-pasta hero rewrite** (5 informational oldal) | P1 | **P3 — DOWNGRADE** | Mind az 5 oldal A. INFORMATIONAL kategória; AI-Overview-vulnerable. Hero-rewrite NEM oldja meg az alap-problémát (klikk akkor sem fog jönni). A `/handyman` és `/tutor` audience-pivot része még elképzelhető de B. COPY-PASTA önmagában értelmetlen. |
| **C. "Template" szó H1-tisztítás** | P0 (3/4 oldal) | ✅ **3 TELJESÍTVE** (2026-05-10), 4. (`/two-person-cash-count-policy`) **kizárva** | Nincs változás — ez NEM AI-Overview-relevant kérdés, hanem felhasználói direktíva |
| **D. Audience-fit koherencia gyanú** | P1 | **CONDITIONAL** — query-családi besorolás **kötelező a J.14.15.5 szerint mielőtt revíziót indítunk** | A `/event-cash-handling`, `/payroll-cash-receipt`, `/school-money-collection-tracker` mindegyikére előzetes SERP-test (AI-Overview-jelenlét + intent), és ha A/B kategória → STOP, ha C/D → MEHET |
| **E. Stale dateModified** | P2 | P2 (változatlan) | Nem AI-Overview-issue |
| **F. Vocabulary ellenőrzés** | P2 | P2 (változatlan) | Nem AI-Overview-issue |
| **G. `/cash-handover-template` standalone landing** | P2 (J.14.14 Opció C) | **KUKA — TÖRÖLT** | A `cash handover sheet` query mindkét akadállyal terhelt: (1) AI-Overview rákumulálódik (J.14.15.2 evidencia), (2) template-intent mismatch (J.14.14). Egy új landing **dupla-akadályba** futna. Az erőforrást a J.15.5-be (vertical-tool-landing) terelni. |

**Új P0 prioritású szekció: `J.15.5` — VERTICAL-TOOL-LANDING-MULTIPLIKÁCIÓ** (lentebb részletesen). Ez az AI-Overview-pivot konkrét sprint-formában: új landingek a C. TOOL/COMMERCIAL kategóriában, AI-immune zónában.

### J.14.15.7 Lessons learned (asszisztens-saját tanulság)

1. **A felhasználói SEO-intuíció gyakran pontosabb mint az asszisztens kezdeti hipotézise.** A "google AI lófasza" diagnózis 5 perc alatt eljutott a root-cause-hoz, miközben az asszisztens kezdetben "brand-recognition / SERP-feature-competition" hipotézist fontolgatott. **Tanulság:** felhasználói diagnózist **élő evidence-tel validálni**, ne vitatkozni vele előbb.
2. **A "CTR-bug" mint univerzális magyarázat illuzórikus.** A 87%-os industry-underperformance MEGFELELŐ magyarázata nem "rossz snippet" hanem "rossz traffic-mix" — a heti 606 megj. nagyobb része AI-Overview-cannibalizált informational. **Tanulság:** mindig query-családi felbontással analizálni a CTR-anomáliát, NEM aggregát átlaggal.
3. **Az AI-Overview-jelenlét-check új standard 0. lépés** — a J.14.12.9 (`TÉMA-AUDIT ELŐSZÖR`) + J.14.13.8 (`0 IMPR DIAGNÓZIS-FA`) + J.14.14.6 (`0% CTR ≠ snippet-baj`) szabály-trió kiegészítve egy **PRE-CONTENT** SERP-ellenőrzéssel. Ez kötelező minden új landing-tervezésnél a J.14.15.5 szerint.
4. **A J.15 backlog "elavul" gyorsan** — már az ELSŐ kontextus-shift (AI-Overview-evidence) után 7 tétel közül 3 átsorolódott. **Tanulság:** minden post-checkpoint sprint **kezdés előtt** újra kell rendezni a backlog-ot a friss SERP-evidencia alapján, NEM ragaszkodni a 10 napos audit-felvételhez.

## J.15 SITE-WIDE CONTENT AUDIT BACKLOG (2026-05-05 22:15) — post-checkpoint sprint, NEM most

**Trigger:** A felhasználó megfigyelése a `/babysitter` audience-zagyvasága után: *"tartok tőle hogy még jó pár ilyen szarul megírt oldalam van... egyszer értelmeznünk kell mindegyik oldal szövegét, mert szerintem vannak köztük nagyon felületesen megírt szarok"*. Ezt a backlog-tervet a **2026-05-19-i checkpoint UTÁN** indítjuk; addig moratórium érvényben (lásd J.14.7 + J.14.11).

### J.15.1 A site-wide diagnostic scan (2026-05-05) eredménye — 48 sitemap landing oldal

**Diagnostikai kategóriák, prioritás szerint:**

#### A. PRICING-NOTE INKONZISZTENCIA (P1 — ✅ TELJESÍTVE 2026-05-10 14:05, 22 oldal, 1 kizárás)

A J.14.11 + J.14.12 után a babysitter és a digital-petty-cash-book már az új standard pricing-note-ot használja: `Free 14-day trial. Paid plans from $15.83/month. No credit card required.` De **22 oldal** (eredeti J.15.1.A becslés 19 → ténylegesen 22, mert 4 új landing is bekerült a backlog-on kívül) még a régi `Start free.` vagy `Free to start.` formulát használta.

**Eredeti `Start free.` lista (15 oldal):** `/petty-cash-receipt-generator`, ~~`/cash-handoff-receipt`~~ (kizárva — Opció A J.14.14), `/small-business-cash-receipt`, `/office-expense-reimbursement-form`, `/petty-cash-reconciliation`, `/how-to-fill-out-petty-cash-voucher`, `/petty-cash-policy-template`, `/contractor-advance-payment-receipt`, `/cash-payment-received-proof`, `/handyman-cash-payment-receipt`, `/tutor-cash-payment-receipt`, `/employee-cash-advance-receipt`, `/cash-deposit-receipt`, `/custom-cash-receipt-with-logo`, `/school-money-collection-tracker`

**Új `Start free.` felfedezés (3 oldal — backlog-on kívül):** `/petty-cash-voucher-template`, `/petty-cash-log-template`, `/petty-cash-voucher-sample`

**Eredeti `Free to start.` lista (4 oldal):** `/cash-drawer-reconciliation`, `/event-cash-handling`, `/boss-cant-see-where-cash-goes`, `/what-is-petty-cash`

**Új `Free to start.` felfedezés (1 oldal — backlog-on kívül):** `/cash-receipt-template`

**Akció (TELJESÍTVE):** site-wide find/replace `Start free.` és `Free to start.` → `Free 14-day trial.` az összes hero-pricing-note-ban. **17 + 5 = 22 oldal módosítva, 1 oldal kizárva** (`/cash-handoff-receipt` Opció A miatt — ott szándékosan marad a régi formula amíg az oldalt teljesen békén hagyjuk). Verifikáció: 1 commit (`b2a215c`+1), `dateModified` NEM bumpolva, `sitemap.xml lastmod` NEM bumpolva, query-rangsor NEM érintve, cluster-link NEM érintve.

**Tanulság (új SEO-meta-szabály):** A site-wide audit-listák **gyorsan elavulnak** új landing-ek beillesztésével. Bármilyen batch-fix előtt **mindig friss grep** kell hogy az aktuális állapotot tükrözze, NEM az audit-doku 5 napos pillanatfelvételét. A J.15.1.A esetén az audit 19 oldalt sorolt fel, ténylegesen 22 oldal érintett — a 16%-os tévedés "alapértelmezett vakfolt" a manuálisan karbantartott audit-listákban.

#### B. COPY-PASTA HERO PARAGRAFUS (P1 → ⚠️ **DOWNGRADE P3** 2026-05-15 J.14.15.6 alapján — AI-Overview-vulnerable, alacsony várható megtérülés)

Több oldal a `Need a simple X?` generikus pattern-t használja a hero-ban, **konkrét pain-point nélkül**. Ez ugyanaz a "felületes" probléma amit a babysitter-en is láttunk. Nem mond pain-point-ot → Google nem érti a kereső közönséget → SERP CTR csökken.

**Érintett oldalak:**
- `/handyman-cash-payment-receipt` HP: `Need a simple cash receipt for handyman services?`
- `/tutor-cash-payment-receipt` HP: `Need a simple cash receipt for tutoring sessions?`
- `/cash-deposit-receipt` HP: `Need a simple cash deposit receipt?`
- `/employee-cash-advance-receipt` HP: `Need a simple employee cash advance receipt?`
- `/school-money-collection-tracker` HP: `Need a simple way to track school money collections?`

**Akció (eredeti):** mindegyikre konkrét pain-point hero (mint a babysitter-en `You sit for the Garcias on Tuesdays...`). Audience-fit koherencia (J.14.11.6) szerint mindegyikhez audit-kérdés: "ki fizetne $15.83/hó-t — a service-NYÚJTÓ vagy az ügyfél?" → a hero CTA azt szólítsa meg.

**⚠️ J.14.15.6 DOWNGRADE-INDOK (2026-05-15):** A 5 oldal mindegyikének primary keyword-je (`handyman cash payment receipt`, `tutor cash payment receipt`, `cash deposit receipt`, `employee cash advance receipt`, `school money collection tracker`) **B. TEMPLATE/DOCUMENT** vagy **A. INFORMATIONAL** kategóriába esik a J.14.15.3 szerint — vagyis AI-Overview-vulnerable. Hero-rewrite a CTR-t **nem fogja látható mértékben mozdítani**, mert az alap-akadály nem a snippet-stílus, hanem hogy a klikk **nem éri el az organic listát** (AI-Overview leveszi). **Kivétel:** a `/handyman-cash-payment-receipt` és `/tutor-cash-payment-receipt` esetében az audience-pivot kérdés (service-nyújtó vs ügyfél) önmagában érdekes — DE az is csak akkor ér erőforrást, ha a query-családi besorolás zöld jelzést ad. **Javasolt kezelés:** post-checkpoint az 5 oldalon J.14.15.5 szerinti AI-Overview-jelenlét-tesztet futtatni; csak a C. vagy D. kategóriába eső query-családú oldalak hero-ját rewriten.

#### C. "TEMPLATE" SZÓ MARADT FONTOS HELYEN (P0 — ✅ RÉSZBEN TELJESÍTVE 2026-05-10 14:05, 3 oldal, 1 kizárás)

A user 2026-04-26-án explicit kérte: *"a template szót szándékosan száműztük mindenhonnan mert akkor a 80dik oldalon landolunk"*. De a H1-ekben és Title-ben még maradt 4 helyen:

| URL | Hol maradt | Akció | Státusz |
|---|---|---|---|
| `/petty-cash-policy-template` | H1: `Petty Cash Policy Template` | H1 → `Petty Cash Policy` | ✅ **TELJESÍTVE 2026-05-10** |
| `/cash-count-sheet-template` | H1: `Cash Count Sheet Template` | H1 → `Cash Count Sheet` | ✅ **TELJESÍTVE 2026-05-10** |
| `/daily-cash-report-template` | H1: `Daily Cash Report Template` | H1 → `Daily Cash Report` | ✅ **TELJESÍTVE 2026-05-10** |
| `/two-person-cash-count-policy` | Title: `Two-Person Cash Count Policy + Free Sign-Off Template` | Title → `Two-Person Cash Count Policy + Sign-Off Form` | ⏸️ **KIZÁRVA — post-checkpoint** |

**Megjegyzés:** Az URL-ekben marad a `template` szó (URL-stable, redirect-zaj nem éri meg). Csak a látható szöveg tisztul.

**Kizárás indoka (`/two-person-cash-count-policy`):** Az oldal a 2026-05-10-i 24h GSC adatban **poz 1.5-en (TOP 2!)** rangsorol. Title-csere magas-rangsorú oldalon **rangsor-vesztés kockázat** (kihúznánk a `Free Sign-Off Template` szövegrészt amely valószínűleg behozza a #1 helyezést). Post-checkpoint mérlegelendő — vagy hagyjuk békén, vagy A/B-tesztet kell csinálni. **Új SEO-óvszabály:** **page 1 TOP 3 oldalon Title-cseréhez önmagában gyenge indok az "instrukció-koherencia" — kell hozzá egy magasabb prioritású (pl. policy-szegés vagy CTR-kollapsis) ok is.**

#### D. AUDIENCE-FIT KOHERENCIA GYANÚ (P1 → ⚠️ **CONDITIONAL P1** 2026-05-15 J.14.15.6 alapján — query-családi pre-test kötelező)

Néhány oldal kettős audience-gyanú vagy unclear-target:

| URL | Gyanú | Mit auditálni | J.14.15.5 pre-test |
|---|---|---|---|
| `/school-money-collection-tracker` | Tanár? PTA-volunteer? Szülő? Ki gyűjt? | A sheet-pivotálás után meta-D `Collecting cash for a class trip, PTA fund, or school event?` széles felé szétfolyik. Fókuszálni kéne PTA-treasurer / class teacher szempontra. | **KÖTELEZŐ:** `school money collection tracker` query AI-Overview-check + kategorizálás (gyanú: B. TEMPLATE → STOP, vagy C. TOOL → MEHET) |
| `/event-cash-handling` | Szervező? Volonteer? | D: `Event cash flying around between volunteers and booths?` — kell-e háttér szervezőnek vagy bookzelőnek beszélni? | **KÖTELEZŐ:** `event cash handling` query AI-Overview-check (gyanú: A. INFORMATIONAL "how to handle event cash" → STOP) |
| `/payroll-cash-receipt` | HR? Manager? Worker? | D: `Paying a wage in cash?` — fizető-fél perspektíva, OK. De részletesen ellenőrizni a body-t. | **KÖTELEZŐ:** `payroll cash receipt` query AI-Overview-check (gyanú: B. TEMPLATE → mérlegelendő) |
| ~~`/cash-handoff-receipt`~~ | ~~Shift-team? Volunteer? Manager?~~ | ✅ **J.14.14-ben tisztázva (2026-05-10)** — body audit megtörtént, audience-fit OK, F-policy OK, cluster-hub státusz (21 belső link), 7 use-case-box mind shift+volunteer+employee+location-transfer szegmensekre. **Nincs revízió-igény.** | — |

**Akció (eredeti):** mindegyik oldalon azonosítani a primary audience-t, ellenőrizni hogy a meta + hero + CTA + use-case-boxok mind ugyanazt szólítják-e meg, és hogy a primary audience tényleg fizetne-e $15.83/hó-t.

**⚠️ J.14.15.6 CONDITIONAL-INDOK (2026-05-15):** Az audience-fit revízió **csak akkor ér erőforrást**, ha a query-családi besorolás (J.14.15.3) **zöld** szignált ad (C vagy D kategória). Ha a query AI-Overview-vulnerable (A vagy B), akkor a "tökéletes audience-fit"-tel sem fog jönni klikk — előbb pivot-stratégia kell (pl. `/event-cash-handling` vs. `/event-cash-tracker-app-for-organizers`). Sprint-elejei 0. lépés: 3 SERP-test mind a 3 query-re.

#### E. STALE `dateModified` (P2 — friss-szignál hiánya)

A 48 oldalból ~12 oldal `dateModified` >2 hónapos (>2026-03-05). Ezek vagy csak `lastmod`-bumppal frissíthetők (sitemap-ben), vagy érdemes egy kis content-fresshez kötni.

**Példák:** `/handyman` (2026-03-06), `/tutor` (2026-03-06), `/cash-deposit-receipt` (2026-03-08), `/cash-refund-receipt` (2026-03-08), `/digital-receipt-book` (2026-03-08), `/cash-count-sheet-template` (2026-03-08 → DE 2026-05-03 a sitemap-en), stb.

**Akció:** A B/C/D fix-ekkel együtt automatikusan bumpolódik a `dateModified`. Külön sprint nem kell.

#### F. VOCABULARY ELLENŐRZÉS (P2 — F-policy és J.10 alapján)

A `seoplan.md` 566. és 583. sorai szerint az **"audit trail"** szó **technical-context-ben (Excel-vs-App feature comparison) OK**, **auditor/compliance-vibe-ban TILOS**. Jelenleg 21 HTML-ben van "audit trail" — végig kell auditálni hogy melyik kontextusban. **Becslés szerint ~80% rendben** (technical-feature-context), ~20% lehet hogy auditor-compliance-vibe-ot ad → finomítás kell.

**Egyéb ellenőrzendő kifejezések** (J.10 + F-policy alapján): `evidence trail`, `governance`, `immutable history`, `tip pool tracking`, `wage deduction for cash shortage`, `cash advance loan to employee`. Ezek mind **TILOSAK**. Quick-grep all .html files során 0 előfordulás várt — ellenőrizni a sprint elején.

#### G. CLUSTER-BŐVÍTÉSI JELÖLT — `/cash-handover-template` standalone landing (P2 → ❌ **TÖRÖLT** 2026-05-15 J.14.15.6 alapján — DUPLA-akadály: AI-Overview + template-intent)

**Trigger (eredeti):** A J.14.14 audit (2026-05-10) felfedezte hogy a `cash handover sheet` / `cash handover format` / `handover receipt` query-családon a SERP top 5 **dominánsan template-letöltési intent** (SafetyCulture / pdfFiller / US Legal Forms / Scribd / Vertex42), NEM SaaS-tool intent. A `/cash-handoff-receipt` rangsorol #1-5 helyen ezeken (32 megj./hét), de a klikker letölthető PDF-et akar → 0% CTR.

**Hipotézis (eredeti):** Egy új, **template-letöltési intentre dedikált** standalone landing (`/cash-handover-template` vagy `/free-cash-handover-template`) magához vonhatja ezeket a kattintásokat, és **soft-funnel-en** vezetheti tovább a SaaS-felé.

**❌ J.14.15.6 TÖRLÉSI INDOK (2026-05-15):** A 2026-05-15-i `cash handover sheet` SERP-teszt (J.14.15.2) bizonyította hogy **AI Overview is megjelenik** ezen a query-n, dokumentum-magyarázat formájában. Vagyis az új `/cash-handover-template` landing **DUPLA-akadályba** futna:
1. **Template-intent-mismatch a SERP-en** (J.14.14): a top 5 PDF/Excel template, mi lehet hogy SaaS-tool-funnel akarunk lenni → kettős üzenet
2. **AI Overview rákumulálódik** (J.14.15): a query teljes válaszát az AI adja meg, az organic listát scroll-alá nyomva → klikk-akadály

A két akadály **multiplikatív** — még a tökéletes template-letöltési landing is csak ~10-20%-os klikk-aránnyal működne. **Az erőforrást a J.15.5 (vertical-tool-landing-multiplikáció) szekcióba terelni** — ott AI-immune zónában dolgozunk. A `/cash-handover-template` projekt **hivatalosan kuka**, NEM kerül sprint-be.

**Megőrzött tanulság:** A "új landing → cluster-bővítés template-intent-re" stratégia **általánosan kockázatos** ha a SERP-en AI Overview is van. Csak akkor érdemes, ha a query (1) **NEM** AI-Overview-vulnerable ÉS (2) **NEM** template-letöltési intent-domináns. A két feltétel együtt ritka. Lásd a J.14.15.5 szabály "Opció 1 — STOP" pontját.

### J.15.2 SPRINT-TERV (post-checkpoint, kb. 2026-05-19 után)

A 14-napos checkpoint sikere/sikertelensége határozza meg a sprint-méretet:

**Ha a babysitter J.14.11 sikeres** (`/babysitter` átkerül "Indexelt"-be 1-2 héten belül):
- **Sprint 1 (1-2 nap):** A. pricing-note batch-fix (20 oldal, triviális) + C. template-szó kivétel (4 oldal)
- **Sprint 2 (3-5 nap):** B. copy-pasta hero rewrite (5 oldal) + D. audience-fit audit + fix (4-5 oldal)
- **Sprint 3 (1 nap):** F. vocabulary deep-audit (eseti finomítások, ~5 helyen)

**Ha a babysitter J.14.11 NEM sikeres** (továbbra is "Crawled — currently not indexed"):
- Először az image-uniqueness backlog (J.14.9) — `/tutor` és `/handyman` saját képeket kapnak
- Csak utána a J.15 site-wide audit

### J.15.3 AUDIT-TEMPLATE (egy oldalra, gyors checklist)

Minden auditált oldalra futtassuk le ezt a 8-pontos check-listát:

1. **`<title>`** ↔ **H1** szinkron? (60-70 char-on belül, kulcsszó az elején)
2. **Meta description** primary keyword + pain-point + 1 USP? (150-160 char)
3. **Hero p**: konkrét pain-point (nem `Need a simple X?` generikus formula), specifikus persona-narratíva
4. **CTA button**: action-driven, primary audience-hez illő ige
5. **Hero pricing-note**: az új standard `Free 14-day trial. Paid plans from $15.83/month. No credit card required.`
6. **Use-case-boxok**: mind ugyanazt a primary audience-t szólítják meg + 1 cluster-bridge use-case
7. **Audience-fit koherencia (J.14.11.6)**: a primary audience tényleg fizetne $15.83/hó-t? Ha NEM, **explicit elhárítás** (E-E-A-T-szignál) vagy **secondary szegmensbe** átkerülés
8. **Compliance border (F-policy)**: TIER A/B/C disclaimer megfelelő szintű? Tilos-szavak (J.10.4) NINCSENEK? "Audit trail"-szó technical-context-ben van, NEM compliance-vibe-ban?

### J.15.4 STARTOLÓ FORGATÓKÖNYV (a sprint napján)

1. **Reggel:** GSC `/babysitter` státusz check (Indexelt? Még mindig Crawled-not-indexed?)
2. **Audit-script futtatás**: a fenti J.15.1 diagnostic scan újrafuttatása — talán pár oldalon közben már változás történt
3. **Sprint 1 indítása:** A. pricing-note batch + C. template-szó (1 commit, alacsony kockázat)
4. **Sitemap `lastmod` bump** mindegyik érintett oldalon → 1 commit
5. **GSC indexing-request** csak a B/D/F sprintek után, mert a meta-tag csere önmagában nem indokolja a kvóta-elhasználást
6. **Új checkpoint** a sprint-vég utáni 14 napra

### J.15.5 STRUKTURÁLIS-MOAT TOOL-LANDING SPRINT-TERV (P0 — 2026-05-15, hibrid strategia Codex-megbeszélés után)

**Trigger:** A J.14.15-ös AI-Overview-mapping bizonyította hogy a SpendNote SEO-traffic-jának nagyobb része (A. INFORMATIONAL + B. TEMPLATE kategória, becsült 60-70%) **AI-Overview-cannibalizált**. **A direct-conversion-traffic kizárólag a C. TOOL/COMMERCIAL + D. GEO/SPECIFIC LONG-TAIL kategóriából jöhet.**

**A tervezési folyamat (2026-05-15):**
1. **Asszisztens 12-jelölt-portfolio** (vertical-tool-landingek + replacement + competitor-comparison + USP-driven) — 3 körös SERP-research-szel validálva (16 keresés)
2. **Felhasználói pivot (1):** church kihagyás (F-policy / 501(c)(3) regulatori kockázat); Apple Numbers háttérinfó-szerepre korlátozva (NINCS Apple-natív petty cash sablon)
3. **Felhasználói pivot (2):** "a többi petty cash app helyett, mert mi tudunk receipt-et adni" — strukturális moat hipotézis
4. **Kompetitor-research (4 query)**: Pleo Pocket / JettyCash / Pluto / Zoho Expense receipt-feature-ek → **MIND vendor-receipt-UPLOAD-ot csinál, EGYIK SE generál per-tx PDF receipt-et a recipient-nek**. SpendNote "OUTPUT-side workflow" strukturális moat **bizonyítva**.
5. **Cannibalization-vizsgálat (6 meglévő oldal × 3 új jelölt)**: a `/multi-location-petty-cash-app` jelölt **TRIPLA-cannibal** a friss `/digital-petty-cash-book` (J.14.12 multi-site pivot, 10 napos) + `/petty-cash-app` (J.14.13 multi-site H2, 10 napos) — **kiejt**.
6. **Codex-megbeszélés (2026-05-15 ~14:00)**: drip-feed kötelező; A1 → A3 → A4 sorrend; A4 csak A3-stabilizálás után; A3 sharper distinction (CTA, H1-ben "App", FAQ); MRR-projekció óvatosabb (1-5 / 5-15); blind-spot warning (receipt-template-csapda)
7. **Felhasználói meglátás:** "ha nem új oldalt csinálnánk, hanem azokat módosítanánk amiket amúgy is kanibalizálnának?" → **HIBRID stratégia** mérlegelése
8. **Felhasználói döntés:** A1 = új landing (a /petty-cash-app-vs-excel #1 védelmében); A3 = decision-point post-checkpoint (/petty-cash-app metrikák alapján augm vs új); A4 = parkol

**Cél:** 4-6 hónap alatt **2-4 új tool-landing** (NEM 8-12!) — strukturális-moat angle-re fókuszálva (receipt-OUTPUT workflow), drip-feed sprint-stílusban, post-checkpoint mérés-vezérelten.

#### J.15.5.1 SPRINT-1: A1 ÚJ LANDING — `/petty-cash-app-vs-google-sheets` (P0, post-checkpoint hét 1)

**URL:** `/petty-cash-app-vs-google-sheets` (új)
**Primary keyword:** `petty cash app vs google sheets`, `replace google sheets petty cash`
**Secondary:** `outgrow google sheets petty cash`, `google sheets petty cash limitations`
**Title (draft):** `Petty Cash App vs Google Sheets — When the Spreadsheet Stops Scaling`
**Meta D (draft):** `Tracking petty cash in Google Sheets? See where it breaks at 30+ transactions, why teams switch to a dedicated app, and what receipts you can't generate from a spreadsheet.`
**H1 (draft):** `Petty Cash App vs Google Sheets: When to Switch (and Why Teams Do)`

**Body H2-outline (draft, 9 H2):**
1. Why Google Sheets feels enough at first
2. The Sheets Wall — at what point it breaks (formulas, version-conflicts, no audit-trail)
3. What a dedicated app does that a spreadsheet can't
4. The receipt gap — Sheets templates can't generate signed PDF receipts (← strukturális moat)
5. Side-by-side comparison (Google Sheets template vs SpendNote)
6. When Sheets is actually fine (1 mondat: *"The same problem shows up in Apple Numbers or any shared spreadsheet."* — Codex finomítás, NEM külön H2)
7. What switching looks like
8. FAQ
9. Related Resources

**Cannibal-mitigálás:**
- **vs `/petty-cash-app-vs-excel`** (#1 a `petty cash app vs excel` query-n): direkt analóg, **más query-családra céloz** (Excel vs. Google Sheets független keresési piacok). Inline-link a két comparison-oldal között ("Excel user? See our Excel comparison instead." + fordítva).
- **NEM nyúlunk a /petty-cash-app-vs-excel Title/H1-jéhez** — a meglévő #1 rangsort védjük.

**Cluster-link:** 4-6 inline-link a meglévő hub-okról (/petty-cash-app, /petty-cash-app-vs-excel, /petty-cash-receipt-generator, /digital-petty-cash-book).

**Indok az új landing választására (vs Codex augmentációs javaslat):** A /petty-cash-app-vs-excel jelenleg #1 a `petty cash app vs excel` query-n — saját URL-ünk! Két forgatókönyv:
- Title változatlan + body Google Sheets H2 → Google nem promotálja az új query-családra (Title-relevance hiányzik)
- Title átírva ("vs Excel & Google Sheets") → meglévő #1 rangsor-vesztés-kockázat

Az új landing megőrzi a /petty-cash-app-vs-excel #1-jét **és** új query-családot fog meg.

#### J.15.5.2 SPRINT-2: A3 DECISION-POINT — `/petty-cash-app-with-receipts` augmentaltas vs új (P0, post-checkpoint hét 2-3, /petty-cash-app érlelődési metrikák alapján)

**Két lehetőség, döntés a /petty-cash-app J.14.13-érlelődési metrikák alapján:**

| /petty-cash-app státusz post-checkpoint (hét 2-3) | A3 stratégia | Indok |
|---|---|---|
| **Stabilizálódik page 1 TOP 5-re** (heti 30+ megj. szilárd) | **A3-V1: ÚJ LANDING** `/petty-cash-app-with-receipts` (Codex finomításokkal) | A meglévő oldal jól fut, ne piszkáljuk; az új landing dedikáltan a receipt-USP-comparison-intent-et célozza |
| **Stagnál (poz 30-40, ~5-10 megj./hét)** | **A3-V2: AUGMENTÁLÁS** `/petty-cash-app` receipt-USP H2-blokk (Codex augmentation javaslat) | A meglévő oldalon TÖBB SIGNAL kell, NEM még egy landing ami szét-disperzálja |
| **Vegyes (poz 15-25)** | **A3-V3: HIBRID** body-szintű receipt-USP H2 a /petty-cash-app-on (Title/H1 NEM változik) + 4-6 hét múlva új A3 landing ha a body-bővítés se nem mozdít | Mindkét world-jó kis kockázattal |

**A3-V1 (ÚJ LANDING) — Codex sharper distinction:**
- **URL:** `/petty-cash-app-with-receipts` (új)
- **Primary keyword:** `petty cash app with receipts`, `cash receipt app for teams`, `petty cash app that prints receipts`
- **Title (draft):** `Petty Cash App with Built-In Receipts — One Dashboard, Signed PDFs Every Time`
- **Meta D (draft):** `Most petty cash apps capture vendor receipts. We generate them: every cash handoff produces a signed PDF receipt for both parties, auto-numbered, instantly downloadable.`
- **H1 (draft):** `The Petty Cash App That Generates Receipts — Not Just Captures Them` (Codex: "App", NEM "Generator")
- **CTA (Codex):** `Track petty cash with built-in receipts` (NEM "Create receipt")
- **Schema:** SoftwareApplication hangsúlyos (Codex)
- **FAQ explicit (Codex):** "Is this just a receipt generator?" → "No, it's a petty cash tracking app where each transaction can produce a receipt."

**Disztinkciós táblázat (Codex sharper):**

| Oldal | Audience | Intent | Receipt-szempont |
|---|---|---|---|
| `/petty-cash-app` | Generic researcher | "what is a petty cash app" | Receipt mint mellék-feature, category page |
| `/petty-cash-receipt-generator` | One-time-user | "I need 1 receipt now" | Receipt mint single-task tool |
| `/cash-handoff-receipt` | Shift-team manager | "I need a shift handover form" | Receipt mint document/process intent |
| **A3 `/petty-cash-app-with-receipts`** | **Team-buyer evaluating apps** | **"I need an app where receipts are built into the workflow"** | **Receipt mint USP-comparison** |

**A3-V2 (AUGMENTÁLÁS) — meglévő /petty-cash-app receipt-USP H2-blokk:** A H1/Title/Meta NEM változik (érlelődési mérés folytatódik). Új H2-szakasz a body-ban "Why SpendNote Generates Receipts (Not Just Captures Them)" + a Codex-finomított disztinkciós-táblázat egyszerűsített verziója + cluster-link a /petty-cash-receipt-generator-ra. Plus a /petty-cash-receipt-generator-on egy új H2-bekezdés "Part of the SpendNote Petty Cash App" (NEM H1-csere — rangsor-védelem).

**Blind-spot warning (Codex):** Mindkét variánsban (V1 és V2) a copy-frame: **"app workflow with generated proof"**, NEM "downloadable form / template". Receipt szót használhatjuk, DE a fő promise NEM letölthető form, hanem "app-erősítő USP".

#### J.15.5.3 PARKOL: A4 — `/cash-handoff-receipt-app` (FÜGGŐBEN, A3-stabilizálás után újraértékelendő)

**Indok a parkolásra:**
- A `/cash-handoff-receipt` template/document intent-en jól rangsorol (J.14.14 Opció A: békén hagyós); app-osítás közelebb tolná a két oldalt
- A Codex egyetért: "csak akkor vinném, ha A3 szöge már stabil"
- A4-en kell lenne **következetesen app-nyelv** (dashboard, team members, transaction history, signed PDF, searchable record, recurring workflow) — NE rántódjon vissza receipt-template világba

**Aktiv feltétel-monitoring** (a J.15.5.4 mérési-keret szerint):
- A3 (V1 vagy V2) live legalább 4-6 hét, és impr-érlelés látszik (5+ megj./hét)
- A /cash-handoff-receipt rangsor-rangsor stabil (poz 1-5 megmarad)
- Nincs cannibal-jel a `cash handoff` vagy `cash handover` query-családon

**Ha mind a 3 feltétel teljesül:** A4 jöhet sprint-3 (kb. 6-8 hét múlva)
**Ha nem:** A4 marad parkolva, helyette a Codex-által felvetett plus-jelöltekből választunk

#### J.15.5.4 PLUS-FUTURE JELÖLTEK (Codex 2026-05-15 javaslata, post-A1+A3-stabilizálás)

A Codex 5-jelölt-listája az AI-Overview-immune zónában a strukturális-moat angle-erősítő keyword-ökre:
- `petty cash app with approval` — workflow-feature angle
- `cash handoff app` (A4 alternatíva)
- `cash tracking app for teams` — generic team-fókusz
- `petty cash tracker with receipts` — receipt-USP variánsa
- `cash box app for small business` — small-business vertical

**Ezek mind jelölt-listán** — egyikre se haladunk amíg az A1 és A3 érlelődési metrikák nem stabilizálódtak. Sprint-4 vagy későbbi mérlegelendő (kb. 8-12 hét múlva).

#### J.15.5.5 KIHÚZOTT JELÖLTEK (és indok)

| Jelölt | Indok |
|---|---|
| `/church-petty-cash-management` | F-policy / 501(c)(3) regulatori kockázat — SpendNote nem accounting-tool |
| `/petty-cash-app-for-nonprofits` | Volo Cash + ExpensePoint dominálják a niche-t |
| `/petty-cash-app-for-construction` | Niche, India-fókuszú versenytársak (Yojo, Dux, BuildControl); alacsony US-volume |
| `/petty-cash-app-for-schools` | School-fókuszú vendor-mező már létezik (SchoolBanks, Pupil Wallet, Volo Cash); mini-summary AI Overview |
| `/cloud-petty-cash-system` | Pleo + Zoho big-name kompetitor; SpendNote MÁR #4 organic érlelés |
| `/multi-location-petty-cash-app` (eredeti C1) | **TRIPLA-cannibal a /digital-petty-cash-book + /petty-cash-app multi-site H2-ekkel.** Friss J.14.12 + J.14.13 pivot érlelődési méréseit megzavarná |
| `/cash-handover-template` (J.14.14 Opció C-ből) | Dupla-akadály: AI-Overview + template-intent mismatch (J.14.15.6) |
| `/spendnote-vs-pleo-pocket`, `/spendnote-vs-jettycash`, `/spendnote-vs-pluto` (B-csoport) | Másodlagos prioritás; kompetitor brand-recognition US-ben gyenge; A-csoport után érdemes |
| Apple Numbers dedikált landing | NINCS Apple-natív petty cash sablon (4. SERP-teszt explicit megerősítve); a Numbers-felhasználók Excel-template-eket nyitnak. Bekerül A1 body-ba 1 mondatként (Codex finomítás), NEM dedikált landing. |

#### J.15.5.6 SPRINT-STÍLUS: DRIP-FEED KÖTELEZŐ (Codex egyetért, asszisztens megerősíti)

**Egyértelműen drip-feed:**
- Hét 1 (post-checkpoint indítás): A1 új landing live + cluster-link sweep
- Hét 2-3: /petty-cash-app érlelődési metrikák monitorozása + A3 decision-point
- Hét 3-4: A3 (V1, V2 vagy V3) live
- Hét 5-7: érlelődési-mérés A1 + A3 mindkettőre
- Hét 8+: A4-feltétel-ellenőrzés vagy plus-future jelöltekre váltás

**NEM burst (3 új landing 1-2 nap alatt):** A J.14.7 + J.14.13 lessons learned + a Codex-figyelmeztetés szerint a burst URL-diszperzió rontja az érlelést, és pont most próbáljuk megérteni mit csinál a Google. **3 új URL egyszerre megint elmosná az ok-okozatot.**

#### J.15.5.7 MÉRÉSI-KERET (Codex óvatosabb MRR-projekciójával)

**Per-landing érlelődés:**
- 30 nap után: első impr-ok GSC-ben (várt: 5-30 megj./hét, pos 30-60 között)
- 60 nap után: ranking-érlelés (várt: pos 15-30 között)
- 90 nap után: első klikkek (várt: 1-3 klikk/hét/landing, **Codex: 0-2** ha kompetitor-erősség magas)

**6 hónap kumulatív (2-3 új landing — A1 + A3 [+ esetleg A4]):**

| Forgatókönyv | Klikk/hó | Conv-ráta | Új trial/hó | MRR-impact ($15.83 ARPU, 30% trial→paid) |
|---|---|---|---|---|
| **Konzervatív (Codex)** | 5-15 | 5-10% | **1-5 trial/hó** | $5-25/hó addicionális MRR |
| **Realisztikus** | 15-40 | 7-12% | **3-8 trial/hó** | $15-40/hó addicionális MRR |
| **Optimista (Codex jó esetben)** | 30-80 | 10-15% | **5-15 trial/hó** | $25-75/hó addicionális MRR |

**Feltétel az optimista forgatókönyvre (Codex):** legalább az A1 vagy A3 elkezd top 10-20 környéken stabilizálódni 90 nap után.

#### J.15.5.8 KOCKÁZATOK ÉS MITIGÁLÁS

| Kockázat | Mitigálás |
|---|---|
| Új URL-diszperzió megzavarja a friss /digital-petty-cash-book + /petty-cash-app érlelődést | Drip-feed: 1 új landing/hét; A3 csak akkor mehet ha /petty-cash-app metrikák lezárhatók |
| Cannibalization a meglévő oldalakkal | Disztinkciós táblázatok (A3-nál Codex-szigorítva), inline-cross-link minden új landingen |
| **Receipt-template-csapda** (Codex blind-spot) | Mindkét A3-variánsban frame: "app workflow with generated proof", NEM "downloadable form" |
| Strukturális-moat angle gyengébb mint hisszük (A3) | A1 továbbra is működik (független USP); plus-future jelöltek tartalék-irány |
| Új landingek lassú érlelődése (3-6 hónap) | Cluster-link-támogatás indulás napján; sitemap.xml lastmod bump; szükség esetén GSC indexing-request |
| Pricing-note + audience-fit koherencia (J.14.11.6) | Mind a landingek standard `Free 14-day trial. Paid plans from $15.83/month.` pricing-note, multi-team CTA |

#### J.15.5.9 INDÍTÁS-FELTÉTEL (sprint-1 START-CHECKLIST)

**A1 sprint-1 indulása előtt** (post-checkpoint, kb. 2026-05-19+):

- [ ] 2026-05-19-i checkpoint áttekintés: /digital-petty-cash-book + /petty-cash-app + /babysitter érlelődési metrikák mind stabilak (poz-mozgás <±10)
- [ ] Friss SERP-test a `petty cash app vs google sheets` query-n: AI-Overview-jelenlét NULLA marad (J.14.15.5 0. lépés)
- [ ] Felhasználói zöld jelzés a végleges A1 Title/H1/Meta-ra (Codex finomítások beépítve)
- [ ] Cluster-link-tervezés: konkrét 4-6 inline-link pontosítása (melyik oldalon, melyik anchor-szöveggel)
- [ ] /petty-cash-app-vs-excel cross-link előkészítve ("Looking for the Excel comparison instead?")
- [ ] sitemap.xml új URL hozzáadása + lastmod bump

**A3 sprint-2 indulása előtt** (kb. 2026-05-26+, hét 2-3):

- [ ] /petty-cash-app post-checkpoint érlelődési metrikák kiértékelése (poz, megj/hét, klikk/hét)
- [ ] A3-V1 / A3-V2 / A3-V3 döntés a táblázat alapján
- [ ] V1 esetén: friss SERP-test a `petty cash app with receipts` + 2 secondary query-n
- [ ] V2 esetén: /petty-cash-app body-szakasz draft + felhasználói áttekintés
- [ ] Felhasználói zöld jelzés a végleges variánsra

**A4 sprint-3 indulása előtt** (kb. 2026-06-15+, opcionális):

- [ ] A3 érlelődés legalább 4-6 hét, impr-növekedés látszik
- [ ] /cash-handoff-receipt rangsor stabil (poz 1-5 megmarad)
- [ ] Nincs cannibal-jel a `cash handoff` / `cash handover` query-családon
- [ ] Mindhárom feltétel teljesülése esetén: A4 mehet; egyébként parkolás folytatódik vagy plus-future jelöltekre váltás

#### J.15.5.10 CODEX-MEGBESZÉLÉS AUDIT-TRAIL (2026-05-15 ~14:00)

**Felhasználói trigger:** *"itt van a codex válasza és utána felvetettem neki egy kérdést, de ezt beszéljük át mi is"*

**A Codex 6 kulcs-finomítása az asszisztens A1+A3+A4-tervére:**
1. Drip-feed kötelező (1 új landing/hét, NEM 3 egyszerre)
2. A3 sharper distinction: CTA "Track petty cash with built-in receipts", H1-ben "App" NEM "Generator", FAQ explicit "Is this just a receipt generator?", SoftwareApplication schema hangsúlyos
3. A4 csak A3-stabilizálás után (app-nyelv konzisztencia)
4. /cash-handoff-receipt H1-jét NEM piszkálni (J.14.14 békén hagyós)
5. Apple Numbers csak 1 mondat (NEM külön H2)
6. MRR-projekció óvatosabb (1-5 / 5-15 trial/hó); blind-spot warning: receipt-template-csapda

**Felhasználói plus-kérdés a Codexnek:** *"mi lenne ha nem új oldalt csinálnák, hanem azokat az oldalakat módosítanánk amiket amúgy is kanibalizálnának???"*

**Codex válasz (Input #2):** "felnőttebb irány" — meglévő oldal augmentálás új URL helyett. Konkrét javaslatok: A1 helyett /petty-cash-app-vs-excel bővítés Google Sheets H2-vel; A3 helyett /petty-cash-app receipt-USP blokk + /petty-cash-receipt-generator app-erősítés; A4 parkol.

**Asszisztens-mérlegelés a hibrid-stratégiához:**
- A1: az augmentálás a /petty-cash-app-vs-excel #1-jét veszélyeztetné (Title-csere rangsor-vesztés-kockázat) VAGY nem fog megfogni az új query-családot (ha Title változatlan). Új landing biztonságosabb.
- A3: a /petty-cash-app aktív tesztelési ablakban van (J.14.13 érlelődés) — augmentálás megszakítaná. Decision-point post-checkpoint logikusabb.
- A4: Codex egyetért parkolásra.

**Felhasználói végső döntés (2026-05-15 ~14:15):**
- A1 = új landing (sprint-1)
- A3 = decision-point post-checkpoint (/petty-cash-app metrikák alapján augm vs új)
- A4 = parkol

**Új SEO-meta-tanulság (J.14.15.7-hez kiegészítés):** *"Új landing vs. meglévő oldal augmentálás döntés — KÖTELEZŐ ellenőrzés-pontok: (1) a meglévő oldal aktív tesztelési ablakban van-e? Igen → augm tilos amíg az ablak le nem zárult. (2) a meglévő oldal Title/H1 jelenlegi rangsort hoz-e? Igen → Title-csere kockázatos, body-szintű augm vagy új landing. (3) az új query-család lényegesen különbözik-e a meglévő oldalétól? Igen → új landing tisztább; Nem → augm preferred."*

> **Megelőző iránymutatás** (a 05-01-i guardrails-blokk fent felülírja a teendőlistát, de ez a stratégiai megfontolásokat / SERP-research-eredményeket / conditional backlogot változatlanul érvényben tartja).
>
> **2026-04-28 ÉJSZAKA-update:** A felhasználó override-ja után a 23:30-as SERP-evidence (F.2.F + F.2.G) alapján **2 további meta/content-tweak** is végrehajtásra került ma (lásd a fenti két szekció VÉGREHAJTVA blokkjait). Ezzel az "A. NE PISZKÁLJUK" moratóriumot **a holnaptól (2026-04-29)** számoljuk újra. Új URL-t továbbra sem adunk hozzá, és új H1-rewrite sincs az érintett 2 oldalon kívül.
>
> **2026-05-01 ESTE-update:** A 04-29 → 05-19 moratóriumot a felhasználó override-ja után megszakítottuk a `/petty-cash-app` Google-discoverability micro-sprint-tel (lásd fent, `STRATEGIC GUARDRAILS — 2026-05-01 ESTE` szakasz). Az új moratórium-ablak: **2026-05-01 → 2026-05-15**. Az alábbi 04-28-i blokk teendőlistája (## A.) ezzel **lezárult**; a stratégiai irányok (## C. brainstorm, ## D. solo-business backlog, ## E. csatorna-stratégia, ## F. kutatás-backlog) változatlanul referencia.

## A. NE PISZKÁLJUK 2-3 hetet (2026-04-29 → 2026-05-19) — LEZÁRVA 2026-05-01-EN

3 új oldal kiment 2 nap alatt (`cash-float-vs-petty-cash`, `payroll-cash-receipt`, `petty-cash-custodian`) + meta-tweak 4 oldalon (04-28 ESTE) + cloud/online framing-tweak `petty-cash-app`-on + Pro Custom Labels conversion-content `custom-cash-receipt-with-logo`-n (04-28 ÉJSZAKA) + 28-oldalas trust-fix sweep ("Free tier" → "Free 14-day trial") + 1 cím-pivot (`employee-cash-advance-receipt`) + sitemap `lastmod` bump 40+ oldalon. Ez bőven elég jel a Google-nak.

**Tilos:**
- Új oldal
- Új title-rewrite
- Új H1/H2 átírás
- Új internal-link átépítés

**Megengedett:**
- Indexelési kérés (egyenként, max 5/nap kvóta — a 04-26-i kvóta-leégés után figyelni kell)
- Sitemap resubmit
- Search Console figyelése (de nem napi, hetente max 1×)
- GSC export napi/heti mentése

**Cél:** Hagyni a Google-t feldolgozni 4 hét tartalmi lavinát (04-25-i nagy sprint + 04-26-04-28-i trust-fix + új oldalak) mielőtt újabb hullámot indítunk.

## B. 14-napos checkpoint (2026-05-12)

Ekkor (és csak ekkor) értékeljük:

1. **`cash-float-vs-petty-cash`** — a 45+ imp/28d query-cluster bejön-e az új oldalra? Top 30-ba?
2. **`payroll-cash-receipt`** — a 48 imp/28d (`payroll receipt(s)`) realizálódik-e az új oldalon? A "NOT a payslip" framing visszatartja-e a rossz intent-eket?
3. **`petty-cash-custodian`** — saját-brainstorm jelölt teljesít-e? Ha igen, az validálja a brainstorm-stratégiát.
4. **Trust-fix CTR (28 oldal)** — javult-e a CTR a "Free trial" honest framing után, vagy stagnált/csökkent?
5. **4 meta-tweak** (`construction-site-petty-cash`, `event-cash-handling`, `who-took-money-from-cash-box`, `cash-discrepancy-between-shifts`) — query-targeting hatása.
6. **`employee-cash-advance-receipt` cím-pivot** — a "Cash Advance Receipt" front-load-olás javította-e a CTR-t a query-re?

## C. Saját brainstorm 19 query-re (2026-04-28 este, élő SERP-teszttel)

**Kontextus:** A felhasználó kérte, hogy ne csak GSC-export adataiból, hanem saját agyamból is brainstormoljak új keyword-clustereket. 19 ötletet teszteltem élő SERP-pel.

**Piaci validáció — 9 query-n már TOP 5 vagyunk dedikált oldal nélkül:**
- `cash discrepancy small business` (top 1)
- `petty cash for tradies` (top 1)
- `cash box always missing money` (top 2-3)
- `switching from paper petty cash log` (3 oldal a top 5-ben)
- `first time setting up petty cash` (top 3)
- `petty cash for one-person business` (top 5)
- `replace petty cash with app` (top 5)
- `cash float for events` (top 4)
- `petty cash for freelancers` (top 5)

**Action: 4 meta-tweak elvégezve** (zero kockázat, tartalom változatlan, csak `<title>` + meta description + og/twitter):
- `construction-site-petty-cash` → + "Tradies"
- `event-cash-handling` → "Cash Float for Markets, Festivals & Booths"
- `who-took-money-from-cash-box` → "Cash Box Always Missing Money? — Find Out Who Took It"
- `cash-discrepancy-between-shifts` → + "Small Business Guide"

**Skipped jelöltek (jogi kockázat — ezt explicit a felhasználó kérdezte):**

| Cluster | Miért NEM |
|---|---|
| `petty cash for church` / `petty cash for charity` / `petty cash for nonprofits` | Donor receipts (IRS $250 rule, UK Gift Aid), 501(c)(3) compliance, Form 990, restricted funds, Charity Commission filings — SpendNote nem kezel ilyet, és az asszociáció erősen tax-deductible donation-felé vinné. **Pénzügyi/jogi kockázat > SEO-haszon.** |
| `petty cash for school office` | Iskolai politika-PDF-ek + district-policy oldalak, gyenge SpendNote-intent. |
| `imprest petty cash fund`, `do I need petty cash`, `is petty cash going away`, `alternatives to petty cash` | Wikipedia / Investopedia / Shopify / QuickBooks-fal, esélytelen rövid távon. |
| `multiple petty cash boxes`, `shared cash box for team`, `office cash unaccounted for` | Rossz SERP-intent — fizikai cashbox-shopok (Q-Connect, Barska) + hír-történetek (Wake County). |

## D. Conditional PENDING: `petty-cash-for-solo-business.html` — NE most

A saját brainstorm **legjobb biztonságos jelöltje** (3 query-re top 5 dedikált oldal nélkül: `petty cash for sole trader`, `petty cash for freelancers`, `petty cash for one-person business`). **DE** óvatos fázisban vagyunk és a jelenlegi 3 új oldal stabilizálódását várjuk meg.

**Trigger feltételek (mindhárom kell 2026-05-12-ig):**
1. A 3 új oldal stabilan indexelődött, kapnak impressiont.
2. Search Console mutatja, hogy `sole trader` / `freelancer` / `one-person` query-kre is kapunk impressiont (most top 5 dedikált oldal nélkül).
3. Felhasználó zöld jelzést ad.

**Ha NEM teljesül:** marad a jelenlegi state, nem fragmentáljuk fel.

## E. Csatorna-stratégia tisztázás (felhasználói kontextus)

Felhasználó: full-time másik munka mellett dolgozik a SpendNote-on. **Nincs ideje** Reddit-postingra, Product Hunt-launchra, B2B outreach-re, paid Google Ads-re.

**Konzekvencia:** **Google organic search az egyetlen marketing csatorna**. Minden stratégia ehhez igazodik:
- Egyszer-megírt-örökre-rangsoroló oldalak (compounding asset)
- Minimális karbantartás (havonta 1-2 commit)
- Türelem (4-12 hét compounding)
- Felhasználó CSAK átnéz, nem ír / nem postol / nem outreach-el
- Skip verdiktek = quick-win SEO-stratégia, NEM piaci hiány

## F. Backlog — kutatás-fázis (2026-05-12 utánra fenntartva)

A "sleep-on-it" csak publikálási moratórium, a kutatás zéró kockázatú. Az alábbi backlog 2 forrásból táplálkozik: (1) saját brainstorm 04-28-ról, (2) GSC 28-napos export mély dive 04-28 este.

### F.1 Saját brainstorm — kimaradt jelöltek

- **`petty-cash-for-solo-business.html`** (lásd D pont) — sole trader / freelancer / one-person business csomag. **Top jelölt** ha a 3 új oldal stabilizálódik 2026-05-12-ig.
- `petty-cash-policy-pdf-printable` — ha kiderül hogy a `petty-cash-policy-template` nem produkál PDF/template-intent forgalmat. SERP-evidence kell előtte.
- `petty-cash-app-comparison` v. `best-petty-cash-app-2026` — commercial intent, alacsony AI Overview kockázat. 14-napos checkpoint adatai után dönthető.

### F.2 GSC 28-napos mély dive — alulhasznosított jelek (2026-04-28)

**Adatforrás:** `spendnote.app-Performance-on-Search-2026-04-09/Lekérdezések.csv` (28 napos), `2026-04-25/` (7 napos), `2026-04-25/Oldalak.csv` (oldal-szintű).

#### F.2.A Tier 1 — Existing pages with untapped query potential (meta-tweak jelöltek)

> **Frissítés 2026-04-28 23:30 — élő SERP-teszt eredménye:** Az alábbi #1 és #2 cluster a GSC-export adata szerint "alulhasznosítottnak" tűnt, de élő SERP-keresés feltárta hogy már top 1 vagy gyenge SERP-fit. **Mindkettő törölve a tervből.** A megmaradó cluster-ek csak query-tracking-re vannak, nem actionable backlog. (Lásd lejjebb F.2.A.live-SERP szekciót.)

| # | Cluster | Imp/28d | Oldal | Jelenlegi state | Action 2026-05-12 utánra |
|---|---|---|---|---|---|
| 1 | ~~**Refund**~~ | ~~60+~~ | `cash-refund-receipt.html` | **TÖRÖLVE — 04-28 SERP-teszt: már TOP 1** a sima `refund receipt`-re is. GSC pos 32 régi adat. | **NINCS — already winning**. Hagyjuk békén. |
| 2 | ~~**Reckon alternative**~~ | ~~34~~ | (nincs dedikált) | **TÖRÖLVE — 04-28 SERP-teszt:** Top 5: Pleo, Pluto, Kash AI, Easy Cash Manager — mély SaaS-verseny, gyenge SERP-fit egy SpendNote-comparison page-nek. A 34 imp accidental homepage rangsor. | **NINCS — bad SERP fit**. |
| 3 | **Track / Tracker** (`petty cash tracker` 1/39, `petty cash tracking` 1/43, `petty cash tracking template` 4/42, `petty cash tracker template` 1/43, `tracking cash` 2-4/47-58, `automate petty cash tracking` 1/63) | ~12 | `petty-cash-app.html` lehet hostja | Az új `petty-cash-app` oldalra nem optimalizált a "tracker"/"tracking" keyword | **Meta-tweak** a `petty-cash-app`-on: H2-ben "Petty Cash Tracker" alias. NEM most, csak ha 2026-05-12-ig sem jönnek imp-ek. SERP-tesztelni a checkpoint napján. |
| 4 | **Cash Advance** (`cash advance receipt` 13/**6**, `cash advance slip format` 5/**6**, `salary advance receipt format` 1/**1**, `cash advance receipt format` 6/8, `acknowledgement receipt for cash advance` 1/28, `advance receipt` 1/20, `advance slip` 1/20, `employee cash advance` 1/20, `receipt of advance payment by employee` 1/9) | **30+** | `employee-cash-advance-receipt.html` | **Mai (04-28) cím-pivot megtörtént** ("Cash Advance Receipt" front-load). Most figyelünk. | **NE piszkáljuk**, mai pivot hatását mérjük. |
| 5 | **Cash discrepancy** (`cash discrepancy` 3/33, `cash discrepancies` 6/59, `cash register discrepancies` 2/47, `discrepancy note` 1/53) | ~12 | `cash-discrepancy-between-shifts.html` | **Mai (04-28) meta-tweak megtörtént** ("Small Business Guide" framing). | **NE piszkáljuk**, mai tweak hatását mérjük. |
| 6 | **Audit** (`petty cash audit procedures` 2/49, `surprise cash count audit procedures` 1/61, `cash audit` 1/80, `cash audit report` 2/79, `petty cash audit` 1/60, `audit of petty cash fund` 1/95, `how to audit petty cash` 1/65) | ~10 | `petty-cash-audit-checklist.html` | Gyenge pozíciók, sok query-fragmentet nem fed | **Meta-tweak** (NEM most): description-be több audit-variáció. 2026-05-12 utánra. SERP-tesztelni előtte. |

#### F.2.A.live-SERP — 2026-04-28 SERP-evidence (élő Google search)

A backlog összeállítása **nem alapulhat csak GSC-export adatán** — a GSC 28 napos átlag, így régi (akár hetekkel/hónapokkal korábbi) pozíciókat keverhet. 8 query-re élő Google-keresés:

**Already winning — TOP 1 a SERP-en (NEM kell action):**

| Query | Top 1 oldal | Megfigyelés |
|---|---|---|
| `refund receipt` | **`spendnote.app/cash-refund-receipt`** | A GSC `refund receipt` 30 imp/pos 32 adata **régi**. SERP-en már TOP 1. |
| `simple petty cash software` | **`spendnote.app/index.html`** (homepage) | Saját brainstorm jelölt — már nyertes. |
| `digital alternative to petty cash book` | **`spendnote.app/digital-petty-cash-book`** + #3 homepage | Saját brainstorm jelölt — már nyertes (top 1 + top 3). |
| `proof of cash payment letter` | **`spendnote.app/cash-payment-received-proof`** | GSC pos 20 adata régi, SERP-en TOP 1. |

**Bad SERP fit / wrong intent — SKIP:**

| Query | Mit talál a SERP | Miért nem mi |
|---|---|---|
| `petty cash app no subscription` | Google Play "100% free" appok (Groosh, Vnnovate) | Mi fizetősek vagyunk a 14-napos trial után — query az ingyenességet keresi |
| `cash drawer app for small business` | Denomination counter appok (CashUp $15/mo, Tilly Tally, Cash Counter) | Bankjegy-számláló intent ≠ tracking intent |
| `reckon alternative petty cash` | Pleo, Pluto (G2 top 50!), Kash AI, Easy Cash Manager | Mélyen elmerült SaaS-verseny, gyenge SERP-fit egy comparison page-nek |
| `cash float for retail till` | retaildogma.com, bizfluent.com, **nibusinessinfo.co.uk (gov)** | Info-intent + gov-page — verhetetlen, AI Overview-zóna |

**Konzekvencia:** A 8 saját-brainstorm + GSC-derived jelölt közül **0 új oldal szükséges**, és **0 meta-tweak szükséges most**. A meglévő 4 oldal (homepage, `cash-refund-receipt`, `digital-petty-cash-book`, `cash-payment-received-proof`) magától nyer azokra a query-kre, amikre a GSC-export még csak régi adatot mutat.

**Tanulság a metodológiához:** GSC-export pos-átlagok **nem tükrözik a jelenlegi rangsort**. Mielőtt bármi backlog-tételhez hozzányúlunk, **élő SERP-check kötelező**. A 2026-05-12-i checkpoint napján a maradék 4 backlog-tétel (Track/Tracker, Cash Advance, Cash Discrepancy, Audit) mindegyikét élő SERP-en meg kell nézni a döntés előtt.

#### F.2.F Customization & Localization brainstorm — 2026-04-28 23:30 SERP-evidence

**Felhasználó-felvetés:** A SpendNote Pro tier-ben minden receipt-label szabadon átírható **bármilyen szövegre, bármilyen nyelven** (`Received from` → `Recibido de` / `Reçu de` / `Erhalten von` / akármi). Ez egy valódi, honest feature — a versenytárs Invovate **fix 11 nyelvet** ad, MyDocsGenerator 10-et, Receiptor AI csak olvas (nem generál); a SpendNote-Pro **akármilyen nyelvet** enged a felhasználó saját szövegeivel.

**SERP-tesztelt query-k (4):**

| Query | Top 5 | Diagnózis |
|---|---|---|
| `receipt in any language` | translate.how, indifferentlanguages, Cambridge Dictionary | **Fordítási szótár intent** — "hogy mondják spanyolul receipt". Nem SpendNote. |
| `receipt with custom labels` | receiptbaker, makemyreceipt, onlinereceiptmaker, printit4less, etsy | **Fake-receipt builder + fizikai NCR könyv**. Nem SpendNote. |
| `editable receipt template fields` | template.net ×3, receiptbaker, eforms | **Template-marketplace**. Nem SpendNote. |
| `cash receipt your own language` | receiptbaker, wise, eforms, offidocs (NL), allbusinesstemplates (NL) | **Template-tömeg** + LibreOffice docs. Nem SpendNote. |

**Konzekvencia — fontos stratégiai átkeretezés:**

A Pro Custom Labels feature **valódi és értékes**, DE **rossz a query-tér** SEO-traffic szempontból. Minden ilyen query a template/builder/fake-receipt térbe megy, ahol nem versenyzünk.

**Két különböző stratégia keveredett:**

| Stratégia | Cél | Hova illik a Pro Custom Labels |
|---|---|---|
| **SEO-traffic** | Új user a Google-ből → SpendNote | ❌ NEM ide való — a query rossz intent-térben mozog. |
| **Conversion** | Meglévő érdeklődő → Pro upgrade | ✅ **IDE való** — `custom-cash-receipt-with-logo`, `spendnote-pricing` oldalakon érdemes hangsúlyozni. |

**Action — VÉGREHAJTVA 2026-04-28 ÉJSZAKA (a felhasználó override-jára: "szerintem ezt ma is megcsinálhatod, nem?"):**

- ❌ **NEM csináltunk** új landing oldalt `multilingual-cash-receipt.html` vagy `customizable-receipt-labels.html` néven (és nem is fogunk — rossz query-tér).
- ✅ **Conversion-content-bővítés DONE** a meglévő oldalakon:
  - ✅ `custom-cash-receipt-with-logo.html` — új H2 szekció: "**Pro: Customize Every Label — In Any Language**" (4 bekezdés + 3 bullet use-case + a fix legal disclaimer kivételének tisztázása) + új FAQ ("Can I customize the receipt text in my own language?") body-ban és JSON-LD FAQPage-ben + Article `dateModified` `2026-04-28T22:00:00+00:00` + sitemap `lastmod` `2026-04-28`.
  - ✅ `spendnote-pricing.html` — **NEM kellett** változtatni: a Pro tier feature-list **már tartalmazta** a `'Customizable text & labels (localization)'` sort (872 + 917 sor monthly+yearly).
- A felhasználó 11:25 PM-i megerősítése (Pro tier akármilyen szöveg / akármilyen nyelv, csak a kötelező legal disclaimer fix) miatt ez **honest claim**, nem hamis feature-marketing.

**Skipped templokálás (jogi kockázat):**

`receipt in spanish template` SERP-en Harvest "Receipt Template for Spain" oldal explicit hangsúlyozza: NIF + IVA 21% + **VERI*FACTU** (2026 január 1-től kötelező AEAT). Hasonló: francia TVA, német UStG, olasz e-fattura. **Ezekre soha NEM** célzunk, ne ütközzünk tax-compliance kötelezettségbe (mint a `payroll-cash-receipt` esetében sem). A SpendNote pozícionálás marad: **"internal cash handoff proof, NOT tax document"**.

#### F.2.G Cloud / Online / Web-based angle — 2026-04-28 23:30 SERP-evidence

**Felhasználó-felvetés:** A SpendNote real-time online sync feature (bárhonnan bárki ellenőrizheti) — versenyelőny az offline app-okhoz képest.

**SERP-tesztelt query-k (4):**

| Query | SpendNote pozíció | Top 5 | Diagnózis |
|---|---|---|---|
| `cloud petty cash software` | **TOP 3** | usepetty.cash, Pleo, **SpendNote**, Zoho Expense, Pluto | ✅ Erős valós tool-intent verseny, mi már bent vagyunk |
| `online petty cash management` | **TOP 5** | usepetty.cash, Pluto, Pleo, pettycashweb, **SpendNote** | ✅ Tartható |
| `web based petty cash app` | **TOP 4** | usepetty.cash, pettycashweb, Pleo, **SpendNote**, Pcash | ✅ Tartható |
| `real time cash tracking app` | **NINCS top 5-ben** | Cash App, Quicken Simplifi, Monarch, PCMag, Cashmonki | ❌ Personal finance tér (Cash App / budgeting), NEM petty cash → SKIP |

**Konzekvencia — ez meta-tweak-jelölt, NEM új oldal:**

A `petty-cash-app.html` + homepage már TOP 3-5-ben rangsorol 3 query-n dedikált "cloud" / "online" / "web-based" framing nélkül. **Tartalom-erősítés** ezekkel a kulcsszavakkal **upgrade-elhet** TOP 3-ról TOP 1-re — NEW ÚJ OLDAL.

**Action — VÉGREHAJTVA 2026-04-28 ÉJSZAKA (a felhasználó override-jára):**

A `petty-cash-app.html`-en:
- ✅ `<title>`: `"Petty Cash App — Online, Cloud-Based Tracking for Small Teams"` (62 char, mobil SERP-safe)
- ✅ Meta description + og:description + twitter:description: `"Cloud-based petty cash app for small teams. Record cash online, generate PDF receipts, and track the float in real time across cash boxes. Free 14-day trial."` (157 char)
- ✅ og:title + twitter:title: ugyanaz mint title
- ✅ H1: `"A Simple, Cloud-Based Petty Cash App for Small Teams"` (előtte: "A Simple Petty Cash App for Small Teams")
- ✅ Hero lead bekezdés: "Record every cash movement **online — from any phone or laptop, anywhere**" + "Watch the float update in real time **across the team**" + "SpendNote is a **web-based app**…"
- ✅ "What a Real Petty Cash App Does" lead bekezdés: "SpendNote is a **cloud-based, browser-only** petty cash app… The whole team sees the same live data, updated in real time."
- ✅ **Új feature card** (10. card): "**Cloud-based — access from anywhere**" — "Online and web-based, with nothing to install. The custodian records on site, the owner watches the dashboard from home, the office, or the road — same live data, real-time team visibility."
- ✅ JSON-LD Article: `headline` + `description` + `dateModified: 2026-04-28T22:00:00+00:00`
- ✅ Sitemap `lastmod` → `2026-04-28`

A homepage H1-bővítést **nem** csináltuk meg — minimálisra korlátoztuk a változtatást egyetlen oldalra (`petty-cash-app.html`), hogy a 04-28-ÉJSZAKA-tweak ne menjen át "új sprint"-be.

**Versenyhelyzet `usepetty.cash` ellen** (informatív, NEM ide-most action):
- **Pricing**: SpendNote 14-napos free trial vs usepetty.cash €29/mo first day from sign-up — a **Free 14-day trial** kifejezést a meta description tartalmazza, így SERP-snippetben látszik.
- **Egyszerűség / browser-only**: a friss "cloud-based, browser-only" framing már lefedi.

**Skipped (nem változott):** `real time cash tracking app` — Cash App + Quicken + Cashmonki personal finance tér, ahova SpendNote nem tud SERP-fittel betörni.

**Reindex lépés:** A `petty-cash-app.html`-re a felhasználó 04-28 reggel már kért indexkérelmet (a 4. URL-en kifogyott a kvóta), de az **a tartalom-update ELŐTTI** snapshot. **04-29 reggel újabb Request Indexing kell** ezen az oldalon, hogy a friss snapshot menjen be.

#### F.2.H 8-jelölt brainstorm batch — 2026-04-28 23:45 SERP-evidence (4 kategória: pain-driven / role / migration / use-case)

**Kontextus:** A 23:30-as customization+localization batch ELŐTT elindítottam egy 8-jelölt SERP-tesztet 4 kategóriában (pain-driven / specific role / migration / specific use-case), de a felhasználó közbeszólt a saját ötletével és a 8-batch eredményei nem lettek triage-elve. Ma este 23:45-kor a felhasználó kifejezetten kérte a folytatást ("korábban kezdtél volna valamiket ellenőrizni a serpben mielőtt jöttem az ötleteimmel... folytasd azt").

**SERP-tesztelt query-k (8):**

| # | Query | Kategória | SpendNote pozíció | Top 5 | Diagnózis |
|---|---|---|---|---|---|
| 1 | `petty cash never balances` | pain-driven | **TOP 1 + TOP 3** | **`petty-cash-does-not-balance.html`** + Chron + **`petty-cash-does-not-balance`** + Investopedia + Spendesk | ✅ Saját oldal mind kanonikus mind .html-ben listázva — már nyertünk |
| 2 | `tired of petty cash spreadsheet` | pain / migration | **TOP 2 + 3 más SpendNote oldal a top 5-ben** | Sheetrix + **`petty-cash-app-vs-excel`** + usepetty.cash + **SpendNote homepage** + **`how-to-manage-petty-cash-small-business`** | ✅ Brutális coverage — nyertünk |
| 3 | `cash short at end of day` | use-case (close-out) | NINCS top 5-ben | Cassida.me + Dohassist + Erply + Retaildogma + Dohassist franchise | ❌ **POS / register intent** (cassida POS hardware, erply POS, retaildogma retail) — NEM petty cash custodian. Skip — bad SERP fit. |
| 4 | `office manager petty cash duties` | specific role | NINCS top 5-ben | Investopedia + FinModelsLab + PettyCashPlus + Bill.com | ❌ **Authority-óriás fal** (Investopedia + Bill.com). A `petty-cash-custodian.html` magától felmehet az "office manager" role-implicitre, de itt direkt célzás nem éri meg a fight-ot. Skip. |
| 5 | `replace petty cash log book` | migration | NINCS top 5-ben | **BookFactory** (fizikai notebook!) + BookFactory 8.5x11 + Amazon notebook + Store.com notebook + TemplateLab | ❌ **EXTRÉM rossz SERP fit** — a top 4 fizikai NOTEBOOK termékek (papír log book-ok)! Nem app-keresési intent. Skip. |
| 6 | `record cash without bank account` | pain / off-grid | **TOP 1** | **`how-to-track-cash-payments`** + QuickBooks Intuit Forum + Beancount + Patriotsoftware + Cleverence | ✅ Már nyertünk |
| 7 | `cash on hand tracker app` | semantic variant | NINCS top 5-ben | Cash on Hand iOS App + Cash Counter (coin counter) + Cash Book + Cash Tracker + Finfluence | ❌ **Personal finance / coin-counter app intent** — App Store coin-counting app-ok dominálják. NEM petty cash management. Skip. |
| 8 | `cash count at end of shift` | use-case (close-out) | **TOP 3** | Cursa.app (cash handling course) + Cassida.me + **`cash-drawer-reconciliation`** + ShiftForce + Wikipedia (Cashier Balancing) | ✅ Top 3-ban + Cursa/Wiki konkurencia. Tartható. |

**Konzekvencia:**

| Verdikt | Darab | Query-k |
|---|---|---|
| ✅ Már TOP 1-3 dedikált oldallal — skip | 4 | #1 `petty cash never balances` (TOP 1+3), #2 `tired of petty cash spreadsheet` (TOP 2 + 3 másik oldal), #6 `record cash without bank account` (TOP 1), #8 `cash count at end of shift` (TOP 3) |
| ❌ Bad SERP fit — skip | 4 | #3 POS/register intent, #4 Investopedia+Bill.com fal, #5 fizikai notebook-bolt-ok, #7 personal finance/coin-counter app-ok |

**Új teendő a 8-jelöltből: 0** — nincs új landing oldal, nincs meta-tweak. **Minden győztes query-re már megvan a dedikált oldal**, és a vesztes query-k mind rossz SERP-térben mozognak (POS / authority-fal / fizikai termékbolt / personal finance).

**Ez a 4. piaci validáció ma este** (a 04-28 ESTE 9-jelölt + a 23:00 PM 8-GSC-jelölt + a 23:30 PM cloud/online 4-jelölt + a 23:45 PM 8-jelölt batch): SpendNote **valós tool-intent piacon** működik, és sok query-n már TOP 1-en van, anélkül hogy ezt a GSC-export 4-8 hetes lag-jén keresztül látnánk.

#### F.2.I 8-jelölt iparág-vertikális batch — 2026-04-28 23:50 SERP-evidence (felhasználó pushback után — recycled kategóriák helyett friss angle-ek)

**Kontextus:** A 23:45-i F.2.H 8-batch lezárása után a felhasználó jogosan szólt: "tényleg csak ezeket tudod kitalálni, ezekre soha nem keres senki:( egy kibaszott találat sincs rájuk". Az előző brainstormjaim (pain-driven / specific role / migration / close-out) recycled kategóriákat tartalmaztak, kevés új inspiriációval.

A 8-batch ezúttal **teljesen új angle-ekben** volt: iparág-vertikális mikro-niche (hair salon, food truck, dentist office) + outcome/failure (lost receipt, audit failed) + tools (no safe) + geographic UK + hybrid scenarios.

**SERP-tesztelt query-k (8):**

| # | Query | Kategória | SpendNote pozíció | Top 5 | Diagnózis |
|---|---|---|---|---|---|
| 1 | `petty cash for hair salon` | iparág-vertikál | NINCS top 5-ben | SalonIQ FAQ + SalonToday + SalonBizSoftware + RosySalonSoftware + PerfectLocks | 🚀 **ÚJ JELÖLT** — a top 5 mind salon-management software vagy salon-blog. **NINCS SaaS-óriás** (Pleo / Spendesk / Expensify), **nincs dedikált petty-cash-for-salon landing**. SpendNote-fit. |
| 2 | `petty cash for food truck` | iparág-vertikál | NINCS top 5-ben | Zapof F&B form + Mobile-Cuisine blog + Relayfi banking + PayAnywhere POS + FoodTruckEquip | 🚀 **ÚJ JELÖLT** — a top 5 generikus food-truck financial blog + 1 generikus F&B form-template. **Nincs petty-cash-specifikus food-truck landing.** SpendNote-fit. |
| 3 | `petty cash for dentist office` | iparág-vertikál | NINCS top 5-ben | MDManagementGroup + Medical Economics + Henry Schein + DentistryToday + Dentally Community | ⚠️ **Közepes jelölt** — authority dental-management fal (Henry Schein, Medical Economics, DentistryToday). Küzdelem; lehet, de óvatosabb mint a salon/food truck. |
| 4 | `lost petty cash receipt what to do` | outcome / failure | **TOP 2** | SparkReceipt + **`petty-cash-does-not-balance`** + FitSmallBusiness + InvoiceDataExtraction + AP-Now | ✅ Implicit módon már lefedve — skip |
| 5 | `petty cash audit failed` | outcome / failure | **TOP 1 + TOP 2** | **`petty-cash-audit-checklist`** + **`petty-cash-does-not-balance`** + Pluto + AccountingTools + PettyCashPlus | ✅ Két SpendNote oldal a top 5-ben — skip |
| 6 | `petty cash without safe` | tools / equipment | **TOP 1 + TOP 2 + TOP 5** | **`where-to-keep-petty-cash`** + **`petty-cash-security-tips`** + AccountingTools + Pleo Blog + **`how-to-start-petty-cash-box`** | ✅ HÁROM SpendNote oldal a top 5-ben — skip |
| 7 | `petty cash voucher uk` | geographic UK | NINCS top 5-ben | BusinessAccountingBasics ×2 (free Excel template) + Silvine voucher pad Tesco/Ryman/Office2Home | ❌ UK Excel-template + **fizikai voucher pad bolt** (Silvine 100-sheets, £5.51 a Tesco-ban). Bad SERP fit. |
| 8 | `cash and card receipt template` | hybrid scenario | NINCS top 5-ben | ReceiptWorks + Template.net + eForms + InvoiceHome + InvoiceFly | ❌ **Template-marketplace dominanció**. SpendNote nem template provider. Skip. |

**Konzekvencia — most VAN 3 új jelölt (a korábbi 0 helyett):**

| Verdikt | Darab | Query-k |
|---|---|---|
| 🚀 **ÚJ JELÖLT** (post-checkpoint kandidáns) | 2 | #1 `petty cash for hair salon`, #2 `petty cash for food truck` |
| ⚠️ Közepes jelölt | 1 | #3 `petty cash for dentist office` (authority dental-fal) |
| ✅ Már TOP 1-2 dedikált oldallal | 3 | #4 `lost petty cash receipt`, #5 `petty cash audit failed`, #6 `petty cash without safe` |
| ❌ Bad SERP fit | 2 | #7 UK voucher pad fizikai termékboltok, #8 template-marketplace |

**Új teendő MOST: 0** (a moratórium érvényben). **Új post-checkpoint backlog-bejegyzés: 2-3 jelölt** (post-2026-05-12 kandidatúra, ha a 14-napos checkpoint adatai engedélyezik).

**Stratégiai felismerés — az iparág-vertikális dimenzió termékeny:** A 8/3 érték (új jelölt arány) **dramatikusan jobb** mint az előző F.2.H batch 8/0 értéke. Ez azt jelenti, hogy a SpendNote olyan iparágakra dedikált oldalt írhat (salon, food truck, dentist), ahol a SERP-et **iparág-specifikus management software-ek + generic blog-tartalom** dominálja, NEM SaaS-óriás petty-cash-tool. Ez **alacsony-verseny, magas-intent** terület — 14-napos checkpoint után érdemi vizsgálódásra méltó.

**Conditional backlog (post-2026-05-12 — NEM most):**

| Jelölt oldal | Query | Top 5 verseny | Megjegyzés |
|---|---|---|---|
| `petty-cash-for-hair-salon.html` | `petty cash for hair salon` | salon-management blog-tartalom (SalonIQ, SalonBizSoftware, RosySalon, PerfectLocks) | Erős fit. **Honest-claim ellenőrzés szükséges**: SpendNote használható-e tényleg salon-petty-cash-re? Multi-cashbox, role-based, mobile = igen, de explicit példák nélkül. |
| `petty-cash-for-food-truck.html` | `petty cash for food truck` | food-truck financial blog-tartalom (Mobile-Cuisine, PayAnywhere, FoodTruckEquip, Relayfi) | Erős fit. SpendNote pont arra való amit a Zapof generikus F&B form is fed: F&B petty cash workflow audit-ready. |
| `petty-cash-for-dentist-office.html` | `petty cash for dentist office` | dental-management authority (Henry Schein, Medical Economics, DentistryToday) | **Közepes** — authority-fal nehezebb. Lehet, hogy hair salon + food truck után válik validálttá az iparág-vertikál stratégia, és csak akkor írunk dental-t.

**Trigger feltétel a 2026-05-12-i checkpointhoz:** Ha a 04-28-i 3 új oldal (`cash-float-vs-petty-cash`, `payroll-cash-receipt`, `petty-cash-custodian`) közül **legalább 1 első impressziót kap** a 14 napban (vagyis a Google indexbe vette és értelmes query-re felmegy a SERP-en), akkor a salon + food truck oldalakat el lehet kezdeni írni. Ha 0 impresszió a 3 új oldalra → a stratégia nem működik, csak meta-tweakeket csinálunk.

**Záró tanulság a teljes ma esti research-ra:** A user pushback-je hozta a legtermékenyebb angle-t — **az iparág-vertikális dimenzió** (low-comp, high-intent, no SaaS-giant verseny) termékenyebb mint a generic pain-driven/role/migration angle-ek. Ez a 14-napos checkpoint utáni stratégia központi irányát adhatja: **iparág-vertikál bővülés** (salon → food truck → dentist → vet clinic → barbershop → tattoo shop → nail salon → fitness studio → ...).

A 04-28 ÉJSZAKAI 2 tweak (`petty-cash-app` cloud/online + `custom-cash-receipt-with-logo` Pro Custom Labels) volt a maradék zero-kockázatú akció **most**. A **14-napos checkpoint (2026-05-12)** továbbra is a következő érdemi pont. A brainstorm-fázis ezzel valóban lezárul, **de új post-checkpoint stratégiai irány körvonalazódott**.

#### F.2.J Source-mining batch — 2026-04-29 00:05 (Reddit + konkurens-blog + FAQ-pattern bányászás)

**Kontextus:** A felhasználó újabb pushback-je: "semmi más eredeti ötlet, amire keresni szoktak az emberek? ezt sehonnan nem tudod megállapítani?". Ez új módszertant kényszerített ki: **nem saját brainstorm**, hanem konkrét adatforrásokból merítve query-keresés.

**Bányászott források (4):**

1. **Reddit pain-pointok** — `site:reddit.com petty cash problem` és `site:reddit.com petty cash help` lekérdezések. A `r/Accounting` "Petty Cash Report Help???" thread egy hatalmas pain-point gyűjtemény ($200 budget, $50 receipt-hiány, audit red flag, "petty cash is misleading — it's not petty").
2. **Pleo blog architektúra** — `pleo.io petty cash blog` lekérdezés. 5+ dedikált petty-cash-cikk: `5 tools`, `management procedures`, `what is petty cash`, `reimbursement`, `vouchers`, `8 steps reconciliation`. Mutatja a "fully covered" content-mix-et.
3. **Shopify / Stanford / Beancount FAQ-pattern** — generic "what is petty cash" oldalak FAQ-szekciójából kibányászva. PAA-stílusú query-k: `how much petty cash should i keep`, `petty cash limit per transaction`, `how long should petty cash last`, `is there a limit on petty cash`.
4. **Investopedia / NPIfund.com / QuickBooks** — "is petty cash still worth it" angle. Modern relevance debate.

**SERP-tesztelt query-k (4):**

| # | Query | Kategória | SpendNote pozíció | Top 5 | Diagnózis |
|---|---|---|---|---|---|
| 1 | `how much petty cash should i keep` | FAQ-pattern (PAA-szerű) | **TOP 1** | **`petty-cash-how-much-to-keep`** + Beancount + Shopify Australia + FinancialModelsLab + Investopedia | ✅ **Brutális pozíció** — Investopedia / Shopify / Beancount közé szorulva NYERTÜNK. Eddig **nem is látszott a GSC-exportban** — tipikus 4-8 hetes lag. |
| 2 | `petty cash limit per transaction` | FAQ-pattern | NINCS top 5-ben | UTSA + Stanford ×2 + U of Houston + Ohio OBM | ❌ **.edu / .gov policy-fal** — SpendNote nem tud authority-ban versenyezni. Bad SERP fit. |
| 3 | `petty cash report` | Reddit-validated pain | NINCS top 5-ben | Vertex42 Excel + FitSmallBusiness + Wrapbook film/TV docs + Template.net + AtYourBusiness | ❌ **Template / Excel dominancia** — nem tool-intent. Skip. |
| 4 | `is petty cash still worth it` | Concept-question | NINCS top 5-ben | Shopify + NPIfund + QuickBooks + Harvard + ManishChanda | ⚠️ **Authority-fal** (Shopify, QuickBooks, Harvard). Közepes jelölt, post-checkpoint backlogba. |

**Konzekvencia:**

- **0 új landing-jelölt** ebből a batchből (4/0)
- **1 nem-várt-felfedezés**: `petty-cash-how-much-to-keep` TOP 1 a `how much petty cash should i keep` query-re — **élő piaci pozíció, amit a GSC-export eddig nem mutatott**. Ezt felvenni a 14-napos checkpoint figyelendő-listára (várható: a 04-26-i bulk-fix és a 04-28-i meta-tweakek után az export végre megmutatja az élő pozíciót).
- **1 közepes backlog-jelölt**: `is petty cash still worth it` — concept-question, Shopify/QuickBooks/Harvard authority-fal, csak post-checkpoint és csak ha az iparág-vertikál pipeline beváltja az ígéretét.
- **Validáció**: Reddit + Pleo blog + Shopify FAQ-mining önállóan **nem hozott** új landing-jelöltet, mert SpendNote már lefedi a fő FAQ-cluster-eket. Az iparág-vertikális dimenzió (F.2.I batch) lényegesen termékenyebb angle.

**Záró tanulság a 04-29 00:05 source-mining batch-re:** A research-fázis ezzel végleg lezárható — **a brainstorm-források kimerültek** (saját + Reddit + Pleo blog + FAQ-pattern + iparág-vertikál). A 14-napos checkpoint (2026-05-12) marad a következő érdemi pont, post-checkpoint pedig az iparág-vertikál pipeline (`hair salon` → `food truck` → `dentist`) az elsődleges next-action terület.

#### F.2.K Cash advance for expenses ("elszámolásra kiadott pénz") batch — 2026-04-29 00:15 SERP-evidence (felhasználó-intent driven)

**Kontextus:** Felhasználói kérdés: "elszámolásra kiadott vagy átvett pénz körüli oldalunk van már???". Magyar adminisztratív szakszó: **elszámolási előleg** = pénz, amit valakinek odaadnak üzleti kiadásokra azzal a feltétellel, hogy később elszámolnak vele (receipts + maradék = előleg). Ez egy **dedikált scenarió**, NEM lefedve egyik meglévő oldalunk által:

- `employee-cash-advance-receipt` = salary advance (bérelőleg, bérből levonva)
- `contractor-advance-payment-receipt` = work advance (munkadíj-előleg, munkával ledolgozva)
- `office-expense-reimbursement-form` = utólagos reimburse (saját zsebből költött, és visszakapja)
- `petty-cash-replenishment-form` = custodian feltöltés
- `cash-handoff-receipt` = generic pénzátadás

**SERP-tesztelt query-k (4):**

| # | Query | SpendNote pozíció | Top 5 | Diagnózis |
|---|---|---|---|---|
| 1 | `cash advance for business expenses receipt` | **TOP 1** | **`employee-cash-advance-receipt`** + BizzLibrary template + Brex (IRS receipt requirements) + PayWavez (merchant cash advance funding — irreleváns) + ExpenseOnDemand | ⚠️ **TOP 1 — DE content-mismatch!** Az oldal salary advance-ról szól, nem expense advance-ról. Felhasználó találja, de **mást** kap, mint amit vár. Bouncerate-rontó. |
| 2 | `travel cash advance receipt` | NINCS top 5-ben | BizzLibrary + AllBusinessTemplates + UC Berkeley + UTexas | ❌ Template provider + .edu policy fal. Bad SERP fit. |
| 3 | `imprest advance receipt` | NINCS top 5-ben | GetMoss + Investopedia + PaymentCloud + NIANP (Indian gov) + AccountingTools | ❌ Authority-fal (Investopedia, AccountingTools). Bad SERP fit. |
| 4 | `cash advance settlement form template` | NINCS top 5-ben | Easy-agreement loan template + Paperform legal settlement + SignNow + Template.net debt settlement + PandaDoc | ❌ **Rossz intent** — a query "cash advance" itt **lawsuit settlement / debt settlement / payday loan agreement** értelemben jön elő. SpendNote intent-mismatch. |

**Két fontos felismerés:**

**1. TOP 1 content-mismatch**: A `employee-cash-advance-receipt` oldalunk TOP 1-en NYER egy olyan query-re (`cash advance for business expenses`), aminek **content-szempontból nem felel meg**. A felhasználó keresi az "elszámolásra kiadott pénz" intent-et, megtalál TOP 1-en, és nem kapja meg, amit keres (salary advance-ról szól, nem expense advance-ról). Ez bouncerate-rontó.

**2. SERP-szegény angle**: Az `expense advance` / `travel advance` / `imprest` queryk mindegyike **bad SERP fit**: template-provider dominancia, .edu/.gov policy-fal, authority (Investopedia, AccountingTools), vagy teljesen más intent (lawsuit settlement). Az "elszámolásra kiadott pénz" magyar intent **nem fordul jól** angol piaci query-térbe.

**Két lehetséges akció (mindkettő post-checkpoint, NEM most):**

| Variáns | Mit tesz | Kockázat | Mikor |
|---|---|---|---|
| **B — Content-bővítés** ✅ **VÉGREHAJTVA 2026-04-29 00:30** | `employee-cash-advance-receipt`-re egy új H2 szekció "Also Covers: Business Expense & Travel Advances" + 3 use-case-box (business expense / travel / petty cash advance) + 2 új FAQ (body + JSON-LD) + meta description bővítés ("salary, business expense, and travel advances") + JSON-LD Article description update + dateModified bump | **Alacsony** (meglévő oldal, content-only, salary-advance fő-pozíció megmaradt — title/H1/hero érintetlen) | **MOST** — a felhasználó pushback-je: "ha a mostani nem jó, akkor mi a faszra várunk?" Helyes érv: ez bouncerate-fix, nem post-checkpoint kísérlet. Az oldal 2026-03-06 óta él, NEM része a 14-napos moratórium-hatókörnek. |
| **C — Új dedikált oldal** | `cash-advance-for-expenses.html` (vagy `expense-advance-receipt.html`) — SpendNote pont erre is jó (előleg-rögzítés + receipt-attaching + záró elszámolás) | **Magasabb** (új URL, új sleep-on-it) | Post-checkpoint, csak ha B variáns érdemi javulást hoz CTR/bounce metrikákban, vagy ha az iparág-vertikál pipeline beváltja |

**Trigger feltétel a 2026-05-12-i checkpointhoz:**

- Ha az `employee-cash-advance-receipt` oldalon a `cash advance for business expenses` query-re jelentős impressziókat kapunk a 14 napban (élesen mérhető bounce vagy alacsony CTR) → **B variáns** azonnali (alacsony-kockázatú content-tweak, ne fail-en nyerjünk)
- Ha az iparág-vertikál pipeline (salon/food truck/dentist) beváltja az ígéretét → **C variáns** is mehet utána

**Conditional backlog (post-2026-05-12 — NEM most):**

| Akció | Miért |
|---|---|
| `employee-cash-advance-receipt` content-bővítés (B variáns) | TOP 1 mismatch fix — ne félrevezetően nyerjünk |
| `cash-advance-for-expenses.html` új oldal (C variáns) | Csak ha B variáns vagy iparág-vertikál pipeline validálta a content-strategiát |

**Záró tanulság a F.2.K batch-re:** A felhasználói intent-driven research **valódi gap-ot tárt fel** (TOP 1 content-mismatch + dedikált scenarió hiánya), DE a SERP-tér 3/4 query-n nehéz (template + .edu + authority + intent-miss). Az alacsony-kockázatú akció (B variáns content-bővítés) — eredetileg a 14-napos checkpoint utáni első tételek között lett volna — **a felhasználó pushback-je miatt MA ESTE végrehajtásra került** (lásd fenti táblázat B variáns "VÉGREHAJTVA" blokkját). Helyes döntés: ez bouncerate-fix, nem post-checkpoint kísérlet, és az érintett oldal NEM része a 14-napos moratórium-hatókörnek.

#### F.2.B Tier 2 — Pages already winning (NE PISZKÁLJUK)

- **`cash-drawer-reconciliation`** — `cash drawer reconciliation` cluster 50+ imp/28d, top 10-25 többségében. **Hagyjuk békén**, már működik.
- **`petty-cash-how-much-to-keep`** — pos 14.14, 86 imp/28d, már 1 click is jött (CTR 1.16%). A 04-25-i TL;DR + $100 breakdown most kezd hatni. **NE PISZKÁLJUK 2026-05-12-ig.**
- **`two-person-cash-count-policy`** — pos 4.93, 15 imp. Top 5-ben. **NE PISZKÁLJUK.**
- **`digital-receipt-book`** — pos 5.6, 5 imp. Top 5-ben. **NE PISZKÁLJUK.**
- **`petty-cash-audit-checklist`** — pos 7.8, 5 imp. Top 10-ben. (Tier 1 #6 csak akkor, ha 2026-05-12-ig sem jönnek be a többi audit-query-re imp-ek.)

#### F.2.C Tier 3 — Single-imp queries (figyelni, de nem akció)

- `legal proof of cash payment` — 1/**5** — a `cash-payment-received-proof` oldal fedheti. Top 5! Egyszer 1 imp, lehet, hogy nincs is volumen.
- `petty cash custodian job description` — 1/71 — az új `petty-cash-custodian` oldal pontosan ezt fedi, mostantól figyelünk.
- `cash float for market stall` — 2/29 — a mai `event-cash-handling` "Cash Float for Markets" pivot direkt erre megy.
- `petty cash management for construction` — 1/18 — a mai `construction-site-petty-cash` "Tradies" pivot ezt erősíti.

#### F.2.D Wrong intent — SOHA NE optimalizáljuk

| Query | Valódi intent | Miért nem mi |
|---|---|---|
| `get cash back on receipts` (1/78), `receipt app to get money back` (1/73), `get money back from receipts` (1/79), `use receipts to get money back` (1/83), `receipt tracker for small business` (1/99) | Cashback-receipt-scanning (Ibotta, Fetch Rewards) | SpendNote NEM cashback app, az asszociáció félrevezeti az érkező usert |
| `get paid for school notes` (1/73) | Studocu / Coursehero | SpendNote ≠ jegyzet-marketplace |
| `the receipt of cash in advance from a customer` (1/67), `journal entry for petty cash fund replenishment` (2/90), `a petty cash fund is always replenished` (1/69), `having a system in place for handling petty cash ensures` (1/90) | Accounting bookkeeping homework / textbook intent | Kollégista accounting kurzus query-k, nem üzleti tool-intent |
| `petty cash debit card` (1/83) | Ramp / Brex / corporate card | SpendNote NEM card issuer |
| `does the knot cash fund take a percentage` (1/96) | Wedding registry (TheKnot Cash Fund) | Wedding gift platform, totally unrelated |
| `https://example.com/generated_receipt.pdf` (10 imp) | Bizarr URL-tracking | SEO-spam vagy bot, irrelevant |

#### F.2.E Új saját brainstorm-jelöltek (még nem SERP-tesztelve, csak ötlet-szinten)

- `audit petty cash transactions` — niche audit-intent
- `simple petty cash software` — alacsony-comp opció
- `cash float for retail till` — UK till-fókuszú
- `cash count for end of day` — niche
- `petty cash vs imprest fund` — comparison page (a `cash-float-vs-petty-cash` mintára), DE az `imprest` query-k Wikipedia/Investopedia falat ütnek (lásd C pont)
- `bookkeeping with cash transactions` — info-intent, AI Overview-zóna, valószínűleg skip
- `proof of cash payment letter` — query: 1/20 a 04-09-i exportban, érdemes SERP-tesztelni
- `daily cash position report` — query: 20/84 (létező, gyenge pos), nincs dedikált oldal

**Action**: 2026-05-12-i checkpointkor SERP-teszt a megmaradó jelöltekre. Nem most.

---

# 🛡️ STRATEGIC GUARDRAILS — 2026-04-25 ESTE (ChatGPT-review után — REFERENCIA)

> Ez a blokk a 2026-04-25-i sprint **utáni** stratégiai irányt rögzítette — külső review (ChatGPT) megerősítette az irányt, néhány hangsúlyt finomított. **2026-04-28-tól a fenti guardrails-blokk az aktív iránymutatás**, ezt csak referenciaként hagyjuk meg.

## A. 7-napos szabály (2026-04-25 → 2026-05-02): NE PISZKÁLJUK

8 commit + új landing + trust-fix + internal link átépítés + két nagy keyword refactor + schema frissítés + noindex guard + sitemap/reindex egyetlen napon — ez bőven elég jel a Google-nak. **Ezen 7 napon belül NEM csinálunk újabb átírást.**

Megengedett aktivitás:
- Request Indexing (egyenként, GSC URL Inspection-ön).
- Sitemap resubmit (Google + Bing).
- GSC export napi/heti mentése.
- SERP screenshot fontos query-kre.
- **Nincs új rewrite, nincs új landing, nincs új H2.**

## B. 14-napos checkpoint (2026-05-09): mérünk és döntünk

Ekkor (és csak ekkor) értékeljük:
1. `petty-cash-app` — kapott-e impressiont és melyik query-kre?
2. `petty-cash-how-much-to-keep` — bemegy-e top 10-be a TL;DR + `$100 breakdown` után?
3. `who-has-the-cash-right-now` — a keyword-anchored noun-phrase H1/H2-k után kap-e releváns query-t?
4. `boss-cant-see-where-cash-goes` — a teljes refaktor után kap-e impressiont?
5. `two-person-cash-count-policy` — hoz-e adjacent template/form intent query-ket a "Free Sign-Off Template" pivot után?
6. **Trust-fix oldalak** — csökkent-e vagy javult-e a CTR a hamis "Free X" claim-ek eltávolítása után?

## C. FAQ/HowTo schema reality-check (review-correction)

**Korábbi feltevés:** FAQ schema = AI Overview citation chance + rich result.
**Korrigált realitás:**
- **Google FAQ rich result** ma már gyakorlatilag csak **autoritatív kormányzati / egészségügyi** oldalakon jelenik meg rendszeresen. Egy fiatal SaaS site nem fog rich-snippetet kapni FAQ-tól.
- **Google HowTo rich result desktopon deprecated** (Google saját közlése).
- **AI Overview-höz nincs külön schema-követelmény** — Google szerint ugyanazok az alap-SEO-elvek számítanak (indexelhetőség, snippetre jogosultság, szövegben elérhető fontos tartalom, structured data ↔ visible content egyezés).

**Konzekvencia:**
- A meglévő FAQPage schema-kat **nem szedjük ki** — segítenek a tartalom strukturálásában és a Google parsing-jában.
- **NEM építünk rájuk stratégiát** — a stratégia maga a query-választás (tool/template/comparison intent), nem a schema-trükk.
- Új oldalon FAQ schema csak akkor, ha a content tényleg Q&A-jellegű és a látható szöveggel 100%-ig egyezik.

## D. Honest CTR-magnet vocabulary (a Free X trust-fix után)

A trust-fix nem azt jelenti, hogy CTR-magnet nélkül maradunk — azt jelenti, hogy **csak igaz csábítás** marad. Engedélyezett vocab:

| Magnet | Akkor használható, ha tényleg... |
|---|---|
| **"Printable PDF"** | van letölthető PDF az oldalon (pl. `two-person-cash-count-policy`) |
| **"Copyable Policy Rules"** | van inline szöveg, ami másolható (pl. policy bekezdések) |
| **"Step-by-Step"** | van numbered list, lépésekkel (pl. `how-to-fill-out-petty-cash-voucher`) |
| **"Formula + Examples"** | van képlet és számolt példa (pl. `petty-cash-how-much-to-keep` $100 breakdown) |
| **"Sign & Print"** | van nyomtatható/menthető form a content-ben |
| **"Free Tier"** | van valóban használható ingyenes tier az appban (pl. `petty-cash-app`) |

**Tilos:** "Free Template" / "Free Sample" / "Free Checklist" — bármilyen "Free X" assets-ígéret, ami nincs valóban letölthető fájlként az oldalon.

## E. `petty-cash-app` további erősítések (ma alkalmazva)

A 2026-04-25-i `petty-cash-app.html` páron belül 3 új blokk került fel a ChatGPT-review után:

1. **Pozicionálás-fix a hero-ban** — *"Not another expense platform. SpendNote is built specifically for real cash boxes — not a Ramp, Brex, or Spendesk competitor."* Cél: differentiation a generic expense-management appoktól.
2. **"What You Can Do in 30 Seconds" blokk** — közvetlenül a hero alatt, action-listával: record, snap, see, watch, generate, export. Cél: tool-intent query-kre érkező user 5 másodperc alatt látja, hogy ez tényleg app, nem SEO-cikk.
3. **Strukturált comparison table** — Paper / Excel / Generic expense app / POS / Accounting software vs SpendNote, 3 oszlopban (eszköz / probléma / SpendNote-megoldás). A korábbi `<ul>` + 2 paragrafus helyett.

## F. Conditional PENDING task (NE csináljuk most): Cash Count Sign-Off Form külön landing

**NEM most.** 14 nap monitoring után döntünk.

**Trigger feltételek (mindhárom kell):**
1. GSC: `cash count sign-off form` v. `two-person cash count form` query-re kap impressiont a `two-person-cash-count-policy` oldal.
2. Az oldal nem tud belépni top 20-ba erre a query-re (vagyis a teljes oldal nem winner ehhez az intenthez).
3. A SERP egyértelműen PDF/form/template-intent (nem policy-intent).

**Ha mind3 igaz 2026-05-09-ig:** új oldalt csinálunk `/cash-count-sign-off-form` slug-on, *asset page* jelleggel (nem SEO-cikk):
- PDF letöltés gomb (a meglévő `two-person-cash-count-policy` PDF-jéből kivett rövid form-only verzió).
- Rendered preview kép.
- "When to use it" rövid bekezdés.
- "How to fill it out" 5-lépéses lista.
- Link az `/petty-cash-app`-ra ("Or skip the paper form and use our app").

**Ha NEM teljesül a trigger:** marad a jelenlegi `two-person-cash-count-policy` mint single page, és nem fragmentáljuk fel.

## G. Bing-irány (review-megerősítés)

- **Google = fő csatorna**, **Bing = query-lab + másodlagos validációs terep**.
- Bingnek: sitemap resubmit, index coverage figyelés, Bing query-k alapján Google-oldalötletek.
- **Nem csinálunk Bing-only optimalizációt** — a 04-25-i sprint Bing-data inspirálta új landing-jén (`petty-cash-app`) kívül nem írunk Bing-specifikus content-et.

---

# 📜 MUNKANAPLÓ — 2026-04-25 (snippet/keyword sprint, Bing-data alapján)

> **Státusz:** A 04-18-i tervet (lent) elhalasztottuk. Helyette egy **akciós napot** csináltunk a 2026-04-25 GSC + a felhasználó által megosztott Bing query-data alapján. Cél: **mai snippet/title/keyword fix-ek**, plusz egy új landing page Bing tool-intent klaszterre.
>
> **Adatforrás (frissítve):** GSC export 2026-04-25 + Bing query-lista (felhasználói paste). A 04-18-i terv lentebb változatlanul.

## 1. Megcsinált munka (commit-okkal)

| Commit | Mit | Miért |
|---|---|---|
| `9f79873` | Title/meta tightening 3 oldalon: `petty-cash-replenishment-form`, `petty-cash-policy-template`, `petty-cash-reconciliation` | Mobil SERP cut-off + Bing tool-intent query-illesztés |
| `68a3db2` | Title fix még 4 oldalon: `cash-drawer-reconciliation`, `digital-receipt-book`, `cash-handoff-receipt`, `two-person-cash-count-policy` | Handoff→handover US English, mobil SERP optimalizáció |
| `d6984cb` | **Új oldal**: `petty-cash-app.html` (priority 0.9 sitemap) + bejövő linkek `spendnote-resources` és `petty-cash-app-vs-excel` oldalakról | Bing query-k: "app for petty cash", "petty cash management app", "digital petty cash apps" — dedikált product landing page |
| `8a1efe2` | **Trust-fix**: hamis "Free Template/Sample/Checklist" claim-ek eltávolítása 4 oldalon | A SERP-ben látszó cím azt ígérte, hogy van letölthető template — de nem volt. Misleading → trust-loss → low CTR |
| `193a0ca` | 10 belső link a `petty-cash-app.html`-re a clustertagokról + 2 link visszavonás `noindex` source page-ekről + 1 broken `noindex` target fix `petty-cash-app`-on belül | Felhasználó észrevette: olyan oldalakra/oldalakról linkelek amik `noindex`-ek → 0 link equity flow |
| `1f7a213` | `boss-cant-see-where-cash-goes` teljes keyword-refaktor (title, H1, H2-k, FAQ, schema) | Az oldal nulla impressiont kapott GSC-ben pedig releváns; a rhetorical-style H1/title nem matchelt a search query-kkel |
| `THIS COMMIT` | `petty-cash-how-much-to-keep` snippet enhance (TL;DR direkt válasz + új `$100 float breakdown` table sekció) + `who-has-the-cash-right-now` H1/H2 keyword refactor (boss-page minta szerint) + `seo-noindex-guard.mdc` Cursor rule + munkanapló | Featured-snippet farming a "how much petty cash" query-re; "who has the cash" oldal rhetorical→keyword shift; megelőzni a jövőbeli noindex-linking hibákat |

## 2. Decision: 04-18-i ÚJ-OLDAL terv halasztva

A 04-18-i terv első három új oldala (`cash-float-vs-petty-cash`, `payroll-cash-receipt`, `petty-cash-for-restaurants`) továbbra is releváns, de **2-3 hetet még várunk** a mostani index-csiga lefutására. A mai 6 commit (és a holnapi reindex-jel) után döntjük el, melyiket tesszük be először.

## 3. Mit kell figyelni 1-2 héten belül

- **`petty-cash-how-much-to-keep`**: pos 14 → várt mozgás top-10-be a TL;DR + `$100 breakdown` sekció miatt. Lekérdezéseket: `how much petty cash to keep`, `petty cash float`, `$100 float breakdown`.
- **`who-has-the-cash-right-now`**: jelenleg nem rangsorolt a fő query-kre. Várt mozgás: `track who has petty cash`, `who is holding company cash`, `real-time cash tracking` query-kre top-30 → top-15.
- **`boss-cant-see-where-cash-goes`**: várt impressionek: `track business cash`, `cash visibility` query-kre. Eddig nulla impressionnel ment.
- **`petty-cash-app`**: új oldal, várt első impressionek 1-2 héten belül a Bing tool-intent query-kre.
- **Trust-fix oldalak (`8a1efe2`)**: korábbi mismatch-CTR (0%) → várt felugrás, mivel most a SERP cím nem ígér meg semmit, ami nincs az oldalon.

## 4. Új szabály életbe lépve

`.cursor/rules/seo-noindex-guard.mdc` — minden új internal link előtt mindkét oldalon (source + target) ellenőrizzük a `<meta name="robots">` tagot. Linkelni csak `index, follow` ↔ `index, follow` között szabad. A 04-25-i `noindex` audit lista a rule-ban benne van.

## 5. AI Overview tanulság (a 04-25-i SERP-check után)

A `two-person-cash-count-policy` 0% CTR-jének SERP-check-je (Google US, uncached) kimutatta, hogy az **AI Overview** sok info-jellegű petty-cash query-n a SERP tetején, az organic eredmények ELŐTT, generál összefoglalót. A user a választ click nélkül kapja meg — innen a 0% CTR. **Ez nem leküzdhető**, csak körbejárható.

### Mit jelent ez a stratégiánkra:

- **Új oldalakat ezentúl előnyben részesítjük tool/template/form/comparison/longtail intent-tel**, ahol az AI Overview ritka:
  - Tool/app intent: `app for X`, `best X app`, `X tracking app` (a `petty-cash-app` ide tartozik)
  - Template/form intent: `X template`, `X form download`, `X printable PDF` (a `two-person-cash-count-policy` Free Template angle ide tartozik)
  - Comparison: `X vs Y`, `compare X` (a `petty-cash-app-vs-excel` ide tartozik)
  - Longtail (5+ szavas, specifikus): `petty cash policy template for small nonprofit`, `cash float for event staff`
- **Új info-oldalakat (`what is X`, `how does X work`) nem írunk többet** — ott Investopedia + .gov + AI Overview verhetetlen.
- **AI Overview citation-be kerülés** mint mellékstratégia: TL;DR direct-answer paragrafus minden info-page tetejére, FAQ schema, konkrét számok és példák. Ma elindítva `petty-cash-how-much-to-keep`-en (`Most small businesses keep $100-$500...`), szisztematikusan kiterjesztendő.

### Konzekvencia a 04-18-i ÚJ-OLDAL tervre (lent):

A 04-18-i terv jelölt új oldalai közül **prioritás-sorrend kell**, AI-Overview-szempontból:

| Eredeti rang | Slug | AI Overview-rizikó | Új rang |
|---|---|---|---|
| 🥇 | `cash-float-vs-petty-cash` | **Magas** (info/comparison) | Megmarad — comparison angle erős, AI Overview itt ritka |
| 🥈 | `payroll-cash-receipt` | Közepes (info+template) | Megmarad — receipt = template-jellegű |
| 🥉 | `petty-cash-for-restaurants` | Közepes (industry-specific) | Megmarad — niche, kevés AI Overview |
| Új | `petty-cash-app-comparison` v. `best-petty-cash-app-2026` | **Alacsony** (commercial intent) | **Új #2-be** beemelni a 14-napos checkpoint után |

**Konkrét rangsorolást a 2026-05-02-i 7-napos checkpoint adatai után véglegesítjük.**

## 6. Új teszt-ablak (baseline-reset)

A 8 commit + új oldal mennyisége miatt **régi GSC adatok már nem összehasonlítási alap**. Új teszt indul most.

| Időpont | Mit nézünk | Mire jó |
|---|---|---|
| **Baseline (most)** | GSC export `spendnote.app-Performance-on-Search-2026-04-25/` | "Before" snapshot |
| **2026-05-02 (7 nap)** | GSC 7-napos view + friss export | Korai jelek: új oldal indexbe került? Reindex shake lecsengett? |
| **2026-05-09 (14 nap)** | GSC 7-napos + 28-napos + friss export | Érdemi értékelés: pos/CTR változás, új query-k a `petty-cash-app`-ra |

**Reindex-lépések 2026-04-25 estére:**
1. GSC URL Inspection → Request Indexing **18 URL-re** (Tier 1-5, fenti listában).
2. `Sitemaps → Resubmit`: `https://spendnote.app/sitemap.xml`.
3. Bing Webmaster Tools-ban szintén submit-elni a sitemap-et (AI Overview kerülő-stratégia része).
4. **Nem nézni** a GSC "24 óra" view-t hétfő estéig (real-time pipeline 6-12 órás csúszással megy, hétvégén 8-12 órás).

---

# 🎯 AKTUÁLIS TERV — Keyword Research alapján (2026-04-18)

> **Státusz:** Várakozó fázis. A 2026-04-17/18-i nagy belső link tisztítás + pricing átállás + FAQ kitisztítás után kb. **2-3 hét reindex-időszak**. Eddig semmi tartalmi piszkálás. Ezt a tervet **3 hét múlva** vesszük elő publikálásra.
>
> **Adatforrás:** Search Console export 2026-04-09 (28 napos) + 2026-04-18 (7 napos), `/spendnote.app-Performance-on-Search-*` mappák.

---

## Top 5 felfedezés a kulcsszó-adatokból

1. **`cash float` cluster** — több, mint **45 megjelenés/28 nap** szétszórva 10+ query-n, **dedikált oldal nélkül**. Ez a legtisztább tartalmi hiány.
2. **`payroll receipt`** — **48 megjelenés** (35+13) két query-n, **nincs hozzá oldal**, pos 38-39. Könnyű győzelem.
3. **Industry vertikálisok** — `school-money-collection-tracker` (pos 8.73, **4.55% CTR**) bizonyítja, hogy működik. Új industry-pages-ek igazolt keresleti adattal.
4. **Reckon competitor query** — **34 megjelenés** Reckon-related petty cash query-ken. Alternatíva-oldal magas commercial intent-tel.
5. **Specifikus receipt típus minta** — `private tutor receipt` pos 1.5, `babysitter receipt` pos 6.5, `cash advance receipt` pos 6.46. Ez a formátum **gyorsan ranking-el alacsony versenyben** — több ilyen oldal érdemes.

---

## 1. ÚJ OLDALAK (publikálási sorrendben, 3 hét múlva kezdve)

### 1. fázis (1-2 héten belül a reindex-szünet után)

#### 🥇 `cash-float-vs-petty-cash.html` — TOP PRIORITÁS
**Bizonyíték:** 45+ megjelenés/28 nap, dedikált oldal nélkül.

| Query | Megjelenés (28d) | Pozíció |
|---|---|---|
| petty cash float | 13 | 48.31 |
| cash float formula | 5 | 17.2 |
| petty cash float in accounting | 9 | 73.89 |
| petty cash float meaning | 2 | 26.5 |
| cash float and petty cash | 8 | 67.5 |
| cash float for market stall | 2 | 29 |
| petty cash and cash float | 3 | 57 |
| petty cash vs cash float | 1 | 11 |
| cash float vs petty cash | 1 | 25 |
| what is a petty cash float | 1 | 39 |

**H1 javaslat:** "Cash Float vs Petty Cash — What's the Difference (And Why It Matters)"
**Fókusz kulcsszavak:** cash float, petty cash float, cash float formula, cash float vs petty cash
**Belső linkek bejövő:** `petty-cash-how-much-to-keep`, `how-to-start-petty-cash-box`, `digital-petty-cash-book`

#### 🥈 `payroll-cash-receipt.html` — KÖNNYŰ GYŐZELEM
**Bizonyíték:** 48 megjelenés/28 nap, pos 38-39, nincs oldal.

| Query | Megjelenés | Pozíció |
|---|---|---|
| payroll receipts | 35 | 38.86 |
| payroll receipt | 13 | 39.62 |

**H1 javaslat:** "Payroll Cash Receipt — Proof of Cash Wage Payment"
**Fókusz kulcsszavak:** payroll receipt, payroll receipts, cash payroll, payday cash receipt
**Belső linkek bejövő:** `cash-handoff-receipt`, `employee-cash-advance-receipt`

#### 🥉 `petty-cash-for-restaurants.html` — INDUSTRY VERTIKÁLIS #1
**Bizonyíték:** `school-money-collection-tracker` pos 8.73, **4.55% CTR** (működő minta).
**H1 javaslat:** "Petty Cash for Restaurants — Track Cash Tips, Float, and Daily Drops"

### 2. fázis

4. **`petty-cash-for-construction.html`** vagy meglévő `construction-site-petty-cash.html` átdolgozása
   - Bizonyíték: `petty cash management for construction` 1 imp pos 18 (van keresés)
5. **3-4 új specifikus receipt oldal** (a `private tutor receipt` pos 1.5 minta alapján):
   - `nanny-cash-payment-receipt.html`
   - `cleaning-service-cash-payment-receipt.html`
   - `dog-walker-cash-payment-receipt.html`
   - `personal-trainer-cash-payment-receipt.html`
   - `music-lesson-cash-payment-receipt.html`
   - `landscaper-cash-payment-receipt.html`
6. **`reckon-vs-spendnote-petty-cash.html`** — competitor angle
   - Bizonyíték: 34 imp/28d Reckon-related query-ken

### 3. fázis (csendes optimalizáció, no new pages)

7. **FAQ schema bővítés** a meglévő oldalakon az alábbi info-query-kre (lásd 4. szakasz)
8. **Anchor text optimalizáció** a meglévő belső linkekben (lásd 5. szakasz)

---

## 2. QUICK WINS — meglévő oldalak, push top 10-be

Csak belső linkelés vagy kis tartalmi bővítés (nincs új oldal):

| Oldal | Pozíció (28d) | Imp | Stratégia |
|---|---|---|---|
| `manage-petty-cash-remotely` | **4.83** | 6 | Top 5 — több inbound link |
| `school-money-collection-tracker` | **8.73** | 22 | Top 10 — tartani |
| `boss-cant-see-where-cash-goes` | **2** | 1 | Top 2 — több query-ben felfutni |
| `cash-handoff-receipt` | **16.36** | 59 | Top 10-be tolni |
| `where-to-keep-petty-cash` | **15.78** | 74 | Top 10 közeli |
| `petty-cash-policy-template` | **17** | 1 | Több visibility kell |
| `digital-petty-cash-book` | **18.61** | 23 | Pillar, már piszkáltuk, érik |
| `cash-discrepancy-between-shifts` | **20.57** | 28 | Push |
| `employee-cash-advance-receipt` | **21.12** | 158 | **158 imp**, top 10 → forgalom-aranybánya |
| `digital-receipt-book` | **21.38** | 29 | Push |

---

## 3. ERŐSEN MŰKÖDIK — VÉDENI (ne nyúlj hozzá)

| Oldal | Pos | Imp | Klikk | CTR |
|---|---|---|---|---|
| Homepage | 5.88 | 66 | 9 | **13.64%** |
| `manage-petty-cash-remotely` | 4.83 | 6 | 1 | 16.67% |
| `school-money-collection-tracker` | 8.73 | 22 | 1 | 4.55% |
| `cash-handoff-receipt` | 16.36 | 59 | 2 | 3.39% |
| `petty-cash-receipt-generator` | 25.47 | 86 | 1 | 1.16% |

**Specifikus receipt típusok**, amik már nagyon jól mennek (a "minta" amit replikálni érdemes):

| Query | Pos | Imp |
|---|---|---|
| `cash refund receipt template` | **1** | 5 |
| `private tutor receipt` | **1.5** | 4 |
| `cash advance receipt` | **6.46** | 13 |
| `babysitter receipt` | **6.5** | 10 |
| `cash advance slip format` | 6.4 | 5 |
| `cash advance receipt format` | 8.5 | 6 |
| `tutoring receipt` | 10.75 | 4 |

---

## 4. FAQ SCHEMA BŐVÍTÉS (3. fázis, no new pages)

Long-tail info-query-k, amiket meglévő oldalakon FAQ szekciókkal és FAQ schema-val be lehet fogni:

| Query | Pos | Hova tegyük |
|---|---|---|
| how to track cash payments | 18.62 | `how-to-track-cash-payments` ✓ |
| how to track petty cash | 72.93 | `digital-petty-cash-book` |
| how to balance petty cash | 84.81 | `petty-cash-reconciliation` |
| how can i keep my cash box organized | 36 | `petty-cash-security-tips` |
| how to handle petty cash in a company | 68 | hub vagy új oldal |
| how do you keep track of transactions | 71.5 | `digital-petty-cash-book` |
| how much petty cash should be on hand | 67 | `petty-cash-how-much-to-keep` ✓ |
| how to fill out cash receipt | 92.33 | `cash-payment-received-proof` |
| how to use a receipt book | 52 | `digital-receipt-book` |
| petty cash custodian job description | 71 | új vagy `how-to-start-petty-cash-box` |

---

## 5. ANCHOR TEXT OPTIMALIZÁLÁS (3. fázis, zero risk)

Belső linkek anchor text-jei amik kulcsszót erősítenének:

- Linkek `digital-petty-cash-book`-ra → **"digital petty cash log"**, **"online petty cash tracker"**, **"petty cash management system"**
- Linkek `cash-handoff-receipt`-re → **"cash handoff documentation"**, **"who took the cash receipt"**
- Linkek `petty-cash-receipt-generator`-ra → **"petty cash receipt generator"**, **"instant cash receipt maker"**
- Linkek `cash-drawer-reconciliation`-re → **"reconcile cash drawer"**, **"end of shift cash count"**

---

## 6. STRATÉGIAI KONTEXT — noindex áldozat

A 2026-04-09 előtti noindex 6 oldal **2 163 megjelenést** vitt el (28 nap):

| Oldal (noindex) | Imp (28d) |
|---|---|
| `cash-receipt-template` | 787 |
| `what-is-petty-cash` | 472 |
| `petty-cash-voucher-template` | 429 |
| `petty-cash-voucher-sample` | 187 |
| `how-to-manage-petty-cash-small-business` | 151 |
| `petty-cash-log-template` | 137 |

Ez stratégiailag tudatos áldozat (low intent template/info traffic), de **5-6 hét alatt teljesen kicseng**. Az új cluster építésnek ezt **kompenzálnia kell** — ezért fontos a fenti 1-2-3 fázis.

---

## 7. BING TANULSÁGOK (2026-04-18)

> **Kontextus:** Bing csak ~22 oldalt indexelt a ~50-ből, az összes URL be van adva, **mégis "szarik rá"**. Ennek ellenére már most jobb signal-eket ad mint Google.

### Bing-en MŰKÖDŐ kulcsszavak (22 indexelt oldalból!)

**Tool/app intent — Bing sokkal erősebb mint Google:**

| Query | Pos |
|---|---|
| `sample petty cash voucher app` | **1** |
| `petty cash receipt archiver` | **1** |
| `petty cash management app` | **2** |
| `i need a simple app for keeping track of petty cash` | **3** |
| `app to record petty cash slips` | 6 |
| `an ai generator for petty cash` | 6 |
| `petty cash receipts smart capture` | 6 |
| `app for petty cash` | 8 |

**Replenishment cluster (már konvertál!):**

| Query | Pos | Kattintás |
|---|---|---|
| `petty cash replenish request form` | **7** | **1 click, 100% CTR** ⭐ |
| `replenishment form` | 8.67 | 0 (6 imp) |
| `petty cash replenish requests` | 8 | 0 |

**Policy cluster (top 10):**

| Query | Pos |
|---|---|
| `petty cash policy template` | **5** |
| `free sample petty cash policy` | **6** |
| `i need a simple petty cash policy for my nonprofit` | **6** |

**Cash box startup:**

| Query | Pos |
|---|---|
| `suggested cashbox startup` | **1** |
| `starting amount for cash box` | 6 |

### Bing tanulságok stratégiai szinten

1. **Az első dokumentált fizető-szignál Bing-ről jött** — `petty cash replenish request form` query-ről 1 kattintás. Bing kicsi, **de konvertál**.
2. **Tool/app intent jobban megy Bing-en mint Google-ön** — ezek pont azok a query-k, amikre Google-ön küzdünk. Stratégiai következmény: **érdemes hangsúlyosan tool/app intent oldalakat építeni** (akkor is, ha Google rajtuk lassabb).
3. **Bing nonprofit modifier-t honorál** — `i need a simple petty cash policy for my nonprofit` pos 6. Ez támogatja a `petty-cash-for-nonprofits.html` ötletet.
4. **Az ESL/non-native phrasing query-ket Bing-en érdemes nézni** — pl. `is stall tracking machine alaso print receipt`, `drible petty cash dashboard`. Ezek nemzetközi user-eket jeleznek.

### Miért nem indexel a Bing több oldalt?

A 22-es indexáltság **nem konfigurációs hiba** — ez Bing alapvető viselkedése új site-okkal:

- **Cloudflare bot challenge gyakran kiszúrja Bingbot-ot.** A Cloudflare alapértelmezett bot fight mode-ja Bingbot-ot is challenge-eli, és Bingbot ettől visszalép. Ellenőrizni: Cloudflare → Security → Bots → Verified Bots allow.
- **Bing erősebben támaszkodik backlink-ekre és domain age-re** mint Google. Új domain + nulla backlink = Bing konzervatívan indexel.
- **Bingbot globális kapacitása kisebb.** Új site reálisan **6-12 hét** alatt jut el 30-50 oldal indexáltságig, ha minden rendben.

### Bing stratégia jelenleg

**NE piszkáld** — minden URL be van adva, sitemap submit megvan, IndexNow se segítene. Bing **passzív** ebben a fázisban.

**Egy dolog amit megérné:** Cloudflare bot challenge ellenőrzés (5 perc). Ha Bingbot blokkolva van WAF-on, az drámaian gyorsítana. Egyébként **6-8 hét alatt magától 35-45 oldalig kúszhat fel**.

A Bing-traffic most **bonus**, nem fő play. A Google a fő játszma.

---

## 8. CLOUDFLARE BOT CHALLENGE — TODO

> Egyszer érdemes megnézni, mert ha Bingbot blokkolva van, az durván fékezi az indexelést. **5 perces feladat.**

1. Cloudflare dashboard → Security → Bots
2. Verified Bots allow legyen aktív
3. Cloudflare → Security → WAF → Events log → szűrő `User Agent: Bingbot`
4. Ha vannak block események → engedélyezni Bingbot user agent-et
5. Cloudflare → Security → WAF → Custom Rules → ellenőrizni hogy nincs-e Bingbot-ot kiszúró szabály

Ugyanígy érdemes megnézni a `Googlebot`, `DuckDuckBot`, `YandexBot` user agent-eket is.

---

## ⏰ MIKOR mit csinálni

| Időszak | Mit |
|---|---|
| **Most — 2026-05-09 (3 hét)** | NULLA tartalmi munka. Reindex-kérelmek napi adagja. Off-site dolgok (G2, Capterra, AlternativeTo profilok) ha akarunk valamit csinálni. |
| **2026-05-09 — 2026-05-23** | 1. fázis: `cash-float-vs-petty-cash`, `payroll-cash-receipt`, `petty-cash-for-restaurants` (heti 1 új oldal) |
| **2026-05-23 — 2026-06-13** | 2. fázis: industry vertikálisok + receipt típus oldalak + reckon competitor (heti 2 oldal) |
| **2026-06-13 onnan** | 3. fázis: FAQ schema bővítés + anchor text optimalizáció + mérés |

---

# SEO + ICP Plan (v1)

## Positioning guardrail (must keep)
SpendNote is **not** an accounting, tax invoicing, or POS replacement tool.
SpendNote is for **internal cash control**, **handoff proof**, and **team audit trail**.

## SEO Quality Rules (must follow for every page)

**1. Keyword cannibalization prevention**
- Before creating a new page, check if an existing page already covers the same search intent.
- If yes → **expand the existing page** (add H2, FAQ entry, alt text variants) instead of creating a new page.
- One search intent = one page. Two pages targeting the same intent will hurt both.
- "Receipt for X" keyword variants should be woven into existing service provider pages, NOT separate pages (e.g. "receipt for babysitting" → `babysitter-cash-payment-receipt.html`).
- "Cash slip" is a synonym for "cash receipt" — only create a separate page if the target market/context is genuinely different (e.g. UK-specific content). Otherwise, add "cash slip" as a keyword variant to the existing cash receipt page.

**2. Meta description length (Bing compliance)**
- `<meta name="description">` must be **≤ 160 characters** to avoid Bing Webmaster Tools warnings.
- `og:description` and `twitter:description` should also stay ≤ 160 characters.
- Title tags: aim for **≤ 60 characters** where possible.

---

## Target Segment Table (ICP v2)

| Priority | Segment | Typical profile | Main pain (non-accounting) | SpendNote value | Willingness to pay (hypothesis) | Main channel |
|---|---|---|---|---|---|---|
| 1 | Shared-cash small teams | 3-20 people, multiple users handling cash | Unclear who recorded what; disputes later | Internal cash logs + receipt proof + audit trail | Medium-High | Direct outreach + referrals |
| 2 | Shift-handover heavy teams | Daily shift change operations | No reliable handover proof | Timestamped handoff tracking | Medium | Local owner groups + communities |
| 3 | Multi-cash-box operators | 2+ locations or multiple internal cash boxes | Weak visibility per cash box | Cash-box-level tracking + accountability | Medium | SEO landing + demo CTA |
| 4 | Field/onsite cash teams | Service/onsite operations | Paper-based records, hard to trace | Fast internal proof with central history | Medium | Direct DM/email + partner intros |

### Excluded segments (for now)
- Users looking for POS/cash register replacement.
- Users looking for full accounting/ERP replacement.
- Enterprise procurement-first orgs.

---

## Landing Copy Matrix (pain -> headline -> CTA)

### 1) Shared-cash small teams (primary)
- Pain: Multiple people handle cash; accountability is unclear.
- Headline: **Internal cash control for teams — without spreadsheet chaos.**
- Subheadline: Track every cash movement with clear team accountability and searchable proof.
- Primary CTA: **Start Free Preview (200 receipts)**
- Secondary CTA: See How Team Tracking Works

### 2) Shift-handover teams
- Pain: Handover has no reliable proof; disputes are common.
- Headline: **Make every cash handoff clear, timestamped, and traceable.**
- Subheadline: Record handoffs in seconds and avoid "who handled this?" confusion.
- Primary CTA: **Try Handoff Tracking Free**
- Secondary CTA: View Sample Handoff Flow

### 3) Multi-cash-box operators
- Pain: Cash control is fragmented across boxes/locations.
- Headline: **Keep every cash box accountable in one simple flow.**
- Subheadline: Track internal receipts and movements by cash box, user, and time.
- Primary CTA: **Start Managing Cash Boxes**
- Secondary CTA: Book a 15-min Demo

### 4) Field/onsite teams
- Pain: Onsite cash events are messy and hard to recover later.
- Headline: **Capture field cash movements instantly — keep one clean record.**
- Subheadline: Give your team a fast way to document cash events with proof.
- Primary CTA: **Start Free, No Card**
- Secondary CTA: See Mobile-Friendly Workflow

---

## Required disclaimer snippet (FAQ/footer)
"SpendNote is for internal cash tracking and team accountability. It does not replace your POS, tax invoicing, or accounting system."

---

## 1-2 week validation plan
1. 10 interviews with target operators.
2. Launch segment-specific headline + CTA variants.
3. Track:
   - Relevant visitor -> signup conversion
   - Signup -> activation (1 tx + 1 receipt)
   - 7-day return signal
4. Select one primary segment based on conversion + interview quality.

---

## Existing SEO Pages Inventory (to refine and finish)

### Quick status summary
- Good baseline: all listed pages have canonical tags and meta descriptions.
- Current staged strategy: several sitemap-listed pages intentionally remain `noindex, nofollow` until copy/UX is finalized.
- Positioning cleanup needed on some pages: avoid accounting/tax/POS-replacement phrasing; keep internal cash control + handoff proof framing.
- **IMPORTANT:** New SEO pages must have `noindex, nofollow` until explicitly approved by user for indexing.

**Document structure (where to find what):**
- **Idea backlog Rounds 1–7** = topic ideas with status (🔒 IDEA / ✅ LIVE / ⚠️ JOGI KOCKÁZAT). Items marked ⚠️ need strong disclaimers or should be skipped for legal risk.
- **Planned SEO Pages (24+2)** = approved page list; status per row (✅ LIVE = indexable).
- **Summary: Current Indexing Status** = full list of 41 indexable URLs.
- **ChatGPT SEO terv** (bottom) = extended strategy: new keyword clusters (generator, cash received, proof-of-payment, receipt app, etc.), brainstorm A–T. Clusters D and E are explicitly excluded (legal).

### SEO Content Clusters

#### Cluster 1: Petty Cash Voucher (Core Template + Supporting Pages)
**Hub page:** `petty-cash-voucher-template.html` ✅ INDEXABLE
- **Status:** `index, follow` - Live and indexable
- **Topic:** Petty cash voucher template with instant digital receipt generation
- **Schema:** Article + FAQPage
- **Internal links:** Cross-links to all supporting pages in cluster

**Supporting pages:**
1. `how-to-fill-out-petty-cash-voucher.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Step-by-step guide for filling out petty cash vouchers
   - **Schema:** HowTo + FAQPage
   - **Key features highlighted:** Receipt label customization, currency localization, instant generation

2. `petty-cash-voucher-sample.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Real petty cash voucher samples for common business expenses
   - **Schema:** Article + FAQPage
   - **Examples:** Office supplies, travel, meals, postage, repairs

3. `petty-cash-policy-template.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Petty cash policy template with automation benefits
   - **Schema:** Article + FAQPage
   - **Focus:** Policy guidelines + how SpendNote automates enforcement

**Cluster strategy:** Template page is the main entry point (indexable), supporting pages provide depth and long-tail coverage. All pages cross-link and funnel to signup CTA.

#### Cluster 2: Petty Cash Receipt & Generator
**Hub page:** `petty-cash-receipt-generator.html` ✅ INDEXABLE
- **Status:** `index, follow` - Live
- **Topic:** Instant petty cash receipt generation tool
- **Schema:** Article + FAQPage

**Supporting pages:**
- `petty-cash-reconciliation.html` ✅ INDEXABLE
  - **Status:** `index, follow` - Live
  - **Topic:** Petty cash reconciliation process and automation

#### Cluster 3: Cash Handoff & Team Accountability
**Hub page:** `cash-handoff-receipt.html` ✅ INDEXABLE
- **Status:** `index, follow` - Live
- **Topic:** Cash handoff documentation for shift changes and team accountability
- **Schema:** Article + FAQPage
- **Target segment:** Shift-handover teams (ICP priority 2)

#### Cluster 4: Small Business Cash Management
**Hub page:** `small-business-cash-receipt.html` ✅ INDEXABLE
- **Status:** `index, follow` - Live
- **Topic:** Small business cash receipt management

**Supporting pages:**
- `cash-receipt-template.html` ✅ INDEXABLE
  - **Status:** `index, follow` - Live

#### Cluster 5: Specialized Use Cases
1. `digital-petty-cash-book.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Digital petty cash book alternative

2. `office-expense-reimbursement-form.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Office expense reimbursement tracking

3. `petty-cash-log-template.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Petty cash log and tracking

4. `cash-drawer-reconciliation.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Cash drawer reconciliation for retail/service

5. `event-cash-handling.html` ✅ INDEXABLE
   - **Status:** `index, follow` - Live
   - **Topic:** Event cash handling and documentation

#### Cluster 6: Cash Slip & IOU (Small Business Focus)
**Hub page:** `cash-slip-template.html` 🔒 PLANNED
- **Status:** To be created
- **Topic:** Cash slip / petty cash slip alternative with digital tracking.
- **Target segment:** Small businesses looking for quick, simple cash handoff slips (American terminology).

**Supporting pages (Pain-point & Typos):**
1. `iou-slip-for-office.html` 🔒 PLANNED
   - **Status:** To be created
   - **Topic:** Replacing lost paper IOU slips (post-its) with digital "pending" out-transactions.
   - **Key angle:** Solving the "who took the 50 bucks?" problem without needing full accounting software.

2. `petty-cash-mistakes-and-terms.html` 🔒 PLANNED
   - **Status:** To be created
   - **Topic:** Common petty cash tracking mistakes and everyday terminology.
   - **SEO Strategy:** Organically capture high-volume typos and phonetic searches common among everyday small business owners (e.g., *pety cash*, *peddy cash log*, *petty cash vaucher*, *pety cash slip*) in a helpful, non-spammy context.

**Idea backlog (small-business language, colloquial + typo-friendly):**
1. `cash-up-sheet-template.html` 🔒 IDEA
   - **Intent:** End-of-day cash close routine for shops/teams.
   - **Keywords:** cash up sheet, end of day cash sheet, till cash-up.

2. `cash-shortage-log.html` 🔒 IDEA
   - **Intent:** Document missing cash incidents with clear accountability.
   - **Keywords:** cash shortage log, missing cash record, till shortage form.

3. `cash-over-and-short-form.html` 🔒 IDEA
   - **Intent:** Track over/short differences per shift.
   - **Keywords:** over and short form, cash over short sheet.

4. `shift-cash-handover-log.html` 🔒 IDEA
   - **Intent:** Shift-to-shift handover proof.
   - **Keywords:** shift cash handover, till handover log, cash handover form.

5. `cash-paid-out-log.html` ✅ LIVE (2026-03-08)
   - **Intent:** Record day-time paid-out cash events.
   - **Keywords:** cash paid out log, paid out slip, petty cash paid out.

6. `petty-cash-sign-out-sheet.html` 🔒 IDEA
   - **Intent:** Track who took cash, when, and why.
   - **Keywords:** petty cash sign out sheet, cash sign out form.

7. `cash-box-checklist.html` 🔒 IDEA
   - **Intent:** Daily checklist workflow for cash box checks.
   - **Keywords:** cash box checklist, daily cash box check.

8. `pety-cash-guide.html` 🔒 IDEA
   - **Intent:** Capture typo-driven searches in a useful guide format.
   - **Keywords:** pety cash, pety cash log, pety cash slip.

9. `petty-cash-vaucher-guide.html` 🔒 IDEA
   - **Intent:** Capture voucher typo traffic in educational context.
   - **Keywords:** petty cash vaucher, petty cash vucher.

10. `cash-slip-vs-receipt.html` 🔒 IDEA
    - **Intent:** Clarify terminology confusion for small business users.
    - **Keywords:** cash slip vs receipt, petty cash slip meaning.

**Idea backlog Round 2 (real small-business pain points):**

*Staff trust & accountability:*
1. `petty-cash-employee-theft.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Small business owners worried about cash going missing with no trail.
   - **Keywords:** how to track petty cash so employees don't steal, petty cash theft prevention.

2. `who-took-money-from-cash-box.html` ✅ LIVE (2026-03-08)
   - **Intent:** Identifying who last accessed the cash box when money is missing.
   - **Keywords:** who took money from cash box, how to know who took petty cash.

*"The cash doesn't add up" situations:*
3. `petty-cash-does-not-balance.html` ✅ LIVE (2026-03-08)
   - **Intent:** End-of-day panic — cash is short and no one knows why.
   - **Keywords:** petty cash doesn't balance, petty cash doesn't add up, cash box short at end of day.

4. `petty-cash-how-much-to-keep.html` ✅ LIVE (2026-03-14)
   - **Intent:** First-time setup question — how much cash to float.
   - **Keywords:** how much money to keep in petty cash, petty cash starting amount, petty cash float formula.

*Industry-specific:*
5. `restaurant-petty-cash-tips.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Restaurant owners managing daily cash tips and small expenses.
   - **Keywords:** restaurant petty cash management, restaurant cash tracking tips.

6. `salon-petty-cash-tracking.html` 🔒 IDEA
   - **Intent:** Hair salon / beauty salon cash management without accounting software.
   - **Keywords:** salon petty cash tracking, beauty salon cash management.

7. `food-truck-cash-tracking.html` 🔒 IDEA
   - **Intent:** Mobile business owners tracking cash on the go.
   - **Keywords:** food truck cash tracking, mobile business cash log.

8. `church-petty-cash-fund.html` 🔒 IDEA ⚠️ JOGI KOCKÁZAT
   - **Intent:** Nonprofit / church cash fund management with minimal overhead.
   - **Keywords:** church petty cash fund, nonprofit petty cash policy.
   - **⚠️ Figyelem:** Nonprofit/egyházi pénzkezelés IRS szabályozás alá eshet. Disclaimer szükséges.

*Process & rules:*
9. `how-often-count-petty-cash.html` 🔒 IDEA
   - **Intent:** Owners unsure about best practice cash count frequency.
   - **Keywords:** how often should you count petty cash, petty cash count schedule.

10. `petty-cash-rules-for-employees.html` 🔒 IDEA
    - **Intent:** Managers/HR looking for simple written rules to hand to staff.
    - **Keywords:** petty cash rules for employees, simple petty cash policy for staff.

11. `how-to-explain-petty-cash-to-employees.html` 🔒 IDEA
    - **Intent:** Onboarding new staff on how petty cash works.
    - **Keywords:** how to explain petty cash to employees, petty cash training guide.

12. `can-employees-take-petty-cash-without-receipt.html` 🔒 IDEA
    - **Intent:** Owners unsure about the rules — and worried about misuse.
    - **Keywords:** can employees take petty cash without a receipt, petty cash no receipt policy.

**Idea backlog Round 3 (additional small-business pain points):**

*Small business trust & responsibility:*
1. `petty-cash-trust-issues.html` 🔒 IDEA
   - **Intent:** Building trust with staff who access petty cash.
   - **Keywords:** how to trust staff with petty cash, petty cash access control.

2. `petty-cash-manager-responsibility.html` 🔒 IDEA
   - **Intent:** Deciding who should be responsible for petty cash.
   - **Keywords:** who should manage petty cash, petty cash manager responsibility.

*Daily practical issues:*
3. `petty-cash-running-out.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Handling situations when petty cash runs out unexpectedly.
   - **Keywords:** petty cash runs out mid day, what to do when petty cash is empty.

4. `forgot-to-record-petty-cash.html` 🔒 IDEA
   - **Intent:** Fixing missed petty cash transaction records.
   - **Keywords:** forgot to record petty cash, missed petty cash transaction fix.

*Small business environments:*
5. `small-shop-cash-control.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Simple cash control tailored for small shops.
   - **Keywords:** small shop cash control, petty cash for small retail.

6. `family-business-cash-tracking.html` 🔒 IDEA
   - **Intent:** Cash tracking for family-run businesses with trust dynamics.
   - **Keywords:** family business cash tracking, petty cash family business.

*Beginner entrepreneur questions:*
7. `petty-cash-for-startups.html` 🔒 IDEA
   - **Intent:** Addressing whether startups need petty cash tracking.
   - **Keywords:** petty cash for startups, do startups need petty cash.

8. `how-to-start-petty-cash-box.html` ✅ LIVE (2026-03-08)
   - **Intent:** First-time petty cash box setup checklist — what to buy, how to fund it, first-week checklist.
   - **Keywords:** how to start petty cash box, set up petty cash from scratch, first time petty cash setup.

*Unique situations & mistakes:*
9. `petty-cash-mixed-with-personal.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Handling accidental mixing of petty cash with personal money.
   - **Keywords:** petty cash mixed with personal money, separating petty cash personal.

10. `petty-cash-lost-key.html` 🔒 IDEA
    - **Intent:** Practical issue of losing access to the cash box.
    - **Keywords:** lost key to cash box, petty cash box locked out.

**Idea backlog Round 4 (audit fear, Excel replacement, work environments, daily routines):**

*Audit / tax panic:*
1. `petty-cash-audit-checklist.html` ✅ LIVE (2026-03-08)
   - **Intent:** Small business owners afraid of audit with no proper cash documentation.
   - **Keywords:** petty cash audit checklist, small business petty cash audit.

2. `petty-cash-records-for-tax-time.html` 🔒 IDEA ⚠️ JOGI KOCKÁZAT
   - **Intent:** End-of-year scramble to organize cash records for the accountant.
   - **Keywords:** petty cash records for tax, organize petty cash before tax season.
   - **⚠️ Figyelem:** Adótanácsadásnak tűnhet. Erős "not tax advice" disclaimer szükséges.

3. `petty-cash-missing-receipts-tax.html` 🔒 IDEA ⚠️ JOGI KOCKÁZAT
   - **Intent:** Panic when receipts are missing at tax time.
   - **Keywords:** missing petty cash receipts tax, lost petty cash receipts what to do.
   - **⚠️ Figyelem:** Adótanácsadásnak tűnhet. Erős "not tax advice" disclaimer szükséges.

*Replacing Excel / paper:*
4. `replace-petty-cash-spreadsheet.html` ~~IDEA~~ **Merged** → `petty-cash-app-vs-excel.html` ✅ LIVE
   - **Intent:** Frustrated Excel users looking for a simpler alternative.
   - **Keywords:** replace petty cash spreadsheet, petty cash Excel alternative. (Covered by app-vs-excel page.)

5. `petty-cash-app-vs-excel.html` ✅ LIVE (2026-03-08)
   - **Intent:** Comparison content — strong conversion potential.
   - **Keywords:** petty cash app vs Excel, petty cash software vs spreadsheet.

6. `daily-cash-report-template.html` ✅ LIVE (2026-03-08)
   - **Intent:** People currently writing daily reports by hand or in Word.
   - **Keywords:** daily cash report template, end of day cash report form.

*Additional work environments:*
7. `cleaning-business-petty-cash.html` 🔒 IDEA
   - **Intent:** Cleaning companies with multiple teams and supply purchases.
   - **Keywords:** cleaning business petty cash, cleaning company cash tracking.

8. `construction-site-petty-cash.html` ✅ LIVE (2026-03-08)
   - **Intent:** Construction crews buying materials with cash on-site.
   - **Keywords:** construction site petty cash, job site cash tracking.

9. `delivery-driver-cash-tracking.html` 🔒 IDEA
   - **Intent:** Drivers collecting cash on routes with no immediate reconciliation.
   - **Keywords:** delivery driver cash tracking, cash on delivery tracking.

10. `market-stall-cash-tracking.html` 🔒 IDEA
    - **Intent:** Market vendors / flea market sellers with daily cash-only operations.
    - **Keywords:** market stall cash tracking, flea market cash log.

*Daily routines & shift issues:*
11. `how-to-replenish-petty-cash.html` 🔒 IDEA
    - **Intent:** When and how to top up the petty cash fund.
    - **Keywords:** how to replenish petty cash, petty cash fund top up.

12. `cash-discrepancy-between-shifts.html` ✅ LIVE (2026-03-08)
    - **Intent:** Cash doesn't match between shifts — finding where it went wrong.
    - **Keywords:** cash discrepancy between shifts, shift change cash shortage.

13. `two-person-cash-count-policy.html` ✅ LIVE (2026-03-14)
    - **Intent:** Dual control principle explained simply for small teams.
    - **Keywords:** two person cash count, dual control cash counting policy.

14. `tip-jar-tracking-small-business.html` 🔒 IDEA
    - **Intent:** Fair tracking and splitting of tip jar money.
    - **Keywords:** tip jar tracking, how to track tip jar money fairly.

**Idea backlog Round 5 (security, remote management, confrontation, comparison, seasonal):**

*Security & storage:*
1. `where-to-keep-petty-cash.html` ✅ LIVE (2026-03-14)
   - **Intent:** Basic question about where to physically store petty cash.
   - **Keywords:** where to keep petty cash, best place to store petty cash in office, petty cash storage policy.

2. `petty-cash-security-tips.html` ✅ LIVE (2026-03-14)
   - **Intent:** Practical security tips for keeping cash safe.
   - **Keywords:** petty cash security tips, how to keep petty cash safe, petty cash internal controls, petty cash fraud examples.

3. `does-insurance-cover-petty-cash-theft.html` 🔒 IDEA ⚠️ JOGI KOCKÁZAT
   - **Intent:** Very specific but high-intent question after a theft incident.
   - **Keywords:** does insurance cover petty cash theft, business insurance stolen cash.
   - **⚠️ Figyelem:** Biztosítási tanácsadás területe. Erős disclaimer szükséges vagy kihagyni.

*Owner not always present:*
4. `manage-petty-cash-remotely.html` ✅ LIVE (2026-03-08)
   - **Intent:** Business owners who aren't always on-site but need cash visibility.
   - **Keywords:** manage petty cash remotely, track petty cash from home.

5. `petty-cash-for-part-time-staff.html` 🔒 IDEA
   - **Intent:** Managing cash access for part-time or rotating employees.
   - **Keywords:** petty cash access part time employees, part time staff cash handling.

*Difficult conversations:*
6. `how-to-confront-employee-about-missing-cash.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Emotionally charged — owner suspects theft but doesn't know how to address it.
   - **Keywords:** how to talk to employee about missing cash, confront staff about stolen money.

7. `petty-cash-discipline-policy.html` 🔒 IDEA ⚠️ JOGI KOCKÁZAT
   - **Intent:** What consequences to set when petty cash rules are broken.
   - **Keywords:** petty cash discipline policy, employee broke petty cash rules.
   - **⚠️ Figyelem:** Munkajogi terület — fegyelmi eljárások szabályozása államonként eltér.

*Comparison & decision support:*
8. `best-petty-cash-app-for-small-business.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Listicle / review format — strong conversion potential.
   - **Keywords:** best petty cash app small business, petty cash tracking app 2025.

9. `petty-cash-vs-business-bank-account.html` 🔒 IDEA
   - **Intent:** Clarifying when to use petty cash vs just using the business account.
   - **Keywords:** petty cash vs business account, when to use petty cash.

10. `envelope-budgeting-for-business.html` 🔒 IDEA
    - **Intent:** Popular American budgeting method applied to business cash.
    - **Keywords:** envelope cash system for business, envelope budgeting small business.

*Seasonal / time-specific:*
11. `holiday-season-cash-handling.html` 🔒 IDEA
    - **Intent:** Handling increased cash flow during holiday / Black Friday season.
    - **Keywords:** holiday season cash handling, Black Friday cash management tips.

12. `seasonal-staff-petty-cash.html` 🔒 IDEA
    - **Intent:** Giving temporary / seasonal workers quick petty cash access.
    - **Keywords:** petty cash for seasonal workers, temporary employee cash access.

*Closing & admin:*
13. `end-of-year-petty-cash-closeout.html` 🔒 IDEA
    - **Intent:** Year-end petty cash closing procedures.
    - **Keywords:** how to close out petty cash end of year, year end petty cash.

14. `petty-cash-vs-cash-register.html` 🔒 IDEA
    - **Intent:** Common confusion between petty cash and cash register functions.
    - **Keywords:** petty cash vs cash register, difference between petty cash and till.

**Idea backlog Round 6 (full app capabilities — receipt infrastructure beyond petty cash):**

> **Positioning guardrail:** SpendNote provides instant proof of cash handoff — NOT a tax invoice or official accounting document. The official invoice/receipt comes later; SpendNote gives immediate documentation that cash changed hands. Every page must include this disclaimer.

*Instant cash receipt / proof of payment (core app feature, new contexts):*
1. `rent-payment-cash-receipt.html` 🔒 IDEA ⭐ TOP PICK ⚠️ JOGI KOCKÁZAT
   - **Intent:** Landlords who collect rent in cash and need to give tenants instant proof — the official invoice comes later.
   - **Keywords:** rent payment cash receipt, proof of rent payment cash, rent cash handoff receipt.
   - **Framing:** Instant proof that cash rent was received; not a tax document.
   - **⚠️ Figyelem:** Több US államban (NY, CA) törvény szabályozza a rent receipt formátumát. Erős disclaimer kell.

2. `cash-deposit-receipt.html` ✅ LIVE
   - **Intent:** Instant proof that a security deposit / advance was received in cash.
   - **Keywords:** cash deposit receipt, security deposit receipt, deposit receipt.
   - **Framing:** Proof of cash handoff for deposits — official documentation follows later.

3. `advance-payment-cash-receipt.html` 🔒 IDEA
   - **Intent:** Instant proof that an advance/prepayment was received in cash before the invoice is issued.
   - **Keywords:** advance payment cash receipt, cash prepayment proof, advance cash handoff.
   - **Framing:** Quick proof of cash advance received — invoice follows.

4. `cash-payment-received-proof.html` 🔒 IDEA
   - **Intent:** General "I received your cash payment" instant documentation.
   - **Keywords:** cash payment received receipt, proof of cash payment, cash received confirmation.
   - **Framing:** Internal proof of cash received — not a final invoice.

5. `cash-refund-receipt.html` ✅ LIVE (2026-03-08)
   - **Intent:** Documenting that a cash refund was given back to someone.
   - **Keywords:** cash refund receipt, proof of cash refund, refund cash handoff.
   - **Framing:** Internal proof that cash was returned.

*Multi-cash-box & team features (direct app USP):*
6. `how-to-manage-multiple-cash-boxes.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Managing multiple cash boxes in one app — direct SpendNote USP.
   - **Keywords:** manage multiple cash boxes, multiple petty cash boxes one app.

7. `cash-tracking-multiple-locations.html` 🔒 IDEA
   - **Intent:** Tracking cash across multiple business locations from one dashboard.
   - **Keywords:** cash tracking multiple locations, multi-location cash management.

8. `team-cash-accountability-app.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Knowing which team member handled cash and when — audit trail showcase.
   - **Keywords:** team cash accountability, who handled cash app, cash audit trail.

9. `cash-box-for-each-department.html` 🔒 IDEA
   - **Intent:** Separate cash box per department for cleaner tracking.
   - **Keywords:** cash box per department, department petty cash tracking.

*Receipt branding & Pro feature showcase:*
10. `custom-cash-receipt-with-logo.html` ✅ LIVE
    - **Intent:** Creating branded internal receipts with company logo.
    - **Keywords:** cash receipt with logo, custom receipt template with branding.

11. `professional-internal-receipt-maker.html` 🔒 IDEA
    - **Intent:** Professional-looking internal cash receipts for small businesses.
    - **Keywords:** professional cash receipt maker, business receipt generator.

12. `digital-receipt-vs-paper-receipt.html` 🔒 IDEA
    - **Intent:** Why switch from paper to digital internal receipts.
    - **Keywords:** digital receipt vs paper receipt, paperless cash receipts.

*Industry-specific internal cash tracking (not invoicing):*
13. `cash-tracking-for-property-managers.html` 🔒 IDEA ⭐ TOP PICK
    - **Intent:** Property managers tracking maintenance/repair cash expenses internally.
    - **Keywords:** property manager cash tracking, rental property petty cash.

14. `cash-tracking-for-contractors.html` 🔒 IDEA
    - **Intent:** Contractors tracking cash paid to subcontractors or for materials — internal records.
    - **Keywords:** contractor cash tracking, subcontractor cash payment log.

15. `cash-tracking-for-event-organizers.html` 🔒 IDEA
    - **Intent:** Event organizers tracking cash flow during events — vendor payments, door revenue.
    - **Keywords:** event cash tracking, event cash management app.

*Employee cash advances & reimbursements (very common, internal proof):*
16. `employee-cash-advance-receipt.html` ✅ LIVE
    - **Intent:** Boss gives employee a payroll advance in cash — needs instant proof of handoff. Deducted from next paycheck later (not SpendNote's job).
    - **Keywords:** employee cash advance receipt, salary advance receipt, cash advance receipt employee.
    - **Framing:** Instant proof that cash advance was given — payroll reconciliation happens separately.

17. `employee-expense-advance-receipt.html` 🔒 IDEA
    - **Intent:** Employee receives cash for a business purchase (supplies, travel) — documenting the handoff.
    - **Keywords:** employee expense advance receipt, cash advance for business expenses.
    - **Framing:** Proof of cash given for business purposes — receipts for actual purchases collected separately.

18. `per-diem-cash-advance.html` 🔒 IDEA
    - **Intent:** Daily cash allowance given to workers (construction, travel, field work).
    - **Keywords:** per diem cash advance receipt, daily allowance cash handoff.
    - **Framing:** Proof of daily cash allowance disbursed — not a payroll document.

19. `employee-reimbursement-cash-receipt.html` 🔒 IDEA
    - **Intent:** Employee spent personal money on business expense, getting reimbursed in cash — needs proof of repayment.
    - **Keywords:** employee reimbursement cash receipt, cash reimbursement proof, out of pocket reimbursement.
    - **Framing:** Proof that employee was reimbursed in cash for out-of-pocket business expenses.

*Contractor / tradesman cash advance receipts (extremely common daily use case):*

> **Core scenario:** The tradesman/contractor is the SpendNote user. A client gives them cash upfront as an advance. The tradesman logs the IN transaction in SpendNote and instantly gives the client a receipt as proof of the cash received. The official invoice comes later after the work is done. SpendNote = instant proof of cash received, not a tax invoice.

20. `contractor-advance-payment-receipt.html` ✅ LIVE
    - **Intent:** Contractor receives a cash advance from a client — needs to give instant proof of cash received before issuing the final invoice.
    - **Keywords:** contractor advance payment receipt, contractor cash received proof, give client receipt for advance.
    - **Framing:** Contractor gives instant proof of cash advance received — invoices after job completion.

21. `plumber-cash-advance-receipt.html` 🔒 IDEA
    - **Intent:** Plumber receives cash upfront for parts/labor — gives the client instant documentation.
    - **Keywords:** plumber cash advance receipt, plumber proof of payment received, plumber cash deposit receipt.
    - **Framing:** Plumber documents cash received from client — full invoice follows after the job.

22. `electrician-cash-advance-receipt.html` 🔒 IDEA
    - **Intent:** Electrician receives cash advance before starting work — gives client a receipt on the spot.
    - **Keywords:** electrician cash advance receipt, electrician proof of cash received.
    - **Framing:** Electrician documents the advance — invoices after completion.

23. `handyman-cash-payment-receipt.html` ✅ LIVE
    - **Intent:** Handyman receives cash payment — very common, often no formal receipt given. SpendNote solves this.
    - **Keywords:** handyman cash payment receipt, handyman give receipt for cash, handyman proof of payment.
    - **Framing:** Handyman gives client instant proof of cash received — professional and simple.

24. `construction-material-advance-receipt.html` 🔒 IDEA
    - **Intent:** Construction crew receives cash for material purchases — documents who received how much.
    - **Keywords:** construction material cash advance, job site cash advance receipt, material purchase cash proof.
    - **Framing:** Crew leader documents cash received for materials — store receipts collected separately.

25. `service-provider-cash-advance.html` 🔒 IDEA
    - **Intent:** Any service provider (cleaner, painter, landscaper, mechanic) receives cash upfront and gives the client instant proof.
    - **Keywords:** service provider cash advance receipt, tradesman cash received proof, give client receipt before invoice.
    - **Framing:** Universal — any tradesman gives instant proof of cash received, invoices later.

*Community & group cash collection (the "class fund treasurer" use case):*

> **Core scenario:** One person collects cash from many people (parents, members, teammates). They need to track who paid, how much, and when — and be able to show proof to the group. SpendNote = each payment is an IN transaction from a contact, full transparency.

26. `school-money-collection-tracker.html` ✅ LIVE
    - **Intent:** Parent or teacher collecting class fund money from families — tracking who paid and who didn't.
    - **Keywords:** school money collection, class fund tracker, school money collection tracker, class fund log.
    - **Framing:** The class fund treasurer uses SpendNote to log every cash payment, give receipts, and show the group where the money went.

27. `pta-cash-collection-tracker.html` 🔒 IDEA
    - **Intent:** PTA / parent-teacher association collecting dues and fundraiser cash.
    - **Keywords:** PTA cash collection tracker, PTA dues tracker, parent teacher cash fund.
    - **Framing:** PTA treasurer tracks cash in and out with full accountability to parents.

28. `sports-team-fund-tracker.html` 🔒 IDEA ⭐ TOP PICK
    - **Intent:** Sports team manager collecting fees for equipment, travel, uniforms in cash.
    - **Keywords:** sports team fund tracker, team cash collection, team fee tracker app.
    - **Framing:** Team manager documents every cash payment — who paid, who owes, what was spent.

29. `club-dues-cash-tracker.html` 🔒 IDEA
    - **Intent:** Any club or organization collecting membership dues in cash.
    - **Keywords:** club dues tracker, membership fee cash collection, club fund tracker.
    - **Framing:** Club treasurer tracks cash dues with receipts for every member.

30. `community-fundraiser-cash-tracker.html` 🔒 IDEA
    - **Intent:** Tracking cash collected at fundraising events (bake sale, car wash, charity event).
    - **Keywords:** fundraiser cash tracker, bake sale cash log, charity cash collection tracker.
    - **Framing:** Event organizer documents every cash amount collected — full transparency for the group.

31. `office-collection-tracker.html` 🔒 IDEA
    - **Intent:** Office collections for gifts, group lunches, farewell presents — one person collects cash from coworkers.
    - **Keywords:** office collection tracker, group gift cash collection, office whip-round tracker.
    - **Framing:** The person collecting cash can show everyone exactly who contributed and how much was spent.

32. `hoa-cash-fee-tracker.html` 🔒 IDEA
    - **Intent:** HOA or condo association board collecting fees or assessments in cash.
    - **Keywords:** HOA cash fee tracker, condo association cash collection, HOA dues cash log.
    - **Framing:** Board treasurer tracks cash payments from residents with full accountability.

33. `youth-group-cash-tracker.html` 🔒 IDEA
    - **Intent:** Scout leaders, church youth group leaders collecting cash for trips, supplies, activities.
    - **Keywords:** youth group cash tracker, scout troop fund tracker, youth group money collection.
    - **Framing:** Group leader documents every cash payment from families — receipts and transparency.

**Idea backlog Round 7 (more cash handoff scenarios — vetted for positioning safety):**

> **Positioning guardrail reminder:** SpendNote documents the cash handoff moment. It is NOT a tax invoice, NOT a sales receipt, NOT an accounting document. Pages in this round must explicitly state that tax/invoicing obligations are handled separately. Rejected from this round: private vehicle sale, garage sale, auto mechanic, tow truck, moving company, consignment — all require official invoicing as the primary document.

*Service providers documenting cash received (same framing as contractor round):*
1. `babysitter-cash-payment-receipt.html` ✅ LIVE
   - **Intent:** Babysitter/nanny receives weekly cash payment — gives the family instant proof of cash received.
   - **Keywords:** babysitter cash payment receipt, nanny cash receipt, proof of babysitter payment.
   - **Framing:** The sitter documents cash received from the family — tax reporting is handled separately by each party.

2. `dog-walker-cash-receipt.html` 🔒 IDEA
   - **Intent:** Dog walker / pet sitter receives regular cash payments — documents each one.
   - **Keywords:** dog walker cash receipt, pet sitter payment receipt, proof of dog walking payment.
   - **Framing:** Pet sitter documents cash received — invoicing/tax handled separately.

3. `lawn-care-cash-receipt.html` 🔒 IDEA
   - **Intent:** Lawn care / landscaping provider receives cash — gives client instant proof.
   - **Keywords:** lawn care cash receipt, landscaper cash payment proof, yard work cash receipt.
   - **Framing:** Landscaper documents cash received for the job — official invoice follows if needed.

4. `tutor-cash-payment-receipt.html` ✅ LIVE
   - **Intent:** Private tutor receives cash for lessons — gives parent/student instant proof.
   - **Keywords:** tutor cash payment receipt, private lesson cash receipt, tutoring payment proof.
   - **Framing:** Tutor documents cash received per session — tax obligations handled separately.

*Event vendors documenting advance cash received:*
5. `wedding-vendor-cash-advance.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Wedding vendor (DJ, florist, caterer, photographer) receives cash advance — gives couple instant proof.
   - **Keywords:** wedding vendor cash advance receipt, wedding deposit cash proof, pay wedding vendor cash.
   - **Framing:** Vendor documents cash advance received — full invoice issued after the event.

6. `event-vendor-cash-receipt.html` 🔒 IDEA
   - **Intent:** Any event vendor/supplier receives cash on-site — documents the handoff.
   - **Keywords:** event vendor cash receipt, event supplier cash advance proof.
   - **Framing:** Vendor gives instant proof of cash received at the event — invoices separately.

*Internal / operational (no tax issue at all):*
7. `key-deposit-cash-receipt.html` 🔒 IDEA
   - **Intent:** Documenting cash received as a key/access deposit (apartment, office, locker, equipment).
   - **Keywords:** key deposit cash receipt, key deposit proof, refundable deposit cash receipt.
   - **Framing:** Proof that a refundable deposit was received in cash — returned when key is returned.

8. `cash-float-setup-for-events.html` 🔒 IDEA
   - **Intent:** Setting up a starting cash float for an event, market stall, or register — documenting who received the float.
   - **Keywords:** cash float setup, starting cash for event, cash float handoff receipt.
   - **Framing:** Internal documentation of who received the starting cash — fully internal, no tax.

9. `lost-and-found-cash-log.html` 🔒 IDEA
   - **Intent:** Documenting cash found on premises or returned to someone — proof of the handoff.
   - **Keywords:** lost and found cash log, found cash documentation, cash return receipt.
   - **Framing:** Internal proof that found cash was documented and/or returned.

---

#### Strategic SEO Priorities (near-term)

> These themes should be pursued as soon as possible — they represent high-potential angles that can bring in new segments quickly.

**1. "Cash slip" keyword cluster**
- "Cash slip" is a widely used synonym for cash receipt in many markets (UK, Australia, South Africa, India).
- Target keywords: `cash slip template`, `cash slip generator`, `printable cash slip`, `cash payment slip`.
- This is low-hanging fruit — same product, different keyword family.
- Potential pages: `cash-slip-template.html`, `printable-cash-slip.html`.

**2. Excel replacement / spreadsheet alternative angle**
- Many target users currently track cash in Excel or Google Sheets — positioning SpendNote as the upgrade.
- Target keywords: `cash tracking spreadsheet alternative`, `replace excel cash log`, `petty cash excel alternative`.
- This angle works across ALL segments (small teams, shift teams, treasurers).
- Potential pages: `petty-cash-excel-alternative.html`, `cash-tracking-spreadsheet-replacement.html`.

**3. "Receipt for [X]" keyword pattern (ChatGPT tip)**
- The compound pattern `receipt for [service/scenario]` is a natural Google search pattern with massive long-tail potential.
- Examples: `receipt for babysitting`, `receipt for tutoring`, `receipt for cleaning services`, `receipt for cash payment`, `receipt for dog walking`, `receipt for lawn care`.
- Every existing service provider page can be supplemented with a "receipt for X" variant or the pages can target both patterns.
- This pattern scales infinitely — every cash-paid service has a "receipt for [X]" search.

**4. "Daily Cash Tracking / Cash Count / Cash Log" cluster (added 2026-03-17)**
- This is a separate SEO universe from "petty cash" — targets daily cash register/drawer reconciliation for shops, restaurants, salons, food trucks.
- NOT POS/cash register software (regulated) — this is **internal cash control** (same category as petty cash).
- High-volume keywords: `daily cash log`, `cash count sheet`, `cash drawer count sheet`, `end of day cash report`, `cash tally sheet`, `cash reconciliation template`.
- These searchers need a tool → high conversion potential.

**Already partially covered by existing pages:**

| Keyword | Existing page | Coverage |
|---|---|---|
| cash count sheet | `cash-count-sheet-template.html` ✅ | Fully covered |
| daily cash report, end of day cash report | `daily-cash-report-template.html` ✅ | Fully covered |
| cash drawer count sheet | `cash-drawer-reconciliation.html` ✅ | Partially (framed as "reconciliation") |
| cash reconciliation template | `petty-cash-reconciliation.html` ✅ | Partially (petty cash framing) |
| cash log template | `petty-cash-log-template.html` ✅ | Partially (petty cash framing) |
| end of day cash sheet, cash up sheet | `cash-up-sheet-template.html` 🔒 IDEA | Already in backlog |

**Genuine gaps — NEW page ideas (industry-specific daily cash tracking):**

1. `restaurant-cash-count-sheet.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Restaurant/café owner counting cash at end of day/shift.
   - **Keywords:** restaurant cash count sheet, restaurant end of day cash report, café cash reconciliation.
   - **Framing:** Internal cash control for food service — NOT about tips/POS. Count drawer, compare to expected, document discrepancy.
   - **Note:** Different from removed `restaurant-petty-cash-tips` (that was IRS tip risk). This is pure cash counting.

2. `retail-cash-reconciliation.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Retail store owner reconciling daily cash drawer.
   - **Keywords:** retail cash reconciliation, store cash count sheet, retail end of day cash count.
   - **Framing:** Small retail store daily cash close routine — count, verify, document.

3. `store-daily-cash-log.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Small shop/store owner tracking daily cash flow.
   - **Keywords:** store cash log, small business daily cash log, daily cash tracking for shops.
   - **Framing:** Simple daily IN/OUT cash log for shops that don't use full accounting.

4. `food-truck-cash-count.html` 🔒 IDEA
   - **Intent:** Food truck / mobile vendor daily cash count.
   - **Keywords:** food truck cash count, food truck daily cash log, mobile vendor cash tracking.
   - **Framing:** Fast end-of-day cash close for mobile businesses.

5. `salon-daily-cash-sheet.html` 🔒 IDEA
   - **Intent:** Salon/barbershop daily cash tracking (many clients pay cash).
   - **Keywords:** salon cash sheet, barbershop daily cash log, salon cash reconciliation.
   - **Framing:** Track walk-in cash payments and reconcile at close.

6. `cash-tally-sheet-template.html` 🔒 IDEA
   - **Intent:** Generic cash tally / denomination counting sheet.
   - **Keywords:** cash tally sheet, cash tally template, money tally sheet.
   - **Framing:** Count bills and coins by denomination, compare to expected total. Slight overlap with `cash-count-sheet-template.html` — consider absorbing into existing page instead.

**Keyword expansion tasks for EXISTING pages (no new pages — absorb secondary keywords):**

| Secondary keyword to add | Target existing page | Where to add |
|---|---|---|
| daily cash log, daily cash log template | `daily-cash-report-template.html` | H2, meta desc, body |
| cash drawer count sheet | `cash-drawer-reconciliation.html` | H2, alt tag |
| cash tally sheet | `cash-count-sheet-template.html` | H2, body text |
| small business cash log | `petty-cash-log-template.html` | body text, related resources |
| cash reconciliation sheet, cash reconciliation template | `petty-cash-reconciliation.html` | body text |

**AVOID (POS/cash register territory):**
- ~~cash register log~~ — POS software overlap
- ~~cash register software~~ — regulated territory
- ~~till log template~~ — too close to POS register

---

### Planned SEO Pages (24 planned + 2 bonus from idea backlog — approved 2026-03-07)

All pages created with `noindex, nofollow` until individually approved for indexing.
**Status:** 14 of 24 planned pages LIVE (remaining: 7 Service Provider + 3 Excel/Spreadsheet). Plus 2 bonus from idea backlog (how-to-start-petty-cash-box, manage-petty-cash-remotely) also LIVE.

#### Persona — Service Providers (7)

| # | Slug | Primary keyword | Image reuse strategy |
|---|---|---|---|
| 1 | `freelancer-cash-payment-receipt` | freelancer cash receipt | contractor images |
| 2 | `cleaning-service-cash-receipt` | cleaning service cash receipt | babysitter images |
| 3 | `personal-trainer-cash-receipt` | personal trainer cash receipt | babysitter images |
| 4 | `lawn-care-cash-payment-receipt` | lawn care cash receipt | contractor images |
| 5 | `salon-cash-receipt` | salon cash receipt | babysitter images |
| 6 | `moving-company-cash-receipt` | moving company cash receipt | contractor images |
| 7 | `rent-payment-receipt` | rent payment receipt | generic receipt images |

#### Excel / Spreadsheet Searchers (4)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 8 | `cash-receipt-template-excel` | cash receipt template excel | "Looking for Excel? Here's better" |
| 9 | `petty-cash-template-excel` | petty cash template excel | Excel alternative positioning |
| 10 | `cash-tracking-spreadsheet` | cash tracking spreadsheet | Spreadsheet replacement |
| 11 | `petty-cash-app-vs-excel` | petty cash app vs excel | Direct comparison page | ✅ LIVE 2026-03-08 |

#### Panic / Problem Searches (3)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 12 | `petty-cash-does-not-balance` | petty cash doesn't balance | Problem → diagnosis → SpendNote as prevention | ✅ LIVE 2026-03-08 |
| 13 | `who-took-money-from-cash-box` | who took money from cash box | Trust problem → audit trail → SpendNote | ✅ LIVE 2026-03-08 |
| 14 | `cash-discrepancy-between-shifts` | cash discrepancy between shifts | Shift handover problem → SpendNote | ✅ LIVE 2026-03-08 |

#### Industry-Specific (1)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 15 | `construction-site-petty-cash` | construction site petty cash | Field/onsite cash management | ✅ LIVE 2026-03-08 |

#### Process / Feature Pages (7)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 16 | `daily-cash-report-template` | daily cash report template | End-of-day cash summary | ✅ LIVE 2026-03-08 |
| 17 | `digital-receipt-book` | digital receipt book | Replace paper receipt books | ✅ LIVE 2026-03-08 |
| 18 | `cash-count-sheet-template` | cash count sheet | Cash denomination counting | ✅ LIVE 2026-03-08 |
| 19 | `petty-cash-replenishment-form` | petty cash replenishment | Replenishment process | ✅ LIVE 2026-03-08 |
| 20 | `cash-refund-receipt` | cash refund receipt | Documenting cash refunds | ✅ LIVE 2026-03-08 |
| 21 | `petty-cash-audit-checklist` | petty cash audit checklist | Audit preparation | ✅ LIVE 2026-03-08 |
| 22 | `cash-paid-out-log` | cash paid out log | Disbursement tracking | ✅ LIVE 2026-03-08 |

#### Educational / How-To Pages (2)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 23 | `how-to-track-cash-payments` | how to track cash payments | Educational guide → SpendNote as solution | ✅ LIVE 2026-03-08 |
| 24 | `how-to-manage-petty-cash-small-business` | how to manage petty cash small business | Educational cluster hub → SpendNote as tool | ✅ LIVE 2026-03-08 |

#### Keyword Expansion Tasks (existing pages — no new pages needed)

The following keyword variants should be woven into existing pages' H2s, alt tags, meta descriptions, and body copy instead of creating separate pages (to avoid cannibalization).

**"Printable / PDF / download" keywords → add to existing pages:**

| Keyword variant | Target existing page |
|---|---|
| printable cash receipt, cash receipt printable | `cash-receipt-template.html` |
| petty cash form pdf, petty cash voucher pdf | `petty-cash-voucher-template.html` |
| cash log sheet pdf, cash log sheet printable | `petty-cash-log-template.html` |
| cash payment receipt printable | `cash-payment-received-proof.html` |

**"Alternative / replacement" keywords → add to existing pages:**

| Keyword variant | Target existing page |
|---|---|
| receipt book alternative, paper receipt book replacement | `digital-receipt-book.html` ✅ LIVE |
| digital petty cash log, petty cash ledger alternative | `digital-petty-cash-book.html` |
| cash log book alternative | `petty-cash-log-template.html` |

**"How to" variants absorbed into existing pages:**

| Keyword variant | Target existing page |
|---|---|
| how to record cash expenses | `office-expense-reimbursement-form.html` |
| how to keep cash receipts | `cash-receipt-template.html` |
| petty cash management system | `digital-petty-cash-book.html` |

#### Removed from consideration (legal/cannibalization risk)

| Slug | Reason |
|---|---|
| ~~missing-petty-cash-receipts-tax~~ | Tax legal risk |
| ~~restaurant-petty-cash-tips~~ | IRS tip reporting regulations |
| ~~restaurant-cash-tracking~~ | POS/cash register regulatory overlap |
| ~~shift-cash-handover-log~~ | Cannibalization with `cash-handoff-receipt` |
| ~~petty-cash-sign-out-sheet~~ | Cannibalization with `petty-cash-voucher-template` |
| ~~replace-petty-cash-spreadsheet~~ | Merged into `petty-cash-app-vs-excel` |

---

#### Future Phase: Multilingual SEO Expansion

> **Key insight:** SpendNote receipts are already fully localizable — custom receipt labels (Pro) + currency selection mean the generated receipt works in ANY language/country. Only the app UI stays English, but the app is simple enough (few screens, few buttons) that non-English speakers can use it easily while their clients receive receipts in their local language.

**Strategy:** Take the best-performing 20-30 English SEO pages and create localized versions in target languages using subfolder structure (`/es/`, `/de/`, `/pt/`, `/fr/`).

**Target markets (priority order):**
1. **Spanish** (`/es/`) — US Hispanic market + Latin America. Massive cash-heavy economy, millions of small tradesmen.
2. **Portuguese** (`/pt/`) — Brazil. Cash-intensive small business sector.
3. **German** (`/de/`) — DACH region. Surprisingly high cash usage, strong documentation culture.
4. **French** (`/fr/`) — France + West Africa. Small tradesmen, community funds.

**Why this works:**
- Receipt output is already localized (labels + currency) → the product delivers in the user's language.
- Same content structure as English pages → only text and keywords change.
- Subfolder SEO (`spendnote.app/es/recibo-de-efectivo`) is a proven multilingual strategy.
- Much lower keyword competition in non-English markets for cash receipt tools.
- Multiplier effect: 30 pages × 4 languages = 120 additional SEO pages with minimal effort.

**Timing:** Only after English SEO is established and generating stable traffic (earliest: 6-12 months after English content launch).

### Core Pages (Non-SEO Landing)

| URL | Source file | Current robots | Purpose |
|---|---|---|---|
| https://spendnote.app/ | `index.html` | `index, follow` | Main product page (brand + core value) |
| https://spendnote.app/pricing | `spendnote-pricing.html` | `noindex, nofollow` | Plan comparison / conversion page |
| https://spendnote.app/faq | `spendnote-faq.html` | `index, follow` | Objection handling + product clarification |

### Summary: Current Indexing Status

**Indexable pages (index, follow):** 47
- index.html ✅
- spendnote-faq.html ✅
- petty-cash-voucher-template.html ✅
- petty-cash-reconciliation.html ✅
- small-business-cash-receipt.html ✅
- cash-receipt-template.html ✅
- digital-petty-cash-book.html ✅
- office-expense-reimbursement-form.html ✅
- petty-cash-log-template.html ✅
- cash-drawer-reconciliation.html ✅
- event-cash-handling.html ✅
- how-to-fill-out-petty-cash-voucher.html ✅
- petty-cash-voucher-sample.html ✅
- petty-cash-policy-template.html ✅
- contractor-advance-payment-receipt.html ✅
- cash-payment-received-proof.html ✅
- babysitter-cash-payment-receipt.html ✅
- petty-cash-receipt-generator.html ✅
- cash-handoff-receipt.html ✅
- handyman-cash-payment-receipt.html ✅
- tutor-cash-payment-receipt.html ✅
- employee-cash-advance-receipt.html ✅
- school-money-collection-tracker.html ✅
- cash-deposit-receipt.html ✅
- custom-cash-receipt-with-logo.html ✅
- petty-cash-app-vs-excel.html ✅ (added 2026-03-08)
- construction-site-petty-cash.html ✅ (added 2026-03-08)
- petty-cash-audit-checklist.html ✅ (added 2026-03-08)
- daily-cash-report-template.html ✅ (added 2026-03-08)
- petty-cash-does-not-balance.html ✅ (added 2026-03-08)
- how-to-manage-petty-cash-small-business.html ✅ (added 2026-03-08)
- cash-discrepancy-between-shifts.html ✅ (added 2026-03-08)
- how-to-track-cash-payments.html ✅ (added 2026-03-08)
- who-took-money-from-cash-box.html ✅ (added 2026-03-08)
- cash-refund-receipt.html ✅ (added 2026-03-08)
- digital-receipt-book.html ✅ (added 2026-03-08)
- cash-count-sheet-template.html ✅ (added 2026-03-08)
- petty-cash-replenishment-form.html ✅ (added 2026-03-08)
- cash-paid-out-log.html ✅ (added 2026-03-08)
- how-to-start-petty-cash-box.html ✅ (added 2026-03-08)
- manage-petty-cash-remotely.html ✅ (added 2026-03-08)
- what-is-petty-cash.html ✅ (added 2026-03-14)
- where-to-keep-petty-cash.html ✅ (added 2026-03-14)
- petty-cash-security-tips.html ✅ (added 2026-03-14)
- two-person-cash-count-policy.html ✅ (added 2026-03-14)
- petty-cash-how-much-to-keep.html ✅ (added 2026-03-14)
- spendnote-resources.html ✅ (added 2026-03-14) — Resource Center hub page

**Draft pages (noindex, nofollow - awaiting approval):** 1
- spendnote-pricing.html 🔒 (intentional - no payment system yet)

### Key notes per page (important details)

1. **index (`/`)**
   - Canonical is correct (`https://spendnote.app/`).
   - Already indexable.
   - Uses SoftwareApplication structured data.

2. **pricing (`/pricing`)**
   - Intentionally `noindex, nofollow` while copy/details are being finalized.
   - Canonical is clean URL (`/pricing`).
   - Has Product/Offer structured data.

3. **faq (`/faq`)**
   - Indexable and has clean canonical.
   - Uses FAQPage structured data (important for search visibility).
   - Already contains strong internal-cash wording in key answer(s).

4. **template/generator/landing pages (`/petty-cash-*`, `/cash-handoff-receipt`, `/small-business-cash-receipt`)**
   - All indexable (`index, follow`).
   - Canonicals are properly set to clean URLs.
   - Most use Article or SoftwareApplication schema + FAQPage.

### Finish checklist for these SEO pages

### Update log - 2026-03-17 (Daily Cash Tracking cluster analysis)

1. **New SEO cluster identified: "Daily Cash Tracking / Cash Count / Cash Log"**
   - Separate search universe from "petty cash" — targets shops, restaurants, salons, food trucks doing daily cash reconciliation.
   - NOT POS/cash register (regulated) — this is internal cash control, same category as petty cash.

2. **Analysis of existing coverage:**
   - 5 keywords already partially/fully covered by existing LIVE pages (cash count sheet, daily cash report, cash drawer reconciliation, petty cash reconciliation, petty cash log).
   - 6 new industry-specific page ideas added (restaurant, retail, store, food truck, salon, cash tally sheet).
   - 3 TOP PICKs: `restaurant-cash-count-sheet`, `retail-cash-reconciliation`, `store-daily-cash-log`.
   - 5 keyword expansion tasks identified for existing pages (absorb secondary keywords like "daily cash log", "cash tally sheet", etc.).

3. **Avoided:** cash register log, cash register software, till log template (POS territory).

4. **Source:** ChatGPT Search Console query analysis + keyword research.

---

### Update log - 2026-03-21 (SEO CTR Optimization — Phase 1 title/meta rewrite)

**Háttér:** Google Search Console export elemzése (2026-02-21 – 2026-03-21):
- 47 indexelt oldal, ~1700+ megjelenés, ~10 kattintás (CTR < 1%)
- Átlagos pozíció ~50 — legtöbb oldal a 3-5. keresőoldalakon
- 13 oldal azonosítva "majdnem page 1" pozícióban (5-26)

**Fő megállapítások:**
1. **"Template" kulcsszavak túl versenyezők** — Canva, Template.net, Vertex42 dominálnak; intent mismatch (letölthető fájlt várnak, nem SaaS tool-t)
2. **Alacsony domain authority** — új domain, kevés backlink; nem támogatja a magas versenyt
3. **Title/meta nem elég kattintható** — sok title "| SpendNote" suffixal végződött (12 karakter pazarlás), meta description-ök nem differenciáltak

**Elvégzett változtatások (commit `74ae773`):**

| # | Oldal | Régi title | Új title | Pozíció |
|---|-------|-----------|---------|---------|
| 1 | two-person-cash-count-policy | ...Dual Control Guide \| SpendNote | ...Rules + Sign-Off Template | 5.1 |
| 2 | babysitter-cash-payment-receipt | ...Track Every Payment \| SpendNote | ...Instant Proof for Families | 8.5 |
| 3 | tutor-cash-payment-receipt | ...| SpendNote | Private Tutor Cash Receipt — Instant Proof per Session | 9.4 |
| 4 | petty-cash-security-tips | ...Theft & Shortages \| SpendNote | ...Theft & Fraud | 10 |
| 5 | event-cash-handling | ...Stall Float Management \| SpendNote | ...Float Setup, Tracking & Close-Out | 10.8 |
| 6 | digital-petty-cash-book | ...Automatic Tracking - SpendNote | ...Replace Your Paper Ledger | 11.7 |
| 7 | petty-cash-how-much-to-keep | ...Float Sizing Guide \| SpendNote | ...Float Formula + Examples | 12.9 |
| 8 | custom-cash-receipt-with-logo | ...| SpendNote | ...Your Logo — Free to Create | 14.9 |
| 9 | school-money-collection-tracker | ...| SpendNote | ...See Who Paid | 15.4 |
| 10 | cash-handoff-receipt | ...Internal Transfer Documentation \| SpendNote | ...Document Every Internal Transfer | 15.9 |
| 11 | employee-cash-advance-receipt | ...| SpendNote | ...Instant Proof of Payment | 16.6 |
| 12 | cash-refund-receipt | ...Template \| SpendNote | ...Instant Refund Documentation | 18.4 |
| 13 | cash-drawer-reconciliation | ...Step-by-Step Guide \| SpendNote | ...Step-by-Step Close-Out Guide | 26.3 |

**Meta description stratégia:** beszélgetős, kérdés formátumú ("Paying your babysitter in cash?"), konkrét benefit + CTA.

**Frissítve minden oldalon:** `<title>`, `<meta name="description">`, `og:title`, `og:description`, `twitter:title`, `twitter:description` (13 × 6 = 78 tag)

**Indexelés kérése:** mind a 13 URL-re GSC-ben beküldve.

**Várt hatás:**
- CTR javulás: 0-1% → 2-5% a position 5-15 tartományban (1-2 hét)
- Pozíció javulás: top 3 jelölt page 1-re — two-person-cash-count-policy, babysitter-receipt, tutor-receipt (3-6 hét)

**SEO Phase 2 terv (PENDING):**
1. **Tartalom megerősítés** — top 3-5 oldal H2 bővítése GSC query-k alapján
2. **"Template" oldalak repozícionálása** — tool-framing a letölthető fájl helyett
3. **Backlink építés** — LinkedIn, startup directoriák, niche közösségek
4. **Keyword expansion** — meglévő oldalak bővítése secondary kulcsszavakkal (daily cash log → daily-cash-report, cash tally sheet → cash-count-sheet stb.)

---

### Update log - 2026-03-21 (SEO CTR Optimization — Phase 2 title/meta rewrite for ALL remaining pages)

**Elvégzett változtatások (commit `1fa0096`):**

Maradék 31 SEO oldal + index.html landing page — ugyanaz a stratégia mint Phase 1:
- "| SpendNote" / "- SpendNote" suffix eltávolítva minden title-ből
- Action/benefit szuffixok hozzáadva (pl. "— Track Every Disbursement", "— Find the Gap")
- Meta description-ök beszélgetős, kérdés formátumúra átírva
- og:title, og:description, twitter:title, twitter:description szinkronizálva

| # | Oldal | Új title szuffix | Új meta desc stílus |
|---|-------|-----------------|---------------------|
| 1 | cash-count-sheet-template | — Count by Denomination | "Free cash count sheet..." |
| 2 | cash-deposit-receipt | — Instant Proof of Deposit | "Received a cash deposit?..." |
| 3 | cash-discrepancy-between-shifts | — Find the Gap | "Cash doesn't match?..." |
| 4 | cash-paid-out-log | — Track Every Disbursement | "Track every cash payout..." |
| 5 | cash-payment-received-proof | — Instant Documentation | "Need proof that cash was received?..." |
| 6 | cash-receipt-template | — Printable & PDF | "Free cash receipt template..." |
| 7 | construction-site-petty-cash | — Track Crew Expenses | "Track petty cash on construction sites..." |
| 8 | contractor-advance-payment-receipt | — Instant Cash Proof | "Client paying cash upfront?..." |
| 9 | daily-cash-report-template | — End-of-Day Summary | "End-of-day cash report..." |
| 10 | digital-receipt-book | — Replace Your Paper Book | "Ditch the paper receipt book..." |
| 11 | handyman-cash-payment-receipt | — Instant Client Proof | "Getting paid in cash for a handyman job?..." |
| 12 | how-to-fill-out-petty-cash-voucher | — Step by Step | "Step-by-step guide..." |
| 13 | how-to-manage-petty-cash-small-business | — Small Business Guide | "How to manage petty cash from scratch..." |
| 14 | how-to-start-petty-cash-box | — First-Week Checklist | "First-time petty cash box setup..." |
| 15 | how-to-track-cash-payments | — Simple System | "No system for tracking cash payments?..." |
| 16 | manage-petty-cash-remotely | — See Balances Anywhere | "Not on-site?..." |
| 17 | office-expense-reimbursement-form | — Track Advances | "Track office expense reimbursements..." |
| 18 | petty-cash-app-vs-excel | — Why Teams Switch | "Still tracking petty cash in Excel?..." |
| 19 | petty-cash-audit-checklist | — Be Ready When It Comes | "Petty cash audit coming?..." |
| 20 | petty-cash-does-not-balance | Here's Why + How to Fix It | "Petty cash short and no one knows why?..." |
| 21 | petty-cash-log-template | — Track Every Transaction | "Free petty cash log template..." |
| 22 | petty-cash-policy-template | — Ready-Made Rules | "Free petty cash policy template..." |
| 23 | petty-cash-receipt-generator | — Print, PDF, or Email | "Generate petty cash receipts instantly..." |
| 24 | petty-cash-reconciliation | — Complete Step-by-Step Guide | "How to reconcile petty cash..." |
| 25 | petty-cash-replenishment-form | — When & How to Top Up | "Petty cash running low?..." |
| 26 | petty-cash-voucher-sample | — Real Business Examples | "Real petty cash voucher examples..." |
| 27 | petty-cash-voucher-template | — Free Digital + Printable | "Free petty cash voucher template..." |
| 28 | small-business-cash-receipt | — Document Every Handoff | "Document every cash handoff..." |
| 29 | what-is-petty-cash | Definition & How It Works | (megtartva — már jó volt) |
| 30 | where-to-keep-petty-cash | — Storage & Access Guide | (megtartva — már jó volt) |
| 31 | who-took-money-from-cash-box | Find Out Fast | "Cash box short and no one's talking?..." |
| 32 | **index.html** | SpendNote — Petty Cash Tracking & Receipts for Teams | "Track every cash movement..." |

**Összesen Phase 1 + Phase 2:** 45 oldal × 6 tag = **270 tag** frissítve

**SEO Phase 3 terv (PENDING):**
1. **Tartalom megerősítés** — top 3-5 oldal H2 bővítése GSC query-k alapján
2. **"Template" oldalak repozícionálása** — tool-framing a letölthető fájl helyett
3. **Backlink építés** — LinkedIn, startup directoriák, niche közösségek
4. **Keyword expansion** — meglévő oldalak bővítése secondary kulcsszavakkal
5. **GSC újraindexelés** — mind a 45 URL-re beküldés

---

### Update log - 2026-03-21 (CTR framing konklúzió + Phase 3 finomítás)

**Konklúzió a Phase 1-2 title rewrite-ról:**

A title-ök SEO-technikai szempontból rendben vannak:
- ✅ Keyword elöl minden title-ben
- ✅ Brand suffix eltávolítva (12+ karakter nyereség)
- ✅ Nincs keyword stuffing
- ✅ Nincs clickbait mismatch
- ✅ Meta description-ök beszélgetős, kérdés formátumúak

**De:** sok title túl "leíró" maradt — funkciót/feature-t mond, nem szituációt vagy pain-t. Ez CTR szempontból gyengébb, mert a user nem érzi a "miért kattintsak most?" triggert.

**Példák a különbségre (nem keyword csere, csak framing csere):**

| Jelenlegi (leíró) | Jobb (pain/szituáció trigger) |
|---|---|
| Cash Refund Receipt — Instant Refund Documentation | Need to Refund Cash? Use This Simple Receipt (Free) |
| Employee Cash Advance Receipt — Instant Proof of Payment | Gave an Employee Cash? Create a Signed Receipt in 30s |
| Petty Cash How Much to Keep? Float Formula + Examples | How Much Petty Cash Should You Keep? (Simple Rule) |

**Fontos:** ez NEM agresszívebb SEO. Nincs extra keyword, nincs stuffing, nincs clickbait. Csak más pszichológiai framing — szituáció/probléma a title elején, ami erősebb kattintási triggert ad. Nulla SEO kockázat.

**Ahol a framing MÁR jó:**
- "Petty Cash Doesn't Balance? Here's Why + How to Fix It" ✅
- "Who Took Money From the Cash Box? Find Out Fast" ✅
- Szinte minden meta description (kérdés formátum) ✅

**Phase 3 finomított terv:**
1. **7-10 nap várakozás** (ne nyúlj semmihez, várj indexelésre)
2. **GSC újraindexelés** — 45 URL beküldése
3. **CTR elemzés ~április 1** — GSC-ben: melyik oldalaknál marad 0% CTR top 15-ös pozícióban?
4. **Title framing csere (3-5 oldal)** — CSAK a 0% CTR + top 15 oldalaknál, szituáció/pain framingre (nem keyword csere)
5. **Tartalom megerősítés** — top oldalak H2 bővítése GSC query-k alapján
6. **Backlink építés folytatása** — LinkedIn company page, Crunchbase, heti 1-2 Reddit/Quora válasz

**Egyéb változtatások (2026-03-21):**
- `404.html`: GA4 `page_not_found` custom event (page_path + referrer) — commit `d3e6145`
- `_redirects`: pricing.html, faq.html, login.html, signup.html, stb. redirectek hozzáadva
- Backlink beküldések: AlternativeTo, Capterra, WebsiteLaunches (jóváhagyás alatt)

---

### Update log - 2026-03-22 (Backlink sprint + Product Angle felismerés + Phase 4 terv)

**Backlink státusz:**
| Oldal | Státusz | DA |
|-------|---------|-----|
| SaasHub | LIVE | ~55 |
| WebsiteLaunches | LIVE | ~30 |
| G2 | LIVE | ~90 |
| SourceForge | Jóváhagyás alatt | ~85 |
| AlternativeTo | Jóváhagyás alatt | ~60 |
| Capterra | Jóváhagyás alatt | ~80 |

**GSC újraindexelés haladás:**
- 22 URL beküldve (13 Phase 1 + 9 prioritásos Phase 2)
- 11 URL holnap (what-is-petty-cash, petty-cash-does-not-balance, petty-cash-app-vs-excel, how-to-manage-petty-cash-small-business, cash-payment-received-proof, cash-receipt-template, petty-cash-reconciliation, petty-cash-voucher-template, petty-cash-log-template, petty-cash-audit-checklist, digital-receipt-book)
- 12 URL maradék — ráér, Google magától is crawlolja

**GSC pozíció elemzés (7 napos adat):**
- 8 oldal page 1-en (pozíció < 10)
- Jelentős javulások: digital-petty-cash-book (11.7→5.0), cash-drawer-reconciliation (26.3→8.3)
- Legnagyobb volumen: petty-cash-how-much-to-keep (93 megjelenés, poz. 13.1)
- Google képkeresés: 2000+ megjelenés (cash-payment-received-proof: 262, petty-cash-voucher-sample: 237)

**Kulcs felismerés — product angle:**

A SpendNote valójában nem "petty cash app" — hanem **"cash accountability tool"**: ki kezeli a pénzt, elszámolt-e, mennyi van még nála, a főnök lássa távolról. Az eredeti ötlet abból jött, hogy a founder 2 hétig keresett ilyen megoldást az LTCom-nak és nem talált.

A jelenlegi SEO oldalak "petty cash" + "receipt" + "template" kulcsszavakra céloznak — jó alap, de hiányzik az éles use case. A valós user nem "petty cash"-t keres, hanem:
- "ki kezeli a pénzt?"
- "elszámolt-e a kolléga?"
- "hogyan követem az irodai készpénzt?"
- "a főnök lássa hol a pénz"

**SEO Phase 4 terv — "Cash Accountability" angle oldalak (PLANNED, építés: ~április eleje):**

**3 core oldal (ezeket építjük):**

| # | Slug | Title angle | Target pain |
|---|------|------------|------------|
| 1 | who-has-the-cash-right-now | Who Has the Cash Right Now? Track It Instantly | Core pain — "kinél van a pénz?" |
| 2 | cash-advance-not-returned | Employee Didn't Return Cash Advance? What to Do | Konkrét szituáció — "nem adta vissza az előleget" |
| 3 | boss-cant-see-where-cash-goes | Can't See Where Your Team's Cash Goes? Fix That | Emotional trigger — főnök nem lát rá |

**+1 opcionális (ha a core 3 jól teljesít):**

| # | Slug | Title angle | Feltétel |
|---|------|------------|---------|
| 4 | track-cash-between-employees | Track Cash Between Employees — Who Gave, Who Got | Csak ha jól elkülönül a `cash-handoff-receipt`-től |

**Kanibalizáció-kezelés (finomítva 2026-03-22):**

Fontos tanulság: a kanibalizáció nem **topic overlap**, hanem **intent overlap**. Két oldal szólhat hasonló témáról, ha a user szándéka más. Aranyszabály: **1 oldal = 1 intent**.

| Tervezett | Meglévő | Topic overlap? | Intent overlap? | Verdict |
|-----------|---------|---------------|----------------|---------|
| who-has-the-cash-right-now | who-took-money-from-cash-box | Igen (cash visibility) | NEM (jelen vs múlt) | OK |
| cash-advance-not-returned | employee-cash-advance-receipt | Igen (cash advance) | NEM (probléma vs dokumentálás) | OK |
| boss-cant-see-where-cash-goes | manage-petty-cash-remotely | Igen (távoli rálátás) | NEM (pain/frusztráció vs feature) | OK, keyword elkülönítés kell |
| track-cash-between-employees | cash-handoff-receipt | Igen (pénz mozgás) | NEM (kontroll/visibility vs proof/dokumentum) | OK ha jól differenciált |

**Mi más ezekben:**
- NEM "petty cash" / "template" keyword-ök — hanem szituáció/pain alapú
- Nem template, hanem probléma-megoldás framing
- Célcsoport: irodavezető, kisvállalkozó, csapatvezető aki távolról akarja látni a pénzt
- Kiegészítik a meglévő 47 oldalt, nem helyettesítik

**Időzítés:**
1. ~~Április eleje~~ **2026-03-24: 2 core oldal megépítése** (felgyorsítva — a Google gyorsabban indexel mint vártuk, hétfő-kedden ~10 kattintás + 1 regisztráció jött)
2. Teljesítmény figyelés 2 hétig
3. Ha jól megy: további oldalak + meglévő oldalak angle finomítása

---

### Update log - 2026-03-24 (Bing keyword adat + 2 új SEO oldal építés)

**Bing Webmaster Tools adatok (értékes új insight):**

| Keyword | Pozíció | Megjelenés | Amit jelent |
|---------|---------|-----------|-------------|
| site:spendnote.app | 1.0 | 2 | Brand keresés — valaki direkt kereste |
| app for petty cash | **8.0** | 1 | Page 1! Pont ami a termék |
| i need a simple app for keeping track of petty cash | **3.0** | 1 | Page 1! Természetes nyelvi keresés |
| petty cash receipts smart capture | **6.0** | 1 | Page 1! Feature-specifikus |
| petty cash management app | **7.0** | 1 | Page 1! Direkten a termékkategória |

**Kulcs megállapítások:**
- A Bing sokkal jobban rangsorol minket mint a Google (poz 3-8 vs Google 40-50) — kevésbé függ DA-tól
- Az emberek **appot/megoldást keresnek**, NEM template-et → ez megerősíti a Phase 4 "cash accountability" irányt
- Természetes nyelvi keresések ("i need a simple app for...") → AI/Copilot keresések irányába megy, és ott erősek vagyunk
- Hiányzó keyword-ök a jelenlegi oldalakon: "app for petty cash", "petty cash management app"

**Teljesítmény frissítés (2026-03-24):**
- Hétfő-kedd: ~10 kattintás + 1 UK charity regisztráció
- A Google a vártnál gyorsabban indexelte az új title/meta-kat
- 24 órás GSC: 4 kattintás, 128 megjelenés, 3.1% CTR — eddigi legjobb nap

**2 új SEO oldal KÉSZ + deployolva + finomhangolva (2026-03-24):**

| # | Slug | Title (SERP) | H1 (on-page) | Angle |
|---|------|-------------|--------------|-------|
| 1 | `who-has-the-cash-right-now` | Simple Petty Cash Tracking App — See Who Has the Cash Now | Who Has the Cash Right Now? | Core pain: "kinél van a pénz?", problem-first sales landing |
| 2 | `boss-cant-see-where-cash-goes` | Can't See Where Your Cash Is Going? — Fix That Today | Can't See Where Your Cash Is Going? | Emotional trigger: owner frusztráció, nincs rálátás |

**Döntések:**
- `charity-cash-tracking` oldal KIHAGYVA — jogi aggály ("donation receipt" adóigazolás kockázat)
- Team feature NEM hangsúlyozva — preview módban nincs team invite/multi-user
- Owner/manager perspektíva: TE követed a pénzt, TE látsz rá
- US piac célzás ($, nem £)
- Title tag ≠ H1 szándékosan: title = SEO (SERP-ben jelenik meg), H1 = konverzió (oldalon belül)

**Finomhangolás (ChatGPT review alapján, 4 kör):**
- Hero: problem-first hook ("You gave out cash. Now you don't know where it is.")
- Copy felezve, punchline-ok félkövér/külön sorba
- CTA: "Start Tracking Your Cash" / "Track Your Cash" (nem "Create Free Account")
- "simple", "app", "track", "petty cash", "receipt" kulcsszavak finoman beszőve
- Meta description frissítve az új tónusra
- "Free to start. Plans from $19/month." mindkét CTA-nál — transzparens árazás
- Sitemap.xml-be felvéve (priority 0.9)
- Resources oldalra felvéve (Security & Controls kategória)

**Státusz (2026-03-24):**
- ✅ Deployolva (Cloudflare auto-deploy)
- ✅ GSC indexelés kérés beküldve (mindkét oldal + resources oldal)
- ✅ Sitemap frissítve
- ✅ Resources oldal frissítve (belső linkek)
- ⏳ Bing: csak landing page indexelve 4 hét után, SEO oldalakat nem — Google a fő csatorna

**Következő lépés:**
1. 2 hét teljesítmény figyelés (GSC impressions, pozíciók, CTR)
2. Ha elkap query-t poz 10-20-ban: finomítás
3. Ha beválik: `cash-advance-not-returned` + opcionálisan `track-cash-between-employees`

---

### Update log - 2026-03-29 (Domain repositioning — template cluster → pain/anti-template)

**GSC adat (legfrissebb, ~7 nap):**
- 0 kattintás az összes oldalon
- Top megjelenítések: what-is-petty-cash (30, poz 77.5), cash-receipt-template (24, poz 62.9), petty-cash-how-much-to-keep (12, poz 24.6), cash-drawer-reconciliation (12, poz 39.3)
- A template oldalak hozzák a megjelenést, de rossz intenttel (letölthető fájlt keresnek)
- A pain/accountability oldalak (boss-cant-see poz 2.0, petty-cash-reconciliation poz 3.5) jól rankelnek, de alacsony volumenű kulcsszavakra

**Stratégiaváltás: REPOSITIONING (nem szünet)**

Korábbi megközelítés: "ne nyúlj a meglévőkhöz, várjuk a backlink-eket"
Új megközelítés: **a meglévő top impression oldalakat aktívan átírjuk template → pain/anti-template angle-re**

Indoklás:
- A template queryknél soha nem fogunk nyerni (Canva DA 70-90 vs mi DA ~5)
- DE a megjelenések azt mutatják, hogy Google MUTATJA az oldalainkat — rossz pozícióban, rossz intenttel
- Ha az intentet átfordítjuk, más queryk felé pozícionáljuk az oldalakat
- Nem új oldalak kellenek — hanem a meglévők repositioning-ja

**Elvégzett átírások (2026-03-29):**

1. **`what-is-petty-cash`** (30 imp, poz 77.5 → átírva)
   - Régi: Wikipedia-stílusú "What Is Petty Cash? Definition & How It Works" — tankönyvi definíció
   - Új title: "What Is Petty Cash? — Why Most Businesses Lose Track of It"
   - Új H1: "You Have Petty Cash. Where Did It Go?"
   - Stratégia: pain-first hero ("Someone took $20, nobody wrote it down"), definíció lecsúsztatva page ~40%-ra
   - Anti-kanibalizáció: setup/start szekciók lerövidítve, linkekkel a how-to-start és how-to-manage oldalakra (nem duplikálja őket)
   - Cél queryk: "petty cash management small business", "why is petty cash missing", "petty cash system"

2. **`cash-receipt-template`** (24 imp, poz 62.9 → átírva)
   - Régi: receipt template oldal, próbált versenyezni Canva-val
   - Új title: "Cash Receipt Template? Here's Why It Breaks When You Need It"
   - Új H1: "You Downloaded a Cash Receipt Template. Now Where Is It?"
   - Stratégia: **anti-template** positioning — nem template-et adunk, hanem megmutatjuk miért szar a template
   - Új blokkok: "What You're Actually Looking For" (intent mapping), "The Template Trap", comparison table feljebb húzva, "A Template Is a File. Cash Tracking Is a System." (hard positioning)
   - Anti-kanibalizáció: kihagytam a keyword lista blokkot ("petty cash log", "cash tracking system") mert direkt kanibalizálná a petty-cash-log-template és how-to-track oldalalakat
   - Cél queryk: "prove cash payment", "stop losing receipts", "cash receipt system", "receipt legally valid"

**Prioritási lista (következő batch-ek):**

🔴 **Batch 2 (2-3 nap várakozás után):**
- `petty-cash-voucher-template` (378 megjelenés) — legnagyobb volumen, anti-template átírás
- `petty-cash-voucher-sample` (187 megjelenés) — együtt kezelni a voucher template-tel
- `petty-cash-log-template` (137 megjelenés) — kulcs oldal, log = tracking → legközelebb a termékhez

🟡 **Batch 3 (utána):**
- `cash-refund-receipt` (138 megjelenés) — pain irányba vihető
- `how-to-manage-petty-cash-small-business` (120 megjelenés) — túl általános, nehéz

🟢 **Ne nyúlj hozzá (jó pozícióban vannak):**
- `petty-cash-how-much-to-keep` (poz 14.2) — érintés nélkül hagyni
- `cash-drawer-reconciliation` (poz 25.6) — jó irány
- `employee-cash-advance-receipt` (poz 21.1) — use case, békén hagyni
- `boss-cant-see-where-cash-goes` (poz 2.0) — page 1, ne bántsd
- `petty-cash-reconciliation` (poz 3.5) — page 1
- `two-person-cash-count-policy` (poz 4.7) — page 1

**Template → anti-template átírási sablon:**
1. H1: pain-based, nem keyword-based ("You downloaded X. Now where is it?")
2. Első szekció: konkrét szituáció/probléma, NEM definíció
3. Comparison table: feljebb a page-en (top 30%)
4. Hard positioning blokk: "A template is a file. Tracking is a system."
5. Intent mapping: "What you're actually looking for" — long-tail query capture
6. Definíció/magyarázat: lejjebb (30-40%), linkelve a specialista oldalakra
7. FAQ: anti-template angle, "How do I stop losing X?" típusú kérdések
8. Kanibalizáció-check minden bejegyzésnél: ne célozz más meglévő oldal elsődleges kulcsszavát

---

### Update log - 2026-03-26 (SEO szünet + Google Ads terv) — FELÜLÍRVA fent

**SEO valóság-ellenőrzés (28 napos adat):**
- 49 indexelt oldal, 16 kattintás összesen, 3 regisztráció (18.75% signup rate)
- Átlagos pozíció ~53 — a "template" kulcsszavak poz 50-100-on ragadtak
- A homepage poz 7.9, CTR 16.7% — de a legtöbb oldal láthatatlan
- A freshness boost-ok (title átírás, új oldalak) mindig 1-2 napig tartottak, utána visszaesés
- Bing: 19 crawl request/hét, szinte semmit nem indexel a homepage-en kívül

**Kulcs felismerés (továbbra is érvényes):**
- A DA ~5 domain-nel a "template" kulcsszavak (Canva DA 70, Template.net DA 90) **elérhetetlen** versenyzők
- Még több SEO oldal NEM oldja meg az alap problémát (alacsony DA)
- Az SEO **hosszú távú befektetés** (6-12 hónap) — nem rövid távú növekedési motor
- A backlink-ek (G2 DA 90, SourceForge DA 85, AlternativeTo DA 60, Capterra DA 80) idővel emelhetik a DA-t, de ez hónapok kérdése
- **ÚJ felismerés (2026-03-29):** a meglévő oldalak intentjét kell átfordítani, nem újakat építeni

**Döntés: SEO REPOSITIONING (korábban: SZÜNET)**
- ~~Nem nyúlunk a meglévő oldalakhoz~~ → AKTÍVAN átírjuk a top impression oldalakat
- SEO Batch 2 (7 Service Provider + 3 Excel) → **HALASZTVA** határozatlan időre
- Daily Cash Tracking klaszter → **HALASZTVA**
- Phase 5 Nonprofit → **HALASZTVA**
- Az SEO oldalak a háttérben dolgoznak, a backlink-ek érnek, a DA lassan nő

**Új növekedési csatorna: Google Ads (Stripe élesítés után)**
- **Budget:** $10/nap, $300/hó keret
- **Kulcsszavak (app intent):**
  - "petty cash app"
  - "cash tracking app"
  - "petty cash tracking app"
  - "simple petty cash software"
  - "track cash payments app"
- **Negative keywords:** "free template", "excel", "download", "printable"
- **Landing page-ek (A/B teszt):**
  - `who-has-the-cash-right-now` — core pain framing
  - `boss-cant-see-where-cash-goes` — emotional trigger framing
- **Geotargeting:** US + UK
- **Becsült eredmény:** $2/klikk → ~150 klikk/hó → 18.75% signup rate → ~28 reg/hó
- **Cél:** validáció — fizetnek-e? Hol akadnak el? Melyik landing konvertál jobban?
- **Mellékhatás SEO-ra:** user jelzések (engagement, visszajárás, brand keresések) javítják az organikus pozíciókat is

**Az Ads landing page-ekre tett oldalak értékelése:**
- A Phase 4 oldalak (who-has-the-cash, boss-cant-see) a legjobb oldalak a site-on: problem-first copy, szituáció framing, erős CTA, use case boxok, konkrét "30 seconds" messaging
- Ezek hirdetés mögé is tökéletesek — nem a homepage-re irányítunk, hanem ezekre

**Sorrend:**
1. Stripe QA (hétvége, 2026-03-29/30)
2. Stripe élesítés (adószám után)
3. Google Ads indítás
4. Onboarding/retention javítás (30+ regisztráció adatai alapján)
5. SEO-hoz visszatérés (április közepe — GSC adat + backlink eredmények kiértékelése)

---

### Update log - 2026-03-29 (Gemini pain SEO ötletek — szűrt, stratégiához illő)

**Forrás:** Gemini brainstorm, szűrve a meglévő pain/anti-template irányhoz.
**Státusz:** ÖTLETBANK — nem építjük most, de a következő SEO fázisban (április közepe) innen válogatunk.

**3 fő pain SEO tartalomtípus (Gemini javaslat, illeszkedik a Phase 4 irányhoz):**

#### 1. "How to fix..." — Elszámolási pánik oldalak
Célcsoport: menedzser/tulajdonos akinek nem stimmel a kassza, hónap végi/műszak végi pánik.

| Keyword target | Angle |
|----------------|-------|
| how to handle missing petty cash receipts | Hiányzó bizonylat → prevenció SpendNote-tal |
| what to do when the cash drawer is short | Kassza mínuszban → nyomozás helyett prevenció |
| employee lost cash receipt accounting steps | Elveszett blokk → digitális megoldás |
| how to track cash handoffs between employees | Alkalmazottak közötti átadás nyomon követése |

Oldal struktúra: Validáld a pánikot → probléma gyökere (lusta admin, "majd később felírom") → hagyományos (rossz) megoldás → SpendNote mint 30 másodperces prevenció → FAQ.

**Kanibalizáció-check szükséges:** `how to track cash handoffs` vs `cash-handoff-receipt` (LIVE) és `track-cash-between-employees` (planned Phase 4).

#### 2. "Miért szar amit most használsz" — Alternatíva/migráció oldalak
Célcsoport: aktívan váltani akaró user aki utálja az Excel-t/papírt.

| Keyword target | Angle |
|----------------|-------|
| why Excel is bad for petty cash management | Excel fájdalom → SpendNote mint alternatíva |
| paper receipt book alternatives | Fizikai tömb kiváltása → digitális |
| digital petty cash voucher system | Papír voucher → digitális rendszer |
| automated cash receipt generator vs Word templates | Word sablon vs valódi generátor |

Oldal struktúra: Hook (papír elveszik, Excel nem nyílik meg telefonon) → rejtett költségek (könyvelő ideje) → összehasonlító táblázat (régi vs új) → SpendNote pitch → FAQ (biztonság, export, könyvelő elfogadja-e).

**Megjegyzés:** `petty-cash-app-vs-excel` (LIVE) már fedi az Excel angle-t. Ezek inkább **kiegészítő** oldalak más intenttel (paper book, Word template, voucher system).

#### 3. Iparág-specifikus pain oldalak
Célcsoport: konkrét iparág + konkrét készpénzes fájdalom.

| Keyword target | Iparág | Pain |
|----------------|--------|------|
| restaurant cash drawer shift change log | Vendéglátás | Műszakváltás kassza káosz |
| construction daily cash expense tracking | Építőipar | Munkásoknak kiadott reggeli készpénz, nincs blokk |
| event cash collection documentation | Rendezvény | Ajtónál beszedett pénz átláthatósága |

Oldal struktúra: Konkrét iparági szituáció → miért nem működnek standard sablonok → SpendNote (mobil, helyszíni, 30 mp) → iparág-specifikus CTA.

**Megjegyzés:** `construction-site-petty-cash` (LIVE) és `event-cash-handling` (LIVE) már léteznek. Ezek a pain angle-t erősítenék MELLETTÜK, nem helyettük. Kanibalizáció-check kötelező.

#### Engineering as Marketing — interaktív SEO eszköz ötlet (LATER)
- **Petty Cash Calculator** — egyszerű egyoldalas tool, Google szereti az interaktív tartalmat
- **Vízjeles PDF receipt generátor** — mini tool, regisztráció nélkül is használható, CTA a teljes verzióra
- Ezek a `seoplan.md` "5. Tool SEO oldalak" szekciójában már tervezve vannak, de még nem épültek meg
- **Prioritás:** alacsony — először a pain repositioning és Ads validáció, utána eszközök

#### KIHAGYVA (nem illeszkedik a stratégiához most):
- ❌ **Programmatic SEO (pSEO)** — 400 klónozott oldal túl korai DA ~5-nél, Google thin content-nek értékelné
- ❌ **Glossary/szótár stratégia** — top-of-funnel, nem konvertál, és a meglévő "what-is-petty-cash" oldal már fedi az edukációs intentet
- ❌ **Közösségi média / fórum** — a stratégiánk kizárja (csak saját csatornák)

---

### Update log - 2026-03-23 (UK charity signup + nonprofit szegmens + Phase 5 terv)

**Új signup validáció:**
UK-s jótékonysági szervezet regisztrált, céges emailmel. Első valódi "target user":
- Fizetőképes piac (UK), céges domain, szervezet ami készpénzzel dolgozik
- Valószínűleg a title/meta változtatások hatására talált ránk (GSC-ben ellenőrizni)
- Nonprofit/charity szegmens: sok készpénz, kis kifizetések, elszámolási kötelezettség, önkéntesek

**Meglévő charity/nonprofit tartalom (már van, de nem dedikált):**
- `event-cash-handling.html` — "Fundraisers & Charity Events" szekció
- `school-money-collection-tracker.html` — volunteer/treasurer angle
- `custom-cash-receipt-with-logo.html` — "Clubs, Organizations & Nonprofits" szekció
- `petty-cash-how-much-to-keep.html` — "Nonprofit / community org" sor a táblázatban

**SEO Phase 5 terv — Nonprofit/Charity szegmens oldalak (PLANNED):**

| # | Slug | Title angle | Target |
|---|------|------------|--------|
| 1 | charity-cash-tracking | Track Cash at Your Charity — Every Pound Accounted For | Általános charity cash management |
| 2 | nonprofit-petty-cash | Nonprofit Petty Cash — Simple Rules for Small Teams | Petty cash nonprofit-oknak |
| 3 | fundraiser-cash-handling | Fundraiser Cash Handling — Receipt Every Transaction | Gyűjtések, események, bake sale |
| 4 | church-cash-management | Church Cash Management — Track Offerings & Expenses | Egyházi pénzkezelés (nagy US piac) |
| 5 | volunteer-cash-receipt | Volunteer Cash Receipt — Proof for Every Handoff | Önkéntesek közötti pénz mozgás |

**JOGI KORLÁT — KRITIKUS:**
- **NEM használunk** "donation receipt" / "donation proof" / "gift aid receipt" kifejezéseket
- Sok országban (UK Gift Aid, US IRS 501(c)(3), EU) a "donation receipt" adóigazolás, szabályozott dokumentum
- A SpendNote NEM adóigazolást generál — hanem belső elszámolási bizonylatot
- **Biztonságos kifejezések:** cash receipt, payment receipt, transaction record, proof of payment, cash tracking
- **Minden charity SEO oldalon disclaimer kell:** "This is not a tax receipt or official donation acknowledgment"

**Kanibalizáció-check:**
- `charity-cash-tracking` vs `event-cash-handling`: OK — az event page esemény-specifikus, a charity page szervezet-specifikus
- `fundraiser-cash-handling` vs `event-cash-handling`: ÓVATOS — van átfedés a fundraiser szekciónál. Megoldás: a fundraiser page a tervezés/szabályokra fókuszál, az event page a napi lebonyolításra
- `volunteer-cash-receipt` vs `cash-handoff-receipt`: OK — más célcsoport (nonprofit önkéntes vs üzleti alkalmazott)

**Időzítés:** Phase 4 (cash accountability) után, ~április közepe-vége. Először 2 oldalt építünk (charity-cash-tracking + nonprofit-petty-cash), a többit teljesítmény alapján.

---

### Update log - 2026-03-14 (weekend batch — 5 new SEO pages, indexed)

1. **Created 5 new SEO pages — all live (index, follow), indexed in Google Search Console:**
   - `what-is-petty-cash.html` — Educational/Definition page (ChatGPT SEO terv, Cluster R)
     - Keywords: what is petty cash, petty cash definition, petty cash example
     - Snippet bait: clear definition sentence + "Petty Cash Example" H2 with mini table
     - Images: generic app screenshots (dashboard multi-box, transaction modal)
     - CTA: "Start Tracking Petty Cash" (hero) / "Create Free Account" (mid-page)
   - `where-to-keep-petty-cash.html` — Security/Storage page (Idea Round 5 #1)
     - Keywords: where to keep petty cash, petty cash storage, petty cash storage policy
     - Snippet bait: "Where Should Petty Cash Be Stored?" H2, checklist block, policy example
     - Images: generic app screenshots (multi-box dashboard)
     - CTA: "Track Your Cash Box Digitally" (hero) / "Create Free Account" (mid-page)
   - `petty-cash-security-tips.html` — Security/Process page (Idea Round 5 #2)
     - Keywords: petty cash security tips, petty cash internal controls, petty cash fraud examples
     - Snippet bait: "Petty Cash Internal Controls" H2, "Security Policy Example" section, "Fraud Examples" table
     - Images: generic app screenshots (transaction detail with receipt)
     - CTA: "Digital Security for Physical Cash" (mid-page) / "Create Free Account"
   - `two-person-cash-count-policy.html` — Process/Policy page (Idea Round 4 #13)
     - Keywords: two person cash count, dual control cash counting policy
     - Features: PDF download button (jsPDF) with real SpendNote logo, sign-off template
     - Images: generic app screenshots (filtered transactions report)
     - CTA: "Start Dual Control Tracking" (hero) / "Create Free Account" (mid-page)
   - `petty-cash-how-much-to-keep.html` — Educational/Calculator page (Idea Round 2 #4)
     - Keywords: how much petty cash to keep, petty cash float formula
     - Snippet bait: "Petty Cash Float Formula" H2, float sizing table by business type
     - Images: generic app screenshots (transactions dashboard)
     - CTA: "Track Your Petty Cash Spending" (hero) / "Create Free Account" (mid-page)

2. **All 5 pages include:**
   - Article + FAQPage structured data (4 unique FAQ items each)
   - Meta description ≤ 160 characters, title ≤ 60 characters
   - Disclaimer box (not accounting/tax/invoicing)
   - Related Resources internal link block (6 cards each)
   - Keyword-rich hero subtitle
   - SEO-optimized H2s with snippet bait keywords
   - Intent-matching CTA texts
   - In-context internal links in body copy
   - Footer with Cookie Settings link (main.js)

3. **SEO enhancements applied (snippet bait optimization):**
   - what-is-petty-cash: added clear definition sentence + "Petty Cash Example" H2 + mini expense table
   - where-to-keep-petty-cash: added "Where Should Petty Cash Be Stored?" H2 + 7-item checklist + "Storage Policy Example"
   - petty-cash-security-tips: added "Petty Cash Internal Controls" H2 + "Security Policy Example" + "Fraud Examples" table (5 fraud types)
   - petty-cash-how-much-to-keep: renamed H2 to "Petty Cash Float Formula" for keyword targeting
   - two-person-cash-count-policy: added PDF download with real SpendNote logo, improved line spacing

4. **Cannibalization check:**
   - what-is-petty-cash ≠ how-to-start-petty-cash-box (definition/education vs first-time setup checklist)
   - where-to-keep-petty-cash ≠ petty-cash-security-tips (storage location vs security controls/fraud)
   - two-person-cash-count-policy ≠ cash-count-sheet-template (dual control policy vs denomination count sheet)
   - petty-cash-how-much-to-keep ≠ how-to-start-petty-cash-box (float sizing formula vs general setup)
   - petty-cash-security-tips ≠ petty-cash-audit-checklist (daily security tips vs audit process)

5. **Sitemap updated:** 5 new URLs added with `lastmod: 2026-03-14`.

6. **Indexing:** All 5 pages set to `index, follow` and submitted for indexing in Google Search Console.

7. **Indexing status updated:** 41 → 46 indexable pages.

---

### Update log - 2026-03-08 (batch 3 — 6 new pages)

1. **Created 6 new SEO pages — all live (index, follow):**
   - `digital-receipt-book.html` — Process/Feature page (Planned #17)
     - Keywords: digital receipt book, paperless receipt book, replace paper receipt book
     - Images: generic app screenshots (receipt view, transaction modal, dashboard)
     - CTA: "Start Your Digital Receipt Book" (hero) / "Create Free Account" (mid-page)
   - `cash-count-sheet-template.html` — Process/Feature page (Planned #18)
     - Keywords: cash count sheet template, denomination count sheet, bill and coin count
     - Images: generic app screenshots (dashboard, filter modal, transaction list)
     - CTA: "Start Counting Digitally" (hero) / "Create Free Account" (mid-page)
   - `petty-cash-replenishment-form.html` — Process/Feature page (Planned #19)
     - Keywords: petty cash replenishment form, petty cash top up, refill petty cash
     - Images: generic app screenshots (transaction entry, receipt, dashboard)
     - CTA: "Track Replenishments Digitally" (hero) / "Create Free Account" (mid-page)
   - `cash-paid-out-log.html` — Process/Feature page (Planned #22)
     - Keywords: cash paid out log, cash disbursement log, paid out slip
     - Images: generic app screenshots (transaction list, receipt view, PDF export)
     - CTA: "Start Your Cash Paid Out Log" (hero) / "Create Free Account" (mid-page)
   - `how-to-start-petty-cash-box.html` — Beginner/Educational page (Idea Round 3 #8)
     - Keywords: how to start petty cash box, first time petty cash setup, petty cash checklist
     - Images: generic app screenshots (dashboard, transaction entry, receipt)
     - CTA: "Start Your Petty Cash Box Digitally" (hero) / "Create Free Account" (mid-page)
     - **Note:** Rewritten to "first-time setup checklist" angle to avoid cannibalization with `how-to-manage-petty-cash-small-business.html`
   - `manage-petty-cash-remotely.html` — Feature/USP page (Idea Round 5 #4)
     - Keywords: manage petty cash remotely, track petty cash from home, remote cash visibility
     - Images: generic app screenshots (dashboard, mobile view, receipt)
     - CTA: "Start Remote Cash Tracking" (hero) / "Create Free Account" (mid-page)
     - **Note:** Also linked from `index.html` landing page ("Access anywhere" feature description)

2. **All 6 pages include:**
   - Article + FAQPage structured data (4 unique FAQ items each)
   - Meta description ≤ 160 characters, title ≤ 60 characters
   - Disclaimer box (not accounting/tax/invoicing)
   - Related Resources internal link block (6 cards each)
   - Keyword-rich hero subtitle
   - SEO-optimized H2s
   - Intent-matching CTA texts
   - In-context internal links in body copy
   - Unique footer SVG gradient IDs

3. **Cannibalization check & resolution:**
   - digital-receipt-book ≠ digital-petty-cash-book (receipt book replacement vs digital cash book)
   - cash-count-sheet ≠ cash-drawer-reconciliation (denomination count vs end-of-shift reconciliation)
   - petty-cash-replenishment ≠ how-to-manage (replenishment form process vs full management guide)
   - cash-paid-out-log ≠ petty-cash-log-template (outflows only vs full in/out log)
   - how-to-start-petty-cash-box — **REWRITTEN** to "first-time setup checklist" angle to avoid overlap with how-to-manage-petty-cash-small-business
   - manage-remotely ≠ any existing page (unique angle: remote/off-site cash visibility)

4. **Internal linking updates:**
   - Added internal links from 26 existing SEO pages to the 6 new pages
   - Both "Also see" paragraph style and in-context body links used
   - Added link from `index.html` landing page to `manage-petty-cash-remotely.html` using `class="feature-inline-link"`

5. **Sitemap updated:** 6 new URLs added with `lastmod: 2026-03-08`.

6. **Indexing status updated:** 35 → 41 indexable pages.

---

### Update log - 2026-03-08 (batch 2 — 6 new pages)

1. **Created 6 new SEO pages — all live (index, follow):**
   - `petty-cash-does-not-balance.html` — Panic/Problem page (Planned #12)
     - Keywords: petty cash doesn't balance, petty cash doesn't add up, cash box short
     - Images: generic app screenshots (dashboard, filtered view, receipt detail)
     - CTA: "Start Tracking Cash Properly" (hero) / "Create Free Account" (mid-page)
   - `how-to-manage-petty-cash-small-business.html` — Educational hub page (Planned #24)
     - Keywords: how to manage petty cash small business, petty cash management guide
     - Images: generic app screenshots (dashboard, transaction modal, receipt)
     - CTA: "Start Managing Petty Cash" (hero) / "Create Free Account" (mid-page)
   - `cash-discrepancy-between-shifts.html` — Panic/Problem page (Planned #14)
     - Keywords: cash discrepancy between shifts, shift change cash shortage
     - Images: generic app screenshots (transaction history, receipt, dashboard)
     - CTA: "Start Shift-Level Cash Tracking" (hero) / "Create Free Account" (mid-page)
   - `how-to-track-cash-payments.html` — Educational guide (Planned #23)
     - Keywords: how to track cash payments, cash payment tracking guide
     - Images: generic app screenshots (receipt, dashboard, PDF export)
     - CTA: "Start Tracking Cash Payments" (hero) / "Create Free Account" (mid-page)
   - `who-took-money-from-cash-box.html` — Panic/Problem page (Planned #13)
     - Keywords: who took money from cash box, petty cash theft, cash box accountability
     - Images: generic app screenshots (audit trail, transaction detail, dashboard)
     - CTA: "Start Cash Box Accountability" (hero) / "Create Free Account" (mid-page)
   - `cash-refund-receipt.html` — Receipt use case page (Idea Round 6 #5)
     - Keywords: cash refund receipt, proof of cash refund, refund documentation
     - Images: generic app screenshots (receipt view, transaction entry, dashboard)
     - CTA: "Create Free Refund Receipt" (hero) / "Create Free Account" (mid-page)

2. **All 6 pages include:**
   - Article + FAQPage structured data (4 unique FAQ items each)
   - Meta description ≤ 160 characters, title ≤ 60 characters
   - Disclaimer box (not accounting/tax/invoicing)
   - Related Resources internal link block (6 cards each)
   - Keyword-rich hero subtitle
   - SEO-optimized H2s
   - Intent-matching CTA texts
   - Unique footer SVG gradient IDs

3. **Cannibalization check:**
   - petty-cash-does-not-balance ≠ petty-cash-reconciliation (panic diagnosis vs scheduled reconciliation process)
   - how-to-manage ≠ petty-cash-policy-template (full management guide vs policy document)
   - cash-discrepancy-between-shifts ≠ cash-handoff-receipt (shift mismatch diagnosis vs handoff documentation)
   - how-to-track-cash ≠ petty-cash-log-template (educational guide vs template showcase)
   - who-took-money ≠ cash-handoff-receipt (theft/trust problem vs routine handoff)
   - cash-refund-receipt ≠ cash-payment-received-proof (outgoing refund vs incoming payment)

4. **Sitemap updated:** 6 new URLs added with `lastmod: 2026-03-08`.

5. **Indexing status updated:** 29 → 35 indexable pages.

---

### Update log - 2026-03-08 (batch 1 — 4 new pages)

1. **Created 4 new SEO pages — all live (index, follow):**
   - `petty-cash-app-vs-excel.html` — Excel/Spreadsheet comparison page (Planned #11)
     - Keywords: petty cash app vs excel, spreadsheet vs app
     - Images: generic app screenshots (dashboard, transaction modal, receipt, PDF export)
     - CTA: "Start Free Cash Log" (hero) / "Create Free Account" (mid-page)
   - `construction-site-petty-cash.html` — Industry-specific page (Planned #15)
     - Keywords: construction site petty cash, job site cash tracking, crew expenses
     - Images: contractor folder (dashboard, transaction entry, receipt, history)
     - CTA: "Start Tracking Site Cash" (hero) / "Track Job Site Cash Free" (mid-page)
   - `petty-cash-audit-checklist.html` — Process/Feature page (Planned #21)
     - Keywords: petty cash audit checklist, how to audit petty cash, verify balances
     - Images: generic app screenshots (filtered report, PDF export, transaction detail)
     - CTA: "Start Audit-Ready Tracking" (hero) / "Create Free Account" (mid-page)
   - `daily-cash-report-template.html` — Process/Feature page (Planned #16)
     - Keywords: daily cash report template, end-of-day cash report, opening/closing balance
     - Images: generic app screenshots (dashboard, filter modal, PDF export)
     - CTA: "Start Daily Cash Reports" (hero) / "Create Free Account" (mid-page)

2. **All 4 pages include:**
   - Article + FAQPage structured data (4 unique FAQ items each)
   - Meta description ≤ 160 characters, title ≤ 60 characters
   - Disclaimer box (not accounting/tax/invoicing)
   - Related Resources internal link block (6 cards each) — boosts internal link network
   - Keyword-rich hero subtitle (SEO sentence under the marketing hook)
   - SEO-optimized H2s ("How to Track...", "How to Audit...", "How to Prepare...")
   - Intent-matching CTA texts (not generic "Try Free")
   - In-context internal links in body copy (audit page links to log, tracker, reconciliation)
   - Unique footer SVG gradient IDs

3. **Sitemap updated:** 4 new URLs added with `lastmod: 2026-03-08`.

4. **Indexing status updated:** 25 → 29 indexable pages.

5. **Cannibalization check:**
   - app-vs-excel ≠ digital-petty-cash-book (comparison angle vs tool showcase)
   - construction ≠ contractor-advance-receipt (site-level cash management vs single receipt)
   - audit-checklist ≠ reconciliation (full audit process vs balance matching)
   - daily-cash-report ≠ cash-drawer-reconciliation (daily summary vs end-of-shift count)

6. **SEO enhancements applied to all 4 pages after initial creation:**
   - Added keyword-rich hero sentences for better on-page keyword density
   - Upgraded H2s to match high-volume search queries
   - Changed CTA texts to intent-matching variants
   - Added in-context internal links (not just Related Resources block)

---

### Update log - 2026-03-06 (batch 2)

1. **Created 6 new SEO draft pages (noindex, nofollow):**
   - `handyman-cash-payment-receipt.html` — service provider segment, reuses contractor images
   - `tutor-cash-payment-receipt.html` — service provider segment, reuses babysitter images
   - `employee-cash-advance-receipt.html` — employer/HR segment, reuses contractor images
   - `school-money-collection-tracker.html` — community/group segment, reuses generic dashboard images
   - `cash-deposit-receipt.html` — landlord/vendor segment, reuses generic receipt images
   - `custom-cash-receipt-with-logo.html` — feature-focused page, reuses contractor + generic images

2. **Cannibalization check:**
   - Each page targets a distinct search intent not covered by existing pages.
   - handyman ≠ contractor (different service, different client type)
   - tutor ≠ babysitter (different service, different payment context)
   - employee advance ≠ contractor advance (internal vs external, payroll vs project)
   - school collection ≠ event cash handling (ongoing collection vs one-time event)
   - deposit receipt ≠ payment receipt (refundable deposit vs service payment)
   - custom logo receipt ≠ receipt template (branding feature vs general template)

3. **All 6 pages include:**
   - Article + FAQPage structured data
   - 4 unique FAQ items each
   - Meta description ≤ 160 characters
   - Title ≤ 60 characters
   - Disclaimer box (not invoice/tax/accounting)
   - Internal links to related (but different) existing pages
   - Unique footer SVG gradient IDs to avoid conflicts

4. **Draft page count updated:** 1 → 7

---

### Update log - 2026-03-06

1. **Deleted 3 obsolete draft pages:**
   - `petty-cash-receipt-template.html` — replaced by petty-cash-receipt-generator
   - `cash-receipt-book.html` — old initiative, no longer needed
   - `carbonless-receipt-book-alternative.html` — old initiative, no longer needed

2. **seoplan.md inventory corrected:**
   - Fixed `petty-cash-receipt-generator.html` status: was listed as 🔒 DRAFT, actually `index, follow` (live).
   - Fixed `cash-handoff-receipt.html` status: was listed as 🔒 DRAFT, actually `index, follow` (live).
   - Updated indexable count: 17 → 19.
   - Removed deleted pages from Cluster 2 and Cluster 4.
   - Draft pages reduced: 6 → 1 (only spendnote-pricing.html remains intentionally noindex).

3. **FAQPage schema added:**
   - `cash-handoff-receipt.html` — 3 Q&A pairs based on page content.

4. **OG/Twitter image fixes (generic jpg → seo-specific webp):**
   - `small-business-cash-receipt.html` → `spendnote-cash-receipt-printable-proof-of-cash-handoff.webp`
   - `cash-drawer-reconciliation.html` → `spendnote-office-petty-cash-transactions-dashboard.webp`
   - `event-cash-handling.html` → `spendnote-dashboard-multiple-cash-boxes-overview.webp`

---

### Update log - 2026-03-05

1. **3 new SEO pages finalized and published as indexable:**
   - `/contractor-advance-payment-receipt`
   - `/cash-payment-received-proof`
   - `/babysitter-cash-payment-receipt`
   - Robots switched from `noindex, nofollow` to `index, follow`.

2. **Sitemap updated (`sitemap.xml`):**
   - Added all 3 URLs above with `lastmod: 2026-03-05`.

3. **Structured data improvements:**
   - Added `FAQPage` schema to:
     - contractor-advance-payment-receipt.html
     - cash-payment-received-proof.html
     - babysitter-cash-payment-receipt.html
   - Added `FAQPage` schema to:
     - spendnote-pricing.html
     - petty-cash-receipt-template.html

4. **Social snippet consistency fixes:**
   - Updated OG/Twitter image targets on the 3 new pages to use scenario-specific screenshots.

5. **Homepage internal-link graph improvement:**
   - Added link from homepage reassurance line:
     - "Receipts document the cash handoff - not invoices."
     - target: `/cash-payment-received-proof`

6. **Bing SEO warning cleanup:**
   - Shortened title/meta description (and aligned OG/Twitter snippets where needed) for:
     - contractor-advance-payment-receipt.html
     - cash-payment-received-proof.html
     - babysitter-cash-payment-receipt.html
   - Goal: clear Bing warnings for overly long snippet fields.

1. Normalize positioning language:
   - internal cash control,
   - handoff proof,
   - team accountability,
   - explicit “not POS/accounting replacement” where relevant.
2. Resolve indexability mismatch:
   - keep `noindex` during draft stage,
   - switch eligible pages to `index, follow` only when content is finalized.
3. Refresh per-page metadata:
   - title uniqueness,
   - intent-matched meta description,
   - consistent OG/Twitter summary.
4. Strengthen internal links:
   - cross-link between related SEO pages + pricing + FAQ + signup CTA.
5. Re-submit for indexing after updates:
   - URL inspection + request indexing in Search Console.

---

## 7-Day Mini SEO Sprint (30-60 min/day)

### Day 1 - Indexing foundation
1. In Search Console, run live test + request indexing for:
   - `https://spendnote.app/`
   - `https://spendnote.app/spendnote-faq.html`
2. Re-submit sitemap.
3. Confirm one canonical host strategy (`www` vs non-`www`) and keep it consistent.

**KPI:** 2 core URLs submitted for indexing.

### Day 2 - Choose 2 launch SEO pages
1. Pick 2 strongest intent pages (e.g. template + handoff).
2. Remove `noindex` only on these 2 pages.
3. Verify title/meta/H1 alignment for primary query intent.

**KPI:** 2 SEO pages set to indexable.

### Day 3 - On-page upgrade
For each of the 2 pages:
1. Reach ~600-1200 words with concrete use-case sections.
2. Keep one clear CTA above the fold and one near bottom.
3. Add an FAQ block (3-5 questions).
4. Add 2-4 relevant images with descriptive alt text.

**KPI:** each page covers 1 primary keyword + 3 long-tail variants.

### Day 4 - Internal link graph
1. Link both SEO pages from homepage.
2. Link both from FAQ where context fits.
3. Add links back from SEO pages to homepage, pricing, FAQ, and signup CTA.

**KPI:** minimum 3 relevant internal links per SEO page.

### Day 5 - Image SEO (receipt samples only)
1. Publish anonymized/public sample receipt images (no real customer data).
2. Use descriptive filenames (e.g. `cash-receipt-template-example.png`).
3. Ensure real `<img>` placement on indexable pages (not sitemap-only).
4. Keep ImageObject schema as support signal.
5. Add image sitemap entries if available.

**KPI:** 3+ crawlable, indexable sample image URLs.

### Day 6 - Lightweight off-page signals
1. Publish 3-5 relevant mentions/links:
   - founder LinkedIn post,
   - 1-2 niche communities,
   - 1 startup directory/listing.
2. Use UTM tags to track referral impact.

**KPI:** at least 3 external mentions/links.

### Day 7 - Measure and adjust
1. Review Search Console performance:
   - queries,
   - impressions,
   - average position,
   - clicks.
2. Tune titles/meta on top pages based on real queries.
3. Choose one page to double down next week.

**KPI target for week 1:**
- Impressions: 20-200
- Clicks: 1-10
- If 0 clicks but impressions exist: keep direction, improve snippet + intent match.

---

## ChatGPT SEO terv - kulon megbeszelesi blokk

```text
Spendnote – Product-Led SEO Stratégia (v1)
1. Alap pozicionálás (kritikus guardrail)

A Spendnote nem:

accounting software

POS rendszer

invoicing tool

A Spendnote:

Internal cash control + receipt proof + team audit trail

Kulcs üzenetek:

internal cash tracking

handoff proof

team accountability

receipt infrastructure

Ez fontos, mert különben a Google rossz kategóriába sorolja.

2. A SEO Funnel modell

A Spendnote SEO-ja három rétegre épül.

Layer 1 – TOOL oldalak

Cél: traffic generálás

Felhasználó gyors eszközt keres.

Példák:

petty cash calculator

cash receipt generator

deposit receipt generator

petty cash reconciliation tool

Oldal struktúra:

mini tool

instant preview

CTA → Spendnote

Layer 2 – TEMPLATE oldalak

Cél: search intent lefedése

Felhasználó template-et keres.

Példák:

petty cash receipt template

petty cash voucher template

petty cash log template

cash receipt template

rent receipt template

Oldal struktúra:

template preview

rövid magyarázat

generator

CTA

Layer 3 – PROBLEM oldalak

Cél: konverzió

Felhasználó konkrét problémát keres.

Példák:

petty cash does not balance

who took money from cash box

cash discrepancy between shifts

replace petty cash spreadsheet

Oldal struktúra:

probléma

miért történik

megoldás

Spendnote mint eszköz

3. Prioritás – első 15 SEO oldal
Excel replacement

replace-petty-cash-spreadsheet

petty-cash-app-vs-excel

Pánik keresések

petty-cash-does-not-balance

who-took-money-from-cash-box

cash-discrepancy-between-shifts

Audit / admin

petty-cash-audit-checklist

missing-petty-cash-receipts-tax

Operational use cases

shift-cash-handover-log

cash-paid-out-log

petty-cash-sign-out-sheet

Core template oldalak

petty-cash-voucher-template

petty-cash-log-template

cash-receipt-template

Industry use cases

restaurant-petty-cash-tips

construction-site-petty-cash

4. Generator SEO univerzum

Ez a Spendnote egyik legerősebb SEO iránya.

Receipt Generator oldalak

cash-receipt-generator

petty-cash-receipt-generator

deposit-receipt-generator

payment-received-receipt

cash-handover-receipt-generator

rent-payment-receipt-template

iou-receipt-generator

cash-loan-receipt

Generic high-volume generator oldalak (ÚJ — tool intent, nagy keresési volumen)

Ezek a legáltalánosabb, legnagyobb forgalmú "generator" kulcsszavak.
A SERP-ben kevés valódi SaaS tool van — többnyire PDF/Word sablonok → könnyebb rankelni.

- receipt-generator — a legáltalánosabb, legnagyobb volumen
- payment-receipt-generator — fizetési bizonylat generátor
- proof-of-payment-generator — fizetés igazolása
- refund-receipt-generator — visszatérítési bizonylat
- cash-receipt-generator — (már fent van, de generic landing page kell hozzá)

Ezek mind külön SEO oldalak lehetnek, mindegyik:
- mini tool / instant preview
- CTA → SpendNote signup
- FAQ szekció a long-tail lefedéséhez

"Cash received" kulcsszó klaszter (ÚJ)

A "cash received" intent nagyon közel áll a SpendNote core funkciójához: valaki pénzt kap, és azonnal bizonylatot ad róla.

Célkulcsszavak:
- cash-received-receipt — bizonylat arról, hogy pénzt kaptam
- cash-received-confirmation — megerősítés, hogy a pénz megérkezett
- cash-received-template — sablon a pénz átvételéhez
- cash-received-form — űrlap a pénz átvételének dokumentálásához
- acknowledge-receipt-of-cash — formális "elismerem, hogy átvettem"
- cash-received-from-customer — ügyfél által fizetett készpénz bizonylata

Oldal struktúra:
- Hub oldal: `cash-received-receipt.html` (generator + template + explanation)
- Supporting: `acknowledge-receipt-of-cash.html` (formális minta / üzleti kontextus)
- Kontextus oldalak: industry-specific variánsok (rent, deposit, advance, stb. — részben már tervben vannak)

Framing: SpendNote = azonnali bizonylat arról, hogy a készpénz gazdát cserélt. Nem adóügyi dokumentum.

Generic template oldalak (ÚJ — hiányzó long-tail template kulcsszavak)

A template intent a legnagyobb volumenű SEO piac. A meglévő template oldalak (petty cash voucher, cash receipt, petty cash log) jól működnek, de ezek a generic variánsok hiányoznak:

- payment-receipt-template — fizetési bizonylat sablon (nagy volumen)
- deposit-receipt-template — letét / kaució sablon
- refund-receipt-template — visszatérítés sablon (cash-refund-receipt LIVE, de nem template framing)
- advance-payment-receipt-template — előleg bizonylat sablon

Oldal struktúra: template preview + rövid magyarázat + generator CTA → SpendNote signup.

"Proof / confirmation" kulcsszó klaszter (ÚJ)

Óriási globális keresési klaszter. Az ember valamit igazolni akar — fizetést, átvételt, visszatérítést. Nagyon közel a SpendNote core funkciójához.

Célkulcsszavak:
- proof-of-payment — generic, hatalmas volumen
- proof-of-payment-receipt — bizonylattal kombinált
- payment-confirmation-receipt — fizetés megerősítése
- payment-acknowledgement-receipt — fizetés elismerése

Hub oldal: `proof-of-payment-receipt.html` (explanation + generator + FAQ)
Supporting: `payment-confirmation-receipt.html`, `payment-acknowledgement-receipt.html`

Framing: SpendNote = azonnali proof of payment, ami a helyszínen kiadható. Nem számla, nem adóügyi dokumentum.

Cash handover klaszter kiegészítés (ÚJ)

A `cash-handoff-receipt.html` LIVE, de a klaszter nem teljes. Hiányzó variánsok:

- cash-received-from-employee — alkalmazottól kapott készpénz dokumentálása
- cash-transfer-receipt — belső pénzmozgás bizonylat (cash box → cash box, személy → személy)

Ezek a meglévő Cluster 3 (Cash Handoff & Team Accountability) bővítései.

Ezek tool intent keresések.

---

### Új klaszter ötletek (brainstorm)

#### A) "How to write/make a receipt" — edukációs klaszter (HATALMAS volumen)

Ez a top-of-funnel keresés. Aki nem tudja hogyan kell receipt-et írni, az pont a mi célcsoport: kisvállalkozás, egyéni vállalkozó, service provider aki készpénzt kap.

Célkulcsszavak:
- how-to-write-a-receipt — generic, masszív volumen
- how-to-make-a-receipt — szinonima, szintén hatalmas
- how-to-create-a-receipt-for-payment — konkrétabb intent
- what-to-include-on-a-receipt — checklist formátum, jó FAQ-nak
- receipt-format — milyen formátumú legyen egy bizonylat

Oldal struktúra: step-by-step guide + receipt preview + "or just use SpendNote" CTA.
Ezek nem tool intent, de NAGYON nagy volumenűek és erős funnel entry point-ok.

#### B) "Free receipt maker" klaszter (konverzióra kész)

A "free" módosító hatalmas keresési volument hoz. A SpendNote free tier (200 receipt) pont ide illik.

Célkulcsszavak:
- free-receipt-maker — a #1 keresés ebben a kategóriában
- free-receipt-generator — tool intent + free
- make-a-receipt-online-free — long-tail, de konvertál
- create-receipt-online — tool intent, nincs "free" de implicit elvárás

Hub oldal: `free-receipt-maker.html` — mini tool / instant preview + "Start free — 200 receipts included" CTA.

#### C) "Receipt app" klaszter (mobile/app intent)

Aki "receipt app"-ot keres, az telepíteni akar valamit. A SpendNote PWA/web app pont illik ide.

Célkulcsszavak:
- receipt-app — generic, nagy volumen
- best-receipt-app-for-small-business — listicle / comparison format
- cash-receipt-app — konkrétabb, kevesebb verseny
- receipt-maker-app — tool + app intent kombó

Oldal struktúra: app showcase + feature lista + CTA → signup/install.

#### D) TÖRÖLVE — Személyes kölcsön bizonylat klaszter
Törvényileg szabályozott terület (usury laws, Truth in Lending Act, állami lending engedélyek). A "loan" kulcsszó jogi kötelezettségeket implikál. Kihagyva.

#### E) TÖRÖLVE — "Cash donation receipt" klaszter
Törvényileg szabályozott terület (IRS 501(c)(3), tax deductibility). Nem illik a SpendNote pozícionáláshoz ("not a tax or accounting tool"). Kihagyva.

#### F) "Cash count / till" operatív klaszter

A napi záró pénzszámlálás és a "till" (brit angol: kasszagép) kulcsszavak. UK/AU piacon különösen erős.

Célkulcsszavak:
- cash-count-sheet — napi pénzszámlálási ív
- till-reconciliation-template — kasszaegyeztetés sablon (UK)
- cash-counting-form — pénzszámlálási űrlap
- end-of-day-cash-count — napi záró számlálás

Ezek az existing `cash-drawer-reconciliation.html` (LIVE) és `daily-cash-report-template.html` (LIVE) köré csoportosulnak, de a "till" + "cash count" variánsok nincsenek lefedve.

#### G) "Cash float / change fund" klaszter

Nyitó pénzkészlet / váltópénz alap. Minden kiskereskedő és vendéglátós keresi. Direkt kapcsolódik a SpendNote "opening balance" IN tranzakciójához.

Célkulcsszavak:
- cash-float-template — nyitó pénzkészlet sablon
- change-fund-log — váltópénz alap napló
- how-to-set-up-a-cash-float — hogyan állítsuk be a nyitó pénzkészletet
- opening-cash-balance-template — nyitó egyenleg sablon

Framing: "Set your opening cash float in SpendNote and track every movement from there."

#### H) "Paperless / No Printer" klaszter (Helyszíni / Mobil intent)

Sokan vannak terepen (piac, ügyfél háza, építkezés, kiszállás), ahol kapnak készpénzt, de nincs náluk nyugtatömb vagy nyomtató. Az intent: "Hogyan adjak bizonylatot most azonnal a telefonomról?"

Célkulcsszavak:
- how-to-give-a-receipt-without-a-printer — long-tail, probléma-fókuszú
- paperless-cash-receipt — környezettudatos / modernizáló intent
- send-receipt-via-email — funkció-keresés
- make-a-receipt-on-the-go — mobil/terepi intent
- digital-receipt-pad — a fizikai "receipt pad" digitális alternatívája

Framing: "No printer? No problem. Generate and email a PDF receipt right from your phone before you even leave the client's driveway."

#### I) "Private Sale / Used Item" klaszter (Nagy volumen, C2C / P2P intent)

Magánszemélyek közötti nagyobb készpénzes adásvételek (pl. használt autó, bicikli, bútor). Mindkét félnek kell egy azonnali igazolás, hogy a pénz át lett adva. Ez NEM adásvételi szerződés (bill of sale), hanem a készpénz átadásának elismervénye. Teljesen legális és biztonságos.

Célkulcsszavak:
- used-car-cash-receipt — hatalmas volumen
- private-sale-cash-receipt — általánosabb
- proof-of-purchase-generator — a vásárlás bizonyítása (vevő oldalról keresve)
- cash-receipt-for-selling-a-car — eladó oldalról keresve

Framing: "Protect yourself when buying or selling items for cash. Generate instant proof that the cash was handed over."

#### J) "Event / Merch Table" klaszter (Niche operatív)

Zenekarok koncert utáni merch pultja, kézműves vásárok, pop-up boltok. Itt a sebesség a lényeg, és az, hogy a végén tudják, mennyi volt az induló váltópénz (float) és a tiszta bevétel.

Célkulcsszavak:
- merch-table-cash-app — zenekarok, árusok
- craft-fair-cash-tracker — kézművesek
- flea-market-cash-tracker — bolhapiaci árusok
- pop-up-shop-cash-log — időszakos boltok

Framing: "Track your starting float, log cash sales fast, and know exactly what you made at the end of the event."

#### K) "Emergency / Lost Receipt Book" klaszter (Pánik intent)

A felhasználó ügyfélnél van, készpénzt kap, de otthon hagyta a fizikai nyugtatömböt. Gyors, telefonos megoldást keres. Konverzió: nagyon magas.

Célkulcsszavak:
- forgot-receipt-book-what-to-do — tiszta pánik intent
- emergency-receipt-generator — azonnali megoldás
- how-to-issue-a-receipt-from-phone — eszköz alapú keresés
- instant-receipt-on-phone — azonnali igény

Framing: "Forgot your receipt book? Generate a professional PDF receipt on your phone in 30 seconds."

#### O) "Cash-Only Business" klaszter (B2B niche, erős konverzió)

Kártyaterminál nélküli vállalkozások (pl. piacok, kisebb szolgáltatók, fejlődő piacokon). Nekik MINDEN tranzakciót dokumentálniuk kell, és nincs POS rendszerük. SpendNote = a POS helyettesítő.

Célkulcsszavak:
- cash-only-business-receipt — készpénzes vállalkozás bizonylat
- how-to-track-sales-without-pos — POS nélküli nyilvántartás
- cash-only-business-record-keeping — nyilvántartás készpénzes vállalkozásnak
- no-card-terminal-receipt-solution — kártyaterminál nélküli megoldás

Framing: "No card terminal? No problem. SpendNote gives your cash-only business professional receipts and a complete transaction log."

#### P) "Carbon Copy / Receipt Book Replacement" klaszter (Migráció intent)

Rengeteg kisvállalkozás még mindig fizikai indigós/karbonmásolatos nyugtatömböt használ. Aki rákeresett, az éppen váltani akar digitálisra. Erős konverzió.

Célkulcsszavak:
- digital-receipt-book-alternative — digitális alternatíva
- replace-carbon-copy-receipt-book — karbonmásolat kiváltása
- receipt-book-app — az app ami kiváltja a fizikai tömböt
- printable-receipt-book-replacement — nyomtatható helyettesítő keresése

Framing: "Ditch the carbon copy book. SpendNote gives you numbered, professional receipts — with a searchable digital archive."

#### Q) "Receipt Numbering / Sequential System" klaszter (Funkcionális keresés)

Aki erre keres, az pont azt a funkciót keresi amit a SpendNote alapból tud: automatikus sorszámozás, prefix-szel. Nagyon direkt feature match.

Célkulcsszavak:
- receipt-numbering-system — bizonylat sorszámozási rendszer
- how-to-number-receipts — hogyan sorszámozzuk a bizonylatokat
- sequential-receipt-numbering — szekvenciális sorszámozás
- auto-numbered-receipt-generator — automatikus sorszámozású generátor

Framing: "SpendNote auto-numbers every receipt with your custom prefix. No duplicates, no gaps, no manual tracking."

#### R) "What is Petty Cash / Basics" klaszter (HATALMAS edukációs volumen)

"What is petty cash" az egyik legnagyobb keresési volumenű kifejezés ebben a szegmensben. Teljesen alap edukációs tartalom, de brutális top-of-funnel belépő. Van már `how-to-start-petty-cash-box.html`, de a "what is" / "meaning" / "for dummies" variánsok hiányoznak.

Célkulcsszavak:
- what-is-petty-cash — definíció, hatalmas volumen
- petty-cash-meaning — szinonima
- petty-cash-explained — magyarázat formátum
- petty-cash-for-beginners — kezdő guide

Framing: "Petty cash is a small fund kept on hand for everyday business expenses. SpendNote helps you manage it from day one."

#### S) "Cash Register Alternative" klaszter (Tool összehasonlítás)

Kisebb vállalkozások, akiknek nem kell teljes POS rendszer, csak egyszerű készpénz nyilvántartás. A SpendNote pont ez: POS nélküli készpénzkezelés.

Célkulcsszavak:
- simple-cash-register-app — egyszerű kasszagép alkalmazás
- cash-register-alternative-small-business — kisvállalkozói alternatíva
- free-cash-register-app — ingyenes kasszagép app
- cash-register-without-pos — POS nélküli kasszagép

Framing: "Don't need a full POS? SpendNote is the simple cash register alternative — track every transaction without the complexity."

#### T) "Multi-Currency Cash" klaszter (SpendNote differenciátor)

A SpendNote egyik egyedi funkciója, hogy cash box-onként eltérő pénznemet lehet beállítani. Turistahelyek, import/export, határ menti vállalkozások. Szinte senki nem célozza ezt SEO-val.

Célkulcsszavak:
- multi-currency-cash-tracking — több pénznemű készpénz követés
- foreign-currency-receipt — külföldi pénznemű bizonylat
- multi-currency-receipt-generator — több pénznemű bizonylat generátor
- cash-tracking-different-currencies — különböző pénznemek nyilvántartása

Framing: "Track cash in USD, EUR, GBP — or any currency. Each SpendNote cash box has its own currency, so nothing gets mixed up."

---

Általában a SERP-ben:

PDF

Word template

SaaS tool ritka → jó SEO lehetőség.

5. Tool SEO oldalak

Mini alkalmazások SEO belépőként.

Petty Cash Calculator

Cél: petty cash fund meghatározása

Input:

employees

daily expenses

transaction frequency

Output:

recommended petty cash float

Petty Cash Reconciliation Tool

Input:

opening balance

receipts

expenses

Output:

expected balance + discrepancy

Cash Handover Receipt Generator

Input:

from

to

amount

reason

Output:

handover receipt preview

6. Industry use-case SEO

Niche oldalak kisvállalkozásoknak.

Példák:

restaurant petty cash management

salon petty cash tracking

food truck cash tracking

construction site petty cash

cleaning business petty cash

market stall cash tracking

Google szereti az industry-specific tartalmat.

7. Panic-query SEO

Nagyon erős konverziós oldalak.

Példák:

petty cash does not balance

petty cash mixed with personal money

petty cash running out

who took money from cash box

Felhasználó:

stresszes

gyors megoldást keres

Konverzió magas.

8. Typo SEO stratégia

Keresések gyakran elírtak.

Példák:

pety cash

petty cash vaucher

peddy cash

Ezeket nem külön oldalakkal, hanem guide oldalakon belül érdemes lefedni.

9. SEO oldal mennyiségi stratégia
Phase 1

15 oldal

Cél:

~1000 látogató / hó

Phase 2

30 oldal

Cél:

3000–8000 látogató / hó

Phase 3

60 oldal

Cél:

10k+ látogató / hó

10. Traffic becslés

Ha 30 oldal rankel:

átlag:

30–300 látogató / oldal / hó

Összesen:

~900 – 9000 látogató / hó

11. SaaS konverzió becslés

Tipikus SaaS arányok:

signup:

2–4 %

paid conversion:

10–20 %

Példa:

12 000 látogató

signup
→ 360

paid
→ 60

Ha $19 csomag:

→ ~1140 USD / hó

SEO-ból.

12. Tartalom publikálási stratégia

Nem érdemes egyszerre sok oldalt kirakni.

Ideális tempó:

heti
2–3 SEO oldal

Ez stabilabb indexelést ad.

13. Hosszú távú SEO irány

A Spendnote valójában nem csak:

petty cash tool

Hanem:

Receipt infrastructure for small businesses

Ez lehetővé teszi:

több receipt use case

több generator

több template

→ sokkal nagyobb SEO univerzum.

Rövid összefoglaló

A Spendnote SEO modellje három pilléren áll:

1️⃣ Tool SEO (generatorok, kalkulátorok)
2️⃣ Template SEO (receipt template oldalak)
3️⃣ Problem SEO (valós problémák)

Ez együtt:

stabil traffic

magas intent

SaaS konverzió
```
