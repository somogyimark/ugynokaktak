import { useEffect, useState } from 'react';
import type { AgentRecord, OptionalField } from '../../data/schema';
import { Redaction } from '../../components/Redaction';
import { TypewriterText } from '../../components/TypewriterText';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sound } from '../../lib/sound';
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
  const reading = animate && step < FIELDS.length;

  // A short beep as each field starts to load from the tape.
  useEffect(() => {
    if (animate) sound.beep();
  }, [animate, step]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-xl bg-[#2a2a28] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] sm:p-4">
        <TapeDeck spinning={reading} />
        <div className="terminal-screen crt-on overflow-hidden rounded-lg px-4 py-5 text-sm leading-7 sm:px-6 sm:text-base">
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
      {reading && (
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

/** Two magnetic tape reels above the screen; they turn while the record is being read. */
function TapeDeck({ spinning }: { spinning: boolean }) {
  const reel = (cx: number) => (
    <g className={`reel ${spinning ? '' : 'reel-stopped'}`}>
      <circle cx={cx} cy="30" r="25" fill="#5b4532" stroke="#9c8a72" strokeWidth="2" />
      <circle cx={cx} cy="30" r="17" fill="none" stroke="#2c2118" strokeWidth="5" />
      <circle cx={cx} cy="30" r="9" fill="#bbb" />
      {[0, 120, 240].map((a) => (
        <rect key={a} x={cx - 2.5} y="9" width="5" height="12" rx="2" fill="#bbb" transform={`rotate(${a} ${cx} 30)`} />
      ))}
      <circle cx={cx} cy="30" r="3" fill="#222" />
    </g>
  );
  return (
    <div aria-hidden="true" className="mb-2 flex items-center justify-between gap-3 px-2 sm:mb-3">
      <svg viewBox="0 0 170 60" className="h-12 w-auto sm:h-14">
        <path d="M30 54 L85 50 L140 54" fill="none" stroke="#5a4632" strokeWidth="2" />
        {reel(30)}
        {reel(140)}
      </svg>
      <span className="flex items-center gap-2 font-terminal text-[0.7rem] tracking-widest text-[#b9b3a4] uppercase">
        <span className={`h-2 w-2 rounded-full ${spinning ? 'animate-blink bg-[#ff5a3c] shadow-[0_0_6px_#ff5a3c]' : 'bg-phosphor-dim'}`} />
        {spinning ? 'Olvasás' : 'Kész'}
      </span>
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
