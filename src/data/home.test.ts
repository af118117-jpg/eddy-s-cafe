import { describe, expect, it } from 'vitest'
import { groupOf, home } from '@/data'
import { menuCategories, menuItems } from '@/data/menu-items'

describe('menu data', () => {
  it('imported every row from the CSV', () => {
    expect(menuItems).toHaveLength(182)
    expect(menuCategories).toHaveLength(25)
    expect(new Set(menuItems.map((item) => item.id)).size).toBe(menuItems.length)
  })

  it('maps every item to one of the eight groups', () => {
    for (const item of menuItems) expect(groupOf(item)).toBeTruthy()
    expect(menuItems.filter((item) => groupOf(item) === 'feasts')).toHaveLength(4)
  })
})

describe('home content', () => {
  it('has the counts the layout is built for', () => {
    expect(home.signatures.items).toHaveLength(6)
    expect(home.menuPreview.items).toHaveLength(8)
    expect(home.drinks.coffee).toHaveLength(6)
    expect(home.drinks.cold).toHaveLength(6)
    expect(home.gallery.images).toHaveLength(9)
  })

  it('only uses feasts that have a serving size', () => {
    for (const feast of home.feasts.items) {
      expect(groupOf(feast.item)).toBe('feasts')
      expect(feast.serves.min).toBeGreaterThan(0)
    }
  })

  it('never ships a TODO alt text on a real photo', () => {
    const images = [
      home.hero.image,
      home.intro.image,
      home.feasts.image,
      home.drinks.image,
      home.space.image,
      home.visit.mapImage,
      ...home.gallery.images,
    ]
    for (const image of images) {
      if (image.src) expect(image.alt).not.toMatch(/TODO/)
    }
  })
})
