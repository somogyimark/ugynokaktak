import { Link, useLocation, useParams } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { Loading } from '../components/Loading';
import { loadRecord } from '../data/client';
import { useAsync } from '../hooks/useAsync';
import { getSearchClient } from '../search/client';
import { SOURCES } from '../data/sources';
import { RecordDocument } from './record/RecordDocument';
import type { AgentRecord } from '../data/schema';

/** "Same name in another source" hint. Name equality is not proof of identity, so no merging. */
function SameNameNotice({ record }: { record: AgentRecord }) {
  const matches = useAsync(() => getSearchClient().sameName(record.id), [record.id]);
  if (matches.status !== 'ready') return null;
  const others = matches.value.filter((m) => m.source !== record.source);
  if (!others.length) return null;
  const sources = [...new Set(others.map((m) => SOURCES[m.source].label))].join(', ');
  return (
    <p className="border border-dashed border-[var(--desk-line)] p-3 text-sm" data-testid="same-name">
      <strong>Azonos nevű bejegyzés más forrásban is</strong> ({sources}).{' '}
      A névegyezés nem bizonyít személyazonosságot.{' '}
      <Link className="underline underline-offset-2" to={`/kereses?q=${encodeURIComponent(record.name)}`}>
        Azonos nevű bejegyzések a katalógusban
      </Link>
    </p>
  );
}

export default function Record() {
  const { id = '' } = useParams();
  const location = useLocation();
  const backSearch = (location.state as { backSearch?: string } | null)?.backSearch;
  const state = useAsync(() => loadRecord(id), [id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Every record page is noindex (SPEC §9); no per-person social cards either. */}
      <PageMeta title={state.status === 'ready' && state.value ? `Akta – ${SOURCES[state.value.source].label}` : 'Akta'} />
      <nav aria-label="Vissza" className="mb-6">
        <Link to={`/kereses${backSearch ?? ''}`} className="font-stamp text-sm tracking-[0.15em] uppercase underline-offset-4 hover:underline">
          ← {backSearch ? 'Vissza a találatokhoz' : 'Katalógus'}
        </Link>
      </nav>
      {state.status === 'loading' && <Loading label="Akta kikérése az irattárból…" />}
      {state.status === 'error' && <p className="text-stamp">Az akta nem tölthető be: {state.error.message}</p>}
      {state.status === 'ready' && !state.value && (
        <div className="paper p-8 text-center">
          <h1 className="font-stamp text-2xl tracking-widest uppercase">Az akta nem található</h1>
          <p className="mt-2">Ilyen azonosítójú bejegyzés nincs a nyilvántartásban.</p>
        </div>
      )}
      {state.status === 'ready' && state.value && (
        <div className="space-y-6">
          <SameNameNotice record={state.value} />
          <RecordDocument record={state.value} />
        </div>
      )}
    </div>
  );
}
