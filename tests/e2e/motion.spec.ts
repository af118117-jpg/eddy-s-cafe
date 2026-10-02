import { expect, test, type Page } from '@playwright/test'

/** Sum of layout shifts not caused by input, from the page's first paint on. */
async function cumulativeLayoutShift(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number
            hadRecentInput: boolean
          })[]) {
            if (!entry.hadRecentInput) total += entry.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => {
          resolve(total)
        }, 300)
      }),
  )
}

/** Properties animated by every running or finished animation and transition on the page. */
async function animatedProperties(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const properties = new Set<string>()
    for (const animation of document.getAnimations()) {
      if (animation instanceof CSSTransition) properties.add(animation.transitionProperty)
      const effect = animation.effect as KeyframeEffect | null
      for (const frame of effect?.getKeyframes() ?? []) {
        for (const key of Object.keys(frame)) {
          if (!['offset', 'computedOffset', 'easing', 'composite'].includes(key))
            properties.add(key)
        }
      }
    }
    // Keyframes name properties in camelCase (borderBottomColor); compare in CSS spelling.
    return [...properties].map((name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`))
  })
}

// Only these may move; colours may fade. Layout properties never animate.
const ALLOWED = [
  'transform',
  'translate',
  'scale',
  'opacity',
  'clip-path',
  'color',
  'background-color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
]

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((top) => {
      window.scrollTo(0, top)
    }, y)
    await page.waitForTimeout(50)
  }
}

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing moves and everything is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('html')).not.toHaveClass(/js-motion/)

    // Hero: the photo, wordmark, line and buttons are in place, fully opaque.
    const hero = await page.evaluate(() =>
      [...document.querySelectorAll('[data-entrance]')].map((element) => {
        const style = getComputedStyle(element)
        return { opacity: style.opacity, scale: style.scale, translate: style.translate }
      }),
    )
    for (const style of hero)
      expect(style).toEqual({ opacity: '1', scale: 'none', translate: 'none' })

    await scrollThrough(page)
    const hidden = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal]')].filter(
          (element) => getComputedStyle(element).clipPath !== 'none',
        ).length,
    )
    expect(hidden).toBe(0)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })

  test('menu filtering changes instantly, with no sliding indicator', async ({ page }) => {
    await page.goto('/menu')
    await page.evaluate(() => {
      Object.assign(window, { viewTransitions: 0 })
      const original = document.startViewTransition.bind(document)
      document.startViewTransition = ((update: () => Promise<void>) => {
        ;(window as unknown as { viewTransitions: number }).viewTransitions++
        return original(update)
      }) as typeof document.startViewTransition
    })
    const groups = page.getByRole('toolbar', { name: 'Menu sections' })
    await groups.getByRole('button', { name: 'Desserts' }).click()
    await expect(page.locator('main section h2')).toHaveText(['Live Desserts'])
    expect(
      await page.evaluate(() => (window as unknown as { viewTransitions: number }).viewTransitions),
    ).toBe(0)
    await expect(groups.locator('span[aria-hidden="true"]')).toHaveCount(0)
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  })
})

test.describe('with motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  test('the hero entrance plays once, animating only transform and opacity', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/js-motion/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const names = await page.evaluate(() =>
      document.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
    )
    expect(names.sort()).toEqual(['fade-in', 'fade-in', 'hero-settle', 'rise'])
    expect(await animatedProperties(page)).toEqual(
      expect.arrayContaining(['scale', 'translate', 'opacity']),
    )
    for (const property of await animatedProperties(page)) expect(ALLOWED).toContain(property)

    // Done within about 1.2s, then everything rests in place.
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState === 'finished'),
    )
    const photo = await page
      .locator('[data-entrance="photo"]')
      .evaluate((e) => getComputedStyle(e).scale)
    expect(photo).toBe('1')

    // Coming back to the home page doesn't replay it.
    await page.getByRole('link', { name: 'Menu', exact: true }).first().click()
    await expect(page).toHaveURL(/\/menu$/)
    await page.goBack()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('[data-entrance]')).toHaveCount(0)
  })

  test('photos below the fold wipe in once, and text is never revealed', async ({ page }) => {
    await page.goto('/')
    const gallery = page.locator('#gallery [data-reveal]').first()
    await expect(gallery).toHaveAttribute('data-reveal', 'hidden')
    // Only the three photo sections use it, and it never wraps text.
    const places = await page.evaluate(() =>
      [...document.querySelectorAll('[data-reveal]')].map((element) => ({
        section: element.closest('section, figure')?.id || element.closest('figure')?.tagName,
        text: element.textContent.trim(),
      })),
    )
    for (const place of places) {
      expect(['signatures', 'gallery', 'FIGURE']).toContain(place.section)
      expect(place.text).toBe('')
    }

    await gallery.scrollIntoViewIfNeeded()
    await expect(gallery).toHaveAttribute('data-reveal', 'shown')
    await expect
      .poll(() => gallery.evaluate((e) => getComputedStyle(e).clipPath))
      .toBe('inset(0px)')
  })

  test('hover: photos zoom in their frame and link underlines draw', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone-375', 'Touch screens have no hover')
    await page.goto('/')
    const tile = page.locator('#gallery li').first()
    await tile.scrollIntoViewIfNeeded()
    // Let the wipe finish first: a still pointer isn't re-hit-tested when the clip opens up.
    await expect(tile.locator('[data-reveal]')).toHaveAttribute('data-reveal', 'shown')
    await page.waitForFunction(() =>
      document.getAnimations().every((animation) => animation.playState !== 'running'),
    )
    await tile.hover()
    const fill = tile.locator('[data-placeholder-fill], img').first()
    await expect.poll(() => fill.evaluate((e) => getComputedStyle(e).scale)).toBe('1.03')
    // The frame clips the zoom.
    expect(await tile.locator('[data-zoom]').evaluate((e) => getComputedStyle(e).overflow)).toBe(
      'hidden',
    )

    const link = page.locator('#gallery').getByRole('link', { name: /Instagram/ })
    const line = () =>
      link.locator('.link-draw').evaluate((e) => getComputedStyle(e, '::after').scale)
    expect(await line()).toBe('0 1')
    await link.hover()
    await expect.poll(line).toBe('1')
  })

  test('menu filtering crossfades and the tab indicator slides to the pressed tab', async ({
    page,
  }) => {
    await page.goto('/menu')
    await page.evaluate(() => {
      Object.assign(window, { viewTransitions: 0 })
      const original = document.startViewTransition.bind(document)
      document.startViewTransition = ((update: () => Promise<void>) => {
        ;(window as unknown as { viewTransitions: number }).viewTransitions++
        return original(update)
      }) as typeof document.startViewTransition
    })
    const groups = page.getByRole('toolbar', { name: 'Menu sections' })
    const desserts = groups.getByRole('button', { name: 'Desserts' })
    await desserts.click()
    await expect(page.locator('main section h2')).toHaveText(['Live Desserts'])
    expect(
      await page.evaluate(() => (window as unknown as { viewTransitions: number }).viewTransitions),
    ).toBe(1)

    // Once settled, the indicator's caps line up with the pressed tab's edges.
    const pill = groups.locator('span[aria-hidden="true"] > span')
    await expect
      .poll(async () => {
        const [start, end, chip] = await Promise.all([
          pill.first().boundingBox(),
          pill.last().boundingBox(),
          desserts.boundingBox(),
        ])
        if (!start || !end || !chip) return null
        return [Math.round(start.x - chip.x), Math.round(end.x + end.width - (chip.x + chip.width))]
      })
      .toEqual([0, 0])
    for (const property of await animatedProperties(page)) expect(ALLOWED).toContain(property)
  })

  test('layout shift stays under 0.05 on the home and menu pages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await scrollThrough(page)
    expect(await cumulativeLayoutShift(page)).toBeLessThan(0.05)

    await page.goto('/menu')
    await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeVisible()
    for (const name of ['Mains', 'Cold Drinks', 'All']) {
      const chip = page
        .getByRole('toolbar', { name: 'Menu sections' })
        .getByRole('button', { name, exact: true })
      // Centred in its row first, clear of the edge arrows.
      await chip.evaluate((element) => {
        element.scrollIntoView({ block: 'nearest', inline: 'center' })
      })
      await chip.click()
      await page.waitForTimeout(400)
    }
    // Reading down and back up: on phones the header hides and returns, and the
    // stuck toolbar follows it, which must not shift anything.
    for (const y of [300, 700, 1100, 1500, 1900, 1500, 1100, 700, 300, 700, 1100]) {
      await page.evaluate((top) => {
        window.scrollTo(0, top)
      }, y)
      await page.waitForTimeout(120)
    }
    expect(await cumulativeLayoutShift(page)).toBeLessThan(0.05)
  })
})
