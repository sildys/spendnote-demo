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

| # | Slug | Title angle | Target pain |
|---|------|------------|------------|
| 1 | who-has-the-cash-right-now | Who Has the Cash Right Now? Track It Instantly | "Kinél van a pénz?" — átláthatóság |
| 2 | office-cash-tracking | Office Cash Tracking — See Every Movement | Irodai készpénz mozgás követése |
| 3 | cash-advance-not-returned | Employee Didn't Return Cash Advance? What to Do | Nem adta vissza az előleget |
| 4 | boss-cant-see-where-cash-goes | Can't See Where Your Team's Cash Goes? Fix That | Főnök nem lát rá a pénzre |

**Kanibalizáció-ellenőrzés (2026-03-22):**
- ~~track-cash-between-employees~~ TÖRÖLVE — kanibalizálná a `cash-handoff-receipt`-et (mindkettő: pénz mozgás emberek között)
- ~~small-business-cash-control~~ TÖRÖLVE — kanibalizálná a `how-to-manage-petty-cash-small-business`-t (mindkettő: small business + cash management)
- `who-has-the-cash-right-now` vs `who-took-money-from-cash-box`: OK — más intent (jelen "kinél van?" vs múlt "ki vette ki?")
- `office-cash-tracking` vs `office-expense-reimbursement-form`: OK — általános tracking vs specifikus reimbursement form
- `cash-advance-not-returned` vs `employee-cash-advance-receipt`: OK — probléma ("nem adta vissza") vs dokumentálás ("receipt készítés")
- `boss-cant-see-where-cash-goes` vs `manage-petty-cash-remotely`: OK de óvatosan — pain framing vs feature framing, keyword-öket el kell választani

**Mi más ezekben:**
- NEM "petty cash" / "template" keyword-ök — hanem szituáció/pain alapú
- Nem template, hanem probléma-megoldás framing
- Célcsoport: irodavezető, kisvállalkozó, csapatvezető aki távolról akarja látni a pénzt
- Kiegészítik a meglévő 47 oldalt, nem helyettesítik

**Időzítés:**
1. Április eleje: GSC kiértékelés + ezekből 2-3 oldal megépítése
2. A legjobban performálót duplikálod a többire

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
