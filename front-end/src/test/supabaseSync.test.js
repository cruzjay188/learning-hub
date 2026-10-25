import { describe, expect, it } from 'vitest'
import { lectureRow, rowsToState, studyDays } from '../lib/supabaseSync.js'
import { authErrorAction, authErrorMessage, authErrorTarget, authFieldErrors, authFormError, userStorageKey } from '../utils/authUtils.js'

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

  it('turns a saved lecture back into a row, without saying whose it is (the database fills that in)', () => {
    const row = lectureRow('ai-8', { steps: { s2: true }, confidence: 2, ratedAt: 'r' })
    expect(row).toEqual({
      lecture_id: 'ai-8', steps: { s2: true }, notes: '', confidence: 2,
      rated_at: 'r', reviewed_at: null, touched_at: null, recall: { missed: [], got: [] },
    })
    expect(row).not.toHaveProperty('user_id')
  })

  it('only lets real dates into the study-days filter', () => {
    expect(studyDays({ days: { '2026-10-19': true, '2026-10-20': true } })).toEqual(['2026-10-19', '2026-10-20'])
    // a tampered browser copy can't inject filter syntax
    expect(studyDays({ days: { '2026-10-19),user_id.neq.(x': true, '2026-13-45': true, nope: true, '2026-10-21': false } })).toEqual([])
    expect(studyDays(null)).toEqual([])
  })
})

describe('account forms', () => {
  it('lists every problem at once, field by field', () => {
    expect(authFieldErrors({ name: '', email: '', password: '' }, 'register')).toEqual({
      name: 'Enter your name.', email: 'Enter your email address.', password: 'Enter your password.',
    })
    expect(authFieldErrors({ name: 'J', email: 'nope', password: '123' }, 'register')).toEqual({
      email: 'Enter an email address like name@example.com.', password: 'Use at least 6 characters.',
    })
    // log in doesn't check the name or the password's length
    expect(authFieldErrors({ name: '', email: 'a@b.co', password: '123' }, 'login')).toEqual({})
    expect(authFormError({ name: '', email: 'a@b.co', password: 'secret1' }, 'register')).toBe('Enter your name.')
  })

  it("never says which part of a login was wrong", () => {
    expect(authErrorMessage({ code: 'invalid_credentials' })).toBe('Wrong email or password. Check both and try again.')
  })

  it('sends server errors to the right place', () => {
    expect(authErrorTarget({ code: 'email_address_invalid' })).toBe('email')
    expect(authErrorTarget({ code: 'weak_password' })).toBe('password')
    expect(authErrorTarget({ code: 'invalid_credentials' })).toBe('banner')
    expect(authErrorAction({ code: 'user_already_exists' })).toBe('login')
    expect(authErrorAction({ code: 'invalid_credentials' })).toBe(null)
  })

  it('keeps one offline copy per student', () => {
    expect(userStorageKey('eagle-hub:v1', 'u1')).toBe('eagle-hub:v1:u1')
    expect(userStorageKey('eagle-hub:v1', null)).toBe('eagle-hub:v1')
  })
})
