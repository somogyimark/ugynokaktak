import type { ReactNode } from 'react';
import { PageMeta } from '../components/PageMeta';
import { PaperSheet } from '../components/PaperSheet';
import { Stamp } from '../components/Stamp';
import { RegistryNumber } from '../components/RegistryNumber';
import { Loading } from '../components/Loading';
import { loadStats } from '../data/client';
import { COUNTIES, COUNTY_BY_CODE } from '../data/geo';
import type { Stats as StatsData } from '../data/schema';
import { SOURCE_TYPES, SOURCES } from '../data/sources';
import { useAsync } from '../hooks/useAsync';
import { formatDate, formatNumber } from '../lib/format';
import { FIELD_LABELS } from './record/fields';
import { BarList, CountyTileMap, TableView, YearMultiples } from './stats/charts';
import { OPTIONAL_FIELDS } from '../data/model';

function ReportSection({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`resz-${n}`} className="border-t border-ink/30 pt-5">
      <h2 id={`resz-${n}`} className="mb-4 font-stamp text-lg font-bold tracking-[0.15em] uppercase">
        <span className="mr-2 font-terminal text-base font-normal">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '–');

function Report({ stats }: { stats: StatsData }) {
  const years = SOURCE_TYPES.flatMap((s) => Object.keys(stats.recruitmentsByYear[s]).map(Number));
  const from = years.length ? Math.min(...years) : 1950;
  const to = years.length ? Math.max(...years) : 1990;
  const decades = Object.keys(stats.birthDecades).sort();
  const located = stats.totalRecords - stats.unknownCounty;
  const date = formatDate(stats.generatedAt.slice(0, 10));

  return (
    <PaperSheet variant="aged" className="relative space-y-8 px-5 py-6 sm:px-10 sm:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-stamp text-xs tracking-[0.25em] text-ink-soft uppercase">Belső jelentés · {date}</p>
          <h1 className="mt-1 font-stamp text-3xl font-bold tracking-[0.15em] uppercase sm:text-4xl">Kimutatás</h1>
          <p className="mt-1 max-w-prose">
            <span className="font-bold">Tárgy:</span> a nyilvánossá tett nyilvántartások bejegyzéseinek összesítése. Csak
            összesített adatok; egyes személyekről a kimutatás nem tartalmaz információt.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="font-stamp text-sm tracking-[0.15em] text-ink-soft uppercase line-through decoration-2">Szigorúan titkos</span>
          <Stamp rotate={-6}>Nyilvános</Stamp>
          <RegistryNumber value={`KIM-${stats.generatedAt.slice(0, 4)}/${String(stats.totalRecords).padStart(5, '0')}`} />
        </div>
      </header>

      <ReportSection n="1" title="Bejegyzések irattípusonként">
        <BarList
          label="Bejegyzések irattípusonként"
          items={[
            ...SOURCE_TYPES.map((s) => ({ key: s, label: SOURCES[s].label, value: stats.counts[s] })),
            { key: 'total', label: <strong>Összesen</strong>, value: stats.totalRecords },
          ]}
        />
        <p className="mt-3 text-sm text-ink-soft">
          Azonos név több irattípusban: {formatNumber(stats.crossSourceNames)} esetben. A névegyezés nem jelent
          személyazonosságot, ezért a bejegyzéseket nem vonjuk össze.
        </p>
      </ReportSection>

      <ReportSection n="2" title="Beszervezések évenként">
        <YearMultiples
          from={from}
          to={to}
          series={SOURCE_TYPES.map((s) => ({ key: s, label: SOURCES[s].label, counts: stats.recruitmentsByYear[s] }))}
        />
        <p className="mt-2 text-xs text-ink-soft">
          Csak azok a bejegyzések, amelyeknél a beszervezés éve ismert. A sávok azonos skálán összevethetők.
        </p>
        <TableView
          caption="Beszervezések évenként és irattípusonként"
          head={['Év', ...SOURCE_TYPES.map((s) => SOURCES[s].label)]}
          rows={Array.from({ length: to - from + 1 }, (_, i) => from + i).map((y) => [
            String(y),
            ...SOURCE_TYPES.map((s) => stats.recruitmentsByYear[s][y] ?? 0),
          ])}
        />
      </ReportSection>

      <ReportSection n="3" title="Születési hely megyénként">
        <CountyTileMap counts={stats.byCounty} />
        <p className="mt-2 text-xs text-ink-soft">
          Sematikus csempetérkép (a megyék hozzávetőleges elhelyezkedése, nem pontos határok). Azonosítható születési
          hely: {formatNumber(located)} bejegyzés ({pct(located, stats.totalRecords)}); ismeretlen, külföldi vagy nem
          azonosítható: {formatNumber(stats.unknownCounty)}.
        </p>
        <TableView
          caption="Születési hely megyénként"
          head={['Megye', 'Bejegyzés']}
          rows={[...COUNTIES]
            .sort((a, b) => (stats.byCounty[b.code] ?? 0) - (stats.byCounty[a.code] ?? 0))
            .map((c) => [COUNTY_BY_CODE.get(c.code)!.name, stats.byCounty[c.code] ?? 0])}
        />
      </ReportSection>

      <ReportSection n="4" title="Születési évtizedek">
        <BarList label="Bejegyzések születési évtized szerint" items={decades.map((d) => ({ key: d, label: `${d}-as évek`, value: stats.birthDecades[d] ?? 0 }))} />
      </ReportSection>

      <ReportSection n="5" title="Adatkitöltöttség">
        <p className="mb-3 max-w-prose text-sm">
          A források nem minden mezőt tartalmaznak. A táblázat megmutatja, a bejegyzések hány százalékánál ismert az
          adott adat – ez az adatok korlátaira is figyelmeztet.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="sr-only">Mezők kitöltöttsége irattípusonként</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b border-ink/40 py-1 pr-2 text-left font-stamp text-xs tracking-[0.15em] uppercase">
                  Mező
                </th>
                {SOURCE_TYPES.map((s) => (
                  <th key={s} scope="col" className="border-b border-ink/40 px-2 py-1 text-right font-stamp text-xs tracking-[0.15em] uppercase">
                    {SOURCES[s].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OPTIONAL_FIELDS.map((f) => (
                <tr key={f} className="odd:bg-ink/5">
                  <th scope="row" className="py-1 pr-2 text-left font-normal">
                    {FIELD_LABELS[f]}
                  </th>
                  {SOURCE_TYPES.map((s) => (
                    <td key={s} className="px-2 py-1 text-right font-terminal tabular-nums">
                      {pct(stats.fieldCoverage[s][f] ?? 0, stats.counts[s])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      <footer className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/30 pt-4 text-xs text-ink-soft">
        <p>Készült a nyilvános adatállományból, automatikusan. Az adatok állapota: {date}</p>
        <Stamp shape="round" color="blue" size="sm" rotate={12} className="w-24">
          Nyitott
          <br />
          Akták
        </Stamp>
      </footer>
    </PaperSheet>
  );
}

export default function Stats() {
  const stats = useAsync(loadStats, []);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageMeta
        title="Kimutatás"
        indexable
        description="Összesített kimutatás a nyilvános állambiztonsági nyilvántartások bejegyzéseiről: irattípusonként, évenként, megyénként."
      />
      {stats.status === 'loading' && <Loading label="Kimutatás összeállítása…" />}
      {stats.status === 'error' && <p className="text-stamp">A kimutatás nem tölthető be: {stats.error.message}</p>}
      {stats.status === 'ready' && <Report stats={stats.value} />}
    </div>
  );
}
