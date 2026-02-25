# SpendNote — Alkalmazás Audit (magyar)

> Készült: 2025-02-25  
> Kizárás: Stripe / számlázás / előfizetés-kezelés (még nem implementált)

---

## Mi a SpendNote?

A SpendNote egy **pénzkezelési SaaS alkalmazás**, amely lehetővé teszi vállalkozások számára a készpénzmozgások nyomon követését, bizonylatok generálását és csapaton belüli együttműködést. A felhasználók pénztárgépeket (cash box) hoznak létre, tranzakciókat rögzítenek (bevétel/kiadás), és nyomtatható vagy e-mailben küldhető bizonylatokat állítanak elő.

### Technológiai háttér

- **Frontend**: Egyszerű HTML/CSS/JavaScript, keretrendszer nélkül
- **Backend**: Supabase (PostgreSQL adatbázis + hitelesítés + Row Level Security + Edge Functions)
- **E-mail küldés**: Resend API (Edge Function-ön keresztül)
- **Hosting**: Cloudflare Pages (spendnote.app)
- **Hibafigyelés**: Sentry (hozzájárulás-alapú) + saját hibanapló tábla

---

## Az alkalmazás oldalai

### Nyilvános oldalak (bejelentkezés nélkül elérhetők)

- **Landing oldal** (`index.html`) — marketing bemutatkozó oldal
- **Bejelentkezés** (`spendnote-login.html`) — email + jelszó
- **Regisztráció** (`spendnote-signup.html`) — új fiók létrehozása, meghívó token elfogadása
- **Elfelejtett jelszó** (`spendnote-forgot-password.html`) — jelszó-visszaállító email kérése
- **Jelszó visszaállítása** (`spendnote-reset-password.html`) — új jelszó megadása
- **Árazás** (`spendnote-pricing.html`) — előfizetési csomagok
- **GYIK** (`spendnote-faq.html`) — gyakori kérdések
- **Adatvédelem** (`spendnote-privacy.html`) és **Feltételek** (`spendnote-terms.html`)

### Alkalmazás oldalak (csak bejelentkezett felhasználók)

- **Irányítópult** (`dashboard.html`) — pénztárgép kártyák, utolsó tranzakciók, tranzakció-létrehozó ablak
- **Pénztárgép lista** (`spendnote-cash-box-list.html`) — összes pénztárgép áttekintése, átrendezés húzással
- **Pénztárgép részletek** (`spendnote-cash-box-detail.html`) — egy pénztárgép tranzakciói
- **Pénztárgép beállítások** (`spendnote-cash-box-settings.html`) — létrehozás/szerkesztés (név, pénznem, szín, ikon, bizonylat beállítások, logó)
- **Tranzakciótörténet** (`spendnote-transaction-history.html`) — szűrhető, rendezhető, lapozható lista
- **Tranzakció részletek** (`spendnote-transaction-detail.html`) — egy tranzakció megtekintése + bizonylat előnézet/nyomtatás/email/sztornó
- **Kapcsolattartó lista** (`spendnote-contact-list.html`) — ügyfél/szállító lista, tömeges törlés
- **Kapcsolattartó részletek** (`spendnote-contact-detail.html`) — egy kontakt adatai + tranzakciói
- **Mobil tranzakció** (`spendnote-new-transaction.html`) — mobilra optimalizált tranzakció-létrehozó
- **Csapatkezelés** (`spendnote-team.html`) — meghívás, szerepkörök, pénztárgép hozzáférés
- **Felhasználói beállítások** (`spendnote-user-settings.html`) — profil, avatár, bizonylat identitás, jelszó, fiók törlése

### Bizonylat sablonok (speciális auth-tal)

- **PDF bizonylat** (`spendnote-pdf-receipt.html`) — A4 nyomtatásra optimalizált
- **Email bizonylat** (`spendnote-email-receipt.html`) — e-mail-be beágyazható
- **Dupla nyomtatás** (`spendnote-receipt-print-two-copies.html`) — két példány egyszerre

