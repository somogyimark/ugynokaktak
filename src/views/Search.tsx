import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { SearchBox } from '../components/SearchBox';
import { Loading } from '../components/Loading';
import { loadCatalog } from '../data/client';
import { useAsync } from '../hooks/useAsync';
import { formatNumber } from '../lib/format';
import { getSearchClient, type SearchResponse } from '../search/client';
import type { SearchQuery } from '../search/engine';
import { hasFilters, paramsFromQuery, queryFromParams } from '../search/urlState';
import { FilterPanel } from './search/FilterPanel';
import { ResultList, type ResultListHandle } from './search/ResultList';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const paramKey = params.toString();
  const query = useMemo(() => queryFromParams(new URLSearchParams(paramKey)), [paramKey]);
  const [text, setText] = useState(query.q ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [result, setResult] = useState<(SearchResponse & { query: SearchQuery }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const catalog = useAsync(loadCatalog, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<ResultListHandle>(null);

  // Keep the input in sync when the URL changes from outside (back/forward, links).
  useEffect(() => {
    if ((query.q ?? '') !== text) setText(query.q ?? '');
    // Only react to URL changes, not to local typing.
  }, [query.q]);

  const update = (next: SearchQuery) => setParams(paramsFromQuery(next), { replace: true, preventScrollReset: true });

  useEffect(() => {
    let alive = true;
    getSearchClient()
      .search(query)
      .then(
        (res) => {
          if (alive && res) {
            setResult({ ...res, query });
            setError(null);
          }
        },
        (e: unknown) => alive && setError(e instanceof Error ? e.message : String(e)),
      );
    return () => {
      alive = false;
    };
  }, [query]);

  const filtered = hasFilters(query);
  const status = error
    ? 'A kereső nem érhető el.'
    : result
      ? `${formatNumber(result.total)} találat${result.query.q ? ` erre: „${result.query.q}”` : ''}${hasFilters(result.query) ? ' (szűrve)' : ''}`
      : 'Katalógus betöltése…';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <PageMeta title={query.q ? `Keresés: ${query.q}` : 'Katalógus'} />
      <header className="mb-6">
        <h1 className="font-stamp text-3xl font-bold tracking-[0.15em] uppercase">Cédulakatalógus</h1>
        <p className="mt-1 max-w-prose text-[var(--desk-muted)]">
          Keresés névre és fedőnévre, ékezettől függetlenül; az apró elgépeléseket is megtalálja.
        </p>
      </header>

      <SearchBox
        ref={inputRef}
        value={text}
        describedBy="talalatok-szama"
        onChange={(v) => {
          setText(v);
          update({ ...query, q: v || undefined });
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            listRef.current?.focusFirst();
          }
        }}
      />

      <div className="mt-4 grid gap-6 lg:grid-cols-[17rem_1fr]">
        <div>
          <button
            type="button"
            className="mb-3 w-full border border-[var(--desk-line)] px-3 py-2 text-left font-stamp text-sm tracking-[0.15em] uppercase lg:hidden"
            aria-expanded={filtersOpen}
            aria-controls="szurok"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {filtersOpen ? '▾' : '▸'} Szűrők{filtered ? ' (aktív)' : ''}
          </button>
          <aside id="szurok" aria-label="Szűrők" className={`${filtersOpen ? 'block' : 'hidden'} lg:sticky lg:top-12 lg:block`}>
            <FilterPanel query={query} onChange={update} />
          </aside>
        </div>

        <section aria-label="Keresési eredmények" className="min-w-0">
          <p id="talalatok-szama" role="status" aria-live="polite" className="mb-3 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-bold">{status}</span>
            {result && (
              <span className="font-terminal text-xs text-[var(--desk-muted)]" aria-hidden="true">
                {result.tookMs.toFixed(0)} ms
              </span>
            )}
          </p>
          {error && <p className="text-stamp">{error}</p>}
          {catalog.status === 'loading' && <Loading label="Cédulák előkeresése…" />}
          {catalog.status === 'error' && <p className="text-stamp">A katalógus nem tölthető be: {catalog.error.message}</p>}
          {catalog.status === 'ready' && result && result.total === 0 && (
            <p className="paper mt-2 p-6 text-center">
              Nincs találat. Próbáld rövidebb névrészlettel, vagy töröld a szűrőket.
            </p>
          )}
          {catalog.status === 'ready' && result && result.total > 0 && (
            <ResultList ref={listRef} rows={catalog.value} indices={result.indices} backSearch={`?${paramKey}`} onExitTop={() => inputRef.current?.focus()} />
          )}
          <p className="mt-6 text-xs text-[var(--desk-muted)]">
            Billentyűzet: a keresőmezőből ↓ a találatokra lép, ↑/↓, Home/End, PageUp/PageDown lapoz, Enter megnyitja az aktát.
          </p>
        </section>
      </div>
    </div>
  );
}
