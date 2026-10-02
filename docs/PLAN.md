# eddy's Café — Frontend Plan

Frontend-only premium website for eddy's Café, 77 Green Avenue West, Canal Road, Faisalabad.
No backend, database, auth, API routes, CMS, admin panel or payment logic, now or later.

## Colors

Use ONLY these. `beige` and `beige-dark` are never used for text.

| Token      | Value     |
| ---------- | --------- |
| bg         | `#FDFDFC` |
| ink        | `#1F1C19` |
| ink-muted  | `#6F6A64` |
| cream      | `#E8DFD7` |
| beige      | `#BFB3A1` |
| beige-dark | `#AFA28F` |
| accent     | `#2555D0` |
| line       | `#E5E2DE` |
| footer     | = ink     |

## Type

Inter variable, self-hosted woff2, latin subset, `font-display: swap`.

| Style     | Size                     | Line height | Weight | Tracking |
| --------- | ------------------------ | ----------- | ------ | -------- |
| display   | clamp(56px, 9vw, 144px)  | 0.92        | 500    | -0.04em  |
| h2        | clamp(36px, 4.5vw, 64px) | 1.05        | 500    | -0.025em |
| h3        | clamp(24px, 2.2vw, 32px) | 1.2         | 500    | -0.015em |
| item-name | 18px                     | 1.35        | 500    | —        |
| body-lg   | 18px                     | 1.6         | 400    | —        |
| body      | 16px                     | 1.6         | 400    | —        |
| small     | 14px                     | 1.5         | 400    | —        |
| nav       | 14px                     | 1           | 450    | —        |
| meta      | 12px                     | 1.4         | 500    | +0.01em  |

- Sentence case labels (no all-caps).
- Prices use `tabular-nums`.
- Prose max 68ch.

## Spacing

- 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Section padding 96–160 desktop, 64–96 mobile.

## Layout

- Containers: max 1440, content 1280, prose 680.
- Grid: 12 columns / 24px gutter desktop, 4 columns / 16px gutter mobile.
- Side margins 20 / 32 / 48.

## Surfaces

- Radius: 0 on images, cards and blocks; 999px only on buttons and chips.
- Shadows: none.
- Borders: 1px `line`.

## Buttons

- Primary: ink pill with bg text.
- Secondary: 1px ink outline pill.
- Text link: underlined.
- Minimum height 44px.

## Focus

2px accent outline, 3px offset, `:focus-visible` only.

## Icons

lucide at 16 / 20 / 24, stroke 1.5, only where they carry meaning.

## Image ratios

- Dish 4:5
- Editorial 16:9 and 21:9
- Gallery 1:1
- Hero full viewport height

## Motion

- 150ms micro, 250ms standard, 600–800ms reveals.
- Easing `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- One orchestrated moment, the hero entrance on first load: the photo settles from scale 1.04 to 1 over 1200ms; the wordmark rises out of an overflow mask (translateY 100% → 0, 800ms, 80ms stagger between lines); the statement and buttons fade in last.
- Scroll reveals only on the Signatures, SpaceFeature and Gallery photos: a clip-path inset reveal, bottom to top, 800ms. Text never animates on scroll.
- Hover: photos scale to 1.03 over 600ms inside an overflow-hidden frame; button fills change over 250ms; text-link underlines draw left to right over 250ms.
- Menu filtering crossfades the results over 200ms (View Transitions API, opacity fallback); the active section indicator slides between tabs over 250ms.
- Only transform and opacity move (clip-path for reveals); colours may fade; layout properties never animate.
- Content is visible without motion: hide-before-reveal styles apply only under `html.js-motion`, set when JavaScript runs and reduced motion is off. With prefers-reduced-motion, nothing moves and state changes are instant.

## Breakpoints

380, 640, 768, 1024, 1280, 1536.

## Design principles

- One bold move: an oversized lowercase "eddy's" wordmark over full-bleed photography in the hero. Everything else stays quiet.
- Avoid: numbered 01/02 markers, middle-dot meta strings, "→" on buttons, all-caps eyebrow labels, fade-up on every section, identical rounded cards, shadows.

## Pages

### Home (`/`)

1. AnnouncementBar
2. SiteHeader
3. Hero
4. Intro
5. Signatures
6. MenuPreview
7. Feasts
8. DrinksSplit
9. SpaceFeature
10. Gallery (includes the Instagram link)
11. VisitSection (address, map link, HoursTable, call/WhatsApp)
12. ClosingCTA
13. SiteFooter

### Menu (`/menu`)

- Title
- Search
- Sticky GroupTabs
- CategoryChips
- MenuList grouped by category
- EmptyState
- `aria-live` result count

Menu groups:

- Starters & Small Plates
- Mains
- Feasts
- Pizza & Pasta
- Burgers & Sandwiches
- Desserts
- Coffee & Tea
- Cold Drinks

## Targets

### Performance

- Lighthouse mobile 95+ in all four categories
- LCP < 2.0s
- CLS < 0.05
- JS < 90KB gzipped

How:

- Photos: AVIF, WebP and JPEG at 480, 800, 1200, 1600 and 2400px wide, with `sizes` matching the layout; width and height on every image; lazy below the fold.
- Hero: art-directed (a 4:5 crop below 768px, 16:9 above), `fetchpriority="high"`, preloaded from the home page's HTML with the same srcset and sizes.
- Fonts: Inter variable, self-hosted and preloaded, with only the weights in use (400–500).
- JS: the home and menu pages are separate chunks, each preloaded by its own HTML file, so neither ships the other's code.

### Accessibility

- WCAG 2.1 AA
- Zero serious or critical axe violations
- Touch targets at least 44 × 44px; focus never hidden behind sticky or fixed bars
- Text over photos passes AA whatever the photo (scrims sized for a white photo)

### SEO

- Lighthouse SEO 95+
- Each page: its own title, meta description, canonical URL, Open Graph and Twitter tags, in the HTML file
- Home page: Restaurant JSON-LD (address, geo, phone, opening hours, cuisine, price range, menu, sameAs)
- robots.txt, sitemap.xml, favicon set and web app manifest (colours from the tokens)
