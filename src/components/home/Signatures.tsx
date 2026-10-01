import { Photo, Reveal, SectionHeading } from '@/components/ui'
import { dishImage, home, type Signature } from '@/data'
import { cn } from '@/lib/cn'
import { photoSizes } from '@/lib/photoSizes'
import { DishText } from './DishText'

/**
 * Small dish: a compact row (thumbnail + text) on phones, a stacked image and
 * text from 768px. `square` uses a 1:1 image there instead of 4:5, so two
 * stacked dishes match the height of the large one beside them.
 */
function SmallDish({ signature, square = false }: { signature: Signature; square?: boolean }) {
  return (
    <article data-zoom-group className="flex gap-4 md:flex-col md:gap-4">
      <Reveal className="w-24 shrink-0 md:w-auto">
        <Photo
          image={dishImage(signature.item)}
          ratio="dish"
          sizes={square ? photoSizes.signatureStacked : photoSizes.signatureAcross}
          zoom
          className={cn(square && 'md:aspect-gallery')}
        />
      </Reveal>
      <DishText item={signature.item} description={signature.summary} compact className="flex-1" />
    </article>
  )
}

/**
 * Six dishes in an editorial arrangement: one large with two stacked beside
 * it, then three across. No card chrome; sizes carry the hierarchy.
 */
export function Signatures() {
  const { title, intro, items } = home.signatures
  const [feature, ...rest] = items
  const stacked = rest.slice(0, 2)
  const across = rest.slice(2)

  return (
    <section id="signatures" aria-labelledby="signatures-title" className="py-section">
      <div className="container flex flex-col gap-12">
        <SectionHeading id="signatures-title" title={title} intro={intro} />

        <div className="grid-layout gap-y-12">
          {feature && (
            <article
              data-zoom-group
              className="col-span-4 flex flex-col gap-6 md:col-span-2 lg:col-span-7"
            >
              <Reveal>
                <Photo
                  image={dishImage(feature.item)}
                  ratio="dish"
                  sizes={photoSizes.sevenColumns}
                  zoom
                />
              </Reveal>
              <DishText item={feature.item} description={feature.summary} large />
            </article>
          )}

          <div className="col-span-4 flex flex-col gap-8 md:col-span-2 lg:col-span-4 lg:col-start-9 lg:justify-between">
            {stacked.map((signature) => (
              <SmallDish key={signature.item.id} signature={signature} square />
            ))}
          </div>

          <div className="col-span-4 grid gap-8 md:grid-cols-3 md:gap-x-gutter-sm lg:col-span-12 lg:gap-x-gutter-lg">
            {across.map((signature) => (
              <SmallDish key={signature.item.id} signature={signature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
