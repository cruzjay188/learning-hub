import { describe, expect, it } from 'vitest'
import { addDays, dayDiff, etNow, fDur, fLong, fShort, fTime, weekStart } from '../utils/dates.js'

describe('dates', () => {
  it('formats class times the way the schedule shows them', () => {
    expect(fTime('10:00')).toBe('10am')
    expect(fTime('13:30')).toBe('1:30pm')
    expect(fTime('')).toBe('')
  })

  it('formats dates', () => {
    expect(fShort('2026-10-19')).toBe('Mon Oct 19')
    expect(fLong('2026-10-19')).toBe('Monday, October 19')
  })

  it('does date math on ISO dates', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
    expect(dayDiff('2026-10-19', '2027-01-15')).toBe(88)
    expect(weekStart('2026-10-22')).toBe('2026-10-19') // Thursday → that week's Monday
    expect(weekStart('2026-10-25')).toBe('2026-10-19') // Sunday belongs to the week before
  })

  it('rounds durations', () => {
    expect(fDur(20)).toBe('20 min')
    expect(fDur(3)).toBe('5 min')
    expect(fDur(300)).toBe('5 hrs')
  })

  it('uses the debug clock in tests', () => {
    expect(etNow()).toEqual({ today: '2026-10-19', minutes: 11 * 60 + 15 })
  })
})
