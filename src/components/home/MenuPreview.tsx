import { useState } from 'react'
import { Button, Chip, Photo, SectionHeading } from '@/components/ui'
import { dishImage, groupOf, home, menuGroups, type MenuGroupId } from '@/data'
import { cn } from '@/lib/cn'
import { photoSizes } from '@/lib/photoSizes'
import { DishText } from './DishText'

type Filter = MenuGroupId | 'all'

const withPhotos = home.menuPreview.items.every((item) => dishImage(item).picture)

/**
 * Eight featured dishes with group chips to filter them. They show photos only
 * once every one of them has one (assets-source/dishes/<id>.jpg); until then
 * they read as a printed menu rather than eight empty frames, which also
 * keeps them from repeating the photo-led Signatures above.
 */
export function MenuPreview() {
  const { title, linkLabel, items } = home.menuPreview
  const [filter, setFilter] = useState<Filter>('all')

  const present = new Set(items.map(groupOf))
  const groups = menuGroups.filter((group) => present.has(group.id))
  const visible = filter === 'all' ? items : items.filter((item) => groupOf(item) === filter)
  const count = `Showing ${String(visible.length)} ${visible.length === 1 ? 'dish' : 'dishes'}`

  return (
    <section id="menu-preview" aria-labelledby="menu-preview-title" className="border-t py-section">
      <div className="container flex flex-col gap-12">
        <SectionHeading id="menu-preview-title" title={title} />

        <div className="flex flex-col gap-8">
          <div role="group" aria-label="Filter dishes" className="flex flex-wrap gap-2">
            <Chip
              pressed={filter === 'all'}
              onClick={() => {
                setFilter('all')
              }}
            >
              All
            </Chip>
            {groups.map((group) => (
              <Chip
                key={group.id}
                pressed={filter === group.id}
                onClick={() => {
                  setFilter(group.id)
                }}
              >
                {group.label}
              </Chip>
            ))}
          </div>
          {/* Announces the new count after a filter is chosen. */}
          <p aria-live="polite" className="sr-only">
            {count}
          </p>

          <ul
            className={cn(
              'grid gap-x-gutter-sm md:grid-cols-2 lg:grid-cols-4 lg:gap-x-gutter-lg',
              withPhotos ? 'gap-y-12' : 'gap-y-8',
            )}
          >
            {visible.map((item) =>
              withPhotos ? (
                <li key={item.id} data-zoom-group className="flex flex-col gap-4">
                  <Photo
                    image={dishImage(item)}
                    ratio="dish"
                    sizes={photoSizes.fourAcross}
                    zoom
                    // One column on phones: 16:9 keeps eight dishes from becoming a very long scroll.
                    className="max-md:aspect-editorial"
                  />
                  <DishText item={item} />
                </li>
              ) : (
                <li key={item.id} className="border-t pt-4">
                  <DishText item={item} />
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <Button to="/menu" variant="link" size="lg">
            {linkLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
