# CLAUDE.md

Premium marketing website for **eddy's Café**, 77 Green Avenue West, Canal Road, Faisalabad.

## Hard scope rule

This is a **frontend-only** static site. There is no backend, database, auth, API routes, CMS, admin panel or payment logic — now or later. Do not add, scaffold, suggest or install any of these (including backend/database/auth skills or packages). Ordering and delivery link out to external services; nothing is processed here.

## Source of truth

- `docs/PLAN.md` is the design and page spec (tokens, type scale, spacing, grid, motion, page sections, targets). Follow it exactly; if something needs to change, propose it and update PLAN.md first rather than drifting in code.
- `eddys-cafe-assets/` is raw source material collected on 2026-09-28. Treat it as **read-only**. Copy and optimise what's needed into `public/images/` and `src/data/`; never edit or delete the originals.

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind CSS v4 (`@tailwindcss/vite`) + react-router-dom + lucide-react.
Tests: vitest + Testing Library (unit), Playwright + @axe-core/playwright (e2e/a11y). Lint/format: eslint (typescript-eslint, react-hooks) + prettier.
Path alias `@/` → `src/`.

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # production build
npm run preview    # serve the build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test       # vitest
npm run e2e        # playwright (incl. axe) at 375 / 768 / 1280
```

Before reporting any phase as done: `typecheck`, `lint` and `test` pass, and `build` succeeds.
Playwright's own Chromium isn't installed on this machine; run e2e against the installed Edge with `PLAYWRIGHT_CHANNEL=msedge npm run e2e`.

## Layout

```
src/app                 routes.tsx, SiteLayout (app shell), scroll + focus management
src/components/layout   AnnouncementBar, SiteHeader, MobileNav, MobileActionBar, SiteFooter, SkipLink
src/components/ui       Button, Chip, Container, Icon, Price, ResponsiveImage, SectionHeading
src/components/home     home page sections
src/components/menu     menu page components
src/pages               route pages (the only default exports); _Styleguide is dev-only
src/data                typed menu + café info (single source for content)
src/hooks  src/lib
src/styles              tokens.css (@theme, the only raw values) + base.css
public/fonts            Inter variable woff2, preloaded in index.html
public/images           optimised, resized images only
tests/e2e               Playwright + axe specs
```

`/styleguide` (dev server only) shows every token and component state. Check new UI there first.

## Routing and the site shell

- Declarative `BrowserRouter` + `useRoutes` on purpose: the data router (`createBrowserRouter`) costs ~20 KB gzipped. Lazy pages use `React.lazy`; `SiteLayout` wraps the outlet in Suspense.
- Page routes set `handle: { title, headerOverlay }` in `src/app/routes.tsx`. `headerOverlay` makes the header transparent over a full-bleed hero, which must pull itself up with `-mt-(--header-height)`.
- The home page must keep the section ids `#feasts`, `#coffee`, `#visit` (used by the nav in `src/data/navigation.ts`).
- Pages render inside `<main>`; don't add another `main`. Each page has exactly one `h1`: it receives focus after client-side navigation.
- Buttons and chips use `fg` / `fg-inverse`, so they invert automatically inside `data-surface="ink"`.

## Content data

- The menu is generated: `npm run import:menu` turns `eddys-cafe-assets/05-Menu-Data/menu.csv` into `src/data/menu.generated.ts` (all 182 items) and `home-dishes.generated.ts` (only the dishes listed in `src/data/home-selection.ts`). Never edit the generated files by hand.
- `src/data/menu.ts` holds types, the 8 groups and the category→group mapping, and has no runtime import of the menu, so the home page doesn't bundle all 182 items. Import the full list from `@/data/menu-items` (menu page only).
- Home copy and photo slots live in `src/data/home.ts`; placeholders are marked `TODO(copy)`.
- Photos: `<Photo image={asset} ratio=… />` renders the photo once an `ImageAsset` has `src`, otherwise a cream placeholder of the right ratio (aria-hidden; the dev server labels it with the alt text). Phase 7 fills in `src`.
- Opening status: `useOpenStatus()` works in the café's time zone (`cafe.timeZone`, Asia/Karachi) and treats 00:30 as part of the previous day's session.
- `/menu#coffee-tea` is linked from the home page: the menu page must give the Coffee & Tea group that id.

