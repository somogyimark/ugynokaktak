# Projekt: „Nyitott Akták” – titkosakta-stílusú adatböngésző

## 1. Kontextus és cél

2026. november 4-től a nyitottaktak.hu oldalon nyilvános lesz több tízezer egykori állambiztonsági ügynök neve és alapadata. Három irattípus érhető el:

- **6-os karton**: az ügynökök személyazonosító adatai és főbb tevékenységeik.
- **B-napló**: a beszervezési dossziék ügynökeinek nevei (nyilvántartási napló).
- **H-adattár**: hálózati személyek adatai és fedőnevei, amelyeket az 1970-es évektől mágnesszalagon rögzítettek.

Összesen kb. 50–60 ezer név, a forrásokban lehet átfedés. 2027. február 25-ig jön egy negyedik típus, a **B-dosszié** (20–több száz oldalas dokumentumok, kb. 9000 db). Erre az architektúrának bővíthetőnek kell lennie, de most nem kell megvalósítani.

**Cél:** egy látványos, gyors, mobilon is jól működő statikus weboldal, amely ezeket az adatokat úgy mutatja be, mintha a felhasználó egy titkos levéltári aktát lapozna. Inspiráció: jmail.world (ismerős felület hű másolata adja az élményt, itt ez az aktaborító, a kartonlap, a napló és a terminál).

**A legfontosabb megkötés:** a valódi adatok formátuma még NEM ismert (lehet CSV, JSON, PDF, HTML keresőfelület, vagy csak egyenkénti lekérdezés). Ezért az egész oldalt **fiktív tesztadaton** kell felépíteni, egy cserélhető adapterréteggel, hogy az éles adat megérkezésekor csak az adaptert kelljen megírni.

## 2. Munkamódszer (Claude Code-nak)

- Haladj mérföldkövenként (10. pont), mindegyik végén futtasd a buildet és a teszteket, és commitolj.
- Mielőtt egy mérföldkövet elkezdesz, írd le röviden a tervet, és várj jóváhagyásra, ha valami eltér ettől a specifikációtól.
- **Soha ne találj ki valós személyre utaló adatot**, és ne próbálj a nyitottaktak.hu oldalról automatikusan letölteni/lekaparni adatot engedély nélkül. Az adatforrás bekötése külön, kézzel jóváhagyott lépés (M6).
- Kódkommentek és változónevek angolul, a felület szövegei magyarul.

## 3. Technológia

- **Vite + React + TypeScript** (strict mód).
- **Tailwind CSS** a layouthoz, saját CSS a „papír” effektekhez.
- **MiniSearch** a kliensoldali kereséshez, **Web Workerben** futtatva, hogy a UI ne akadjon.
- **zod** az adatséma validálásához az importnál.
- **React Router** (vagy TanStack Router) az oldalakhoz, a keresési állapot az URL query paraméterekben legyen, hogy a találatok linkelhetők legyenek.
- Diagramokhoz: **Recharts** vagy könnyű saját SVG.
- Tesztek: **Vitest** (adapter + keresés normalizálás), opcionálisan Playwright smoke teszt.
- Kimenet: teljesen statikus build (Cloudflare Pages / Vercel / GitHub Pages), backend nélkül.

## 4. Mappastruktúra

```
/raw/                  # ide kerül kézzel a letöltött valódi forrásadat (gitignore!)
/scripts/
  generate-mock.ts     # fiktív tesztadat generálása
  import.ts            # raw -> normalizált JSON (adaptereken keresztül)
/src/
  adapters/            # forrásformátumonkénti átalakítók (csv.ts, json.ts, html.ts ...)
  data/schema.ts       # zod sémák + TS típusok
  search/              # worker, index építés, magyar ékezet-normalizálás
  components/          # design system komponensek
  views/               # oldalak
/public/data/          # normalizált, darabolt JSON (records-*.json, stats.json, index meta)
```

## 5. Adatmodell (normalizált)

```ts
type SourceType = "karton6" | "bnaplo" | "hadattar"; // később: "bdosszie"

interface AgentRecord {
  id: string;                 // stabil, determinisztikus azonosító
  source: SourceType;
  name: string;               // ahogy a forrásban szerepel
  nameNormalized: string;     // ékezet nélkül, kisbetűvel, kereséshez
  coverName?: string;         // fedőnév
  birthDate?: string;         // amilyen pontossággal ismert (év / teljes dátum)
  birthPlace?: string;
  motherName?: string;
  recruitmentDate?: string;
  recruitingUnit?: string;    // beszervező egység / szerv
  category?: string;          // pl. ügynök, informátor, titkos megbízott (ha a forrás tartalmazza)
  activity?: string;          // főbb tevékenység (6-os karton)
  registryNumber?: string;    // nyilvántartási / dosszié szám
  officialUrl?: string;       // link az eredeti hivatalos rekordra
  raw?: Record<string, unknown>; // az eredeti mezők, semmi ne vesszen el
}
```

