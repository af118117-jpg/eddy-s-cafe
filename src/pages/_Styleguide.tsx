import { MapPin, Phone, Search } from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  Button,
  Chip,
  Container,
  Icon,
  Price,
  ResponsiveImage,
  SectionHeading,
  type ButtonSize,
  type ButtonVariant,
  type IconSize,
  type ImageRatio,
} from '@/components/ui'
import { cn } from '@/lib/cn'

/*
 * Dev-only styleguide (/styleguide). Every value shown is read from the live
 * CSS, so this page can't drift from tokens.css.
 */

// Live CSS readers -----------------------------------------------------------

function subscribeToResize(onChange: () => void) {
  window.addEventListener('resize', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
  }
}

function useRootToken(name: string): string {
  return useSyncExternalStore(subscribeToResize, () =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
  )
}

function useElementReading(
  ref: RefObject<HTMLElement | null>,
  read: (element: HTMLElement) => string,
): string {
  return useSyncExternalStore(subscribeToResize, () => (ref.current ? read(ref.current) : ''))
}

function useViewportWidth(): number {
  return useSyncExternalStore(subscribeToResize, () => window.innerWidth)
}

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => {
    query.removeEventListener('change', onChange)
  }
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
}

// Contrast (WCAG 2.1) ----------------------------------------------------------

function relativeLuminance(hex: string): number | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!match?.[1]) return null
  const value = match[1]
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  if (la === null || lb === null) return null
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Layout helpers ---------------------------------------------------------------

function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-meta text-ink-muted', className)}>{children}</p>
}

function Code({ children }: { children: ReactNode }) {
  return <code className="font-sans text-small">{children}</code>
}

function GuideSection({
  id,
  title,
  intro,
  children,
  fullBleed,
}: {
  id: string
  title: string
  intro?: string
  children: ReactNode
  /** Rendered after the section's container, at full page width. */
  fullBleed?: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-8 flex-col gap-12 border-t py-section-tight"
    >
      <Container className="flex flex-col gap-12">
        <SectionHeading id={`${id}-title`} title={title} intro={intro} />
        {children}
      </Container>
      {fullBleed}
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-h3">{title}</h3>
      {children}
    </div>
  )
}

// Colour -------------------------------------------------------------------------

const colours = [
  { name: 'bg', swatch: 'bg-bg', use: 'Page background; text on ink.', text: true },
  { name: 'ink', swatch: 'bg-ink', use: 'Text, primary buttons.', text: true },
  { name: 'ink-muted', swatch: 'bg-ink-muted', use: 'Secondary text on bg.', text: true },
  { name: 'cream', swatch: 'bg-cream', use: 'Image placeholders, quiet surfaces.', text: true },
  { name: 'beige', swatch: 'bg-beige', use: 'Fills only.', text: false },
  { name: 'beige-dark', swatch: 'bg-beige-dark', use: 'Link underlines, fills.', text: false },
  { name: 'accent', swatch: 'bg-accent', use: 'Focus ring.', text: true },
  { name: 'line', swatch: 'bg-line', use: '1px borders and dividers.', text: false },
  { name: 'footer', swatch: 'bg-footer', use: 'Footer surface (= ink).', text: false },
] as const

function ContrastLine({
  value,
  against,
  label,
}: {
  value: string
  against: string
  label: string
}) {
  const ratio = contrastRatio(value, against)
  if (ratio === null || ratio < 1.05) return null
  const verdict =
    ratio >= 4.5 ? 'passes AA for text' : ratio >= 3 ? 'AA for large text only' : 'fails for text'
  return (
    <li>
      <span className="tabular-nums">{ratio.toFixed(2)}:1</span> on {label}, {verdict}
    </li>
  )
}

