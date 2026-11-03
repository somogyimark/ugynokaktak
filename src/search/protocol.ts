import type { SourceType } from '../data/sources';
import type { SearchQuery } from './engine';

export type WorkerRequest =
  | { type: 'init'; urls: string[] }
  | { type: 'search'; reqId: number; query: SearchQuery }
  | { type: 'sameName'; reqId: number; id: string };

export type WorkerResponse =
  | { type: 'ready'; total: number; buildMs: number }
  | { type: 'error'; message: string }
  | { type: 'result'; reqId: number; indices: Uint32Array; total: number; tookMs: number }
  | { type: 'sameName'; reqId: number; matches: { id: string; source: SourceType }[] };
