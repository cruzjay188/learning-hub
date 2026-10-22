import { useHub } from '../../hooks/useHub.js'
import { reducedMotion } from '../../lib/motion.js'
import { quizPrompt } from '../../utils/prompts.js'
import CopyButton from '../CopyButton.jsx'
import FlipDeck, { Tally } from '../FlipDeck.jsx'
import { I } from '../icons.jsx'
import RatingControl from '../RatingControl.jsx'
import SheetHead from './SheetHead.jsx'

// A review session: each due lecture's key terms as flip cards, then re-rate it, then the next one.
// The session's state (ui.rv) is driven by hub.startReview / reviewAnswer / reviewNext.
export default function ReviewSheet() {
  const { m, ui, hub } = useHub()
  const rv = ui.rv
  if (!rv) return null
  const l = m.LB(rv.lid)
  const terms = (l.guide && l.guide.concepts) || []
  const n = terms.length
  const nx = rv.queue[rv.q + 1] && m.LB(rv.queue[rv.q + 1])
  return (
    <>
      <SheetHead>
        Review {m.codeOf(l) || l.title}
        {rv.queue.length > 1 && <> <span className="muted num" style={{ font: '500 14px var(--font-body)' }}>· {rv.q + 1} of {rv.queue.length}</span></>}
      </SheetHead>
      <div className="sheet__body" id="rv-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <p className="row__sub" style={{ fontSize: '14px' }}>{l.title}</p>
          {n ? <Tally x={rv.missed.length} v={rv.got.length} k="rv" /> : null}
        </div>
        {n ? (
          <div className="deck__segs" style={{ '--n': n }} aria-hidden="true">
            {terms.map((t, k) => <i key={t.term} data-s={rv.got.includes(t.term) ? 'got' : rv.missed.includes(t.term) ? 'missed' : k === rv.i ? 'now' : ''} />)}
          </div>
        ) : null}
        {n && rv.i < n ? (
          <FlipDeck
            key={`${rv.q}-${terms[rv.i].term}`} lid={l.id} term={terms[rv.i].term} meaning={terms[rv.i].meaning} i={rv.i} n={n}
            more={rv.i < n - 1} attr="data-rv" arrive={rv.i > 0 || (rv.slide && reducedMotion())} onAnswer={(act) => hub.reviewAnswer(terms[rv.i].term, act)}
          />
        ) : (
          <div className="deck__end is-next" style={{ marginTop: '16px' }}>
            <h3>{n ? `${rv.got.length} of ${n} recalled` : 'No key terms yet. Re-rate it from memory.'}</h3>
            {rv.missed.length ? <div><p className="row__sub" style={{ marginBottom: '6px' }}>Still shaky on</p><div className="deck__chips">{rv.missed.map((t) => <span key={t}>{t}</span>)}</div></div> : null}
            <p style={{ fontWeight: 600 }}>How well do you get {m.codeOf(l) || l.title} now?</p>
            <div><RatingControl l={l} bare where="review" /></div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {nx
                ? <button type="button" className="btn btn--primary" data-rv="next" onClick={hub.reviewNext}>Next due: {m.codeOf(nx) || nx.title} <I.chev /></button>
                : <button type="button" className="btn btn--primary" data-action="close-sheet" onClick={hub.closeSheet}>Done for today</button>}
              <CopyButton className="btn" data-action="quizme" data-l={l.id} text={() => quizPrompt(hub.m(), l)} what="Quiz me prompt" label={'Copy "Quiz me" prompt'} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
