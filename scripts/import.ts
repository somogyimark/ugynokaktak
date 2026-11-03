/**
 * raw → normalised JSON, through the adapters (SPEC §4, M6).
 *
 *   npm run data:import              # validate + write public/data
 *   npm run data:import -- --dry-run # report only
 *
 * Only run on data obtained in line with the source's terms of use (SPEC §9, §11).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { adapterFor } from '../src/adapters';
import type { AgentRecord } from '../src/data/schema';
import { validateRecords } from '../src/data/validate';
import { IMPORT_FILES, SOURCE_DESCRIPTION } from './import.config';
import { writeDataset } from './lib/write-dataset';

const RAW_DIR = join(import.meta.dirname, '..', 'raw');
const { values } = parseArgs({ options: { 'dry-run': { type: 'boolean', default: false } } });

if (IMPORT_FILES.length === 0) {
  console.error('Nincs beállított importfájl (scripts/import.config.ts). Az éles adat bekötése az M6 része.');
  process.exit(1);
}

const all: AgentRecord[] = [];
const report: string[] = ['# Import riport', '', `Időpont: ${new Date().toISOString()}`, ''];
let invalidTotal = 0;

for (const { file, mapping } of IMPORT_FILES) {
  const adapter = adapterFor(file);
  if (!adapter) throw new Error(`Nincs adapter ehhez a fájlhoz: ${file}`);
  const content = await readFile(join(RAW_DIR, file), 'utf8');
  const { records, warnings } = adapter.parse(content, mapping);
  const { valid, issues } = validateRecords(records);
  invalidTotal += issues.length;

  // Deterministic de-duplication of colliding ids (e.g. truly identical rows).
  const seen = new Map<string, number>();
  for (const r of valid) {
    const n = seen.get(r.id) ?? 0;
    seen.set(r.id, n + 1);
    all.push(n ? { ...r, id: `${r.id}-${n + 1}` } : r);
  }

  const missing: Record<string, number> = {};
  for (const f of Object.keys(mapping.fields)) missing[f] = valid.filter((r) => r[f as keyof AgentRecord] === undefined).length;

  report.push(`## ${file} (${mapping.source}, adapter: ${adapter.id})`, '');
  report.push(`- Beolvasott sorok: ${records.length}`, `- Érvényes: ${valid.length}`, `- Hibás: ${issues.length}`);
  report.push(`- Hiányzó mezők: ${Object.entries(missing).map(([k, v]) => `${k}: ${v}`).join(', ') || '–'}`);
  if (warnings.length) report.push(`- Figyelmeztetések (${warnings.length}): ${warnings.slice(0, 10).join(' | ')}`);
  for (const i of issues.slice(0, 20)) report.push(`  - ${i.index}. sor: ${i.messages.join('; ')}`);
  report.push('');
}

report.push(`**Összesen:** ${all.length} érvényes, ${invalidTotal} hibás rekord.`);
const text = report.join('\n');
console.log(text);
await writeFile(join(RAW_DIR, 'import-report.md'), text);

if (!values['dry-run']) {
  const ds = await writeDataset(all, { mode: 'live', sourceDescription: SOURCE_DESCRIPTION });
  console.log(`Kiírva: ${ds.manifest.totalRecords} rekord a public/data mappába.`);
}
