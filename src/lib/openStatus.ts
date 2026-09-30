import type { DayHours, DayName } from '@/data/cafe'
import { formatTime } from './hours'

export const WEEK: readonly DayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export type OpenStatus =
  | {
      isOpen: true
      /** The day whose hours are running now: Monday at 00:30 on Tuesday. */
      serviceDay: DayName
      /** "HH:MM" */
      closesAt: string
    }
  | {
      isOpen: false
      /** The day whose hours come next (or today, if none are left). */
      serviceDay: DayName
      /** "HH:MM" of the next opening, if the café opens at all. */
      opensAt?: string
      /** Set when the next opening isn't later today. */
      opensOn?: DayName
    }

function minutes(time: string): number {
  const [hours = '0', mins = '0'] = time.split(':')
  return Number(hours) * 60 + Number(mins)
}

/** Closing time is on the next calendar day (e.g. 11:00 to 01:00). */
function crossesMidnight(day: DayHours): boolean {
  return minutes(day.closes) <= minutes(day.opens)
}

/** Weekday and minutes past midnight at `date` in `timeZone`. */
export function zonedTime(date: Date, timeZone: string): { day: DayName; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const day = WEEK.find((name) => name === get('weekday'))
  if (!day) throw new Error(`Unexpected weekday: ${get('weekday')}`)
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

/** Whether the café is open at `date`, including sessions that run past midnight. */
export function getOpenStatus(week: readonly DayHours[], date: Date, timeZone: string): OpenStatus {
  const now = zonedTime(date, timeZone)
  const index = WEEK.indexOf(now.day)
  const hoursFor = (offset: number) => {
    const name = WEEK[(index + offset + 7) % 7]
    return week.find((entry) => entry.day === name)
  }

  // Still inside yesterday's late session (00:30 on Tuesday → Monday's hours).
  const yesterday = hoursFor(-1)
  if (yesterday && crossesMidnight(yesterday) && now.minutes < minutes(yesterday.closes)) {
    return { isOpen: true, serviceDay: yesterday.day, closesAt: yesterday.closes }
  }

  const today = hoursFor(0)
  if (today) {
    const opens = minutes(today.opens)
    const open = crossesMidnight(today)
      ? now.minutes >= opens
      : now.minutes >= opens && now.minutes < minutes(today.closes)
    if (open) return { isOpen: true, serviceDay: today.day, closesAt: today.closes }
    if (now.minutes < opens) return { isOpen: false, serviceDay: today.day, opensAt: today.opens }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const next = hoursFor(offset)
    if (next) return { isOpen: false, serviceDay: now.day, opensAt: next.opens, opensOn: next.day }
  }
  return { isOpen: false, serviceDay: now.day }
}

/** "Open now" / "until 1 AM", "Closed" / "until 11 AM" or "until Monday, 11 AM". */
export function describeOpenStatus(status: OpenStatus): { headline: string; detail: string } {
  if (status.isOpen) return { headline: 'Open now', detail: `until ${formatTime(status.closesAt)}` }
  if (!status.opensAt) return { headline: 'Closed', detail: '' }
  const time = formatTime(status.opensAt)
  return {
    headline: 'Closed',
    detail: status.opensOn ? `until ${status.opensOn}, ${time}` : `until ${time}`,
  }
}
