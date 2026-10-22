import { useHub } from '../hooks/useHub.js'
import { dayDiff, etNow, fMD, fShort, pd } from '../utils/dates.js'
import { plural } from '../utils/format.js'
import { clean } from '../utils/schedule.js'
import { EmptyState } from '../components/Bits.jsx'
import { I } from '../components/icons.jsx'
import LectureRow from '../components/LectureRow.jsx'
import Ring from '../components/Ring.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'

// Course: all 15 weeks. A ruler of class days, filters, and one collapsible section per week.
export default function Course() {
  const { m, ui, hub } = useHub()
  const { today } = etNow()
  const cw = m.currentWeek(today)
  const openWeeks = ui.openWeeks || new Set([cw]) // this week starts open
  const f = ui.courseFilter
  const mod = ui.module
  const needs = (l) => { const c = m.LS(l.id).confidence; const due = m.reviewDue(l); return (c && c <= 3) || (due && due <= today) }
  const match = (l) => (!mod || l.module === mod) && (f === 'all' || (f === 'week' && l.week === cw) || (f === 'review' && needs(l)) || (f === 'unchecked' && m.status(l, today) === 'notchecked'))
  const counts = { review: m.L.filter(needs).length, unchecked: m.L.filter((l) => m.status(l, today) === 'notchecked').length }
  const days = m.data.days
  const weeks = [...new Set(days.map((d) => d.week))]
  const filtering = f !== 'all' || mod
  const mods = m.data.modules.filter((x) => m.L.some((l) => l.module === x.id))
  const left = dayDiff(today, m.data.cohort.graduation)

  const setFilter = (v) => hub.set({ courseFilter: v }, { rowsIn: true })
  const clearFilter = () => { hub.set({ courseFilter: 'all', module: '' }); const b = document.querySelector('[data-filter="all"]'); if (b) b.focus({ preventScroll: true }) }
  const weeksAll = () => hub.set({ openWeeks: openWeeks.size >= weeks.length ? new Set() : new Set(weeks) })

  const sections = weeks.map((w) => {
    const wdays = days.filter((d) => d.week === w)
    const all = m.L.filter((l) => l.week === w)
    const lecs = all.filter(match)
    if (filtering && !lecs.length) return null
    return <Week key={w} w={w} wdays={wdays} all={all} lecs={lecs} open={!!(filtering || openWeeks.has(w))} isNow={w === cw} today={today} onToggle={(e) => hub.toggleWeek(w, e.currentTarget.closest('.week'), openWeeks)} />
  }).filter(Boolean)

  return (
    <>
      <header className="view-head">
        <div>
          <h1 className="display" id="v-title">Course</h1>
          <p className="meta-line"><span className="num">Day {m.dayIndex(today)} of {m.classDays().length}</span><span>Graduation {fShort(m.data.cohort.graduation)}</span><span className="num">{left} days left</span></p>
        </div>
      </header>
      <div className="ruler" role="img" aria-label={`Bootcamp timeline: class day ${m.dayIndex(today)} of ${m.classDays().length}`}>
        <div className="ruler__ticks">
          {days.map((d) => <i key={d.date} data-p={d.date < today ? 'past' : d.date === today ? 'today' : 'future'} data-off={String(d.noClass)} title={`${fShort(d.date)}${d.noClass ? ' · no class' : ''}`} />)}
        </div>
        <div className="ruler__weeks">
          {weeks.map((w) => <span key={w} style={{ '--n': days.filter((d) => d.week === w).length }}>{w === 1 || w % 2 === 1 ? 'W' + w : ''}</span>)}
        </div>
      </div>
      <div className="toolbar">
        <SegmentedControl
          id="course" label="Show" attr="data-filter" onPick={setFilter}
          items={[
            { value: 'all', label: 'All', on: f === 'all' },
            { value: 'week', label: 'This week', on: f === 'week' },
            { value: 'review', label: 'Needs review', count: counts.review, on: f === 'review' },
            { value: 'unchecked', label: 'Not checked off', count: counts.unchecked, on: f === 'unchecked' },
          ]}
        />
        <label className="sr-only" htmlFor="mod-select">Module</label>
        <select className="select" id="mod-select" data-action="module" value={mod} onChange={(e) => hub.set({ module: e.target.value })}>
          <option value="">All modules</option>
          {mods.map((x) => <option key={x.id} value={x.id}>{x.number ? x.number + ' · ' : ''}{x.name}</option>)}
        </select>
        <div className="toolbar__end">
          {!filtering
            ? <button type="button" className="link-btn" data-action="weeks-all" onClick={weeksAll}>{openWeeks.size >= weeks.length ? 'Collapse all' : 'Expand all'}</button>
            : <button type="button" className="link-btn" data-action="clear-filter" onClick={clearFilter}>Clear filter</button>}
          <button type="button" className="icon-btn" data-action="help" aria-label="What the icons mean" onClick={hub.sheetHelp}><I.info /></button>
        </div>
      </div>
      <div className="weeks">
        {sections.length ? sections : (
          <EmptyState icon={<I.info />} title={f === 'review' ? 'Nothing needs review' : 'Nothing matches these filters'} line={f === 'review' ? 'Rate a lecture after class and it shows up here.' : ''}>
            <button type="button" className="btn btn--sm" data-action="clear-filter" onClick={clearFilter}>Show all lectures</button>
          </EmptyState>
        )}
      </div>
    </>
  )
}

