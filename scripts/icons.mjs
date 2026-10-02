// Writes the favicon set and the web app manifest into public/, from
// public/favicon.svg and the colour tokens in src/styles/tokens.css:
//   favicon.ico (16, 32, 48), apple-touch-icon.png (180),
//   icon-192.png, icon-512.png, icon-maskable-512.png, site.webmanifest,
// and sets favicon.svg's two colours to the tokens
// Usage: npm run icons
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { colorToken } from './tokens.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const ink = colorToken('ink')
const bg = colorToken('bg')

// favicon.svg is drawn by hand; its two colours are kept in step with the tokens here.
const svgPath = `${root}public/favicon.svg`
const svg = readFileSync(svgPath, 'utf8')
  .replace(/(<rect[^>]* fill=")#[0-9a-fA-F]{6}/, `$1${ink}`)
  .replace(/(<path[^>]* fill=")#[0-9a-fA-F]{6}/, `$1${bg}`)
writeFileSync(svgPath, svg)

const png = (size) =>
  sharp(Buffer.from(svg), { density: 72 * (size / 64) * 2 })
    .resize(size, size)
    .png()
    .toBuffer()

// Maskable icons are cropped to a circle by some launchers: keep the "e"
// inside the central 80% by drawing it smaller on the same ink square.
const maskable = await sharp(await png(410))
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: ink })
  .png()
  .toBuffer()

for (const [file, data] of [
  ['apple-touch-icon.png', await png(180)],
  ['icon-192.png', await png(192)],
  ['icon-512.png', await png(512)],
  ['icon-maskable-512.png', maskable],
]) {
  writeFileSync(`${root}public/${file}`, data)
  console.log(`public/${file}`)
}

// favicon.ico: an ICO directory of PNG images (supported by every current browser).
const sizes = [16, 32, 48]
const images = await Promise.all(sizes.map(png))
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: icon
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i
  header.writeUInt8(size, entry) // width
  header.writeUInt8(size, entry + 1) // height
  header.writeUInt8(0, entry + 2) // palette
  header.writeUInt8(0, entry + 3) // reserved
  header.writeUInt16LE(1, entry + 4) // colour planes
  header.writeUInt16LE(32, entry + 6) // bits per pixel
  header.writeUInt32LE(images[i].length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += images[i].length
})
writeFileSync(`${root}public/favicon.ico`, Buffer.concat([header, ...images]))
console.log('public/favicon.ico')

const manifest = {
  name: 'eddy’s Café',
  short_name: 'eddy’s',
  description: 'All-day café and grill on Green Avenue West, Faisalabad.',
  start_url: '/',
  scope: '/',
  display: 'browser',
  background_color: bg,
  theme_color: bg,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}
writeFileSync(`${root}public/site.webmanifest`, `${JSON.stringify(manifest, null, 2)}\n`)
console.log('public/site.webmanifest')
