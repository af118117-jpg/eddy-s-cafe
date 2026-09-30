import type { LucideIcon } from 'lucide-react'
import { MapPin, Phone, UtensilsCrossed } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui'
import { cafe } from '@/data'

const itemClass =
  'flex min-h-control-lg flex-col items-center justify-center gap-1 text-meta transition-colors duration-(--duration-micro) ease-standard hover:bg-cream aria-[current=page]:underline aria-[current=page]:underline-offset-4'

function ItemContent({ icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <>
      <Icon icon={icon} size="md" />
      {children}
    </>
  )
}

/** Sticky bottom bar with the three things phone visitors want most (below md). */
export function MobileActionBar() {
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-bg pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-3">
        <li>
          <NavLink to="/menu" end className={itemClass}>
            <ItemContent icon={UtensilsCrossed}>Menu</ItemContent>
          </NavLink>
        </li>
        <li>
          <a href={cafe.phone.href} aria-label={`Call ${cafe.name}`} className={itemClass}>
            <ItemContent icon={Phone}>Call</ItemContent>
          </a>
        </li>
        <li>
          <a href={cafe.links.directions} className={itemClass}>
            <ItemContent icon={MapPin}>Directions</ItemContent>
          </a>
        </li>
      </ul>
    </nav>
  )
}
