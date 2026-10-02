/*
 * The hero photo's art direction, shared by the Hero component and the
 * preload that vite.config.ts writes into index.html. Both must use exactly
 * these strings, or the browser downloads the hero twice. No imports: the
 * Vite config loads this file directly.
 *
 * The hero fills the viewport and crops its photo with object-fit: cover, so
 * the photo is drawn wider than the screen whenever the screen is taller than
 * the crop. The sizes say so: 100vw while the viewport is wider than the crop,
 * otherwise the crop's ratio times the viewport height.
 */
export const heroImage = {
  /** The 16:9 crop from 768px (md) up; the 4:5 crop below. */
  wideMedia: '(min-width: 768px)',
  narrowMedia: 'not all and (min-width: 768px)',
  /** 4:5 crop: 4 / 5 × 100vh = 80vh. */
  narrowSizes: '(min-aspect-ratio: 4/5) 100vw, 80vh',
  /** 16:9 crop: 16 / 9 × 100vh ≈ 178vh. */
  wideSizes: '(min-aspect-ratio: 16/9) 100vw, 178vh',
} as const
