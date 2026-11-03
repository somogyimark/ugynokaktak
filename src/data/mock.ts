/**
 * Fictional test data generator (SPEC §6).
 *
 * Every surname is built from obviously made-up stems ("Próba", "Teszt", "Minta", "Demó",
 * "Fiktív", "Kitalált", "Példa"), so no generated name can be mistaken for a real person.
 * Given names, settlements and organisational terms are generic to keep the data realistic.
 */
import { mulberry32 } from '../lib/random';
import { normalizeText } from '../search/normalize';
import { stableId } from './dataset';
import { KNOWN_PLACES } from './geo';
import type { AgentRecord } from './schema';
import type { SourceType } from './sources';

const SURNAMES = [
  'Próbaházi', 'Próbafalvi', 'Próbahegyi', 'Próbaváry', 'Próbás', 'Próbanagy',
  'Tesztelő', 'Tesztessy', 'Tesztvári', 'Tesztmezei', 'Tesztkovács', 'Tesztes',
  'Mintás', 'Mintavári', 'Mintaszegi', 'Mintakövi', 'Mintafi', 'Mintaszabó', 'Mintahorváth',
  'Demó', 'Demóházi', 'Demóssy', 'Demófalvi', 'Demótóth',
  'Fiktív', 'Fiktívy', 'Kitalált', 'Kitaláltfy', 'Példaházi', 'Példássy',
] as const;

const MALE = ['Gábor', 'László', 'István', 'József', 'János', 'Ferenc', 'Zoltán', 'Sándor', 'Péter', 'Tibor', 'Ödön', 'Árpád', 'Imre', 'Győző', 'Béla', 'Lajos', 'Gyula', 'Mihály'] as const;
const FEMALE = ['Mária', 'Erzsébet', 'Katalin', 'Éva', 'Ilona', 'Judit', 'Ágnes', 'Zsuzsanna', 'Margit', 'Erika', 'Irén', 'Júlia', 'Anna', 'Etelka'] as const;

const COVER_NAMES = [
  'Fecske', 'Vándor', 'Kőműves', 'Hegedűs', 'Tanár', 'Rigó', 'Szürke', 'Mérnök', 'Kertész', 'Pék',
  'Holló', 'Sas', 'Bükk', 'Tölgy', 'Tavasz', 'Szilva', 'Patak', 'Garas', 'Kalap', 'Ösvény',
  'Íjász', 'Őrszem', 'Gyöngy', 'Zúzmara', 'Sólyom', 'Kódex', 'Iránytű', 'Mozdony', 'Évkönyv', 'Kút',
] as const;

const CATEGORIES = ['ügynök', 'informátor', 'titkos megbízott', 'titkos munkatárs', 'lakástulajdonos', 'hivatalos kapcsolat'] as const;

const DIRECTORATES = ['III/I', 'III/II', 'III/III', 'III/IV'] as const;
const COUNTY_UNITS = ['Baranya', 'Békés', 'Borsod', 'Csongrád', 'Fejér', 'Győr-Sopron', 'Hajdú-Bihar', 'Heves', 'Pest', 'Somogy', 'Szabolcs', 'Szolnok', 'Tolna', 'Vas', 'Veszprém', 'Zala'] as const;

const ACTIVITIES = [
  'egyházi körök figyelése (fiktív)',
  'üzemi környezet ellenőrzése (fiktív)',
  'külföldi kapcsolatok jelentése (fiktív)',
  'egyetemi ifjúság körében végzett jelentéstétel (fiktív)',
  'kulturális intézmény munkatársainak figyelése (fiktív)',
  'határforgalmi információgyűjtés (fiktív)',
  'lakóhelyi környezet figyelése (fiktív)',
  'szakmai rendezvényekről szóló jelentések (fiktív)',
] as const;

const ABROAD = ['Kolozsvár', 'Kassa', 'Szabadka', 'Bécs', 'Újvidék'] as const;

type Rng = () => number;

const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;
const chance = (rng: Rng, p: number) => rng() < p;
const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
const pad = (n: number, w = 2) => String(n).padStart(w, '0');

