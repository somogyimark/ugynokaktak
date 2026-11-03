# Nyitott Akták

Titkosakta-stílusú, statikus adatböngésző a nyitottaktak.hu-n 2026. november 4-től nyilvános
állambiztonsági nyilvántartásokhoz (6-os karton, B-napló, H-adattár). A felület úgy mutatja be az
adatokat, mintha egy levéltári aktát lapoznánk: kartondosszié-borító, sárgult kartonlap, vonalazott
napló és foszforzöld terminál.

> **Fontos:** a valódi adatok formátuma még nem ismert, ezért az oldal jelenleg **fiktív
> tesztadaton** fut, egy cserélhető adapterréteggel. Amíg tesztadat fut, a felületen állandó
> „FIKTÍV TESZTADAT – DEMÓ” szalag látszik. Az éles adat bekötése (M6) külön, kézzel jóváhagyott lépés.

A teljes specifikáció: [`SPEC.md`](./SPEC.md).

## Gyors indulás

```bash
npm install
npm run dev        # fejlesztői szerver (http://localhost:5173)
npm run build      # típusellenőrzés + statikus build a dist/ mappába
npm run preview    # a build kiszolgálása helyben
npm test           # Vitest tesztek
```

Node 20+ szükséges (22-vel tesztelve).

## Technológia

- Vite + React 19 + TypeScript (strict)
- Tailwind CSS v4 a layouthoz, saját CSS a papír-, karton- és terminál-effektekhez (képek nélkül: CSS
  gradiensek és inline SVG-zaj)
- React Router (az oldalak és a keresési állapot az URL-ben)
- Saját hosztolású betűk (`@fontsource`): Special Elite, Courier Prime, Oswald, IBM Plex Mono – nincs
  külső betűkérés, így harmadik fél sem látja a látogatókat
- Vitest a tesztekhez

## Oldalak

| Útvonal       | Tartalom                                  | Indexelhető |
| ------------- | ----------------------------------------- | ----------- |
| `/`           | Nyitóoldal („Az akta”)                    | igen        |
| `/kereses`    | Keresés / cédulakatalógus                 | nem         |
| `/akta/:id`   | Rekord részletező (típusonkénti sablon)   | nem         |
| `/kimutatas`  | Statisztika („Kimutatás”)                 | igen        |
| `/modszertan` | Módszertan és jogi tudnivalók             | igen        |
| `/styleguide` | Design system bemutató                    | nem         |

## Mappastruktúra

```
raw/              kézzel letöltött valódi forrásadat (gitignore!)
scripts/          adatgenerálás és import
src/
  adapters/       forrásformátumonkénti átalakítók
  components/     design system komponensek
  data/           zod sémák, adatbetöltés
  search/         keresőworker, normalizálás
  views/          oldalak
public/data/      generált, darabolt JSON (gitignore, a scriptek állítják elő)
```

## Adatok

### Normalizált modell

A `src/data/schema.ts` tartalmazza a zod sémákat és a TypeScript típusokat (`AgentRecord`,
`Manifest`, `Stats`, `CatalogRow`). Az `id`, `source`, `name`, `nameNormalized` kötelező, minden más
mező opcionális; az ismeretlen mezők a `raw` objektumba kerülnek, így semmi nem vész el. A zod csak az
importnál/validálásnál fut, a kliensbe nem kerül be.

### Fájlok a `public/data` mappában

| Fájl                  | Tartalom                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `manifest.json`       | mód (`mock`/`live`), dátum, rekordszámok, csomagok száma                 |
| `stats.json`          | csak aggregált számok (típusonként, évenként, megyénként, kitöltöttség) |
| `records-NNN.json`    | teljes rekordok, `hash(id) % bucketCount` szerint ~400-as csomagokban     |
| `catalog-NNN.json`    | tömör keresőkatalógus (tuple-ök) a keresőworkernek                       |

A rekordoldal csak azt az egy csomagot tölti le, amelyikben a rekord van; az adatbázis egyben nem
tölthető le.

### Tesztadat

```bash
npm run data:mock                    # 6000 fiktív rekord (a predev/prebuild magától is legenerálja, ha hiányzik)
npm run data:mock -- --count 60000   # terheléses próbához
npm run data:validate                # zod-validálás, 0 hibának kell lennie
```

A vezetéknevek mind egyértelműen kitalált tövekből állnak (Próba-, Teszt-, Minta-, Demó-, Fiktív-,
Kitalált-, Példa-), hogy semmilyen valós személlyel ne lehessen összetéveszteni őket. A H-adattár
rekordjainak egy része ékezet nélküli nagybetűs (mágnesszalag-stílus), és néhány név ékezet nélkül
szerepel – így a keresés ékezetfüggetlensége valós helyzetben tesztelhető.

### Adatmód és DEMÓ szalag

A `VITE_DATA_MODE` (`.env`) értéke `mock` vagy `live`. A „FIKTÍV TESZTADAT – DEMÓ” szalag akkor
látszik, ha a mód `mock`, **vagy** ha a betöltött adat manifestje szerint tesztadatról van szó – így egy
elrontott konfiguráció sem tüntetheti el.

### Adapterek és import (M6-hoz előkészítve)

`src/adapters/` – általános CSV és JSON/NDJSON adapter oszlopleképezéssel (`FieldMapping`). A valódi
oszlopneveket az M6 során, a tényleges fájlok ismeretében kell beírni a `scripts/import.config.ts`-be,
utána:

