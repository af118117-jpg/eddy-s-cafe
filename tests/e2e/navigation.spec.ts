import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Breakpoints from tokens.css: mobile nav below lg, action bar below md.
const LG = 1024
const MD = 768

function width(page: Page): number {
  return page.viewportSize()?.width ?? 0
}

/** Name and focus-ring details of the focused element. */
async function focused(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return null
    const style = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    return {
      name: (el.getAttribute('aria-label') ?? el.textContent).trim(),
      inDialog: !!el.closest('[role="dialog"]'),
      inFooter: !!el.closest('footer'),
      outline: `${style.outlineStyle} ${style.outlineWidth}`,
      outlineColor: style.outlineColor,
      visible:
        rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight,
    }
  })
}

async function tabTo(page: Page, name: string, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab')
    if ((await focused(page))?.name === name) return
  }
  throw new Error(`Could not reach "${name}" with Tab`)
}

test('skip link is the first stop and moves focus to main', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const first = await focused(page)
  expect(first?.name).toBe('Skip to content')
  expect(first?.visible).toBe(true)
  await page.keyboard.press('Enter')
  await expect(page.locator('main#main')).toBeFocused()
})

test('header controls are reachable in order with a visible ring', async ({ page }) => {
  await page.goto('/')
  const expected =
    width(page) >= LG
      ? [
          'Skip to content',
          'Order on foodpanda',
          'Dismiss announcement',
          'eddy’s Café, home',
          'Menu',
          'Feasts',
          'Coffee',
          'Visit',
          'Call eddy’s Café',
        ]
      : [
          'Skip to content',
          'Order on foodpanda',
          'Dismiss announcement',
          'eddy’s Café, home',
          'Call eddy’s Café',
          'Navigation',
        ]

  for (const name of expected) {
    await page.keyboard.press('Tab')
    const current = await focused(page)
    expect(current?.name).toBe(name)
    expect(current?.visible).toBe(true)
    expect(current?.outline).toBe('solid 2px')
  }
})

test('mobile nav: opens, traps focus, closes on Esc and returns focus', async ({ page }) => {
  test.skip(width(page) >= LG, 'Mobile nav is only shown below 1024px')
  await page.goto('/')
  await tabTo(page, 'Navigation')
  const trigger = page.getByRole('button', { name: 'Navigation', exact: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Navigation' })
  await expect(dialog).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(dialog.getByRole('button', { name: 'Close navigation' })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden')
  await expect(page.getByRole('navigation', { name: 'Quick actions' })).toHaveCount(0)

  // Tab and Shift+Tab both stay inside the dialog.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    expect((await focused(page))?.inDialog).toBe(true)
  }
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Shift+Tab')
    expect((await focused(page))?.inDialog).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('')
})

test('mobile nav: following a section link lands on the section', async ({ page }) => {
  test.skip(width(page) >= LG, 'Mobile nav is only shown below 1024px')
  await page.goto('/menu')
  await page.getByRole('button', { name: 'Navigation', exact: true }).focus()
  await page.keyboard.press('Enter')
  await tabTo(page, 'Visit')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/#visit$/)
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#visit')).toBeFocused()
  await expect(page.locator('#visit')).toBeInViewport()
})

test('header section link works from another page', async ({ page }) => {
  test.skip(width(page) < LG, 'Desktop nav is only shown from 1024px')
  await page.goto('/menu')
  await tabTo(page, 'Visit')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/#visit$/)
  await expect(page.locator('#visit')).toBeFocused()
  await expect(page.locator('#visit')).toBeInViewport()
})

test('footer links are all reachable with a light focus ring', async ({ page }) => {
  await page.goto('/')
  // Tab until focus enters the footer, then walk through it.
  let current = await focused(page)
  for (let i = 0; i < 40 && !current?.inFooter; i++) {
    await page.keyboard.press('Tab')
    current = await focused(page)
  }
  const names: string[] = []
  while (current?.inFooter) {
    names.push(current.name)
    expect(current.visible).toBe(true)
    expect(current.outline).toBe('solid 2px')
    // bg on ink: the accent ring would only be 2.7:1 there.
    expect(current.outlineColor).toBe('rgb(253, 253, 252)')
    await page.keyboard.press('Tab')
    current = await focused(page)
  }
  expect(names).toEqual([
    'eddy’s Café, home',
    'Menu',
    'Feasts',
    'Coffee',
    'Visit',
    'Order on foodpanda',
    'Get directions',
    '+92 304 1112111',
    'Instagram',
  ])
})

test('no horizontal scroll on any page', async ({ page }) => {
  for (const path of ['/', '/menu', '/not-a-page']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    // Negative just means the scrollbar gutter is wider than the content.
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(0)
  }
})

test('header turns solid after 24px; hides on scroll down only on mobile', async ({ page }) => {
  await page.goto('/')
  const header = page.getByRole('banner')
  await expect(header).toHaveAttribute('data-state', 'overlay')
  await page.evaluate(() => {
    window.scrollTo(0, 40)
  })
  await expect(header).toHaveAttribute('data-state', 'solid')

  await page.evaluate(() => {
    window.scrollTo(0, 640)
  })
  if (width(page) < LG) {
    await expect(header).toHaveAttribute('data-hidden', 'true')
    await page.evaluate(() => {
      window.scrollTo(0, 520)
    })
    await expect(header).not.toHaveAttribute('data-hidden')
  } else {
    await page.waitForTimeout(300)
    await expect(header).not.toHaveAttribute('data-hidden')
  }
})

test('mobile action bar shows below 768px only', async ({ page }) => {
  await page.goto('/')
  const bar = page.getByRole('navigation', { name: 'Quick actions' })
  if (width(page) < MD) {
    await expect(bar).toBeVisible()
    await expect(bar.getByRole('link')).toHaveText(['Menu', 'Call', 'Directions'])
  } else {
    await expect(bar).toBeHidden()
  }
})

test('dismissed announcement stays dismissed after reload', async ({ page }) => {
  await page.goto('/')
  await tabTo(page, 'Dismiss announcement')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0)
  await expect(page.locator('#home-link')).toBeFocused()
  await page.reload()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0)
})

test('new pages start at the top; back restores the scroll position', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.scrollTo(0, 900)
  })
  await page.waitForFunction(() => window.scrollY > 800)
  const before = await page.evaluate(() => window.scrollY)

  // dispatchEvent: a real click() would first scroll the footer link into view.
  await page.getByRole('contentinfo').getByRole('link', { name: 'Menu' }).dispatchEvent('click')
  await expect(page.getByRole('heading', { level: 1, name: 'Menu' })).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  await page.goBack()
  await expect(page.getByRole('heading', { level: 1, name: 'eddy’s Café' })).toBeAttached()
  await page.waitForFunction((y) => Math.abs(window.scrollY - y) < 2, before)
})

test('no serious or critical axe violations', async ({ page }) => {
  const scan = async (label: string) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(
      blocking.map((v) => `${v.id}: ${v.help}`),
      label,
    ).toEqual([])
  }
  await page.goto('/')
  await scan('home')
  await page.goto('/menu')
  await page.getByRole('heading', { level: 1, name: 'Menu' }).waitFor()
  await scan('menu')
  if (width(page) < LG) {
    await page.getByRole('button', { name: 'Navigation', exact: true }).click()
    await page.getByRole('dialog').waitFor()
    await scan('mobile nav open')
  }
})
