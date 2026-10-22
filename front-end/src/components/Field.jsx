import { forwardRef } from 'react'

// Small 16px icons for fields and the account forms (design/design-brief-auth.md §5.8).
const svg = (children, size = 16) => (
  <svg className="field__ico" width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
export const AuthIcon = {
  alert: () => svg(<><circle cx="8" cy="8" r="6.25" /><path d="M8 4.75v3.75" /><circle cx="8" cy="11" r=".9" fill="currentColor" stroke="none" /></>),
  info: () => svg(<><circle cx="8" cy="8" r="6.25" /><path d="M8 7.25v4" /><circle cx="8" cy="5" r=".9" fill="currentColor" stroke="none" /></>),
  caps: () => svg(<><path d="M8 2.75L3.25 7.5H5.5v3h5v-3h2.25z" /><path d="M5.5 13.25h5" /></>),
  ruleOpen: () => svg(<circle cx="8" cy="8" r="6.25" />),
  ruleMet: () => svg(<><circle className="rule-disc" cx="8" cy="8" r="7" fill="var(--teal)" stroke="none" /><path className="rule-check" d="M5 8.2l2 2 4-4.2" stroke="var(--on-teal)" pathLength="1" /></>),
  envelope: () => svg(<><rect x="2.75" y="4.5" width="14.5" height="11" rx="2" /><path d="M3.5 5.5l6.5 5 6.5-5" /></>, 20),
}

// A labelled text input: label above, input, then message lines (error, then hints).
// error: the message to show (or ''); lines: [{ id, node }] extra hint lines, in reading order.
// The input is described by the error first, then each line (aria-describedby).
const Field = forwardRef(function Field({ id, label, error, lines = [], toggle, className = '', ...input }, ref) {
  const errId = `${id}-err`
  const describedBy = [error && errId, ...lines.filter((l) => l.node).map((l) => l.id)].filter(Boolean).join(' ') || undefined
  return (
    <div className={`field ${className}`} data-invalid={!!error}>
      <label className="field__label" htmlFor={id}>{label}</label>
      <div className="field__control">
        <input ref={ref} id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {...input} />
        {toggle}
      </div>
      {error && <p className="field__msg field__msg--err" id={errId}><AuthIcon.alert />{error}</p>}
      {lines.map((l) => l.node && <div key={l.id} id={l.id}>{l.node}</div>)}
    </div>
  )
})

export default Field
