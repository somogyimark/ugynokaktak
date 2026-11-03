import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const INTRO_KEY = 'nya-lamp-on';

/** A live lamp needs a mouse-like pointer; users asking for more contrast get the static light. */
function canTrack(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: fine)').matches && !window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Reading-room lighting. Behind the content: a warm pool of light on the wooden desk. With a
 * fine pointer the lamp follows the cursor, the rest of the room falls into shadow (capped, so
 * text keeps AA contrast), and dust drifts through the beam. A film grain sits on top.
 * Pointer position is shared through the --lx/--ly custom properties on <html>.
 */
export function DeskLamp() {
  const reduced = useReducedMotion();
  const [live] = useState(canTrack);
  const [intro] = useState(() => {
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return false;
      sessionStorage.setItem(INTRO_KEY, '1');
      return true;
    } catch {
      return false;
    }
  });
  const dust = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!live) return;
    const root = document.documentElement;
    const pos = { x: innerWidth / 2, y: innerHeight * 0.3 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--lx', `${pos.x}px`);
        root.style.setProperty('--ly', `${pos.y}px`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const stopDust = reduced || !dust.current ? undefined : runDust(dust.current, pos);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      stopDust?.();
    };
  }, [live, reduced]);

  return (
    <>
      <div aria-hidden="true" className={`desk-lamp ${live ? 'desk-lamp-live' : ''} ${intro ? 'lamp-intro' : ''}`} />
      {live && (
        <>
          <div aria-hidden="true" className="lamp-shade" />
          <div aria-hidden="true" className={`lamp-glow ${intro ? 'lamp-intro' : ''}`} />
          {!reduced && <canvas ref={dust} aria-hidden="true" className="lamp-dust" />}
        </>
      )}
      <div aria-hidden="true" className="film-grain" />
    </>
  );
}

/** Dust motes: slow random drift, only visible inside the lamp's beam. Pauses in background tabs. */
function runDust(canvas: HTMLCanvasElement, lamp: { x: number; y: number }): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  // ponytail: fixed 60 motes, CPU canvas; enough for a subtle effect, WebGL only if it ever needs thousands.
  const motes = Array.from({ length: 60 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: 0.4 + Math.random() * 1.4,
    vx: (Math.random() - 0.5) * 0.12,
    vy: -0.03 - Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
  }));
  const beam = 420;
  let raf = 0;
  const tick = (t: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const m of motes) {
      m.x += m.vx + Math.sin(t / 2400 + m.phase) * 0.08;
      m.y += m.vy;
      if (m.y < -5) m.y = canvas.height + 5;
      if (m.x < -5) m.x = canvas.width + 5;
      if (m.x > canvas.width + 5) m.x = -5;
      const d = Math.hypot(m.x - lamp.x, m.y - lamp.y);
      if (d > beam) continue;
      const a = (1 - d / beam) ** 2 * (0.45 + 0.35 * Math.sin(t / 700 + m.phase));
      ctx.fillStyle = `rgba(255, 228, 180, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
  };
}
