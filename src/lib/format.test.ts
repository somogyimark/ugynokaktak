import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber } from './format';

describe('format', () => {
  it('formats dates in Hungarian', () => {
    expect(formatDate('1934-05-14')).toBe('1934. május 14.');
    expect(formatDate('1934')).toBe('1934.');
    expect(formatDate('1934 körül')).toBe('1934 körül');
    expect(formatDate('1934-13-01')).toBe('1934-13-01');
  });

  it('formats numbers with Hungarian grouping', () => {
    expect(formatNumber(60000).replace(/\s/g, ' ')).toBe('60 000');
  });
});
