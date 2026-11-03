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
- GSAP + ScrollTrigger a görgetéshez kötött mozgásokhoz – külön, lusta chunkban töltődik, és
  `prefers-reduced-motion` esetén be sem töltődik
- Vitest a tesztekhez

### Interakciók és mozgás

- **Olvasóterem-hangulat:** faerezetes asztallap, filmszemcse, és egy asztali lámpa, ami látogatásonként
  egyszer pislákolva felkapcsol. Egérrel a lámpa követi a kurzort: a fénykörön kívül a szoba
  elsötétül (legfeljebb annyira, hogy a szöveg kontrasztja WCAG AA marad), a fénycsóvában por száll, a
  papír a lámpa alatt felmelegszik. Érintőképernyőn és `prefers-contrast: more` esetén csak a statikus
  fény marad.
- **Asztali kellékek** (széles képernyőn): töltőtoll, ceruza, pecsételő és párna, gemkapcsok, kávéfolt,
  cetli – az egérrel enyhe parallaxisban mozognak. A dosszié borítója kopott sarkú, zsinóros zárógombbal.
- **Nyitóoldal:** a dosszié kicsit követi az egeret, a „Szigorúan titkos” pecsét rácsap, kinyitáskor a
  lapok sorban kicsúsznak; az „Az irattár” szakasz széles képernyőn kitűzve marad, és görgetésre egymásra
  kerül a három irattípus mintalapja (ezek csak kitakart sávokat tartalmaznak, adatot nem). A keresőmező
  fiktív példaneveket gépel, a számlálók mechanikus dobként pörögnek be.
- **Rekordok:** a kartont az írógép mezőnként tölti ki, majd „Iktatva” pecsét kerül rá, és a lap egérre
  megbillen; a naplóban szövegkiemelő húz végig a soron; a terminál CRT-ként kapcsol be, a szalagorsók
  olvasás közben forognak.
- **Katalógus és kimutatás:** a cédulák sorban kihúzódnak a fiókból; a diagramok görgetésre rajzolódnak ki.
- **Oldalváltás:** View Transitions API (ahol támogatott), a fejléc és a DEMÓ-szalag helyben marad.
- **Hang és zene:** a fejléc „Hang” kapcsolójával írógép-, terminál- és pecséthangok, a „Zene”
  kapcsolóval korhű aláfestés: lassú analóg szintipad A-mollban, mély drón, zenélődoboz-motívum
  szalagvisszhanggal, szalagsercegés, és időnként egy távoli rövidhullámú „számállomás” morzejelei. Minden
  élőben, WebAudióval szól, hangfájl nincs. Alapból mindkettő ki van kapcsolva; a választás csak a
  böngészőben tárolódik, és a bekapcsolt zene a böngésző szabályai miatt az első kattintásra indul.
- **Billentyűzet:** a `/` bárhonnan a keresőmezőre ugrik.

Csökkentett mozgás kérésekor minden azonnal, végállapotban jelenik meg.

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
  data/           zod sémák (schema.ts), zod-mentes modellkonstansok (model.ts),
                  adatbetöltés (client.ts), csomagolás (dataset.ts), tesztadat (mock.ts)
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
| `records-NNN.json`    | `{ records, otherSources }`: teljes rekordok `hash(id) % bucketCount` szerint ~400-as csomagokban, és az azonos nevű, más forrásbeli bejegyzések jelzése |
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

## Nyitóoldal, Kimutatás, Módszertan

- **Nyitóoldal („Az akta”)** – zárt kartondosszié „SZIGORÚAN TITKOS” pecséttel és iktatószámmal; kattintásra,
  gombbal vagy görgetésre kinyílik. Alatta írógépes kereső és számláló-animációs összesítő (csökkentett
  mozgásnál azonnal a végérték).
- **Kimutatás** – „belső jelentés” formában, csak aggregált adatokból (`stats.json`): rekordszám
  irattípusonként, beszervezések évenként (irattípusonkénti kis többszörösök, közös skálán), sematikus
  megye-csempetérkép egyárnyalatú skálával, születési évtizedek, mezőkitöltöttség. Minden diagramhoz
  táblázatos nézet és hover-súgó tartozik.
- **Módszertan és jogi tudnivalók** – adatforrás és frissítés dátuma (a manifestből), irattípusok, korlátok,
  a keresés működése, adatvédelmi elvek, eltávolítási/helyesbítési kérés.

### Lighthouse (mobil, 6000 rekord, `vite preview`)

| Oldal              | Performance | Accessibility | Best practices |
| ------------------ | ----------- | ------------- | -------------- |
| `/`                | 92          | 100           | 100            |
| `/kimutatas`       | 91          | 100           | 100            |
| `/modszertan`      | 94          | 100           | 100            |
| `/kereses?q=gabor` | 85          | 100           | 100            |
| `/akta/…` (karton) | 86          | 100           | 100            |
| `/akta/…` (napló)  | 90          | 100           | 100            |

A nyitóoldal a fő csomagban van (nincs plusz hálózati kör), a többi oldal lustán töltődik. A zod
kizárólag a scriptekben és tesztekben fut, a kliensbe nem kerül be. Az „azonos nevű bejegyzés más
forrásban” jelzést a build előre kiszámolja a rekordcsomagokba, így a rekordoldalnak nem kell a teljes
keresőkatalógust letöltenie.

## Döntések és értelmezések

- **Megye:** a normalizált modellben nincs megye mező, ezért a megyét a születési helyből vezetjük le
  (`src/data/geo.ts`, mai megyehatárok); ismeretlen helynél nem találgatunk. Élesítéskor a helységnévtárat
  bővíteni kell.
- **Megyetérkép:** sematikus csempetérkép (hozzávetőleges elhelyezkedés), nem pontos határvonalas térkép.
- **B-napló szomszédos sorai:** elmosott helykitöltők, nem valódi bejegyzések – más személyek adatai
  így semmilyen formában (DOM, vágólap, képernyőolvasó) nem szivárognak ki.
- **Tesztadat:** a vezetéknevek kitaláltak; a keresztnevek, települések és szervezeti megnevezések
  általánosak, hogy a felület valósághű legyen. A tevékenység-szövegek „(fiktív)” jelölést kapnak.
- **„Egyben nem letölthető”:** a kliensoldali kereséshez a tömör katalógus részekben töltődik le, a
  teljes rekordok csak csomagonként; letöltés gomb vagy egyfájlos export nincs. 60 000 rekordnál a
  katalógus kb. 6 MB tömörítetlenül (gzip/brotli után kb. 1 MB), ezt csak a keresőoldal tölti le.

## Nyitott teendők

- `VITE_CONTACT_EMAIL`: valódi, figyelt helyesbítési cím (most helyőrző).
- M6: az éles forrás vizsgálata, `scripts/import.config.ts` kitöltése, import riport, `VITE_DATA_MODE=live`,
  valamint a „továbbítás a hivatalos keresőbe” mód, ha csak keresőfelület lesz (SPEC 11.3).
- M7: deploy, egyedi 404 a tárhelyen, `robots.txt` (a Lighthouse SEO-pontszáma emiatt most 91).

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
- [x] M5 – Nyitóoldal, statisztika, módszertan
- [ ] M6 – Éles adat bekötése (csak jóváhagyás után!)
- [ ] M7 – Deploy
