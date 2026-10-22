import { useEffect, useRef, useState } from 'react'
import { useHub } from '../hooks/useHub.js'
import { commit, instantMode, reducedMotion } from '../lib/motion.js'
import { I } from './icons.jsx'
import Ticker from './Ticker.jsx'

// One flip card: the term, then (Space or click) the meaning, then "Not yet" or "Got it".
// The parent gives each term its own key, so every card is a fresh element.
// attr: "data-deck" on the lecture page, "data-rv" in the review sheet.
// arrive: play the "next card slides forward" animation. Keys act instantly; the pointer gets the motion.
export default function FlipDeck({ lid, term, meaning, i, n, more, attr, arrive, onAnswer }) {
  const { hub } = useHub()
  const [flipped, setFlipped] = useState(false)
  const [exiting, setExiting] = useState(null) // "got" | "missed" while the card leaves
  const card = useRef(null)
  const acts = useRef(null)

  useEffect(() => {
    if (arrive && card.current) card.current.focus({ preventScroll: true })
  }, [arrive])

  function flip(viaKey) {
    if (flipped) return
    if (viaKey || reducedMotion()) instantMode()
    commit(() => setFlipped(true))
    hub.announce(meaning)
    acts.current.querySelector('button').focus({ preventScroll: true })
  }
  function answer(act, viaKey) {
    if (viaKey || reducedMotion()) { instantMode(); onAnswer(act); return }
    setExiting(act)
    setTimeout(() => onAnswer(act), 200)
  }
  // Space/Enter flips; ← and → answer once it's flipped
  const onKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target === card.current) { e.preventDefault(); flip(true) }
    else if (flipped && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); answer(e.key === 'ArrowLeft' ? 'missed' : 'got', true) }
  }

  return (
    <>
      <div className="deck">
        {more && <span className="deck__back" aria-hidden="true" />}
        <div
          ref={card} className={`flip${arrive ? ' is-next' : ''}${exiting ? ` is-${exiting}` : ''}`} data-flipped={flipped}
          {...(flipped ? {} : { role: 'button', tabIndex: 0 })} {...{ [attr]: 'flip' }} data-l={lid}
          aria-label={`Term ${i + 1} of ${n}: ${term}. Show the meaning`} onClick={() => flip(false)} onKeyDown={onKeyDown}
        >
          <div className="face" {...(flipped ? { 'aria-hidden': 'true' } : {})}>
            <p className="row__sub num">Term {i + 1} of {n}</p><p className="face__term">{term}</p><p className="face__hint">Say it out loud, then flip <span className="kbd">Space</span></p>
          </div>
          <div className="face face--back" {...(flipped ? {} : { 'aria-hidden': 'true' })}>
            <p className="row__sub">{term}</p><p className="face__meaning">{meaning}</p>
          </div>
        </div>
      </div>
      <div className="deck__acts" data-show={flipped && !exiting} ref={acts} onKeyDown={onKeyDown}>
        <button type="button" className="btn" {...{ [attr]: 'missed' }} data-l={lid} data-term={term} onClick={() => answer('missed')}><kbd>←</kbd> Not yet</button>
        <button type="button" className="btn btn--primary" {...{ [attr]: 'got' }} data-l={lid} data-term={term} onClick={() => answer('got')}>Got it <kbd>→</kbd></button>
      </div>
    </>
  )
}

// "✕ 2  ✓ 5": how many terms you've missed and got
export function Tally({ x, v, k }) {
  return (
    <span className="deck__meta" aria-label={`${x} not yet, ${v} got it`}>
      <span className="x" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><I.close /> <Ticker n={x} k={`dx-${k}`} /></span>
      <span className="v" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><I.check size={14} /> <Ticker n={v} k={`dv-${k}`} /></span>
    </span>
  )
}
