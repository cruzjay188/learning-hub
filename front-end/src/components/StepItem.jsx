import { useHub } from '../hooks/useHub.js'
import CodeBlock from './CodeBlock.jsx'
import { I } from './icons.jsx'

// Is a step shown open? "Expand all" opens every step; otherwise the current step is open
// unless you closed it, and any step you opened stays open.
export function stepOpen(ui, lid, sid, isCurrent) {
  const o = ui.open[lid]
  return ui.expandAll || !!(o && o.has(sid)) || (isCurrent && !(o && o.has('!' + sid)))
}

// One step of a lecture guide: the numbered circle (tick it), the title (open it), and the body.
export default function StepItem({ l, st, i }) {
  const { m, ui, hub } = useHub()
  const done = m.isDone(l.id, st.id)
  const cur = m.firstOpen(l) === st
  const open = stepOpen(ui, l.id, st.id, cur)
  const peek = (st.detail || '').replace(/^Lecture step \d+[^.]*\.\s*/i, '').replace(/^Different for you:\s*/i, '').split(/(?<=\.)\s/)[0]
  const tickKey = `${l.id}|${st.id}`
  return (
    <li className="step" id={`step-${st.id}`} data-step={st.id} data-done={done} data-current={cur} data-open={open}>
      <button type="button" className="marker" role="checkbox" aria-checked={done} data-tick={tickKey} aria-label={`Step ${i + 1}: ${st.title}`} onClick={(e) => hub.tick(l.id, st.id, e.currentTarget)}>
        <span className="n">{i + 1}</span><span className="chk"><I.check size={16} /></span>
      </button>
      <div>
        <div className="step__head">
          <button type="button" className="step__toggle" data-toggle={st.id} aria-expanded={open} aria-controls={`sb-${st.id}`} onClick={() => hub.toggleOpen(l.id, st.id)}>
            <span className="step__title">{st.title}</span><span className="step__peek">{peek}</span>
          </button>
          <button type="button" className="step__undo" data-tick={tickKey} aria-label={`Undo step ${i + 1}`} onClick={(e) => hub.tick(l.id, st.id, e.currentTarget)}><I.undo /> Undo</button>
        </div>
        <div className="step__body" id={`sb-${st.id}`}>
          <div className="step__inner">
            <div className="step__pad">
              {st.detail && <p className="step__detail">{st.detail}</p>}
              <CodeBlock s={st} lid={l.id} />
              {st.doneWhen && <p className="done-when"><I.verify /><span><b>Done when</b>{st.doneWhen}</span></p>}
              {!done && (
                <div className="step__actions">
                  <button type="button" className="btn btn--primary" data-action="done-continue" data-l={l.id} data-s={st.id} onClick={() => hub.doneContinue(l.id, st.id)}>
                    <I.check size={16} className="ico-check" />
                    <span className="lbl"><span className="lbl__idle">Mark done and continue</span><span className="lbl__done" aria-hidden="true">Done</span></span>
                    <kbd aria-hidden="true">X</kbd>
                  </button>
                  <button type="button" className="btn btn--quiet" data-action="skip" data-l={l.id} data-s={st.id} onClick={() => hub.skip(l.id, st.id)}>Skip for now</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
