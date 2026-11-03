import { useEffect, type DependencyList, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

type Gsap = typeof import('gsap').gsap;
type ScrollTriggerType = typeof import('gsap/ScrollTrigger').ScrollTrigger;

let loading: Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerType }> | null = null;

/** GSAP + ScrollTrigger in a separate chunk, loaded once on first use (keeps it off the critical path). */
export function loadGsap() {
  loading ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  });
  return loading;
}

/** Elements whose top is below the viewport: safe to hide for a reveal without a visible flash. */
export function belowFold(els: Element[]): Element[] {
  return els.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
}

/**
 * Runs GSAP setup scoped to `scope` (selectors resolve inside it) and reverts everything on
 * cleanup (setup may return its own cleanup too). Never runs with reduced motion: the static page is the fallback, so content must
 * be fully visible without this.
 */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  setup: (gsap: Gsap, ScrollTrigger: ScrollTriggerType) => void | (() => void),
  deps: DependencyList = [],
) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !scope.current) return;
    let alive = true;
    let revert: (() => void) | undefined;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (!alive || !scope.current) return;
      const ctx = gsap.context(() => setup(gsap, ScrollTrigger), scope.current);
      revert = () => ctx.revert();
    });
    return () => {
      alive = false;
      revert?.();
    };
    // setup is usually an inline closure; deps are given explicitly.
  }, [reduced, ...deps]);
}