function fullDate(rng: Rng, year: number): string {
  return `${year}-${pad(int(rng, 1, 12))}-${pad(int(rng, 1, 28))}`;
}

/** Strips accents and uppercases, imitating 1970s mainframe tape records. */
function tapeCase(s: string): string {
  return s.normalize('NFD').replace(/\p{M}+/gu, '').toUpperCase();
}

interface Person {
  surname: string;
  given: string;
  female: boolean;
  birthYear: number;
  birthDate: string;
  birthPlace: string;
  motherName: string;
  coverName: string;
  recruitmentYear: number;
  recruitmentDate: string;
  unit: string;
  category: string;
  activity: string;
}

function makePerson(rng: Rng): Person {
  const female = chance(rng, 0.27);
  const birthYear = int(rng, 1900, 1966);
  // Recruited as an adult, between 1957 and 1989 (birth years are capped so this range is never empty).
  const earliest = Math.max(1957, birthYear + 18);
  const recruitmentYear = int(rng, earliest, Math.min(1989, earliest + 25));
  const unit = chance(rng, 0.55)
    ? `BM ${pick(rng, DIRECTORATES)}-${int(rng, 1, 7)}. osztály`
    : `${pick(rng, COUNTY_UNITS)} megyei RFK III/III. osztály`;
  return {
    surname: pick(rng, SURNAMES),
    given: female ? pick(rng, FEMALE) : pick(rng, MALE),
    female,
    birthYear,
    birthDate: fullDate(rng, birthYear),
    birthPlace: chance(rng, 0.94) ? pick(rng, KNOWN_PLACES) : pick(rng, ABROAD),
    motherName: `${pick(rng, SURNAMES)} ${pick(rng, FEMALE)}`,
    coverName: pick(rng, COVER_NAMES),
    recruitmentYear,
    recruitmentDate: fullDate(rng, recruitmentYear),
    unit,
    category: pick(rng, CATEGORIES),
    activity: pick(rng, ACTIVITIES),
  };
}

function personName(p: Person, rng: Rng): string {
  // A few records were typed without accents ("Gabor"), as happens in real registers.
  const name = `${p.surname} ${p.given}`;
  return chance(rng, 0.06) ? name.normalize('NFD').replace(/\p{M}+/gu, '') : name;
}

const FILL: Record<SourceType, Record<string, number>> = {
  // Field-fill probabilities per source, mirroring what each register is expected to contain.
  karton6: { coverName: 0.5, birthDate: 0.92, birthYearOnly: 0.1, birthPlace: 0.88, motherName: 0.75, recruitmentDate: 0.82, recruitingUnit: 0.8, category: 0.7, activity: 0.72, registryNumber: 0.97, officialUrl: 0.6 },
  bnaplo: { coverName: 0.15, birthDate: 0.3, birthYearOnly: 0.85, birthPlace: 0.08, motherName: 0, recruitmentDate: 0.78, recruitingUnit: 0.45, category: 0.2, activity: 0, registryNumber: 0.9, officialUrl: 0.6 },
  hadattar: { coverName: 0.88, birthDate: 0.8, birthYearOnly: 0.35, birthPlace: 0.62, motherName: 0.4, recruitmentDate: 0.5, recruitingUnit: 0.55, category: 0.6, activity: 0, registryNumber: 0.95, officialUrl: 0.6 },
};

