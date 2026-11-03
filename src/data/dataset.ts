/**
 * Pure helpers shared by the build scripts (mock generator, importer) and the client:
 * stable ids, bucketing, catalog rows and aggregated statistics. No I/O here.
 */
import { fnv1a } from '../lib/random';
import { extractYear, normalizeText } from '../search/normalize';
import { countyOfPlace } from './geo';
import type { AgentRecord, CatalogRow, Manifest, Stats } from './schema';
import { SCHEMA_VERSION } from './model';
import { SOURCE_TYPES, SOURCES, type SourceType } from './sources';

/** Target number of records per detail bucket file. */
export const RECORDS_PER_BUCKET = 400;
/** Rows per search-catalog chunk. */
export const ROWS_PER_CATALOG_CHUNK = 10_000;

export const DATA_DIR = 'data';
export const MANIFEST_FILE = 'manifest.json';
export const STATS_FILE = 'stats.json';
export const bucketFile = (i: number) => `records-${String(i).padStart(3, '0')}.json`;
export const catalogFile = (i: number) => `catalog-${String(i).padStart(3, '0')}.json`;

/**
 * Deterministic id from the source type and identifying parts. ~64 bits from two
 * differently-seeded 32-bit hashes; the dataset builder still checks for collisions.
 */
export function stableId(source: SourceType, parts: readonly (string | undefined | null)[]): string {
  const key = [source, ...parts.map((p) => normalizeText(p ?? ''))].join('|');
  const a = fnv1a(key).toString(36).padStart(7, '0');
  const b = fnv1a(`#${key}#`).toString(36).padStart(7, '0');
  return `${SOURCES[source].idPrefix}-${a}${b}`;
}

/** Which bucket file holds a record. */
export function bucketOf(id: string, bucketCount: number): number {
  return fnv1a(id) % bucketCount;
}

export function toCatalogRow(r: AgentRecord): CatalogRow {
  return [
    r.id,
    r.source,
    r.name,
    r.coverName ?? null,
    extractYear(r.birthDate),
    r.birthPlace ?? null,
    countyOfPlace(r.birthPlace),
    extractYear(r.recruitmentDate),
    r.registryNumber ?? null,
  ];
}

const emptyBySource = <T>(make: () => T) =>
  Object.fromEntries(SOURCE_TYPES.map((s) => [s, make()])) as Record<SourceType, T>;

export function computeStats(records: readonly AgentRecord[], generatedAt: string): Stats {
  const counts = emptyBySource(() => 0);
  const recruitmentsByYear = emptyBySource<Record<string, number>>(() => ({}));
  const fieldCoverage = emptyBySource<Record<string, number>>(() => ({}));
  const birthDecades: Record<string, number> = {};
  const byCounty: Record<string, number> = {};
  let unknownCounty = 0;
  const sourcesByName = new Map<string, Set<SourceType>>();

  for (const r of records) {
    counts[r.source]++;
    const ry = extractYear(r.recruitmentDate);
    if (ry !== null) recruitmentsByYear[r.source][ry] = (recruitmentsByYear[r.source][ry] ?? 0) + 1;
    const by = extractYear(r.birthDate);
    if (by !== null) {
      const decade = String(Math.floor(by / 10) * 10);
      birthDecades[decade] = (birthDecades[decade] ?? 0) + 1;
    }
    const county = countyOfPlace(r.birthPlace);
    if (county) byCounty[county] = (byCounty[county] ?? 0) + 1;
    else unknownCounty++;
    for (const [key, value] of Object.entries(r)) {
      if (value !== undefined && key !== 'raw') fieldCoverage[r.source][key] = (fieldCoverage[r.source][key] ?? 0) + 1;
    }
    let set = sourcesByName.get(r.nameNormalized);
    if (!set) sourcesByName.set(r.nameNormalized, (set = new Set()));
    set.add(r.source);
  }

  let crossSourceNames = 0;
  for (const set of sourcesByName.values()) if (set.size > 1) crossSourceNames++;

  return {
    generatedAt,
    totalRecords: records.length,
    counts,
    recruitmentsByYear,
    birthDecades,
    byCounty,
    unknownCounty,
    fieldCoverage,
    crossSourceNames,
  };
}

/** One `records-NNN.json` file. */
export interface RecordBucket {
  records: AgentRecord[];
  /**
   * id → other source types that contain a record with exactly the same normalised name.
   * Only an "also appears elsewhere" hint – never proof of identity, never merged.
   */
  otherSources: Record<string, SourceType[]>;
}

export interface Dataset {
  manifest: Manifest;
  stats: Stats;
  buckets: RecordBucket[];
  catalog: CatalogRow[][];
}

export interface BuildOptions {
  mode: 'mock' | 'live';
  sourceDescription: string;
  generatedAt?: string;
}

/** Splits validated records into the on-disk layout. Throws on duplicate ids. */
export function buildDataset(records: readonly AgentRecord[], opts: BuildOptions): Dataset {
  const seen = new Set<string>();
  for (const r of records) {
    if (seen.has(r.id)) throw new Error(`Duplicate record id: ${r.id}`);
    seen.add(r.id);
  }
  const generatedAt = opts.generatedAt ?? new Date().toISOString();
  const bucketCount = Math.max(1, Math.ceil(records.length / RECORDS_PER_BUCKET));
  const sourcesByName = new Map<string, Set<SourceType>>();
  for (const r of records) {
    let set = sourcesByName.get(r.nameNormalized);
    if (!set) sourcesByName.set(r.nameNormalized, (set = new Set()));
    set.add(r.source);
  }
  const buckets: RecordBucket[] = Array.from({ length: bucketCount }, () => ({ records: [], otherSources: {} }));
  for (const r of records) {
    const bucket = buckets[bucketOf(r.id, bucketCount)]!;
    bucket.records.push(r);
    const others = SOURCE_TYPES.filter((s) => s !== r.source && sourcesByName.get(r.nameNormalized)!.has(s));
    if (others.length) bucket.otherSources[r.id] = others;
  }

  const rows = records.map(toCatalogRow);
  const catalog: CatalogRow[][] = [];
  for (let i = 0; i < rows.length; i += ROWS_PER_CATALOG_CHUNK) catalog.push(rows.slice(i, i + ROWS_PER_CATALOG_CHUNK));
  if (catalog.length === 0) catalog.push([]);

  const stats = computeStats(records, generatedAt);
  const manifest: Manifest = {
    schemaVersion: SCHEMA_VERSION,
    mode: opts.mode,
    generatedAt,
    sourceDescription: opts.sourceDescription,
    totalRecords: records.length,
    counts: stats.counts,
    bucketCount,
    catalogChunks: catalog.length,
  };
  return { manifest, stats, buckets, catalog };
}
