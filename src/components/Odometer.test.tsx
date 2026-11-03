import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { formatNumber } from '../lib/format';
import { Odometer } from './Odometer';

describe('Odometer', () => {
  it('gives screen readers the exact value and renders one drum per digit', () => {
    const html = renderToStaticMarkup(<Odometer value={48213} />);
    expect(html).toContain(`<span class="sr-only">${formatNumber(48213)}</span>`);
    // Each drum carries the digits 0–9 once.
    expect(html.split('>9</span>').length - 1).toBe(5);
    // Before scrolling into view every drum rests on 0.
    expect(html.match(/translateY\(-0%\)/g)).toHaveLength(5);
  });
});
