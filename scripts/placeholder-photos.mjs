// Writes a cream placeholder into assets-source/ for every photo slot that
// has no file yet: at the slot's ratio and 2400px wide, so the build generates
// every width, with its file name faintly in the middle (in beige, a token) so
// you can tell which file to replace (and so no two are identical, which the
// build would merge).
// Files that already exist (real photos) are never touched; delete one to get
// its placeholder back.
// Usage: npm run photos:placeholders
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { colorToken } from './tokens.ts'

const root = fileURLToPath(new URL('../assets-source/', import.meta.url))
// Node runs this TypeScript file directly (type stripping); it has no imports.
const { homeSelection } = await import(new URL('../src/data/home-selection.ts', import.meta.url))

const CREAM = colorToken('cream')
// Cream would vanish on the cream Feasts band.
const BEIGE = colorToken('beige')
const WIDTH = 2400

const slots = [
  // One source, cropped to 4:5 on phones and 16:9 from 768px; 4:5 at 2400 wide covers both.
  { file: 'hero.jpg', ratio: [4, 5] },
  { file: 'intro.jpg', ratio: [4, 5] },
  { file: 'feasts.jpg', ratio: [4, 5], colour: BEIGE },
  { file: 'drinks.jpg', ratio: [4, 5] },
  { file: 'space.jpg', ratio: [16, 9] },
  ...Array.from({ length: 9 }, (_, i) => ({
    file: `gallery/${String(i + 1).padStart(2, '0')}.jpg`,
    ratio: [1, 1],
  })),
  // Only the dishes the café has its own photos of; the rest show a cream block until they have one.
  ...homeSelection.signatures.map((id) => ({
    file: `dishes/${id}.jpg`,
    ratio: [4, 5],
  })),
]

let written = 0
for (const { file, ratio, colour = CREAM } of slots) {
  const path = root + file
  if (existsSync(path)) continue
  mkdirSync(dirname(path), { recursive: true })
  const height = Math.round((WIDTH * ratio[1]) / ratio[0])
  const label = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${String(height)}">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="96" fill="${colour === CREAM ? BEIGE : CREAM}">${file}</text>
    </svg>`,
  )
  await sharp({ create: { width: WIDTH, height, channels: 3, background: colour } })
    .composite([{ input: label }])
    .jpeg({ quality: 90 })
    .toFile(path)
  console.log(`placeholder  assets-source/${file}  ${String(WIDTH)}×${String(height)}`)
  written++
}
console.log(
  `${String(written)} placeholders written, ${String(slots.length - written)} slots already had a file.`,
)
