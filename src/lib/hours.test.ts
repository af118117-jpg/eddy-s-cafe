import { describe, expect, it } from 'vitest'
import { cafe } from '@/data'
import type { DayHours } from '@/data'
import { home } from '@/data/home'
import { pageMeta } from '@/data/site'
import { dailyOpening, describeHours, formatTime, summariseHours } from './hours'

describe('formatTime', () => {
  it('formats whole and part hours in 12-hour time', () => {
    expect(formatTime('11:00')).toBe('11 AM')
    expect(formatTime('01:00')).toBe('1 AM')
    expect(formatTime('13:30')).toBe('1:30 PM')
    expect(formatTime('12:00')).toBe('noon')
    expect(formatTime('00:00')).toBe('midnight')
  })
})

describe('summariseHours', () => {
  it('groups the café week into two lines', () => {
    expect(summariseHours(cafe.openingHours)).toEqual([
      { days: 'Monday to Thursday', hours: '11 AM to 1 AM' },
      { days: 'Friday to Sunday', hours: '11 AM to 2 AM' },
    ])
  })

  it('names pairs and single days plainly', () => {
    const week: DayHours[] = [
      { day: 'Friday', opens: '12:00', closes: '00:00' },
      { day: 'Saturday', opens: '10:00', closes: '23:00' },
      { day: 'Sunday', opens: '10:00', closes: '23:00' },
    ]
    expect(summariseHours(week)).toEqual([
      { days: 'Friday', hours: 'noon to midnight' },
      { days: 'Saturday and Sunday', hours: '10 AM to 11 PM' },
    ])
  })
})

describe('hours in running text', () => {
  it('describes the week as one phrase', () => {
    expect(describeHours(cafe.openingHours)).toBe(
      'Monday to Thursday from 11 AM to 1 AM and Friday to Sunday from 11 AM to 2 AM',
    )
    expect(describeHours(cafe.openingHours.slice(0, 1))).toBe('Monday from 11 AM to 1 AM')
  })

  it('gives a daily opening time only when every day opens then', () => {
    expect(dailyOpening(cafe.openingHours)).toBe('11 AM')
    const lateMonday = cafe.openingHours.map((day) =>
      day.day === 'Monday' ? { ...day, opens: '12:00' } : day,
    )
    expect(dailyOpening(lateMonday)).toBeNull()
    expect(dailyOpening(cafe.openingHours.slice(0, 6))).toBeNull()
  })

  it('is what the copy and the search snippet say, so neither restates the hours', () => {
    expect(home.intro.story.join(' ')).toContain(describeHours(cafe.openingHours))
    expect(pageMeta.home.description).toContain('Open daily from 11 AM.')
    expect(pageMeta.home.description).toContain(cafe.address.street)
  })
})
