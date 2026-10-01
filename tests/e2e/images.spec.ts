import { expect, test, type Page } from '@playwright/test'

interface PhotoReading {
  name: string
  hero: boolean
  /** The width the `sizes` in use resolves to at this viewport. */
  sizes: number
  /** The width the photo is drawn at: object-fit: cover can draw it wider than its box. */
  drawn: number
}

/** Loads every photo on the page, then reads how wide it is drawn and what its `sizes` says. */
async function readPhotos(page: Page): Promise<PhotoReading[]> {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('picture img')] as HTMLImageElement[]
    for (const img of images) img.loading = 'eager'
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
  })
  return page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    document.body.append(probe)
    const resolve = (sizes: string) => {
      for (const entry of sizes.split(',').map((part) => part.trim())) {
        const match = /^(\([^)]*\))\s+(.+)$/.exec(entry)
        if (match && !matchMedia(match[1] ?? '').matches) continue
        probe.style.width = match?.[2] ?? entry
        return probe.getBoundingClientRect().width
      }
      return 0
    }
    const readings = [...document.querySelectorAll('picture img')].flatMap((element) => {
      const img = element as HTMLImageElement
      const box = img.getBoundingClientRect()
      if (box.width === 0) return [] // hidden at this width
      // The <source> the browser picks: the first whose media matches (every type is supported).
      const source = [...(img.parentElement?.querySelectorAll('source') ?? [])].find(
        (s) => !s.media || matchMedia(s.media).matches,
      )
      const ratio = img.naturalWidth / img.naturalHeight
      return [
        {
          name: img.alt || img.currentSrc.split('/').pop() || '',
          hero: !!img.closest('[aria-labelledby="hero-title"]'),
          sizes: resolve(source?.sizes || img.sizes),
          drawn: Math.max(box.width, box.height * ratio),
        },
      ]
    })
    probe.remove()
    return readings
  })
}

test('every photo’s sizes matches the width it is drawn at', async ({ page }) => {
  for (const path of ['/', '/menu']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const photos = await readPhotos(page)
    expect(photos.length, path).toBeGreaterThan(0)
    for (const photo of photos) {
      const label = `${path} ${photo.name}: sizes ${photo.sizes.toFixed(0)}px, drawn ${photo.drawn.toFixed(0)}px`
      // Never smaller than drawn (blurry), and not much bigger (wasted bytes). vw counts
      // the scrollbar; the hero's sizes use the viewport height, a little more than its own.
      expect(photo.sizes, label).toBeGreaterThanOrEqual(photo.drawn - 1)
      expect(photo.sizes, label).toBeLessThanOrEqual(photo.drawn * (photo.hero ? 1.25 : 1.05) + 20)
    }
  }
})

test('photos reserve their space and only the hero loads eagerly', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const photos = await page.evaluate(() =>
    [...document.querySelectorAll('picture img')].map((img) => ({
      width: img.getAttribute('width'),
      height: img.getAttribute('height'),
      alt: img.getAttribute('alt'),
      loading: img.getAttribute('loading'),
      fetchpriority: img.getAttribute('fetchpriority'),
      hero: !!img.closest('[aria-labelledby="hero-title"]'),
    })),
  )
  for (const photo of photos) {
    expect(Number(photo.width)).toBeGreaterThan(0)
    expect(Number(photo.height)).toBeGreaterThan(0)
    expect(photo.alt).not.toBeNull()
    expect(photo.loading).toBe(photo.hero ? 'eager' : 'lazy')
    expect(photo.fetchpriority).toBe(photo.hero ? 'high' : null)
  }
  expect(photos.filter((photo) => photo.hero)).toHaveLength(1)
})

test('the hero downloads once, from the preload, in AVIF', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('[aria-labelledby="hero-title"] picture img')
  await expect(hero).toHaveJSProperty('complete', true)
  const { currentSrc, preloaded, requests } = await hero.evaluate((img: HTMLImageElement) => {
    const link = [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')]
      .filter((l) => matchMedia(l.media).matches)
      .map((l) => l.imageSrcset)
    return {
      currentSrc: new URL(img.currentSrc).pathname,
      preloaded: link,
      requests: performance
        .getEntriesByType('resource')
        .map((entry) => new URL(entry.name).pathname)
        .filter((path) => img.parentElement?.innerHTML.includes(path)),
    }
  })
  expect(currentSrc).toMatch(/\.avif$/)
  // Exactly one preload applies at this width, and it lists the file the <picture> chose.
  expect(preloaded).toHaveLength(1)
  expect(preloaded[0]).toContain(currentSrc)
  // Only that one file of the hero's srcsets was fetched.
  expect(requests).toEqual([currentSrc])
})

test('text never asks for a weight the font doesn’t have', async ({ page }) => {
  for (const path of ['/', '/menu']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const weights = await page.evaluate(() => {
      const found = new Set<string>()
      for (const element of document.body.querySelectorAll('*')) {
        if ([...element.childNodes].some((node) => node.nodeType === 3 && node.textContent?.trim()))
          found.add(getComputedStyle(element).fontWeight)
      }
      return [...found].sort()
    })
    expect(weights, path).toEqual(expect.arrayContaining(['400', '500']))
    for (const weight of weights) expect(['400', '450', '500'], path).toContain(weight)
  }
})

test('each page’s HTML preloads its own code, and only the home page the hero', async ({
  page,
  request,
}) => {
  const home = await (await request.get('/')).text()
  const menu = await (await request.get('/menu')).text()
  expect(home).toMatch(/<link rel="modulepreload" crossorigin href="\/assets\/Home-[\w-]+\.js">/)
  expect(home.match(/<link rel="preload" as="image"/g)).toHaveLength(2)
  expect(menu).toMatch(/<link rel="modulepreload" crossorigin href="\/assets\/Menu-[\w-]+\.js">/)
  expect(menu).not.toContain('as="image"')
  expect(menu).not.toMatch(/Home-[\w-]+\.js/)
  expect(menu).toContain('<title>Menu | eddy’s Café</title>')

  await page.goto('/menu')
  await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeVisible()
  const avif = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => name.endsWith('.avif')),
  )
  // Menu thumbnails may load; the hero never does.
  expect(avif.filter((name) => /\/hero-/.test(name))).toEqual([])
})
