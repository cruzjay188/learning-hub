import { useEffect, useRef } from 'react'
import { useHub } from '../hooks/useHub.js'
import { isPhone } from '../lib/motion.js'
import CatchupSheet from './sheets/CatchupSheet.jsx'
import HelpSheet from './sheets/HelpSheet.jsx'
import NotesSheet from './sheets/NotesSheet.jsx'
import RateSheet from './sheets/RateSheet.jsx'
import ReviewSheet from './sheets/ReviewSheet.jsx'

const SHEETS = { rate: RateSheet, notes: NotesSheet, help: HelpSheet, catchup: CatchupSheet, review: ReviewSheet }

// The dialog every sheet opens in: centered on desktop, sliding up from the bottom on phones,
// where you can drag it down to close. Its content stays while it fades out.
export default function Sheet() {
  const { ui, hub } = useHub()
  const d = useRef(null)
  const drag = useRef({ y0: null, t0: 0, dy: 0 })

  useEffect(() => {
    const el = d.current
    const onClose = () => hub.onSheetClosed()
    el.addEventListener('close', onClose)
    return () => el.removeEventListener('close', onClose)
  }, [hub])

  const onPointerDown = (e) => {
    const el = d.current
    if (!isPhone() || !e.target.closest('.sheet__grab, .sheet__head') || e.target.closest('button')) return
    drag.current = { y0: e.clientY, t0: performance.now(), dy: 0 }
    el.classList.add('is-dragging')
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    const g = drag.current
    if (g.y0 == null) return
    const raw = e.clientY - g.y0
    g.dy = raw < 0 ? raw * 0.3 : raw // pulling up resists
    d.current.style.setProperty('--drag', `${g.dy}px`)
  }
  const end = () => {
    const el = d.current
    const g = drag.current
    if (g.y0 == null) return
    const v = g.dy / Math.max(1, performance.now() - g.t0)
    g.y0 = null
    el.classList.remove('is-dragging')
    if (g.dy > el.offsetHeight * 0.3 || v > 0.5) { hub.closeSheet(); setTimeout(() => el.style.removeProperty('--drag'), 260) } else el.style.setProperty('--drag', '0px')
  }

  const Body = ui.sheet && SHEETS[ui.sheet.kind]
  return (
    <dialog
      className="sheet" id="sheet" aria-labelledby="sheet-title" ref={d}
      onClick={(e) => { if (e.target === d.current) hub.closeSheet() }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={end} onPointerCancel={end}
    >
      {Body && <Body key={ui.sheet.n} {...ui.sheet} />}
    </dialog>
  )
}
