# eddy’s Café website

The website for eddy’s Café, 77 Green Avenue West, Canal Road, Faisalabad: a home page and the full menu.

It is a static, frontend-only site. There is no backend, database, login or payment: ordering links out to foodpanda, calls and directions open the phone and Google Maps. `npm run build` produces plain files in `dist/` that any static host can serve.

Built with Vite, React 18, TypeScript and Tailwind CSS v4. The design spec is [docs/PLAN.md](docs/PLAN.md); conventions for working on the code are in [CLAUDE.md](CLAUDE.md).

## Setup

You need Node.js 22.18 or later (24 LTS recommended; `.nvmrc` says 24).

```bash
npm install
npm run dev
```

The dev server prints its address (usually http://localhost:5173). `/styleguide` there shows every colour, type style and component.

The end-to-end tests need a browser. Install Playwright’s Chromium once with `npx playwright install chromium`, or use a browser that’s already installed: `PLAYWRIGHT_CHANNEL=msedge npm run e2e` (or `chrome`).

## Scripts

| Command                       | What it does                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Dev server with hot reload                                                                   |
| `npm run build`               | Type-checks, then builds the site into `dist/`                                               |
| `npm run preview`             | Serves `dist/` at http://localhost:4173, as a host would                                     |
| `npm run typecheck`           | TypeScript only                                                                              |
| `npm run lint`                | ESLint, including the design rules (no raw colours or pixel values outside the tokens)       |
| `npm run test`                | Unit tests (Vitest)                                                                          |
| `npm run e2e`                 | Browser tests (Playwright + axe) on the production build at 375, 768, 1280 and 1536px        |
| `npm run format`              | Prettier                                                                                     |
| `npm run import:menu`         | Regenerates the menu data from `src/data/menu.csv` (see below)                               |
| `npm run photos:placeholders` | Writes a cream placeholder for every photo slot that has no file in `assets-source/`         |
| `npm run icons`               | Favicon set and `site.webmanifest` from `public/favicon.svg` and the colour tokens           |
| `npm run og-image`            | `public/og-image.jpg`, the picture link previews show (needs a Playwright browser)           |
| `npm run screenshots`         | Builds, then saves full-page screenshots of both pages at six widths to `tests/screenshots/` |
| `npm run analyze`             | Builds and writes `reports/bundle.html`, a map of the JavaScript with gzipped sizes          |

Before deploying, run `npm run typecheck`, `npm run lint`, `npm run test` and `npm run e2e`. All four must pass.

## Updating the menu

The menu has two parts.

**Dishes, descriptions and prices** live in [`src/data/menu.csv`](src/data/menu.csv), one row per item. Its columns are `Section` (`Food` or `Drink`), `Category`, `Item Name`, `Description` and `Price` (`Rs. 1,299`, or `from Rs. 999` for items with sizes; prices with a comma need quotes, `"Rs. 1,299"`). The other columns are notes on where each photo came from and can be left empty for new items. After editing it:

```bash
npm run import:menu
npm run test
```

`import:menu` writes `src/data/menu.generated.ts` (the menu page) and `home-dishes.generated.ts` (the few dishes the home page shows). Never edit those two by hand: the next import overwrites them. Names are kept exactly as typed, spelling included.

**How the menu is organised** lives in [`src/data/menu.ts`](src/data/menu.ts):

- `menuGroups`: the eight groups the menu page filters by, in order.
- `categoryGroup`: which group each CSV category belongs to, and the order of categories within a group. If you add a new category to the CSV, add it here too; the type check fails until you do.
- `feastServes`: the sharing platters, shown under Feasts with a “Serves N” tag.

Two smaller lists sit next to it:

- [`src/data/menu-sections.ts`](src/data/menu-sections.ts) has `spicyDishes`, the dishes tagged “Spicy”.
- [`src/data/home-selection.ts`](src/data/home-selection.ts) says which dishes the home page features. Use the ids from `menu.generated.ts`, then run `npm run import:menu` again.

## Adding photos

Photos go in [`assets-source/`](assets-source/), and [its README](assets-source/README.md) lists every slot: file name, where it appears, its crop and the suggested photo. Every file there today is a cream placeholder with its own name printed on it, so **replace them all before launch**.

To use a photo, save it over the placeholder with the same name, as a JPEG. The build crops it to the slot’s ratio (centred) and writes AVIF, WebP and JPEG copies at 480 to 2400px wide, so give it at least 2400px of width after cropping where you can (1600px for dishes and the gallery). It never enlarges a small photo; it just makes fewer sizes.

Then write its alt text, a short description of what the photo shows:

| Photo                                | Alt text                                              |
| ------------------------------------ | ----------------------------------------------------- |
| `intro`, `feasts`, `drinks`, `space` | the `image.alt` of that section in `src/data/home.ts` |
| `gallery/01.jpg` … `09.jpg`          | `galleryAlts` in `src/data/home.ts`                   |
| `dishes/<menu id>.jpg`               | `dishAlts` in `src/data/dish-photos.ts`               |
| `hero.jpg`                           | none: it’s a backdrop under the wordmark              |

- **Dishes.** A photo named after a menu id (`dishes/adana-kebab.jpg`) is picked up automatically. It shows on the home page and as a thumbnail on the menu page. The eight dishes under “From the menu” on the home page show photos only once all eight have one; until then they appear as a text list.
- **Hero.** One photo, cropped 4:5 on phones and 16:9 from 768px. Keep the subject away from the bottom-left corner, where the wordmark sits.
- **Map.** The Visit section has an empty square for a map image (`mapImage` in `home.ts`, marked TODO). Add a map you’re allowed to publish as `assets-source/map.jpg` and import it there like the other photos.

The unit tests fail if a photo has no alt text.

## Changing hours and contact details

All the café’s facts are in one file, [`src/data/cafe.ts`](src/data/cafe.ts):

- `openingHours`: one line per day in 24-hour time, `{ day: 'Monday', opens: '11:00', closes: '01:00' }`. A closing time earlier than the opening time means after midnight.
- `phone`: `display` is what people see, `href` is the `tel:` link with no spaces.
- `whatsapp`: `null` for now, which hides every WhatsApp button. Set it to `{ display: '+92 …', href: 'https://wa.me/92…' }` once the café confirms the number.
- `address`, `coordinates` (they drive the directions link), `links` (Google Maps, foodpanda, Instagram) and `instagramHandle`.

Everything else reads from this file: the hours table, the live “Open now / Closed” label (worked out in Pakistan time, `timeZone`), the footer, the intro text, the search-engine description and the structured data Google reads. Run `npm run test` after a change.

## Before launch

- **Photos:** replace every placeholder in `assets-source/` (see above).
- **Domain:** the site doesn’t have one yet, so `https://eddys-cafe.example` stands in. Set the real address in `src/data/site.ts` (`siteUrl`), `public/robots.txt` and `public/sitemap.xml`; a test fails if the three disagree.
- **Copy:** search the code for `TODO` for the placeholder texts and the open questions.
- **Instagram:** `@theeddyscafe` was read off a table card in a photo and hasn’t been checked; confirm it’s the café’s account.

## Deploying

`npm run build` puts the finished site in `dist/`. It needs no server code, only a host that does three things:

1. Serves `menu.html` at `/menu`.
2. Serves `404.html`, with a 404 status, for any address that doesn’t exist.
3. Lets browsers cache `/assets/*` for a long time (those file names change whenever their content does).

The repository has the settings for Vercel and Netlify.

### Vercel

1. Push the repository to GitHub, GitLab or Bitbucket.
2. In Vercel, **Add New → Project** and import it. [`vercel.json`](vercel.json) sets the build command (`npm run build`), the output folder (`dist`), `cleanUrls` (which serves `menu.html` at `/menu`) and the cache headers. Vercel serves `404.html` for unknown addresses on its own.
3. Deploy, then add the café’s domain under **Settings → Domains**.

### Netlify

1. Push the repository to a Git provider.
2. In Netlify, **Add new site → Import an existing project** and pick it. [`netlify.toml`](netlify.toml) sets the build command, the `dist` folder, Node 24 and the cache headers. Netlify serves `/menu` from `menu.html` and unknown addresses from `404.html` on its own.
3. Deploy, then add the domain under **Domain management**.

You can also deploy without Git: run `npm run build` and drag the `dist` folder onto Netlify’s **Deploys** page, or run `npx vercel deploy --prod` from the project folder.

After the first deploy, open `/`, `/menu`, `/menu?group=desserts` and a made-up address such as `/nothing-here` on the live site and check each one loads the right page.
