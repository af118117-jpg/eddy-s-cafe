/*
 * Café facts — the single source for name, address, phone, hours and links.
 * Source: eddys-cafe-assets/06-Restaurant-Info/restaurant-info.txt (collected 2026-09-28).
 */

export type DayName =
  'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export interface DayHours {
  day: DayName
  /** 24-hour "HH:MM". */
  opens: string
  /** 24-hour "HH:MM"; earlier than `opens` means after midnight. */
  closes: string
}

const coordinates = { lat: 31.4502019, lng: 73.1534366 } as const

export const cafe = {
  name: 'eddy’s Café',
  address: {
    street: '77 Green Avenue West',
    area: 'Canal Road',
    city: 'Faisalabad',
    postcode: '38000',
    country: 'Pakistan',
  },
  phone: {
    display: '+92 304 1112111',
    href: 'tel:+923041112111',
  },
  coordinates,
  /** Google Maps hours (dine-in). foodpanda lists different delivery hours. */
  openingHours: [
    { day: 'Monday', opens: '11:00', closes: '01:00' },
    { day: 'Tuesday', opens: '11:00', closes: '01:00' },
    { day: 'Wednesday', opens: '11:00', closes: '01:00' },
    { day: 'Thursday', opens: '11:00', closes: '01:00' },
    { day: 'Friday', opens: '11:00', closes: '02:00' },
    { day: 'Saturday', opens: '11:00', closes: '02:00' },
    { day: 'Sunday', opens: '11:00', closes: '02:00' },
  ] satisfies readonly DayHours[],
  links: {
    googleMaps:
      'https://www.google.com/maps/place/eddy%27s+Caf%C3%A9/@31.4502019,73.1534366,17z/data=!4m6!3m5!1s0x392269657a686f0d:0x30aa98475c166fe0!8m2!3d31.4502019!4d73.1534366!16s%2Fg%2F11yq8pdwqf',
    directions: `https://www.google.com/maps/dir/?api=1&destination=${String(coordinates.lat)},${String(coordinates.lng)}`,
    foodpanda: 'https://www.foodpanda.pk/restaurant/i9ta/eddys-cafe',
    /** UNVERIFIED: read off an in-store table card; the profile hasn't been opened. */
    instagram: 'https://www.instagram.com/theeddyscafe/',
  },
} as const

export type Cafe = typeof cafe
