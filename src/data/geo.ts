import { normalizeText } from '../search/normalize';

/** Hungarian counties (present-day boundaries) with a tile position for the schematic map. */
export interface County {
  code: string;
  name: string;
  /** Column / row on a 6×4 tile cartogram (approximate geography, not a real map). */
  col: number;
  row: number;
}

export const COUNTIES: readonly County[] = [
  { code: 'GYM', name: 'Győr-Moson-Sopron', col: 0, row: 0 },
  { code: 'KOM', name: 'Komárom-Esztergom', col: 1, row: 0 },
  { code: 'NOG', name: 'Nógrád', col: 2, row: 0 },
  { code: 'HEV', name: 'Heves', col: 3, row: 0 },
  { code: 'BAZ', name: 'Borsod-Abaúj-Zemplén', col: 4, row: 0 },
  { code: 'SZA', name: 'Szabolcs-Szatmár-Bereg', col: 5, row: 0 },
  { code: 'VAS', name: 'Vas', col: 0, row: 1 },
  { code: 'VES', name: 'Veszprém', col: 1, row: 1 },
  { code: 'BP', name: 'Budapest', col: 2, row: 1 },
  { code: 'PES', name: 'Pest', col: 3, row: 1 },
  { code: 'JNS', name: 'Jász-Nagykun-Szolnok', col: 4, row: 1 },
  { code: 'HAB', name: 'Hajdú-Bihar', col: 5, row: 1 },
  { code: 'ZAL', name: 'Zala', col: 0, row: 2 },
  { code: 'SOM', name: 'Somogy', col: 1, row: 2 },
  { code: 'FEJ', name: 'Fejér', col: 2, row: 2 },
  { code: 'BAC', name: 'Bács-Kiskun', col: 3, row: 2 },
  { code: 'CSO', name: 'Csongrád-Csanád', col: 4, row: 2 },
  { code: 'BEK', name: 'Békés', col: 5, row: 2 },
  { code: 'BAR', name: 'Baranya', col: 1, row: 3 },
  { code: 'TOL', name: 'Tolna', col: 2, row: 3 },
];

export const COUNTY_BY_CODE: ReadonlyMap<string, County> = new Map(COUNTIES.map((c) => [c.code, c]));

/** Settlement → county code. A small gazetteer; extend it when live data arrives. */
const PLACES: Record<string, string[]> = {
  BP: ['Budapest'],
  BAC: ['Kecskemét', 'Baja', 'Kiskunhalas', 'Kalocsa', 'Kiskunfélegyháza'],
  BAR: ['Pécs', 'Mohács', 'Komló', 'Siklós'],
  BEK: ['Békéscsaba', 'Gyula', 'Orosháza', 'Szarvas'],
  BAZ: ['Miskolc', 'Ózd', 'Kazincbarcika', 'Sárospatak', 'Sátoraljaújhely'],
  CSO: ['Szeged', 'Hódmezővásárhely', 'Makó', 'Szentes'],
  FEJ: ['Székesfehérvár', 'Dunaújváros', 'Mór'],
  GYM: ['Győr', 'Sopron', 'Mosonmagyaróvár', 'Csorna'],
  HAB: ['Debrecen', 'Hajdúböszörmény', 'Berettyóújfalu', 'Hajdúszoboszló'],
  HEV: ['Eger', 'Gyöngyös', 'Hatvan'],
  JNS: ['Szolnok', 'Jászberény', 'Karcag', 'Törökszentmiklós'],
  KOM: ['Tatabánya', 'Esztergom', 'Komárom', 'Tata'],
  NOG: ['Salgótarján', 'Balassagyarmat'],
  PES: ['Vác', 'Cegléd', 'Szentendre', 'Gödöllő', 'Nagykőrös'],
  SOM: ['Kaposvár', 'Siófok', 'Marcali'],
  SZA: ['Nyíregyháza', 'Mátészalka', 'Kisvárda'],
  TOL: ['Szekszárd', 'Paks', 'Dombóvár'],
  VAS: ['Szombathely', 'Körmend', 'Sárvár'],
  VES: ['Veszprém', 'Pápa', 'Ajka', 'Várpalota'],
  ZAL: ['Zalaegerszeg', 'Nagykanizsa', 'Keszthely'],
};

const PLACE_TO_COUNTY = new Map<string, string>();
for (const [code, places] of Object.entries(PLACES)) {
  for (const place of places) PLACE_TO_COUNTY.set(normalizeText(place), code);
}

/** All settlements in the gazetteer (used by the mock generator). */
export const KNOWN_PLACES: readonly string[] = Object.values(PLACES).flat();

/**
 * Resolves a free-form birthplace ("Szeged", "SZEGED", "Budapest XI. ker.") to a county code.
 * Returns null when unknown – never guesses.
 */
export function countyOfPlace(place: string | undefined | null): string | null {
  if (!place) return null;
  const norm = normalizeText(place);
  const direct = PLACE_TO_COUNTY.get(norm);
  if (direct) return direct;
  const first = norm.split(' ')[0];
  return (first && PLACE_TO_COUNTY.get(first)) || null;
}
