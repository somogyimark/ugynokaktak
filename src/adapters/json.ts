import { mapRow } from './mapRow';
import type { AdapterResult, FieldMapping, SourceAdapter } from './types';

/** Finds the array of row objects: either the root, or the first array-valued property. */
function findRows(data: unknown): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) if (Array.isArray(value)) return value;
  }
  return null;
}

export const jsonAdapter: SourceAdapter = {
  id: 'json',
  description: 'JSON tömb (vagy objektum, amelynek egyik mezője a sorok tömbje), illetve NDJSON',
  canHandle: (fileName) => /\.(json|ndjson|jsonl)$/i.test(fileName),
  parse(content: string, mapping: FieldMapping): AdapterResult {
    const warnings: string[] = [];
    let rows: unknown[] | null;
    const trimmed = content.replace(/^﻿/, '').trim();
    try {
      rows = findRows(JSON.parse(trimmed));
    } catch {
      // NDJSON: one object per line.
      rows = trimmed.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line) as unknown);
    }
    if (!rows) return { records: [], warnings: ['Nem található sorokat tartalmazó tömb'] };
    const records = rows.flatMap((row, i) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        warnings.push(`${i}. elem nem objektum`);
        return [];
      }
      return [mapRow(row as Record<string, unknown>, mapping, i)];
    });
    return { records, warnings };
  },
};
