/*
 * Restaurant structured data (schema.org JSON-LD) for the home page. The
 * build writes it into index.html (vite.config.ts), so crawlers read it
 * without running the app. The Vite config loads this file: relative imports
 * with their extensions only.
 * Every value comes from src/data/cafe.ts and site.ts.
 */
import { cafe } from '../data/cafe.ts'
import { ogImage, siteUrl } from '../data/site.ts'
import { groupHours } from './hours.ts'

export function restaurantSchema() {
  const { address, coordinates, links } = cafe
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${siteUrl}/#restaurant`,
    name: cafe.name,
    url: `${siteUrl}/`,
    image: `${siteUrl}${ogImage.path}`,
    telephone: cafe.phone.display,
    priceRange: cafe.priceRange,
    servesCuisine: [...cafe.cuisines],
    menu: `${siteUrl}/menu`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${address.street}, ${address.area}`,
      addressLocality: address.city,
      postalCode: address.postcode,
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    },
    // One entry per run of days with the same hours. A closing time earlier
    // than the opening time means after midnight, which is how schema.org and
    // Google read it ("11:00" to "01:00").
    openingHoursSpecification: groupHours(cafe.openingHours).map(({ days }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.map((day) => day.day),
      opens: days[0]?.opens,
      closes: days[0]?.closes,
    })),
    // The Instagram profile is still unverified (see cafe.ts); confirm before launch.
    sameAs: [links.googleMaps, links.foodpanda, links.facebook, links.instagram],
  }
}

/** The schema as the text of a <script type="application/ld+json">, safe to inline in HTML. */
export function restaurantSchemaScript(): string {
  return JSON.stringify(restaurantSchema()).replace(/</g, '\\u003c')
}
