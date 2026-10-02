import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/lib/motion'

// Width of the edge fades (spacing-16): a chip under one counts as hidden.
const EDGE_CLEARANCE = 64

function chipsIn(row: HTMLElement): HTMLButtonElement[] {
  return [...row.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')]
}

function moveTarget(key: string, index: number, last: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return Math.min(index + 1, last)
    case 'ArrowLeft':
      return Math.max(index - 1, 0)
    case 'Home':
      return 0
    case 'End':
      return last
    default:
      return null
  }
}

function ScrollButton({ side, onClick }: { side: 'start' | 'end'; onClick: () => void }) {
  return (
    // Mouse-only shortcut: keyboard users move with the arrow keys and touch
    // users swipe, so it is hidden from assistive tech and the Tab order.
    <button
      type="button"
      aria-hidden="true"
      tabIndex={-1}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-10 hidden size-(--spacing-control-md) -translate-y-1/2 items-center justify-center rounded-pill border border-line bg-bg text-fg',
        'transition-colors duration-(--duration-micro) ease-standard hover:border-fg pointer-fine:flex',
        side === 'start' ? 'left-0' : 'right-0',
      )}
    >
      <Icon icon={side === 'start' ? ChevronLeft : ChevronRight} size="sm" />
    </button>
  )
}

interface ChipRowProps {
  /** Accessible name of the row, e.g. "Menu sections". */
  label: string
  /** Chip buttons (aria-pressed). */
  children: ReactNode
  /**
   * Draw the pressed chip's fill as one indicator that slides from chip to
   * chip (use with Chip variant="tab"). Leave off with reduced motion.
   */
  indicator?: boolean
  className?: string
}

/*
 * The sliding indicator is a pill built from three pieces, a left cap, a body
 * and a right cap, so it can change width while moving using only translate
 * and scale: stretching a single pill would squash its round ends.
 */
const indicatorPiece = 'absolute top-0 left-0 h-(--tab-h) bg-fg'

function positionIndicator(indicator: HTMLElement, chip: HTMLElement | undefined) {
  indicator.hidden = !chip
  if (!chip) return
  const cap = chip.offsetHeight / 2
  const x = chip.offsetLeft
  const width = chip.offsetWidth
  const set = (name: string, value: number, unit = 'px') => {
    indicator.style.setProperty(name, `${String(value)}${unit}`)
  }
  set('--tab-y', chip.offsetTop)
  set('--tab-h', chip.offsetHeight)
  set('--tab-cap', cap)
  set('--tab-x', x)
  set('--tab-end-x', x + width - cap)
  // The body overlaps each cap by a pixel so no seam shows while moving.
  set('--tab-body-x', x + cap - 1)
  set('--tab-body-scale', Math.max(width - 2 * cap + 2, 0), '')
}

const pressedChip = (row: HTMLElement) =>
  chipsIn(row).find((chip) => chip.getAttribute('aria-pressed') === 'true')

/**
 * One line of filter chips that scrolls sideways (never wraps, so the toolbar
 * keeps its height), with scroll snap, fades on the edges that hide more
 * chips, and edge buttons for mouse users.
 *
 * Keyboard (ARIA toolbar pattern): the row is one Tab stop, the pressed chip;
 * Left/Right, Home and End move between chips; Enter or Space presses one.
 */
