import { useHub } from '../hooks/useHub.js'
import { etNow, fShort } from '../utils/dates.js'
import { CONF, plural } from '../utils/format.js'
import { EmptyState, StrengthMeter } from '../components/Bits.jsx'
import { I } from '../components/icons.jsx'
import SegmentedControl from '../components/SegmentedControl.jsx'

// Review: lectures you've rated, grouped by how due or how shaky they are.
// Rate 1–5 after class; low ratings come back sooner (utils/model.js reviewDue).
export default function Review() {
  const { m, ui, hub } = useHub()
  const { today } = etNow()
  const rl = m.reviewList()
  const taught = m.L.filter((l) => m.isFull(l) && l.date <= today && !m.LS(l.id).confidence)
  const buckets = {
    due: rl.filter((r) => r.due && r.due <= today).sort((a, b) => a.c - b.c),
    weak: rl.filter((r) => r.c <= 2), medium: rl.filter((r) => r.c === 3), strong: rl.filter((r) => r.c >= 4),
  }
  const f = ui.reviewFilter
  const list = f === 'unrated' ? null : buckets[f]
  const nextUp = rl.filter((r) => r.due && r.due > today).sort((a, b) => (a.due < b.due ? -1 : 1))[0]

  const row = (r, i) => <ReviewRow key={r.l.id} r={r} i={i} today={today} />
  let body
  if (f === 'unrated') {
    body = taught.length ? taught.map((l) => (
      <div key={l.id} className="rv-row">
        <span className="code-tag">{m.codeOf(l)}</span>
        <div className="row__main"><p className="row__title"><a href={`#lecture-${l.id}`}>{l.title}</a></p><p className="row__sub">Taught {fShort(l.date)} · not rated yet</p></div>
        <span />
        <button type="button" className="btn btn--sm" data-action="sheet-rate" data-l={l.id} onClick={() => hub.sheetRate(l.id)}>Rate</button>
      </div>
    )) : <div className="empty"><p>Every lecture taught so far has a rating.</p></div>
  } else if (!rl.length) {
    const last = taught[taught.length - 1]
    body = (
      <div className="empty">
        <p>Rate a lecture after class. Anything you rate 1–3 comes back here when it's time to review.</p>
        {taught[0] ? <button type="button" className="btn btn--sm btn--primary" data-action="sheet-rate" data-l={last.id} onClick={() => hub.sheetRate(last.id)}>Rate {m.codeOf(last) || last.title}</button> : null}
      </div>
    )
  } else if (!list.length) {
    body = f === 'due'
      ? <><EmptyState icon={<I.cal />} title="Nothing due today" line={nextUp ? `Next review: ${m.codeOf(nextUp.l) || nextUp.l.title} on ${fShort(nextUp.due)}.` : 'Rate lectures after class and they come back here on a schedule.'} />{nextUp ? row(nextUp, 0) : null}</>
      : <EmptyState icon={<I.info />} title="Nothing in this group" line="" />
  } else body = list.map(row)

  return (
    <>
      <header className="view-head">
        <div>
          <h1 className="display" id="v-title">Review</h1>
          <p className="meta-line"><span className="num">{buckets.due.length ? `${buckets.due.length} due today` : 'Nothing due today'}</span><span>Spaced review: shaky topics come back sooner</span></p>
        </div>
      </header>
      <div className="toolbar">
        <SegmentedControl
          id="review" label="Show" attr="data-rfilter" onPick={(v) => hub.set({ reviewFilter: v }, { rowsIn: true })}
          items={[
            { value: 'due', label: 'Due', count: buckets.due.length, on: f === 'due' },
            { value: 'weak', label: 'Weak', count: buckets.weak.length, on: f === 'weak' },
            { value: 'medium', label: 'Medium', count: buckets.medium.length, on: f === 'medium' },
            { value: 'strong', label: 'Strong', count: buckets.strong.length, on: f === 'strong' },
            { value: 'unrated', label: 'Unrated', count: taught.length, on: f === 'unrated' },
          ]}
        />
      </div>
      <div style={{ marginTop: '12px', borderTop: '1px solid var(--line)' }}>{body}</div>
      <p className="rail-note" style={{ marginTop: '20px', maxWidth: '68ch' }}>How it works: rate a lecture 1–5 after class. Lost comes back the next class day, Shaky in 2 days, Getting it in 4, Solid in 10. Could teach it doesn't come back. Each review asks the key terms, then you re-rate.</p>
    </>
  )
}

function ReviewRow({ r, i, today }) {
  const { m, hub } = useHub()
  const st = m.LS(r.l.id)
  const missed = (st.recall && st.recall.missed) || []
  const isDue = r.due && r.due <= today
  const terms = (r.l.guide && r.l.guide.concepts) || []
  return (
    <div className="rv-row" style={{ '--i': i || 0 }} data-lid={r.l.id}>
      <span className="code-tag">{m.codeOf(r.l)}</span>
      <div className="row__main">
        <p className="row__title"><a href={`#lecture-${r.l.id}`}>{r.l.title}</a></p>
        <p className="row__sub">
          <StrengthMeter c={r.c} /> {CONF[r.c - 1]}{terms.length ? ` · ${plural(terms.length, 'key term')}` : ''}{missed.length ? ` · ${missed.length} marked Not yet` : ''}
          {st.notes ? ` · notes: “${st.notes.slice(0, 60)}${st.notes.length > 60 ? '…' : ''}”` : ''}
        </p>
      </div>
      <span className={`rv-due ${isDue ? 'is-due' : ''}`}>{r.c === 5 ? 'Mastered' : isDue ? 'Due today' : r.due ? `Next ${fShort(r.due)}` : ''}</span>
      <button type="button" className="btn btn--sm" data-action="start-review" data-l={r.l.id} onClick={() => hub.startReview(r.l.id)}>Review</button>
    </div>
  )
}
