import { act, render, renderHook, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MOTION_CLASS, watchMotionPreference } from '@/lib/motion'
import { useCrossfade } from './useCrossfade'
import { useInView } from './useInView'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** A controllable matchMedia for "(prefers-reduced-motion: reduce)". */
function mockReducedMotion(initial: boolean) {
  let matches = initial
  const listeners = new Set<() => void>()
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return matches
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }))
  return (next: boolean) => {
    matches = next
    for (const listener of listeners) listener()
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.classList.remove(MOTION_CLASS)
})

describe('watchMotionPreference', () => {
  it('adds js-motion only while reduced motion is off, and follows changes', () => {
    const setReduced = mockReducedMotion(false)
    watchMotionPreference()
    expect(document.documentElement).toHaveClass(MOTION_CLASS)
    setReduced(true)
    expect(document.documentElement).not.toHaveClass(MOTION_CLASS)
    setReduced(false)
    expect(document.documentElement).toHaveClass(MOTION_CLASS)
  })

  it('never adds it when reduced motion is on from the start', () => {
    mockReducedMotion(true)
    watchMotionPreference()
    expect(document.documentElement).not.toHaveClass(MOTION_CLASS)
  })
})

describe('usePrefersReducedMotion', () => {
  it('reports the setting and updates when it changes', () => {
    const setReduced = mockReducedMotion(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    act(() => {
      setReduced(true)
    })
    expect(result.current).toBe(true)
  })
})

describe('useInView', () => {
  let callback: IntersectionObserverCallback = () => undefined
  const disconnect = vi.fn()
  const observe = vi.fn()
  let options: IntersectionObserverInit | undefined

  beforeEach(() => {
    disconnect.mockClear()
    observe.mockClear()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
          callback = cb
          options = init
        }
        observe = observe
        disconnect = disconnect
      },
    )
  })

  function Probe({ rootMargin }: { rootMargin?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { rootMargin })
    return <div ref={ref}>{inView ? 'in' : 'out'}</div>
  }

  const fire = (isIntersecting: boolean) => {
    act(() => {
      callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
  }

  it('turns true on the first intersection, stays true, and stops observing', () => {
    render(<Probe rootMargin="0px 0px -10% 0px" />)
    expect(screen.getByText('out')).toBeInTheDocument()
    expect(observe).toHaveBeenCalledTimes(1)
    expect(options?.rootMargin).toBe('0px 0px -10% 0px')

    fire(false)
    expect(screen.getByText('out')).toBeInTheDocument()
    fire(true)
    expect(screen.getByText('in')).toBeInTheDocument()
    expect(disconnect).toHaveBeenCalled()
    fire(false)
    expect(screen.getByText('in')).toBeInTheDocument()
  })

  it('is true straight away without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    render(<Probe />)
    expect(screen.getByText('in')).toBeInTheDocument()
  })
})

describe('useCrossfade', () => {
  function setup() {
    const animate = vi.fn()
    const hook = renderHook(() => {
      const [key, setKey] = useState('a')
      const fallback = useRef<HTMLDivElement | null>(null)
      if (!fallback.current) {
        const element = document.createElement('div')
        element.animate = animate
        fallback.current = element
      }
      return { run: useCrossfade(key, fallback), setKey }
    })
    return { ...hook, animate }
  }

  it('changes state instantly when motion is off', () => {
    const { result, animate } = setup()
    const update = vi.fn()
    result.current.run(update)
    expect(update).toHaveBeenCalledTimes(1)
    expect(animate).not.toHaveBeenCalled()
  })

  it('fades the results in after the change where view transitions are missing', () => {
    document.documentElement.classList.add(MOTION_CLASS)
    const { result, animate } = setup()
    act(() => {
      result.current.run(() => {
        result.current.setKey('b')
      })
    })
    expect(animate).toHaveBeenCalledTimes(1)
    expect(animate.mock.calls[0]?.[0]).toEqual([{ opacity: 0 }, { opacity: 1 }])
  })

  it('runs the change inside a view transition that ends when React commits it', async () => {
    document.documentElement.classList.add(MOTION_CLASS)
    let updateDone: Promise<void> | undefined
    const startViewTransition = vi.fn((update: () => Promise<void>) => {
      updateDone = update()
      return { ready: Promise.resolve() }
    })
    Object.assign(document, { startViewTransition })

    const { result, animate } = setup()
    let settled = false
    act(() => {
      result.current.run(() => {
        result.current.setKey('b')
      })
    })
    void updateDone?.then(() => {
      settled = true
    })
    await act(async () => {
      await updateDone
    })
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(settled).toBe(true)
    expect(animate).not.toHaveBeenCalled()
    Reflect.deleteProperty(document, 'startViewTransition')
  })
})
