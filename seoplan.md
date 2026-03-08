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

5. `cash-paid-out-log.html` 🔒 IDEA
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

2. `who-took-money-from-cash-box.html` 🔒 IDEA
   - **Intent:** Identifying who last accessed the cash box when money is missing.
   - **Keywords:** who took money from cash box, how to know who took petty cash.

*"The cash doesn't add up" situations:*
3. `petty-cash-does-not-balance.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** End-of-day panic — cash is short and no one knows why.
   - **Keywords:** petty cash doesn't balance, petty cash doesn't add up, cash box short at end of day.

4. `petty-cash-how-much-to-keep.html` 🔒 IDEA
   - **Intent:** First-time setup question — how much cash to float.
   - **Keywords:** how much money to keep in petty cash, petty cash starting amount.

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

8. `church-petty-cash-fund.html` 🔒 IDEA
   - **Intent:** Nonprofit / church cash fund management with minimal overhead.
   - **Keywords:** church petty cash fund, nonprofit petty cash policy.

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

8. `how-to-start-petty-cash-box.html` 🔒 IDEA
   - **Intent:** Guide for setting up a petty cash box from scratch.
   - **Keywords:** how to start petty cash box, set up petty cash from scratch.

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

2. `petty-cash-records-for-tax-time.html` 🔒 IDEA
   - **Intent:** End-of-year scramble to organize cash records for the accountant.
   - **Keywords:** petty cash records for tax, organize petty cash before tax season.

3. `petty-cash-missing-receipts-tax.html` 🔒 IDEA
   - **Intent:** Panic when receipts are missing at tax time.
   - **Keywords:** missing petty cash receipts tax, lost petty cash receipts what to do.

*Replacing Excel / paper:*
4. `replace-petty-cash-spreadsheet.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Frustrated Excel users looking for a simpler alternative.
   - **Keywords:** replace petty cash spreadsheet, petty cash Excel alternative.

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

12. `cash-discrepancy-between-shifts.html` 🔒 IDEA ⭐ TOP PICK
    - **Intent:** Cash doesn't match between shifts — finding where it went wrong.
    - **Keywords:** cash discrepancy between shifts, shift change cash shortage.

13. `two-person-cash-count-policy.html` 🔒 IDEA
    - **Intent:** Dual control principle explained simply for small teams.
    - **Keywords:** two person cash count, dual control cash counting policy.

14. `tip-jar-tracking-small-business.html` 🔒 IDEA
    - **Intent:** Fair tracking and splitting of tip jar money.
    - **Keywords:** tip jar tracking, how to track tip jar money fairly.

**Idea backlog Round 5 (security, remote management, confrontation, comparison, seasonal):**

*Security & storage:*
1. `where-to-keep-petty-cash.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Basic question about where to physically store petty cash.
   - **Keywords:** where to keep petty cash, best place to store petty cash in office.

2. `petty-cash-security-tips.html` 🔒 IDEA
   - **Intent:** Practical security tips for keeping cash safe.
   - **Keywords:** petty cash security tips, how to keep petty cash safe.

3. `does-insurance-cover-petty-cash-theft.html` 🔒 IDEA
   - **Intent:** Very specific but high-intent question after a theft incident.
   - **Keywords:** does insurance cover petty cash theft, business insurance stolen cash.

*Owner not always present:*
4. `manage-petty-cash-remotely.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Business owners who aren't always on-site but need cash visibility.
   - **Keywords:** manage petty cash remotely, track petty cash from home.

5. `petty-cash-for-part-time-staff.html` 🔒 IDEA
   - **Intent:** Managing cash access for part-time or rotating employees.
   - **Keywords:** petty cash access part time employees, part time staff cash handling.

*Difficult conversations:*
6. `how-to-confront-employee-about-missing-cash.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Emotionally charged — owner suspects theft but doesn't know how to address it.
   - **Keywords:** how to talk to employee about missing cash, confront staff about stolen money.

7. `petty-cash-discipline-policy.html` 🔒 IDEA
   - **Intent:** What consequences to set when petty cash rules are broken.
   - **Keywords:** petty cash discipline policy, employee broke petty cash rules.

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
1. `rent-payment-cash-receipt.html` 🔒 IDEA ⭐ TOP PICK
   - **Intent:** Landlords who collect rent in cash and need to give tenants instant proof — the official invoice comes later.
   - **Keywords:** rent payment cash receipt, proof of rent payment cash, rent cash handoff receipt.
   - **Framing:** Instant proof that cash rent was received; not a tax document.

2. `cash-deposit-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

5. `cash-refund-receipt.html` 🔒 IDEA
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
10. `custom-cash-receipt-with-logo.html` 🔒 IDEA ⭐ TOP PICK
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
16. `employee-cash-advance-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

20. `contractor-advance-payment-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

23. `handyman-cash-payment-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

26. `school-money-collection-tracker.html` 🔒 IDEA ⭐ TOP PICK
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
1. `babysitter-cash-payment-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

4. `tutor-cash-payment-receipt.html` 🔒 IDEA ⭐ TOP PICK
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

---

### Planned SEO Pages (24 pages — approved 2026-03-07)

All pages will be created with `noindex, nofollow` until individually approved for indexing.

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
| 12 | `petty-cash-does-not-balance` | petty cash doesn't balance | Problem → diagnosis → SpendNote as prevention |
| 13 | `who-took-money-from-cash-box` | who took money from cash box | Trust problem → audit trail → SpendNote |
| 14 | `cash-discrepancy-between-shifts` | cash discrepancy between shifts | Shift handover problem → SpendNote |

#### Industry-Specific (1)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 15 | `construction-site-petty-cash` | construction site petty cash | Field/onsite cash management | ✅ LIVE 2026-03-08 |

#### Process / Feature Pages (7)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 16 | `daily-cash-report-template` | daily cash report template | End-of-day cash summary | ✅ LIVE 2026-03-08 |
| 17 | `digital-receipt-book` | digital receipt book | Replace paper receipt books |
| 18 | `cash-count-sheet-template` | cash count sheet | Cash denomination counting |
| 19 | `petty-cash-replenishment-form` | petty cash replenishment | Replenishment process |
| 20 | `cash-refund-receipt` | cash refund receipt | Documenting cash refunds |
| 21 | `petty-cash-audit-checklist` | petty cash audit checklist | Audit preparation | ✅ LIVE 2026-03-08 |
| 22 | `cash-paid-out-log` | cash paid out log | Disbursement tracking |

#### Educational / How-To Pages (2)

| # | Slug | Primary keyword | Content angle |
|---|---|---|---|
| 23 | `how-to-track-cash-payments` | how to track cash payments | Educational guide → SpendNote as solution |
| 24 | `how-to-manage-petty-cash-small-business` | how to manage petty cash small business | Educational cluster hub → SpendNote as tool |

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
| receipt book alternative, paper receipt book replacement | `digital-receipt-book` (planned #17) |
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

**Indexable pages (index, follow):** 29
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

### Update log - 2026-03-08

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

Ezek tool intent keresések.

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
