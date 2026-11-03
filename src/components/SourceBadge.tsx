import { SOURCES, type SourceType } from '../data/sources';

const STYLE: Record<SourceType, string> = {
  karton6: 'bg-kraft-light/70 text-ink border-kraft-dark/60',
  bnaplo: 'bg-[#dfe5f6] text-pen border-pen/50',
  hadattar: 'bg-terminal text-phosphor border-phosphor-dim',
};

export function SourceBadge({ source, className = '' }: { source: SourceType; className?: string }) {
  return (
    <span className={`inline-block border px-1.5 py-0.5 font-stamp text-[0.7rem] leading-none font-medium tracking-[0.12em] whitespace-nowrap uppercase ${STYLE[source]} ${className}`}>
      {SOURCES[source].shortLabel}
    </span>
  );
}
