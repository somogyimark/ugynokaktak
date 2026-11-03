interface RegistryNumberProps {
  value: string;
  label?: string;
  color?: 'red' | 'blue' | 'black';
  className?: string;
}

const COLOR = { red: 'text-stamp', blue: 'text-pen', black: 'text-ink' } as const;

/** Numbering-machine style registry / filing number ("iktatószám"). */
export function RegistryNumber({ value, label = 'Ikt. sz.', color = 'blue', className = '' }: RegistryNumberProps) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${COLOR[color]} ${className}`}>
      <span className="font-stamp text-[0.7em] tracking-[0.15em] uppercase opacity-80">{label}</span>
      <span className="font-terminal font-semibold tracking-[0.18em] tabular-nums [text-shadow:0_0_1px_currentColor]">{value}</span>
    </span>
  );
}
