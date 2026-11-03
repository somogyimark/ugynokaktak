import { describe, expect, it } from 'vitest';
import { extractYear, normalizeText, tokenize } from './normalize';

describe('normalizeText', () => {
  it('strips Hungarian accents and lowercases', () => {
    expect(normalizeText('Árvíztűrő Tükörfúrógép')).toBe('arvizturo tukorfurogep');
    expect(normalizeText('ŐSZ ÜLLŐ')).toBe('osz ullo');
  });

  it('treats "Gábor" and "Gabor" the same', () => {
    expect(normalizeText('Gábor')).toBe(normalizeText('Gabor'));
    expect(normalizeText('GÁBOR')).toBe('gabor');
  });

  it('collapses punctuation and whitespace', () => {
    expect(normalizeText('  Próbaházi-Demó,   Éva  ')).toBe('probahazi demo eva');
    expect(normalizeText('dr. Tesztelő   Ödön')).toBe('dr tesztelo odon');
  });

  it('handles decomposed input (NFD)', () => {
    expect(normalizeText('Góbor'.replace('ó', 'á'))).toBe('gabor');
  });

  it('tokenizes', () => {
    expect(tokenize('Mintás  Gábor')).toEqual(['mintas', 'gabor']);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('extractYear', () => {
  it('reads years from various date formats', () => {
    expect(extractYear('1932')).toBe(1932);
    expect(extractYear('1932-05-14')).toBe(1932);
    expect(extractYear('1932. máj. 3.')).toBe(1932);
    expect(extractYear('szül.: 1908 körül')).toBe(1908);
  });

  it('returns null for missing or implausible values', () => {
    expect(extractYear(undefined)).toBeNull();
    expect(extractYear('ismeretlen')).toBeNull();
    expect(extractYear('12345')).toBeNull();
    expect(extractYear('1700')).toBeNull();
  });
});
