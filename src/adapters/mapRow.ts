import { stableId } from '../data/dataset';
import { normalizeText } from '../search/normalize';
import type { CandidateRecord, FieldMapping, MappableField } from './types';

function lookup(row: Record<string, unknown>): (column: string) => string | undefined {
  const index = new Map<string, unknown>();
  for (const [k, v] of Object.entries(row)) index.set(normalizeText(k), v);
  return (column) => {
    const v = index.get(normalizeText(column));
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s ? s : undefined;
  };
}

/** Maps one source row onto a candidate record. All original fields are kept in `raw`. */
export function mapRow(row: Record<string, unknown>, mapping: FieldMapping, rowIndex: number): CandidateRecord {
  const get = lookup(row);
  const out: CandidateRecord = { source: mapping.source, raw: { ...row } };
  for (const [field, columns] of Object.entries(mapping.fields) as [MappableField, string | readonly string[]][]) {
    const candidates = typeof columns === 'string' ? [columns] : columns;
    for (const c of candidates) {
      const value = get(c);
      if (value !== undefined) {
        out[field] = value;
        break;
      }
    }
  }
  if (!out.officialUrl && mapping.officialUrlTemplate) {
    let missing = false;
    const url = mapping.officialUrlTemplate.replace(/\{([^}]+)\}/g, (_, col: string) => {
      const v = get(col);
      if (v === undefined) missing = true;
      return encodeURIComponent(v ?? '');
    });
    if (!missing) out.officialUrl = url;
  }
  if (out.name) out.nameNormalized = normalizeText(out.name);
  const idParts: (string | undefined)[] = mapping.idFields ? mapping.idFields.map(get) : [out.registryNumber, out.name, out.birthDate];
  // Row index only as a last resort, when nothing identifying is present.
  if (!idParts.some((p) => p !== undefined)) idParts.push(String(rowIndex));
  out.id = stableId(mapping.source, idParts);
  return out;
}
