import type { ReactNode } from 'react';

interface TapeLabelProps {
  children: ReactNode;
  rotate?: number;
  className?: string;
}

/** Masking-tape label with handwritten-looking marker text. */
export function TapeLabel({ children, rotate = -2, className = '' }: TapeLabelProps) {
  return (
    <span
      className={`tape inline-block px-4 py-1 font-stamp text-sm font-medium tracking-wider text-ink uppercase ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  );
}
