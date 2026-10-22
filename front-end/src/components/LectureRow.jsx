import { useHub } from '../hooks/useHub.js'
import { fShort, pd } from '../utils/dates.js'
import { CONF, pct, ST_TEXT } from '../utils/format.js'
import { StrengthMeter } from './Bits.jsx'
import { I, ST } from './icons.jsx'

// One lecture in the Course list: status, code, title, date, steps done, your rating.
export default function LectureRow({ l, today, i = 0 }) {
  const { m } = useHub()
  const s = m.status(l, today)
  const p = m.prog(l)
  const c = m.LS(l.id).confidence
  const note = (m.LS(l.id).notes || '').trim()
  const Mark = ST[s === 'notchecked' || s === 'upcoming' ? 'open' : s]
  return (
    <a className="lrow" href={`#lecture-${l.id}`} data-status={s} data-lid={l.id} style={{ '--i': i }}>
      <span className="st" title={ST_TEXT[s]}><Mark /><span className="sr-only">{ST_TEXT[s]}</span></span>
      <span className="code-tag lrow__code">{m.codeOf(l)}</span>
      <span className="lrow__title">{l.title}{note && <><span className="note-dot" title="Has notes" /><span className="sr-only">, has notes</span></>}</span>
      <span className="lrow__date num">{fShort(l.date)}{l.dates.length > 1 ? `–${pd(l.dates[l.dates.length - 1]).getUTCDate()}` : ''}</span>
      <span className="lrow__prog">
        {l.guide && l.guide.status === 'outline'
          ? `prep ${p.done ? p.done + '/' : ''}${p.total}`
          : p.total ? <><span className="mini"><span style={{ '--w': `${pct(p.done, p.total)}%` }} data-k={`lr-${l.id}`} data-var="--w" /></span><span className="num">{p.done}/{p.total}</span></> : ''}
      </span>
      <span className="lrow__conf">{c ? <><StrengthMeter c={c} />{CONF[c - 1]}</> : ''}</span>
      <span className="lrow__go"><I.chev /></span>
    </a>
  )
}
