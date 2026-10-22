import { useHub } from '../hooks/useHub.js'
import { fDur, fShort } from '../utils/dates.js'
import { pct } from '../utils/format.js'
import CodeBlock from './CodeBlock.jsx'
import { I } from './icons.jsx'
import Ring from './Ring.jsx'
import Ticker from './Ticker.jsx'

// Today's main card: the one step to do next, with its code and a "Mark step done" button.
// n is m.upNext(…): { l: lecture, s: step, why } or null when you're caught up.
export default function UpNextCard({ n }) {
  const { m, hub } = useHub()
  if (!n) {
    return (
      <section className="upnext" id="upnext" data-caught="true" aria-labelledby="up-h">
        <div className="upnext__body">
          <p className="upnext__eyebrow" style={{ color: 'var(--teal-strong)' }}>Up next</p>
          <h2 className="upnext__title" id="up-h">You're caught up</h2>
          <p className="upnext__detail">Every guide that's out so far is checked off. Rate what you learned on the Review tab, or skim what's coming on the Course tab.</p>
          <div className="upnext__actions"><a className="btn" href="#review">Open Review</a><a className="btn btn--quiet" href="#course">See the course</a></div>
        </div>
      </section>
    )
  }
  const { l, s, why } = n
  const steps = m.stepsOf(l)
  const p = m.prog(l)
  const idx = steps.indexOf(s) + 1
  const left = l.guide.estMinutes ? Math.round((l.guide.estMinutes * (p.total - p.done)) / Math.max(1, p.total)) : 0
  const whyText = { today: 'Up next', tonight: "Tonight's homework", continue: 'Pick up where you left off', catchup: `Still open from ${fShort(l.date)}`, prep: `Prep for ${fShort(l.date)}` }[why]
  const more = steps.some((x) => x !== s && !m.isDone(l.id, x.id))
  return (
    <section className="upnext" id="upnext" aria-labelledby="up-h">
      {more && <span className="upnext__back" aria-hidden="true" />}
      <div className="upnext__body">
        <p className="upnext__eyebrow">
          <span>{whyText}</span><span aria-hidden="true">·</span><a href={`#lecture-${l.id}`}>{m.lecLabel(l)}</a>
          <span className="upnext__step"><Ring p={pct(p.done, p.total)} size={18} k={`un-${l.id}`} disc={false} /><span>Step <Ticker n={idx} k={`uns-${l.id}`} /> of {p.total}</span></span>
        </p>
        <div className="segs" style={{ '--n': steps.length }} aria-hidden="true">
          {steps.map((x, i) => <i key={i} data-s={m.isDone(l.id, x.id) ? 'done' : x === s ? 'now' : ''} data-k={`seg-${l.id}-${i}`} data-attr="data-s" />)}
        </div>
        <h2 className="upnext__title" id="up-h">{s.title}</h2>
        {s.detail && <p className="upnext__detail">{s.detail}</p>}
        <CodeBlock s={s} lid={l.id} compact />
        {s.doneWhen && <p className="done-when"><I.verify /><span><b>Done when</b>{s.doneWhen}</span></p>}
        <div className="upnext__actions">
          <button type="button" className="btn btn--primary" data-action="done-next" data-l={l.id} data-s={s.id} onClick={(e) => hub.doneNext(l.id, s.id, e.currentTarget)}>
            <I.check size={16} className="ico-check" />
            <span className="lbl"><span className="lbl__idle">Mark step done</span><span className="lbl__done" aria-hidden="true">Done</span></span>
          </button>
          <a className="btn btn--quiet" href={`#lecture-${l.id}`}>Open guide</a>
          {left ? <span className="upnext__left num">About {fDur(left)} left in this guide</span> : null}
        </div>
      </div>
    </section>
  )
}
