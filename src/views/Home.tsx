import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { Folder } from '../components/Folder';
import { PaperSheet } from '../components/PaperSheet';
import { PaperClip } from '../components/PaperClip';
import { Stamp } from '../components/Stamp';
import { RegistryNumber } from '../components/RegistryNumber';
import { TapeLabel } from '../components/TapeLabel';
import { SearchBox } from '../components/SearchBox';
import { Odometer } from '../components/Odometer';
import { SourceBadge } from '../components/SourceBadge';
import { Tilt } from '../components/Tilt';
import { useAsync } from '../hooks/useAsync';
import { belowFold, useGsap } from '../hooks/useGsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { loadManifest } from '../data/client';
import { SOURCE_TYPES, SOURCES, type SourceType } from '../data/sources';
import { PARAM } from '../search/urlState';
import { DATA_MODE } from '../config';
import { KartonSpecimen, NaploSpecimen, TerminalSpecimen } from './home/StoryDocs';
import { DeskProps } from './home/DeskProps';

const STORY: { source: SourceType; title: string; text: string }[] = [
  {
    source: 'karton6',
    title: 'Sárgult kartonlap',
    text: 'Előnyomott rovatok, írógéppel kitöltve: az ügynökök személyazonosító adatai és főbb tevékenységeik.',
  },
  {
    source: 'bnaplo',
    title: 'Vonalazott főkönyv',
    text: 'Sorszámozott sorok egy nyilvántartási naplóban. A beszervezési dossziék nevei – többnyire csak név és szám.',
  },
  {
    source: 'hadattar',
    title: 'Mágnesszalag',
    text: 'Az 1970-es évektől szalagon rögzített hálózati adatok és fedőnevek, foszforzöld terminálon kiolvasva.',
  },
];

const SPECIMENS = [KartonSpecimen, NaploSpecimen, TerminalSpecimen];
/** Resting place of each specimen in the stack (also the static, no-motion layout). */
const FAN = [
  { x: -6, y: 4, r: -5 },
  { x: 4, y: 0, r: 2.5 },
  { x: 0, y: -6, r: -1 },
];

/** Fictional examples typed into the empty search field, one after another. */
const EXAMPLES = ['Próbaházi Gábor', 'Fecske', 'Tesztelő Mária', 'Rigó', 'Mintás János'];

function useTypedPlaceholder(active: boolean): string {
  const reduced = useReducedMotion();
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active || reduced) return;
    let word = 0;
    let len = 0;
    let deleting = false;
    let timer = 0;
    const step = () => {
      const target = EXAMPLES[word]!;
      len += deleting ? -1 : 1;
      setText(target.slice(0, len));
      let wait = deleting ? 35 : 85;
      if (!deleting && len === target.length) {
        deleting = true;
        wait = 1600;
      } else if (deleting && len === 0) {
        deleting = false;
        word = (word + 1) % EXAMPLES.length;
        wait = 400;
      }
      timer = window.setTimeout(step, wait);
    };
    timer = window.setTimeout(step, 900);
    return () => clearTimeout(timer);
  }, [active, reduced]);
  return reduced || !active ? 'pl. Próbaházi Gábor, Fecske' : `pl. ${text}▌`;
}

