import { Chip } from '@/components/ui'
import type { MenuSection } from '@/data/menu-sections'
import { ChipRow } from './ChipRow'

interface CategoryChipsProps {
  /** The categories of the active group (all of them under All). */
  sections: readonly MenuSection[]
  /** Pressed category id; null for none. */
  value: string | null
  onChange: (category: string | null) => void
  className?: string
}

/** Second, quieter row: one category at a time. Pressing the pressed chip again clears it. */
export function CategoryChips({ sections, value, onChange, className }: CategoryChipsProps) {
  return (
    <ChipRow label="Categories" className={className}>
      {sections.map((section) => (
        <Chip
          key={section.id}
          variant="quiet"
          pressed={value === section.id}
          onClick={() => {
            onChange(value === section.id ? null : section.id)
          }}
        >
          {section.label}
        </Chip>
      ))}
    </ChipRow>
  )
}
