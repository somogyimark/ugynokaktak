import type { AgentRecord, OptionalField } from '../../data/schema';
import { PaperSheet } from '../../components/PaperSheet';
import { PaperClip } from '../../components/PaperClip';
import { Redaction } from '../../components/Redaction';
import { RegistryNumber } from '../../components/RegistryNumber';
import { Stamp } from '../../components/Stamp';
import { TypewriterText } from '../../components/TypewriterText';
import { formatDate } from '../../lib/format';
import { seededRandom } from '../../lib/random';
import { FIELD_LABELS, fieldText } from './fields';

type CardField = { field: OptionalField | 'name'; wide?: boolean };

const LAYOUT: CardField[] = [
  { field: 'name', wide: true },
  { field: 'coverName' },
  { field: 'category' },
  { field: 'birthDate' },
  { field: 'birthPlace' },
  { field: 'motherName', wide: true },
  { field: 'recruitmentDate' },
  { field: 'recruitingUnit' },
  { field: 'activity', wide: true },
];

/** One pre-printed box on the card: faded label, typed value slightly off the line. */
function CardBox({ record, field, wide, rnd }: CardField & { record: AgentRecord; rnd: () => number }) {
  const text = fieldText(record, field, formatDate);
  const dx = (rnd() - 0.3) * 0.6;
  const dy = (rnd() - 0.5) * 0.25;
  const rot = (rnd() - 0.5) * 0.9;
  return (
    <div className={`border-b border-r border-ink/25 px-3 pt-1.5 pb-2 ${wide ? 'sm:col-span-2' : ''}`} data-field={field}>
      <dt className="font-stamp text-[0.68rem] tracking-[0.18em] text-ink-faded uppercase">{FIELD_LABELS[field]}</dt>
      <dd className="mt-0.5 min-h-7">
        {text ? (
          <span className="inline-block" style={{ transform: `translate(${dx}em, ${dy}em) rotate(${rot}deg)` }}>
            <TypewriterText text={text} jitter className={`ink-typed ${field === 'name' ? 'text-2xl' : 'text-lg'} [filter:url(#ink-bleed)]`} />
          </span>
        ) : (
          <Redaction seed={`${record.id}-${field}`} />
        )}
      </dd>
    </div>
  );
}

/** 6-os karton: a scanned, slightly yellowed index card with pre-printed field labels. */
export function Karton6Sheet({ record }: { record: AgentRecord }) {
  const rnd = seededRandom(record.id);
  const blotX = 20 + rnd() * 60;
  const blotY = 15 + rnd() * 60;
  return (
    <div className="relative mx-auto max-w-3xl pt-8">
      <PaperClip className="absolute -top-10 left-24 z-10 h-20 w-8 sm:left-32" rotate={-4} />
      <PaperSheet variant="card" tilt={-0.6} className="overflow-hidden">
        {/* Ink blots: decorative only. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute h-10 w-14 rounded-[45%] bg-[radial-gradient(circle,rgba(27,26,42,0.28),rgba(27,26,42,0.08)_55%,transparent_70%)]"
          style={{ left: `${blotX}%`, top: `${blotY}%`, rotate: `${rnd() * 90}deg` }}
        />
        <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink/60 px-4 pt-4 pb-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-stamp text-5xl leading-none font-bold text-ink/80" aria-hidden="true">
              6
            </span>
            <div>
              <p className="font-stamp text-lg font-bold tracking-[0.2em] uppercase">Nyilvántartó karton</p>
              <p className="font-stamp text-[0.68rem] tracking-[0.2em] text-ink-faded uppercase">Hálózati személy · 6-os karton</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Stamp size="sm" rotate={4}>
              Szigorúan titkos
            </Stamp>
            {record.registryNumber ? (
              <RegistryNumber value={record.registryNumber} label="Nyt. sz." />
            ) : (
              <span className="text-sm">
                Nyt. sz.: <Redaction seed={`${record.id}-reg`} chars={10} />
              </span>
            )}
          </div>
        </header>
        <dl className="grid border-t border-l border-ink/25 sm:grid-cols-2">
          {LAYOUT.map((f) => (
            <CardBox key={f.field} record={record} rnd={rnd} {...f} />
          ))}
        </dl>
        <footer className="flex items-end justify-between px-4 py-3 text-[0.68rem] text-ink-faded sm:px-6">
          <span className="font-stamp tracking-[0.2em] uppercase">BM · Nyomtatvány 6.</span>
          <Stamp color="blue" size="sm" rotate={-8} className="opacity-70">
            Iktatva
          </Stamp>
        </footer>
      </PaperSheet>
    </div>
  );
}
