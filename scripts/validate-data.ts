/**
 * Validates the generated/imported dataset in public/data against the zod schemas.
 * Exit code 1 on any error. Usage: npm run data:validate
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { bucketFile, bucketOf, catalogFile, MANIFEST_FILE, STATS_FILE } from '../src/data/dataset';
import { CatalogRowSchema, ManifestSchema, StatsSchema } from '../src/data/schema';
import { validateRecords } from '../src/data/validate';
import { PUBLIC_DATA_DIR } from './lib/write-dataset';

const read = async (file: string): Promise<unknown> => JSON.parse(await readFile(join(PUBLIC_DATA_DIR, file), 'utf8'));
const errors: string[] = [];

const manifest = ManifestSchema.parse(await read(MANIFEST_FILE));
const statsResult = StatsSchema.safeParse(await read(STATS_FILE));
if (!statsResult.success) errors.push(`stats.json: ${statsResult.error.message}`);

const ids = new Set<string>();
const missing: Record<string, number> = {};
let records = 0;
for (let b = 0; b < manifest.bucketCount; b++) {
  const data = await read(bucketFile(b));
  if (!Array.isArray(data)) {
    errors.push(`${bucketFile(b)}: nem tömb`);
    continue;
  }
  const { valid, issues } = validateRecords(data);
  for (const issue of issues) errors.push(`${bucketFile(b)}[${issue.index}] ${issue.id ?? ''}: ${issue.messages.join('; ')}`);
  for (const r of valid) {
    records++;
    if (ids.has(r.id)) errors.push(`Ismétlődő azonosító: ${r.id}`);
    ids.add(r.id);
    if (bucketOf(r.id, manifest.bucketCount) !== b) errors.push(`${r.id} rossz csomagban (${b})`);
    for (const f of ['coverName', 'birthDate', 'birthPlace', 'motherName', 'recruitmentDate', 'registryNumber'] as const) {
      if (r[f] === undefined) missing[f] = (missing[f] ?? 0) + 1;
    }
  }
}

let catalogRows = 0;
for (let c = 0; c < manifest.catalogChunks; c++) {
  const data = await read(catalogFile(c));
  if (!Array.isArray(data)) {
    errors.push(`${catalogFile(c)}: nem tömb`);
    continue;
  }
  data.forEach((row, i) => {
    const res = CatalogRowSchema.safeParse(row);
    if (!res.success) errors.push(`${catalogFile(c)}[${i}]: ${res.error.message}`);
    else if (!ids.has(res.data[0])) errors.push(`${catalogFile(c)}[${i}]: ismeretlen azonosító ${res.data[0]}`);
    catalogRows++;
  });
}

if (records !== manifest.totalRecords) errors.push(`Rekordszám eltér: ${records} ≠ manifest ${manifest.totalRecords}`);
if (catalogRows !== manifest.totalRecords) errors.push(`Katalógussorok száma eltér: ${catalogRows} ≠ ${manifest.totalRecords}`);

console.log(`Mód: ${manifest.mode} · rekord: ${records} · katalógussor: ${catalogRows}`);
console.log('Hiányzó mezők:', Object.entries(missing).map(([k, v]) => `${k}=${v}`).join(', ') || 'nincs');
if (errors.length) {
  console.error(`${errors.length} hiba:`);
  for (const e of errors.slice(0, 50)) console.error(' -', e);
  process.exit(1);
}
console.log('Validálás: 0 hiba.');