## Design guardrails (quick reference — details in docs/PLAN.md)

- Colours only from the PLAN tokens. `beige` / `beige-dark` never used for text.
- Radius 0 everywhere except buttons and chips (999px). No shadows. Borders are 1px `line`.
- Sentence case everywhere — no all-caps labels. Prices use `tabular-nums`.
- One bold move only: the oversized lowercase "eddy's" wordmark over the full-bleed hero photo. Everything else stays quiet.
- Never use: 01/02 numbered markers, middle-dot meta strings, "→" on buttons, all-caps eyebrows, fade-up on every section, identical rounded cards.
- Focus: 2px accent outline, 3px offset, `:focus-visible` only. Touch targets ≥ 44px.
- Respect `prefers-reduced-motion`. Put `data-motion` on anything that animates in with a transform, so reduced motion rests it in place.
- Raw values live only in `src/styles/tokens.css`. ESLint fails on hex colours, `[..px]` arbitrary values, numeric/px inline styles, `text-beige*` and off-scale spacing classes in `src/`. Tailwind's default colours, shadows and off-scale spacing (`gap-10`, `p-5`) are switched off and would silently generate nothing. The scale is 0 1 2 3 4 6 8 12 16 24 32 40.
- Use the `grid-layout` utility for the 4 / 12-column page grid.
- Dark or cream sections use `data-surface="ink" | "cream"`: it swaps muted text and the focus ring to AA-safe colours.

## Content rules

- Use only facts from `eddys-cafe-assets/06-Restaurant-Info/restaurant-info.txt` and `05-Menu-Data/menu.csv`. Don't invent dishes, prices, reviews, awards, quotes or history.
- Keep all café facts (address, phone, hours, links) in one typed module in `src/data` so they're edited in one place.
- Menu spelling in the source data is preserved as published (e.g. "Jalapaeno"); ask before correcting it.
- Most dish/drink images in `03-Food-Images` and `04-Drink-Images` are foodpanda reference photos watermarked "For reference only" and may not match the dish. Treat them as placeholders. Prefer the café's own photos (`01-Google-Maps-Photos` and the 7 poster images listed in `08-Report/collection-report.txt`) for anything prominent, and flag placeholders before launch.

## Budgets

Lighthouse mobile 95+ in all four categories · LCP < 2.0s · CLS < 0.05 · JS < 90KB gzipped · WCAG 2.1 AA with zero serious/critical axe violations.
Images: width/height (or aspect-ratio) always set, modern formats, `loading="lazy"` below the fold, hero image preloaded.

## Workflow

- Work in phases. At the end of each phase, stop and report (what changed, checks run, open issues). Don't start the next phase without the user's go-ahead.
- Use installed skills where they fit: `frontend-design`, `design:design-system`, `design:accessibility-review`, `design:ux-copy`, `design:design-critique`, `engineering:testing-strategy`, `webapp-testing`.

## Open questions (confirm with the user before building the affected parts)

- **Menu grouping:** the source data has 25 categories, but PLAN.md defines 8 groups. A proposed mapping is in `src/data/menu.ts` (marked PROPOSAL) and still needs the user's OK. Feasts = the 4 sharing platters whose descriptions give a serving size. Breakfast (11 items) is provisionally under Mains.
- **Spelling:** "Eddy' s Khaas" (stray space) and "Poched Egg" are shown as published until the user confirms corrections.
- **Hours:** Google Maps (dine-in) and foodpanda (delivery) disagree. The site should show Google Maps hours as opening hours unless the user says otherwise.
- **Instagram** `@theeddyscafe` was read off a table card in a photo; the profile hasn't been verified. It is linked in the footer (flagged in `src/data/cafe.ts`); confirm before launch.
- **WhatsApp:** no WhatsApp number is in the data. Don't assume it matches the phone number (+92 304 1112111) without confirmation. `cafe.whatsapp` is `null` and every WhatsApp button stays hidden until it's set.
