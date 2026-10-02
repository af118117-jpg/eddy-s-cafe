import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { formatPrice } from '@/lib/format'
import { Button } from './Button'
import { Chip } from './Chip'
import { Price } from './Price'
import { ResponsiveImage } from './ResponsiveImage'
import { SectionHeading } from './SectionHeading'

describe('Button', () => {
  it('renders a type="button" by default', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('renders an <a> when given href', () => {
    render(<Button href="tel:+923041112111">Call</Button>)
    expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:+923041112111')
  })

  it('renders a router link when given to', () => {
    render(
      <MemoryRouter>
        <Button to="/menu">View the menu</Button>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'View the menu' })).toHaveAttribute('href', '/menu')
  })

  it('always meets the 44px minimum height', () => {
    render(<Button variant="link">Hours</Button>)
    expect(screen.getByRole('button')).toHaveClass('min-h-control-md')
  })
})

describe('Chip', () => {
  it('exposes its state through aria-pressed', () => {
    const { rerender } = render(<Chip pressed={false}>Desserts</Chip>)
    expect(screen.getByRole('button', { name: 'Desserts' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    rerender(<Chip pressed>Desserts</Chip>)
    expect(screen.getByRole('button', { name: 'Desserts' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('Price', () => {
  it('formats rupees with grouping and a non-breaking space', () => {
    expect(formatPrice(1999)).toBe('Rs 1,999')
    expect(formatPrice(12499)).toBe('Rs 12,499')
    expect(formatPrice(1299, { from: true })).toBe('from Rs 1,299')
  })

  it('shows "Rs" visually and reads "Rupees" to screen readers', () => {
    render(<Price amount={1299} from />)
    expect(screen.getByText('Rs')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('Rupees')).toHaveClass('sr-only')
  })
})

describe('ResponsiveImage', () => {
  const photo = { src: '/images/a.jpg', alt: 'A dish', width: 800, height: 1000 }

  it('is lazy and async by default', () => {
    render(<ResponsiveImage {...photo} ratio="dish" />)
    const img = screen.getByRole('img', { name: 'A dish' })
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).not.toHaveAttribute('fetchpriority')
    expect(img.closest('picture')).toHaveClass('aspect-dish', 'bg-placeholder')
  })

  it('loads eagerly with high fetch priority when priority is set', () => {
    render(<ResponsiveImage {...photo} priority />)
    const img = screen.getByRole('img', { name: 'A dish' })
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('reserves the intrinsic ratio when no ratio is given', () => {
    render(<ResponsiveImage {...photo} />)
    expect(screen.getByRole('img').closest('picture')).toHaveStyle({ aspectRatio: '800 / 1000' })
  })

  it('renders a hidden placeholder of the right ratio when there is no photo yet', () => {
    const { container } = render(<ResponsiveImage alt="Lamb chops" ratio="dish" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const placeholder = container.querySelector('[data-placeholder]')
    expect(placeholder).toHaveAttribute('aria-hidden', 'true')
    expect(placeholder).toHaveClass('aspect-dish', 'bg-placeholder')
  })
})

describe('SectionHeading', () => {
  it('renders the requested heading level with its intro', () => {
    render(<SectionHeading as="h3" title="Visit" intro="77 Green Avenue West" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Visit' })).toHaveClass('text-h3')
    expect(screen.getByText('77 Green Avenue West')).toBeInTheDocument()
  })
})