/** Wear and tear on the folder cover: scuffed corners, a coffee ring and the string-tie button. */
function CoverWear() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(50,28,8,0.45),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(50,28,8,0.3),transparent_22%),radial-gradient(circle_at_100%_0%,rgba(50,28,8,0.25),transparent_18%)]" />
      <span className="absolute bottom-[16%] left-[7%] block h-28 w-28 rotate-12 rounded-full shadow-[inset_0_0_0_4px_rgba(60,32,10,0.28),inset_0_0_14px_4px_rgba(60,32,10,0.14)]" />
      <svg viewBox="0 0 40 120" className="absolute top-1/2 right-1 h-28 w-10 -translate-y-1/2 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.4)]">
        <circle cx="20" cy="22" r="13" fill="#a47c4c" stroke="#6b4a26" strokeWidth="2" />
        <circle cx="20" cy="22" r="3" fill="#4a3218" />
        <path d="M20 22 C 6 30, 34 40, 20 48 S 6 66, 22 74 S 30 96, 16 116" fill="none" stroke="#e8dcc0" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const manifest = useAsync(loadManifest, []);
  const root = useRef<HTMLDivElement>(null);
  const placeholder = useTypedPlaceholder(!text && !focused);

  // Scrolling also opens the folder, once.
  useEffect(() => {
    if (open) return;
    const onScroll = () => {
      if (window.scrollY > 40) setOpen(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  // Hero: the folder follows the pointer a little, as if lifted off the desk.
  useGsap(root, (gsap) => {
    const el = root.current?.querySelector('[data-hero-tilt]');
    if (!el || !window.matchMedia('(pointer: fine)').matches) return;
    gsap.set(el, { transformPerspective: 1400 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3' });
    // Desk props drift the other way, by their depth: a hint of parallax around the folder.
    const props = gsap.utils.toArray<HTMLElement>('[data-depth]').map((p) => ({
      depth: Number(p.dataset.depth),
      x: gsap.quickTo(p, 'x', { duration: 1.2, ease: 'power3' }),
      y: gsap.quickTo(p, 'y', { duration: 1.2, ease: 'power3' }),
    }));
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      ry(nx * 7);
      rx(-ny * 5);
      for (const p of props) {
        p.x(-nx * 18 * p.depth);
        p.y(-ny * 12 * p.depth);
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  });

  // The inside of the folder: sheets slide out one after another once the cover swings away.
  useGsap(
    root,
    (gsap) => {
      if (!open) return;
      gsap.from('[data-inside]', { y: 28, rotation: -1, opacity: 0, duration: 0.6, stagger: 0.09, delay: 0.45, ease: 'power3.out' });
    },
    [open],
  );

  // Scrollytelling: on wide screens the archive section is pinned and the three specimens
  // land on the stack one by one while the matching caption lights up.
  useGsap(
    root,
    (gsap, ScrollTrigger) => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const docs = gsap.utils.toArray<HTMLElement>('[data-doc]');
        const steps = gsap.utils.toArray<HTMLElement>('[data-step]');
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: '[data-story]',
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 0.7,
            snap: { snapTo: 'labels', duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: 'power1.inOut' },
          },
        });
        // Explicit start filter: GSAP cannot interpolate from "none".
        gsap.set(docs, { filter: 'brightness(1)' });
        gsap.set(docs.slice(1), { yPercent: 125, rotation: 14, opacity: 0 });
        gsap.set(steps.slice(1), { opacity: 0.35 });
        gsap.set('[data-progress]', { scaleY: 1 / 3 });
        tl.addLabel('s0');
        docs.slice(1).forEach((doc, i) => {
          tl.addLabel(`s${i + 1}`, '+=0.25')
            .to(doc, { yPercent: 0, rotation: FAN[i + 1]!.r, opacity: 1, duration: 1 }, `s${i + 1}`)
            .to(docs[i]!, { scale: 0.95, filter: 'brightness(0.85)', duration: 1 }, `s${i + 1}`)
            .to(steps[i]!, { opacity: 0.35, duration: 0.5 }, `s${i + 1}`)
            .to(steps[i + 1]!, { opacity: 1, duration: 0.5 }, `s${i + 1}+=0.3`)
            .to('[data-progress]', { scaleY: (i + 2) / 3, duration: 1 }, `s${i + 1}`);
        });
        tl.addLabel('end', '+=0.25');
      });

      // Everything else below the fold rises onto the desk as it scrolls into view.
      const reveal = belowFold(gsap.utils.toArray<HTMLElement>('[data-reveal]'));
      gsap.set(reveal, { y: 40, opacity: 0, rotation: 0.6 });
      ScrollTrigger.batch(reveal, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, rotation: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }),
      });
      return () => mm.revert();
    },
    [],
  );

  const submit = () => navigate(text.trim() ? `/kereses?q=${encodeURIComponent(text.trim())}` : '/kereses', { viewTransition: true });

  return (
    <div ref={root} className="mx-auto max-w-6xl px-4 pb-8">
      <PageMeta
        title="Az akta"
        indexable
        description="Az állambiztonsági nyilvántartások (6-os karton, B-napló, H-adattár) nyilvánossá tett adatai levéltári aktaként böngészve."
      />
      <h1 className="sr-only">Nyitott Akták – állambiztonsági nyilvántartások</h1>

      {/* Hero: the closed folder on the desk. */}
      <section aria-label="Az akta" className="relative flex min-h-[calc(100svh-6.5rem)] flex-col items-center justify-center pt-12 pb-20">
        <DeskProps />
        <div data-hero-tilt className="relative z-10 w-full max-w-3xl">
          <div className="thud [animation-delay:0.95s]">
            <Folder
              tab="Állambiztonsági iratok"
              open={open}
              cover={
                <div
                  className="relative flex h-full min-h-[20rem] cursor-pointer flex-col items-center justify-between gap-6 p-6 text-center sm:p-10 sm:pb-14"
                  onClick={() => setOpen(true)}
                >
                  <CoverWear />
                  <div className="flex w-full items-start justify-between gap-4">
                    <RegistryNumber value={`NYA-${new Date().getFullYear()}/0001`} color="black" className="text-sm whitespace-nowrap sm:text-base" />
                    <TapeLabel rotate={3} className="hidden sm:inline-block">
                      {DATA_MODE === 'mock' ? 'Demó példány' : 'Nyilvános'}
                    </TapeLabel>
                  </div>
                  <div>
                    <p aria-hidden="true" className="stencil-paint text-4xl font-bold tracking-[0.12em] uppercase sm:text-6xl">
                      Nyitott Akták
                    </p>
                    <p className="mt-2 font-mono-body text-sm text-ink sm:text-base">6-os karton · B-napló · H-adattár</p>
                  </div>
                  <Stamp size="xl" rotate={-8} slam={600}>
                    Szigorúan titkos
                  </Stamp>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(true);
                    }}
                    className="rounded-sm bg-ink px-5 py-2.5 font-stamp text-sm tracking-[0.2em] text-paper uppercase transition-transform hover:-translate-y-0.5 hover:bg-stamp-dark active:translate-y-0 active:scale-95"
                  >
                    Az akta megnyitása
                  </button>
                  <p
                    aria-hidden="true"
                    className="absolute inset-x-6 bottom-3 hidden justify-between font-stamp text-[0.6rem] tracking-[0.22em] text-ink/70 uppercase sm:flex"
                  >
                    <span>Másolni tilos</span>
                    <span>Készült 1 példányban</span>
                    <span>Kezelési szám: ________</span>
                  </p>
                </div>
              }
            >
              <PaperSheet className="relative p-6 sm:p-8">
                <PaperClip className="absolute -top-8 right-10 z-10 h-16 w-7" rotate={6} />
                <p data-inside className="font-stamp text-sm tracking-[0.2em] text-ink-faded uppercase">
                  Tájékoztató
                </p>
                <h2 data-inside className="mt-1 font-stamp text-2xl font-bold tracking-[0.12em] uppercase">
                  Az akta tartalma
                </h2>
                <p data-inside className="mt-3 max-w-prose">
                  2026. november 4-től nyilvánosak az egykori állambiztonsági hálózati személyek nyilvántartásainak adatai. Ez
                  az oldal három irattípust mutat be úgy, ahogy egy levéltári dossziéban lapoznánk őket:
                </p>
                <ul className="mt-4 space-y-3">
                  {SOURCE_TYPES.map((s) => (
                    <li data-inside key={s} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                      <SourceBadge source={s} className="self-start" />
                      <span>{SOURCES[s].description}</span>
                    </li>
                  ))}
                </ul>
                <p data-inside className="mt-4 max-w-prose border-l-4 border-stamp pl-3 text-sm">
                  <strong>A név szerepelése a nyilvántartásban önmagában nem bizonyítja az együttműködést</strong>, és azonos
                  nevű személyek összetéveszthetők. Részletek a{' '}
                  <Link to="/modszertan" viewTransition className="underline underline-offset-2">
                    módszertanban
                  </Link>
                  .
                </p>
              </PaperSheet>
            </Folder>
          </div>
        </div>
        <a
          href="#irattar"
          className="scroll-hint absolute bottom-4 flex flex-col items-center gap-1 font-stamp text-xs tracking-[0.25em] text-[var(--desk-muted)] uppercase"
        >
          Lapozz tovább
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* Scrollytelling: the three document types. */}
      <section id="irattar" data-story aria-labelledby="irattar-cim" className="flex scroll-mt-12 items-center py-12 lg:min-h-[100svh] lg:py-0">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="font-stamp text-xs tracking-[0.3em] text-stamp uppercase">Az irattár</p>
            <h2 id="irattar-cim" className="mt-1 font-stamp text-3xl font-bold tracking-[0.12em] uppercase sm:text-4xl">
              Három irattípus, három lenyomat
            </h2>
            <div className="mt-8 flex gap-5">
              <span aria-hidden="true" className="relative hidden w-0.5 shrink-0 bg-[var(--desk-line)] lg:block">
                <span data-progress className="absolute inset-0 origin-top bg-stamp" />
              </span>
              <ol className="space-y-7">
                {STORY.map((s, i) => (
                  <li key={s.source} data-step>
                    <p className="flex items-center gap-3">
                      <span className="font-terminal text-sm text-[var(--desk-muted)]">0{i + 1}</span>
                      <SourceBadge source={s.source} />
                    </p>
                    <h3 className="mt-2 font-stamp text-xl font-bold tracking-[0.12em] uppercase">{s.title}</h3>
                    <p className="mt-1 max-w-md text-[var(--desk-muted)]">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto h-[24rem] w-full max-w-lg sm:h-[26rem]">
            {SPECIMENS.map((Specimen, i) => (
              <div
                key={i}
                data-doc
                className="absolute inset-x-0 top-0 h-[22rem] sm:h-[24rem]"
                style={{ transform: `translate(${FAN[i]!.x}px, ${FAN[i]!.y}px) rotate(${FAN[i]!.r}deg)`, zIndex: i }}
              >
                <Specimen />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-reveal aria-labelledby="kereses-cim" className="mx-auto mt-16 max-w-3xl">
        <h2 id="kereses-cim" className="mb-3 font-stamp text-lg tracking-[0.2em] uppercase">
          Keresés a nyilvántartásban
        </h2>
        <div onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
          <SearchBox value={text} onChange={setText} onSubmit={submit} size="lg" placeholder={placeholder} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--desk-muted)]">Fiókok:</span>
          {SOURCE_TYPES.map((s) => (
            <Link
              key={s}
              to={`/kereses?${PARAM.sources}=${s}`}
              viewTransition
              className="transition-transform hover:-translate-y-0.5 hover:rotate-[-1deg]"
            >
              <SourceBadge source={s} className="px-2 py-1" />
            </Link>
          ))}
          <span className="ml-auto hidden text-xs text-[var(--desk-muted)] sm:inline">
            Tipp: a <kbd className="rounded-sm border border-[var(--desk-line)] px-1.5 font-terminal">/</kbd> billentyűvel bárhonnan
            a keresőbe ugorhatsz.
          </span>
        </div>
      </section>

      <section data-reveal aria-labelledby="szamok-cim" className="mx-auto mt-16 max-w-3xl">
        <h2 id="szamok-cim" className="mb-4 font-stamp text-lg tracking-[0.2em] uppercase">
          Nyilvántartott bejegyzések
        </h2>
        {manifest.status === 'ready' ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="paper col-span-2 p-4 sm:col-span-1">
              <dt className="font-stamp text-xs tracking-[0.2em] text-ink-faded uppercase">Összesen</dt>
              <dd className="mt-1 font-typewriter text-3xl text-ink">
                <Odometer value={manifest.value.totalRecords} />
              </dd>
            </div>
            {SOURCE_TYPES.map((s) => (
              <div key={s} className="paper p-4">
                <dt className="font-stamp text-xs tracking-[0.2em] text-ink-faded uppercase">{SOURCES[s].label}</dt>
                <dd className="mt-1 font-typewriter text-2xl text-ink">
                  <Odometer value={manifest.value.counts[s]} />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[var(--desk-muted)]">{manifest.status === 'error' ? 'A számok nem tölthetők be.' : 'Számlálás…'}</p>
        )}
      </section>

      <section data-reveal aria-label="További iratok" className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
        <Tilt className="rounded-[2px]">
          <Link to="/kimutatas" viewTransition className="paper paper-aged group block h-full rounded-[2px] p-6">
            <p className="font-stamp text-xs tracking-[0.25em] text-ink-faded uppercase">Belső jelentés</p>
            <h2 className="mt-1 font-stamp text-2xl font-bold tracking-[0.12em] uppercase">Kimutatás</h2>
            <p className="mt-2 text-sm">Összesítések irattípusonként, évenként és megyénként – egyes személyekről nem.</p>
            <p className="mt-4 font-stamp text-sm tracking-[0.15em] uppercase group-hover:underline">Megnyitás →</p>
          </Link>
        </Tilt>
        <Tilt className="rounded-[2px]">
          <Link to="/modszertan" viewTransition className="paper group block h-full rounded-[2px] p-6">
            <p className="font-stamp text-xs tracking-[0.25em] text-ink-faded uppercase">Tájékoztató</p>
            <h2 className="mt-1 font-stamp text-2xl font-bold tracking-[0.12em] uppercase">Módszertan</h2>
            <p className="mt-2 text-sm">Honnan jön az adat, mit jelentenek az irattípusok, és hogyan kérhető helyesbítés.</p>
            <p className="mt-4 font-stamp text-sm tracking-[0.15em] uppercase group-hover:underline">Megnyitás →</p>
          </Link>
        </Tilt>
      </section>
    </div>
  );
}
