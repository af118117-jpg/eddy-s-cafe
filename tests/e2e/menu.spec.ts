import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const toolbar = (page: Page) => page.getByRole('search', { name: 'Menu filters' })
const groups = (page: Page) => page.getByRole('toolbar', { name: 'Menu sections' })
const categories = (page: Page) => page.getByRole('toolbar', { name: 'Categories' })
const searchBox = (page: Page) => page.getByRole('searchbox', { name: 'Search the menu' })
const resultCount = (page: Page) => page.locator('main [aria-live="polite"]')
const categoryHeadings = (page: Page) => page.locator('main section h2')

async function openMenu(page: Page, path = '/menu') {
  await page.goto(path)
  await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeVisible()
}

/** Distance from the bottom of the sticky toolbar to the top of an element. */
async function gapBelowToolbar(page: Page, selector: string): Promise<number> {
  return page.evaluate((target) => {
    const bar = document.querySelector('[role="search"]')?.getBoundingClientRect()
    const element = document.querySelector(target)?.getBoundingClientRect()
    return bar && element ? Math.round(element.top - bar.bottom) : Number.NaN
  }, selector)
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
}

test('filters by group and category, and keeps the filter in the URL', async ({ page }) => {
  await openMenu(page)
  await expect(resultCount(page)).toHaveText('175 dishes and drinks')

  await groups(page).getByRole('button', { name: 'Coffee & Tea' }).click()
  await expect(page).toHaveURL(/\/menu\?group=coffee-tea$/)
  await expect(resultCount(page)).toHaveText('25 drinks')
  await expect(categoryHeadings(page)).toHaveText(['Hot Coffee', 'Cold Coffee', 'Tea Selection'])
  await expect(categories(page).getByRole('button')).toHaveText([
    'Hot Coffee',
    'Cold Coffee',
    'Tea Selection',
  ])

  await categories(page).getByRole('button', { name: 'Cold Coffee' }).click()
  await expect(page).toHaveURL(/\?group=coffee-tea&category=cold-coffee$/)
  await expect(categoryHeadings(page)).toHaveText(['Cold Coffee'])

  // Pressing the pressed category again clears it.
  await categories(page).getByRole('button', { name: 'Cold Coffee' }).click()
  await expect(page).toHaveURL(/\?group=coffee-tea$/)
  await expect(categoryHeadings(page)).toHaveCount(3)

  // The URL alone brings the same view back.
  await page.reload()
  await expect(groups(page).getByRole('button', { name: 'Coffee & Tea' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(resultCount(page)).toHaveText('25 drinks')
})

test('search narrows the list as you type and survives a reload', async ({ page }) => {
  await openMenu(page)
  await searchBox(page).fill('latte')
  await expect(page.getByRole('heading', { level: 3, name: 'Hot Spanish Latte' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Hot Americano' })).toHaveCount(0)
  await expect(resultCount(page)).toHaveText(/^\d+ drinks$/)
  await expect(page).toHaveURL(/\/menu\?q=latte$/)

  await page.reload()
  await expect(searchBox(page)).toHaveValue('latte')
  await expect(page.getByRole('heading', { level: 3, name: 'Hot Spanish Latte' })).toBeVisible()
})

test('empty state says what found nothing and clears the search', async ({ page }) => {
  await openMenu(page)
  await searchBox(page).fill('zzzz')
  await expect(resultCount(page)).toHaveText('No matches')
  await expect(page.getByRole('heading', { level: 2, name: 'No matches for “zzzz”' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Search the whole menu' })).toHaveCount(0)

  // The last "Clear search" is the empty state's (the other is inside the field).
  await page.getByRole('button', { name: 'Clear search' }).last().click()
  await expect(resultCount(page)).toHaveText('175 dishes and drinks')
  await expect(searchBox(page)).toHaveValue('')
  await expect(searchBox(page)).toBeFocused()
})

test('a search that misses in one group can widen to the whole menu', async ({ page }) => {
  await openMenu(page, '/menu?group=desserts&q=latte')
  await expect(
    page.getByRole('heading', { level: 2, name: 'No matches for “latte” in Desserts' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Search the whole menu' }).click()
  await expect(page).toHaveURL(/\/menu\?q=latte$/)
  await expect(page.getByRole('heading', { level: 3, name: 'Hot Spanish Latte' })).toBeVisible()
  await expect(groups(page).getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('/menu#coffee-tea lands on Hot Coffee just below the sticky toolbar', async ({ page }) => {
  await page.goto('/menu#coffee-tea')
  await expect(page.getByRole('heading', { level: 2, name: 'Hot Coffee' })).toBeInViewport()
  await expect(page.locator('#coffee-tea')).toBeFocused()
  // The block's top sits on the toolbar's bottom edge: nothing is hidden under it.
  await expect.poll(() => gapBelowToolbar(page, '#coffee-tea')).toBeGreaterThanOrEqual(-1)
  await expect.poll(() => gapBelowToolbar(page, '#coffee-tea')).toBeLessThanOrEqual(1)
})

test('category anchors work too, and so does the link from the home page', async ({ page }) => {
  await page.goto('/menu#frappes')
  await expect(page.getByRole('heading', { level: 2, name: 'Frappes' })).toBeInViewport()
  await expect.poll(() => gapBelowToolbar(page, '#frappes')).toBeGreaterThanOrEqual(-1)

  await page.goto('/')
  await page.getByRole('link', { name: 'All coffee and tea' }).click()
  await expect(page).toHaveURL(/\/menu#coffee-tea$/)
  await expect(page.getByRole('heading', { level: 2, name: 'Hot Coffee' })).toBeInViewport()
  await expect.poll(() => gapBelowToolbar(page, '#coffee-tea')).toBeGreaterThanOrEqual(-1)
})

test('keyboard: each chip row is one Tab stop, arrows move, Enter and Space filter', async ({
  page,
}) => {
  await openMenu(page)
  await page.locator('main').getByRole('link', { name: 'Order on foodpanda' }).focus()

  await page.keyboard.press('Tab')
  await expect(groups(page).getByRole('button', { name: 'All', exact: true })).toBeFocused()
  for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowRight')
  const coffee = groups(page).getByRole('button', { name: 'Coffee & Tea' })
  await expect(coffee).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(coffee).toHaveAttribute('aria-pressed', 'true')
  await expect(coffee).toBeFocused()
  await expect(resultCount(page)).toHaveText('25 drinks')

  await page.keyboard.press('Tab')
  await expect(categories(page).getByRole('button', { name: 'Hot Coffee' })).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Space')
  const cold = categories(page).getByRole('button', { name: 'Cold Coffee' })
  await expect(cold).toHaveAttribute('aria-pressed', 'true')
  await expect(categoryHeadings(page)).toHaveText(['Cold Coffee'])

  await page.keyboard.press('Tab')
  await expect(searchBox(page)).toBeFocused()
  await page.keyboard.type('spanish')
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['Iced Spanish Latte'])
  await page.keyboard.press('Escape')
  await expect(searchBox(page)).toHaveValue('')

  // Back into the category row: focus returns to the pressed chip, with a visible ring.
  await page.keyboard.press('Shift+Tab')
  await expect(cold).toBeFocused()
  const outline = await cold.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).toBe('solid')
})

test('filters come back after leaving the page and pressing Back', async ({ page }) => {
  await openMenu(page)
  await groups(page).getByRole('button', { name: 'Desserts' }).click()
  await expect(page).toHaveURL(/\/menu\?group=desserts$/)

  await page.getByRole('banner').getByRole('link', { name: 'eddy’s Café, home' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/menu\?group=desserts$/)
  await expect(groups(page).getByRole('button', { name: 'Desserts' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(categoryHeadings(page)).toHaveText(['Live Desserts'])

  // Filter changes replaced the entry instead of adding one, so one more Back leaves the
  // menu (here to the blank page the test started from).
  await page.goBack()
  await expect(page).not.toHaveURL(/\/menu/)
})

test('filtering never moves or resizes the toolbar, and nothing shifts on its own', async ({
  page,
}) => {
  await openMenu(page)
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    const shifts: { value: number; input: boolean }[] = []
    Object.assign(window, { shifts })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number
        hadRecentInput: boolean
      })[]) {
        shifts.push({ value: entry.value, input: entry.hadRecentInput })
      }
    }).observe({ type: 'layout-shift' })
  })

  const before = await toolbar(page).boundingBox()
  const check = async () => {
    const box = await toolbar(page).boundingBox()
    expect(box?.y).toBe(before?.y)
    expect(box?.height).toBe(before?.height)
  }

  for (const name of ['Mains', 'Feasts', 'Cold Drinks', 'All']) {
    await groups(page).getByRole('button', { name, exact: true }).click()
    await expect(groups(page).getByRole('button', { name, exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await check()
  }
  await searchBox(page).fill('zzzz')
  await expect(resultCount(page)).toHaveText('No matches')
  await check()
  await searchBox(page).fill('')
  await expect(resultCount(page)).toHaveText('175 dishes and drinks')
  await check()

  // Let any late shift land, then sum the ones not caused by the clicks and typing.
  await page.waitForTimeout(500)
  const unexpected = await page.evaluate(() =>
    (window as unknown as { shifts: { value: number; input: boolean }[] }).shifts
      .filter((shift) => !shift.input)
      .reduce((total, shift) => total + shift.value, 0),
  )
  expect(unexpected).toBe(0)
})

test('on phones the toolbar moves into the header’s place while it hides', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'phone-375', 'The header only hides below lg')
  await openMenu(page)
  // Scroll down in reading-sized steps (a jump of more than a screen keeps the header).
  for (const y of [400, 800, 1200, 1600]) {
    await page.evaluate((top) => {
      window.scrollTo(0, top)
    }, y)
    await page.waitForTimeout(100)
  }
  await expect(page.locator('header[data-hidden]')).toHaveCount(1)
  await expect.poll(async () => (await toolbar(page).boundingBox())?.y).toBe(0)

  await page.evaluate(() => {
    window.scrollTo(0, 1300)
  })
  await expect(page.locator('header[data-hidden]')).toHaveCount(0)
  await expect.poll(async () => Math.round((await toolbar(page).boundingBox())?.y ?? 0)).toBe(64)
})

test.describe('at 320px', () => {
  test.use({ viewport: { width: 320, height: 640 } })

  test('no horizontal page scroll in any state', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'phone-375', 'One width is enough')
    const states = [
      '/menu',
      '/menu?group=starters',
      '/menu?group=mains&category=steak-house',
      '/menu?q=zzzz',
      '/menu?group=desserts&q=latte',
      '/menu?q=a%20search%20far%20too%20long%20to%20fit%20on%20a%20small%20phone',
      '/menu#coffee-tea',
    ]
    for (const state of states) {
      await openMenu(page, state)
      expect(await horizontalOverflow(page), state).toBeLessThanOrEqual(0)
    }
  })
})

test('menu has no serious or critical axe violations, with results or without', async ({
  page,
}) => {
  for (const state of ['/menu', '/menu?group=desserts&q=latte']) {
    await openMenu(page, state)
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(blocking, state).toEqual([])
  }
})
