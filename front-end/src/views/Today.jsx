import { useHub } from '../hooks/useHub.js'
import { NEW_TAB, safeUrl } from '../utils/safeUrl.js'
import { dayDiff, etDateOf, etNow, fLong, fMD, fShort } from '../utils/dates.js'
import { A_LABEL, A_MARK, CONF, noEmoji, pct, plural } from '../utils/format.js'
import { StrengthMeter } from '../components/Bits.jsx'
import GoalBlock from '../components/GoalBlock.jsx'
import { I, ST } from '../components/icons.jsx'
import Ticker from '../components/Ticker.jsx'
import Timeline from '../components/Timeline.jsx'
import UpNextCard from '../components/UpNextCard.jsx'

// Today: the date, today's class timeline, the one step to do next, reviews due, prep for the next class,
// open assignments, and (on the right) your week and the course so far.
export default function Today() {
  const { m } = useHub()
  const { today, minutes } = etNow()
  const day = m.dayOf(today)
  const isClass = !!(day && !day.noClass && day.items.length)
  const nextDay = m.nextClassDay(today, false)
  const week = m.currentWeek(today)
  const mods = [...new Set(m.L.filter((l) => l.week === week).map((l) => l.module).filter(Boolean))].map(m.modName)
  const nextLec = nextDay && m.firstLecOn(nextDay)
  return (
    <div className="split">
      <div className="main-col">
        <header>
          <h1 className="display" id="v-title">{fLong(today)}</h1>
          <p className="meta-line"><span><strong>Week {week}</strong> of 15</span><span className="num">Day {m.dayIndex(today)} of {m.classDays().length}</span></p>
          {mods.length ? <p className="meta-line meta-line--sub"><span>{mods.join(' · ')}</span></p> : null}
        </header>
        <CatchupBanner today={today} />
        {isClass
          ? <Timeline day={day} minutes={minutes} />
          : <p className="notice"><I.info /><span>No class today.{nextDay ? <> Next class: <strong>{fLong(nextDay.date)}</strong>{nextLec ? ` · ${m.lecLabel(nextLec)}` : ''}.</> : ''}</span></p>}
        <UpNextCard n={m.upNext(today, minutes)} />
        <ReviewDue today={today} />
        <Prep today={today} />
        <OpenAssignments />
      </div>
      <aside className="rail" aria-label="This week and course progress">
        <GoalBlock today={today} />
        <CourseBlock today={today} />
      </aside>
    </div>
  )
}

// "You've had 6 lectures…": shown until you catch up or say Not now
function CatchupBanner({ today }) {
  const { m, hub, progress } = useHub()
  if (progress.onboarded) return null
  const past = m.L.filter((l) => m.isFull(l) && l.date < today)
  if (past.filter((l) => !m.prog(l).done).length < 2) return null
  return (
    <div className="banner" role="region" aria-label="Catch up">
      <p>You've had {plural(past.length, 'lecture')} with guides so far. Mark what you've already finished so <b>Up next</b> points at the right step.</p>
      <div className="banner__actions">
        <button type="button" className="btn btn--primary btn--sm" data-action="catchup" onClick={hub.sheetCatchup}>Catch up · 2 min</button>
        <button type="button" className="btn btn--quiet btn--sm" data-action="catchup-later" onClick={hub.catchupLater}>Not now</button>
      </div>
    </div>
  )
}

