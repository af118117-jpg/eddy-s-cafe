import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { heroImage } from '../../src/lib/heroImage.ts'
import { photoSizes } from '../../src/lib/photoSizes.ts'

// The design rules from docs/PLAN.md, checked on the rendered pages rather
// than in the source: only token colours, no shadows, round corners only on
// buttons and chips, and the one bold move (the hero wordmark) in view.

const tokens = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8')
/** Every colour token as [r, g, b]. */
const palette = [...tokens.matchAll(/--color-[\w-]+:\s*#([0-9a-f]{6})\b/gi)].map(([, hex = '']) =>
  [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)),
)
const PAGES = ['/', '/menu', '/menu?q=zzzz']

test('every colour on the page is a token (alpha aside)', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const used = await page.evaluate(() => {
      // Any CSS colour → [r, g, b] in sRGB, via a canvas (handles rgb(), oklab() and color()).
      const canvas = document.createElement('canvas').getContext('2d', {
        willReadFrequently: true,
      })
      if (!canvas) throw new Error('no canvas')
      const rgb = (colour: string) => {
        canvas.clearRect(0, 0, 1, 1)
        // Opaque, so the pixel is the colour itself: alpha variants (ink/80) are allowed.
        canvas.fillStyle = colour.replace(/\s*\/\s*[\d.]+%?\s*\)$/, ')').replace(/^rgba/, 'rgb')
        canvas.fillRect(0, 0, 1, 1)
        return [...canvas.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      }
      const colours = (value: string) =>
        (value.match(/(?:rgba?|oklab|oklch|lab|lch|color|hsla?)\([^()]*\)/g) ?? []).filter(
          (colour) => !/(?:,\s*0|\/\s*0)\)$/.test(colour), // fully transparent
        )
      const found = new Map<string, string>()
      const note = (value: string, where: string) => {
        for (const colour of colours(value)) found.set(rgb(colour).join(','), where)
      }
      for (const element of document.querySelectorAll<HTMLElement>('body, body *')) {
        if (!element.getClientRects().length) continue
        const name = `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}`
        for (const pseudo of [null, '::before', '::after', '::placeholder'] as const) {
          const style = getComputedStyle(element, pseudo)
          if (pseudo && pseudo !== '::placeholder' && style.content === 'none') continue
          if (pseudo === '::placeholder' && element.tagName !== 'INPUT') continue
          const where = `${name}${pseudo ?? ''}`
          if (element.textContent.trim() || pseudo === '::placeholder') note(style.color, where)
          note(style.backgroundColor, where)
          note(style.backgroundImage, where)
          for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
            if (style[`border${side}Style`] !== 'none' && parseFloat(style[`border${side}Width`]))
              note(style[`border${side}Color`], where)
          }
          if (style.outlineStyle !== 'none') note(style.outlineColor, where)
          if (element instanceof SVGElement) {
            note(style.fill, where)
            note(style.stroke, where)
          }
        }
      }
      return [...found].map(([colour, where]) => ({ colour: colour.split(',').map(Number), where }))
    })
    expect(used.length, path).toBeGreaterThan(3)
    // Within 2 per channel: oklab colour mixes round on the way back to sRGB.
    const offToken = used.filter(
      ({ colour }) =>
        !palette.some((token) =>
          token.every((value, i) => Math.abs(value - (colour[i] ?? 0)) <= 2),
        ),
    )
    expect(offToken, path).toEqual([])
  }
})

test('no shadows, and round corners only on buttons and chips', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const problems = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('body *')].flatMap((element) => {
        const style = getComputedStyle(element)
        const name = `${element.tagName.toLowerCase()} "${element.textContent.trim().slice(0, 24)}"`
        const issues: string[] = []
        if (style.boxShadow !== 'none') issues.push(`${name}: box-shadow ${style.boxShadow}`)
        if (style.textShadow !== 'none') issues.push(`${name}: text-shadow ${style.textShadow}`)
        const radii = [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ].filter((radius) => parseFloat(radius) > 0)
        // 999px is the pill (buttons, chips, and the chip rows' sliding indicator).
        const pill =
          radii.every((radius) => radius === '999px') &&
          (element.matches('a, button') || !!element.closest('[role="toolbar"]'))
        if (radii.length > 0 && !pill) issues.push(`${name}: border-radius ${radii.join(' ')}`)
        return issues
      }),
    )
    expect(problems, path).toEqual([])
  }
})

test('the wordmark is on screen when the home page opens, clear of the action bar', async ({
  page,
}) => {
  // Includes the smallest phone, where a two-line announcement once pushed it under the bar.
  const sizes = [page.viewportSize(), { width: 320, height: 640 }]
  for (const size of sizes) {
    if (!size) continue
    await page.setViewportSize(size)
    await page.goto('/')
    const wordmark = page.getByRole('heading', { level: 1 })
    await expect(wordmark).toBeVisible()
    const { announcement, visibleBottom, wordmarkBox } = await page.evaluate(() => {
      const bar = document.querySelector('[data-announcement]')?.getBoundingClientRect()
      const actions = document
        .querySelector('nav[aria-label="Quick actions"]')
        ?.getBoundingClientRect()
      const h1 = document.querySelector('h1')?.getBoundingClientRect()
      return {
        announcement: bar?.height ?? 0,
        visibleBottom: actions && actions.height > 0 ? actions.top : window.innerHeight,
        wordmarkBox: h1 ? { top: h1.top, height: h1.height } : null,
      }
    })
    const label = `${String(size.width)}×${String(size.height)}`
    // One line, as tall as the hero's height calculation assumes (44px).
    expect(announcement, label).toBe(44)
    // The wordmark is cropped by the hero's bottom edge on purpose (0.16em), and no more.
    expect(wordmarkBox, label).not.toBeNull()
    if (wordmarkBox) {
      expect(wordmarkBox.top, label).toBeLessThan(visibleBottom - wordmarkBox.height * 0.75)
    }
  }
})

// HTML attributes (sizes, media) can't read CSS variables, so photoSizes.ts and
// heroImage.ts spell their pixel values out. Each must still be one the tokens define.
test('pixel values in photo sizes and the hero media come from the tokens', () => {
  const px = (name: string) => {
    const value = new RegExp(`--${name}:\\s*(\\d+)px`).exec(tokens)?.[1]
    if (!value) throw new Error(`No --${name} in tokens.css`)
    return Number(value)
  }
  const breakpoints = ['md', 'lg', '2xl'].map((name) => px(`breakpoint-${name}`))
  // Where the content column stops growing: 1280 plus the two 48px margins.
  const contentStops = px('container-content') + 2 * px('spacing-margin-lg')
  const values = [...Object.values(photoSizes), heroImage.wideMedia, heroImage.narrowMedia]
  const widths = values.flatMap((value) =>
    [...value.matchAll(/min-width: (\d+)px/g)].map(([, width]) => Number(width)),
  )
  expect(widths.length).toBeGreaterThan(10)
  for (const width of widths) expect([...breakpoints, contentStops]).toContain(width)

  expect(photoSizes.wide).toContain(`${String(px('container-page'))}px`)
  for (const size of ['sm', 'md', 'lg']) {
    expect(photoSizes.wide).toContain(`100vw - ${String(2 * px(`spacing-margin-${size}`))}px`)
  }
  expect(photoSizes.thumbnail).toBe(`${String(px('spacing-16'))}px`)
})
