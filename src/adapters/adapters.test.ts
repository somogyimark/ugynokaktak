import { describe, expect, it } from 'vitest';
import { adapterFor } from '.';
import { parseCsv } from './csv';
import { validateRecords } from '../data/validate';
import type { FieldMapping } from './types';

const mapping: FieldMapping = {
  source: 'hadattar',
  fields: { name: 'Név', coverName: 'Fedőnév', birthDate: ['Születési dátum', 'Szül. év'], registryNumber: 'Szám' },
  officialUrlTemplate: 'https://example.org/rekord/{Szám}',
};

describe('parseCsv', () => {
  it('handles quotes, escaped quotes, embedded newlines and CRLF', () => {
    const rows = parseCsv('a,b\r\n"x, y","he said ""hi"""\r\n"multi\nline",z\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['x, y', 'he said "hi"'],
      ['multi\nline', 'z'],
    ]);
  });

  it('detects semicolon and tab delimiters and strips the BOM', () => {
    expect(parseCsv('﻿a;b\n1;2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
    expect(parseCsv('a\tb\n1\t2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('csv adapter', () => {
  const csv = 'Név;Fedőnév;Szül. év;Szám;Megjegyzés\nPróbaházi Gábor;Fecske;1931;H-01-000001;semmi\nMintás Éva;;;H-01-000002;\n';
  const adapter = adapterFor('hadattar.csv')!;

  it('maps columns onto the model and keeps raw fields', () => {
    const { records } = adapter.parse(csv, mapping);
    expect(records[0]).toMatchObject({
      source: 'hadattar',
      name: 'Próbaházi Gábor',
      nameNormalized: 'probahazi gabor',
      coverName: 'Fecske',
      birthDate: '1931',
      registryNumber: 'H-01-000001',
      officialUrl: 'https://example.org/rekord/H-01-000001',
      raw: { Megjegyzés: 'semmi' },
    });
    expect(records[1]!.coverName).toBeUndefined();
  });

  it('produces records that pass schema validation, with stable ids', () => {
    const a = adapter.parse(csv, mapping).records;
    const b = adapter.parse(csv, mapping).records;
    expect(a.map((r) => r.id)).toEqual(b.map((r) => r.id));
    expect(validateRecords(a).issues).toEqual([]);
  });

  it('flags rows without a name as invalid', () => {
    const { records } = adapter.parse('Név;Szám\n;H-1\n', mapping);
    expect(validateRecords(records).issues).toHaveLength(1);
  });

  it('matches column names accent- and case-insensitively', () => {
    const { records } = adapter.parse('NEV,FEDONEV\nDemó Ödön,Rigó\n', mapping);
    expect(records[0]).toMatchObject({ name: 'Demó Ödön', coverName: 'Rigó' });
  });
});

describe('json adapter', () => {
  const adapter = adapterFor('data.json')!;

  it('reads a root array', () => {
    const { records } = adapter.parse(JSON.stringify([{ Név: 'Demó Ödön', Szám: 'X1' }]), mapping);
    expect(records[0]).toMatchObject({ name: 'Demó Ödön', registryNumber: 'X1' });
  });

  it('reads an object wrapping the rows', () => {
    const { records } = adapter.parse(JSON.stringify({ total: 1, items: [{ Név: 'Tesztelő Irén' }] }), mapping);
    expect(records).toHaveLength(1);
  });

  it('reads NDJSON', () => {
    const { records } = adapter.parse('{"Név":"A Próbás"}\n{"Név":"B Próbás"}\n', mapping);
    expect(records.map((r) => r.name)).toEqual(['A Próbás', 'B Próbás']);
  });

  it('warns about non-object rows', () => {
    const { records, warnings } = adapter.parse('[1, {"Név": "Mintás Anna"}]', mapping);
    expect(records).toHaveLength(1);
    expect(warnings).toHaveLength(1);
  });
});
