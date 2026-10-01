import { Button, Photo, Reveal, SectionHeading } from '@/components/ui'
import { cafe, home } from '@/data'
import { cn } from '@/lib/cn'
import { photoSizes } from '@/lib/photoSizes'

/** 3 × 3 square photos (2 across on phones, where the ninth is dropped to keep rows even). */
export function Gallery() {
  const { title, instagramLabel, images } = home.gallery
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="py-section">
      <div className="container flex flex-col gap-12">
        <SectionHeading id="gallery-title" title={title} />
        <ul className="grid grid-cols-2 gap-gutter-sm md:grid-cols-3 lg:gap-gutter-lg">
          {images.map((image, index) => (
            <li key={image.alt} className={cn(index === 8 && 'max-md:hidden')}>
              <Reveal>
                <Photo image={image} ratio="gallery" sizes={photoSizes.gallery} zoom />
              </Reveal>
            </li>
          ))}
        </ul>
        <div>
          <Button href={cafe.links.instagram} variant="link" size="lg">
            {instagramLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
