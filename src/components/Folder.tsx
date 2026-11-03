import type { ReactNode } from 'react';

interface FolderProps {
  /** Contents of the front cover (stamps, labels, registry number). */
  cover: ReactNode;
  /** Contents revealed when the folder is open. */
  children?: ReactNode;
  /** Text on the folder tab. */
  tab?: string;
  /** When true the cover swings open (3D), revealing `children`. */
  open?: boolean;
  className?: string;
}

/**
 * Kraft cardboard file folder. Closed, only the cover is shown; open, the cover
 * rotates away around its left edge. The animation is disabled for reduced motion via global CSS.
 */
export function Folder({ cover, children, tab, open = false, className = '' }: FolderProps) {
  return (
    <div className={`relative [perspective:1800px] ${className}`}>
      {tab && (
        <div className="kraft absolute -top-6 left-6 h-8 w-40 rounded-t-md px-3 pt-1 font-stamp text-xs font-medium tracking-[0.2em] text-ink/80 uppercase shadow-[0_-1px_2px_rgba(0,0,0,0.15)] sm:w-52">
          {tab}
        </div>
      )}
      {/* Back board + inside */}
      <div className="kraft relative min-h-[18rem] rounded-md rounded-tl-none p-3 shadow-[0_14px_30px_-10px_rgba(30,15,0,0.55)] sm:p-5">
        <div
          className={`transition-opacity duration-500 ${open ? 'opacity-100 delay-300' : 'pointer-events-none opacity-0'}`}
          aria-hidden={!open}
          inert={!open}
        >
          {children}
        </div>
      </div>
      {/* Front cover */}
      <div
        className={`kraft absolute inset-0 origin-left rounded-md rounded-tl-none border-l-[6px] border-kraft-dark/40 shadow-[inset_0_0_0_1px_rgba(60,35,10,0.25),0_10px_24px_-10px_rgba(30,15,0,0.6)] transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.6,.05,.3,1)] [backface-visibility:hidden] [transform-style:preserve-3d] ${
          open ? '[transform:rotateY(-165deg)] opacity-0 pointer-events-none' : '[transform:rotateY(0deg)]'
        }`}
        aria-hidden={open}
        inert={open}
      >
        {cover}
      </div>
    </div>
  );
}
