import { Chip } from '@/components/ui'
import { menuGroups, type MenuGroupId } from '@/data'
import { ChipRow } from './ChipRow'

interface GroupTabsProps {
  /** null: All. */
  value: MenuGroupId | null
  onChange: (group: MenuGroupId | null) => void
  className?: string
}

/** The eight menu groups plus All, as toggle buttons (aria-pressed). */
export function GroupTabs({ value, onChange, className }: GroupTabsProps) {
  return (
    <ChipRow label="Menu sections" className={className}>
      <Chip
        pressed={value === null}
        onClick={() => {
          onChange(null)
        }}
      >
        All
      </Chip>
      {menuGroups.map((group) => (
        <Chip
          key={group.id}
          pressed={value === group.id}
          onClick={() => {
            onChange(group.id)
          }}
        >
          {group.label}
        </Chip>
      ))}
    </ChipRow>
  )
}
