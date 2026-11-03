import { beforeAll, describe, expect, it } from 'vitest';
import { generateMockRecords } from '../data/mock';
import { toCatalogRow } from '../data/dataset';
import type { CatalogRow } from '../data/schema';
import { SearchEngine } from './engine';

const handmade: CatalogRow[] = [
  ['t-1', 'karton6', 'Próbaházi Gábor', 'Fecske', 1931, 'Szeged', 'CSO', 1962, 'X1'],
  ['t-2', 'hadattar', 'PROBAHAZI GABOR', 'FECSKE', 1931, 'SZEGED', 'CSO', null, 'X2'],
  ['t-3', 'bnaplo', 'Tesztelő Gabor', null, null, null, null, 1975, null],
  ['t-4', 'karton6', 'Mintás Éva', 'Rigó', 1945, 'Pécs', 'BAR', 1970, null],
  ['t-5', 'hadattar', 'Demóházi Ödön', 'Őrszem', 1920, 'Bécs', null, 1958, null],
];

describe('SearchEngine (small, handmade catalog)', () => {
  const engine = new SearchEngine(handmade);
  const ids = (q: Parameters<SearchEngine['search']>[0]) => Array.from(engine.search(q).indices, (i) => handmade[i]![0]);

  it('"gábor" finds "Gabor" and "GABOR"', () => {
    expect(ids({ q: 'gábor' }).sort()).toEqual(['t-1', 't-2', 't-3']);
  });

  it('"gabor" finds "Gábor"', () => {
    expect(ids({ q: 'gabor' })).toContain('t-1');
  });

  it('is accent- and case-insensitive for cover names', () => {
    expect(ids({ q: 'orszem' })).toEqual(['t-5']);
    expect(ids({ q: 'RIGÓ' })).toEqual(['t-4']);
  });

  it('tolerates typos', () => {
    expect(ids({ q: 'probahazy' })).toContain('t-1');
    expect(ids({ q: 'Teszelő' })).toContain('t-3');
    expect(ids({ q: 'Mimtás éva' })).toEqual(['t-4']);
  });

  it('matches prefixes while typing', () => {
    expect(ids({ q: 'demóh' })).toEqual(['t-5']);
  });

  it('combines terms with AND', () => {
    expect(ids({ q: 'próbaházi gábor' }).sort()).toEqual(['t-1', 't-2']);
    expect(ids({ q: 'mintás gábor' })).toEqual([]);
  });

  it('filters by source, years and county', () => {
    expect(ids({ q: 'gabor', sources: ['hadattar'] })).toEqual(['t-2']);
    expect(ids({ birthFrom: 1930, birthTo: 1940 }).sort()).toEqual(['t-1', 't-2']);
    expect(ids({ recruitFrom: 1970 }).sort()).toEqual(['t-3', 't-4']);
    expect(ids({ county: 'BAR' })).toEqual(['t-4']);
  });

  it('lists everything alphabetically without a query', () => {
    expect(ids({})).toEqual(['t-5', 't-4', 't-1', 't-2', 't-3']);
  });

  it('reports same-name records in other sources', () => {
    expect(engine.sameName('t-1')).toEqual([{ id: 't-2', source: 'hadattar' }]);
    expect(engine.sameName('t-4')).toEqual([]);
    expect(engine.sameName('missing')).toEqual([]);
  });
});

describe('SearchEngine performance (60 000 records)', () => {
  let engine: SearchEngine;
  let buildMs = 0;

  beforeAll(() => {
    const rows = generateMockRecords({ count: 60_000 }).map(toCatalogRow);
    const t0 = performance.now();
    engine = new SearchEngine(rows);
    buildMs = performance.now() - t0;
  });

  it('answers keystroke-by-keystroke queries well under 100 ms on average', () => {
    const typed = ['p', 'pr', 'pro', 'prob', 'proba', 'probah', 'probaha', 'probahaz', 'probahazi', 'probahazi g', 'probahazi ga', 'probahazi gab', 'probahazi gabo', 'probahazi gábor'];
    const others = ['gábor', 'gabor', 'fecske', 'mintás éva', 'tesztelo', 'demohazi odon', 'kitalalt', 'orszem', 'zuzmara', 'mintavary'];
    const queries = [...typed, ...others];
    engine.search({ q: 'warmup' });
    const times: number[] = [];
    for (const q of queries) {
      const t0 = performance.now();
      const res = engine.search({ q });
      times.push(performance.now() - t0);
      expect(res.total).toBeGreaterThanOrEqual(0);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    console.log(`60k index build: ${buildMs.toFixed(0)} ms · avg query: ${avg.toFixed(1)} ms · max: ${max.toFixed(1)} ms`);
    expect(avg).toBeLessThan(100);
  });

  it('filters the full list quickly', () => {
    const t0 = performance.now();
    const res = engine.search({ sources: ['karton6'], birthFrom: 1920, birthTo: 1940 });
    const took = performance.now() - t0;
    expect(res.total).toBeGreaterThan(0);
    expect(took).toBeLessThan(100);
  });

  it('"gábor" ↔ "Gabor" at scale', () => {
    const a = engine.search({ q: 'gábor' }).total;
    const b = engine.search({ q: 'gabor' }).total;
    expect(a).toBe(b);
    expect(a).toBeGreaterThan(100);
  });
});
