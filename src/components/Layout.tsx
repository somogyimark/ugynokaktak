import { NavLink, Outlet, Link } from 'react-router';
import { SvgDefs } from './SvgDefs';
import { DemoBanner } from './DemoBanner';

const NAV = [
  { to: '/', label: 'Az akta', end: true },
  { to: '/kereses', label: 'Katalógus', end: false },
  { to: '/kimutatas', label: 'Kimutatás', end: false },
  { to: '/modszertan', label: 'Módszertan', end: false },
] as const;

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SvgDefs />
      <a
        href="#tartalom"
        className="sr-only-focusable fixed top-2 left-2 z-50 bg-ink px-3 py-2 font-stamp text-paper uppercase"
      >
        Ugrás a tartalomra
      </a>
      <DemoBanner />
      <header className="border-b border-[var(--desk-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/" className="group flex items-baseline gap-2 no-underline">
            <span className="font-stamp text-xl font-bold tracking-[0.18em] uppercase">Nyitott Akták</span>
            <span className="hidden font-terminal text-xs text-[var(--desk-muted)] sm:inline">ÁLLAMBIZTONSÁGI NYILVÁNTARTÁSOK</span>
          </Link>
          <nav aria-label="Fő navigáció">
            <ul className="flex flex-wrap gap-x-1 gap-y-1 font-stamp text-sm tracking-[0.12em] uppercase">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `inline-block rounded-sm px-2.5 py-1.5 transition-colors ${
                        isActive ? 'bg-ink text-paper dark:bg-paper dark:text-ink' : 'hover:bg-[var(--desk-line)]'
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
      <main id="tartalom" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="mt-12 border-t border-[var(--desk-line)] text-sm text-[var(--desk-muted)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:justify-between">
          <p className="max-w-prose">
            A név szerepelése a nyilvántartásban önmagában nem bizonyítja az együttműködést. Az oldal nem gyűjt
            látogatottsági vagy keresési adatokat.
          </p>
          <p className="flex gap-4">
            <Link className="underline underline-offset-2" to="/modszertan">
              Módszertan és jogi tudnivalók
            </Link>
            <Link className="underline underline-offset-2" to="/styleguide">
              Stílusútmutató
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