```bash
npm run data:import -- --dry-run   # csak riport (raw/import-report.md)
npm run data:import                # public/data felülírása
```

## Keresés

- **MiniSearch Web Workerben** (`src/search/search.worker.ts`), így a gépelés nem akasztja a felületet.
  A worker a katalógusrészeket maga tölti le és indexeli; a fő szál csak sorindexeket kap vissza
  (átadható `Uint32Array`).
- **Ékezetfüggetlen:** a `normalizeText` (`src/search/normalize.ts`) NFD-bontással eltávolítja az
  ékezeteket, így „gábor” megtalálja a „Gabor”/„GABOR” alakot és fordítva.
- **Elgépelést tűrő:** előtag-keresés + fuzzy (3 betűig 0, 6 betűig 1, fölötte 2 karakter eltérés).
- **Szűrők:** irattípus, születési év tartomány, beszervezés éve, megye (a születési helyből, a
  `src/data/geo.ts` helységnévtára alapján – ismeretlen helynél nem találgat).
- **URL-állapot:** `/kereses?q=gábor&forras=karton6,hadattar&szulTol=1920&szulIg=1940&beszTol=1960&megye=BAR`
  – minden találati lista linkelhető.
- **Virtualizált lista** (`@tanstack/react-virtual`), billentyűzettel: a keresőmezőből ↓ a listára lép,
  ↑/↓, Home/End, PageUp/PageDown, Enter.
- A kérések összevonódnak: amíg egy keresés fut, csak a legújabb várakozó lekérdezés marad meg.

Mért értékek 60 000 fiktív rekorddal (`npm run data:mock -- --count 60000`):

| Mérés                                                    | Eredmény                 |
| -------------------------------------------------------- | ------------------------ |
| Indexépítés (Vitest, Node)                               | ~0,5 s                   |
| Lekérdezés a motorban, gépelésszerű sorozat (Vitest)     | átlag ~9 ms, max ~58 ms  |
| Billentyűleütéstől a kirajzolt találatig (headless Chromium) | átlag ~41 ms, max ~76 ms |

A teljesítményteszt a `src/search/engine.test.ts`-ben fut minden `npm test`-nél.

## Rekordnézetek

A `/akta/:id` oldal a rekord `source` mezője alapján választ sablont (`src/views/record/RecordDocument.tsx`,
`TEMPLATES`):

- **6-os karton** – sárgult kartonlap előnyomott mezőcímkékkel, írógépes kitöltéssel, enyhe
  elcsúszással és tintafolttal.
- **B-napló** – vonalazott főkönyvi lap sorszámozott sorokkal; a kiválasztott sor kiemelve. A szomszédos
  sorok elmosottak, és **nem valódi adatok**: más bejegyzések neve a lapon sosem jelenik meg.
- **H-adattár** – foszforzöld terminál, a mezők karakterenként „töltődnek be” (átugorható;
  `prefers-reduced-motion` esetén azonnal). Képernyőolvasó a teljes, statikus listát kapja.

Minden rekordnézeten: kötelező figyelmeztetés (SPEC 9. pont), forrás megnevezése, link a hivatalos
rekordra (ha van), az eredeti forrásmezők, és ha ugyanez a név más irattípusban is szerepel, a
„Azonos nevű bejegyzés más forrásban is” jelzés – automatikus összevonás nélkül. A hiányzó mezők fekete
kitakarásként jelennek meg „ADAT NEM ÁLL RENDELKEZÉSRE” súgóval.

A `src/views/record/RecordDocument.test.tsx` mindhárom típust **mind az 1024 mezőkombinációval**
(az üreset is beleértve) lerendereli, és ellenőrzi a kitöltött értékeket, a kitakarásokat és a
figyelmeztetést.

**Indexelés:** a `PageMeta` komponens alapból `noindex, nofollow`; csak a nyitóoldal, a Kimutatás és a
Módszertan kapcsolja ki (`indexable`). Ezt teszt is ellenőrzi.

> A helyesbítési kapcsolat címe (`VITE_CONTACT_EMAIL`) jelenleg helyőrző (`helyesbites@example.org`);
> élesítés előtt valódi, figyelt címre kell cserélni.

## Design system

A `/styleguide` oldal mutatja be a komponenseket: `Folder`, `PaperSheet`, `Stamp`, `Redaction`,
`TypewriterText`, `PaperClip`, `TapeLabel`, `RegistryNumber`. A színek és betűk Tailwind tokenként
(`bg-paper`, `text-stamp`, `font-typewriter`, `font-terminal` …) érhetők el, lásd `src/index.css`.

## Jogi és etikai irányelvek

Lásd a specifikáció 9. pontját. Röviden: minden rekordnézeten figyelmeztetés, a rekord- és
keresőoldalak `noindex`-esek, nincs analitika, nincs személyenkénti megosztókártya, nincs kommentelés,
és az adatbázis nem tölthető le egyben.

## Mérföldkövek

- [x] M1 – Váz és design system
- [x] M2 – Séma + tesztadat
- [x] M3 – Keresés
- [x] M4 – Rekordnézetek
- [ ] M5 – Nyitóoldal, statisztika, módszertan
- [ ] M6 – Éles adat bekötése (csak jóváhagyás után!)
- [ ] M7 – Deploy
