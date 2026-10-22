import { useRef } from 'react'
import { useHub } from '../hooks/useHub.js'
import { reducedMotion } from '../lib/motion.js'
import { plural } from '../utils/format.js'
import { quizPrompt } from '../utils/prompts.js'
import CopyButton from './CopyButton.jsx'
import FlipDeck, { Tally } from './FlipDeck.jsx'

// "Check yourself": the lecture's key terms as flip cards. Your answers are saved,
// so the deck picks up at the first term you haven't answered.
export default function RecallCards({ l }) {
  const { m, hub } = useHub()
  const arrived = useRef(false) // true after an answer: the next card animates in
  const cs = l.guide.concepts
  const st = m.LS(l.id)
  const missed = new Set((st.recall && st.recall.missed) || [])
  const got = new Set((st.recall && st.recall.got) || [])
  const res = (t) => (missed.has(t) ? 'missed' : got.has(t) ? 'got' : '')
  const i = cs.findIndex((c) => !res(c.term))
  const arrive = arrived.current && !reducedMotion()

  const focusDeck = () => { const f = document.querySelector('#recall .flip') || document.querySelector('#recall .deck__end button'); if (f) f.focus({ preventScroll: true }) }
  const answer = (term, act) => { arrived.current = true; hub.recallAnswer(l.id, term, act); focusDeck() }
  const restart = () => { arrived.current = true; hub.recallRestart(l.id); focusDeck() }

  return (
    <section className="recall" id="recall" aria-labelledby="rc-h">
      <div className="section__head">
        <h2 className="section__title" id="rc-h">Check yourself <span className="count">{plural(cs.length, 'key term')}</span></h2>
        <Tally x={missed.size} v={got.size} k={l.id} />
      </div>
      <div className="deck__segs" style={{ '--n': cs.length }} aria-hidden="true">
        {cs.map((c, k) => <i key={c.term} data-s={res(c.term) || (k === i ? 'now' : '')} />)}
      </div>
      {i < 0 ? (
        <div className={`deck__end${arrive ? ' is-next' : ''}`}>
          <h3>{got.size} of {cs.length} recalled</h3>
          {missed.size
            ? <div><p className="row__sub" style={{ marginBottom: '6px' }}>Still shaky on</p><div className="deck__chips">{[...missed].map((t) => <span key={t}>{t}</span>)}</div></div>
            : <p className="row__sub" style={{ fontSize: '14px' }}>Every term recalled. Rate the lecture to space out the next review.</p>}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn--sm" data-deck="restart" data-l={l.id} onClick={restart}>Go through again</button>
            <CopyButton className="btn btn--quiet btn--sm" data-action="quizme" data-l={l.id} text={() => quizPrompt(hub.m(), l)} what="Quiz me prompt" label={'Copy "Quiz me" prompt'} />
          </div>
        </div>
      ) : (
        <FlipDeck
          key={cs[i].term} lid={l.id} term={cs[i].term} meaning={cs[i].meaning} i={i} n={cs.length} attr="data-deck"
          more={cs.slice(i + 1).some((c) => !res(c.term))} arrive={arrive} onAnswer={(act) => answer(cs[i].term, act)}
        />
      )}
      <details className="glossary"><summary>Show all terms</summary><dl>{cs.map((c) => [<dt key={`t-${c.term}`}>{c.term}</dt>, <dd key={`m-${c.term}`}>{c.meaning}</dd>])}</dl></details>
    </section>
  )
}
