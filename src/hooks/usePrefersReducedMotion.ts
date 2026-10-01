import { useSyncExternalStore } from 'react'
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '@/lib/motion'

function subscribe(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => undefined
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

/** Whether the visitor asked for reduced motion; updates if they change the setting. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}
