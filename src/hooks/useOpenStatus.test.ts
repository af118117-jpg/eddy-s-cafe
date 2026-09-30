import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cafe } from '@/data'
import { describeOpenStatus, getOpenStatus } from '@/lib/openStatus'
import { useOpenStatus } from './useOpenStatus'

// Karachi is UTC+5 all year (no daylight saving). 2026-09-28 is a Monday.
const karachi = (isoLocal: string) => new Date(`${isoLocal}+05:00`)
const statusAt = (isoLocal: string) =>
  getOpenStatus(cafe.openingHours, karachi(isoLocal), cafe.timeZone)

describe('getOpenStatus', () => {
  it('is open during the day', () => {
    expect(statusAt('2026-09-30T15:00:00')).toEqual({
      isOpen: true,
      serviceDay: 'Wednesday',
      closesAt: '01:00',
    })
  })

  it('is still open at 00:30 on a weekday, on the previous day’s hours', () => {
    // Tuesday 00:30 belongs to Monday's 11 AM to 1 AM session.
    expect(statusAt('2026-09-29T00:30:00')).toEqual({
      isOpen: true,
      serviceDay: 'Monday',
      closesAt: '01:00',
    })
  })

  it('closes exactly at the closing time', () => {
    expect(statusAt('2026-09-29T00:59:00').isOpen).toBe(true)
    expect(statusAt('2026-09-29T01:00:00')).toEqual({
      isOpen: false,
      serviceDay: 'Tuesday',
      opensAt: '11:00',
    })
  })

  it('stays open until 2 AM after Friday and Saturday', () => {
    expect(statusAt('2026-10-03T01:30:00')).toMatchObject({ isOpen: true, serviceDay: 'Friday' })
    expect(statusAt('2026-10-04T01:59:00')).toMatchObject({ isOpen: true, serviceDay: 'Saturday' })
    expect(statusAt('2026-10-04T02:00:00').isOpen).toBe(false)
  })

  it('crosses the week boundary: Monday 01:30 is Sunday night', () => {
    expect(statusAt('2026-10-05T01:30:00')).toMatchObject({ isOpen: true, serviceDay: 'Sunday' })
  })

  it('is closed before opening and opens at 11 AM', () => {
    expect(statusAt('2026-09-30T10:59:00')).toEqual({
      isOpen: false,
      serviceDay: 'Wednesday',
      opensAt: '11:00',
    })
    expect(statusAt('2026-09-30T11:00:00').isOpen).toBe(true)
  })

  it('uses the café’s time zone, not the visitor’s', () => {
    // 20:00 UTC on Monday is 01:00 on Tuesday in Karachi: just closed.
    const status = getOpenStatus(cafe.openingHours, new Date('2026-09-28T20:00:00Z'), cafe.timeZone)
    expect(status).toMatchObject({ isOpen: false, serviceDay: 'Tuesday' })
  })

  it('finds the next opening day when today has no hours', () => {
    const weekdaysOnly = cafe.openingHours.filter(
      (entry) => entry.day !== 'Saturday' && entry.day !== 'Sunday',
    )
    const status = getOpenStatus(weekdaysOnly, karachi('2026-10-03T15:00:00'), cafe.timeZone)
    expect(status).toEqual({
      isOpen: false,
      serviceDay: 'Saturday',
      opensAt: '11:00',
      opensOn: 'Monday',
    })
    expect(describeOpenStatus(status)).toEqual({
      headline: 'Closed',
      detail: 'until Monday, 11 AM',
    })
  })
})

describe('describeOpenStatus', () => {
  it('writes short, plain labels', () => {
    expect(describeOpenStatus(statusAt('2026-09-29T00:30:00'))).toEqual({
      headline: 'Open now',
      detail: 'until 1 AM',
    })
    expect(describeOpenStatus(statusAt('2026-09-29T03:00:00'))).toEqual({
      headline: 'Closed',
      detail: 'until 11 AM',
    })
  })
})

describe('useOpenStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('flips from open to closed when the clock passes closing time', () => {
    vi.setSystemTime(karachi('2026-09-29T00:59:30'))
    const { result } = renderHook(() => useOpenStatus())
    expect(result.current).toMatchObject({ isOpen: true, serviceDay: 'Monday' })

    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(result.current).toMatchObject({ isOpen: false, serviceDay: 'Tuesday', opensAt: '11:00' })
  })
})
