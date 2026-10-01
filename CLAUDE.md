# CLAUDE.md

Premium marketing website for **eddy's Café**, 77 Green Avenue West, Canal Road, Faisalabad.

## Hard scope rule

This is a **frontend-only** static site. There is no backend, database, auth, API routes, CMS, admin panel or payment logic — now or later. Do not add, scaffold, suggest or install any of these (including backend/database/auth skills or packages). Ordering and delivery link out to external services; nothing is processed here.

## Source of truth

- `docs/PLAN.md` is the design and page spec (tokens, type scale, spacing, grid, motion, page sections, targets). Follow it exactly; if something needs to change, propose it and update PLAN.md first rather than drifting in code.
- `eddys-cafe-assets/` is raw source material collected on 2026-09-28. Treat it as **read-only**. Copy what's needed into `assets-source/` (photos) and `src/data/` (content); never edit or delete the originals.

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
npm run e2e        # playwright (incl. axe) at 375 / 768 / 1280 / 1536
npm run analyze    # production build + reports/bundle.html (treemap, gzipped sizes per chunk)
npm run photos:placeholders  # cream placeholders for empty photo slots in assets-source/
```

Before reporting any phase as done: `typecheck`, `lint` and `test` pass, and `build` succeeds.
Playwright's own Chromium isn't installed on this machine; run e2e against the installed Edge with `PLAYWRIGHT_CHANNEL=msedge npm run e2e`.

## Layout

```
src/app                 routes.tsx, SiteLayout (app shell), scroll + focus management
src/components/layout   AnnouncementBar, SiteHeader, MobileNav, MobileActionBar, SiteFooter, SkipLink
src/components/ui       Button, Chip, Container, Icon, Price, ResponsiveImage (Photo), Reveal, SectionHeading, ServesLabel
src/components/home     home page sections
src/components/menu     menu page: MenuToolbar (GroupTabs, CategoryChips, MenuSearch, ChipRow), MenuList, EmptyState
src/pages               route pages (the only default exports); _Styleguide is dev-only
src/data                typed menu + café info (single source for content)
src/hooks  src/lib
src/styles              tokens.css (@theme, the only raw values) + base.css
assets-source           source photos, processed at build time (see its README)
public/fonts            Inter variable woff2 (weights 400–500), preloaded in index.html
tests/e2e               Playwright + axe specs
reports                 analyze and Lighthouse output (git-ignored)
```

`/styleguide` (dev server only) shows every token and component state. Check new UI there first.

## Routing and the site shell

- Declarative `BrowserRouter` + `useRoutes` on purpose: the data router (`createBrowserRouter`) costs ~20 KB gzipped. Home and Menu are lazy chunks (`lazyPage` / `React.lazy`), so neither page downloads the other's code and photos; `SiteLayout` wraps the outlet, `ScrollRestorer` and `ScrollToHash` in one Suspense boundary so they act when the page content commits.
- Each page has its own HTML file, written by the `pageHtml` plugin in `vite.config.ts` (its `PAGES` list mirrors the routes): index.html preloads the hero photo and the Home chunk, menu.html the Menu chunk (and has its own title). `/menu` must be served from menu.html: `vite preview` and most static hosts do that by default ("pretty URLs"); elsewhere it falls back to index.html and still works. `main.tsx` waits for the Home chunk before the first render on `/` (`preloadPage`), so the hero renders with the frame.
- `package.json` declares `"sideEffects": ["**/*.css"]`. That's what keeps `home.ts` and the photo data out of the main chunk when the shell imports `@/data`. Keep modules free of import-time side effects.
- Page routes set `handle: { title, headerOverlay }` in `src/app/routes.tsx`. `headerOverlay` makes the header transparent over a full-bleed hero, which must pull itself up with `-mt-(--header-height)`.
- The home page must keep the section ids `#feasts`, `#coffee`, `#visit` (used by the nav in `src/data/navigation.ts`).
- Pages render inside `<main>`; don't add another `main`. Each page has exactly one `h1`: it receives focus after client-side navigation.
- Buttons and chips use `fg` / `fg-inverse`, so they invert automatically inside `data-surface="ink"`.

