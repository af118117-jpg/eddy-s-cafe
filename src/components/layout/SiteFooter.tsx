import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { cafe, primaryNav } from '@/data'
import { summariseHours } from '@/lib/hours'
import { NavItemLink } from './NavItemLink'
import { Wordmark } from './Wordmark'

const year = new Date().getFullYear()
const hours = summariseHours(cafe.openingHours)

// At least 44px both ways, even for short labels like "Visit".
const listLinkClass = 'inline-flex min-h-control-md min-w-control-md items-center'

function FooterHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-meta text-ink-muted">
      {children}
    </h2>
  )
}

/**
 * Ink surface: text is bg (16.7:1), muted text is cream (12.9:1), link
 * underlines are beige-dark, and the focus ring switches to bg.
 */
export function SiteFooter() {
  return (
    <footer data-surface="ink" className="pt-section pb-12">
      <div className="container-wide grid grid-cols-4 gap-x-gutter-sm gap-y-12 lg:grid-cols-12 lg:gap-x-gutter-lg">
        <div className="col-span-4 lg:col-span-4">
          <Link
            to="/"
            aria-label={`${cafe.name}, home`}
            className="-my-3 inline-flex min-h-control-md items-center text-h2"
          >
            <Wordmark />
          </Link>
        </div>

        <nav
          aria-labelledby="footer-explore"
          className="col-span-2 flex flex-col gap-3 lg:col-span-2"
        >
          <FooterHeading id="footer-explore">Explore</FooterHeading>
          <ul className="-my-2">
            {primaryNav.map((item) => (
              <li key={item.to}>
                <NavItemLink item={item} className={listLinkClass} />
              </li>
            ))}
            <li>
              <a href={cafe.links.foodpanda} className={listLinkClass}>
                <span className="link-draw">Order on foodpanda</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="col-span-2 flex flex-col gap-3 lg:col-span-3">
          <FooterHeading>Visit</FooterHeading>
          <address className="flex flex-col items-start text-small not-italic">
            <p>{cafe.address.street}</p>
            <p>
              {cafe.address.area}, {cafe.address.city}
            </p>
            <Button href={cafe.links.directions} variant="link">
              Get directions
            </Button>
            <Button href={cafe.phone.href} variant="link">
              {cafe.phone.display}
            </Button>
          </address>
        </div>

        <div className="col-span-4 flex flex-col gap-3 sm:col-span-2 lg:col-span-2">
          <FooterHeading>Hours</FooterHeading>
          <dl className="flex flex-col gap-3 text-small">
            {hours.map((group) => (
              <div key={group.days}>
                <dt className="text-ink-muted">{group.days}</dt>
                <dd>{group.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-4 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <FooterHeading>Follow</FooterHeading>
          <ul className="-my-2">
            <li>
              <a href={cafe.links.instagram} className={listLinkClass}>
                <span className="link-draw">Instagram</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-wide mt-16">
        <p className="border-t pt-6 text-small text-ink-muted">
          © {year} {cafe.name}
        </p>
      </div>
    </footer>
  )
}
