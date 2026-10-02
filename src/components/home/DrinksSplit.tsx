import { Button, Photo, Price, SectionHeading } from '@/components/ui'
import { home, type MenuItem } from '@/data'

function PriceList({
  id,
  title,
  items,
}: {
  id: string
  title: string
  items: readonly MenuItem[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 id={id} className="text-item-name">
        {title}
      </h3>
      <ul aria-labelledby={id} className="border-t">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 border-b py-3">
            <span>{item.name}</span>
            <Price amount={item.price} from={item.priceFrom} className="shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** One large photo beside two short price lists. Section id matches the "Coffee" nav link. */
export function DrinksSplit() {
  const { title, coffeeTitle, coffee, coldTitle, cold, linkLabel, linkTo, image } = home.drinks
  return (
    <section id="coffee" aria-labelledby="coffee-title" className="py-section">
      <div className="container grid-layout items-start gap-y-12">
        <Photo
          image={image}
          ratio="dish"
          sizes="(width >= 64em) 40vw, (width >= 48em) 50vw, 100vw"
          className="col-span-4 md:col-span-2 lg:col-span-5"
        />
        <div className="col-span-4 flex flex-col gap-12 md:col-span-2 lg:col-span-6 lg:col-start-7">
          <SectionHeading id="coffee-title" title={title} />
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-x-gutter-sm md:grid-cols-1 lg:grid-cols-2 lg:gap-x-gutter-lg">
            <PriceList id="coffee-list-title" title={coffeeTitle} items={coffee} />
            <PriceList id="cold-list-title" title={coldTitle} items={cold} />
          </div>
          <div>
            <Button to={linkTo} variant="link" size="lg">
              {linkLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
