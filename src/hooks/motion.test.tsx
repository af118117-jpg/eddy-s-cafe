import { act, render, renderHook, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Photo, Reveal } from '@/components/ui'
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

  describe('with a fallback', () => {
    function Fallback() {
      const ref = useRef<HTMLDivElement>(null)
      const inView = useInView(ref, { fallbackMs: 1500 })
      return <div ref={ref}>{inView ? 'in' : 'out'}</div>
    }
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('turns true if the observer never reports, so nothing stays hidden', () => {
      render(<Fallback />)
      act(() => {
        vi.advanceTimersByTime(1499)
      })
      expect(screen.getByText('out')).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByText('in')).toBeInTheDocument()
    })

    it('waits for the reader once the observer has reported', () => {
      render(<Fallback />)
      fire(false)
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.getByText('out')).toBeInTheDocument()
    })
  })
})

describe('Reveal', () => {
  /** Each observer Reveal creates, by its rootMargin, so a test can report to one. */
  const observers = new Map<string, IntersectionObserverCallback>()
  beforeEach(() => {
    observers.clear()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
          observers.set(init?.rootMargin ?? '', cb)
        }
        observe = vi.fn()
        disconnect = vi.fn()
      },
    )
  })
  const report = (rootMargin: string, isIntersecting: boolean) => {
    act(() => {
      observers.get(rootMargin)?.(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
  }
  const picture = {
    sources: { avif: '/a-480.avif 480w', webp: '/a-480.webp 480w', jpeg: '/a-480.jpg 480w' },
    img: { src: '/a-480.jpg', w: 480, h: 600 },
  }

  it('loads its photo a screen ahead, while it is still hidden, then reveals it', async () => {
    const { container } = render(
      <Reveal>
        <Photo image={{ alt: 'A dish', picture }} ratio="dish" sizes="100vw" />
      </Reveal>,
    )
    const wrapper = container.querySelector('[data-reveal]')
    const img = await screen.findByRole('img', { name: 'A dish' })
    expect(observers.size).toBe(2)
    report('0px 0px -10% 0px', false)
    report('100% 0px', false)
    expect(img).toHaveAttribute('loading', 'lazy')

    // A screen away: the clip-path still hides it, so the browser's lazy loading wouldn't start.
    report('100% 0px', true)
    expect(img).toHaveAttribute('loading', 'eager')
    expect(wrapper).toHaveAttribute('data-reveal', 'hidden')

    report('0px 0px -10% 0px', true)
    expect(wrapper).toHaveAttribute('data-reveal', 'shown')
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
