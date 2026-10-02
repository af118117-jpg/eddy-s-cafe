/**
 * One photo in every size and format, as vite-imagetools describes it for a
 * <picture> (the `photo` preset in vite.config.ts): a srcset per format, and
 * the largest JPEG as the fallback `src` with its pixel size.
 */
export interface Picture {
  sources: Partial<Record<'avif' | 'webp' | 'jpeg', string>>
  img: { src: string; w: number; h: number }
}

/** A photo slot. Without a `picture` it renders as a cream placeholder of the right ratio. */
export interface ImageAsset {
  /** Describes the photo for screen readers. "" only for purely decorative images. */
  alt: string
  /** The photo, from assets-source/ (see assets-source/README.md). */
  picture?: Picture
  /** Art direction: another crop of the photo, used where `media` matches (the hero's 16:9 crop). */
  art?: { media: string; picture: Picture }
}
