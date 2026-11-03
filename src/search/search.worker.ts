/// <reference lib="webworker" />
import type { CatalogRow } from '../data/schema';
import { SearchEngine } from './engine';
import type { WorkerRequest, WorkerResponse } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

let engine: SearchEngine | null = null;
const queue: WorkerRequest[] = [];

const post = (msg: WorkerResponse, transfer: Transferable[] = []) => self.postMessage(msg, transfer);

function handle(msg: WorkerRequest) {
  if (!engine) return;
  if (msg.type === 'search') {
    const t0 = performance.now();
    const { indices, total } = engine.search(msg.query);
    post({ type: 'result', reqId: msg.reqId, indices, total, tookMs: performance.now() - t0 }, [indices.buffer]);
  }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  if (msg.type !== 'init') {
    if (engine) handle(msg);
    else queue.push(msg);
    return;
  }
  try {
    const t0 = performance.now();
    const chunks = await Promise.all(
      msg.urls.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
        return (await res.json()) as CatalogRow[];
      }),
    );
    engine = new SearchEngine(chunks.flat());
    post({ type: 'ready', total: engine.rows.length, buildMs: performance.now() - t0 });
    for (const m of queue.splice(0)) handle(m);
  } catch (e) {
    post({ type: 'error', message: e instanceof Error ? e.message : String(e) });
  }
};
