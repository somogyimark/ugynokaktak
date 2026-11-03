import { mapRow } from './mapRow';
import type { AdapterResult, FieldMapping, SourceAdapter } from './types';

/** Detects the delimiter from the header line (",", ";" or tab). */
function detectDelimiter(headerLine: string): string {
  const counts = [',', ';', '\t'].map((d) => [d, headerLine.split(d).length] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0]![0];
}

/** Minimal RFC 4180 parser: quoted fields, escaped quotes, newlines inside quotes, CRLF. */
export function parseCsv(input: string, delimiter?: string): string[][] {
  const text = input.replace(/^﻿/, '');
  const delim = delimiter ?? detectDelimiter(text.split(/\r?\n/, 1)[0] ?? '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

export const csvAdapter: SourceAdapter = {
  id: 'csv',
  description: 'Fejléces CSV (vessző, pontosvessző vagy tab elválasztó)',
  canHandle: (fileName) => /\.(csv|tsv|txt)$/i.test(fileName),
  parse(content: string, mapping: FieldMapping): AdapterResult {
    const [header, ...body] = parseCsv(content);
    const warnings: string[] = [];
    if (!header) return { records: [], warnings: ['Üres CSV'] };
    const records = body.map((cells, i) => {
      if (cells.length !== header.length) warnings.push(`${i + 2}. sor: ${cells.length} mező a várt ${header.length} helyett`);
      const row: Record<string, unknown> = {};
      header.forEach((h, j) => (row[h.trim()] = cells[j] ?? ''));
      return mapRow(row, mapping, i);
    });
    return { records, warnings };
  },
};
