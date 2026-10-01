/*
 * `sizes` for the photos, worked out from the layout in base.css so the
 * browser picks the smallest file that is sharp enough. The container's
 * content box is 100vw − 40px below 768px, 100vw − 64px below 1024px, then
 * 100vw − 96px up to 1280px (reached at 1376px; 1440px at 1536px for
 * container-wide). Grid gutters are 16px, 24px from 1024px, so n of the 12
 * columns are n/12 × (100vw − 96px) − 6n − 24px wide.
 * tests/e2e/images.spec.ts checks every value against the rendered page.
 */
export const photoSizes = {
  /** 5 of 12 columns, half from 768px, full width below (Intro, DrinksSplit). */
  fiveColumns:
    '(min-width: 1376px) 519px, (min-width: 1024px) calc(41.67vw - 54px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 40px)',
  /** 7 of 12 columns, half from 768px, full width below (the large Signatures dish). */
  sevenColumns:
    '(min-width: 1376px) 737px, (min-width: 1024px) calc(58.33vw - 66px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 40px)',
  /** 6 of 12 columns, full width below 1024px (the Visit map). */
  sixColumns:
    '(min-width: 1376px) 628px, (min-width: 1024px) calc(50vw - 60px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)',
  /** 4 of 12 columns, full width below 1024px (Feasts). */
  fourColumns:
    '(min-width: 1376px) 411px, (min-width: 1024px) calc(33.33vw - 48px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)',
  /** Three across from 768px, two across below (Gallery). */
  gallery:
    '(min-width: 1376px) 411px, (min-width: 1024px) calc(33.33vw - 48px), (min-width: 768px) calc(33.33vw - 32px), calc(50vw - 28px)',
  /** Four across from 1024px, two from 768px, one below (MenuPreview). */
  fourAcross:
    '(min-width: 1376px) 302px, (min-width: 1024px) calc(25vw - 42px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 40px)',
  /** Small Signatures dish beside the large one: a third, half from 768px, a 96px thumbnail below. */
  signatureStacked:
    '(min-width: 1376px) 411px, (min-width: 1024px) calc(33.33vw - 48px), (min-width: 768px) calc(50vw - 40px), 96px',
  /** Small Signatures dish in the row of three: a third from 768px, a 96px thumbnail below. */
  signatureAcross:
    '(min-width: 1376px) 411px, (min-width: 1024px) calc(33.33vw - 48px), (min-width: 768px) calc(33.33vw - 32px), 96px',
  /** The full width of container-wide (SpaceFeature). */
  wide: '(min-width: 1536px) 1440px, (min-width: 1024px) calc(100vw - 96px), (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)',
  /** Menu page thumbnails (w-16). */
  thumbnail: '64px',
} as const
