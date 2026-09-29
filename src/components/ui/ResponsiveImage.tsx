import { cn } from '@/lib/cn'

/**
 * dish 4:5 · editorial 16:9 · editorial-wide 21:9 · gallery 1:1.
 * intrinsic: the image's own width/height ratio. fill: fills a parent that
 * sets the size (e.g. a full-height hero).
 */
export type ImageRatio = 'dish' | 'editorial' | 'editorial-wide' | 'gallery' | 'intrinsic' | 'fill'

const ratioClass: Record<Exclude<ImageRatio, 'intrinsic'>, string> = {
  dish: 'aspect-dish',
  editorial: 'aspect-editorial',
  'editorial-wide': 'aspect-editorial-wide',
  gallery: 'aspect-gallery',
  fill: 'size-full',
}

export interface ImageSource {
  srcSet: string
  type: 'image/avif' | 'image/webp'
  /** Defaults to the image's `sizes`. */
  sizes?: string
}

interface ResponsiveImageProps {
  src: string
  /** Describe the photo. Pass "" only when it is purely decorative. */
  alt: string
  /** Intrinsic pixel size of `src`; reserves space before load. */
  width: number
  height: number
  srcSet?: string
  sizes?: string
  /** Modern formats, tried in order before the fallback <img>. */
  sources?: readonly ImageSource[]
  ratio?: ImageRatio
  /** For the LCP image: loads eagerly with fetchpriority="high". */
  priority?: boolean
  /** Classes for the <picture> frame. */
  className?: string
}

/**
 * <picture> in a fixed-ratio frame with a cream placeholder, so nothing moves
 * when the image arrives. Lazy and async unless `priority` is set.
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  sources,
  ratio = 'intrinsic',
  priority = false,
  className,
}: ResponsiveImageProps) {
  // React 18 doesn't know the camelCase fetchPriority prop yet; set the attribute directly.
  const priorityAttributes = priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {}

  return (
    <picture
      className={cn(
        'block overflow-hidden bg-cream',
        ratio !== 'intrinsic' && ratioClass[ratio],
        className,
      )}
      style={
        ratio === 'intrinsic' ? { aspectRatio: `${String(width)} / ${String(height)}` } : undefined
      }
    >
      {sources?.map((source) => (
        <source
          key={source.type}
          type={source.type}
          srcSet={source.srcSet}
          sizes={source.sizes ?? sizes}
        />
      ))}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'auto' : 'async'}
        {...priorityAttributes}
        className="size-full object-cover"
      />
    </picture>
  )
}