---

## Hitelesítés és munkamenet

- **Regisztráció**: email + jelszó → Supabase email megerősítés → profil automatikusan létrejön
- **Bejelentkezés**: email + jelszó
- **Jelszó-visszaállítás**: email link → új jelszó megadása
- **Kijelentkezés**: munkamenet törlése, átirányítás a landing oldalra
- **Fiók törlése**: „DELETE" begépelése + 5 másodperces visszaszámláló → Edge Function végzi a tényleges törlést

A munkamenet **tab-szintű** (sessionStorage): ha bezárod a böngészőt, kijelentkezik. Minden alkalmazás-oldal tartalmaz egy auth guard-ot, ami bejelentkezés nélkül visszairányít a login oldalra.

---

## Szerepkörök és jogosultságok

Három szerepkör van szervezeten belül:

### Owner (Tulajdonos)
Teljes hozzáférés mindenhez. Ő hozta létre a szervezetet.

### Admin (Adminisztrátor)
Majdnem minden, kivéve a számlázás megtekintését.

### User (Felhasználó)
Korlátozott — csak a neki hozzárendelt pénztárgépekhez fér hozzá, és sok beállítást nem szerkeszthet.

### Részletes jogosultsági táblázat

| Funkció | Owner | Admin | User |
|---|:---:|:---:|:---:|
| Irányítópult megtekintése | ✅ | ✅ | ✅ (csak hozzárendelt pénztárgépek) |
| Tranzakció létrehozása | ✅ | ✅ | ✅ (csak hozzárendelt pénztárgépek) |
| Összes pénztárgép megtekintése | ✅ | ✅ | ❌ |
| Pénztárgép létrehozás/szerkesztés/törlés | ✅ | ✅ | ❌ |
| Kapcsolattartók kezelése | ✅ | ✅ | ✅ |
| Tranzakciótörténet | ✅ | ✅ | ✅ (szűrve) |
| Tranzakció sztornózása | ✅ | ✅ | ✅ |
| Csapat oldal megtekintése | ✅ | ✅ | ❌ |
| Tagok meghívása / eltávolítása | ✅ | ✅ | ❌ |
| Szerepkörök módosítása | ✅ | ✅ | ❌ |
| Pénztárgép hozzáférés kezelése | ✅ | ✅ | ❌ |
| Szervezet nevének szerkesztése | ✅ | ✅ | ❌ |
| Bizonylat identitás szerkesztése | ✅ | ✅ | ❌ (csak olvasható) |
| Fiók logó szerkesztése | ✅ | ✅ | ❌ |
| Számlázás megtekintése | ✅ | ❌ | ❌ |
| Profil szerkesztés (név, avatár) | ✅ | ✅ | ✅ |
| Jelszó módosítása | ✅ | ✅ | ✅ |
| Fiók törlése | ✅ (szervezet is törlődik) | ✅ (csak saját) | ✅ (csak saját) |

A szerepkör meghatározása az `org_memberships` táblából történik, 30 másodperces cache-eléssel.

---

## Fő funkciók és folyamatok

### Pénztárgépek (Cash Boxes)

Minden szervezetnek lehetnek pénztárgépei, amelyek a készpénz-egységeket képviselik. Egy pénztárgépnek van neve, pénzneme, színe, ikonja és egyedi azonosító prefixe. **A pénznem és az azonosító prefix létrehozás után megváltoztathatatlan** (adatbázis trigger védi).

Pénztárgépek létrehozhatók, szerkeszthetők, törölhetők (Owner/Admin), és a listanézetben húzással átrendezhetők. Pro funkcióként bizonylat címkék és pénztárgép-specifikus logó is beállítható.

### Tranzakciók

