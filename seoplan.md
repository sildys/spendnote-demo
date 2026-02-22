# SEO + ICP Plan (v1)

## Positioning guardrail (must keep)
SpendNote is **not** an accounting, tax invoicing, or POS replacement tool.
SpendNote is for **internal cash control**, **handoff proof**, and **team audit trail**.

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

### Public links + current metadata snapshot

| URL | Source file | Current robots | Core topic / intent | Priority action |
|---|---|---|---|---|
| https://spendnote.app/ | `index.html` | `index, follow` | Main product page (brand + core value) | Keep indexable; align hero copy to non-accounting positioning |
| https://spendnote.app/pricing | `spendnote-pricing.html` | `noindex, nofollow` (intentional pre-final) | Plan comparison / conversion page | Keep noindex until final copy and plan details are locked |
| https://spendnote.app/faq | `spendnote-faq.html` | `index, follow` | Objection handling + product clarification | Expand FAQ around internal cash control use-cases and disclaimers |
| https://spendnote.app/petty-cash-receipt-template | `petty-cash-receipt-template.html` | `noindex, nofollow` (intentional pre-final) | Template intent keyword | Rework copy, keep noindex during draft stage, then switch to index |
| https://spendnote.app/petty-cash-receipt-generator | `petty-cash-receipt-generator.html` | `noindex, nofollow` (intentional pre-final) | Tool intent keyword | Rework copy, keep noindex during draft stage, then switch to index |
| https://spendnote.app/cash-handoff-receipt | `cash-handoff-receipt.html` | `noindex, nofollow` (intentional pre-final) | Internal handoff documentation intent | High-priority ICP page; keep noindex until refinement is complete |
| https://spendnote.app/cash-receipt-book | `cash-receipt-book.html` | `noindex, nofollow` (intentional pre-final) | Digital vs paper receipt workflow | Refine angle, keep noindex during draft stage, then switch to index |
| https://spendnote.app/small-business-cash-receipt | `small-business-cash-receipt.html` | `noindex, nofollow` (intentional pre-final) | Small-business receipt management intent | Remove tax/accounting-heavy language, then switch to index |
| https://spendnote.app/carbonless-receipt-book-alternative | `carbonless-receipt-book-alternative.html` | `noindex, nofollow` (intentional pre-final) | Alternative-intent keyword page | Keep differentiation angle, then switch to index |

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

4. **template/generator/landing pages (`/petty-cash-*`, `/cash-handoff-receipt`, `/cash-receipt-book`, `/small-business-cash-receipt`, `/carbonless-receipt-book-alternative`)**
   - All currently `noindex, nofollow` by intent (draft-stage indexing gate).
   - Canonicals are properly set to clean URLs.
   - Most use Article or SoftwareApplication schema.
   - Copy needs consistency pass to keep non-accounting positioning.

### Finish checklist for these SEO pages

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
