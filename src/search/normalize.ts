/**
 * Hungarian-aware text normalisation for search and for `nameNormalized`.
 * Lowercases, strips diacritics (á→a, ő→o, ű→u …), turns punctuation into spaces
 * and collapses whitespace, so "Gábor", "GABOR" and "gabor" all become "gabor".
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Splits normalised text into search terms. */
export function tokenize(input: string): string[] {
  const n = normalizeText(input);
  return n ? n.split(' ') : [];
}

/** Extracts a plausible year (1850–2029) from a free-form date like "1932", "1932-05-14" or "1932. máj. 3.". */
export function extractYear(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = /(?:^|\D)(1[89]\d{2}|20[0-2]\d)(?!\d)/.exec(value);
  return match ? Number(match[1]) : null;
}
