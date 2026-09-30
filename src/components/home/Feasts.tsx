import { Photo, Price, SectionHeading, ServesLabel } from '@/components/ui'
import { home } from '@/data'

/** Sharing platters on a cream band, with the serving size as big as the price. */
export function Feasts() {
  const { title, intro, items, image } = home.feasts
  return (
    <section id="feasts" data-surface="cream" aria-labelledby="feasts-title" className="py-section">
      <div className="container grid-layout gap-y-12">
        <div className="col-span-4 flex flex-col gap-8 lg:col-span-4">
          <SectionHeading id="feasts-title" title={title} intro={intro} />
          <Photo
            image={image}
            ratio="editorial"
            sizes="(width >= 64em) 33vw, 100vw"
            className="lg:aspect-dish"
          />
        </div>

        <ul className="col-span-4 border-t lg:col-span-7 lg:col-start-6">
          {items.map(({ item, serves, description }) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 border-b py-8 md:flex-row md:items-start md:justify-between md:gap-8"
            >
              <div className="flex flex-col gap-2 md:max-w-(--container-prose)">
                <h3 className="text-item-name">{item.name}</h3>
                <p className="text-small text-ink-muted">{description}</p>
              </div>
              <p className="flex shrink-0 items-baseline gap-6 md:flex-col md:items-end md:gap-1 md:text-right">
                <span className="text-h3">
                  <ServesLabel serves={serves} />
                </span>
                <Price amount={item.price} className="text-body-lg" />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
