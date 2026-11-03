import { useEffect, useMemo, useState, type ElementType } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { seededRandom } from '../lib/random';
import { sound } from '../lib/sound';

interface TypewriterTextProps {
  text: string;
  /** Type the text out character by character (skipped when reduced motion is requested). */
  animate?: boolean;
  /** Milliseconds per character when animating. */
  speed?: number;
  /** Delay before typing starts, in ms. */
  delay?: number;
  /** Uneven baseline and ink density, like a worn typewriter ribbon. */
  jitter?: boolean;
  /** Show a blinking block cursor while (and after) typing. */
  cursor?: boolean;
  onDone?: () => void;
  as?: ElementType;
  className?: string;
}

/**
 * Typewriter-style text. Screen readers always get the full text at once;
 * the visual characters are decorative and hidden from assistive tech.
 */
export function TypewriterText({
  text,
  animate = false,
  speed = 28,
  delay = 0,
  jitter = false,
  cursor = false,
  onDone,
  as: Tag = 'span',
  className = '',
}: TypewriterTextProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = animate && !reduced;
  const [shown, setShown] = useState(shouldAnimate ? 0 : text.length);

  useEffect(() => {
    if (!shouldAnimate) {
      setShown(text.length);
      onDone?.();
      return;
    }
    setShown(0);
    let raf = 0;
    let start = 0;
    let last = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - delay;
      const count = elapsed <= 0 ? 0 : Math.min(text.length, Math.floor(elapsed / speed) + 1);
      if (count > last && text[count - 1] !== ' ') sound.click();
      last = count;
      setShown(count);
      if (count < text.length) raf = requestAnimationFrame(tick);
      else onDone?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // onDone intentionally excluded: callers often pass inline closures.
  }, [text, shouldAnimate, speed, delay]);

  const offsets = useMemo(() => {
    if (!jitter) return null;
    const rnd = seededRandom(text);
    return Array.from(text, () => ({ y: (rnd() - 0.5) * 0.12, o: 0.72 + rnd() * 0.28 }));
  }, [text, jitter]);

  const visible = text.slice(0, shown);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {offsets
          ? Array.from(visible, (ch, i) =>
              ch === ' ' ? (
                ' '
              ) : (
                <span key={i} style={{ position: 'relative', top: `${offsets[i]!.y}em`, opacity: offsets[i]!.o }}>
                  {ch}
                </span>
              ),
            )
          : visible}
        {cursor && <span className="ml-px inline-block w-[0.6em] animate-blink bg-current align-[-0.1em]" style={{ height: '1em' }} />}
      </span>
    </Tag>
  );
}
