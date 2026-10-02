// Relative import with its extension: the Vite config loads this file (through src/data/site.ts).
import type { DayHours } from '../data/cafe.ts'

/** "11:00" → "11 AM", "13:30" → "1:30 PM", "00:00" → "midnight", "12:00" → "noon". */
export function formatTime(time: string): string {
  const [hourText = '0', minuteText = '00'] = time.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (minute === 0 && hour === 0) return 'midnight'
  if (minute === 0 && hour === 12) return 'noon'
  const period = hour < 12 ? 'AM' : 'PM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return minute === 0
    ? `${String(displayHour)} ${period}`
    : `${String(displayHour)}:${minuteText} ${period}`
}

export interface HoursGroup {
  /** "Monday to Thursday", "Saturday and Sunday" or "Friday". */
  days: string
  /** "11 AM to 1 AM" */
  hours: string
}

function dayRange(first: string, last: string, count: number): string {
  if (count === 1) return first
  if (count === 2) return `${first} and ${last}`
  return `${first} to ${last}`
}

/** Runs of consecutive days that share the same hours, in week order. */
export function groupHours(week: readonly DayHours[]): { days: DayHours[] }[] {
  const groups: { days: DayHours[] }[] = []
  for (const day of week) {
    const current = groups.at(-1)
    const sample = current?.days[0]
    if (current && sample && sample.opens === day.opens && sample.closes === day.closes) {
      current.days.push(day)
    } else {
      groups.push({ days: [day] })
    }
  }
  return groups
}

/** Groups consecutive days that share the same hours, for short summaries. */
export function summariseHours(week: readonly DayHours[]): HoursGroup[] {
  return groupHours(week).flatMap(({ days }) => {
    const first = days[0]
    const last = days.at(-1)
    if (!first || !last) return []
    return [
      {
        days: dayRange(first.day, last.day, days.length),
        hours: `${formatTime(first.opens)} to ${formatTime(first.closes)}`,
      },
    ]
  })
}

/**
 * The week's hours as a phrase for running text, so copy never restates them:
 * "Monday to Thursday from 11 AM to 1 AM and Friday to Sunday from 11 AM to 2 AM".
 */
export function describeHours(week: readonly DayHours[]): string {
  const parts = summariseHours(week).map(({ days, hours }) => `${days} from ${hours}`)
  const last = parts.pop() ?? ''
  return parts.length > 0 ? `${parts.join(', ')} and ${last}` : last
}

/** "11 AM" when all seven days open at the same time, otherwise null. */
export function dailyOpening(week: readonly DayHours[]): string | null {
  const times = new Set(week.map((day) => day.opens))
  const [opens] = times
  return week.length === 7 && times.size === 1 && opens ? formatTime(opens) : null
}
