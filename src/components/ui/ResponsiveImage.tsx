import { useContext } from 'react'
import type { ImageAsset, Picture } from '@/data/images'
import { cn } from '@/lib/cn'
import { RevealLoadContext } from './revealLoad'

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
  type: 'image/avif' | 'image/webp' | 'image/jpeg'
  /** Defaults to the image's `sizes`. */
  sizes?: string
  /** Art direction: only used where this media query matches. */
  media?: string
  /** Pixel size of this source, when it differs from the <img>'s (another crop). */
  width?: number
  height?: number
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
  /** Art-directed crops and modern formats, tried in order before the fallback <img>. */
  sources?: readonly ImageSource[]
  ratio?: ImageRatio
  /** For the LCP image: loads eagerly with fetchpriority="high". */
  priority?: boolean
}

/** No photo for this slot: a cream block of the right ratio. */
interface PlaceholderImageProps extends CommonProps {
  src?: undefined
  ratio: FixedImageRatio
}

export type ResponsiveImageProps = LoadedImageProps | PlaceholderImageProps

/**
 * <picture> in a fixed-ratio frame with a cream placeholder, so nothing moves
 * when the image arrives. Lazy and async unless `priority` is set, or a
 * Reveal around it says it's about to be shown.
 */
export function ResponsiveImage(props: ResponsiveImageProps) {
  const loadNow = useContext(RevealLoadContext)
  if (props.src === undefined) {
    const { alt, ratio, zoom = false, className } = props
    return (
      // No image content, so nothing for assistive tech to announce.
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
          key={`${source.media ?? ''} ${source.type}`}
          type={source.type}
          media={source.media}
          srcSet={source.srcSet}
          sizes={source.sizes ?? sizes}
          width={source.width}
          height={source.height}
        />
      ))}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority || loadNow ? 'eager' : 'lazy'}
        decoding={priority ? 'auto' : 'async'}
        {...priorityAttributes}
        className="size-full object-cover"
      />
    </picture>
  )
}

const MODERN_FORMATS = [
  ['avif', 'image/avif'],
  ['webp', 'image/webp'],
] as const

/** <source>s for the formats of one crop; `jpeg` too when it isn't the <img> fallback. */
function pictureSources(
  picture: Picture,
  options: { media?: string; sizes?: string; withJpeg?: boolean } = {},
): ImageSource[] {
  const { media, sizes, withJpeg = false } = options
  const formats = withJpeg ? [...MODERN_FORMATS, ['jpeg', 'image/jpeg'] as const] : MODERN_FORMATS
  return formats.flatMap(([format, type]) => {
    const srcSet = picture.sources[format]
    if (!srcSet) return []
    const size = media ? { width: picture.img.w, height: picture.img.h } : {}
    return [{ srcSet, type, media, sizes, ...size }]
  })
}

interface PhotoProps {
  image: ImageAsset
  ratio: FixedImageRatio
  /** How wide the photo is drawn at each viewport width (the `sizes` attribute). */
  sizes?: string
  /** `sizes` for the art-directed crop (`image.art`), if it has one. */
  artSizes?: string
  priority?: boolean
  /** Hover zoom (see ResponsiveImage). */
  zoom?: boolean
  className?: string
}

/**
 * Renders a photo slot from content data: AVIF and WebP sources with a JPEG
 * <img>, plus the art-directed crop first if there is one. Without a photo,
 * the slot's placeholder.
 */
export function Photo({ image, ratio, sizes, artSizes, priority, zoom, className }: PhotoProps) {
  const { alt, picture, art } = image
  if (!picture) {
    return <ResponsiveImage alt={alt} ratio={ratio} zoom={zoom} className={className} />
  }
  const sources = [
    ...(art
      ? pictureSources(art.picture, { media: art.media, sizes: artSizes, withJpeg: true })
      : []),
    ...pictureSources(picture),
  ]
  return (
    <ResponsiveImage
      src={picture.img.src}
      width={picture.img.w}
      height={picture.img.h}
      srcSet={picture.sources.jpeg}
      sizes={sizes}
      sources={sources}
      alt={alt}
      ratio={ratio}
      priority={priority}
      zoom={zoom}
      className={className}
    />
  )
}
