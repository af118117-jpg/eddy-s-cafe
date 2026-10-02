import type { DayHours, DayName } from '@/data'
import { formatTime } from '@/lib/hours'
import { cn } from '@/lib/cn'

interface HoursTableProps {
  week: readonly DayHours[]
  /** The day whose hours apply right now; its row is marked aria-current="date". */
  currentDay: DayName
  /** id of the visible heading that names the table. */
  labelledBy: string
}

/** A real table: day headers per row, hours in the second column. */
export function HoursTable({ week, currentDay, labelledBy }: HoursTableProps) {
  return (
    <table aria-labelledby={labelledBy} className="w-full border-t text-body">
      <thead className="sr-only">
        <tr>
          <th scope="col">Day</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {week.map((entry) => {
          const current = entry.day === currentDay
          return (
            <tr
              key={entry.day}
              aria-current={current ? 'date' : undefined}
              // Not colour alone: the current row is also set in medium weight.
              className={cn('border-b', current && 'bg-cream font-medium')}
            >
              <th
                scope="row"
                className={cn('py-3 pl-3 text-left', current ? 'font-medium' : 'font-normal')}
              >
                {entry.day}
              </th>
              <td className="py-3 pr-3 text-right tabular-nums">
                {formatTime(entry.opens)} to {formatTime(entry.closes)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
