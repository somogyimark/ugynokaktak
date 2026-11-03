import { PaperClip } from '../../components/PaperClip';

/*
 * Decorative objects lying around the folder on the desk (wide screens only). Pure SVG/CSS,
 * no text content except fictional, generic labels. `data-depth` drives the pointer parallax.
 */

function FountainPen() {
  return (
    <svg viewBox="0 0 40 300" className="h-72 w-10 drop-shadow-[6px_10px_6px_rgba(0,0,0,0.55)]">
      <defs>
        <linearGradient id="pen-body" x1="0" x2="1">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.35" stopColor="#3a3a3a" />
          <stop offset="0.55" stopColor="#111" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id="pen-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#7a5a1c" />
          <stop offset="0.45" stopColor="#f0d28a" />
          <stop offset="1" stopColor="#8a6a2a" />
        </linearGradient>
      </defs>
      <rect x="11" y="6" width="18" height="110" rx="9" fill="url(#pen-body)" />
      <rect x="27" y="14" width="4" height="70" rx="2" fill="url(#pen-gold)" />
      <rect x="11" y="112" width="18" height="6" fill="url(#pen-gold)" />
      <path d="M12 118 h16 l-2 120 q-6 10 -12 0 z" fill="url(#pen-body)" />
      <path d="M14 238 q6 10 12 0 l-6 54 z" fill="url(#pen-gold)" />
      <line x1="20" y1="252" x2="20" y2="288" stroke="#4a3610" strokeWidth="0.8" />
    </svg>
  );
}

function StampAndPad() {
  return (
    <svg viewBox="0 0 200 170" className="h-40 w-48 drop-shadow-[6px_10px_8px_rgba(0,0,0,0.55)]">
      <defs>
        <linearGradient id="tin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b8f94" />
          <stop offset="0.5" stopColor="#d2d5d8" />
          <stop offset="1" stopColor="#6c7075" />
        </linearGradient>
        <radialGradient id="pad-ink" cx="0.4" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#7d1712" />
          <stop offset="1" stopColor="#3c0907" />
        </radialGradient>
        <radialGradient id="wood-knob" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#c48a52" />
          <stop offset="1" stopColor="#5e3816" />
        </radialGradient>
      </defs>
      {/* ink pad tin, lid open */}
      <rect x="6" y="70" width="130" height="86" rx="8" fill="url(#tin)" />
      <rect x="16" y="80" width="110" height="66" rx="4" fill="url(#pad-ink)" />
      {/* rubber stamp seen from above: block + turned knob */}
      <rect x="112" y="18" width="80" height="54" rx="4" fill="#6e4523" transform="rotate(14 152 45)" />
      <rect x="118" y="24" width="68" height="42" rx="3" fill="#8a5a30" transform="rotate(14 152 45)" />
      <circle cx="152" cy="45" r="19" fill="url(#wood-knob)" />
      <circle cx="152" cy="45" r="7" fill="#3e2410" opacity="0.5" />
    </svg>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 0 22 220" className="h-52 w-5 drop-shadow-[5px_8px_5px_rgba(0,0,0,0.5)]">
      <rect x="3" y="0" width="16" height="16" fill="#b7b0a2" />
      <rect x="3" y="16" width="16" height="160" fill="#2f4f3a" />
      <rect x="9" y="16" width="4" height="160" fill="#3d6249" />
      <path d="M3 176 h16 l-8 36 z" fill="#d9b98c" />
      <path d="M8 200 h6 l-3 12 z" fill="#222" />
    </svg>
  );
}

export function DeskProps() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden select-none lg:block">
      {/* coffee ring left on the desk */}
      <span data-depth="0.4" className="absolute top-[58%] left-[3%] block h-32 w-32 rounded-full shadow-[inset_0_0_0_5px_rgba(70,40,15,0.35),inset_0_0_18px_6px_rgba(70,40,15,0.18)]" />
      <span data-depth="1.2" className="absolute top-[8%] left-[1%] block -rotate-[24deg]">
        <FountainPen />
      </span>
      <span data-depth="0.9" className="absolute top-[62%] right-[0%] block">
        <StampAndPad />
      </span>
      <span data-depth="1.4" className="absolute top-[10%] right-[4%] block rotate-[32deg]">
        <Pencil />
      </span>
      <span data-depth="0.7" className="absolute top-[38%] right-[7%] block">
        <PaperClip className="h-14 w-6" rotate={64} />
      </span>
      <span data-depth="0.7" className="absolute top-[44%] right-[2%] block">
        <PaperClip className="h-12 w-5" rotate={-18} />
      </span>
      {/* a note slipped half under the folder */}
      <span data-depth="0.5" className="paper absolute bottom-[9%] left-[9%] block w-44 rotate-[-9deg] rounded-[2px] px-3 pt-2 pb-4">
        <span className="block font-stamp text-[0.6rem] tracking-[0.25em] text-stamp uppercase">Feljegyzés</span>
        <span className="mt-1 block h-px bg-pen/40" />
        <span className="mt-3 block h-px bg-pen/40" />
        <span className="mt-3 block h-px w-2/3 bg-pen/40" />
      </span>
    </div>
  );
}
