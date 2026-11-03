import { DATA_MODE } from '../config';
import { useAsync } from '../hooks/useAsync';
import { loadManifest } from '../data/client';

export const DEMO_LABEL = 'FIKTÍV TESZTADAT – DEMÓ';

/** Pure visibility rule: shown in mock mode, and also whenever the loaded data says it is mock. */
export function isDemo(envMode: 'mock' | 'live', manifestMode?: 'mock' | 'live'): boolean {
  return envMode === 'mock' || manifestMode === 'mock';
}

/**
 * Permanent, non-dismissible demo ribbon. Visible whenever VITE_DATA_MODE=mock, and also
 * whenever the loaded dataset itself is mock data (a safety net against misconfiguration).
 */
export function DemoBanner() {
  const manifest = useAsync(loadManifest, []);
  const manifestMode = manifest.status === 'ready' ? manifest.value.mode : undefined;
  if (!isDemo(DATA_MODE, manifestMode)) return null;
  return (
    <>
      <div
        role="note"
        aria-label="Figyelem: az oldalon fiktív tesztadat látható"
        data-testid="demo-banner"
        className="sticky top-0 z-40 border-y-2 border-stamp-dark bg-stamp text-center font-stamp text-sm font-bold tracking-[0.25em] text-white uppercase shadow-md"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.14) 0 12px, transparent 12px 24px)',
        }}
      >
        <span className="inline-block px-3 py-1.5">{DEMO_LABEL}</span>
        <span className="hidden font-mono-body text-xs tracking-normal normal-case sm:inline">
          · minden név és adat kitalált, valós személyre nem utal
        </span>
      </div>
      {/* Extra corner ribbon on wider screens; the sticky bar above is always visible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-[-3.5rem] bottom-6 z-40 hidden w-56 opacity-90 sm:block rotate-[-45deg] bg-stamp py-1 text-center font-stamp text-xs font-bold tracking-[0.2em] text-white uppercase shadow-lg"
      >
        Fiktív · Demó
      </div>
    </>
  );
}
