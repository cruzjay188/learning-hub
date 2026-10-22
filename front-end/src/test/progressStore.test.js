import { describe, expect, it } from 'vitest'
import { createProgressStore } from '../lib/progressStore.js'
import { KEYS, readJSON } from '../lib/storage.js'

describe('progress store', () => {
  it('merges a lecture patch and saves it to this browser', () => {
    const p = createProgressStore()
    p.putLecture('ai-8', { steps: { s1: true } })
    p.putLecture('ai-8', { notes: 'JWT expiry?' })
    expect(p.lecture('ai-8')).toMatchObject({ steps: { s1: true }, notes: 'JWT expiry?' })
    expect(readJSON(KEYS.progress).lectures['ai-8'].notes).toBe('JWT expiry?')
  })

  it('logs today as a study day when you do something', () => {
    const p = createProgressStore()
    p.putLecture('ai-8', { steps: { s1: true } })
    expect(p.getState().activity.days['2026-10-19']).toBe(true)
    expect(p.getState().flash).toMatchObject({ day: '2026-10-19', met: false })
  })

  it("doesn't log a day for a quiet update", () => {
    const p = createProgressStore()
    p.putLecture('ai-8', { steps: { s1: true } }, { quiet: true })
    expect(p.getState().activity.days).toEqual({})
  })

  it('picks up where the last visit left off', () => {
    createProgressStore().setGoal(5)
    expect(createProgressStore().getState().goal).toEqual({ weeklyTarget: 5 })
  })

  it('tells subscribers about changes', () => {
    const p = createProgressStore()
    let calls = 0
    p.subscribe(() => { calls++ })
    p.putAssignment('hangman', { status: 'done' })
    expect(calls).toBeGreaterThan(0)
  })
})
