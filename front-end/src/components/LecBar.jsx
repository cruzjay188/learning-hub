import { useHub } from '../hooks/useHub.js'
import { CONF, pct } from '../utils/format.js'
import { I } from './icons.jsx'
import Ring from './Ring.jsx'
import Ticker from './Ticker.jsx'

// The sticky bar at the bottom of a lecture on phones: progress, Rate, Notes, Done.
export default function LecBar({ l }) {
  const { m, hub } = useHub()
  const p = m.prog(l)
  const c = m.LS(l.id).confidence
  const next = m.firstOpen(l)
  return (
    <div className="lecbar__inner">
      <div className="lecbar__prog">
        <Ring p={pct(p.done, p.total)} size={28} k={`lb-${l.id}`} />
        <span>{p.total ? <><Ticker n={p.done} k={`lbc-${l.id}`} />/{p.total}</> : 'No steps'}</span>
      </div>
      <button type="button" className="btn btn--quiet btn--sm" data-action="sheet-rate" data-l={l.id} aria-label="Rate this lecture" onClick={() => hub.sheetRate(l.id)}>
        {c ? `${c} · ${CONF[c - 1]}` : <><I.star /> Rate</>}
      </button>
      <button type="button" className="btn btn--quiet btn--sm" data-action="sheet-notes" data-l={l.id} aria-label="My notes" onClick={() => hub.sheetNotes(l.id)}><I.notes /> Notes</button>
      {next && <button type="button" className="btn btn--primary btn--sm" data-action="done-continue" data-l={l.id} data-s={next.id} onClick={() => hub.doneContinue(l.id, next.id)}><I.check size={14} /> Done</button>}
    </div>
  )
}
