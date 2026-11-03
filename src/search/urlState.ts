import { COUNTY_BY_CODE } from '../data/geo';
import { isSourceType, SOURCE_TYPES, type SourceType } from '../data/sources';
import type { SearchQuery } from './engine';

/** URL query keys (Hungarian, user-visible). */
export const PARAM = {
  q: 'q',
  sources: 'forras',
  birthFrom: 'szulTol',
  birthTo: 'szulIg',
  recruitFrom: 'beszTol',
  recruitTo: 'beszIg',
  county: 'megye',
} as const;

const year = (v: string | null): number | undefined => {
  if (!v || !/^\d{4}$/.test(v)) return undefined;
  const n = Number(v);
  return n >= 1850 && n <= 2030 ? n : undefined;
};

export function queryFromParams(params: URLSearchParams): SearchQuery {
  const sources = (params.get(PARAM.sources) ?? '')
    .split(',')
    .filter(isSourceType)
    .filter((s, i, a) => a.indexOf(s) === i) as SourceType[];
  const county = params.get(PARAM.county) ?? undefined;
  return {
    q: params.get(PARAM.q) ?? undefined,
    sources: sources.length && sources.length < SOURCE_TYPES.length ? sources : undefined,
    birthFrom: year(params.get(PARAM.birthFrom)),
    birthTo: year(params.get(PARAM.birthTo)),
    recruitFrom: year(params.get(PARAM.recruitFrom)),
    recruitTo: year(params.get(PARAM.recruitTo)),
    county: county && COUNTY_BY_CODE.has(county) ? county : undefined,
  };
}

export function paramsFromQuery(q: SearchQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.q) p.set(PARAM.q, q.q);
  if (q.sources?.length && q.sources.length < SOURCE_TYPES.length) p.set(PARAM.sources, q.sources.join(','));
  if (q.birthFrom !== undefined) p.set(PARAM.birthFrom, String(q.birthFrom));
  if (q.birthTo !== undefined) p.set(PARAM.birthTo, String(q.birthTo));
  if (q.recruitFrom !== undefined) p.set(PARAM.recruitFrom, String(q.recruitFrom));
  if (q.recruitTo !== undefined) p.set(PARAM.recruitTo, String(q.recruitTo));
  if (q.county) p.set(PARAM.county, q.county);
  return p;
}

export function hasFilters(q: SearchQuery): boolean {
  return !!(q.sources?.length || q.birthFrom || q.birthTo || q.recruitFrom || q.recruitTo || q.county);
}
