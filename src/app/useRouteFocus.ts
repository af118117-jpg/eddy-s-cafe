import { useEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'
import { MAIN_ID } from '@/components/layout'

/**
 * After a client-side page change, moves focus to the new page's h1 (or main)
 * so screen readers announce it and Tab starts from the page, not the old link.
 * Skipped on the first page load, for #hash links (ScrollToHash handles those)
 * and for query-only updates of the same page (menu filters), where focus must
 * stay in the control being used.
 */
export function useRouteFocus() {
  const { key, hash, pathname } = useLocation()
  const navigationType = useNavigationType()
  // Compare keys rather than counting renders: StrictMode runs effects twice.
  const initialKey = useRef(key)
  const currentPath = useRef(pathname)

  useEffect(() => {
    const samePage = navigationType === NavigationType.Replace && pathname === currentPath.current
    currentPath.current = pathname
    if (key === initialKey.current || hash || samePage) return
    const main = document.getElementById(MAIN_ID)
    const target = main?.querySelector<HTMLElement>('h1') ?? main
    if (!target) return
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [key, hash, pathname, navigationType])
}