function makeRecord(source: SourceType, p: Person, rng: Rng, seq: number): AgentRecord {
  const f = FILL[source];
  const has = (field: string) => chance(rng, f[field] ?? 0);
  const tape = source === 'hadattar' && chance(rng, 0.45);
  const baseName = personName(p, rng);
  const name = tape ? tapeCase(baseName) : baseName;

  let registryNumber: string | undefined;
  let raw: Record<string, unknown>;
  switch (source) {
    case 'karton6':
      registryNumber = `6-K/${p.recruitmentYear}/${pad(int(rng, 1, 99999), 5)}`;
      raw = { forras: 'FIKTÍV TESZTADAT', kartonSorszam: seq + 1 };
      break;
    case 'bnaplo': {
      registryNumber = `B-${pad(int(rng, 1, 9999), 4)}/${p.recruitmentYear % 100}`;
      const from = Math.floor(p.recruitmentYear / 5) * 5;
      // Ledger position: 30 numbered rows per page.
      raw = { forras: 'FIKTÍV TESZTADAT', naplo: `B-napló ${from}–${from + 4}`, lap: Math.floor(seq / 30) + 1, sor: (seq % 30) + 1 };
      break;
    }
    case 'hadattar':
      registryNumber = `H-${pad(int(rng, 1, 40))}-${pad(int(rng, 1, 999999), 6)}`;
      raw = { forras: 'FIKTÍV TESZTADAT', szalag: `SZALAG ${pad(int(rng, 1, 40))}`, blokk: int(rng, 1, 4096), rekordTipus: 'HSZ' };
      break;
  }

  const birthDate = has('birthDate') ? (has('birthYearOnly') ? String(p.birthYear) : p.birthDate) : undefined;
  const rec: AgentRecord = {
    id: '',
    source,
    name,
    nameNormalized: normalizeText(name),
    coverName: has('coverName') ? (tape ? tapeCase(p.coverName) : p.coverName) : undefined,
    birthDate,
    birthPlace: has('birthPlace') ? (tape ? tapeCase(p.birthPlace) : p.birthPlace) : undefined,
    motherName: has('motherName') ? (tape ? tapeCase(p.motherName) : p.motherName) : undefined,
    recruitmentDate: has('recruitmentDate') ? (source === 'bnaplo' || chance(rng, 0.7) ? p.recruitmentDate : String(p.recruitmentYear)) : undefined,
    recruitingUnit: has('recruitingUnit') ? p.unit : undefined,
    category: has('category') ? p.category : undefined,
    activity: has('activity') ? p.activity : undefined,
    registryNumber: has('registryNumber') ? registryNumber : undefined,
    officialUrl: undefined,
    raw,
  };
  rec.id = stableId(source, [rec.registryNumber, rec.name, rec.birthDate, String(seq)]);
  if (has('officialUrl')) rec.officialUrl = `https://example.org/demo-forras/${rec.id}`;
  // Drop undefined keys so the JSON stays compact and "missing" means absent.
  for (const key of Object.keys(rec) as (keyof AgentRecord)[]) if (rec[key] === undefined) delete rec[key];
  return rec;
}

export interface MockOptions {
  count: number;
  seed?: number;
}

/** Share of records per source type. */
const SHARE: Record<SourceType, number> = { karton6: 0.36, bnaplo: 0.3, hadattar: 0.34 };

export function generateMockRecords({ count, seed = 19561023 }: MockOptions): AgentRecord[] {
  const rng = mulberry32(seed);
  const records: AgentRecord[] = [];
  const seq: Record<SourceType, number> = { karton6: 0, bnaplo: 0, hadattar: 0 };
  const targets = {
    karton6: Math.round(count * SHARE.karton6),
    bnaplo: Math.round(count * SHARE.bnaplo),
    hadattar: count - Math.round(count * SHARE.karton6) - Math.round(count * SHARE.bnaplo),
  } satisfies Record<SourceType, number>;
  const remaining = (s: SourceType) => targets[s] - seq[s];
  const order: SourceType[] = ['karton6', 'bnaplo', 'hadattar'];

  while (records.length < count) {
    const person = makePerson(rng);
    const open = order.filter((s) => remaining(s) > 0);
    const first = pick(rng, open);
    const sources = new Set<SourceType>([first]);
    // ~7% of persons also appear in another register (same name, maybe different details).
    if (chance(rng, 0.07)) {
      const other = open.filter((s) => s !== first);
      if (other.length) sources.add(pick(rng, other));
    }
    for (const s of sources) {
      if (remaining(s) <= 0 || records.length >= count) continue;
      records.push(makeRecord(s, person, rng, seq[s]++));
    }
  }
  return records;
}
