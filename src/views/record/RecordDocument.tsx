import type { ComponentType } from 'react';
import type { AgentRecord } from '../../data/schema';
import type { SourceType } from '../../data/sources';
import { BNaploSheet } from './BNaploSheet';
import { HAdattarTerminal } from './HAdattarTerminal';
import { Karton6Sheet } from './Karton6Sheet';
import { RecordDisclaimer } from './RecordDisclaimer';
import { SourceInfo } from './SourceInfo';

/** Template per source type. A future "bdosszie" multi-page viewer plugs in here. */
export const TEMPLATES: Record<SourceType, ComponentType<{ record: AgentRecord }>> = {
  karton6: Karton6Sheet,
  bnaplo: BNaploSheet,
  hadattar: HAdattarTerminal,
};

function RawFields({ raw }: { raw: Record<string, unknown> }) {
  const entries = Object.entries(raw);
  if (!entries.length) return null;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-stamp tracking-[0.15em] uppercase">Eredeti forrásmezők</summary>
      <dl className="mt-2 grid gap-x-4 gap-y-1 font-terminal text-xs sm:grid-cols-[auto_1fr]">
        {entries.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[var(--desk-muted)]">{k}</dt>
            <dd className="break-all">{typeof v === 'string' ? v : JSON.stringify(v)}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** Pure record view: template + mandatory notice + source info. No data fetching. */
export function RecordDocument({ record }: { record: AgentRecord }) {
  const Template = TEMPLATES[record.source];
  return (
    <article aria-labelledby="rekord-cim" className="space-y-8">
      <h1 id="rekord-cim" className="sr-only">
        {record.name}
      </h1>
      <RecordDisclaimer record={record} />
      <Template record={record} />
      <section aria-label="Forrás" className="space-y-4 border-t border-[var(--desk-line)] pt-4">
        <SourceInfo record={record} />
        {record.raw && <RawFields raw={record.raw} />}
      </section>
    </article>
  );
}
