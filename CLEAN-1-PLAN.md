# CLEAN-1 Cleanup Plan

## Szabályok (szigorúan)
- **Nulla behavior change** — sem UX, sem logika, sem API hívás változás
- Csak: fájlrendezés, duplikáció kiszedés, dead code törlés (csak bizonyíthatóan unused), naming konzisztencia, lint/format fix
- Minden commit max 200–400 sor diff
- Minden commit után gyors smoke test (login + new tx + receipt)

---

## C1 — `supabase-config.js` szétdarabolása (142 KB, ~3500 sor)

**Probléma:** egyetlen fájlba van zsúfolva:
- Supabase client init
- Auth helpers (`auth.*`)
- Billing state (`SpendNoteBilling`)
- Backend error helpers (`SpendNoteBackendErrors`)
- Stripe invoker (`SpendNoteStripe`)
- Preview/limit constants
- Bootstrap session helpers
- Transactions CRUD (`window.transactions.*`)
- CashBoxes CRUD (`window.cashBoxes.*`)
- Contacts CRUD (`window.contacts.*`)
- OrgMemberships (`window.orgMemberships.*`)
- Profiles (`window.profiles.*`)
- Invites (`window.invites.*`)
- Utility/format functions (isUuid, formatContactDisplayId, stb.)

**Terv:** NEM darabolunk most szét fájlokba (behavior change kockázat a cache-bust és load order miatt). Ehelyett:
- Belső szekció kommentek egységesítése (`// === SECTION ===` stílus)
- Dead code azonosítás + törlés (pl. unused export változók, régi kommentelt blokkok)
- `var` → `const`/`let` ahol triviálisan biztonságos

**Commit méret:** 2-3 kisebb commit

---

## C2 — Dead code törlés JS fájlokban

Célzottan keresünk:
- Kommentezett-ki kódblokkokra (`// OLD`, `// LEGACY`, `// TODO: remove`)
- `console.log` debug kiírások (nem `SpendNoteDebug`-gal védett)
- Duplikált helper függvények (pl. `isUuid` több helyen?)
- Unused `window.*` exportok

**Fájlok:** `main.js`, `dashboard-form.js`, `dashboard-modal.js`, `transaction-history-data.js`, `user-settings.js`, `cash-box-settings-data.js`

**Commit méret:** fájlonként 1 commit

---

## C3 — CSS dead code + duplikáció

**Probléma:** `dashboard.css` 115 KB — tartalmaz régi override blokkokat
- `!important` hackek maradványai (a modal header fix után)
- Duplikált rule-ok (pl. `.tx-card-*` ami már `app-layout.css`-be ment)
- `unified-styles.css` vs `app-layout.css` átfedés vizsgálata

**Terv:**
- Szekciónként végigmenni, törölni ami biztosan nem él
- `unified-styles.css` tartalmát megvizsgálni — esetleg beolvasztható `app-layout.css`-be

**Commit méret:** 1-2 commit

---

## C4 — Naming konzisztencia

- `__spendnote*` prefix (privát) vs `window.SpendNote*` (publikus) — már nagyrészt rendben, csak ellenőrzés
- HTML fájlokban cache-bust verziók konzisztenciájának ellenőrzése (nincs-e elmaradt v= bump)
- `var` deklarációk `let`/`const`-ra ahol triviális

---

## C5 — Apró törmelék

- `fix-svg.ps1`, `fix-svg-all.ps1` — ha még ott van, törölni
- Temp/draft HTML fájlok keresése (pl. `*-old.html`, `*-backup*`, `*-draft*`)
- `MASTER-FOOTER.html`, `footer-template.html`, `footer-template-2row.html` — ezek használva vannak-e?

---

## Sorrend

| # | Feladat | Kockázat | Becsült diff |
|---|---------|----------|-------------|
| C5 | Törmelék törlés | minimális | ~50 sor |
| C2 | Dead code JS (console.log, kommentelt blokkok) | alacsony | ~200-400 sor/fájl |
| C3 | CSS dead code | közepes | ~200-300 sor |
| C4 | Naming + var→const | alacsony | ~100 sor |
| C1 | supabase-config.js szekcionálás | közepes | ~100 sor |

---

## Smoke test checklist (minden commit után)
1. Login (email + Google)
2. Új tranzakció létrehozás (IN + OUT)
3. Receipt preview (print)
4. Team invite küldés
