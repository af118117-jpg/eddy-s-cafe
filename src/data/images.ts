/**
 * A photo slot. Until the image pipeline runs (Phase 7) most slots have no
 * `src` and render as a cream placeholder of the right ratio.
 */
export interface ImageAsset {
  /** Describes the photo for screen readers. "" only for purely decorative images. */
  alt: string
  /** Optimised file under public/images. */
  src?: string
  /** Intrinsic size of `src`. */
  width?: number
  height?: number
  /** Raw file in eddys-cafe-assets/ to process in Phase 7. */
  source?: string
  /** "own": the café's photo. "reference": foodpanda stock, watermarked "For reference only". */
  sourceKind?: 'own' | 'reference'
}
