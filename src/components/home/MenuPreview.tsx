import { useState } from 'react'
import { Button, Chip, Photo, SectionHeading } from '@/components/ui'
import { groupOf, home, menuGroups, type MenuGroupId } from '@/data'
import { DishText } from './DishText'

type Filter = MenuGroupId | 'all'

/** Eight featured dishes with group chips to filter them. */
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

          <ul className="grid gap-x-gutter-sm gap-y-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-gutter-lg">
            {visible.map((item) => (
              <li key={item.id} className="flex flex-col gap-4">
                <Photo
                  image={item.image}
                  ratio="dish"
                  sizes="(width >= 64em) 25vw, (width >= 48em) 50vw, 100vw"
                  // One column on phones: 16:9 keeps eight dishes from becoming a very long scroll.
                  className="max-md:aspect-editorial"
                />
                <DishText item={item} />
              </li>
            ))}
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
