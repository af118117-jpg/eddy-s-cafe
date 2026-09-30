import { Search, X } from 'lucide-react'
import type { RefObject } from 'react'
import { Icon } from '@/components/ui'
import { cn } from '@/lib/cn'

export const MENU_SEARCH_ID = 'menu-search'

interface MenuSearchProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  /** Says what is being searched, e.g. "Search Coffee & Tea". */
  placeholder: string
  inputRef?: RefObject<HTMLInputElement>
  className?: string
}

/**
 * Labelled search field. The clear button sits inside the field, so showing it
 * never moves anything; Escape clears too. Focus stays in the field.
 */
export function MenuSearch({
  value,
  onChange,
  onClear,
  placeholder,
  inputRef,
  className,
}: MenuSearchProps) {
  const clear = () => {
    onClear()
    inputRef?.current?.focus()
  }

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={MENU_SEARCH_ID} className="sr-only">
        Search the menu
      </label>
      <Icon
        icon={Search}
        size="md"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
      />
      <input
        ref={inputRef}
        id={MENU_SEARCH_ID}
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        onChange={(event) => {
          onChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault()
            clear()
          }
        }}
        // Room on the right for the clear button only while it's there, so the placeholder fits at 320px.
        className={cn(
          'h-control-md w-full border border-ink-muted bg-bg pl-12 text-body text-fg placeholder:text-ink-muted',
          value ? 'pr-12' : 'pr-4',
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute top-0 right-0 inline-flex size-(--spacing-control-md) items-center justify-center text-ink-muted transition-colors duration-(--duration-micro) ease-standard hover:text-fg"
        >
          <Icon icon={X} size="md" />
        </button>
      )}
    </div>
  )
}
