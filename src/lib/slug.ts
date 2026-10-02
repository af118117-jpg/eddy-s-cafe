/**
 * "Tropical and Asian Mains" → "tropical-and-asian-mains", "Eddy' s Khaas" → "eddys-khaas".
 * Same rules as scripts/import-menu.mjs, so ids and anchors look alike.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]\s*/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
