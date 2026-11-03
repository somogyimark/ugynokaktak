import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '../lib/format';

const DIGITS = '0123456789';

/**
 * Mechanical counter: each digit is a drum that rolls into place when the counter scrolls
 * into view (CSS transitions; instant with reduced motion). Screen readers get the value only.
 */
export function Odometer({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [rolled, setRolled] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRolled(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRolled(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const text = formatNumber(value);
  let digitIndex = 0;
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex tabular-nums select-none">
        {Array.from(text, (ch, i) => {
          const d = DIGITS.indexOf(ch);
          if (d < 0) return <span key={i}>{/\s/.test(ch) ?' ' : ch}</span>;
          const order = digitIndex++;
          return (
            <span key={i} className="relative inline-block h-[1.15em] overflow-hidden leading-[1.15em]">
              <span
                className="flex flex-col transition-transform duration-[1600ms] ease-[cubic-bezier(.2,.75,.25,1)]"
                style={{ transform: `translateY(-${rolled ? d * 10 : 0}%)`, transitionDelay: `${order * 90}ms` }}
              >
                {Array.from(DIGITS, (n) => (
                  <span key={n} className="block h-[1.15em]">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
