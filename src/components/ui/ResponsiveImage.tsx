import type { ImageAsset } from '@/data/images'
import { cn } from '@/lib/cn'

/**
 * dish 4:5 · editorial 16:9 · editorial-wide 21:9 · gallery 1:1.
 * intrinsic: the image's own width/height ratio. fill: fills a parent that
 * sets the size (e.g. a full-height hero).
 */
export type ImageRatio = 'dish' | 'editorial' | 'editorial-wide' | 'gallery' | 'intrinsic' | 'fill'
export type FixedImageRatio = Exclude<ImageRatio, 'intrinsic'>

const ratioClass: Record<FixedImageRatio, string> = {
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

interface CommonProps {
  /** Describe the photo. Pass "" only when it is purely decorative. */
  alt: string
  /** Classes for the frame. */
  className?: string
  /**
   * Scale the photo to 1.03 on hover, inside the frame. Hovering an ancestor
   * link or `data-zoom-group` element triggers it too.
   */
  zoom?: boolean
}

interface LoadedImageProps extends CommonProps {
  src: string
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
}

/** No photo yet (until Phase 7): a cream block of the right ratio. */
interface PlaceholderImageProps extends CommonProps {
  src?: undefined
  ratio: FixedImageRatio
}

export type ResponsiveImageProps = LoadedImageProps | PlaceholderImageProps

/**
 * <picture> in a fixed-ratio frame with a cream placeholder, so nothing moves
 * when the image arrives. Lazy and async unless `priority` is set.
 */
export function ResponsiveImage(props: ResponsiveImageProps) {
  if (props.src === undefined) {
    const { alt, ratio, zoom = false, className } = props
    return (
      // No image content yet, so nothing for assistive tech to announce.
      <div
        aria-hidden="true"
        data-placeholder
        data-zoom={zoom || undefined}
        className={cn('overflow-hidden', ratioClass[ratio], className)}
      >
        {/* The fill is the part that scales on hover, like the <img> of a real photo. */}
        <div data-placeholder-fill className="size-full bg-placeholder">
          {import.meta.env.DEV && ratio !== 'fill' && (
            // Dev only: which photo belongs here. Not on full-bleed slots, where it would sit under the header.
            <span className="block p-3 text-meta text-ink">{alt}</span>
          )}
        </div>
      </div>
    )
  }

  const {
    src,
    alt,
    width,
    height,
    srcSet,
    sizes,
    sources,
    ratio = 'intrinsic',
    priority = false,
    zoom = false,
    className,
  } = props
  // React 18 doesn't know the camelCase fetchPriority prop yet; set the attribute directly.
  const priorityAttributes = priority ? ({ fetchpriority: 'high' } as Record<string, string>) : {}

  return (
    <picture
      data-zoom={zoom || undefined}
      className={cn(
        'block overflow-hidden bg-placeholder',
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

interface PhotoProps {
  image: ImageAsset
  ratio: FixedImageRatio
  sizes?: string
  priority?: boolean
  /** Hover zoom (see ResponsiveImage). */
  zoom?: boolean
  className?: string
}

/** Renders a photo slot from content data: the photo once it exists, otherwise its placeholder. */
export function Photo({ image, ratio, sizes, priority, zoom, className }: PhotoProps) {
  if (image.src && image.width && image.height) {
    return (
      <ResponsiveImage
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        ratio={ratio}
        sizes={sizes}
        priority={priority}
        zoom={zoom}
        className={className}
      />
    )
  }
  return <ResponsiveImage alt={image.alt} ratio={ratio} zoom={zoom} className={className} />
}