Tranzakciót a dashboard modalon vagy a mobil oldalon lehet létrehozni. A folyamat:
1. Típus kiválasztása (bevétel/kiadás)
2. Összeg, leírás, kapcsolattartó megadása
3. Létrehozáskor a rendszer snapshotot készít a pénztárgép adatairól (név, pénznem, szín, ikon, prefix) — ez biztosítja, hogy a bizonylat később is pontosan visszaadja az akkori állapotot
4. Az egyenleg automatikusan frissül
5. Sorszám automatikusan kiosztásra kerül

Tranzakciók **nem szerkeszthetők, csak sztornózhatók**. Sztornókor egy visszafordító rendszertranzakció jön létre, ami korrigálja az egyenleget.

Szűrési lehetőségek: pénztárgép, dátumtartomány, típus, összeg, kapcsolattartó, létrehozó, tranzakció-azonosító.

### Kapcsolattartók

Ügyfél/szállító adatbázis. Kapcsolattartók manuálisan hozhatók létre, vagy tranzakció létrehozásakor automatikusan (ha az adott név még nem létezik). Tranzakciókor a kontakt adatok snapshotolódnak a bizonylat reprodukálhatósága érdekében.

### Bizonylat rendszer

Háromféle formátum: A4 PDF, Email HTML, Dupla példányos nyomtatás. Per-pénztárgép beállítható, hogy a bizonylaton mi jelenjen meg (logó, címek, nyomkövetés, megjegyzés, aláírás). Pro funkcióként 9 szövegcímke is testre szabható. A dashboard előnézet kötelező vízjelet tartalmaz.

### Csapat és meghívók

1. Owner vagy Admin emailt ad meg + szerepkört → meghívó email megy (Resend API-n keresztül, rate limittel)
2. A meghívott a linkkel regisztrál → automatikusan csatlakozik a szervezethez
3. Ha már van fiókja, bejelentkezéskor automatikusan elfogadódnak a függő meghívói
4. Admin szerepkörű tagok automatikusan minden pénztárgéphez hozzáférnek; User szerepkörűeknek egyenként kell hozzárendelni

### Fiók törlése

Frontend oldalon „DELETE" begépelése és 5 másodperces visszaszámláló szükséges. A háttérben egy Edge Function:
- Ellenőrzi a JWT tokent
- Ha Owner: törli az összes általa létrehozott szervezetet (kaszkádolva a tagságokat)
- Törli a felhasználót az auth rendszerből → kaszkád: profil → pénztárgépek → tranzakciók stb.
- A törölt felhasználó által létrehozott tranzakciókon a név megőrződik, de a user_id null-ra áll

### Szervezeti kontextus (Multi-org)

Egy felhasználó több szervezethez is tartozhat. A kiválasztott szervezet localStorage-ban tárolódik. Ha több tagság van és nincs kiválasztás, bejelentkezéskor szervezet-választó jelenik meg. Minden adatlekérdezés az aktuális szervezet szerint szűr.

---

## Biztonsági intézkedések

- **Row Level Security (RLS)**: minden táblán engedélyezve, per-felhasználó szabályokkal
- **Auth Guard**: minden védett oldalon ellenőrzi a bejelentkezést
- **JWT ellenőrzés**: Edge Function-ök minden kérésnél ellenőrzik a tokent
- **Service role kulcs**: csak szerver oldalon használt, kliens felé soha nem elérhető
- **Rate limiting**: meghívó emaileknél (3/cél, 12/küldő per 10 perc)
- **Meghívó tokenek**: SHA-256-tal hashelve tárolva, plaintext soha nem kerül adatbázisba
- **Megváltoztathatatlan mezők**: pénztárgép pénznem és azonosító prefix zárolva trigger által
- **GDPR cookie banner**: EU országoknak strict módban

---

## Azonosított hiányosságok

### Kritikus problémák

**C1 — RLS policy-k nem org-aware-ek**  
A `cash_boxes`, `contacts` és `transactions` táblák RLS szabályai `user_id = auth.uid()` alapján szűrnek. Ez azt jelenti, hogy egy csapattag (Admin/User) adatbázis szinten **nem fér hozzá** a szervezet tulajdonosa által létrehozott rekordokhoz — jelenleg az alkalmazás rétegben `org_id` szűrés oldja meg, de ez nem adatbázis-szintű védelem. Ha valaki közvetlenül lekérdezi a Supabase API-t, ezek a sorok nem jelennek meg.  
→ **Javaslat**: RLS policy-k bővítése `org_memberships` ellenőrzéssel.

