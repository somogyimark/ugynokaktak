import { seededRandom } from '../lib/random';

interface RedactionProps {
  /** Approximate width in characters. If omitted, derived from `seed`. */
  chars?: number;
  /** Text for the tooltip and screen readers. Nothing else is ever revealed. */
  reason?: string;
  /** Seed for a stable pseudo-random width. */
  seed?: string;
  className?: string;
}

export const MISSING_LABEL = 'ADAT NEM ÁLL RENDELKEZÉSRE';

/**
 * Black redaction bar. It never wraps real content, so there is nothing to reveal on hover;
 * hovering only shows why the field is blank.
 */
export function Redaction({ chars, reason = MISSING_LABEL, seed = 'x', className = '' }: RedactionProps) {
  const width = chars ?? 6 + Math.floor(seededRandom(seed)() * 10);
  return (
    <span className={`tooltip-host ${className}`} data-redaction="">
      <span className="redaction" style={{ width: `${width}ch` }} aria-hidden="true" />
      <span className="sr-only">{reason}</span>
      <span className="tooltip" aria-hidden="true">
        {reason}
      </span>
    </span>
  );
}
