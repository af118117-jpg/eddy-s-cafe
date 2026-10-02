// Full-page screenshots of every page at every width we design for, for
// design review: tests/screenshots/<page>-<width>.png.
// Usage: npm run screenshots   (builds first; on this machine set
// PLAYWRIGHT_CHANNEL=msedge, as for the e2e tests)
// Reduced motion, so photos that wipe in on scroll are already shown; every
// lazy photo is loaded before the shot.
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = `${root}tests/screenshots`
const PORT = 4174

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'menu', path: '/menu' },
]
// Widths from the brief, each with a typical screen height for that width.
const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1536, height: 900 },
]

mkdirSync(outDir, { recursive: true })
const server = await preview({ root, preview: { port: PORT, strictPort: true }, logLevel: 'warn' })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })

try {
  for (const viewport of VIEWPORTS) {
    const phone = viewport.width < 768
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      isMobile: phone,
      hasTouch: phone,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    for (const { name, path } of PAGES) {
      await page.goto(`http://localhost:${String(PORT)}${path}`)
      await page.getByRole('heading', { level: 1 }).waitFor()
      await page.waitForLoadState('networkidle')
      await page.evaluate(async () => {
        await document.fonts.ready
        const images = [...document.querySelectorAll('img')]
        for (const img of images) img.loading = 'eager'
        await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
      })
      const file = `${outDir}/${name}-${String(viewport.width)}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log(`tests/screenshots/${name}-${String(viewport.width)}.png`)
    }
    await context.close()
  }
} finally {
  await browser.close()
  await server.close()
}
