import { Photo, Reveal } from '@/components/ui'
import { home } from '@/data'
import { photoSizes } from '@/lib/photoSizes'

/** A wide interior photo with a short caption (16:9 on phones, where 21:9 gets too thin). */
export function SpaceFeature() {
  const { caption, captionIsPlaceholder, image } = home.space
  return (
    <figure className="container-wide flex flex-col gap-4 py-section">
      <Reveal>
        <Photo
          image={image}
          ratio="editorial-wide"
          sizes={photoSizes.wide}
          className="max-md:aspect-editorial"
        />
      </Reveal>
      {/* TODO(copy): placeholder caption, see src/data/home.ts */}
      <figcaption
        data-todo={captionIsPlaceholder || undefined}
        className="prose-width text-small text-ink-muted"
      >
        {caption}
      </figcaption>
    </figure>
  )
}
