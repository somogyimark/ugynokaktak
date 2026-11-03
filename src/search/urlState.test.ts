import { describe, expect, it } from 'vitest';
import { paramsFromQuery, queryFromParams } from './urlState';

describe('search URL state', () => {
  it('round-trips a full query', () => {
    const q = { q: 'gábor', sources: ['karton6', 'hadattar'] as const, birthFrom: 1920, birthTo: 1940, recruitFrom: 1960, recruitTo: 1970, county: 'BAR' };
    const params = paramsFromQuery({ ...q, sources: [...q.sources] });
    expect(params.toString()).toBe('q=g%C3%A1bor&forras=karton6%2Chadattar&szulTol=1920&szulIg=1940&beszTol=1960&beszIg=1970&megye=BAR');
    expect(queryFromParams(params)).toEqual({ ...q, sources: [...q.sources] });
  });

  it('ignores invalid values', () => {
    const q = queryFromParams(new URLSearchParams('forras=foo,karton6&szulTol=abc&beszIg=99999&megye=XX'));
    expect(q).toEqual({ q: undefined, sources: ['karton6'], birthFrom: undefined, birthTo: undefined, recruitFrom: undefined, recruitTo: undefined, county: undefined });
  });

  it('treats "all sources" as no source filter', () => {
    expect(queryFromParams(new URLSearchParams('forras=karton6,bnaplo,hadattar')).sources).toBeUndefined();
  });
});
