// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { HAdattarTerminal } from './HAdattarTerminal';
import type { AgentRecord } from '../../data/schema';

const record: AgentRecord = {
  id: 'ha-test',
  source: 'hadattar',
  name: 'PROBAHAZI GABOR',
  nameNormalized: 'probahazi gabor',
  coverName: 'FECSKE',
  birthDate: '1931',
};

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe('<HAdattarTerminal />', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('with reduced motion', () => {
    beforeEach(() => stubReducedMotion(true));

    it('shows every field immediately, with redactions for missing ones', () => {
      const { container } = render(<HAdattarTerminal record={record} />);
      expect(container.textContent).toContain('REKORD VÉGE');
      expect(container.querySelectorAll('[data-redaction]').length).toBe(7);
      expect(screen.queryByText('Teljes rekord azonnal')).toBeNull();
    });
  });

  describe('with motion', () => {
    beforeEach(() => stubReducedMotion(false));

    it('types fields in one by one and can be skipped', () => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
      const { container } = render(<HAdattarTerminal record={record} />);
      expect(container.textContent).not.toContain('REKORD VÉGE');
      // The accessible list is complete from the start.
      expect(container.querySelector('dl.sr-only')?.textContent).toContain('FECSKE');
      act(() => screen.getByText('Teljes rekord azonnal').click());
      expect(container.textContent).toContain('REKORD VÉGE');
    });

    it('finishes on its own', () => {
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
      const { container } = render(<HAdattarTerminal record={record} />);
      for (let i = 0; i < 400 && !container.textContent?.includes('REKORD VÉGE'); i++) {
        act(() => {
          vi.advanceTimersByTime(50);
        });
      }
      expect(container.textContent).toContain('REKORD VÉGE');
    });
  });
});
