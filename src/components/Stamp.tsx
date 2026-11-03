import type { ReactNode } from 'react';

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
  className?: string;
}

const SIZE: Record<NonNullable<StampProps['size']>, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-base px-3 py-1',
  lg: 'text-2xl px-4 py-1.5',
  xl: 'text-3xl sm:text-5xl px-5 py-2',
};

/** Rubber stamp imprint. Real text, slightly rotated, with worn edges. */
export function Stamp({ children, color = 'red', shape = 'rect', rotate = -6, size = 'md', className = '' }: StampProps) {
  const shapeClass =
    shape === 'round'
      ? 'rounded-full aspect-square grid place-items-center text-center leading-tight outline-2 outline-current outline-offset-[3px]'
      : 'rounded-[3px]';
  return (
    <span
      className={`stamp-ink inline-block font-bold opacity-90 select-none ${COLOR[color]} ${SIZE[size]} ${shapeClass} ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  );
}
