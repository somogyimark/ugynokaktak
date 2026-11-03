import { useEffect, useId, useState, type ReactNode } from 'react';
import { COUNTIES } from '../../data/geo';
import { SOURCE_TYPES, SOURCES, type SourceType } from '../../data/sources';
import type { SearchQuery } from '../../search/engine';
import { hasFilters } from '../../search/urlState';

interface FilterPanelProps {
  query: SearchQuery;
  onChange: (next: SearchQuery) => void;
}

/** Year input that only commits complete 4-digit years (or empty). */
function YearInput({ label, value, onCommit }: { label: string; value?: number; onCommit: (v?: number) => void }) {
  const id = useId();
  const [text, setText] = useState(value ? String(value) : '');
  useEffect(() => setText(value ? String(value) : ''), [value]);
  return (
    <span className="flex flex-col">
      <label htmlFor={id} className="text-xs text-ink-faded">
        {label}
      </label>
      <input
        id={id}
        inputMode="numeric"
        pattern="[0-9]{4}"
        maxLength={4}
        placeholder="éééé"
        value={text}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, '');
          setText(v);
          if (v === '') onCommit(undefined);
          else if (v.length === 4) onCommit(Number(v));
        }}
        className="ink-typed w-20 border-0 border-b-2 border-dashed border-ink/40 bg-transparent px-1 text-lg placeholder:text-ink-faded focus:border-solid focus:border-pen focus:outline-none"
      />
    </span>
  );
}

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-dashed border-ink/30 pt-3">
      <legend className="pr-2 font-stamp text-xs tracking-[0.2em] text-ink-soft uppercase">{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Filter "drawer" of the card catalog. */
export function FilterPanel({ query, onChange }: FilterPanelProps) {
  const countyId = useId();
  const selected = new Set<SourceType>(query.sources ?? []);
  const toggleSource = (s: SourceType) => {
    const next = new Set(selected);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ ...query, sources: SOURCE_TYPES.filter((t) => next.has(t)) });
  };

  return (
    <div className="paper space-y-4 rounded-[2px] p-4">
      <Fieldset legend="Irattípus">
        <ul className="space-y-1.5">
          {SOURCE_TYPES.map((s) => (
            <li key={s}>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={selected.has(s)} onChange={() => toggleSource(s)} className="h-4 w-4 accent-stamp" />
                <span>{SOURCES[s].label}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-ink-faded">Ha egyik sincs bejelölve, mindegyikben keres.</p>
      </Fieldset>

      <Fieldset legend="Születési év">
        <div className="flex items-end gap-3">
          <YearInput label="ettől" value={query.birthFrom} onCommit={(v) => onChange({ ...query, birthFrom: v })} />
          <span aria-hidden="true" className="pb-1">
            –
          </span>
          <YearInput label="eddig" value={query.birthTo} onCommit={(v) => onChange({ ...query, birthTo: v })} />
        </div>
      </Fieldset>

      <Fieldset legend="Beszervezés éve">
        <div className="flex items-end gap-3">
          <YearInput label="ettől" value={query.recruitFrom} onCommit={(v) => onChange({ ...query, recruitFrom: v })} />
          <span aria-hidden="true" className="pb-1">
            –
          </span>
          <YearInput label="eddig" value={query.recruitTo} onCommit={(v) => onChange({ ...query, recruitTo: v })} />
        </div>
      </Fieldset>

      <Fieldset legend="Születési hely (megye)">
        <label htmlFor={countyId} className="sr-only">
          Megye
        </label>
        <select
          id={countyId}
          value={query.county ?? ''}
          onChange={(e) => onChange({ ...query, county: e.target.value || undefined })}
          className="w-full border border-ink/30 bg-paper-light px-2 py-1.5"
        >
          <option value="">Bármely</option>
          {[...COUNTIES]
            .sort((a, b) => a.name.localeCompare(b.name, 'hu'))
            .map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
        </select>
        <p className="mt-1 text-xs text-ink-faded">Csak ahol a születési hely ismert és azonosítható.</p>
      </Fieldset>

      {hasFilters(query) && (
        <button
          type="button"
          onClick={() => onChange({ q: query.q })}
          className="w-full border-2 border-stamp px-3 py-1.5 font-stamp text-sm tracking-[0.15em] text-stamp-dark uppercase hover:bg-stamp hover:text-white"
        >
          Szűrők törlése
        </button>
      )}
    </div>
  );
}