function Swatch({ colour }: { colour: (typeof colours)[number] }) {
  const value = useRootToken(`--color-${colour.name}`)
  const bg = useRootToken('--color-bg')
  const cream = useRootToken('--color-cream')
  const ink = useRootToken('--color-ink')
  return (
    <li className="flex flex-col gap-3">
      <div className={cn('h-24 border', colour.swatch)} />
      <div className="flex flex-col gap-1">
        <p className="text-item-name">{colour.name}</p>
        <p className="text-small text-ink-muted">
          --color-{colour.name} {value}
        </p>
        <p className="text-small">{colour.use}</p>
        {colour.text ? (
          <ul className="text-small text-ink-muted">
            <ContrastLine value={value} against={bg} label="bg" />
            <ContrastLine value={value} against={cream} label="cream" />
            <ContrastLine value={value} against={ink} label="ink" />
          </ul>
        ) : (
          <p className="text-small text-ink-muted">Never used for text.</p>
        )}
      </div>
    </li>
  )
}

// Type ----------------------------------------------------------------------------

const typeStyles = [
  { name: 'display', className: 'text-display', sample: 'eddy’s' },
  { name: 'h2', className: 'text-h2', sample: 'Signatures' },
  { name: 'h3', className: 'text-h3', sample: 'Persian Style Lamb Chops' },
  { name: 'item-name', className: 'text-item-name', sample: 'Chicken Spicy Moroccan Steak' },
  {
    name: 'body-lg',
    className: 'text-body-lg',
    sample:
      'Open every day from 11 AM. We close at 1 AM Monday to Thursday, and at 2 AM Friday to Sunday.',
  },
  {
    name: 'body',
    className: 'text-body',
    sample: 'Pan-fried grilled chicken, served with hummus, pita bread & olive oil.',
  },
  { name: 'small', className: 'text-small', sample: 'Prices are exclusive of taxes.' },
  { name: 'nav', className: 'text-nav', sample: 'Menu' },
  { name: 'meta', className: 'text-meta', sample: 'Dine-in and takeout' },
] as const

function TypeSpecimen({ style }: { style: (typeof typeStyles)[number] }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const size = useElementReading(ref, (element) => getComputedStyle(element).fontSize)
  const token = useRootToken(`--text-${style.name}`)
  const lineHeight = useRootToken(`--text-${style.name}--line-height`)
  const weight = useRootToken(`--text-${style.name}--font-weight`)
  const tracking = useRootToken(`--text-${style.name}--letter-spacing`)
  return (
    <li className="grid gap-3 border-t pt-6 lg:grid-cols-12 lg:gap-gutter-lg">
      <div className="flex flex-col gap-1 lg:col-span-3">
        <p className="text-item-name">{style.name}</p>
        <p className="text-small text-ink-muted">
          {token}
          <br />
          {size} now, line height {lineHeight}, weight {weight}
          {tracking ? `, tracking ${tracking}` : ''}
        </p>
      </div>
      <p ref={ref} className={cn(style.className, 'prose-width lg:col-span-9')}>
        {style.sample}
      </p>
    </li>
  )
}

// Spacing -------------------------------------------------------------------------

const spacingSteps = [
  { name: '1', className: 'w-1' },
  { name: '2', className: 'w-2' },
  { name: '3', className: 'w-3' },
  { name: '4', className: 'w-4' },
  { name: '6', className: 'w-6' },
  { name: '8', className: 'w-8' },
  { name: '12', className: 'w-12' },
  { name: '16', className: 'w-16' },
  { name: '24', className: 'w-24' },
  { name: '32', className: 'w-32' },
  { name: '40', className: 'w-40' },
] as const

const layoutSpacing = [
  { name: 'section', className: 'w-section', use: 'Section padding' },
  { name: 'section-tight', className: 'w-section-tight', use: 'Tighter section padding' },
  { name: 'margin-sm', className: 'w-margin-sm', use: 'Side margin below 768' },
  { name: 'margin-md', className: 'w-margin-md', use: 'Side margin 768 to 1023' },
  { name: 'margin-lg', className: 'w-margin-lg', use: 'Side margin from 1024' },
  { name: 'gutter-sm', className: 'w-gutter-sm', use: 'Grid gutter, 4 columns' },
  { name: 'gutter-lg', className: 'w-gutter-lg', use: 'Grid gutter, 12 columns' },
  { name: 'control-md', className: 'w-control-md', use: 'Button and chip height' },
  { name: 'control-lg', className: 'w-control-lg', use: 'Large button height' },
] as const