**C2 — Az `orgs` tábla RLS-e nincs az alap sémában**  
Az org tábla RLS policy-k csak migrációban (025) vannak definiálva, az alap `schema.sql`-ben nem — drift kockázat.  
→ **Javaslat**: Hozzáadni a base schema-hoz.

### Magas prioritású problémák

**H1 — Nincs email-megerősítés kényszerítés**  
Nem ellenőrzött, hogy a Supabase projektben be van-e kapcsolva az email megerősítés. Nincs UI visszajelzés megerősítetlen felhasználóknak.

**H2 — Nincs jelszó-erősség ellenőrzés**  
Sem regisztrációnál, sem jelszóváltoztatásnál nincs minimum követelmény.

**H3 — Pénztárgép törlés kliens oldalon kaszkádol**  
A `db.cashBoxes.delete()` manuálisan, egymás után törli a tranzakciókat → tagságokat → hozzáféréseket → magát a pénztárgépet. Ha a folyamat félbeszakad, részleges törlés marad.  
→ **Javaslat**: Szerver oldali RPC vagy DB CASCADE használata.

**H4 — Nincs audit napló**  
Nincs naplózva, ki mikor mit változtatott (szerepkör módosítás, tag eltávolítás, pénztárgép szerkesztés).  
→ **Javaslat**: `audit_log` tábla.

**H5 — Sztornónak nincs szerepkör korlátozása**  
Bármely felhasználó, aki hozzáfér egy tranzakcióhoz, sztornózhatja azt — nincs Owner/Admin megkötés.

**H6 — User szerepkörű tag kontakt-kezelése RLS szinten nem működik**  
Ha a kontaktok az org owner `user_id`-jával jönnek létre, a User tag nem tudja szerkeszteni/törölni őket az RLS miatt.

### Közepes prioritású problémák

**M1 — Nincs onboarding**  
Új felhasználó üres dashboard-on landol, semmi útmutatás.

**M2 — ~~Tranzakciók nem szerkeszthetők~~ — BY DESIGN**  
Tranzakciók immutábilisak, kizárólag void lehetséges. Tudatos döntés.

**M3 — ~~Tranzakció törlés~~ — BY DESIGN**  
Kizárólag void használható, törlés nem lehetséges. Halott `transactions.delete()` API metódus eltávolítva.

**M4 — Nincs export/letöltés**  
A tranzakciótörténetnek nincs CSV vagy PDF exportja.

**M5 — Nincs keresés a kapcsolattartó oldalon**  
Az összes kontakt egyszerre töltődik, szűrő/keresőmező nélkül.

**M6 — Bizonylat limit nincs szerver oldalon kényszerítve**  
200 bizonylatos limit csak kliens oldalon van, localStorage-ból felülírható.

**M7 — ~~Nincs pénztárgép archiválás~~ — ELVETVE**  
Nem lesz archiválás. Pénztárgépek aktívak vagy törölhetők. `is_active` oszlop eltávolítva.

**M8 — Email-cím nem módosítható regisztráció után**

**M9 — Nincs kétfaktoros hitelesítés (2FA/MFA)**

**M10 — Legacy táblák a sémában**  
A `team_members` és `cash_box_access` táblák már nem használtak (az `org_memberships` és `cash_box_memberships` váltotta le őket), de még léteznek.

### Alacsony prioritású problémák

- Nincs sötét mód
- Nincs többnyelvűség (minden angol)
- Nincs offline támogatás
- Nincs értesítési rendszer
- A régi FAQ oldal (`spendnote-faq-old.html`) még létezik
- Nincs lapozás a kapcsolattartó listán
- Sentry environment tag hiányzik
