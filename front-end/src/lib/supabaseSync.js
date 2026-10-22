// Saving progress to Supabase. The progress store saves "documents" by path, the same ones the
// claude.ai version uses (lectures/<id>, assignments/<id>, meta/goal, meta/activity, meta/onboarded).
// This file turns those into rows in the student's own tables (supabase/migrations/…_student_progress.sql),
// and turns the rows back into the store's shape when the student logs in.

// ---------- rows → store (pure, tested in src/test/supabaseSync.test.js) ----------
export function rowsToState({ lectures = [], assignments = [], days = [], settings = null }) {
  return {
    lectures: Object.fromEntries(lectures.map((r) => [r.lecture_id, {
      steps: r.steps || {}, notes: r.notes || '', confidence: r.confidence || 0,
      ratedAt: r.rated_at, reviewedAt: r.reviewed_at, touchedAt: r.touched_at,
      recall: r.recall || { missed: [], got: [] }, updatedAt: r.updated_at,
    }])),
    assignments: Object.fromEntries(assignments.map((r) => [r.assignment_id, { status: r.status, done: r.status === 'done', updatedAt: r.updated_at }])),
    activity: { days: Object.fromEntries(days.map((r) => [r.day, true])) },
    goal: { weeklyTarget: settings ? settings.weekly_target : 4 },
    onboarded: settings && settings.onboarded_at ? { at: settings.onboarded_at, ...(settings.onboarding_skipped ? { skipped: true } : {}) } : null,
  }
}

// ---------- store document → row (pure) ----------
export function lectureRow(userId, lectureId, d) {
  return {
    user_id: userId, lecture_id: lectureId, steps: d.steps || {}, notes: d.notes || '', confidence: d.confidence || 0,
    rated_at: d.ratedAt || null, reviewed_at: d.reviewedAt || null, touched_at: d.touchedAt || null,
    recall: d.recall || { missed: [], got: [] },
  }
}

// Wraps a Supabase error so the progress store can tell "offline" from "refused".
function check({ error }) {
  if (error) throw Object.assign(new Error(error.message), { code: error.code || 'error' })
}

// What the progress store calls: db.doc(path).set(body)
function makeDb(client, userId) {
  const upsert = (table, row, onConflict) => client.from(table).upsert(row, { onConflict }).then(check)
  async function set(path, body) {
    const [kind, id] = path.split('/')
    if (kind === 'lectures') return upsert('lecture_progress', lectureRow(userId, id, body), 'user_id,lecture_id')
    if (kind === 'assignments') return upsert('assignment_status', { user_id: userId, assignment_id: id, status: body.status }, 'user_id,assignment_id')
    if (path === 'meta/goal') return upsert('student_settings', { user_id: userId, weekly_target: body.weeklyTarget }, 'user_id')
    if (path === 'meta/onboarded') return upsert('student_settings', { user_id: userId, onboarded_at: body ? body.at : null, onboarding_skipped: !!(body && body.skipped) }, 'user_id')
    if (path === 'meta/activity') {
      // the set of study days: add the new ones, remove any that were taken away
      const days = Object.keys(body.days || {}).filter((d) => body.days[d])
      let del = client.from('study_days').delete().eq('user_id', userId)
      if (days.length) del = del.not('day', 'in', `(${days.join(',')})`)
      check(await del)
      if (days.length) check(await client.from('study_days').upsert(days.map((day) => ({ user_id: userId, day })), { onConflict: 'user_id,day', ignoreDuplicates: true }))
      return
    }
    throw new Error(`unknown path ${path}`)
  }
  return { doc: (path) => ({ set: (body) => set(path, body) }) }
}

// Everything this student has saved, in one round of requests (RLS returns only their rows).
async function loadAll(client) {
  const [lectures, assignments, days, settings] = await Promise.all([
    client.from('lecture_progress').select('*'),
    client.from('assignment_status').select('*'),
    client.from('study_days').select('day'),
    client.from('student_settings').select('*').maybeSingle(),
  ])
  ;[lectures, assignments, days, settings].forEach(check)
  return rowsToState({ lectures: lectures.data, assignments: assignments.data, days: days.data, settings: settings.data })
}

// Logs the store into Supabase: loads the student's progress, then sends every change.
// Coming back to the tab reloads it, so another device's changes show up.
export async function connectSupabase(store, client, userId, { onWriteError } = {}) {
  try {
    store.applyRemote(await loadAll(client))
  } catch {
    store.setState({ mode: 'error' })
    return () => {}
  }
  store.attach(makeDb(client, userId), { onWriteError })
  store.setState({ mode: 'cloud' })
  const onFocus = () => {
    if (document.visibilityState !== 'visible' || store.getState().saving > 0) return
    loadAll(client).then((s) => store.applyRemote(s)).catch(() => {})
  }
  document.addEventListener('visibilitychange', onFocus)
  return () => document.removeEventListener('visibilitychange', onFocus)
}