function SpaceRow({ name, className, use }: { name: string; className: string; use?: string }) {
  const value = useRootToken(`--spacing-${name}`)
  return (
    <li className="grid grid-cols-4 items-center gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
      <p className="col-span-2 text-small lg:col-span-3">
        <span className="text-ink">{name}</span>{' '}
        <span className="text-ink-muted tabular-nums">{value}</span>
        {use && <span className="block text-ink-muted">{use}</span>}
      </p>
      <div className="col-span-2 lg:col-span-9">
        <div className={cn('h-2 max-w-full bg-beige', className)} />
      </div>
    </li>
  )
}

// Layout --------------------------------------------------------------------------

function ContainerBand({ size, label }: { size: 'wide' | 'content' | 'prose'; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const width = useElementReading(
    ref,
    (element) => `${String(Math.round(element.getBoundingClientRect().width))}px`,
  )
  return (
    <div className="border-y border-dashed border-beige-dark">
      <Container size={size}>
        <div ref={ref} className="bg-cream px-4 py-3 text-small">
          {label}, <span className="tabular-nums">{width}</span> wide at this viewport
        </div>
      </Container>
    </div>
  )
}

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

function BreakpointRow({
  name,
  viewport,
}: {
  name: (typeof breakpoints)[number]
  viewport: number
}) {
  const value = useRootToken(`--breakpoint-${name}`)
  const active = viewport >= parseFloat(value)
  return (
    <li className="flex items-baseline justify-between gap-4 border-t py-3 text-small">
      <span>
        {name} <span className="text-ink-muted tabular-nums">{value}</span>
      </span>
      <span className={active ? 'text-ink' : 'text-ink-muted'}>
        {active ? 'Active' : 'Not active'}
      </span>
    </li>
  )
}

// Motion ----------------------------------------------------------------------------

const durations = [
  { name: 'micro', className: 'duration-(--duration-micro)', use: 'Hover and colour changes' },
  { name: 'standard', className: 'duration-(--duration-standard)', use: 'Default transitions' },
  { name: 'reveal', className: 'duration-(--duration-reveal)', use: 'Reveals, shortest' },
  { name: 'reveal-long', className: 'duration-(--duration-reveal-long)', use: 'Reveals, longest' },
] as const

function DurationRow({
  duration,
  playing,
}: {
  duration: (typeof durations)[number]
  playing: boolean
}) {
  const value = useRootToken(`--duration-${duration.name}`)
  return (
    <li className="grid grid-cols-4 items-center gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
      <p className="col-span-2 text-small lg:col-span-3">
        {duration.name} <span className="text-ink-muted tabular-nums">{value}</span>
        <span className="block text-ink-muted">{duration.use}</span>
      </p>
      <div className="col-span-2 h-2 bg-line lg:col-span-9">
        <div
          className={cn(
            'h-full origin-left bg-ink transition-transform ease-standard',
            duration.className,
            playing ? 'scale-x-100' : 'scale-x-0',
          )}
        />
      </div>
    </li>
  )
}

// Components ------------------------------------------------------------------------

type ForcedState = 'default' | 'hover' | 'focus' | 'disabled'
const buttonStates: readonly ForcedState[] = ['default', 'hover', 'focus', 'disabled']

const buttonRows: readonly { variant: ButtonVariant; size: ButtonSize; label: string }[] = [
  { variant: 'primary', size: 'md', label: 'View the menu' },
  { variant: 'primary', size: 'lg', label: 'View the menu' },
  { variant: 'secondary', size: 'md', label: 'Get directions' },
  { variant: 'secondary', size: 'lg', label: 'Get directions' },
  { variant: 'link', size: 'md', label: 'Opening hours' },
  { variant: 'link', size: 'lg', label: 'Opening hours' },
]

function stateProps(state: ForcedState) {
  if (state === 'disabled') return { disabled: true }
  if (state === 'default') return {}
  return { 'data-force': state, tabIndex: -1 }
}

function StateCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col items-start gap-2">
      {children}
      <figcaption className="text-meta text-ink-muted">{label}</figcaption>
    </figure>
  )
}

