import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { sound } from '../lib/sound';
import { ambience } from '../lib/ambience';

interface Store {
  subscribe: (fn: () => void) => () => void;
  isOn: () => boolean;
  set: (on: boolean) => void;
}

function AudioToggle({ store, label, title, icon }: { store: Store; label: string; title: [string, string]; icon: (on: boolean) => ReactNode }) {
  const on = useSyncExternalStore(store.subscribe, store.isOn, () => false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => store.set(!on)}
      title={on ? title[0] : title[1]}
      className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 font-stamp text-sm tracking-[0.12em] uppercase hover:bg-[var(--desk-line)] aria-pressed:text-[#ff8a7a]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        {icon(on)}
      </svg>
      <span className="sr-only xl:not-sr-only">{label}</span>
    </button>
  );
}

/** Header switches for the optional sound effects and the background score (both off by default). */
export function AudioToggles({ className = '' }: { className?: string }) {
  useEffect(() => ambience.resumeOnGesture(), []);
  return (
    <span className={`flex items-center ${className}`}>
      <AudioToggle
        store={sound}
        label="Hang"
        title={['Hangeffektek kikapcsolása', 'Hangeffektek bekapcsolása (írógép, terminál, pecsét)']}
        icon={(on) => (
          <>
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            {on ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /> : <path d="M16 9l5 6M21 9l-5 6" />}
          </>
        )}
      />
      <AudioToggle
        store={ambience}
        label="Zene"
        title={['Aláfestő zene kikapcsolása', 'Aláfestő zene bekapcsolása']}
        icon={(on) => (
          <>
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="17" cy="16" r="3" fill="currentColor" />
            {!on && <path d="M3 3l18 18" />}
          </>
        )}
      />
    </span>
  );
}
