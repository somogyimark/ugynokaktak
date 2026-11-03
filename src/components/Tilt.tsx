import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface TiltProps {
  children: ReactNode;
  /** Maximum tilt in degrees. */
  max?: number;
  className?: string;
}

const finePointer = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches;

/**
 * Vanilla-Tilt style 3D tilt with a glare that follows a fine pointer, as if the sheet were
 * picked up under the desk lamp. Off for touch and reduced motion. Only CSS variables change.
 */
export function Tilt({ children, max = 5, className = '' }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = !reduced && finePointer();

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(x - 0.5) * 2 * max}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 2 * max}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
    el.style.setProperty('--glare', '1');
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    for (const p of ['--rx', '--ry']) el.style.setProperty(p, '0deg');
    el.style.setProperty('--glare', '0');
  };

  return (
    <div
      ref={ref}
      className={`${active ? 'tilt' : ''} relative ${className}`}
      onPointerMove={active ? move : undefined}
      onPointerLeave={active ? leave : undefined}
    >
      {children}
      {active && <span aria-hidden="true" className="tilt-glare" />}
    </div>
  );
}
