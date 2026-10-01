import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { NavItem } from '@/data'

interface NavItemLinkProps {
  item: NavItem
  className?: string
  children?: ReactNode
}

/**
 * Page links get aria-current="page" when active. Links to sections on the
 * home page (/#visit) never do: they are places on a page, not the page.
 */
export function NavItemLink({ item, className, children }: NavItemLinkProps) {
  // The label gets the drawn underline (hover, focus, current page); see link-draw in base.css.
  const content = children ?? <span className="link-draw">{item.label}</span>
  if (item.to.includes('#')) {
    return (
      <Link to={item.to} className={className}>
        {content}
      </Link>
    )
  }
  return (
    <NavLink to={item.to} end className={className}>
      {content}
    </NavLink>
  )
}
