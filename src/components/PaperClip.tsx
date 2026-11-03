interface PaperClipProps {
  className?: string;
  rotate?: number;
}

/** Decorative metal paper clip, drawn as SVG. */
export function PaperClip({ className = '', rotate = 0 }: PaperClipProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 40 110"
      className={`pointer-events-none drop-shadow-[1px_2px_1px_rgba(0,0,0,0.35)] ${className}`}
      style={{ rotate: `${rotate}deg` }}
    >
      <defs>
        <linearGradient id="clip-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#7d8288" />
          <stop offset="0.45" stopColor="#e3e6ea" />
          <stop offset="1" stopColor="#8b9096" />
        </linearGradient>
      </defs>
      <path
        d="M12 30 V88 a8 8 0 0 0 16 0 V18 a12 12 0 0 0 -24 0 V92 a16 16 0 0 0 32 0 V34"
        fill="none"
        stroke="url(#clip-metal)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
