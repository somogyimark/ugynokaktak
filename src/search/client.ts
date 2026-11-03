/**
 * Main-thread side of the search worker. Coalesces requests: while one search is running,
 * only the newest pending query is kept, so fast typing never builds up a backlog.
 */
import { catalogUrls } from '../data/client';
import type { SearchQuery } from './engine';
import type { WorkerRequest, WorkerResponse } from './protocol';

export interface SearchResponse {
  indices: Uint32Array;
  total: number;
  tookMs: number;
}

type Pending = { query: SearchQuery; resolve: (r: SearchResponse | null) => void; reject: (e: Error) => void };

class SearchClient {
  private worker: Worker;
  private nextId = 1;
  private inflight: (Pending & { reqId: number }) | null = null;
  private pending: Pending | null = null;
  readonly ready: Promise<{ total: number; buildMs: number }>;

  constructor() {
    this.worker = new Worker(new URL('./search.worker.ts', import.meta.url), { type: 'module', name: 'search' });
    let resolveReady!: (v: { total: number; buildMs: number }) => void;
    let rejectReady!: (e: Error) => void;
    this.ready = new Promise((res, rej) => {
      resolveReady = res;
      rejectReady = rej;
    });
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      switch (msg.type) {
        case 'ready':
          resolveReady({ total: msg.total, buildMs: msg.buildMs });
          break;
        case 'error': {
          const err = new Error(msg.message);
          rejectReady(err);
          this.inflight?.reject(err);
          this.pending?.reject(err);
          this.inflight = this.pending = null;
          break;
        }
        case 'result':
          if (this.inflight?.reqId === msg.reqId) {
            this.inflight.resolve({ indices: msg.indices, total: msg.total, tookMs: msg.tookMs });
            this.inflight = null;
            this.flush();
          }
          break;
      }
    };
    this.worker.onerror = (e) => rejectReady(new Error(e.message || 'A keresőmotor nem indult el'));
    catalogUrls().then(
      (urls) => this.post({ type: 'init', urls }),
      (e: unknown) => rejectReady(e instanceof Error ? e : new Error(String(e))),
    );
  }

  /** Resolves with the result, or with null if a newer query superseded this one. */
  search(query: SearchQuery): Promise<SearchResponse | null> {
    return new Promise((resolve, reject) => {
      this.pending?.resolve(null);
      this.pending = { query, resolve, reject };
      this.flush();
    });
  }

  private flush() {
    if (this.inflight || !this.pending) return;
    const reqId = this.nextId++;
    this.inflight = { ...this.pending, reqId };
    this.pending = null;
    this.post({ type: 'search', reqId, query: this.inflight.query });
  }

  private post(msg: WorkerRequest) {
    this.worker.postMessage(msg);
  }
}

let client: SearchClient | null = null;

/** Lazily started singleton; the worker and catalog load only when search is first needed. */
export function getSearchClient(): SearchClient {
  client ??= new SearchClient();
  return client;
}
