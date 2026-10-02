// Renders public/og-image.jpg (1200 × 630), the image link previews show:
// the hero's oversized wordmark on ink, in the site's font and colour tokens.
// Usage: npm run og-image   (needs a Playwright browser; on this machine set
// PLAYWRIGHT_CHANNEL=msedge, as for the e2e tests)
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { colorToken as token } from './tokens.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const font = readFileSync(`${root}public/fonts/inter-latin-wght-400-500.woff2`).toString('base64')

const html = `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: Inter; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 400 500; }
  html, body { margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: ${token('ink')}; color: ${token('bg')}; font-family: Inter, sans-serif;
  }
  .line { position: absolute; top: 64px; left: 72px; margin: 0; max-width: 640px;
    font-size: 40px; line-height: 1.25; font-weight: 400; letter-spacing: -0.015em; color: ${token('cream')}; }
  .wordmark { position: absolute; left: 60px; bottom: -0.14em; margin: 0;
    font-size: 330px; line-height: 0.92; font-weight: 500; letter-spacing: -0.04em; }
</style>
<p class="line">All-day café and grill on Green Avenue West, Faisalabad</p>
<p class="wordmark">eddy’s</p>`

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
const shot = await page.screenshot()
await browser.close()
await sharp(shot).jpeg({ quality: 88, mozjpeg: true }).toFile(`${root}public/og-image.jpg`)
console.log('public/og-image.jpg')
