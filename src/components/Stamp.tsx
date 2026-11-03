import type { ReactNode } from 'react';
import { sound } from '../lib/sound';

type StampColor = 'red' | 'blue' | 'black';
type StampShape = 'rect' | 'round';

const COLOR: Record<StampColor, string> = {
  red: 'text-stamp',
  blue: 'text-pen',
  black: 'text-ink',
};

interface StampProps {
  children: ReactNode;
  color?: StampColor;
  shape?: StampShape;
  /** Rotation in degrees; stamps are never quite straight. */
  rotate?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Animate the stamp hitting the paper, after this many milliseconds (CSS; instant with reduced motion). */
  slam?: number;
  className?: string;
}

const SIZE: Record<NonNullable<StampProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-base px-3 py-1',
  lg: 'text-2xl px-4 py-1.5',
  xl: 'text-3xl sm:text-5xl px-5 py-2',
};

/** Rubber stamp imprint. Real text, slightly rotated, with worn edges. */
export function Stamp({ children, color = 'red', shape = 'rect', rotate = -6, size = 'md', slam, className = '' }: StampProps) {
  const shapeClass =
    shape === 'round'
      ? 'rounded-full aspect-square grid place-items-center text-center leading-tight outline-2 outline-current outline-offset-[3px]'
      : 'rounded-[3px]';
  const imprint = (
    <span
      className={`stamp-ink inline-block font-bold opacity-90 select-none ${COLOR[color]} ${SIZE[size]} ${shapeClass} ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  );
  if (slam === undefined) return imprint;
  // The animation runs on a wrapper: an animated transform on the imprint itself breaks its
  // SVG filter + blend mode in Chrome. The wrapper releases its transform when done.
  return (
    <span
      className="stamp-slam inline-block"
      style={{ animationDelay: `${slam}ms` }}
      onAnimationEnd={(e) => e.animationName === 'stamp-slam' && sound.stamp()}
    >
      {imprint}
    </span>
  );
}