// One week: header (dates, modules, progress), flags (no class, deadlines), and its lectures
function Week({ w, wdays, all, lecs, open, isNow, today, onToggle }) {
  const { m } = useHub()
  const fullL = all.filter(m.isFull)
  const doneN = fullL.filter((l) => m.status(l, today) === 'done').length
  let sd = 0
  let st = 0
  all.forEach((l) => { const p = m.prog(l); sd += p.done; st += p.total })
  const mnames = [...new Set(all.map((l) => l.module).filter(Boolean))].map(m.modName).join(' · ') || (w === 1 ? 'Onboarding' : '')
  const flags = []
  wdays.forEach((d) => d.items.forEach((i) => {
    if (i.kind === 'noclass') flags.push(`${fMD(d.date)} no class`)
    else if (i.kind === 'milestone' || /deadline|presentations/i.test(i.title)) flags.push(`${fMD(d.date)} ${clean(i.title).replace(/^Personal Project /, 'Personal project ').replace(/^Group projects /i, 'Group project ')}`)
  }))
  const uflags = [...new Set(flags)]
  const first = wdays[0].date
  const last = wdays[wdays.length - 1].date
  return (
    <section className="week" data-open={open} aria-labelledby={`wk${w}`} style={{ '--i': w }}>
      <button type="button" className="week__head" data-week={w} aria-expanded={open} aria-controls={`wkb${w}`} id={`wk${w}`} onClick={onToggle}>
        <span className="week__chev"><I.chev /></span>
        <span className="week__name">Week {w} <span className="muted num" style={{ font: '400 13px var(--font-body)' }}>{fMD(first)}–{pd(first).getUTCMonth() === pd(last).getUTCMonth() ? pd(last).getUTCDate() : fMD(last)}</span></span>
        <span className="week__mods">{mnames}</span>
        {isNow && <span className="week__now">This week</span>}
        <span className="week__stat">
          {fullL.length
            ? <><Ring p={st ? (sd / st) * 100 : 0} size={18} k={`wk-${w}`} /><span className="num">{doneN} of {fullL.length} lectures</span><span className="mono num">{sd}/{st} steps</span></>
            : all.length ? <span>{plural(all.length, 'lecture')} · prep outlines</span> : <span>Project week</span>}
        </span>
      </button>
      {uflags.length ? <div className="week__flags">{uflags.map((x) => <span key={x}><I.flag /> {x}</span>)}</div> : null}
      <div className="week__body" id={`wkb${w}`}>
        <div>
          <div className="week__list">
            {lecs.length ? lecs.map((l, i) => <LectureRow key={l.id} l={l} today={today} i={i} />) : <p className="empty" style={{ padding: '8px 32px' }}>Project work time.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
