import { describe, expect, it } from 'vitest'
import { dishImage, groupOf, home, type ImageAsset } from '@/data'
import { dishAlts, dishPhotos } from '@/data/dish-photos'
import { galleryAlts } from '@/data/home'
import { menuCategories, menuItems } from '@/data/menu-items'
import { heroImage } from '@/lib/heroImage'

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

  it('has a photo with written alt text in every slot, the hero and the map included', () => {
    const images: ImageAsset[] = [
      home.hero.image,
      home.intro.image,
      home.feasts.image,
      home.drinks.image,
      home.space.image,
      home.visit.mapImage,
      ...home.gallery.images,
    ]
    for (const image of images) {
      expect(image.picture).toBeDefined()
      expect(image.alt.length, image.alt).toBeGreaterThan(10)
      expect(image.alt).not.toMatch(/TODO/)
    }
  })

  it('has alt text written for every gallery and dish photo file', () => {
    expect(Object.keys(galleryAlts)).toHaveLength(home.gallery.images.length)
    expect(Object.keys(dishPhotos).length).toBeGreaterThan(0)
    for (const id of Object.keys(dishPhotos)) expect(dishAlts[id], id).toBeTruthy()
    for (const signature of home.signatures.items) {
      expect(dishImage(signature.item).alt).toBe(dishAlts[signature.item.id])
    }
  })

  it('crops the hero 4:5 below 768px and 16:9 above, in every format and width', () => {
    const { picture, art } = home.hero.image
    expect(art.media).toBe(heroImage.wideMedia)
    for (const crop of [picture, art.picture]) {
      expect(Object.keys(crop.sources).sort()).toEqual(['avif', 'jpeg', 'webp'])
      const widths = crop.sources.avif?.split(', ').map((entry) => entry.split(' ')[1])
      expect(widths).toEqual(['480w', '800w', '1200w', '1600w', '2400w'])
    }
    expect(picture.img.w / picture.img.h).toBeCloseTo(4 / 5)
    expect(art.picture.img.w / art.picture.img.h).toBeCloseTo(16 / 9, 2)
  })
})
