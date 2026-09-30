/**
 * Folds text for forgiving search: lower case, no accents, "&" → "and",
 * apostrophes dropped (so "eddys" finds "Eddy's" and "Eddy' s"), and any other
 * punctuation turned into single spaces.
 */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’]\s*/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** "  Lamb  KEBAB " → ["lamb", "kebab"]. Every term has to match. */
export function searchTerms(query: string): string[] {
  const normalized = normalizeSearch(query)
  return normalized ? normalized.split(' ') : []
}
