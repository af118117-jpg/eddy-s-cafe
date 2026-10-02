import { describe, expect, it } from 'vitest'
import robots from '../../public/robots.txt?raw'
import sitemap from '../../public/sitemap.xml?raw'
import { cafe } from '@/data/cafe'
import { pageMeta, siteUrl } from '@/data/site'
import { restaurantSchema, restaurantSchemaScript } from './schema'

describe('Restaurant JSON-LD', () => {
  const schema = restaurantSchema()

  it('has the properties Google uses for a restaurant, from the café data', () => {
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Restaurant')
    expect(schema.name).toBe(cafe.name)
    expect(schema.telephone).toBe(cafe.phone.display)
    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '77 Green Avenue West, Canal Road',
      addressLocality: 'Faisalabad',
      postalCode: '38000',
      addressCountry: 'PK',
    })
    expect(schema.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: cafe.coordinates.lat,
      longitude: cafe.coordinates.lng,
    })
    expect(schema.servesCuisine.length).toBeGreaterThan(0)
    expect(schema.priceRange).toBe(cafe.priceRange)
  })

  it('lists every day once, with the hours from the café data', () => {
    const days = schema.openingHoursSpecification.flatMap((spec) => spec.dayOfWeek)
    expect(days).toEqual(cafe.openingHours.map((day) => day.day))
    for (const spec of schema.openingHoursSpecification) {
      expect(spec['@type']).toBe('OpeningHoursSpecification')
      expect(spec.opens).toMatch(/^\d\d:\d\d$/)
      expect(spec.closes).toMatch(/^\d\d:\d\d$/)
      for (const day of spec.dayOfWeek) {
        const hours = cafe.openingHours.find((entry) => entry.day === day)
        expect([spec.opens, spec.closes]).toEqual([hours?.opens, hours?.closes])
      }
    }
  })

  it('only links to absolute https URLs, with the menu page as the menu', () => {
    for (const url of [schema.url, schema.image, schema.menu, ...schema.sameAs]) {
      expect(url).toMatch(/^https:\/\//)
    }
    expect(schema.menu).toBe(`${siteUrl}${pageMeta.menu.path}`)
  })

  it('inlines safely in a <script> element', () => {
    const script = restaurantSchemaScript()
    expect(script).not.toContain('<')
    expect(JSON.parse(script)).toEqual(schema)
  })
})

describe('site address', () => {
  it('is the same in site.ts, robots.txt and sitemap.xml', () => {
    expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`)
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
    expect(locs).toEqual([`${siteUrl}${pageMeta.home.path}`, `${siteUrl}${pageMeta.menu.path}`])
  })

  it('gives every page a distinct title and a description of search-result length', () => {
    const pages = Object.values(pageMeta)
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length)
    for (const page of pages) {
      expect(page.description.length).toBeGreaterThan(50)
      expect(page.description.length).toBeLessThanOrEqual(160)
    }
  })
})
