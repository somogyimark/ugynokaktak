import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { formatNumber } from '../lib/format';

interface CounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

/** Number that counts up once (ease-out). Screen readers get the final value only. */
export function Counter({ value, durationMs = 1400, className = '' }: CounterProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, reduced]);

  return (
    <span className={className}>
      <span className="sr-only">{formatNumber(value)}</span>
      <span aria-hidden="true" className="tabular-nums">
        {formatNumber(shown)}
      </span>
    </span>
  );
}