- Minden mező opcionális a `id`, `source`, `name`, `nameNormalized` kivételével, mert nem tudjuk, mi lesz a forrásban.
- A UI minden mezőnél kezelje a hiányt elegánsan (pl. kitakart sávként jelenjen meg „ADAT NEM ÁLL RENDELKEZÉSRE” tooltippel).
- Átfedés kezelése: NE vond össze automatikusan a különböző forrásokban szereplő azonos nevű rekordokat. Legfeljebb jelezd: „Azonos nevű bejegyzés más forrásban is” – névegyezés nem bizonyít személyazonosságot.

## 6. Tesztadat (M2)

- `scripts/generate-mock.ts` generáljon ~6000 rekordot, a három típus között elosztva, reális mezőkitöltöttséggel (pl. a H-adattárban gyakori a fedőnév, a B-naplóban kevés a mező).
- A nevek legyenek egyértelműen fiktívek: használj kitalált vezetékneveket (pl. „Próbaházi”, „Tesztelő”, „Mintás”, „Demó”), hogy egyetlen valós személlyel se lehessen összetéveszteni.
- Amíg tesztadat fut, a felületen legyen állandó, jól látható **„FIKTÍV TESZTADAT – DEMÓ”** vízjel/szalag. Egy `VITE_DATA_MODE=mock|live` környezeti változó vezérelje.

## 7. Oldalak és nézetek

1. **Nyitóoldal („Az akta”)** – egy zárt kartondosszié-borító „SZIGORÚAN TITKOS” pecséttel, iktatószámmal. Kattintásra/görgetésre kinyílik (rövid animáció). Alatta: egy nagy kereső mező írógép-stílusban, és a fő számok (összes rekord, típusonként), számláló-animációval.
2. **Keresés / katalógus** – levéltári cédulakatalógus érzés. Szűrők: forrástípus, születési év tartomány, (ha lesz) megye/település, beszervezés éve. Ékezetfüggetlen, elgépelést tűrő keresés névre és fedőnévre. Virtualizált lista (react-window vagy hasonló), mert 60 ezer elem lehet.
3. **Rekord részletező** – típusonként saját sablon:
   - **6-os karton**: beszkennelt, kicsit sárgult kartonlap, előnyomott mezőcímkékkel, a kitöltött adatok írógép-betűvel, enyhe elcsúszással és tintafoltossággal.
   - **B-napló**: vonalazott főkönyvi lap, sorszámozott sorokkal, a kiválasztott sor kiemelve, a szomszédos sorok elmosva.
   - **H-adattár**: zöld-fekete foszfor terminál / mágnesszalag-kiolvasás, a mezők „betöltődnek” karakterenként (reduced-motion esetén azonnal).
   - Minden részletezőn: forrás megnevezése, link a hivatalos rekordra (ha van), és a 9. pont szerinti figyelmeztetés.
4. **Statisztika („Kimutatás”)** – egy hivatalos belső jelentés formájában: rekordszám típusonként, beszervezések évenként (idővonal), ha van helyadat, egy egyszerű megyetérkép (SVG). Csak aggregált adatok.
5. **Módszertan és jogi tudnivalók** – honnan jön az adat, mikor frissült, mit jelent az egyes irattípus, korlátok, eltávolítási/helyesbítési kérés elérhetősége.

## 8. Design system

