# Stripe Dashboard — lépésről lépésre (SpendNote, Live)

Cél: éles fizetés előtt minden **ügyfélnek látható** és **számlázási** rész rendben legyen. A menük neve Stripe-ban változhat (Workbench vs régi nézet); ha nem találod, használd a jobb felső **keresőt** (pl. „Customer portal”, „Branding”).

---

## 0. Alapszabály

- **Mindig Live mode** (felül: *Test mode* kapcsoló **ki**). A SpendNote webhook és price ID-k is live-hoz vannak kötve.
- Ha két böngésző fül van nyitva (test/live), könnyű összekeverni — csak Live.

---

## 1. Fiók és cégadatok

1. Menj: **Settings** (fogaskerék) → **Account details** (vagy *Business settings*).
2. Töltsd ki:
   - **Public business name** / jogi név (ahogy a számlán meg kell jelennie).
   - **Support email** (pl. `support@spendnote.app`) — ezt látják ügyfelek.
   - **Support phone** (opcionális).
   - **Cím** — Stripe és a kártya-hálózatok elvárása szerint.
3. Mentsd.

*Miért:* Checkout, Portal és invoice PDF ezekből épül.

---

## 2. Branding (Checkout + Customer Portal)

1. **Settings** → **Branding** (vagy kereső: „Branding”).
2. Tölts fel:
   - **Logo** (preferált: vízszintes vagy négyzetes, jó felbontás).
   - **Icon** (favicon-szerű, kis méret).
3. **Accent color** — egy szín, ami illeszkedik a SpendNote UI-hoz (pl. indigó / zöld).
4. Mentsd.

*Ellenőrzés:* **Később** egy teszt Checkout session megnyitásakor látszik a logó és a szín.

---

## 3. Kártyakivonat (statement descriptor)

1. **Settings** → **Public** / **Public business information** (vagy kereső: „Statement descriptor”).
2. **Shortened descriptor** vagy **Statement descriptor**:
   - Rövid, felismerhető név (pl. `SPENDNOTE` vagy `SILDSYS SPENDNOTE`).
   - Bank / hálózat limit: tipikusan ~5–22 karakter; Stripe figyelmeztet, ha túl hosszú.

*Miért:* Így a vásárló a banki listán nem egy véletlenszerű kódot lát.

---

## 4. Számla (Invoice) megjelenés

Előfizetéseknél Stripe **számlát** generál.

1. **Settings** → **Billing** → **Invoice customization** / **Invoices** (vagy kereső: „Invoice”).
2. Állítsd be:
   - **Footer** — disclaimer, cégjegyzékszám / adószám, ha kötelező.
   - **Memo** vagy **custom fields** — ha kell jogi szöveg (pl. „B2B szolgáltatás”).
3. Ha EU-s és kell **VAT az PDF-en**: **Tax** beállítások (lásd §6) és invoice beállítások együtt.

---

## 5. Email értesítések és receipt (Stripe oldalról)

A SpendNote küld saját emaileket (upgrade stb.) — ez **kérdés**, hogy a Stripe is küldjön-e:

1. **Settings** → **Emails** vagy **Billing** → **Customer emails** (Stripe verziótól függően).
2. Tipikusan:
   - **Successful payments** / **Receipts** — ha **be**kapcsolod, a vásárló kap egy Stripe „fizetés sikerült” / receipt jellegű levelet.
   - Ha túl sok email lenne, maradhat **ki**; akkor csak a te SpendNote emaileid + Portal „Invoices” marad.

*Javaslat:* induláskor legalább egyféle **hivatalos fizetési visszaigazolás** legyen (Stripe receipt **vagy** csak invoice link a Portalban) — jogi/szupport döntés.

---

## 6. Adó (Tax) — ha EU / nemzetközi

1. **Settings** → **Tax** (vagy *Stripe Tax*).
2. Ha **Stripe Tax** / regisztrációk: kövesd a Stripe varázslót (ország szerinti áFA/BTW/stb.).
3. Ha **nem** használtok Stripe Tax-ot: egyeztess könyvelővel; a termék **ÁFA mentes B2B** stb. mind jogi kérdés.

*A kód nem helyettesíti ezt* — ez tiszta Stripe + jog.

---

## 7. Customer Portal (kötelező a Billing Portalhoz)

Az app a `create-portal-session` függvénnyel nyitja a **Stripe Customer Portal**-t (kártya frissítés, lemondás).

1. **Settings** → **Billing** → **Customer portal**.
2. **Activate** / engedélyezd a portált.
3. Pipáld (minimum):
   - **Update payment method**
   - **Cancel subscription** (lemondás időszak végén — Stripe alap viselkedés)
   - **View invoice history** (ajanlott — ügyfél letöltheti a számlát).
4. **Business information**: link, support email.
5. **Terms of service** és **Privacy policy** URL — add meg a SpendNote oldalakat (pl. `spendnote-terms.html`, `spendnote-privacy.html` teljes https URL).
6. Ha van **„Customers can switch plans”** típusú opció: óvatosan — a SpendNote pricing oldal és `update-subscription` is kezel váltást; **teszteld**, hogy nem duplázódik-e a logika. Biztonságos indulás: Portalban első körben **fizetési mód + számlák + lemondás**, plan-switch főleg az appban.

Mentsd.

---

## 8. Bank és kifizetések (Payouts)

1. **Balances** → **Payouts** (vagy **Settings** → **Bank accounts and scheduling**).
2. **Ellenőrzött** bankszámla, helyes **payout schedule**.
3. **Verification**: ha a Dashboard tetején sárga/piros figyelmeztetés van — zárd le (KYC), különben a charge-ok blokkolódhatnak.

---

## 9. Webhook (ellenőrzés, nem újraépítés)

Ha már létrehoztad:

1. **Developers** → **Webhooks** (vagy Workbench → Webhooks).
2. Az endpoint URL:  
   `https://zrnnharudlgxuvewqryj.supabase.co/functions/v1/stripe-webhook`
3. **6 esemény** legyen kiválasztva (lásd `STRIPE-GO-LIVE-CHECKLIST.md` §B2).
4. **Signing secret** megegyezik a Supabase `STRIPE_WEBHOOK_SECRET`-tel.

---

## 10. Gyors smoke teszt (Stripe Dashboardban, még az app nélkül is)

1. **Developers** → **Webhooks** → válaszd az endpointot → **Send test webhook** (pl. `invoice.payment_succeeded`) — nézd, hogy nem 401/500 (Supabase log).
2. Amikor az appban **STRIPE_LIVE = true**:
   - egy valós (kis összegű) checkout,
   - majd Portal: számla megjelenik-e, lemondás működik-e.

---

## SpendNote kódbeli kapcsoló

- Nyilvános oldal **nélkül** checkout: `assets/js/supabase-config.js` → **`STRIPE_LIVE = false`** (Coming Soon).
- Élesítés napján: `true` + HTML cache-bust (`supabase-config.js?v=...`).

Részletes technikai checklist: **`STRIPE-GO-LIVE-CHECKLIST.md`**.
