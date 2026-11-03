import { describe, expect, it } from 'vitest';
import { CHORDS, MOTIF, midiToFreq } from './ambience';

describe('ambience score', () => {
  it('tunes to A440', () => {
    expect(midiToFreq(69)).toBe(440);
    expect(midiToFreq(57)).toBe(220);
  });

  it('stays inside A harmonic minor, so nothing in the score clashes', () => {
    const scale = new Set([9, 11, 0, 2, 4, 5, 8]);
    for (const n of [...CHORDS.flat(), ...MOTIF]) expect(scale.has(n % 12)).toBe(true);
  });
});
