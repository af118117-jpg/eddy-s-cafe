import { useEffect, useMemo, useState } from 'react'
import { cafe, type DayHours } from '@/data/cafe'
import { getOpenStatus, type OpenStatus } from '@/lib/openStatus'

function msUntilNextMinute(): number {
  return 60_000 - (Date.now() % 60_000)
}

/**
 * Live open/closed status in the café's time zone. Re-checks at the start of
 * every minute, and straight away when the tab becomes visible again
 * (background timers are throttled).
 */
export function useOpenStatus(
  week: readonly DayHours[] = cafe.openingHours,
  timeZone: string = cafe.timeZone,
): OpenStatus {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer = 0
    const tick = () => {
      setNow(new Date())
      timer = window.setTimeout(tick, msUntilNextMinute())
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    timer = window.setTimeout(tick, msUntilNextMinute())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return useMemo(() => getOpenStatus(week, now, timeZone), [week, now, timeZone])
}