export function ChipRow({ label, children, indicator = false, className }: ChipRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  // Transitions switch on only after the indicator's first placement, so it doesn't fly in.
  const [indicatorReady, setIndicatorReady] = useState(false)
  const lastPressed = useRef<HTMLButtonElement | null>(null)
  const firstChip = useRef<HTMLButtonElement | undefined>(undefined)
  const [overflow, setOverflow] = useState({ start: false, end: false })

  // After every render: set the roving Tab stop (the focused chip, else the pressed one, else the first).
  useLayoutEffect(() => {
    const row = rowRef.current
    if (!row) return
    const chips = chipsIn(row)
    const focused = chips.find((chip) => chip === document.activeElement)
    const stop =
      focused ?? chips.find((chip) => chip.getAttribute('aria-pressed') === 'true') ?? chips[0]
    for (const chip of chips) chip.tabIndex = chip === stop ? 0 : -1
    if (indicatorRef.current) positionIndicator(indicatorRef.current, pressedChip(row))

    // New chips (another group's categories): start from the beginning.
    if (chips[0] !== firstChip.current) {
      firstChip.current = chips[0]
      row.scrollLeft = 0
    }

    // A newly pressed chip that is hidden or under a fade scrolls to the start
    // of the row, where scroll snap would put it anyway.
    const pressed = chips.find((chip) => chip.getAttribute('aria-pressed') === 'true')
    if (!pressed || pressed === lastPressed.current) return
    lastPressed.current = pressed
    const left = pressed.offsetLeft
    const right = left + pressed.offsetWidth
    const fadeStart = row.scrollLeft > 0 ? EDGE_CLEARANCE : 0
    const hidden =
      left < row.scrollLeft + fadeStart || right > row.scrollLeft + row.clientWidth - EDGE_CLEARANCE
    if (hidden) row.scrollLeft = left - (parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0)
  })

  useEffect(() => {
    if (!indicator || indicatorReady) return
    const frame = requestAnimationFrame(() => {
      setIndicatorReady(true)
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  }, [indicator, indicatorReady])

  // Which edges hide more chips (the fades and edge buttons), and the indicator after a resize.
  useEffect(() => {
    const row = rowRef.current
    const content = contentRef.current
    if (!row || !content) return
    let frame = 0
    const measure = () => {
      frame = 0
      if (indicatorRef.current) positionIndicator(indicatorRef.current, pressedChip(row))
      const max = row.scrollWidth - row.clientWidth
      const next = { start: row.scrollLeft > 1, end: row.scrollLeft < max - 1 }
      setOverflow((prev) => (prev.start === next.start && prev.end === next.end ? prev : next))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    schedule()
    row.addEventListener('scroll', schedule, { passive: true })
    // The content box changes width when the chips change; the row when the window does.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(row)
    observer?.observe(content)
    return () => {
      row.removeEventListener('scroll', schedule)
      observer?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const row = rowRef.current
    if (!row) return
    const chips = chipsIn(row)
    const index = chips.findIndex((chip) => chip === document.activeElement)
    if (index === -1) return
    const next = moveTarget(event.key, index, chips.length - 1)
    const target = next === null ? undefined : chips[next]
    if (!target) return
    event.preventDefault()
    for (const chip of chips) chip.tabIndex = chip === target ? 0 : -1
    target.focus()
  }

  const scrollByPage = (direction: 1 | -1) => {
    const row = rowRef.current
    if (!row) return
    row.scrollBy({
      left: direction * row.clientWidth * 0.75,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={rowRef}
        role="toolbar"
        aria-label={label}
        onKeyDown={onKeyDown}
        data-overflow-start={overflow.start || undefined}
        data-overflow-end={overflow.end || undefined}
        className={cn(
          // Bleeds to the screen edges on phones. The vertical padding keeps
          // focus rings inside the scroll box, which would clip them.
          'scroll-fade scrollbar-none relative -mx-(--page-margin) -my-2 snap-x snap-proximity overflow-x-auto overscroll-x-contain',
          'px-(--page-margin) py-2',
          'md:-mx-2 md:px-2',
          // Snapped chips stop just clear of the edge fade (spacing-16), so the previous one peeks through it.
          'scroll-px-16',
        )}
      >
        {indicator && (
          // Before the chips in the DOM, so the chips' labels paint on top of it.
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-0 left-0',
              indicatorReady &&
                '*:transition-[translate,scale] *:duration-(--duration-standard) *:ease-standard',
            )}
          >
            <span
              className={cn(
                indicatorPiece,
                'w-(--tab-cap) translate-x-(--tab-x) translate-y-(--tab-y) rounded-l-pill',
              )}
            />
            <span
              className={cn(
                indicatorPiece,
                'w-px origin-left translate-x-(--tab-body-x) translate-y-(--tab-y) scale-x-(--tab-body-scale)',
              )}
            />
            <span
              className={cn(
                indicatorPiece,
                'w-(--tab-cap) translate-x-(--tab-end-x) translate-y-(--tab-y) rounded-r-pill',
              )}
            />
          </span>
        )}
        <div ref={contentRef} className="flex w-max gap-2 *:snap-start">
          {children}
        </div>
      </div>
      {overflow.start && (
        <ScrollButton
          side="start"
          onClick={() => {
            scrollByPage(-1)
          }}
        />
      )}
      {overflow.end && (
        <ScrollButton
          side="end"
          onClick={() => {
            scrollByPage(1)
          }}
        />
      )}
    </div>
  )
}
