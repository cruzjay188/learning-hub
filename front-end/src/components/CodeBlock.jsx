import { useHub } from '../hooks/useHub.js'
import CopyButton from './CopyButton.jsx'

// A step's code or prompt, with a Copy button. Long blocks are clamped until you ask for all of it.
// compact: the Today card, which links to the guide instead of expanding.
export default function CodeBlock({ s, lid, compact = false }) {
  const { ui, hub } = useHub()
  if (!s.code) return null
  const key = `${lid}|${s.id}`
  const lines = s.code.split('\n').length
  const wrap = /prompt|claude/i.test(s.codeLabel || '') || (lines === 1 && s.code.length > 90)
  const clamp = !compact && lines > 12 && !ui.revealed[key]
  return (
    <div className="code" data-wrap={wrap} data-clamp={clamp || (compact && lines > 6)}>
      <div className="code__bar">
        <span>{s.codeLabel || 'Code'}</span>
        <CopyButton className="copy-btn" data-copy={key} aria-label={`Copy ${s.codeLabel || 'code'} for step: ${s.title}`} text={s.code} what={s.codeLabel || 'code'} label="Copy" span />
      </div>
      <pre><code>{s.code}</code></pre>
      {clamp
        ? <button type="button" className="code__more" data-action="reveal" data-key={key} onClick={() => hub.set({ revealed: { ...ui.revealed, [key]: true } })}>Show all {lines} lines</button>
        : compact && lines > 6
          ? <a className="code__more" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }} href={`#lecture-${lid}`}>Open the guide to see all {lines} lines</a>
          : null}
    </div>
  )
}
