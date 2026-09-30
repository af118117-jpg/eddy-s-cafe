import { describe, expect, it } from 'vitest'
import { cafe } from '@/data'
import type { DayHours } from '@/data'
import { formatTime, summariseHours } from './hours'

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
