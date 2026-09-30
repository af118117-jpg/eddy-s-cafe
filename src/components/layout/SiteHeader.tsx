import { Phone } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { cafe, primaryNav } from '@/data'
import { useHideOnScroll } from '@/hooks'
import { cn } from '@/lib/cn'
import { MobileNav } from './MobileNav'
import { NavItemLink } from './NavItemLink'
import { Wordmark } from './Wordmark'

export const HOME_LINK_ID = 'home-link'

interface SiteHeaderProps {
  /** Transparent with light text, for sitting over a full-bleed hero photo. */
  overlay: boolean
  /** Hide on scroll down, show on scroll up (mobile layout only). */
  hideOnScroll: boolean
  navOpen: boolean
  onNavOpen: () => void
  onNavClose: () => void
}

export function SiteHeader({
  overlay,
  hideOnScroll,
  navOpen,
  onNavOpen,
  onNavClose,
}: SiteHeaderProps) {
  const ref = useRef<HTMLElement>(null)
  const { hidden, reveal } = useHideOnScroll(ref, hideOnScroll)

  return (
    <header
      ref={ref}
      // Over the hero the header uses the ink surface colours (light text,
      // light focus ring) on a transparent background.
      data-surface={overlay ? 'ink' : undefined}
      data-state={overlay ? 'overlay' : 'solid'}
      data-hidden={hidden || undefined}
      // Keyboard focus landing in a hidden header brings it back.
      onFocus={reveal}
      className={cn(
        'sticky top-0 z-30 border-b',
        'transition-[background-color,border-color,color,translate] duration-(--duration-standard) ease-standard',
        overlay ? 'border-transparent bg-transparent' : 'border-line bg-bg',
        hidden && '-translate-y-full',
      )}
    >
      <div className="container-wide flex h-(--header-height) items-center gap-6">
        <Link
          id={HOME_LINK_ID}
          to="/"
          aria-label={`${cafe.name}, home`}
          className="inline-flex min-h-control-md items-center text-h3"
        >
          <Wordmark />
        </Link>

        <div className="ml-auto flex items-center gap-2 lg:gap-8">
          <nav aria-label="Main" className="max-lg:hidden">
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => (
                <li key={item.to}>
                  <NavItemLink
                    item={item}
                    className="inline-flex min-h-control-md items-center text-nav decoration-1 underline-offset-4 hover:underline aria-[current=page]:underline"
                  />
                </li>
              ))}
            </ul>
          </nav>
          <Button
            href={cafe.phone.href}
            variant="secondary"
            icon={Phone}
            iconPosition="start"
            aria-label={`Call ${cafe.name}`}
          >
            Call
          </Button>
          <MobileNav
            open={navOpen}
            onOpen={onNavOpen}
            onClose={onNavClose}
            className="-mr-3 lg:hidden"
          />
        </div>
      </div>
    </header>
  )
}
