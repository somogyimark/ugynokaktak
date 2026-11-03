import { useState, type ReactNode } from 'react';
import { PageMeta } from '../components/PageMeta';
import { Folder } from '../components/Folder';
import { PaperSheet } from '../components/PaperSheet';
import { Stamp } from '../components/Stamp';
import { Redaction } from '../components/Redaction';
import { TypewriterText } from '../components/TypewriterText';
import { PaperClip } from '../components/PaperClip';
import { TapeLabel } from '../components/TapeLabel';
import { RegistryNumber } from '../components/RegistryNumber';

const COLORS = [
  { name: 'Papír', token: 'paper', hex: '#efe6d2' },
  { name: 'Sötét papír', token: 'paper-dark', hex: '#e2d5b8' },
  { name: 'Karton', token: 'kraft', hex: '#a07a4a' },
  { name: 'Tinta', token: 'ink', hex: '#1d1b19' },
  { name: 'Pecsét', token: 'stamp', hex: '#b3261e' },
  { name: 'Golyóstoll', token: 'pen', hex: '#1f3fa8' },
  { name: 'Terminálzöld', token: 'phosphor', hex: '#33ff66' },
  { name: 'Terminál', token: 'terminal', hex: '#050805' },
] as const;

const FONTS = [
  { name: 'Special Elite – írógép (kitöltött adatok)', className: 'font-typewriter' },
  { name: 'Courier Prime – folyószöveg', className: 'font-mono-body' },
  { name: 'Oswald – pecsét, fejléc', className: 'font-stamp uppercase tracking-widest' },
  { name: 'IBM Plex Mono – terminál', className: 'font-terminal' },
] as const;

const SAMPLE = 'Árvíztűrő tükörfúrógép – ŐŰ őű 0123456789';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 border-b border-[var(--desk-line)] pb-1 font-stamp text-lg tracking-[0.2em] uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  const [open, setOpen] = useState(false);
  const [typeKey, setTypeKey] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageMeta title="Stílusútmutató" />
      <h1 className="font-stamp text-3xl font-bold tracking-[0.15em] uppercase sm:text-4xl">Stílusútmutató</h1>
      <p className="mt-2 max-w-prose text-[var(--desk-muted)]">
        A „Nyitott Akták” design system elemei. Minden szöveg valódi szöveg; a textúrák CSS-sel és SVG-zajjal készülnek.
      </p>

      <Section title="Színek">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLORS.map((c) => (
            <li key={c.token} className="overflow-hidden rounded border border-[var(--desk-line)]">
              <div className="h-16" style={{ background: c.hex }} />
              <div className="px-2 py-1.5 text-sm">
                <div className="font-bold">{c.name}</div>
                <code className="font-terminal text-xs">
                  {c.token} · {c.hex}
                </code>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Betűk">
        <ul className="space-y-4">
          {FONTS.map((f) => (
            <li key={f.name}>
              <div className="text-xs text-[var(--desk-muted)]">{f.name}</div>
              <div className={`text-xl break-words sm:text-2xl ${f.className}`}>{SAMPLE}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Folder – kartondosszié">
        <div className="max-w-xl pt-6">
          <Folder
            tab="Ált. iratok"
            open={open}
            cover={
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <Stamp size="lg" rotate={-7}>
                  Szigorúan titkos
                </Stamp>
                <RegistryNumber value="0-00/1975/0042" color="black" />
              </div>
            }
          >
            <PaperSheet className="p-6">
              <p className="ink-typed text-lg">A dosszié belseje. Ide kerülnek a lapok.</p>
            </PaperSheet>
          </Folder>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-pressed={open}
            className="mt-4 rounded-sm bg-ink px-4 py-2 font-stamp text-sm tracking-widest text-paper uppercase dark:bg-paper dark:text-ink"
          >
            {open ? 'Becsukás' : 'Kinyitás'}
          </button>
        </div>
      </Section>

      <Section title="PaperSheet – papírlapok">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PaperSheet className="p-5">
            <h3 className="font-stamp tracking-widest uppercase">plain</h3>
            <p className="mt-2 text-sm">Általános papírlap.</p>
          </PaperSheet>
          <PaperSheet variant="card" tilt={-1.2} className="p-5">
            <h3 className="font-stamp tracking-widest uppercase">card</h3>
            <p className="mt-2 text-sm">Sárgult kartonlap.</p>
          </PaperSheet>
          <PaperSheet variant="ledger" className="p-5 leading-[2.25rem]">
            <h3 className="pl-12 font-stamp tracking-widest uppercase">ledger</h3>
            <p className="pl-12 text-sm">Vonalazott főkönyvi lap.</p>
          </PaperSheet>
          <PaperSheet variant="aged" tilt={0.8} className="p-5">
            <h3 className="font-stamp tracking-widest uppercase">aged</h3>
            <p className="mt-2 text-sm">Megöregedett irat.</p>
          </PaperSheet>
        </div>
      </Section>

      <Section title="Stamp – pecsétek">
        <PaperSheet className="flex flex-wrap items-center gap-6 p-6">
          <Stamp>Szigorúan titkos</Stamp>
          <Stamp color="blue" rotate={4}>
            Iktatva
          </Stamp>
          <Stamp color="black" rotate={-2} size="sm">
            Másolat
          </Stamp>
          <Stamp shape="round" rotate={10} size="sm" className="w-24">
            III/III.
            <br />
            osztály
          </Stamp>
          <Stamp size="lg" rotate={-12}>
            Fiktív
          </Stamp>
        </PaperSheet>
      </Section>

      <Section title="Redaction – kitakarás">
        <PaperSheet className="p-6">
          <p className="leading-loose">
            Születési hely: <Redaction seed="a" /> · Anyja neve: <Redaction seed="b" /> · Fedőnév: <Redaction chars={8} />
          </p>
          <p className="mt-2 text-sm text-ink-faded">
            Az egér fölé vitelekor csak az ok jelenik meg („ADAT NEM ÁLL RENDELKEZÉSRE”); a sáv mögött nincs tartalom.
          </p>
        </PaperSheet>
      </Section>

      <Section title="TypewriterText – írógép">
        <div className="grid gap-6 sm:grid-cols-2">
          <PaperSheet variant="card" className="p-6">
            <TypewriterText jitter className="ink-typed block text-xl" text="Próbaházi Demó Gábor – fiktív" />
            <p className="mt-2 text-sm text-ink-faded">Egyenetlen alapvonal és festékszalag.</p>
          </PaperSheet>
          <div className="terminal-screen rounded-md p-6">
            <TypewriterText key={typeKey} animate cursor text="> BETÖLTÉS... SZALAG 07 / BLOKK 0042 OK" />
            <button type="button" className="mt-4 block border border-phosphor px-3 py-1 text-sm" onClick={() => setTypeKey((k) => k + 1)}>
              Újra
            </button>
          </div>
        </div>
      </Section>

      <Section title="PaperClip, TapeLabel, RegistryNumber">
        <PaperSheet className="relative flex flex-wrap items-center gap-8 p-8">
          <PaperClip className="absolute -top-5 left-6 h-20 w-8" rotate={-6} />
          <TapeLabel>B-napló · 1975–1979</TapeLabel>
          <TapeLabel rotate={3}>H-adattár / szalag 07</TapeLabel>
          <RegistryNumber value="6-K/1987/00421" />
          <RegistryNumber value="B-0042/1971" color="red" label="Nyt. sz." />
        </PaperSheet>
      </Section>
    </div>
  );
}
