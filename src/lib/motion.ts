export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** The `js-motion` class on <html> switches on every hide-before-reveal style. */
export const MOTION_CLASS = 'js-motion'

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/**
 * Adds `js-motion` to <html> while reduced motion is off, and keeps it in step
 * if the setting changes. Without JavaScript, or with reduced motion on, the
 * class is never there, so all content stays visible and still.
 */
export function watchMotionPreference(root: HTMLElement = document.documentElement): void {
  if (typeof window.matchMedia !== 'function') {
    root.classList.add(MOTION_CLASS)
    return
  }
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  const sync = () => {
    root.classList.toggle(MOTION_CLASS, !query.matches)
  }
  sync()
  query.addEventListener('change', sync)
}

/** True when motion is on: the class is the single switch CSS and scripts both follow. */
export function motionEnabled(): boolean {
  return document.documentElement.classList.contains(MOTION_CLASS)
}

/** A duration token (e.g. "--duration-standard") in milliseconds, for the Web Animations API. */
export function durationToken(name: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const amount = parseFloat(value)
  if (Number.isNaN(amount)) return 0
  return value.endsWith('ms') ? amount : amount * 1000
}

/** The easing token, for the Web Animations API. */
export function easingToken(): string {
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--ease-standard').trim() || 'ease'
  )
}
