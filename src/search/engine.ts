/**
 * Search engine over the compact catalog. Pure and synchronous, so it can run inside the
 * Web Worker and in unit tests alike. Returns row indices, never copies of the data.
 */
import MiniSearch, { type SearchOptions } from 'minisearch';
import type { CatalogRow } from '../data/schema';
import { SOURCE_TYPES, type SourceType } from '../data/sources';
import { normalizeText, tokenize } from './normalize';

export interface SearchQuery {
  q?: string;
  sources?: readonly SourceType[];
  birthFrom?: number;
  birthTo?: number;
  recruitFrom?: number;
  recruitTo?: number;
  county?: string;
}

export interface SearchResult {
  /** Matching catalog row indices: by relevance when there is a text query, else alphabetical. */
  indices: Uint32Array;
  total: number;
}

interface Doc {
  id: number;
  name: string;
  coverName: string;
}

/** Edit distance tolerated per term: none for very short terms, more for longer ones. */
function fuzziness(term: string): number {
  if (term.length <= 3) return 0;
  if (term.length <= 6) return 1;
  return 2;
}

const SEARCH_OPTIONS: SearchOptions = {
  prefix: true,
  fuzzy: (term) => fuzziness(term),
  combineWith: 'AND',
  boost: { name: 2, coverName: 1 },
  // Exact > prefix > fuzzy.
  weights: { prefix: 0.6, fuzzy: 0.35 },
};

const NONE = -1;

export class SearchEngine {
  readonly rows: readonly CatalogRow[];
  private readonly mini: MiniSearch<Doc>;
  private readonly alphabetical: Uint32Array;
  private readonly sourceIdx: Uint8Array;
  private readonly birth: Int16Array;
  private readonly recruit: Int16Array;

  constructor(rows: readonly CatalogRow[]) {
    this.rows = rows;
    const n = rows.length;
    this.sourceIdx = new Uint8Array(n);
    this.birth = new Int16Array(n);
    this.recruit = new Int16Array(n);
    const normNames: string[] = new Array(n);

    rows.forEach((row, i) => {
      const [, source, name, , birthYear, , , recruitYear] = row;
      this.sourceIdx[i] = SOURCE_TYPES.indexOf(source);
      this.birth[i] = birthYear ?? NONE;
      this.recruit[i] = recruitYear ?? NONE;
      normNames[i] = normalizeText(name);
    });

    const order = Array.from({ length: n }, (_, i) => i);
    order.sort((a, b) => (normNames[a]! < normNames[b]! ? -1 : normNames[a]! > normNames[b]! ? 1 : a - b));
    this.alphabetical = Uint32Array.from(order);

    this.mini = new MiniSearch<Doc>({
      fields: ['name', 'coverName'],
      tokenize: (text) => tokenize(text),
      processTerm: (term) => normalizeText(term) || null,
      searchOptions: SEARCH_OPTIONS,
    });
    this.mini.addAll(rows.map((r, i) => ({ id: i, name: r[2], coverName: r[3] ?? '' })));
  }

  search(query: SearchQuery): SearchResult {
    const accept = this.filter(query);
    const text = query.q?.trim() ?? '';
    const out: number[] = [];
    if (tokenize(text).length) {
      for (const hit of this.mini.search(text)) {
        const i = hit.id as number;
        if (accept(i)) out.push(i);
      }
    } else {
      for (const i of this.alphabetical) if (accept(i)) out.push(i);
    }
    return { indices: Uint32Array.from(out), total: out.length };
  }

  private filter(q: SearchQuery): (i: number) => boolean {
    const checks: ((i: number) => boolean)[] = [];
    if (q.sources && q.sources.length && q.sources.length < SOURCE_TYPES.length) {
      const allowed = new Set(q.sources.map((s) => SOURCE_TYPES.indexOf(s)));
      checks.push((i) => allowed.has(this.sourceIdx[i]!));
    }
    const range = (arr: Int16Array, from?: number, to?: number) => {
      if (from === undefined && to === undefined) return;
      const lo = from ?? -Infinity;
      const hi = to ?? Infinity;
      checks.push((i) => {
        const v = arr[i]!;
        return v !== NONE && v >= lo && v <= hi;
      });
    };
    range(this.birth, q.birthFrom, q.birthTo);
    range(this.recruit, q.recruitFrom, q.recruitTo);
    if (q.county) checks.push((i) => this.rows[i]![6] === q.county);
    if (!checks.length) return () => true;
    return (i) => checks.every((c) => c(i));
  }
}