// Up to three lectures due for review, weakest first
function ReviewDue({ today }) {
  const { m, hub } = useHub()
  const due = m.reviewList().filter((r) => r.due && r.due <= today).sort((a, b) => a.c - b.c).slice(0, 3)
  if (!due.length) return null
  return (
    <section className="section" aria-labelledby="rd-h">
      <div className="section__head"><h2 className="section__title" id="rd-h">Review due <span className="count num">{m.dueCount(today)}</span></h2><a className="text-link" href="#review">Open Review</a></div>
      <ul className="rows">
        {due.map((r) => (
          <li key={r.l.id} className="row">
            <span className="st"><StrengthMeter c={r.c} /></span>
            <div className="row__main">
              <p className="row__title"><a href={`#lecture-${r.l.id}`}>{m.lecLabel(r.l)}</a></p>
              <p className="row__sub">{CONF[r.c - 1]} · rated {fMD(etDateOf(m.LS(r.l.id).ratedAt || m.LS(r.l.id).updatedAt))}</p>
            </div>
            <div className="row__end"><button type="button" className="btn btn--sm" data-action="start-review" data-l={r.l.id} onClick={() => hub.startReview(r.l.id)}>Review</button></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// What to do before the next class: a preview of a full guide, or the prep checklist
function Prep({ today }) {
  const { m, hub } = useHub()
  const after = m.nextClassDay(today, false)
  if (!after) return null
  const lec = m.firstLecOn(after)
  if (!lec || !lec.guide) return null
  const when = dayDiff(today, after.date) === 1 ? 'tomorrow' : fShort(after.date)
  const head = <div className="section__head"><h2 className="section__title" id="prep-h">Prep for {when}</h2><a className="text-link" href={`#lecture-${lec.id}`}>{m.lecLabel(lec)}</a></div>
  const steps = m.stepsOf(lec)
  if (m.isFull(lec)) {
    return (
      <section className="section" aria-labelledby="prep-h">
        {head}
        <p className="row__sub" style={{ fontSize: '14px', color: 'var(--ink-2)', maxWidth: '68ch' }}>{lec.guide.summary || lec.guide.goal || ''}</p>
        <p style={{ marginTop: '10px' }}><a className="text-link" href={`#lecture-${lec.id}`}>Preview the {plural(steps.length, 'step')} guide</a></p>
      </section>
    )
  }
  if (steps.every((s) => m.isDone(lec.id, s.id))) {
    return <section className="section" aria-labelledby="prep-h">{head}<p className="row__sub" style={{ fontSize: '14px' }}>Prep done for {m.lecLabel(lec)}.</p></section>
  }
  return (
    <section className="section" aria-labelledby="prep-h">
      {head}
      <ul className="rows" style={{ borderTop: 0 }}>
        {steps.map((s) => {
          const on = m.isDone(lec.id, s.id)
          return (
            <li key={s.id} className="check-row" data-done={on}>
              <button type="button" className="cb" role="checkbox" aria-checked={on} data-tick={`${lec.id}|${s.id}`} aria-label={s.title} onClick={(e) => hub.tick(lec.id, s.id, e.currentTarget)}><I.check /></button>
              <div className="check-row__text"><p>{s.title}</p>{s.doneWhen && <p className="row__sub">{s.doneWhen}</p>}</div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// The first three assignments in progress / to do / waiting on an instructor
function OpenAssignments() {
  const { m } = useHub()
  const order = { 'in-progress': 0, todo: 1, check: 2 }
  const all = m.data.assignments.filter((a) => order[m.assignStatus(a)] !== undefined)
  const list = [...all].sort((a, b) => order[m.assignStatus(a)] - order[m.assignStatus(b)] || a.week - b.week).slice(0, 3)
  if (!list.length) return null
  return (
    <section className="section" aria-labelledby="oa-h">
      <div className="section__head"><h2 className="section__title" id="oa-h">Open assignments <span className="count num">{all.length}</span></h2><a className="text-link" href="#work">All assignments</a></div>
      <ul className="rows">
        {list.map((a) => {
          const s = m.assignStatus(a)
          const Mark = ST[A_MARK[s]]
          const lec = (a.lectures || []).map(m.LB).filter(Boolean)[0]
          return (
            <li key={a.id} className="row">
              <span className="st" title={A_LABEL[s]}><Mark /></span>
              <div className="row__main">
                <p className="row__title">{safeUrl(a.repo) ? <a href={safeUrl(a.repo)} {...NEW_TAB}>{m.aTitle(a)} <I.ext /></a> : m.aTitle(a)}</p>
                <p className="row__sub">{A_LABEL[s]}{a.notes ? ` · ${noEmoji(a.notes)}` : ''}</p>
              </div>
              <div className="row__end">{lec ? <a className="code-tag" href={`#lecture-${lec.id}`}>{m.codeOf(lec) || lec.title}</a> : null}</div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// Guide steps done across the course, and days to graduation
function CourseBlock({ today }) {
  const { m } = useHub()
  const full = m.L.filter(m.isFull)
  let d = 0
  let t = 0
  full.forEach((l) => { const p = m.prog(l); d += p.done; t += p.total })
  const left = dayDiff(today, m.data.cohort.graduation)
  return (
    <section className="rail__block" aria-labelledby="cb-h">
      <div className="rail__head"><h2 id="cb-h">Course</h2><a className="text-link" href="#course">Open</a></div>
      <div className="course-bar" role="img" aria-label={`${d} of ${t} guide steps done`}><span style={{ '--w': `${pct(d, t)}%` }} data-k="course-bar" data-var="--w" /></div>
      <p className="rail-note">
        {d ? <><b><Ticker n={d} k="course-d" /> of {t}</b> guide steps done</> : 'No guide steps checked off yet'}<br />
        {full.length} guides ready · {m.L.length - full.length} prep outlines<br />
        Graduation {fShort(m.data.cohort.graduation)} · <span className="num">{left > 0 ? `${left} days to go` : 'today'}</span>
      </p>
    </section>
  )
}
