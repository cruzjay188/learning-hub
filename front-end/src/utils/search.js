// The search palette (⌘K): what can be found, and how results are ranked.
import { fShort } from './dates.js'
import { A_LABEL } from './format.js'

// Everything searchable, grouped: Actions, Lectures, Key terms, Assignments.
export function buildIndex(m, today, minutes) {
  const n = m.upNext(today, minutes)
  const items = []
  const todays = m.L.find((l) => l.dates.includes(today))
  if (todays) items.push({ g: 'Actions', t: "Go to today's lecture", s: m.lecLabel(todays), go: `#lecture-${todays.id}` })
  if (n) items.push({ g: 'Actions', t: `Continue: ${n.s.title}`, s: m.lecLabel(n.l), go: `#lecture-${n.l.id}`, step: n.s.id })
  if (n && n.s.code) items.push({ g: 'Actions', t: 'Copy the next command', s: n.s.title, copy: n.s.code })
  items.push({ g: 'Actions', t: 'Open Review', s: `${m.dueCount(today)} due`, go: '#review' })
  items.push({ g: 'Actions', t: 'Toggle light / dark', s: 'Theme', theme: true })
  m.L.forEach((l) => items.push({ g: 'Lectures', t: m.lecLabel(l), s: `Week ${l.week} · ${fShort(l.date)}${l.guide && l.guide.status === 'outline' ? ' · prep outline' : ''}`, go: `#lecture-${l.id}`, key: `${m.codeOf(l)} ${l.title}`.toLowerCase() }))
  m.L.forEach((l) => ((l.guide && l.guide.concepts) || []).forEach((c) => items.push({ g: 'Key terms', t: c.term, s: `${m.codeOf(l) || l.title} · ${c.meaning}`, go: `#lecture-${l.id}`, key: c.term.toLowerCase() })))
  m.data.assignments.forEach((a) => items.push({ g: 'Assignments', t: m.aTitle(a), s: A_LABEL[m.assignStatus(a)], go: a.repo || '#work', ext: !!a.repo, key: a.title.toLowerCase() }))
  return items
}

// Empty query: the actions plus recently opened lectures. Otherwise: matches, best first, grouped.
export function searchResults(index, q, recent = [], m) {
  q = q.trim().toLowerCase()
  if (!q) {
    const rec = recent.map(m.LB).filter(Boolean).map((l) => ({ g: 'Recent', t: m.lecLabel(l), s: `Week ${l.week} · ${fShort(l.date)}`, go: `#lecture-${l.id}` }))
    return [...index.filter((x) => x.g === 'Actions'), ...rec]
  }
  const nq = q.replace(/[^a-z0-9]+/g, '')
  const norm = (k) => k.replace(/[^a-z0-9]+/g, '')
  const scored = index.filter((x) => x.g !== 'Actions' || x.t.toLowerCase().includes(q)).map((x) => {
    const k = x.key || x.t.toLowerCase()
    const nk = norm(k)
    const i = k.indexOf(q) >= 0 ? k.indexOf(q) : nk.indexOf(nq) >= 0 && nq ? nk.indexOf(nq) : -1
    return i < 0 ? null : { x, sc: (i === 0 ? 0 : k.includes(' ' + q) ? 1 : 2) + ({ Actions: 0, Lectures: 0.1, Assignments: 0.2, 'Key terms': 0.3 }[x.g] || 0) }
  }).filter(Boolean).sort((a, b) => a.sc - b.sc).slice(0, 40).map((s) => s.x)
  const order = ['Actions', 'Lectures', 'Assignments', 'Key terms']
  return scored.sort((a, b) => order.indexOf(a.g) - order.indexOf(b.g))
}
