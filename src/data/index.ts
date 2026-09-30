// The full menu isn't re-exported here on purpose: import it from
// '@/data/menu-items' only where every item is needed.
export { cafe } from './cafe'
export type { Cafe, ContactLink, DayHours, DayName } from './cafe'
export { home } from './home'
export type { Feast, Signature } from './home'
export type { ImageAsset } from './images'
export { categoryGroup, feastServes, groupLabel, groupOf, menuGroups } from './menu'
export type { MenuCategory, MenuGroup, MenuGroupId, MenuItem, Serves } from './menu'
export { menuPage } from './menu-page'
export { primaryNav } from './navigation'
export type { NavItem } from './navigation'
