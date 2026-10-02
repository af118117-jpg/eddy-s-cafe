import { MapPin, Menu as MenuIcon, Phone, X } from 'lucide-react'
import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Button, Icon } from '@/components/ui'
import { cafe, primaryNav } from '@/data'
import { cn } from '@/lib/cn'
import { NavItemLink } from './NavItemLink'
import { Wordmark } from './Wordmark'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const iconButtonClass =
  'inline-flex size-(--spacing-control-md) shrink-0 items-center justify-center rounded-pill transition-colors duration-(--duration-micro) ease-standard hover:bg-fg hover:text-fg-inverse'

interface MobileNavProps {
  open: boolean
  onOpen: () => void
  onClose: () => void
  className?: string
}

/**
 * Hamburger trigger plus a full-screen navigation dialog (below lg).
 * While open: the rest of the app is inert, page scroll is locked, Tab wraps
 * inside the panel and Esc closes it. Focus returns to the trigger when the
 * panel is closed with Esc or the close button; following a link lets the
 * new page take focus instead.
 */
export function MobileNav({ open, onOpen, onClose, className }: MobileNavProps) {
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef(false)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const appRoot = document.getElementById('root')
    const html = document.documentElement
    const previousOverflow = html.style.overflow

    html.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true
    closeRef.current?.focus()

    return () => {
      html.style.overflow = previousOverflow
      if (appRoot) appRoot.inert = false
      if (returnFocus.current) trigger?.focus()
      returnFocus.current = false
    }
  }, [open])

  const closeAndReturnFocus = () => {
    returnFocus.current = true
    onClose()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      closeAndReturnFocus()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const address = `${cafe.address.street}, ${cafe.address.area}, ${cafe.address.city}`

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Navigation"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onOpen}
        className={cn(iconButtonClass, className)}
      >
        <Icon icon={MenuIcon} size="md" />
      </button>

      {createPortal(
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          hidden={!open}
          onKeyDown={onKeyDown}
          data-motion
          className={cn(
            'fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-bg text-fg lg:hidden',
            // Opens with a fade and an 8px drop over 250ms.
            'transition-[opacity,translate] duration-(--duration-standard) ease-standard starting:-translate-y-2 starting:opacity-0',
          )}
        >
          <div className="container-wide flex h-(--header-height) shrink-0 items-center justify-between gap-4">
            <Link
              to="/"
              aria-label={`${cafe.name}, home`}
              className="inline-flex min-h-control-md items-center text-h3"
            >
              <Wordmark />
            </Link>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close navigation"
              onClick={closeAndReturnFocus}
              className={cn(iconButtonClass, '-mr-3')}
            >
              <Icon icon={X} size="md" />
            </button>
          </div>

          <nav aria-label="Main" className="container-wide flex-1 pt-8">
            <ul className="border-t">
              {primaryNav.map((item) => (
                <li key={item.to} className="border-b">
                  <NavItemLink
                    item={item}
                    className="flex min-h-control-lg items-center py-3 text-h2 decoration-1 underline-offset-8 hover:underline aria-[current=page]:underline"
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="container-wide flex flex-col gap-6 pt-12 pb-[calc(var(--spacing-8)+env(safe-area-inset-bottom))]">
            <p className="text-small text-ink-muted">{address}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                href={cafe.phone.href}
                size="lg"
                icon={Phone}
                iconPosition="start"
                aria-label={`Call ${cafe.name}`}
              >
                Call
              </Button>
              <Button
                href={cafe.links.directions}
                variant="secondary"
                size="lg"
                icon={MapPin}
                iconPosition="start"
              >
                Directions
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
