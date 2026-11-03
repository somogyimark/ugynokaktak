import type { AgentRecord, OptionalField } from '../../data/schema';
import { PaperSheet } from '../../components/PaperSheet';
import { Redaction } from '../../components/Redaction';
import { TapeLabel } from '../../components/TapeLabel';
import { TypewriterText } from '../../components/TypewriterText';
import { fnv1a, seededRandom } from '../../lib/random';
import { formatDate } from '../../lib/format';
import { FIELD_LABELS, fieldText, rawNumber, rawText } from './fields';

const ROWS_PER_PAGE = 30;
const NEIGHBOURS = 3;

const DETAILS: OptionalField[] = ['coverName', 'birthDate', 'birthPlace', 'recruitmentDate', 'recruitingUnit', 'category', 'registryNumber', 'motherName', 'activity'];

/**
 * Placeholder squiggle for neighbouring ledger lines. Deliberately NOT real data:
 * other people's entries must never leak through the blur.
 */
function NeighbourLine({ seed }: { seed: string }) {
  const rnd = seededRandom(seed);
  const word = () => 'm'.repeat(3 + Math.floor(rnd() * 7));
  return (
    <span className="ink-typed block truncate text-lg text-ink/80 blur-[3.5px] select-none">
      {`${word()} ${word()}`} <span className="ml-6">{word()}</span> <span className="ml-6">19{Math.floor(10 + rnd() * 80)}</span>
    </span>
  );
}

/** B-napló: a ruled ledger page with numbered lines; the selected line highlighted, neighbours blurred. */
export function BNaploSheet({ record }: { record: AgentRecord }) {
  const row = rawNumber(record, 'sor') ?? (fnv1a(record.id) % ROWS_PER_PAGE) + 1;
  const page = rawNumber(record, 'lap');
  const ledgerName = rawText(record, 'naplo') ?? 'B-napló';
  const first = Math.max(1, row - NEIGHBOURS);
  const lines = Array.from({ length: NEIGHBOURS * 2 + 1 }, (_, i) => first + i);

  return (
    <div className="relative mx-auto max-w-4xl pt-4">
      <div className="absolute -top-1 right-6 z-10">
        <TapeLabel rotate={2}>{ledgerName}</TapeLabel>
      </div>
      <PaperSheet variant="ledger" className="overflow-hidden pb-4 [--rule:2.75rem]">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-stamp/60 py-3 pr-4 pl-16 sm:pr-6">
          <p className="font-stamp text-lg font-bold tracking-[0.2em] uppercase">Beszervezési napló</p>
          <p className="font-terminal text-xs text-ink-soft">
            {page ? `${page}. lap` : 'lapszám nem ismert'}
          </p>
        </header>
        <ol aria-label="Napló sorai" className="text-ink">
          {lines.map((n) => {
            const selected = n === row;
            return (
              <li
                key={n}
                aria-current={selected ? 'true' : undefined}
                aria-hidden={selected ? undefined : true}
                className={`relative flex items-start gap-3 py-2 pr-4 sm:pr-6 ${
                  selected ? 'highlight-sweep z-[1]' : 'opacity-70'
                }`}
              >
                <span className="w-12 shrink-0 pt-1 pr-2 text-right font-terminal text-sm text-stamp-dark tabular-nums">{n}.</span>
                <div className="min-w-0 flex-1 pl-2">
                  {selected ? (
                    <>
                      <span className="sr-only">{n}. sor: </span>
                      <TypewriterText text={record.name} jitter animate delay={700} speed={45} as="p" className="ink-typed text-2xl leading-9" />
                      <dl className="mt-1 grid gap-x-6 gap-y-1 pb-1 sm:grid-cols-2">
                        {DETAILS.map((field) => {
                          const text = fieldText(record, field, formatDate);
                          return (
                            <div key={field} className="flex flex-wrap items-baseline gap-x-2" data-field={field}>
                              <dt className="font-stamp text-[0.68rem] tracking-[0.16em] text-ink-faded uppercase">{FIELD_LABELS[field]}:</dt>
                              <dd>{text ? <span className="ink-typed text-lg">{text}</span> : <Redaction seed={`${record.id}-${field}`} />}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </>
                  ) : (
                    <NeighbourLine seed={`${record.id}-${n}`} />
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 pr-4 pl-16 text-xs text-ink-faded">
          A szomszédos sorok szándékosan olvashatatlanok: más bejegyzések adatai ezen a lapon nem jelennek meg.
        </p>
      </PaperSheet>
    </div>
  );
}
