import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type KeyboardEvent, type Ref } from 'react';
import { Link } from 'react-router';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { CatalogRow } from '../../data/schema';
import { SourceBadge } from '../../components/SourceBadge';

interface ResultListProps {
  rows: readonly CatalogRow[];
  indices: Uint32Array;
  /** Called when the user presses ArrowUp on the first item (to return to the search box). */
  onExitTop?: () => void;
  /** Search string forwarded to the record page for the "back to results" link. */
  backSearch: string;
}

export interface ResultListHandle {
  focusFirst: () => void;
}

const ESTIMATED_ROW = 104;

/** Library index card (cédula) for one catalog row. */
function CatalogCard({ row, backSearch, active, onFocus, index }: { row: CatalogRow; backSearch: string; active: boolean; onFocus: () => void; index: number }) {
  const [id, source, name, coverName, birthYear, birthPlace, , recruitYear, registry] = row;
  const details = [
    birthYear || birthPlace ? `szül. ${[birthYear, birthPlace].filter(Boolean).join(', ')}` : null,
    recruitYear ? `beszervezés: ${recruitYear}` : null,
  ].filter(Boolean);
  return (
    <Link
      to={`/akta/${id}`}
      state={{ backSearch }}
      viewTransition
      tabIndex={active ? 0 : -1}
      onFocus={onFocus}
      className="card-in group relative block rounded-[2px] border border-paper-edge bg-paper-light px-4 pt-3 pb-5 text-ink shadow-[0_1px_0_rgba(0,0,0,0.08),0_3px_8px_-4px_rgba(40,25,5,0.35)] transition-[translate,rotate,box-shadow] hover:-translate-y-1 hover:rotate-[-0.35deg] hover:shadow-[0_2px_0_rgba(0,0,0,0.08),0_10px_18px_-8px_rgba(40,25,5,0.45)] focus-visible:-translate-y-1"
      style={{
        // Cards pulled out of the drawer one after another; later (scrolled-in) cards appear at once.
        animationDelay: `${Math.min(index, 10) * 35}ms`,
        backgroundImage:
          'linear-gradient(180deg, transparent 2.15rem, rgb(179 38 30 / 0.45) 2.15rem, rgb(179 38 30 / 0.45) calc(2.15rem + 1px), transparent calc(2.15rem + 1px))',
      }}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="ink-typed block truncate text-lg leading-6">{name}</span>
        </span>
        <SourceBadge source={source} className="mt-0.5 shrink-0" />
      </span>
      <span className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-ink-soft">
        {coverName && (
          <span>
            fedőnév: <span className="ink-typed">„{coverName}”</span>
          </span>
        )}
        {details.map((d) => (
          <span key={d}>{d}</span>
        ))}
        {registry && <span className="font-terminal text-xs leading-5 text-pen">{registry}</span>}
      </span>
      {/* Punched rod hole at the bottom of catalog cards. */}
      <span aria-hidden="true" className="absolute bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--desk)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]" />
    </Link>
  );
}

/**
 * Virtualised result list using the window as scroller. Roving tabindex: Tab enters the list
 * once; arrow keys, Home/End and PageUp/PageDown move between cards; Enter opens a record.
 */
export function ResultList({ rows, indices, onExitTop, backSearch, ref }: ResultListProps & { ref?: Ref<ResultListHandle> }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [margin, setMargin] = useState(0);
  const focusAfterRender = useRef<number | null>(null);

  // Keep the scroll margin in sync with whatever is above the list (filters may expand/collapse).
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const top = Math.round(el.getBoundingClientRect().top + window.scrollY);
    if (top !== margin) setMargin(top);
  });

  useEffect(() => {
    setActive(0);
  }, [indices]);

  const virtualizer = useWindowVirtualizer({
    count: indices.length,
    estimateSize: () => ESTIMATED_ROW,
    overscan: 6,
    scrollMargin: margin,
    scrollPaddingStart: 72,
    scrollPaddingEnd: 24,
    gap: 10,
  });

  const tryFocus = (i: number): boolean => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${i}"] a`);
    if (!el) return false;
    el.focus({ preventScroll: true });
    return true;
  };

  const focusIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(indices.length - 1, i));
      setActive(clamped);
      virtualizer.scrollToIndex(clamped, { align: 'auto' });
      // Focus now if the card is already rendered, otherwise right after the virtualiser renders it.
      if (!tryFocus(clamped)) focusAfterRender.current = clamped;
    },
    [indices.length, virtualizer],
  );

  useImperativeHandle(ref, () => ({ focusFirst: () => focusIndex(0) }), [focusIndex]);

  // Focus the target card once it has been rendered by the virtualiser.
  const items = virtualizer.getVirtualItems();
  useEffect(() => {
    const target = focusAfterRender.current;
    if (target !== null && tryFocus(target)) focusAfterRender.current = null;
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const page = Math.max(1, Math.floor(window.innerHeight / ESTIMATED_ROW) - 1);
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowUp: active - 1,
      PageDown: active + page,
      PageUp: active - page,
      Home: 0,
      End: indices.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && active === 0) {
      onExitTop?.();
      return;
    }
    focusIndex(moves[e.key]!);
  };

  return (
    <div ref={listRef} onKeyDown={onKeyDown}>
      <ul aria-label="Találatok" className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {items.map((item) => {
          const row = rows[indices[item.index]!]!;
          return (
            <li
              key={row[0]}
              data-index={item.index}
              ref={virtualizer.measureElement}
              aria-setsize={indices.length}
              aria-posinset={item.index + 1}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)` }}
            >
              <CatalogCard row={row} index={item.index} backSearch={backSearch} active={item.index === active} onFocus={() => setActive(item.index)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
