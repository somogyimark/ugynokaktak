import { PaperSheet } from '../../components/PaperSheet';
import { Redaction } from '../../components/Redaction';
import { Stamp } from '../../components/Stamp';
import { TapeLabel } from '../../components/TapeLabel';

/*
 * Decorative specimens of the three document types for the landing page. They contain no
 * record data at all: every value is a redaction bar or an illegible placeholder.
 */

const Label = ({ children }: { children: string }) => (
  <span className="block font-stamp text-[0.6rem] tracking-[0.18em] text-ink-faded uppercase">{children}</span>
);

export function KartonSpecimen() {
  return (
    <PaperSheet variant="card" className="h-full overflow-hidden">
      <div className="flex items-start justify-between border-b-2 border-ink/60 px-4 pt-3 pb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-stamp text-4xl leading-none font-bold text-ink/80">6</span>
          <span className="font-stamp text-sm font-bold tracking-[0.2em] uppercase">Nyilvántartó karton</span>
        </div>
        <Stamp size="sm" rotate={5}>
          Szigorúan titkos
        </Stamp>
      </div>
      <div className="grid grid-cols-2 border-l border-ink/25 text-ink">
        {['Név', 'Fedőnév', 'Születési idő', 'Születési hely', 'Anyja neve', 'Beszervezés ideje', 'Beszervező szerv', 'Kategória'].map((l, i) => (
          <div key={l} className={`border-r border-b border-ink/25 px-3 pt-1 pb-2 ${i === 0 ? 'col-span-2' : ''}`}>
            <Label>{l}</Label>
            <Redaction seed={`spec-k-${l}`} />
          </div>
        ))}
      </div>
      <p className="px-4 py-2 font-stamp text-[0.6rem] tracking-[0.2em] text-ink-faded uppercase">BM · Nyomtatvány 6.</p>
    </PaperSheet>
  );
}

export function NaploSpecimen() {
  return (
    <PaperSheet variant="ledger" className="h-full overflow-hidden [--rule:2.25rem]">
      <div className="flex items-baseline justify-between border-b-2 border-stamp/60 py-2 pr-4 pl-16">
        <span className="font-stamp text-sm font-bold tracking-[0.2em] uppercase">Beszervezési napló</span>
        <TapeLabel rotate={2} className="text-xs">
          B-napló
        </TapeLabel>
      </div>
      <ol className="text-ink">
        {Array.from({ length: 8 }, (_, i) => (
          <li key={i} className={`flex h-9 items-center gap-3 pr-4 ${i === 3 ? 'bg-[rgb(255_226_92/0.55)]' : ''}`}>
            <span className="w-12 shrink-0 pr-2 text-right font-terminal text-xs text-stamp-dark">{41 + i}.</span>
            {i === 3 ? (
              <Redaction seed="spec-n" chars={18} />
            ) : (
              <span className="ink-typed truncate pl-2 text-ink/70 blur-[3px] select-none">
                {'m'.repeat(5 + ((i * 3) % 6))} {'m'.repeat(4 + ((i * 5) % 5))} <span className="ml-4">19{60 + i * 3}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </PaperSheet>
  );
}

export function TerminalSpecimen() {
  const lines = ['NÉV', 'FEDŐNÉV', 'SZÜLETÉSI IDŐ', 'BESZERVEZÉS', 'KATEGÓRIA', 'NYT. SZÁM'];
  return (
    <div className="h-full rounded-xl bg-[#2a2a28] p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)]">
      <div className="terminal-screen h-full overflow-hidden rounded-lg px-4 py-4 text-xs leading-6 sm:text-sm sm:leading-7">
        <p className="text-phosphor-dim">H-ADATTÁR · HÁLÓZATI SZEMÉLYEK</p>
        <p className="mb-2">{'> '}OLVASÁS: SZALAG 07 / BLOKK 0412 ... OK</p>
        {lines.map((l) => (
          <p key={l} className="whitespace-pre">
            <span className="text-phosphor-dim">{`${l}${'.'.repeat(16 - l.length)}: `}</span>
            {'░'.repeat(8 + (l.length % 5))}
          </p>
        ))}
        <p className="mt-2">
          {'> '}REKORD VÉGE<span className="ml-1 inline-block h-[1em] w-[0.6em] animate-blink bg-current align-[-0.15em]" />
        </p>
      </div>
    </div>
  );
}