const chipStates = [
  { label: 'Default', pressed: false, extra: {} },
  { label: 'Hover', pressed: false, extra: { 'data-force': 'hover', tabIndex: -1 } },
  { label: 'Focus', pressed: false, extra: { 'data-force': 'focus', tabIndex: -1 } },
  { label: 'Pressed', pressed: true, extra: {} },
  { label: 'Pressed, hover', pressed: true, extra: { 'data-force': 'hover', tabIndex: -1 } },
  { label: 'Disabled', pressed: false, extra: { disabled: true } },
] as const

const menuGroups = ['All', 'Coffee & Tea', 'Cold Drinks', 'Desserts'] as const

function ChipGroupDemo() {
  const [selected, setSelected] = useState<(typeof menuGroups)[number]>('All')
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by group">
      {menuGroups.map((group) => (
        <Chip
          key={group}
          pressed={selected === group}
          onClick={() => {
            setSelected(group)
          }}
        >
          {group}
        </Chip>
      ))}
    </div>
  )
}

const samplePhoto = {
  // Served by the dev server straight from the raw asset folder; never shipped.
  src: '/eddys-cafe-assets/01-Google-Maps-Photos/google-maps-24.jpg',
  width: 1858,
  height: 1242,
  alt: "Two layered desserts in eddy's cups on a wooden table",
}

const imageRatios: readonly { ratio: ImageRatio; label: string; className: string }[] = [
  { ratio: 'dish', label: 'dish, 4:5', className: 'col-span-2 lg:col-span-3' },
  { ratio: 'gallery', label: 'gallery, 1:1', className: 'col-span-2 lg:col-span-3' },
  { ratio: 'editorial', label: 'editorial, 16:9', className: 'col-span-4 lg:col-span-6' },
  {
    ratio: 'editorial-wide',
    label: 'editorial-wide, 21:9',
    className: 'col-span-4 lg:col-span-12',
  },
]

function ImageAttributes({ frame }: { frame: RefObject<HTMLDivElement | null> }) {
  const attributes = useElementReading(frame, (element) => {
    const img = element.querySelector('img')
    if (!img) return ''
    return ['loading', 'decoding', 'fetchpriority']
      .map((name) => `${name}=${img.getAttribute(name) ?? 'none'}`)
      .join(', ')
  })
  return <>{attributes}</>
}

function ImageDemo({
  ratio,
  label,
  priority = false,
}: {
  ratio: ImageRatio
  label: string
  priority?: boolean
}) {
  const frame = useRef<HTMLDivElement>(null)
  return (
    <figure className="flex flex-col gap-2">
      <div ref={frame}>
        <ResponsiveImage
          {...samplePhoto}
          ratio={ratio}
          priority={priority}
          sizes="(width >= 64em) 50vw, 100vw"
        />
      </div>
      <figcaption className="text-meta text-ink-muted">
        {label}. <ImageAttributes frame={frame} />
      </figcaption>
    </figure>
  )
}

const iconSizes: readonly IconSize[] = ['sm', 'md', 'lg']

function IconSizeSample({ size }: { size: IconSize }) {
  const value = useRootToken(`--icon-${size}`)
  const stroke = useRootToken('--icon-stroke')
  return (
    <li className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Icon icon={Phone} size={size} />
        <Icon icon={MapPin} size={size} />
        <Icon icon={Search} size={size} />
      </div>
      <Meta>
        {size}, <span className="tabular-nums">{value}</span>, stroke {stroke}
      </Meta>
    </li>
  )
}

