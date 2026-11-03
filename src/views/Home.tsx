import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageMeta } from '../components/PageMeta';
import { Folder } from '../components/Folder';
import { PaperSheet } from '../components/PaperSheet';
import { Stamp } from '../components/Stamp';
import { RegistryNumber } from '../components/RegistryNumber';
import { TapeLabel } from '../components/TapeLabel';
import { SearchBox } from '../components/SearchBox';
import { Counter } from '../components/Counter';
import { SourceBadge } from '../components/SourceBadge';
import { useAsync } from '../hooks/useAsync';
import { loadManifest } from '../data/client';
import { SOURCE_TYPES, SOURCES } from '../data/sources';
import { DATA_MODE } from '../config';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const manifest = useAsync(loadManifest, []);

  // Scrolling also opens the folder, once.
  useEffect(() => {
    if (open) return;
    const onScroll = () => {
      if (window.scrollY > 40) setOpen(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  const submit = () => navigate(text.trim() ? `/kereses?q=${encodeURIComponent(text.trim())}` : '/kereses');

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12 pb-8">
      <PageMeta
        title="Az akta"
        indexable
        description="Az állambiztonsági nyilvántartások (6-os karton, B-napló, H-adattár) nyilvánossá tett adatai levéltári aktaként böngészve."
      />

      <h1 className="sr-only">Nyitott Akták – állambiztonsági nyilvántartások</h1>
      <Folder
        tab="Állambiztonsági iratok"
        open={open}
        className="mx-auto max-w-3xl"
        cover={
          <div
            className="flex h-full min-h-[18rem] cursor-pointer flex-col items-center justify-between gap-6 p-6 text-center sm:p-10"
            onClick={() => setOpen(true)}
          >
            <div className="flex w-full items-start justify-between gap-4">
              <RegistryNumber value={`NYA-${new Date().getFullYear()}/0001`} color="black" className="text-sm whitespace-nowrap sm:text-base" />
              <TapeLabel rotate={3} className="hidden sm:inline-block">
                {DATA_MODE === 'mock' ? 'Demó példány' : 'Nyilvános'}
              </TapeLabel>
            </div>
            <div>
              <p aria-hidden="true" className="font-stamp text-4xl font-bold tracking-[0.18em] text-ink uppercase sm:text-6xl">
                Nyitott Akták
              </p>
              <p className="mt-2 font-mono-body text-sm text-ink sm:text-base">6-os karton · B-napló · H-adattár</p>
            </div>
            <Stamp size="xl" rotate={-8}>
              Szigorúan titkos
            </Stamp>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="rounded-sm bg-ink px-5 py-2 font-stamp text-sm tracking-[0.2em] text-paper uppercase hover:bg-stamp-dark"
            >
              Az akta megnyitása
            </button>
          </div>
        }
      >
        <PaperSheet className="p-6 sm:p-8">
          <p className="font-stamp text-sm tracking-[0.2em] text-ink-faded uppercase">Tájékoztató</p>
          <h2 className="mt-1 font-stamp text-2xl font-bold tracking-[0.12em] uppercase">Az akta tartalma</h2>
          <p className="mt-3 max-w-prose">
            2026. november 4-től nyilvánosak az egykori állambiztonsági hálózati személyek nyilvántartásainak adatai. Ez az
            oldal három irattípust mutat be úgy, ahogy egy levéltári dossziéban lapoznánk őket:
          </p>
          <ul className="mt-4 space-y-3">
            {SOURCE_TYPES.map((s) => (
              <li key={s} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                <SourceBadge source={s} className="self-start" />
                <span>{SOURCES[s].description}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-prose border-l-4 border-stamp pl-3 text-sm">
            <strong>A név szerepelése a nyilvántartásban önmagában nem bizonyítja az együttműködést</strong>, és azonos nevű
            személyek összetéveszthetők. Részletek a{' '}
            <Link to="/modszertan" className="underline underline-offset-2">
              módszertanban
            </Link>
            .
          </p>
        </PaperSheet>
      </Folder>

      <section aria-labelledby="kereses-cim" className="mx-auto mt-14 max-w-3xl">
        <h2 id="kereses-cim" className="mb-3 font-stamp text-lg tracking-[0.2em] uppercase">
          Keresés a nyilvántartásban
        </h2>
        <SearchBox value={text} onChange={setText} onSubmit={submit} size="lg" />
      </section>

      <section aria-labelledby="szamok-cim" className="mx-auto mt-14 max-w-3xl">
        <h2 id="szamok-cim" className="mb-4 font-stamp text-lg tracking-[0.2em] uppercase">
          Nyilvántartott bejegyzések
        </h2>
        {manifest.status === 'ready' ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="paper col-span-2 p-4 sm:col-span-1">
              <dt className="font-stamp text-xs tracking-[0.2em] text-ink-faded uppercase">Összesen</dt>
              <dd className="mt-1 font-typewriter text-3xl text-ink">
                <Counter value={manifest.value.totalRecords} />
              </dd>
            </div>
            {SOURCE_TYPES.map((s) => (
              <div key={s} className="paper p-4">
                <dt className="font-stamp text-xs tracking-[0.2em] text-ink-faded uppercase">{SOURCES[s].label}</dt>
                <dd className="mt-1 font-typewriter text-2xl text-ink">
                  <Counter value={manifest.value.counts[s]} />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-[var(--desk-muted)]">{manifest.status === 'error' ? 'A számok nem tölthetők be.' : 'Számlálás…'}</p>
        )}
        <p className="mt-4 text-sm">
          <Link to="/kimutatas" className="underline underline-offset-2">
            Részletes kimutatás →
          </Link>
        </p>
      </section>
    </div>
  );
}
