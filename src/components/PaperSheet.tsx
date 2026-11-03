import type { ElementType, ReactNode } from 'react';

type PaperVariant = 'plain' | 'card' | 'ledger' | 'aged';

const VARIANT: Record<PaperVariant, string> = {
  plain: '',
  card: 'paper-card',
  ledger: 'paper-ledger',
  aged: 'paper-aged',
};

interface PaperSheetProps {
  children?: ReactNode;
  variant?: PaperVariant;
  /** Tilt in degrees for a "dropped on the desk" look. */
  tilt?: number;
  as?: ElementType;
  className?: string;
}

/** A sheet of paper with CSS/SVG-noise texture (no raster image). */
export function PaperSheet({ children, variant = 'plain', tilt = 0, as: Tag = 'div', className = '' }: PaperSheetProps) {
  return (
    <Tag className={`paper ${VARIANT[variant]} rounded-[2px] ${className}`} style={tilt ? { rotate: `${tilt}deg` } : undefined}>
      {children}
    </Tag>
  );
}
