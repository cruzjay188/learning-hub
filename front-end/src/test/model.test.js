import { describe, expect, it } from 'vitest'
import data from '../../public/hub-data.json'
import { createModel } from '../utils/model.js'

const TODAY = '2026-10-19'
const empty = () => ({ lectures: {}, assignments: {}, goal: { weeklyTarget: 4 }, activity: { days: {} }, onboarded: null })
const model = (patch = {}) => createModel(data, { ...empty(), ...patch })

describe('lecture status', () => {
  it("marks today's lecture as now, past ones as not checked off, future ones as upcoming", () => {
    const m = model()
    expect(m.status(m.LB('ai-8'), TODAY)).toBe('now')
    expect(m.status(m.LB('ai-7'), TODAY)).toBe('notchecked')
    expect(m.status(m.LB('ai-9'), TODAY)).toBe('upcoming')
  })

  it('counts ticked steps and is done when every step is ticked', () => {
    let m = model()
    const l = m.LB('ai-8')
    const steps = Object.fromEntries(m.stepsOf(l).map((s) => [s.id, true]))
    m = model({ lectures: { 'ai-8': { steps: { s1: true } } } })
    expect(m.prog(l)).toEqual({ done: 1, total: m.stepsOf(l).length })
    expect(m.firstOpen(l).id).toBe('s2')
    m = model({ lectures: { 'ai-8': { steps } } })
    expect(m.status(l, TODAY)).toBe('done')
  })
})

describe('spaced review', () => {
  const ratedOn = (c) => model({ lectures: { 'ai-7': { confidence: c, ratedAt: '2026-10-19T15:00:00Z' } } })

  it('brings shaky lectures back sooner', () => {
    expect(ratedOn(1).reviewDue(ratedOn(1).LB('ai-7'))).toBe('2026-10-20') // next class day
    expect(ratedOn(2).reviewDue(ratedOn(2).LB('ai-7'))).toBe('2026-10-21') // 2 days
    expect(ratedOn(3).reviewDue(ratedOn(3).LB('ai-7'))).toBe('2026-10-23') // 4 days
    expect(ratedOn(4).reviewDue(ratedOn(4).LB('ai-7'))).toBe('2026-10-29') // 10 days
    expect(ratedOn(5).reviewDue(ratedOn(5).LB('ai-7'))).toBe(null) // could teach it: never
  })

  it('counts what is due', () => {
    const m = ratedOn(1)
    expect(m.dueCount('2026-10-19')).toBe(0)
    expect(m.dueCount('2026-10-20')).toBe(1)
  })
})

describe('up next', () => {
  it("points at today's lecture first", () => {
    const n = model().upNext(TODAY, 11 * 60)
    expect(n.l.id).toBe('ai-8')
    expect(n.s.id).toBe('s1')
    expect(n.why).toBe('today')
  })

  it('says tonight after class ends', () => {
    expect(model().upNext(TODAY, 19 * 60).why).toBe('tonight')
  })
})

describe('assignments and goals', () => {
  it('lets a status set in the hub override progress.md', () => {
    const m = model()
    const a = data.assignments.find((x) => x.status !== 'quiz' && x.status !== 'done')
    expect(m.assignStatus(a)).toBe(a.status)
    expect(model({ assignments: { [a.id]: { status: 'done' } } }).assignStatus(a)).toBe('done')
  })

  it('counts a weekly streak when the goal is met', () => {
    const days = { '2026-10-12': true, '2026-10-13': true, '2026-10-14': true, '2026-10-15': true }
    const s = model({ activity: { days } }).streaks(TODAY)
    expect(s.cur).toBe(1)
    expect(s.metThisWeek).toBe(false)
    expect(s.count).toBe(0)
  })
})
