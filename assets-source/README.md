# Photos

Source photos for the site. The build (vite-imagetools, the `photo` preset in
`vite.config.ts`) crops each one to its slot's ratio and writes AVIF, WebP and
JPEG at 480, 800, 1200, 1600 and 2400px wide. It never upscales, so a photo
narrower than 2400px after cropping simply gets fewer sizes. These originals
are never served.

**Every file here is a generated cream placeholder** (`npm run photos:placeholders`),
labelled with its own file name. To use a real photo, save it over the
placeholder with the same name. No code changes are needed apart from the alt
text, which describes the photo suggested below. If you use a different photo,
rewrite its alt text. The placeholder script never overwrites a file, so real
photos are safe.

Give each photo at least 2400px of width _after_ cropping where you can (1600px
for gallery and dish photos). The crop is centred.

## Slots

| File              | Where                               | Crop                                    | Suggested photo (`eddys-cafe-assets/`)             | Alt text                                |
| ----------------- | ----------------------------------- | --------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| `hero.jpg`        | Home, full-screen hero              | 4:5 below 768px, 16:9 above (two crops) | `01-Google-Maps-Photos/google-maps-29.jpg`         | none: decorative backdrop               |
| `intro.jpg`       | Home, beside the intro              | 4:5                                     | `google-maps-02.jpg` (only 1080px wide)            | `home.intro` in `src/data/home.ts`      |
| `feasts.jpg`      | Home, Feasts band                   | 4:5 (16:9 on phones, cropped by CSS)    | none yet: no platter photo in the material         | `home.feasts`                           |
| `drinks.jpg`      | Home, coffee and cold drinks        | 4:5                                     | `google-maps-32.jpg`                               | `home.drinks`                           |
| `space.jpg`       | Home, wide interior photo           | 16:9 (21:9 from 768px, cropped by CSS)  | `google-maps-01.jpg`                               | `home.space`                            |
| `gallery/01.jpg`  | Home gallery, in name order         | 1:1                                     | `google-maps-24.jpg`                               | `galleryAlts` in `home.ts`              |
| `gallery/02.jpg`  |                                     | 1:1                                     | `google-maps-15.jpg`                               |                                         |
| `gallery/03.jpg`  |                                     | 1:1                                     | `google-maps-38.jpg` (only 1078px wide)            |                                         |
| `gallery/04.jpg`  |                                     | 1:1                                     | `google-maps-36.jpg`                               |                                         |
| `gallery/05.jpg`  |                                     | 1:1                                     | `google-maps-23.jpg`                               |                                         |
| `gallery/06.jpg`  |                                     | 1:1                                     | `google-maps-18.jpg`                               |                                         |
| `gallery/07.jpg`  |                                     | 1:1                                     | `google-maps-08.jpg` (only 464px wide)             |                                         |
| `gallery/08.jpg`  |                                     | 1:1                                     | `google-maps-04.jpg`                               |                                         |
| `gallery/09.jpg`  | (hidden on phones)                  | 1:1                                     | `google-maps-20.jpg`: shows staff, ask them first  |                                         |
| `dishes/<id>.jpg` | Home Signatures and menu thumbnails | 4:5 (1:1 thumbnails, cropped by CSS)    | the café's posters in `03-Food-Images/`, see below | `dishAlts` in `src/data/dish-photos.ts` |

## Dishes

A file in `dishes/` named after a menu id (`src/data/menu.generated.ts`) is
picked up automatically. It replaces the cream block on the home page and
adds a thumbnail to that dish on the menu page. Add its alt text to `dishAlts`;
the unit tests check that every dish photo has one. The eight dishes under
"From the menu" on the home page show photos only once all eight have one;
until then they are a text list, not eight empty frames.

## Still missing

- **A map** for the Visit section, which shows an empty cream square inside
  the Google Maps link until then (`mapImage` in `src/data/home.ts`). Nothing in
  the source material fits: use a map you're allowed to publish (an
  illustrated one, or a static map whose terms allow it), save it as
  `map.jpg` here and import it in `home.ts` like the other photos.
- **A platter photo** for `feasts.jpg`; the material has none.

The six signature dishes have the café's own promotional posters
(`03-Food-Images/<id>.jpg`). They are only 1080 × 1420 and have the dish
name and labels printed across the top, so crop them to the plate or, better,
ask the café for the unedited photos. The other dishes only have foodpanda
stand-ins marked "For reference only"; leave them without a photo until the café
provides one.

Photos where people can be recognised (`google-maps-20`, `-34`, `-44`) need their
permission before they go on the site.