const priceList = [
  { name: 'Fatoush Salad', amount: 999 },
  { name: 'Jooje Pockets', amount: 1199 },
  { name: 'Hummus with Chicken', amount: 1299 },
  { name: 'Hummus with Lamb', amount: 1499 },
] as const

// Page ------------------------------------------------------------------------------

const sections = [
  { id: 'colour', label: 'Colour' },
  { id: 'type', label: 'Type' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'layout', label: 'Layout' },
  { id: 'surfaces', label: 'Surfaces' },
  { id: 'motion', label: 'Motion' },
  { id: 'icons', label: 'Icons' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'chips', label: 'Chips' },
  { id: 'headings', label: 'Section headings' },
  { id: 'images', label: 'Images' },
  { id: 'prices', label: 'Prices' },
] as const

export default function Styleguide() {
  const viewport = useViewportWidth()
  const reducedMotion = useReducedMotion()
  const easing = useRootToken('--ease-standard')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = "Styleguide | eddy's Café"
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main className="pb-section">
      <Container as="header" className="flex flex-col gap-8 py-section-tight">
        <Meta>Development only. Not included in production builds.</Meta>
        <h1 className="text-h2">Styleguide</h1>
        <p className="prose-width text-body-lg text-ink-muted">
          Every token and UI component from docs/PLAN.md. Values on this page are read from the live
          CSS, so they always match the code.
        </p>
        <nav aria-label="Styleguide sections">
          <ul className="flex flex-wrap gap-x-6">
            {sections.map((section) => (
              <li key={section.id}>
                <Button variant="link" href={`#${section.id}`}>
                  {section.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <GuideSection
        id="colour"
        title="Colour"
        intro="Nine tokens and nothing else. Tailwind's default palette is switched off, and a hex value anywhere in src fails lint."
      >
        <ul className="grid grid-cols-2 gap-x-gutter-sm gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-gutter-lg">
          {colours.map((colour) => (
            <Swatch key={colour.name} colour={colour} />
          ))}
        </ul>
      </GuideSection>

      <GuideSection
        id="type"
        title="Type"
        intro="Inter variable, self-hosted. Headings are fluid; sizes update as you resize the window. Labels are sentence case and prose stops at 68 characters."
      >
        <ul className="flex flex-col gap-12">
          {typeStyles.map((style) => (
            <TypeSpecimen key={style.name} style={style} />
          ))}
        </ul>
      </GuideSection>

      <GuideSection
        id="spacing"
        title="Spacing"
        intro="A 4px base. Only these steps exist as utilities: p-5 or gap-7 generate nothing."
      >
        <Subsection title="Scale">
          <ul className="flex flex-col gap-3">
            {spacingSteps.map((step) => (
              <SpaceRow key={step.name} name={step.name} className={step.className} />
            ))}
          </ul>
        </Subsection>
        <Subsection title="Layout and controls">
          <ul className="flex flex-col gap-3">
            {layoutSpacing.map((step) => (
              <SpaceRow
                key={step.name}
                name={step.name}
                className={step.className}
                use={step.use}
              />
            ))}
          </ul>
        </Subsection>
      </GuideSection>

      <GuideSection
        id="layout"
        title="Layout"
        intro="Containers keep the side margins outside their width. The grid is 4 columns below 1024 and 12 above."
        fullBleed={
          <div className="flex flex-col gap-3">
            <ContainerBand size="wide" label="container-wide, up to 1440" />
            <ContainerBand size="content" label="container, up to 1280" />
            <ContainerBand size="prose" label="container-prose, up to 680 or 68ch" />
          </div>
        }
      >
        <Subsection title="Grid">
          <div className="grid grid-cols-4 gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
            {Array.from({ length: 12 }, (_, index) => (
              <div key={index} className={cn('h-16 bg-cream', index >= 4 && 'hidden lg:block')} />
            ))}
          </div>
        </Subsection>
        <Subsection title="Breakpoints">
          <Meta>
            Viewport is <span className="tabular-nums">{viewport}px</span> wide.
          </Meta>
          <ul className="prose-width border-b">
            {breakpoints.map((name) => (
              <BreakpointRow key={name} name={name} viewport={viewport} />
            ))}
          </ul>
        </Subsection>
        <Subsection title="Containers">
          <Meta>Shown full width below, so the wide container can reach 1440.</Meta>
        </Subsection>
      </GuideSection>

      <GuideSection
        id="surfaces"
        title="Surfaces"
        intro="Radius 0 on images, cards and blocks; 999px only on buttons and chips. No shadows. Borders are 1px line."
      >
        <div className="grid grid-cols-4 gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
          <div className="col-span-4 flex flex-col gap-3 border p-6 lg:col-span-4">
            <p className="text-item-name">Block</p>
            <p className="text-small text-ink-muted">Square corners, 1px line border, no shadow.</p>
          </div>
          <div className="col-span-4 flex flex-col items-start gap-3 lg:col-span-4">
            <span className="inline-flex min-h-control-md items-center rounded-pill border px-6 text-nav">
              Pill, 999px radius
            </span>
            <Meta>Buttons and chips only.</Meta>
          </div>
          <div className="col-span-4 flex flex-col items-start gap-3 lg:col-span-4">
            <Button variant="link" data-force="focus" tabIndex={-1}>
              Focus ring
            </Button>
            <Meta>2px accent outline, 3px offset, keyboard focus only.</Meta>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
          <div
            data-surface="cream"
            className="col-span-4 flex flex-col items-start gap-3 p-8 lg:col-span-6"
          >
            <p className="text-item-name">Cream surface</p>
            <p className="text-small text-ink-muted">
              Muted text switches to ink here, because ink-muted is only 4.07:1 on cream.
            </p>
            <Button variant="link" data-force="focus" tabIndex={-1}>
              Focus ring on cream
            </Button>
          </div>
          <div
            data-surface="ink"
            className="col-span-4 flex flex-col items-start gap-3 p-8 lg:col-span-6"
          >
            <p className="text-item-name">Ink surface (footer)</p>
            <p className="text-small text-ink-muted">
              Muted text uses cream and the focus ring uses bg, so both stay above AA contrast.
            </p>
            <Button variant="link" data-force="focus" tabIndex={-1}>
              Focus ring on ink
            </Button>
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="motion"
        title="Motion"
        intro="One easing curve for everything. Reveals take 600 to 800ms; hover and colour changes take 150ms."
      >
        <div className="flex flex-wrap items-center gap-6">
          <Button
            variant="secondary"
            onClick={() => {
              setPlaying((value) => !value)
            }}
          >
            {playing ? 'Reset' : 'Play'}
          </Button>
          <Meta>
            Easing <Code>{easing}</Code>.{' '}
            {reducedMotion
              ? 'Reduced motion is on, so the bars jump straight to the end.'
              : 'With reduced motion on, transitions are switched off.'}
          </Meta>
        </div>
        <ul className="flex flex-col gap-6">
          {durations.map((duration) => (
            <DurationRow key={duration.name} duration={duration} playing={playing} />
          ))}
        </ul>
      </GuideSection>

      <GuideSection
        id="icons"
        title="Icons"
        intro="Lucide at 16, 20 and 24px with a 1.5 stroke, used only where the icon adds meaning."
      >
        <ul className="flex flex-wrap gap-12">
          {iconSizes.map((size) => (
            <IconSizeSample key={size} size={size} />
          ))}
        </ul>
      </GuideSection>

      <GuideSection
        id="buttons"
        title="Buttons"
        intro="Primary is an ink pill, secondary a 1px ink outline, link an underline. Every size is at least 44px tall."
      >
        <ul className="flex flex-col gap-12">
          {buttonRows.map((row) => (
            <li key={`${row.variant}-${row.size}`} className="flex flex-col gap-4">
              <p className="text-item-name">
                {row.variant}, {row.size}
              </p>
              <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
                {buttonStates.map((state) => (
                  <StateCell key={state} label={state}>
                    <Button variant={row.variant} size={row.size} {...stateProps(state)}>
                      {row.label}
                    </Button>
                  </StateCell>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <Subsection title="With an icon, as a link">
          <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
            <StateCell label="<a href> with icon at start">
              <Button href="tel:+923041112111" icon={Phone} iconPosition="start">
                Call
              </Button>
            </StateCell>
            <StateCell label="<a href> with icon at end, lg">
              <Button href="#layout" variant="secondary" size="lg" icon={MapPin}>
                Find us
              </Button>
            </StateCell>
            <StateCell label="Router <Link to>">
              <Button to="/" variant="link">
                Back to home
              </Button>
            </StateCell>
          </div>
        </Subsection>
      </GuideSection>

      <GuideSection
        id="chips"
        title="Chips"
        intro="Filter toggles. The pressed look is driven by aria-pressed, so what screen readers hear always matches what you see."
      >
        <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
          {chipStates.map((state) => (
            <StateCell key={state.label} label={state.label}>
              <Chip pressed={state.pressed} {...state.extra}>
                Desserts
              </Chip>
            </StateCell>
          ))}
        </div>
        <Subsection title="Try it">
          <ChipGroupDemo />
        </Subsection>
      </GuideSection>

      <GuideSection
        id="headings"
        title="Section headings"
        intro="Title with an optional intro, as h2 or h3, aligned to the start or centre."
      >
        <div className="flex flex-col gap-16">
          <SectionHeading
            title="Signatures"
            intro="The intro sits under the title in body-lg and ink-muted, and never runs past 68 characters a line."
          />
          <div className="border-t pt-12">
            <SectionHeading
              as="h3"
              align="center"
              title="Visit"
              intro="77 Green Avenue West, Canal Road, Faisalabad."
            />
          </div>
          <div className="border-t pt-12">
            <SectionHeading title="Menu" />
          </div>
        </div>
      </GuideSection>

      <GuideSection
        id="images"
        title="Images"
        intro="A <picture> in a fixed-ratio frame. The cream placeholder holds the space, so nothing shifts when the photo arrives."
      >
        <div className="grid grid-cols-4 gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
          {imageRatios.map((image, index) => (
            <div key={image.ratio} className={image.className}>
              <ImageDemo
                ratio={image.ratio}
                label={index === 0 ? `${image.label}, priority` : image.label}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        <Subsection title="Placeholder">
          <div className="grid grid-cols-4 gap-gutter-sm lg:grid-cols-12 lg:gap-gutter-lg">
            <figure className="col-span-2 flex flex-col gap-2 lg:col-span-3">
              <div className="aspect-dish bg-cream" />
              <figcaption className="text-meta text-ink-muted">Before the photo loads</figcaption>
            </figure>
          </div>
        </Subsection>
      </GuideSection>

      <GuideSection
        id="prices"
        title="Prices"
        intro="Rupees as “Rs 1,999”, with tabular figures so a column of prices lines up."
      >
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <StateCell label="Default">
            <Price amount={999} className="text-item-name" />
          </StateCell>
          <StateCell label="With from">
            <Price amount={1299} from className="text-item-name" />
          </StateCell>
          <StateCell label="Five figures">
            <Price amount={12499} className="text-item-name" />
          </StateCell>
        </div>
        <ul className="prose-width border-b">
          {priceList.map((item) => (
            <li key={item.name} className="flex items-baseline justify-between gap-6 border-t py-4">
              <span className="text-item-name">{item.name}</span>
              <Price amount={item.amount} className="text-body" />
            </li>
          ))}
        </ul>
      </GuideSection>
    </main>
  )
}
