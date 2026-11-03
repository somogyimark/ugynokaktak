import { describe, expect, it } from 'vitest';
import { generateMockRecords } from './mock';
import { validateRecords } from './validate';
import { buildDataset, bucketOf } from './dataset';
import { SOURCE_TYPES } from './sources';
import { normalizeText } from '../search/normalize';

const FICTIONAL_STEM = /^(proba|teszt|minta|demo|fiktiv|kitalalt|pelda)/;

describe('mock data', () => {
  const records = generateMockRecords({ count: 6000 });

  it('validates with zero errors', () => {
    const { issues, valid } = validateRecords(records);
    expect(issues).toEqual([]);
    expect(valid).toHaveLength(6000);
  });

  it('is deterministic', () => {
    expect(generateMockRecords({ count: 50 })).toEqual(generateMockRecords({ count: 50 }));
  });

  it('only uses obviously fictional surnames', () => {
    for (const r of records) expect(normalizeText(r.name)).toMatch(FICTIONAL_STEM);
  });

  it('spreads records across all three source types', () => {
    for (const s of SOURCE_TYPES) {
      const n = records.filter((r) => r.source === s).length;
      expect(n).toBeGreaterThan(1500);
    }
  });

  it('has realistic field coverage per source', () => {
    const share = (source: string, field: 'coverName' | 'motherName' | 'activity') => {
      const subset = records.filter((r) => r.source === source);
      return subset.filter((r) => r[field] !== undefined).length / subset.length;
    };
    expect(share('hadattar', 'coverName')).toBeGreaterThan(0.75);
    expect(share('bnaplo', 'coverName')).toBeLessThan(0.3);
    expect(share('bnaplo', 'motherName')).toBe(0);
    expect(share('karton6', 'activity')).toBeGreaterThan(0.5);
  });

  it('contains unaccented and same-name-in-other-source cases', () => {
    expect(records.some((r) => /Gabor\b/.test(r.name) || /GABOR\b/.test(r.name))).toBe(true);
    expect(records.some((r) => /Gábor\b/.test(r.name))).toBe(true);
    const sources = new Map<string, Set<string>>();
    for (const r of records) sources.set(r.nameNormalized, (sources.get(r.nameNormalized) ?? new Set()).add(r.source));
    expect([...sources.values()].some((s) => s.size > 1)).toBe(true);
  });

  it('builds a consistent chunked dataset', () => {
    const ds = buildDataset(records, { mode: 'mock', sourceDescription: 'test', generatedAt: 'x' });
    expect(ds.manifest.totalRecords).toBe(6000);
    expect(ds.buckets.flatMap((b) => b.records)).toHaveLength(6000);
    ds.buckets.forEach((bucket, i) => bucket.records.forEach((r) => expect(bucketOf(r.id, ds.manifest.bucketCount)).toBe(i)));
    expect(ds.catalog.flat()).toHaveLength(6000);
    expect(Object.values(ds.stats.counts).reduce((a, b) => a + b, 0)).toBe(6000);
    expect(ds.stats.crossSourceNames).toBeGreaterThan(0);
  });

  it('marks same-name entries in other sources without merging them', () => {
    const ds = buildDataset(records, { mode: 'mock', sourceDescription: 'test', generatedAt: 'x' });
    const all = ds.buckets.flatMap((b) => b.records);
    const hints = Object.assign({}, ...ds.buckets.map((b) => b.otherSources)) as Record<string, string[]>;
    expect(Object.keys(hints).length).toBeGreaterThan(0);
    for (const [id, sources] of Object.entries(hints)) {
      const r = all.find((x) => x.id === id)!;
      expect(sources).not.toContain(r.source);
      for (const s of sources) expect(all.some((x) => x.source === s && x.nameNormalized === r.nameNormalized)).toBe(true);
    }
    // Every cross-source name produces hints on both sides.
    for (const r of all) {
      const elsewhere = all.some((x) => x.source !== r.source && x.nameNormalized === r.nameNormalized);
      expect(!!hints[r.id], r.id).toBe(elsewhere);
    }
  });

  it('rejects duplicate ids', () => {
    const r = records[0]!;
    expect(() => buildDataset([r, r], { mode: 'mock', sourceDescription: 'test' })).toThrow(/Duplicate/);
  });
});
