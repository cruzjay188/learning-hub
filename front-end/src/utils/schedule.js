// Turns one calendar day into the blocks on Today's timeline (Stand Up, lectures, work time…).
import { DAY_END, toMin } from './dates.js'

// Calendar titles are noisy ("0900 BT - …", "GROUP PROJECTS"); this makes them readable.
export function clean(t) {
  return t.replace(/^(0900 |13:30 |1:30pm )/i, '').replace(/^BT\s*[-:]?\s*/i, 'Career: ').replace(/^13:30 BT\s*/i, 'Career: ').replace(/^GS\s*:\s*/i, 'Guest: ')
    .replace(/\s*\(\d{4}\)$/, '').replace(/\b([A-Z]{4,})\b/g, (w) => w.toLowerCase()).replace(/^work time$/i, 'Work time').replace(/GROUP PROJECTS/i, 'Group projects').replace(/\s+-\s+/g, ' · ')
}

// Each block: { t: "10:00", start, end (minutes), entries: [{ label, kind, lec }], kind }
export function dayBlocks(day, m) {
  const map = new Map()
  const add = (t, e) => { if (!map.has(t)) map.set(t, []); map.get(t).push(e) }
  add('09:30', { label: 'Stand Up', kind: 'routine' })
  add('17:30', { label: 'Team Meet', kind: 'routine' })
  add('18:00', { label: 'Stand Down', kind: 'routine' })
  const items = day.items.filter((i) => i.time && i.kind !== 'noclass')
  items.forEach((i) => {
    const lec = i.lectureId && m.LB(i.lectureId)
    if (lec && map.get(i.time) && map.get(i.time).some((e) => e.lec === lec)) return
    add(i.time, { label: lec ? m.lecLabel(lec) : clean(i.title), kind: i.kind, lec })
  })
  if (!items.some((i) => i.time >= '09:45' && i.time < '12:00')) add('10:00', { label: 'Morning session', kind: 'work' })
  if (!items.some((i) => i.time >= '12:00' && i.time < '17:30')) add('14:30', { label: 'Work time', kind: 'work' })
  const times = [...map.keys()].sort()
  return times.map((t, i) => {
    const entries = map.get(t).sort((a, b) => (a.lec ? -1 : b.lec ? 1 : 0))
    const dedup = entries.filter((e, j) => entries.findIndex((x) => x.label === e.label) === j)
    return { t, start: toMin(t), end: i < times.length - 1 ? toMin(times[i + 1]) : DAY_END, entries: dedup, kind: (dedup.find((e) => e.lec) || dedup[0]).kind }
  })
}
