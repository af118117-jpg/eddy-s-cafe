export interface NavItem {
  label: string
  to: string
}

/**
 * Site navigation. The home page must keep these section ids:
 * #feasts, #coffee, #visit.
 */
export const primaryNav: readonly NavItem[] = [
  { label: 'Menu', to: '/menu' },
  { label: 'Feasts', to: '/#feasts' },
  { label: 'Coffee', to: '/#coffee' },
  { label: 'Visit', to: '/#visit' },
]
