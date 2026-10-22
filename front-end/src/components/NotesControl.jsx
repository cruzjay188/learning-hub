import { useHub } from '../hooks/useHub.js'
import { ago } from '../utils/dates.js'
import CopyButton from './CopyButton.jsx'
import { quizPrompt } from '../utils/prompts.js'

// "My notes" for a lecture. Saves 0.8s after you stop typing (hub.typeNotes).
// inSheet: the phone version in a sheet, which shows the lecture's name instead of a heading.
export default function NotesControl({ l, headId, inSheet = false }) {
  const { m, ui, hub, progress } = useHub()
  const st = m.LS(l.id)
  const id = `${inSheet ? 'sheet-notes-' : 'notes-'}${l.id}`
  const value = ui.notesDraft[l.id] ?? st.notes ?? ''
  const status = ui.notesStatus[l.id]
  const statusText = status === 'typing' ? 'Typing…'
    : status === 'saved' ? (progress.mode === 'cloud' ? 'Saved just now' : 'Saved in this browser')
      : st.notes ? `Saved ${ago(ui.notesSavedAt[l.id] || st.updatedAt)}` : ''
  return (
    <>
      {inSheet
        ? <><label className="sr-only" htmlFor={id}>My notes</label><p className="row__sub" style={{ fontSize: '14px' }}>{m.lecLabel(l)}</p></>
        : <div className="rail__head"><h2 id={headId}><label htmlFor={id}>My notes</label></h2></div>}
      <textarea
        className="notes" id={id} data-notes={l.id} placeholder="What clicked, what didn't, questions for #eagle_questions…"
        value={value} onChange={(e) => hub.typeNotes(l.id, e.target.value)}
      />
      <p className="notes-status" data-notes-status={l.id}>{statusText}</p>
      <CopyButton className="btn btn--sm" data-action="quizme" data-l={l.id} style={{ marginTop: '6px' }} text={() => quizPrompt(hub.m(), l)} what="Quiz me prompt" label={'Copy "Quiz me" prompt'} />
    </>
  )
}
