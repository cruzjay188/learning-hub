import { useHub } from '../hooks/useHub.js'
import { dayDiff, etNow, fShort } from '../utils/dates.js'
import { CONF } from '../utils/format.js'
import { onRadioKeys } from './Bits.jsx'

// "How well do you get it?" 1–5. A thumb slides to your choice.
// where: "page" (rail or finished panel) | "sheet" (Rate sheet) | "review" (end of a review session)
// bare: the compact version used in the finished panel and sheets.
export default function RatingControl({ l, headId, bare = false, where = 'page' }) {
  const { m, hub } = useHub()
  const { today } = etNow()
  const c = m.LS(l.id).confidence || 0
  const before = l.date > today
  const due = c ? m.reviewDue(l) : null
  const when = (d) => { const n = dayDiff(today, d); return n <= 0 ? 'today' : n === 1 ? `tomorrow, ${fShort(d)}` : `on ${fShort(d)}` }
  const help = before ? `You can rate this after class on ${fShort(l.date)}.`
    : c ? (c === 5 ? "It won't come back for review." : due ? `Comes back for review ${when(due)}.` : '')
      : 'Rate it 1 to 3 and it comes back for review on a schedule.'
  const kp = `${bare ? 'b' : 'r'}-${l.id}`
  return (
    <>
      <div className="rating__top">
        {bare ? <span className="muted" style={{ fontSize: '13px' }}>1 is lost · 5 is could teach it</span> : <h2 id={headId}>How well do you get it?</h2>}
        <span className="rating__word" data-k={`rw-${kp}`}>{c ? CONF[c - 1] : ''}</span>
      </div>
      <div
        className="rating" role="radiogroup" aria-label="Confidence, 1 to 5" data-rating={l.id} style={{ '--c': c }} data-on={c > 0}
        data-k={`rc-${kp}`} data-var="--c" {...(where === 'review' ? { 'data-review': '1' } : {})} onKeyDown={onRadioKeys}
      >
        <span className="rating__thumb" aria-hidden="true" />
        {CONF.map((t, i) => (
          <button
            key={t} type="button" role="radio" aria-checked={c === i + 1} tabIndex={(c ? c === i + 1 : i === 0) ? 0 : -1} data-conf={i + 1}
            aria-label={`${i + 1} of 5, ${t}`} style={{ '--i': i }} disabled={before} onClick={() => hub.rateClick(l.id, i + 1, where)}
          >{i + 1}</button>
        ))}
      </div>
      {!bare && <div className="rating__ends"><span>Lost</span><span>Could teach it</span></div>}
      <p className="rating__help" aria-live="polite" data-k={`rh-${kp}`}>{help}</p>
      {c && !before && !bare ? <button type="button" className="btn btn--quiet btn--sm" data-action="clear-rating" data-l={l.id} style={{ marginLeft: '-8px' }} onClick={() => hub.clearRating(l.id)}>Clear rating</button> : null}
    </>
  )
}
