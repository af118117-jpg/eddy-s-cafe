// The colour tokens, read from src/styles/tokens.css, for the Vite config and
// the scripts that write files (theme colour, icons, link-preview image,
// placeholder photos), so none of them restates a raw value.
import { readFileSync } from 'node:fs'

const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8')

/** A colour token as upper-case hex: colorToken('bg') → "#FDFDFC". */
export function colorToken(name: string): string {
  const value = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\b`).exec(tokens)?.[1]
  if (!value) throw new Error(`No --color-${name} in src/styles/tokens.css`)
  return value.toUpperCase()
}
