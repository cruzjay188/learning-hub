import { useState } from 'react'
import { useHub } from '../hooks/useHub.js'
import { I } from './icons.jsx'

// A button that copies text and says "Copied" for a moment.
// text can be a function, so the value is read at click time (the Quiz me prompt includes your latest notes).
// span: put the label in a <span> (code blocks) instead of after the icon.
export default function CopyButton({ text, what, label, span = false, className, ...rest }) {
  const { hub } = useHub()
  const [copied, setCopied] = useState(null) // null, then true (copied) or false (selected instead)
  const onClick = async (e) => {
    const pre = e.currentTarget.closest('.code')?.querySelector('pre')
    const ok = await hub.copy(typeof text === 'function' ? text() : text, what, pre)
    setCopied(ok)
    setTimeout(() => setCopied(null), 1600)
  }
  const shown = copied === null ? label : copied ? 'Copied' : 'Selected: press ⌘C'
  return (
    <button type="button" className={className} {...(copied !== null ? { 'data-copied': String(copied) } : {})} onClick={onClick} {...rest}>
      <I.copy />{span ? <span>{shown}</span> : <> {shown}</>}
    </button>
  )
}
