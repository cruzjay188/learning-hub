import { useHub } from '../hooks/useHub.js'
import { NEW_TAB, safeUrl } from '../utils/safeUrl.js'
import { addDays, etNow, fMD, fShort, weekStart } from '../utils/dates.js'
import { A_LABEL, A_MARK, noEmoji, plural } from '../utils/format.js'
import CopyButton from '../components/CopyButton.jsx'
import { I, ST } from '../components/icons.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'

const GROUPS = [['in-progress', 'In progress'], ['todo', 'To do'], ['check', 'Ask instructor'], ['quiz', 'Quizzes & checklists', 'Team quizzes run in class; nothing to submit'], ['done', 'Done']]

// Work: assignments grouped by status (tap a status mark to change it), or your Activity.
export default function Work({ tab }) {
  const { m, ui, hub } = useHub()
  const { today } = etNow()
  const as = m.data.assignments
  const doneN = as.filter((a) => m.assignStatus(a) === 'done').length
  return (
    <>
      <header className="view-head">
        <div>
          <h1 className="display" id="v-title">Work</h1>
          <p className="meta-line"><span className="num">{doneN} of {as.length} assignments done</span><span className="num">{m.data.commits.length} commits since Oct 5</span></p>
        </div>
        <nav aria-label="Work views">
          <SegmentedControl id="work" label="Work views" items={[
            { value: 'a', label: 'Assignments', on: tab !== 'activity', href: '#work' },
            { value: 'b', label: 'Activity', on: tab === 'activity', href: '#work-activity' },
          ]} />
        </nav>
      </header>
      {tab === 'activity' ? <Activity today={today} /> : (
        <>
          {GROUPS.map(([k, label, hint]) => {
            const items = as.filter((a) => m.assignStatus(a) === k).sort((a, b) => b.week - a.week)
            if (!items.length) return null
            const collapsed = k === 'done' && !ui.showDone
            const Mark = ST[A_MARK[k]]
            return (
              <section key={k} aria-label={label}>
                <button
                  type="button" className="group__head"
                  {...(k === 'done' ? { 'data-action': 'toggle-done', 'aria-expanded': !collapsed, onClick: () => hub.set({ showDone: !ui.showDone }, { rowsIn: !ui.showDone }) } : { tabIndex: -1 })}
                >
                  {k === 'done' && <span className="chev"><I.chev /></span>}<Mark /><span>{label}</span><span className="n">{items.length}</span>{hint && <span className="hint">{hint}</span>}
                </button>
                {collapsed ? null : items.map((a, i) => <AssignmentRow key={a.id} a={a} k={k} i={i} />)}
              </section>
            )
          })}
          <section className="section" aria-labelledby="as-h">
            <h2 className="section__title" id="as-h">Assessments</h2>
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--line)' }}>
              {m.data.assessments.map((x) => (
                <div key={x.title} className="arow"><span className="st"><ST.open /></span><div className="row__main"><p className="row__title">{x.title}</p><p className="row__sub">{x.covers}</p></div><span className="row__end">Date not posted yet</span></div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}

// One assignment: its status mark (opens the status menu), title, notes, linked lectures, week
function AssignmentRow({ a, k, i }) {
  const { m, hub } = useHub()
  const lecs = (a.lectures || []).map(m.LB).filter(Boolean)
  const Mark = ST[A_MARK[k]]
  return (
    <div className="arow" style={{ '--i': i }} data-aid={a.id}>
      {k === 'quiz'
        ? <span className="st" style={{ width: '28px' }} title="Team quiz"><ST.quiz /></span>
        : <button type="button" className="st-btn" data-status-menu={a.id} aria-haspopup="menu" aria-label={`Status: ${A_LABEL[k]}. Change status for ${m.aTitle(a)}`} onClick={(e) => hub.openMenu(e.currentTarget, a.id)}><Mark /></button>}
      <div className="row__main">
        <p className="row__title">{safeUrl(a.repo) ? <a href={safeUrl(a.repo)} {...NEW_TAB}>{m.aTitle(a)} <I.ext /></a> : m.aTitle(a)}</p>
        {a.notes || a.local ? <p className="row__sub">{noEmoji(a.notes || '')}{a.local ? <>{a.notes ? ' · ' : ''}<span className="mono" style={{ fontSize: '12px' }}>{a.local}</span></> : null}</p> : null}
      </div>
      <div className="row__end">
        {lecs.map((l) => [<a key={l.id} className="code-tag" href={`#lecture-${l.id}`}>{m.codeOf(l) || l.title}</a>, ' '])}
        <span className="num">Wk {a.week}</span>
      </div>
    </div>
  )
}

// A 15-week heat map of commits + study days, your work logs and recent commits
function Activity({ today }) {
  const { m, progress } = useHub()
  const commitsBy = {}
  m.data.commits.forEach((c) => { commitsBy[c.date] = (commitsBy[c.date] || 0) + 1 })
  const act = progress.activity.days || {}
  const start = weekStart(m.data.cohort.start)
  const cells = []
  let total = 0
  let studied = 0
  const rows = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']
  for (let r = 0; r < 7; r++) {
    cells.push(<span key={`l${r}`} className="lbl">{rows[r]}</span>)
    for (let w = 0; w < 15; w++) {
      const d = addDays(start, w * 7 + r)
      const day = m.dayOf(d)
      const n = (commitsBy[d] || 0) + (act[d] ? 1 : 0)
      if (d <= today) { total += commitsBy[d] || 0; studied += act[d] ? 1 : 0 }
      const lvl = d > today ? 0 : n >= 4 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0
      cells.push(<i key={d} className="cell" data-l={lvl} data-f={d > today} data-off={!!(day && day.noClass)} data-today={d === today} title={`${fShort(d)}: ${plural(commitsBy[d] || 0, 'commit')}${act[d] ? ', studied' : ''}${day && day.noClass ? ' · no class' : ''}`} />)
    }
  }
  const logs = m.data.workLogs
  const commits = m.data.commits.slice(0, 10)
  return (
    <>
      <section className="section" aria-labelledby="ht-h">
        <div className="section__head"><h2 className="section__title" id="ht-h">Activity</h2></div>
        <div className="heat">
          <div className="heat__grid" role="img" aria-label={`${plural(total, 'commit')} and ${plural(studied, 'study day')} so far, across 15 weeks`}>
            <span />
            {Array.from({ length: 15 }, (_, i) => <span key={`h${i}`} className="lbl" style={{ textAlign: 'center' }}>{i % 2 === 0 ? i + 1 : ''}</span>)}
            {cells}
          </div>
        </div>
        <p className="legend"><span>Fewer</span><i className="cell" /><i className="cell" data-l="1" /><i className="cell" data-l="2" /><i className="cell" data-l="3" /><span>More</span><span style={{ marginLeft: '12px' }}>Commits + study days · weeks 1–15</span></p>
      </section>
      <div className="work-grid">
        <section aria-labelledby="wl-h">
          <h2 className="section__title" id="wl-h">Work logs <span className="count">open in Obsidian</span></h2>
          <div style={{ marginTop: '6px' }}>
            {logs.length ? logs.map((w) => (
              <article key={w.file} className="log">
                <p className="row__sub num">{fShort(w.date)}</p>
                <h3>{noEmoji(w.title).replace(/\s*\((Sun|Mon|Tue|Wed|Thu|Fri|Sat)[^)]*\)\s*$/, '')}</h3>
                {w.summary ? <p>{noEmoji(w.summary)}</p> : null}
                <p className="log__foot"><span className="mono">{w.file}</span><CopyButton className="btn btn--quiet btn--sm" data-copytext={w.file} text={w.file} what="path" label="Copy path" /></p>
              </article>
            )) : <p className="empty">No work logs yet.</p>}
          </div>
        </section>
        <section aria-labelledby="cm-h">
          <h2 className="section__title" id="cm-h">Recent commits</h2>
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--line)' }}>
            {commits.length ? commits.map((c) => (
              <div key={c.sha || c.when} className="commit"><time dateTime={c.date}>{fMD(c.date)}</time><div><span className="code-tag">{c.repo}</span> {safeUrl(c.url) ? <a href={safeUrl(c.url)} {...NEW_TAB}>{c.message}</a> : c.message}</div></div>
            )) : <p className="empty">No commits yet.</p>}
          </div>
          <details className="repos" style={{ marginTop: '16px' }}>
            <summary>Repos ({m.data.repos.length})</summary>
            <div className="links">{m.data.repos.filter((r) => safeUrl(r.url)).map((r) => <a key={r.url} href={safeUrl(r.url)} {...NEW_TAB}>{r.name} <I.ext /><span className="lk-st">{r.pushedAt ? fMD(r.pushedAt.slice(0, 10)) : ''}</span></a>)}</div>
          </details>
        </section>
      </div>
    </>
  )
}
