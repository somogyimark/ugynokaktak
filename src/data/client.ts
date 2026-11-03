/**
 * Client-side data access. Fetches the chunked JSON files from /public/data and caches
 * them in memory. Records are loaded one bucket at a time – the full dataset is never
 * fetched in one piece.
 */
import { bucketFile, bucketOf, catalogFile, DATA_DIR, MANIFEST_FILE, STATS_FILE, type RecordBucket } from './dataset';
import type { AgentRecord, CatalogRow, Manifest, Stats } from './schema';
import type { SourceType } from './sources';

const base = `${import.meta.env.BASE_URL}${DATA_DIR}/`;
const cache = new Map<string, Promise<unknown>>();

function getJson<T>(file: string): Promise<T> {
  let p = cache.get(file);
  if (!p) {
    p = fetch(base + file).then((res) => {
      if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
      return res.json() as Promise<unknown>;
    });
    p.catch(() => cache.delete(file));
    cache.set(file, p);
  }
  return p as Promise<T>;
}

export const loadManifest = () => getJson<Manifest>(MANIFEST_FILE);
export const loadStats = () => getJson<Stats>(STATS_FILE);

export interface LoadedRecord {
  record: AgentRecord;
  /** Other source types with a same-name entry (a hint only, not identity). */
  otherSources: SourceType[];
}

/** Loads a single record by id (one bucket file), or null when it does not exist. */
export async function loadRecord(id: string): Promise<LoadedRecord | null> {
  const manifest = await loadManifest();
  const bucket = await getJson<RecordBucket>(bucketFile(bucketOf(id, manifest.bucketCount)));
  const record = bucket.records.find((r) => r.id === id);
  return record ? { record, otherSources: bucket.otherSources[id] ?? [] } : null;
}

/** Loads the full search catalog (all chunks) for result display on the search page. */
export async function loadCatalog(): Promise<CatalogRow[]> {
  const manifest = await loadManifest();
  const chunks = await Promise.all(Array.from({ length: manifest.catalogChunks }, (_, i) => getJson<CatalogRow[]>(catalogFile(i))));
  return chunks.flat();
}

/** Absolute URLs of the catalog chunks (for the search worker). */
export async function catalogUrls(): Promise<string[]> {
  const manifest = await loadManifest();
  return Array.from({ length: manifest.catalogChunks }, (_, i) => new URL(base + catalogFile(i), location.href).href);
}
