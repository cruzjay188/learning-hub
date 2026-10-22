// Small pieces used on several pages.
import { strengthOf } from '../utils/model.js'

// Three bars: weak (1–2), medium (3) or strong (4–5)
export function StrengthMeter({ c }) {
  return <span className="strength" data-s={String(strengthOf(c))} aria-hidden="true"><i /><i /><i /></span>
}

export function EmptyState({ icon, title, line, children }) {
  return (
    <div className="empty">
      <span className="empty__tile">{icon}</span>
      <p className="empty__title">{title}</p>
      {line && <p>{line}</p>}
      {children}
    </div>
  )
}

// Arrow keys move through a radio group (ratings, catch-up choices) and pick as they go.
export function onRadioKeys(e) {
  const tgt = e.target
  if (!tgt.matches('[role="radio"]') || !['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
  const rs = [...e.currentTarget.querySelectorAll('[role="radio"]:not(:disabled)')]
  const i = rs.indexOf(tgt)
  const n = rs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + rs.length) % rs.length]
  e.preventDefault()
  n.focus()
  n.click()
}
