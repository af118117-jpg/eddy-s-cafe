import { Chip } from '@/components/ui'
import { menuGroups, type MenuGroupId } from '@/data'
import { usePrefersReducedMotion } from '@/hooks'
import { ChipRow } from './ChipRow'

interface GroupTabsProps {
  /** null: All. */
  value: MenuGroupId | null
  onChange: (group: MenuGroupId | null) => void
  className?: string
}

/**
 * The eight menu groups plus All, as toggle buttons (aria-pressed). The
 * pressed fill slides from tab to tab; with reduced motion each chip simply
 * fills instead.
 */
export function GroupTabs({ value, onChange, className }: GroupTabsProps) {
  const slide = !usePrefersReducedMotion()
  const variant = slide ? 'tab' : 'outline'
  return (
    <ChipRow label="Menu sections" indicator={slide} className={className}>
      <Chip
        variant={variant}
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
          variant={variant}
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
