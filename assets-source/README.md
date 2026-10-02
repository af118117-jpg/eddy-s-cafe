# Photos

Source photos for the site. The build (vite-imagetools, the `photo` preset in
`vite.config.ts`) crops each one to its slot's ratio and writes AVIF, WebP and
JPEG at 480, 800, 1200, 1600 and 2400px wide. It never upscales: a photo
narrower than 2400px after cropping gets the sizes it can fill, plus one at its
own full width. These originals are never served.

The photos here are the café's own, copied from the source material in
`eddys-cafe-assets/` (which stays untouched): its Google Maps photos and, for
the six signature dishes, its promotional posters cropped to the food. Each was
turned upright, cropped where the table says, scaled so its short side is at
most 2400px, and saved without metadata (no location or camera data).

**Before launch:** confirm the café may publish each of these. Google Maps
photos can be uploads by customers rather than by the café, and the posters
are small (1080px) designs with text cropped away; the café's own originals
would be sharper.

To change a photo, save the new one over the file with the same name and
rewrite its alt text (where the table says). Give it at least 2400px of width
_after_ cropping where you can (1600px for gallery and dish photos); the crop
is centred. `npm run photos:placeholders` writes a cream placeholder for any
slot whose file is missing, and never overwrites a file.

## Slots

| File                   | Where                               | Crop                                    | Source (`eddys-cafe-assets/`)                           | Alt text                                |
| ---------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `hero.jpg`             | Home, full-screen hero              | 4:5 below 768px, 16:9 above (two crops) | `01-Google-Maps-Photos/google-maps-29.jpg`              | `home.hero` in `src/data/home.ts`       |
| `intro.jpg`            | Home, beside the intro              | 4:5                                     | `google-maps-02.jpg` (only 1080px wide)                 | `home.intro`                            |
| `feasts.jpg`           | Home, Feasts band                   | 4:5 (16:9 on phones, cropped by CSS)    | `google-maps-18.jpg`, a grilled plate: no platter photo | `home.feasts`                           |
| `drinks.jpg`           | Home, coffee and cold drinks        | 4:5                                     | `google-maps-32.jpg`                                    | `home.drinks`                           |
| `space.jpg`            | Home, wide interior photo           | 16:9 (21:9 from 768px, cropped by CSS)  | `google-maps-01.jpg`                                    | `home.space`                            |
| `map.jpg`              | Home, Visit, inside the Maps link   | 1:1                                     | `google-maps-04.jpg`, the storefront                    | `home.visit.mapImage`                   |
| `gallery/01.jpg`       | Home gallery, in name order         | 1:1                                     | `google-maps-24.jpg`                                    | `galleryAlts` in `home.ts`              |
| `gallery/02.jpg`       |                                     | 1:1                                     | `google-maps-15.jpg`                                    |                                         |
| `gallery/03.jpg`       |                                     | 1:1                                     | `google-maps-38.jpg` (only 1078px wide)                 |                                         |
| `gallery/04.jpg`       |                                     | 1:1                                     | `google-maps-36.jpg`                                    |                                         |
| `gallery/05.jpg`       |                                     | 1:1                                     | `google-maps-23.jpg`                                    |                                         |
| `gallery/06.jpg`       |                                     | 1:1                                     | `03-Food-Images/poched-egg.jpg`, the plate (620px)      |                                         |
| `gallery/07.jpg`       |                                     | 1:1                                     | `google-maps-08.jpg` (only 464px wide)                  |                                         |
| `gallery/08.jpg`       |                                     | 1:1                                     | `google-maps-02.jpg`, the lower half: the counter       |                                         |
| `gallery/09.jpg`       | (hidden on phones)                  | 1:1                                     | `google-maps-29.jpg`, the chairs on the right           |                                         |
| `dishes/<menu id>.jpg` | Home Signatures and menu thumbnails | 4:5 (1:1 thumbnails, cropped by CSS)    | the six posters in `03-Food-Images/`, see below         | `dishAlts` in `src/data/dish-photos.ts` |

Gallery 08 and 09 are details of the intro and hero photos, until the café has
more photos without people in them.

## Dishes

A file in `dishes/` named after a menu id (`src/data/menu.generated.ts`) is
picked up automatically. It shows on the home page and as a thumbnail for that
dish on the menu page. Add its alt text to `dishAlts`; the unit tests check
that every dish photo has one. The eight dishes under "From the menu" on the
home page show photos only once all eight have one; until then they are a
text list, not eight empty frames.

The six signature dishes use the café's posters (`03-Food-Images/<id>.jpg`),
cropped to the food so the title, the labels and the logo badge are left out.
That leaves 500 to 720px of width, enough for the menu thumbnails but soft in
the large Signatures slots: ask the café for the unedited photos. The other
dishes only have foodpanda stand-ins marked "For reference only"; leave them
without a photo until the café provides one.

## Not used

- `google-maps-20`, `-34` and `-44`: people can be recognised, so they need
  their permission first.
- A real map: nothing in the source material fits, so the Visit section shows
  the storefront inside its Google Maps link.
