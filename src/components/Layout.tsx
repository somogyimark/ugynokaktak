import { useEffect } from 'react';
import { NavLink, Outlet, Link, ScrollRestoration, useNavigate } from 'react-router';
import { SvgDefs } from './SvgDefs';
import { DemoBanner } from './DemoBanner';
import { DeskLamp } from './DeskLamp';
import { AudioToggles } from './AudioToggles';

const NAV = [
  { to: '/', label: 'Az akta', end: true },
  { to: '/kereses', label: 'Katalógus', end: false },
  { to: '/kimutatas', label: 'Kimutatás', end: false },
  { to: '/modszertan', label: 'Módszertan', end: false },
] as const;

/** "/" anywhere (outside form fields) jumps to the search box, like on most catalogue sites. */
function useSearchShortcut() {
  const navigate = useNavigate();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      const box = document.getElementById('kereso');
      if (box) box.focus();
      else navigate('/kereses', { state: { focusSearch: true }, viewTransition: true });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}

export function Layout() {
  useSearchShortcut();
  return (
    <div className="flex min-h-dvh flex-col">
      {/* New pages start at the top; back/forward restores the previous position. Every full page
          load gets the key "default", so those entries are keyed by URL instead. */}
      <ScrollRestoration getKey={(loc) => (loc.key === 'default' ? loc.pathname + loc.search : loc.key)} />
      <SvgDefs />
      <DeskLamp />
      <a
        href="#tartalom"
        className="sr-only-focusable fixed top-2 left-2 z-50 bg-ink px-3 py-2 font-stamp text-paper uppercase"
      >
        Ugrás a tartalomra
      </a>
      <DemoBanner />
      <header className="border-b border-[var(--desk-line)] [view-transition-name:site-header]">
        {/* Below lg the menu always gets its own row: the header height must not depend on whether
            the web font has loaded yet (that would be a layout shift). */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" viewTransition className="group mr-auto flex items-baseline gap-2 no-underline">
            <span className="font-stencil text-xl font-bold tracking-[0.12em] uppercase">Nyitott Akták</span>
            <span className="hidden font-terminal text-xs text-[var(--desk-muted)] xl:inline">ÁLLAMBIZTONSÁGI NYILVÁNTARTÁSOK</span>
          </Link>
          <AudioToggles className="lg:order-last" />
          <nav aria-label="Fő navigáció" className="w-full lg:w-auto">
            <ul className="flex flex-wrap gap-x-1 gap-y-1 font-stamp text-sm tracking-[0.12em] uppercase">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    viewTransition
                    className={({ isActive }) =>
                      `inline-block rounded-sm px-2.5 py-1.5 transition-colors ${
                        isActive ? 'bg-paper text-ink' : 'hover:bg-[var(--desk-line)]'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {/* min-h keeps the footer below the fold while lazy pages and data load (no layout shift). */}
      <main id="tartalom" className="min-h-[100dvh] flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="mt-12 border-t border-[var(--desk-line)] text-sm text-[var(--desk-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between">
          <p className="max-w-prose">
            A név szerepelése a nyilvántartásban önmagában nem bizonyítja az együttműködést. Az oldal nem gyűjt
            látogatottsági vagy keresési adatokat.
          </p>
          <p className="flex gap-4">
            <Link className="underline underline-offset-2" to="/modszertan" viewTransition>
              Módszertan és jogi tudnivalók
            </Link>
            <Link className="underline underline-offset-2" to="/styleguide" viewTransition>
              Stílusútmutató
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
