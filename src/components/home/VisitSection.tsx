import { Photo } from '@/components/ui'
import { cafe, home } from '@/data'
import { useOpenStatus } from '@/hooks/useOpenStatus'
import { describeOpenStatus } from '@/lib/openStatus'
import { ContactActions } from './ContactActions'
import { HoursTable } from './HoursTable'

/** Address, live open/closed status, the week's hours, contact buttons and a map link. */
export function VisitSection() {
  const { title, hoursTitle, mapImage } = home.visit
  const status = useOpenStatus()
  const { headline, detail } = describeOpenStatus(status)

  return (
    <section id="visit" aria-labelledby="visit-title" className="border-t py-section">
      <div className="container grid-layout gap-y-12">
        <div className="col-span-4 flex flex-col gap-12 lg:col-span-5">
          <div className="flex flex-col gap-6">
            <h2 id="visit-title" className="text-h2">
              {title}
            </h2>
            <address className="text-body-lg not-italic">
              {cafe.address.street}
              <br />
              {cafe.address.area}, {cafe.address.city} {cafe.address.postcode}
            </address>
            {/* Updates on its own at opening and closing time, so it's announced politely. */}
            <p role="status" className="text-body-lg">
              <span className="font-medium">{headline}</span> {detail}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 id="hours-title" className="text-item-name">
              {hoursTitle}
            </h3>
            <HoursTable
              week={cafe.openingHours}
              currentDay={status.serviceDay}
              labelledBy="hours-title"
            />
          </div>

          <ContactActions />
        </div>

        <a
          href={cafe.links.googleMaps}
          className="group col-span-4 flex flex-col gap-4 self-start lg:col-span-6 lg:col-start-7"
        >
          <Photo image={mapImage} ratio="gallery" sizes="(width >= 64em) 50vw, 100vw" />
          <span className="text-body underline decoration-beige-dark decoration-1 underline-offset-4 group-hover:decoration-current">
            Open in Google Maps
          </span>
        </a>
      </div>
    </section>
  )
}
