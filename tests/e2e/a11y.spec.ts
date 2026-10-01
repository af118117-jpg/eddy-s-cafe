import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'

// Checks axe can't make: touch target size, focus hidden behind the fixed
// bars, and text contrast over the hero photo.

const MD = 768

/** Visible controls smaller than 44 × 44 CSS px. */
async function smallTargets(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('a[href], button, input, select, textarea')].flatMap((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0 || el.closest('[aria-hidden="true"]')) return []
      // The skip link is visually hidden (1px) until focused; its focused size is checked below.
      if (r.width <= 1 || r.height <= 1 || r.right <= 0 || r.bottom <= 0) return []
      if (r.width >= 44 && r.height >= 44) return []
      const name = (el.getAttribute('aria-label') ?? el.textContent).trim()
      return [`${name} ${String(Math.round(r.width))}×${String(Math.round(r.height))}`]
    }),
  )
}

test('every control is at least 44 × 44 px on a phone', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) >= MD, 'Phone widths only')
  for (const path of ['/', '/menu', '/menu?q=zzzz']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await smallTargets(page), path).toEqual([])
  }
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('Tab')
  const skip = await page.getByRole('link', { name: 'Skip to content' }).boundingBox()
  expect(Math.min(skip?.width ?? 0, skip?.height ?? 0)).toBeGreaterThanOrEqual(44)
})

test('focus is never hidden behind the sticky header or the action bar', async ({ page }) => {
  for (const path of ['/', '/menu']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const hidden: string[] = []
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab')
      const state = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        const r = el.getBoundingClientRect()
        const x = r.left + r.width / 2
        const y = r.top + r.height / 2
        const top = document.elementFromPoint(x, y)
        return {
          name: (el.getAttribute('aria-label') ?? el.textContent).trim(),
          covered: !top || !(el.contains(top) || top.contains(el)),
        }
      })
      if (!state) break
      if (state.covered) hidden.push(state.name)
    }
    expect(hidden, path).toEqual([])
  }
})

/** WCAG relative luminance of an sRGB colour. */
function luminance([r, g, b]: number[]) {
  const linear = [r, g, b].map((value = 0) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0)
}

test('the header over the hero stays above 4.5:1, even over a white photo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // Worst case for white text: a pure white photo. Then hide all text to read
  // the background that's really behind each header label.
  const boxes = await page.evaluate(() => {
    for (const img of document.querySelectorAll<HTMLElement>('[aria-labelledby="hero-title"] img'))
      img.style.filter = 'brightness(0) invert(1)'
    return [...document.querySelectorAll('header a, header button')].flatMap((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return [...range.getClientRects()]
        .filter((r) => r.width > 4 && r.height > 4)
        .map((r) => ({
          name: el.textContent.trim(),
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
        }))
    })
  })
  expect(boxes.length).toBeGreaterThan(0)
  await page.addStyleTag({
    content: '* { color: transparent !important; -webkit-text-fill-color: transparent !important }',
  })
  const { data, info } = await sharp(await page.screenshot())
    .raw()
    .toBuffer({ resolveWithObject: true })
  const scale = info.width / (page.viewportSize()?.width ?? info.width)
  const text = luminance([253, 253, 252]) // fg-inverse on the overlay header
  for (const box of boxes) {
    let brightest = 0
    for (let y = Math.floor(box.y * scale); y < (box.y + box.height) * scale; y += 2) {
      for (let x = Math.floor(box.x * scale); x < (box.x + box.width) * scale; x += 2) {
        const i = (y * info.width + x) * info.channels
        brightest = Math.max(
          brightest,
          luminance([data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0]),
        )
      }
    }
    const ratio = (text + 0.05) / (brightest + 0.05)
    expect(ratio, `${box.name}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
  }
})
