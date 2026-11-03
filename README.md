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
- [ ] M2 – Séma + tesztadat
- [ ] M3 – Keresés
- [ ] M4 – Rekordnézetek
- [ ] M5 – Nyitóoldal, statisztika, módszertan
- [ ] M6 – Éles adat bekötése (csak jóváhagyás után!)
- [ ] M7 – Deploy
