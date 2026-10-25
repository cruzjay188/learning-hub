import { useRef } from 'react'
import { NEW_TAB, safeUrl } from '../utils/safeUrl.js'
import { useHub } from '../hooks/useHub.js'
import { etNow, fDur, fShort, fTime } from '../utils/dates.js'
import { A_LABEL, CONF, pct } from '../utils/format.js'
import { StrengthMeter } from '../components/Bits.jsx'
import { I } from '../components/icons.jsx'
import NotesControl from '../components/NotesControl.jsx'
import RatingControl from '../components/RatingControl.jsx'
import RecallCards from '../components/RecallCards.jsx'
import Ring from '../components/Ring.jsx'
import StepItem from '../components/StepItem.jsx'
import Ticker from '../components/Ticker.jsx'

// One lecture's guide: summary, goal, what's required, the steps, key terms and links.
// The rail on the right has the step outline, your rating and your notes.
export default function Lecture({ id }) {
  const { m, ui, hub } = useHub()
  const { today } = etNow()
  const l = m.LB(id)
  const wasDone = useRef(null) // was every step done when the page opened? (then the finished panel doesn't animate in)
  if (!l) return <div className="empty"><p>That lecture isn't on the schedule.</p><a className="btn btn--sm" href="#course">Go to Course</a></div>

  const g = l.guide || {}
  const idx = m.L.indexOf(l)
  const prev = m.L[idx - 1]
  const next = m.L[idx + 1]
  const s = m.status(l, today)
  const p = m.prog(l)
  const outline = g.status === 'outline'
  const code = m.codeOf(l)
  const linked = m.data.assignments.filter((a) => (a.lectures || []).includes(l.id))
  const steps = m.stepsOf(l)
  const allDone = !!(p.total && p.done === p.total)
  if (wasDone.current === null || !allDone) wasDone.current = allDone

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol><li><a href="#course">Course</a></li><li>Week {l.week}</li><li aria-current="page">{code || l.title}</li></ol>
        <span className="pn">
          {prev && <a className="btn btn--quiet btn--sm" href={`#lecture-${prev.id}`} aria-label={`Previous lecture: ${prev.title}`}>‹ {m.codeOf(prev) || 'Prev'}</a>}
          {next && <a className="btn btn--quiet btn--sm" href={`#lecture-${next.id}`} aria-label={`Next lecture: ${next.title}`}>{m.codeOf(next) || 'Next'} ›</a>}
        </span>
      </nav>
      <div className="split">
        <article className="main-col" aria-labelledby="v-title">
          <p className="lec-meta">
            {code && <span className="code-tag">{code}</span>}
            <span className="num">{l.dates.map(fShort).join(', ')}{l.time ? ` · ${fTime(l.time)} ET` : ''}</span>
            {s === 'now' && <span className="now">Today</span>}
            {g.estMinutes ? <span>About {fDur(g.estMinutes)}</span> : null}
            <span>{m.modName(l.module)}</span>
          </p>
          <h1 className="lec-title" id="v-title">{l.title}</h1>
          {p.total ? <div className="lec-progress" id="lec-progress"><LecProgress l={l} /></div> : null}
          {g.summary && <p className="lec-summary">{g.summary}</p>}
          {g.goal && <p className="goal"><I.target /><span><b>Goal:</b> {g.goal}</span></p>}
          {outline && <p className="outline-note">This is a prep outline. The full step-by-step guide arrives after the lecture's material is published, when you run <code>/sync</code> in Claude Code.</p>}
          {!l.guide && <p className="outline-note">No guide yet. Run <code>/sync</code> in Claude Code after the lecture's material is published.</p>}
          {(g.required || []).length ? (
            <details className="req" open={!(s === 'now' || s === 'progress')}>
              <summary>What's required <span className="count num">{g.required.length}</span><I.down /></summary>
              <ul className="req__list">{g.required.map((r) => <li key={r}><span>{r}</span></li>)}</ul>
            </details>
          ) : null}
          {steps.length ? (
            <>
              <div className="steps-head">
                <h2 id="steps-h">{outline ? 'Prep' : 'Steps'}</h2>
                <span className="count num" id="steps-count"><Ticker n={p.done} k={`sc-${l.id}`} /> of {p.total} done{outline && g.estMinutes ? ` · ${fDur(g.estMinutes)}` : ''}</span>
                <button type="button" className="link-btn" data-action="expand-all" aria-pressed={ui.expandAll} onClick={() => hub.setExpandAll(!ui.expandAll)}>{ui.expandAll ? 'Focus on current step' : 'Expand all'}</button>
              </div>
              <ol className="steps" id="steps" aria-labelledby="steps-h">{steps.map((st, i) => <StepItem key={st.id} l={l} st={st} i={i} />)}</ol>
              <div id="finished">{allDone ? <FinishedPanel l={l} isNew={!wasDone.current} /> : null}</div>
            </>
          ) : null}
          {(g.concepts || []).length ? <RecallCards l={l} /> : null}
          {(linked.length || (g.resources || []).length) ? (
            <section className="section" aria-labelledby="lk-h">
              <h2 className="section__title" id="lk-h">Links</h2>
              <div className="links lec-links">
                {linked.map((a) => (
                  <a key={a.id} href={safeUrl(a.repo) || '#work'} {...(safeUrl(a.repo) ? NEW_TAB : {})}>
                    {m.aTitle(a)} {safeUrl(a.repo) ? <I.ext /> : ''}<span className="lk-st">{A_LABEL[m.assignStatus(a)]}</span>
                  </a>
                ))}
                {(g.resources || []).filter((r) => safeUrl(r.url)).map((r) => <a key={r.url + r.label} href={safeUrl(r.url)} {...NEW_TAB}>{r.label} <I.ext /></a>)}
              </div>
            </section>
          ) : null}
          <nav className="pager" aria-label="Other lectures">
            {prev ? <a href={`#lecture-${prev.id}`}><small>Previous</small>{m.lecLabel(prev)}</a> : <span />}
            {next ? <a className="r" href={`#lecture-${next.id}`}><small>Next</small>{m.lecLabel(next)}</a> : <span />}
          </nav>
        </article>
        <aside className="rail rail--lecture" aria-label="Your progress on this lecture">
          {steps.length ? (
            <section className="rail__block">
              <div className="rail__head"><h2>{outline ? 'Prep' : 'Steps'}</h2><span className="num muted" style={{ fontSize: '13px' }} data-count=""><Ticker n={p.done} k={`oc-${l.id}`} />/{p.total}</span></div>
              <div className="outline-nav" id="outline-nav">
                {steps.map((st, i) => {
                  const done = m.isDone(l.id, st.id)
                  return (
                    <button key={st.id} type="button" data-jump={st.id} data-done={done} data-current={m.firstOpen(l) === st} onClick={() => hub.jump(l.id, st.id)}>
                      <span className="o-mark">{done ? <I.check size={10} /> : i + 1}</span><span>{st.title}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          ) : null}
          <section className="rail__block" aria-labelledby="conf-h" id="rail-rating" hidden={allDone}><RatingControl l={l} headId="conf-h" /></section>
          <section className="rail__block" aria-labelledby="notes-h"><NotesControl l={l} headId="notes-h" /></section>
        </aside>
      </div>
    </>
  )
}

// Under the title: a ring, "3 of 10 steps", and your rating
function LecProgress({ l }) {
  const { m } = useHub()
  const p = m.prog(l)
  const c = m.LS(l.id).confidence
  return (
    <>
      <Ring p={pct(p.done, p.total)} size={20} k={`lp-${l.id}`} />
      <span><Ticker n={p.done} k={`lpn-${l.id}`} /> of {p.total} {l.guide.status === 'outline' ? 'prep steps' : 'steps'}</span>
      {c ? <span>· <StrengthMeter c={c} /> {CONF[c - 1]}</span> : null}
    </>
  )
}

// Every step done: rate it, then go on to the next guide
function FinishedPanel({ l, isNew }) {
  const { m } = useHub()
  const idx = m.L.indexOf(l)
  const nx = m.L.slice(idx + 1).find((x) => x.guide)
  return (
    <div className={`finished${isNew ? ' is-new' : ''}`} role="region" aria-label="Lecture finished">
      <h3>{m.codeOf(l) || l.title} done. How well do you get it?</h3>
      <RatingControl l={l} bare />
      <div className="ds-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {nx && <a className="btn btn--primary" href={`#lecture-${nx.id}`}>Next: {m.lecLabel(nx)} <I.chev /></a>}
        <a className="btn btn--quiet" href="#today">Back to Today</a>
      </div>
    </div>
  )
}
