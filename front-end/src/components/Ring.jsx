import { I } from './icons.jsx'

// Every progress circle. p is 0–100; at 100 it turns into the filled "done" disc.
// `k` (a continuity key) lets the ring animate from its old value when it changes.
export default function Ring({ p, size, k, sw, disc = true, label, cls = '' }) {
  p = Math.max(0, Math.min(100, Math.round(p)))
  sw = sw || (size >= 48 ? 1.8 : size >= 26 ? 2.3 : 2.6)
  const r = 10 - sw / 2
  const done = disc !== false && p >= 100
  return (
    <span className={`ringw ${cls}`} style={{ width: `${size}px`, height: `${size}px` }} data-done={done} {...(k ? { 'data-k': `${k}:d`, 'data-attr': 'data-done' } : {})} aria-hidden="true">
      <svg className="ring" viewBox="0 0 20 20" data-zero={p <= 0}>
        <circle className="ring__track" cx="10" cy="10" r={r} strokeWidth={sw} pathLength="100" />
        <circle className="ring__fill" cx="10" cy="10" r={r} strokeWidth={sw} pathLength="100" style={{ '--p': p }} {...(k ? { 'data-k': k, 'data-var': '--p' } : {})} />
      </svg>
      {label != null && <span className="ringw__label">{label}</span>}
      <span className="ringw__disc"><I.check size={Math.max(10, Math.round(size * 0.5))} /></span>
    </span>
  )
}
