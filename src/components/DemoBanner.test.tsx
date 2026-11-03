// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DemoBanner, isDemo } from './DemoBanner';

describe('isDemo', () => {
  it('is shown whenever either the env or the data says mock', () => {
    expect(isDemo('mock')).toBe(true);
    expect(isDemo('mock', 'live')).toBe(true);
    expect(isDemo('live', 'mock')).toBe(true);
    expect(isDemo('live', 'live')).toBe(false);
    expect(isDemo('live')).toBe(false);
  });
});

describe('<DemoBanner /> in mock mode', () => {
  afterEach(cleanup);

  it('renders immediately, before any data has loaded', () => {
    vi.stubGlobal('fetch', () => new Promise(() => {}));
    render(<DemoBanner />);
    expect(screen.getByTestId('demo-banner').textContent).toContain('FIKTÍV TESZTADAT – DEMÓ');
    vi.unstubAllGlobals();
  });
});
