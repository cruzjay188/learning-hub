import { useState } from 'react'
import { useHub } from '../../hooks/useHub.js'
import { etNow, fShort } from '../../utils/dates.js'
import { plural } from '../../utils/format.js'
import { onRadioKeys } from '../Bits.jsx'
import SheetHead from './SheetHead.jsx'

const OPTS = [['done', 'Done'], ['partly', 'Partly'], ['', 'Not yet']]

// First visit: mark the lectures you'd already finished, so Up next points at the right step.
export default function CatchupSheet() {
  const { m, hub } = useHub()
  const { today } = etNow()
  const past = m.L.filter((l) => m.isFull(l) && l.date < today)
  const [choice, setChoice] = useState(() => Object.fromEntries(past.map((l) => {
    const p = m.prog(l)
    return [l.id, p.total && p.done === p.total ? 'done' : p.done ? 'partly' : '']
  })))
  return (
    <>
      <SheetHead>Catch up</SheetHead>
      <div className="sheet__body">
        <p style={{ fontSize: '14px', color: 'var(--ink-2)' }}>Mark the lectures you've already finished. <b>Done</b> checks off every step. <b>Partly</b> leaves the steps for you to tick inside the guide.</p>
        <div>
          {past.map((l) => (
            <div key={l.id} className="cu-row" data-cu={l.id}>
              <div><p className="row__title" style={{ fontSize: '14px' }}>{m.lecLabel(l)}</p><p className="row__sub">{fShort(l.date)} · {plural(m.stepsOf(l).length, 'step')}</p></div>
              <span className="cu-opts" role="radiogroup" aria-label={l.title} onKeyDown={onRadioKeys}>
                {OPTS.map(([v, t]) => <button key={v} type="button" role="radio" data-cuv={v} aria-checked={choice[l.id] === v} onClick={() => setChoice({ ...choice, [l.id]: v })}>{t}</button>)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="sheet__foot">
        <button type="button" className="btn btn--quiet" data-action="close-sheet" onClick={hub.closeSheet}>Cancel</button>
        <button type="button" className="btn btn--primary" data-action="catchup-save" onClick={() => hub.catchupSave(choice)}>Save</button>
      </div>
    </>
  )
}
