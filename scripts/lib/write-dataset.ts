import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildDataset, bucketFile, catalogFile, MANIFEST_FILE, STATS_FILE, type BuildOptions } from '../../src/data/dataset';
import type { AgentRecord } from '../../src/data/schema';

export const PUBLIC_DATA_DIR = join(import.meta.dirname, '..', '..', 'public', 'data');

/** Writes the chunked dataset (manifest, stats, record buckets, search catalog) to `outDir`. */
export async function writeDataset(records: readonly AgentRecord[], opts: BuildOptions, outDir = PUBLIC_DATA_DIR) {
  const ds = buildDataset(records, opts);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const json = (v: unknown) => JSON.stringify(v);
  await writeFile(join(outDir, MANIFEST_FILE), JSON.stringify(ds.manifest, null, 2));
  await writeFile(join(outDir, STATS_FILE), json(ds.stats));
  await Promise.all(ds.buckets.map((b, i) => writeFile(join(outDir, bucketFile(i)), json(b))));
  await Promise.all(ds.catalog.map((c, i) => writeFile(join(outDir, catalogFile(i)), json(c))));
  return ds;
}
