import { describe, expect, it } from 'vitest'
import { feastServes, menuGroups } from './menu'
import { menuItems } from './menu-items'
import { menuSections, spicyDishes } from './menu-sections'

const entries = menuSections.flatMap((section) => section.entries)

describe('menu sections', () => {
  it('shows every item exactly once', () => {
    const shown = entries.flatMap((entry) => entry.itemIds)
    expect(shown).toHaveLength(menuItems.length)
    expect(new Set(shown)).toEqual(new Set(menuItems.map((item) => item.id)))
  })

  it('merges the seven Chicken/Beef steaks into one row each', () => {
    expect(entries).toHaveLength(menuItems.length - 7)
    const steaks = menuSections.find((section) => section.id === 'steak-house')?.entries ?? []
    expect(steaks.map((entry) => entry.name)).toEqual([
      'Spicy Moroccan Steak',
      'Jalapaeno Steak', // as published
      'Mexican Steak',
      'Americano Steak',
      'Black Pepper Cheese Steak',
      'Italian Mushroom Steak',
      'Teragon Steak', // "Teragon Steak (Chicken)" / "(Beef)" at source
    ])
    for (const steak of steaks) {
      expect(steak.prices).toEqual([
        { amount: 1999, from: undefined, label: 'Chicken' },
        { amount: 2949, from: undefined, label: 'Beef' },
      ])
    }
  })

  it('does not merge different dishes that share a description', () => {
    const pasta = menuSections.find((section) => section.id === 'pasta')?.entries ?? []
    expect(pasta.map((entry) => entry.name)).toContain('Beef Lasagna Pasta')
    expect(pasta.every((entry) => entry.prices.length === 1)).toBe(true)
  })

  it('puts the four platters in Feasts with their serving sizes', () => {
    const feasts = menuSections.filter((section) => section.group === 'feasts')
    expect(feasts.map((section) => section.id)).toEqual(['sharing-platters'])
    const platters = feasts[0]?.entries ?? []
    expect(platters.map((entry) => entry.id).sort()).toEqual(Object.keys(feastServes).sort())
    for (const platter of platters) {
      expect(platter.tags).toContainEqual({ kind: 'serves', serves: feastServes[platter.id] })
    }
    const middleEasternMain = menuSections.find((s) => s.id === 'middle-eastern-main')
    expect(middleEasternMain?.entries.some((entry) => entry.id in feastServes)).toBe(false)
  })

  it('tags dishes the menu calls spicy, and knows about every other mention', () => {
    // Items that only mention a spicy side or dip (see spicyDishes in menu-sections.ts).
    const sideOnly = [
      'chicken-butter-milk-burger',
      'stuff-chicken-fingers',
      'hunter-beef-and-egg-sando',
    ]
    for (const item of menuItems) {
      if (!/\bspicy\b/i.test(`${item.name} ${item.description}`)) continue
      expect(spicyDishes.has(item.id) || sideOnly.includes(item.id), item.id).toBe(true)
    }
    for (const id of spicyDishes)
      expect(
        menuItems.some((item) => item.id === id),
        id,
      ).toBe(true)

    const spicy = entries.filter((entry) => entry.tags.some((tag) => tag.kind === 'spicy'))
    expect(spicy.map((entry) => entry.name)).toContain('Spicy Moroccan Steak')
    expect(spicy).toHaveLength(spicyDishes.size - 1) // the two Moroccan steaks share a row
  })

  it('has unique, URL-safe anchors that never clash with the group anchors', () => {
    const ids = menuSections.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    for (const group of menuGroups) expect(ids).not.toContain(group.id)
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length)
  })

  it('lists sections in group order', () => {
    const order = menuGroups.map((group) => group.id)
    const groups = menuSections.map((section) => order.indexOf(section.group))
    expect(groups).toEqual([...groups].sort((a, b) => a - b))
    expect(new Set(menuSections.map((section) => section.group)).size).toBe(menuGroups.length)
  })
})
