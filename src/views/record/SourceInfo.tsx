import type { AgentRecord } from '../../data/schema';
import { SOURCES } from '../../data/sources';

/** Source name, description and link to the official record (if any). */
export function SourceInfo({ record }: { record: AgentRecord }) {
  const meta = SOURCES[record.source];
  return (
    <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
      <dt className="font-stamp tracking-[0.15em] text-[var(--desk-muted)] uppercase">Forrás</dt>
      <dd>
        <strong>{meta.label}</strong> – {meta.description}
      </dd>
      <dt className="font-stamp tracking-[0.15em] text-[var(--desk-muted)] uppercase">Hivatalos rekord</dt>
      <dd>
        {record.officialUrl ? (
          <a href={record.officialUrl} rel="noreferrer nofollow" target="_blank" className="break-all underline underline-offset-2">
            Megnyitás az eredeti forrásban <span aria-hidden="true">↗</span>
            <span className="sr-only">(új lapon nyílik meg)</span>
          </a>
        ) : (
          <span className="text-[var(--desk-muted)]">Nincs elérhető hivatkozás.</span>
        )}
      </dd>
      <dt className="font-stamp tracking-[0.15em] text-[var(--desk-muted)] uppercase">Azonosító</dt>
      <dd className="font-terminal text-xs leading-5">{record.id}</dd>
    </dl>
  );
}
