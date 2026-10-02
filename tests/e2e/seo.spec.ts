import { expect, test } from '@playwright/test'
import { colorToken } from '../../scripts/tokens.ts'

const SITE = 'https://eddys-cafe.example'

/** Tags a crawler or link preview reads from the HTML file, without running the app. */
function headOf(html: string) {
  const meta = (key: string) =>
    new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`).exec(html)?.[1] ?? null
  return {
    title: /<title>([^<]*)<\/title>/.exec(html)?.[1],
    description: meta('description'),
    canonical: /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1],
    robots: meta('robots'),
    themeColor: meta('theme-color'),
    ogTitle: meta('og:title'),
    ogUrl: meta('og:url'),
    ogImage: meta('og:image'),
    twitterCard: meta('twitter:card'),
    jsonLd: [...html.matchAll(/<script type="application\/ld\+json">([^<]*)<\/script>/g)].map(
      (match) => JSON.parse(match[1] ?? '') as Record<string, unknown>,
    ),
  }
}

test('each page’s HTML has its own title, description, canonical and preview tags', async ({
  request,
}) => {
  const home = headOf(await (await request.get('/')).text())
  const menu = headOf(await (await request.get('/menu')).text())
  expect(home.title).toBe('eddy’s Café, Faisalabad')
  expect(menu.title).toBe('Menu | eddy’s Café')
  expect(home.description).not.toBe(menu.description)
  expect(home.canonical).toBe(`${SITE}/`)
  expect(menu.canonical).toBe(`${SITE}/menu`)
  for (const page of [home, menu]) {
    expect(page.description?.length).toBeGreaterThan(50)
    expect(page.ogTitle).toBe(page.title)
    expect(page.ogUrl).toBe(page.canonical)
    expect(page.ogImage).toBe(`${SITE}/og-image.jpg`)
    expect(page.twitterCard).toBe('summary_large_image')
    expect(page.themeColor).toBe(colorToken('bg'))
    expect(page.robots).toBeNull()
  }
  // The Restaurant JSON-LD is on the home page only.
  expect(home.jsonLd).toHaveLength(1)
  expect(home.jsonLd[0]?.['@type']).toBe('Restaurant')
  expect(menu.jsonLd).toHaveLength(0)
})

test('404.html, which static hosts serve for unknown paths, is the not-found page and not indexed', async ({
  request,
}) => {
  const html = await (await request.get('/404.html')).text()
  const head = headOf(html)
  expect(head.title).toBe('Page not found | eddy’s Café')
  expect(head.robots).toBe('noindex')
  expect(head.canonical).toBeUndefined()
  expect(head.jsonLd).toHaveLength(0)
  // Nothing preloaded: the not-found page is in the main chunk and has no photos.
  expect(html).not.toContain('as="image"')
  expect(html).not.toContain('modulepreload')
})

test('moving between pages in the app keeps the head in step', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('link', { name: 'View menu' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeVisible()
  await expect(page).toHaveTitle('Menu | eddy’s Café')
  const head = () =>
    page.evaluate(() => ({
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
      descriptions: document.querySelectorAll('meta[name="description"]').length,
    }))
  expect(await head()).toMatchObject({
    canonical: `${SITE}/menu`,
    robots: null,
    descriptions: 1,
  })
  expect((await head()).description).toContain('menu')

  // A page that doesn't exist isn't indexed and has no canonical URL.
  await page.goto('/no-such-page')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page).toHaveTitle('Page not found | eddy’s Café')
  expect(await head()).toMatchObject({ canonical: null, robots: 'noindex' })
})

test('robots.txt, the sitemap, the manifest, the icons and the preview image are served', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt')
  expect(await robots.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain(`<loc>${SITE}/menu</loc>`)

  const manifest = (await (await request.get('/site.webmanifest')).json()) as {
    theme_color: string
    background_color: string
    icons: { src: string }[]
  }
  // Colour tokens only (npm run icons writes them from tokens.css).
  const bg = colorToken('bg')
  expect([manifest.theme_color, manifest.background_color]).toEqual([bg, bg])

  for (const [path, type] of [
    ['/favicon.ico', 'image/'],
    ['/favicon.svg', 'image/svg+xml'],
    ['/apple-touch-icon.png', 'image/png'],
    ['/og-image.jpg', 'image/jpeg'],
    ...manifest.icons.map((icon) => [icon.src, 'image/png'] as const),
  ] as const) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type'], path).toContain(type)
  }
})