## Content data

- The menu is generated: `npm run import:menu` turns `eddys-cafe-assets/05-Menu-Data/menu.csv` into `src/data/menu.generated.ts` (all 182 items) and `home-dishes.generated.ts` (only the dishes listed in `src/data/home-selection.ts`). Never edit the generated files by hand.
- `src/data/menu.ts` holds types, the 8 groups and the category→group mapping, and has no runtime import of the menu, so the home page doesn't bundle all 182 items. Import the full list from `@/data/menu-items` (menu page only).
- Home copy and photo slots live in `src/data/home.ts`; placeholders are marked `TODO(copy)`.
- Photos live in `assets-source/` (all cream placeholders for now; its README says what goes where) and are imported as `file.jpg?aspect=4:5&photo`: the `photo` preset in `vite.config.ts` crops them and writes AVIF, WebP and JPEG at 480/800/1200/1600/2400 (never upscaled). `ImageAsset` = `{ alt, picture?, art? }`; `<Photo image={asset} ratio=… sizes=… />` renders the <picture>, or a cream placeholder (aria-hidden) when there is no `picture`. Every `sizes` value comes from `src/lib/photoSizes.ts`, worked out from the grid; `tests/e2e/images.spec.ts` checks them against the rendered width.
- The hero is art-directed (4:5 below 768px, 16:9 above, AVIF at quality 40 under its scrims). Its media and sizes live in `src/lib/heroImage.ts`, shared by the Hero and the preload in index.html: change them in one place or the browser downloads the hero twice.
- Dish photos: `assets-source/dishes/<menu id>.jpg` (`src/data/dish-photos.ts`) with alt text in `dishAlts`; gallery photos in name order with `galleryAlts` in `home.ts`. Tests require alt text for each.
- Opening status: `useOpenStatus()` works in the café's time zone (`cafe.timeZone`, Asia/Karachi) and treats 00:30 as part of the previous day's session.
- `/menu#coffee-tea` is linked from the home page: the menu page gives each group's wrapper its group id and each category block its own slug id (`#hot-coffee`).
- `import:menu` also writes `menu-image-sources.generated.ts` (where each item's raw photo is, own or reference). The app never imports it; it's for choosing dish photos.

## Menu page

- `src/data/menu-sections.ts` (menu page only) turns the items into category sections in group order. Chicken/Beef versions of one dish (same category and description) become one row with both prices; the four platters get their own "Sharing platters" block in Feasts. `spicyDishes` there lists what gets the "Spicy" tag.
- `useMenuFilter` (`src/hooks/useMenuFilter.ts`) keeps `?group=&category=&q=` in the URL and replaces the history entry on every change. Import it from its module, not from `@/hooks`: through the index it lands in the main bundle. The search box has its own state; `?q=` is written after a 300 ms pause (Safari limits replaceState).
- Search: every word has to start a word in the name, description or category ("lat" finds Latte; "latte" doesn't find Platter). Case, accents and apostrophes don't matter.
- Replace navigations that only change the query string are not page changes: `ScrollRestorer` keeps the scroll position and `useRouteFocus` leaves focus alone. Saved positions are keyed by history key plus URL.
- The toolbar is sticky at `top-(--header-height)`, and that `top` never changes: a 1px sentinel marks it `data-stuck`, and base.css translates a stuck toolbar up into the header's place while the header hides. Changing `top` instead would log a layout shift on every hide/show. Anchors stop below it via `scroll-mt-(--menu-toolbar-height)` (measured at runtime). Scrolling more than a screen at once shows the header, so anchor offsets stay exact.
- Don't add `content-visibility: auto` to the category blocks: it halves the render cost of "All" but breaks the deep-link offsets (blocks above the target change height after the jump).
- Chip rows (`ChipRow`) are single-line horizontal scrollers so the toolbar never changes height: roving tab stop with arrow keys, snap, edge fades (`scroll-fade`), and edge buttons for fine pointers only.
- The first render shows only the first ~24 dishes; the rest follows at once in a transition, which React renders in slices (one 180-dish render was the page's longest task). `ScrollRestorer` keeps re-applying a saved position for up to a second so Back/reload still land deep in the list.
- Budget (gzipped): main ~67 KB, Menu ~14.5 KB, shared photo chunk ~3–4 KB, so `/menu` is ~85 KB; Home ~11 KB, so `/` is ~82 KB. Keep each page under 90 KB.

## Motion (details in docs/PLAN.md Motion)

- No animation libraries. CSS animations/transitions, the Web Animations API and View Transitions only.
- `src/lib/motion.ts` adds `js-motion` to `<html>` before the first render, only while reduced motion is off, and follows changes. Every hide-before-reveal style lives under `.js-motion` in base.css, so content is visible without it.
- Only transform, opacity and clip-path move; colours may fade; layout properties never animate.
- Hero entrance (`data-entrance`, first visit per page load only), `Reveal` (clip-path wipe, Signatures/SpaceFeature/Gallery photos only, never text), hover zoom (`Photo zoom`, triggered by an ancestor link or `data-zoom-group`), drawn link underlines (`link-draw` / `link-rest` on the span around link text).
- Menu filtering: `useCrossfade` runs chip/empty-state changes in a view transition (opacity fallback); the toolbar is a named `menu-toolbar` group that shows its new state at once, so the sliding tab indicator (three-piece pill in `ChipRow`) plays undisturbed. Search typing isn't crossfaded. While React renders the new results (~0.1s) the page can't take clicks.
- Durations and scales are tokens: `--duration-hero`, `--duration-crossfade`, `--motion-stagger`, `--scale-hero-from`, `--scale-hover`. Scripts read them with `durationToken()` / `easingToken()`.

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
Fonts: the Inter file only has the 400–500 weight range; nothing may ask for more (`b`, `strong` and `th` are 500 in base.css).
Measure with Lighthouse mobile on `npm run preview` (HTTP/1.1); production hosts serve HTTP/2, which is faster still.

## Workflow

- Work in phases. At the end of each phase, stop and report (what changed, checks run, open issues). Don't start the next phase without the user's go-ahead.
- Use installed skills where they fit: `frontend-design`, `design:design-system`, `design:accessibility-review`, `design:ux-copy`, `design:design-critique`, `engineering:testing-strategy`, `webapp-testing`.

## Open questions (confirm with the user before building the affected parts)

- **Menu grouping:** the source data has 25 categories, but PLAN.md defines 8 groups. A proposed mapping is in `src/data/menu.ts` (marked PROPOSAL) and still needs the user's OK. Feasts = the 4 sharing platters whose descriptions give a serving size. Breakfast (11 items) is provisionally under Mains.
- **Spelling:** "Eddy' s Khaas" (stray space) and "Poched Egg" are shown as published until the user confirms corrections.
- **Menu page labelling (PROPOSAL):** the "Spicy" tag list (`spicyDishes` in `src/data/menu-sections.ts`), the merged Chicken/Beef steak rows (shown as "Spicy Moroccan Steak" with both prices), and the "Sharing platters" heading for the four feasts.
- **Menu prices** come from the foodpanda listing (the CSV's source); confirm they match dine-in prices.
- **Hours:** Google Maps (dine-in) and foodpanda (delivery) disagree. The site should show Google Maps hours as opening hours unless the user says otherwise.
- **Instagram** `@theeddyscafe` was read off a table card in a photo; the profile hasn't been verified. It is linked in the footer (flagged in `src/data/cafe.ts`); confirm before launch.
- **WhatsApp:** no WhatsApp number is in the data. Don't assume it matches the phone number (+92 304 1112111) without confirmation. `cafe.whatsapp` is `null` and every WhatsApp button stays hidden until it's set.
