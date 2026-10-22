// Everything the views ask about the course: "is this step done?", "what's up next?",
// "when does this lecture come back for review?". createModel binds the course data
// (hub-data.json) to your saved progress, so the functions below can just take an id.
// Pure: same inputs, same answers, so it's easy to test.
import { addDays, DAY_END, dayDiff, etDateOf, weekStart } from './dates.js'
import { INTERVAL } from './format.js'

const EMPTY = { steps: {}, notes: '', confidence: 0 }

export function createModel(data, progress) {
  const L = data.lectures
  const LB = (id) => L.find((l) => l.id === id)
  // your saved state for one lecture
  const LS = (id) => progress.lectures[id] || EMPTY
  const stepsOf = (l) => (l && l.guide && Array.isArray(l.guide.steps) ? l.guide.steps : [])
  const isFull = (l) => !!(l.guide && l.guide.status === 'full')
  const isDone = (lid, sid) => !!((LS(lid).steps || {})[sid])
  const prog = (l) => { const s = stepsOf(l); return { done: s.filter((x) => isDone(l.id, x.id)).length, total: s.length } }
  const firstOpen = (l) => stepsOf(l).find((s) => !isDone(l.id, s.id))

  // done · now (taught today) · progress · outline (prep only) · notchecked (past, nothing ticked) · upcoming
  function status(l, today) {
    const { done, total } = prog(l)
    if (total && done === total) return 'done'
    if (l.dates.includes(today)) return 'now'
    if (done > 0) return 'progress'
    if (l.guide && l.guide.status === 'outline') return 'outline'
    if (l.date < today) return 'notchecked'
    return 'upcoming'
  }

  const codeOf = (l) => (l.guide && l.guide.code && l.guide.code !== '—' ? l.guide.code : l.code) || ''
  const lecLabel = (l) => `${codeOf(l) ? codeOf(l) + ' ' : ''}${l.title}`
  const modName = (id) => { const m = data.modules.find((x) => x.id === id); return m ? m.name : 'Onboarding' }
  const classDays = () => data.days.filter((d) => !d.noClass)
  const dayOf = (iso) => data.days.find((d) => d.date === iso)
  const nextClassDay = (iso, inclusive) => classDays().find((d) => (inclusive ? d.date >= iso : d.date > iso) && d.items.length)
  const currentWeek = (today) => { const d = dayOf(today) || nextClassDay(today, true); return d ? d.week : 15 }
  const dayIndex = (today) => classDays().filter((d) => d.date <= today).length
  const firstLecOn = (day) => { const it = day.items.find((i) => i.lectureId); return it && LB(it.lectureId) }

  // Spaced review: rated 1 → next class day, 2 → 2 days, 3 → 4 days, 4 → 10 days, 5 → never.
  function reviewDue(l) {
    const st = LS(l.id)
    const c = st.confidence
    if (!c || c === 5) return null
    const base = etDateOf(st.reviewedAt || st.ratedAt || st.updatedAt)
    if (!base) return null
    if (c === 1) { const n = nextClassDay(base, false); return n ? n.date : addDays(base, 1) }
    return addDays(base, INTERVAL[c])
  }
  const reviewList = () => L.filter((l) => LS(l.id).confidence).map((l) => ({ l, c: LS(l.id).confidence, due: reviewDue(l) }))
  const dueCount = (today) => reviewList().filter((r) => r.due && r.due <= today).length

  // The one step the Today page puts in front of you, and why.
  function upNext(today, minutes) {
    const full = L.filter(isFull)
    const todays = full.find((l) => l.dates.includes(today))
    if (todays && firstOpen(todays)) return { l: todays, s: firstOpen(todays), why: minutes < DAY_END ? 'today' : 'tonight' }
    const touched = full.filter((l) => firstOpen(l) && LS(l.id).touchedAt).sort((a, b) => (LS(b.id).touchedAt > LS(a.id).touchedAt ? 1 : -1))
    if (touched[0]) return { l: touched[0], s: firstOpen(touched[0]), why: 'continue' }
    const recentDates = classDays().filter((d) => d.date <= today).slice(-5).map((d) => d.date)
    const recent = full.filter((l) => l.date <= today && recentDates.includes(l.date) && firstOpen(l)).sort((a, b) => (a.date > b.date ? -1 : 1))[0]
    if (recent) return { l: recent, s: firstOpen(recent), why: 'catchup' }
    const nxt = L.find((l) => l.date > today && l.guide && firstOpen(l))
    if (nxt) return { l: nxt, s: firstOpen(nxt), why: 'prep' }
    return null
  }

  // Weekly goal: how many days you studied in the week starting Monday `mon`, and your streak of weeks that met the goal.
  const weekCount = (mon) => { const days = progress.activity.days || {}; let n = 0; for (let i = 0; i < 7; i++) if (days[addDays(mon, i)]) n++; return n }
  function streaks(today) {
    const target = progress.goal.weeklyTarget || 4
    const thisMon = weekStart(today)
    const met = (mon) => weekCount(mon) >= target
    let cur = 0
    let mon = met(thisMon) ? thisMon : addDays(thisMon, -7)
    while (mon >= weekStart(data.cohort.start) && met(mon)) { cur++; mon = addDays(mon, -7) }
    let longest = 0
    let run = 0
    for (let m = weekStart(data.cohort.start); m <= thisMon; m = addDays(m, 7)) {
      if (met(m)) { run++; longest = Math.max(longest, run) } else if (m !== thisMon) run = 0
    }
    return { cur, longest, metThisWeek: met(thisMon), count: weekCount(thisMon), target }
  }

  // An assignment's status: what you set in the hub wins over progress.md.
  function assignStatus(a) {
    const o = progress.assignments[a.id] || {}
    if (a.status === 'quiz' && !o.status) return 'quiz'
    if (o.status) return o.status
    if (typeof o.done === 'boolean') return o.done ? 'done' : (a.status === 'done' ? 'todo' : a.status)
    return a.status
  }
  const aTitle = (a) => a.title.replace(/\s+—\s+/, ' · ')

  return {
    data, progress, L, LB, LS, stepsOf, isFull, isDone, prog, firstOpen, status, codeOf, lecLabel, modName,
    classDays, dayOf, nextClassDay, currentWeek, dayIndex, firstLecOn, reviewDue, reviewList, dueCount, upNext,
    weekCount, streaks, assignStatus, aTitle, dayDiff,
  }
}

// A rating's strength, for the three-bar meter: 1–2 weak, 3 medium, 4–5 strong
export const strengthOf = (c) => (!c ? null : c <= 2 ? 'weak' : c === 3 ? 'medium' : 'strong')
