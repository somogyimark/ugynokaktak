import { useState } from 'react';
import type { AgentRecord, OptionalField } from '../../data/schema';
import { Redaction } from '../../components/Redaction';
import { TypewriterText } from '../../components/TypewriterText';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { FIELD_LABELS, fieldText, rawText } from './fields';

const FIELDS: (OptionalField | 'name')[] = [
  'name',
  'coverName',
  'birthDate',
  'birthPlace',
  'motherName',
  'recruitmentDate',
  'recruitingUnit',
  'category',
  'activity',
  'registryNumber',
];

const LABEL_WIDTH = 22;

/** "NÉV....................: " – fixed-width tape record label. */
function tapeLabel(field: OptionalField | 'name'): string {
  const label = FIELD_LABELS[field].toUpperCase();
  return `${label}${'.'.repeat(Math.max(2, LABEL_WIDTH - label.length))}: `;
}

/**
 * H-adattár: phosphor terminal read-out of a magnetic tape record. Fields "load" one after
 * another, character by character; with reduced motion everything appears at once.
 * Screen readers get a static definition list; the animated read-out is decorative.
 */
export function HAdattarTerminal({ record }: { record: AgentRecord }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const animate = !reduced && !skipped;
  const visibleUpTo = animate ? step : FIELDS.length;
  const tape = rawText(record, 'szalag') ?? 'SZALAG ??';
  const block = rawText(record, 'blokk');
  const header = `> OLVASÁS: ${tape}${block ? ` / BLOKK ${block.padStart(4, '0')}` : ''} ... OK`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl bg-[#2a2a28] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] sm:p-4">
        <div className="terminal-screen overflow-hidden rounded-lg px-4 py-5 text-sm leading-7 sm:px-6 sm:text-base">
          <p className="mb-1 text-phosphor-dim">H-ADATTÁR · HÁLÓZATI SZEMÉLYEK NYILVÁNTARTÁSA</p>
          <p className="mb-4 break-all">{header}</p>

          {/* Accessible, static version. */}
          <dl className="sr-only">
            {FIELDS.map((f) => {
              const text = fieldText(record, f, (d) => d);
              return (
                <div key={f}>
                  <dt>{FIELD_LABELS[f]}</dt>
                  <dd>{text ?? 'adat nem áll rendelkezésre'}</dd>
                </div>
              );
            })}
          </dl>

          <div aria-hidden="true">
            {FIELDS.slice(0, visibleUpTo + 1).map((f, i) => {
              const text = fieldText(record, f, (d) => d);
              const current = animate && i === step;
              return (
                <div key={f} className="flex flex-wrap" data-field={f}>
                  <span className="whitespace-pre text-phosphor-dim">{tapeLabel(f)}</span>
                  {text ? (
                    <TypewriterText
                      text={text.toUpperCase()}
                      animate={current}
                      speed={22}
                      cursor={current}
                      onDone={current ? () => setStep((s) => Math.max(s, i + 1)) : undefined}
                      className="break-all"
                    />
                  ) : (
                    <MissingTapeValue current={current} onDone={() => setStep((s) => Math.max(s, i + 1))} seed={`${record.id}-${f}`} />
                  )}
                </div>
              );
            })}
            {visibleUpTo >= FIELDS.length && (
              <p className="mt-4">
                {'> '}REKORD VÉGE<span className="ml-1 inline-block h-[1em] w-[0.6em] animate-blink bg-current align-[-0.15em]" />
              </p>
            )}
          </div>
        </div>
      </div>
      {animate && step < FIELDS.length && (
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="mt-3 border border-[var(--desk-line)] px-3 py-1 font-terminal text-xs tracking-wider uppercase"
        >
          Teljes rekord azonnal
        </button>
      )}
    </div>
  );
}

/** Missing tape value: a dim block, revealed after a short "seek" when animating. */
function MissingTapeValue({ current, onDone, seed }: { current: boolean; onDone: () => void; seed: string }) {
  return (
    <span>
      {current ? (
        <TypewriterText text="░░░░░░" animate speed={40} onDone={onDone} />
      ) : (
        <Redaction tone="terminal" seed={seed} />
      )}
    </span>
  );
}
