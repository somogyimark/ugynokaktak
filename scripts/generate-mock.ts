/**
 * Generates fictional test data into public/data.
 *
 *   tsx scripts/generate-mock.ts                 # 6000 records
 *   tsx scripts/generate-mock.ts --count 60000   # load test
 *   tsx scripts/generate-mock.ts --if-missing    # used by predev/prebuild; no-op if data exists or mode is live
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { MANIFEST_FILE } from '../src/data/dataset';
import { generateMockRecords } from '../src/data/mock';
import { validateRecords } from '../src/data/validate';
import { dataMode } from './lib/env';
import { PUBLIC_DATA_DIR, writeDataset } from './lib/write-dataset';

const { values } = parseArgs({
  options: {
    count: { type: 'string', default: '6000' },
    seed: { type: 'string' },
    'if-missing': { type: 'boolean', default: false },
  },
});

if (values['if-missing']) {
  if (dataMode() === 'live') {
    if (!existsSync(join(PUBLIC_DATA_DIR, MANIFEST_FILE))) {
      console.error('VITE_DATA_MODE=live, de nincs importált adat a public/data mappában. Futtasd: npm run data:import');
      process.exit(1);
    }
    process.exit(0);
  }
  if (existsSync(join(PUBLIC_DATA_DIR, MANIFEST_FILE))) process.exit(0);
}

const count = Number(values.count);
if (!Number.isInteger(count) || count <= 0) throw new Error(`Invalid --count: ${values.count}`);

const started = performance.now();
const records = generateMockRecords({ count, seed: values.seed ? Number(values.seed) : undefined });
const { valid, issues } = validateRecords(records);
if (issues.length) {
  console.error(`Validálási hiba a tesztadatban: ${issues.length} rekord`, issues.slice(0, 5));
  process.exit(1);
}
const ds = await writeDataset(valid, { mode: 'mock', sourceDescription: 'Fiktív tesztadat (scripts/generate-mock.ts)' });
console.log(
  `Tesztadat kész: ${ds.manifest.totalRecords} rekord (${Object.entries(ds.manifest.counts)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')}), ${ds.manifest.bucketCount} rekordcsomag, ${ds.manifest.catalogChunks} katalógusrész, ` +
    `${Math.round(performance.now() - started)} ms`,
);
