import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { MAIN_ID } from '@/components/layout'

/**
 * After a client-side page change, moves focus to the new page's h1 (or main)
 * so screen readers announce it and Tab starts from the page, not the old link.
 * Skipped on the first page load and for #hash links (ScrollToHash handles those).
 */
export function useRouteFocus() {
  const { key, hash } = useLocation()
  // Compare keys rather than counting renders: StrictMode runs effects twice.
  const initialKey = useRef(key)

  useEffect(() => {
    if (key === initialKey.current || hash) return
    const main = document.getElementById(MAIN_ID)
    const target = main?.querySelector<HTMLElement>('h1') ?? main
    if (!target) return
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [key, hash])
}
