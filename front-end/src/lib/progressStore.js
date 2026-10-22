// Your progress: step ticks, ratings, notes, assignment statuses, weekly goal and study days.
// Every change saves to this browser right away, and to the student's account: Supabase when
// they're logged in (supabaseSync.js), or claude.ai when the page runs as the artifact (cloud.js).
// `mode` is what the Save badge in the top bar shows.
import { addDays, etNow, weekStart } from '../utils/dates.js'
import { createStore } from './store.js'
import { KEYS, readJSON, writeJSON } from './storage.js'

const EMPTY_LECTURE = { steps: {}, notes: '', confidence: 0 }
const SAVED = ['lectures', 'assignments', 'goal', 'activity', 'onboarded']

// key: where this browser keeps its offline copy (one per student when accounts are on).
export function createProgressStore({ load = true, key = KEYS.progress } = {}) {
  const saved = load ? readJSON(key) : null
  const store = createStore({
    lectures: {}, assignments: {}, goal: { weeklyTarget: 4 }, activity: { days: {} }, onboarded: null,
    ...(saved ? pick(saved) : {}),
    mode: 'loading', // loading | local | cloud | readonly | error
    saving: 0,
    flash: null, // { day, met, at }: today was just logged, so the goal dot pops
  })
  let db = null
  let onError = () => {}
  const chains = {}

  const saveLocal = () => writeJSON(key, pick(store.getState()))

  // Save one document. Writes to the same path run in order.
  function writeDoc(path, body) {
    saveLocal()
    if (!db || store.getState().mode !== 'cloud') return Promise.resolve()
    store.setState((s) => ({ saving: s.saving + 1 }))
    const run = (chains[path] || Promise.resolve())
      .then(() => db.doc(path).set(body))
      .catch((e) => {
        const mode = e && e.code === 'invalid_argument' ? 'readonly' : e && e.code === 'unavailable' ? store.getState().mode : 'error'
        store.setState({ mode })
        if (mode === 'error') onError()
      })
      .finally(() => store.setState((s) => ({ saving: s.saving - 1 })))
    chains[path] = run
    return run
  }

  const weekCount = (days, mon) => { let n = 0; for (let i = 0; i < 7; i++) if (days[addDays(mon, i)]) n++; return n }

  // Logs today as a study day (the weekly goal counts these).
  function markActive(on = true) {
    const { today } = etNow()
    const s = store.getState()
    const days = { ...(s.activity.days || {}) }
    if (on) { if (days[today]) return; days[today] = true } else delete days[today]
    const target = s.goal.weeklyTarget || 4
    const before = weekCount(s.activity.days || {}, weekStart(today))
    const activity = { days }
    store.setState({
      activity,
      ...(on ? { flash: { day: today, met: before < target && weekCount(days, weekStart(today)) >= target, at: Date.now() } } : {}),
    })
    writeDoc('meta/activity', activity)
  }

  return {
    ...store,
    lecture: (id) => store.getState().lectures[id] || EMPTY_LECTURE,
    putLecture(id, patch, opts = {}) {
      const next = { ...(store.getState().lectures[id] || EMPTY_LECTURE), ...patch, updatedAt: new Date().toISOString() }
      store.setState((s) => ({ lectures: { ...s.lectures, [id]: next } }))
      writeDoc(`lectures/${id}`, next)
      if (!opts.quiet) markActive()
    },
    putAssignment(id, patch) {
      const next = { ...(store.getState().assignments[id] || {}), ...patch, updatedAt: new Date().toISOString() }
      store.setState((s) => ({ assignments: { ...s.assignments, [id]: next } }))
      writeDoc(`assignments/${id}`, next)
      markActive()
    },
    setGoal(weeklyTarget) {
      const goal = { weeklyTarget }
      store.setState({ goal })
      writeDoc('meta/goal', goal)
    },
    setOnboarded(value) {
      store.setState({ onboarded: value })
      writeDoc('meta/onboarded', value)
    },
    markActive,
    // cloud.js hands over the database once it's connected
    attach(database, { onWriteError } = {}) {
      db = database
      if (onWriteError) onError = onWriteError
    },
    // a snapshot from the cloud replaces one part of the state
    applyRemote(patch) {
      store.setState(patch)
      saveLocal()
    },
  }
}

function pick(s) {
  return Object.fromEntries(SAVED.filter((k) => s[k] !== undefined).map((k) => [k, s[k]]))
}