- **Betűk:** Special Elite vagy Courier Prime (írógép), egy kondenzált sans a pecsétekhez/fejlécekhez (pl. Oswald), IBM Plex Mono a terminálhoz. Mindegyiknek legyen fallback stackje.
- **Színek:** sárgult papír (#efe6d2 körül), barna kartondosszié, fekete tinta, piros pecsét (#b3261e), kék golyóstoll-jelölés, terminálzöld (#33ff66) fekete háttéren.
- **Komponensek:** `Folder`, `PaperSheet` (textúra CSS-sel/SVG zajjal, nem képpel), `Stamp` (enyhén elforgatva, kopott széllel), `Redaction` (fekete sáv, hoverre nem fed fel semmit), `TypewriterText`, `PaperClip`, `TapeLabel`, `RegistryNumber`.
- **Akadálymentesség:** valódi szöveg legyen minden (ne kép), megfelelő kontraszt, billentyűzettel kezelhető kereső és lista, `prefers-reduced-motion` tiszteletben tartása.
- **Mobil:** a kartonlap és a napló mobilon is olvasható legyen (szűk képernyőn egyoszlopos „karton”).
- Sötét mód: a terminál nézet eleve sötét, a papír nézetek maradhatnak világosak, de a keret/háttér kövesse a rendszer témáját.

## 9. Jogi és etikai irányelvek (kötelező)

Valós, élő vagy elhunyt személyek neveiről van szó, ezért:

- Minden rekordnézeten jól látható szöveg: *„A név szerepelése a nyilvántartásban önmagában nem bizonyítja, hogy az illető együttműködött, és azonos nevű személyek összetéveszthetők. Az adatok forrása: [hivatalos forrás]. Hibás vagy félrevezető bejegyzés esetén írj ide: …”*
- Az egyes rekordoldalakon `<meta name="robots" content="noindex">`, hogy a keresőmotorok ne indexeljék a neveket egyenként; csak a nyitóoldal, statisztika és módszertan legyen indexelhető.
- Nincs analitika vagy követés, ami a keresett neveket naplózná.
- Nincs megosztásra optimalizált „leleplező” kártya (OG-kép) egyes személyekről.
- Ne legyen kommentelés, értékelés, „ismerős?” jelölés vagy bármi, ami pellengérre állítást ösztönöz.
- A teljes adatbázis ne legyen egyben letölthető az oldalról.
- Az adatforrás bekötésénél (M6) tartsd tiszteletben a nyitottaktak.hu felhasználási feltételeit és robots.txt-jét; ha nincs hivatalos tömeges letöltés, a megoldás a hivatalos rekordra mutató linkelés legyen, ne a lekaparás.

## 10. Mérföldkövek és elfogadási feltételek

**M1 – Váz és design system**
Vite projekt, routing, Tailwind, betűk, a 8. pont komponensei egy `/styleguide` oldalon bemutatva. ✅ Build hiba nélkül, a styleguide mobilon és asztalin is rendben.

**M2 – Séma + tesztadat**
`schema.ts` zod-dal, `generate-mock.ts`, darabolt JSON kimenet a `/public/data`-ba, DEMÓ vízjel. ✅ Validálás 0 hibával fut, a vízjel mock módban mindig látszik.

**M3 – Keresés**
Worker-alapú MiniSearch, ékezetfüggetlen és elgépelést tűrő keresés, szűrők, URL-állapot, virtualizált lista. ✅ 60 ezer rekordnál a gépelés közbeni keresés 100 ms alatt reagál átlagos laptopon; „gábor” megtalálja a „Gabor”-t és fordítva.

**M4 – Rekordnézetek**
A három típusspecifikus sablon, hiányzó mezők kezelése, figyelmeztetés, noindex. ✅ Mindhárom típus minden mezőkombinációval (üres is) hibátlanul renderel.

**M5 – Nyitóoldal, statisztika, módszertan**
Aktaborító-animáció, számlálók, „Kimutatás” oldal, jogi oldal. ✅ Lighthouse: Performance ≥ 85, Accessibility ≥ 95 mobilon.

**M6 – Éles adat bekötése (csak jóváhagyás után!)**
Megvizsgálni az éles forrás formátumát, megírni a megfelelő adaptert a `src/adapters/`-be, `scripts/import.ts` futtatása a `/raw` tartalmán, validációs riport (hány rekord, hány hibás, mely mezők hiányoznak). `VITE_DATA_MODE=live`. ✅ Az import riport átnézve, a DEMÓ vízjel eltűnt, a számok egyeznek a forrás által közöltekkel.

**M7 – Deploy**
Statikus build kitelepítése, egyedi 404, `robots.txt`. ✅ Éles URL működik, a rekordoldalak noindexesek.

## 11. Az éles nap teendőlistája (M6-hoz)

1. Megnézni a nyitottaktak.hu-t: van-e letölthető állomány vagy API, milyen mezők vannak, mik a felhasználási feltételek.
2. Ha van letölthető fájl: bemásolni a `/raw`-ba, megírni az adaptert, futtatni az importot, átnézni a riportot.
3. Ha csak keresőfelület van: NEM kaparjuk le. Az oldal ilyenkor a vizuális élményt és az aggregált adatokat adja (ha publikusak), és a hivatalos keresőre mutató linkekkel működik. Ehhez a keresés-nézet kapjon egy „továbbítás a hivatalos keresőbe” módot.
4. Frissíteni a módszertan oldalt a pontos forrással és dátummal.
5. Deploy.

## 12. Későbbi bővítés (most nem kell)

- B-dosszié típus (2027. február 25-ig): többoldalas dokumentum-néző, lapozás, PDF/kép megjelenítés. Az adatmodellben és a routingban hagyj neki helyet.
