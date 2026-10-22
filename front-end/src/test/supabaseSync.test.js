import { describe, expect, it } from 'vitest'
import { lectureRow, rowsToState } from '../lib/supabaseSync.js'
import { authErrorMessage, authFormError, userStorageKey } from '../utils/authUtils.js'

describe('Supabase rows ⇄ the progress store', () => {
  it('turns a student’s rows into the shape the hub uses', () => {
    const s = rowsToState({
      lectures: [{ lecture_id: 'ai-8', steps: { s1: true }, notes: 'JWT?', confidence: 3, rated_at: '2026-10-19T15:00:00Z', reviewed_at: null, touched_at: null, recall: { missed: ['RLS'], got: [] }, updated_at: 'x' }],
      assignments: [{ assignment_id: 'hangman', status: 'done', updated_at: 'y' }],
      days: [{ day: '2026-10-19' }, { day: '2026-10-20' }],
      settings: { weekly_target: 5, onboarded_at: '2026-10-19T12:00:00Z', onboarding_skipped: true },
    })
    expect(s.lectures['ai-8']).toMatchObject({ steps: { s1: true }, notes: 'JWT?', confidence: 3, ratedAt: '2026-10-19T15:00:00Z', recall: { missed: ['RLS'], got: [] } })
    expect(s.assignments.hangman).toMatchObject({ status: 'done', done: true })
    expect(s.activity.days).toEqual({ '2026-10-19': true, '2026-10-20': true })
    expect(s.goal).toEqual({ weeklyTarget: 5 })
    expect(s.onboarded).toEqual({ at: '2026-10-19T12:00:00Z', skipped: true })
  })

  it('gives a brand-new student the defaults', () => {
    expect(rowsToState({})).toEqual({ lectures: {}, assignments: {}, activity: { days: {} }, goal: { weeklyTarget: 4 }, onboarded: null })
  })

  it('turns a saved lecture back into a row for this student', () => {
    expect(lectureRow('u1', 'ai-8', { steps: { s2: true }, confidence: 2, ratedAt: 'r' })).toEqual({
      user_id: 'u1', lecture_id: 'ai-8', steps: { s2: true }, notes: '', confidence: 2,
      rated_at: 'r', reviewed_at: null, touched_at: null, recall: { missed: [], got: [] },
    })
  })
})

describe('account forms', () => {
  it('checks the form before sending it', () => {
    expect(authFormError({ name: '', email: 'a@b.co', password: 'secret1' }, 'register')).toBe('Enter your name.')
    expect(authFormError({ name: 'J', email: 'nope', password: 'secret1' }, 'login')).toBe('Enter a valid email address.')
    expect(authFormError({ name: 'J', email: 'a@b.co', password: '123' }, 'register')).toMatch(/at least 6/)
    expect(authFormError({ name: '', email: 'a@b.co', password: '123' }, 'login')).toBe(null)
  })

  it("never says which part of a login was wrong", () => {
    expect(authErrorMessage({ code: 'invalid_credentials' })).toBe('Wrong email or password.')
  })

  it('keeps one offline copy per student', () => {
    expect(userStorageKey('eagle-hub:v1', 'u1')).toBe('eagle-hub:v1:u1')
    expect(userStorageKey('eagle-hub:v1', null)).toBe('eagle-hub:v1')
  })
})
