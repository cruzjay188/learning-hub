import { useHub } from '../hooks/useHub.js'
import { instantMode } from '../lib/motion.js'
import { A_MARK } from '../utils/format.js'
import { I, ST } from './icons.jsx'

const CHOICES = [['todo', 'To do'], ['in-progress', 'In progress'], ['check', 'Ask instructor'], ['done', 'Done']]

// The menu that opens from an assignment's status mark (Work page). hub.openMenu() positions it.
// It stays in the page while hidden, so it can fade out.
export default function StatusMenu() {
  const { ui, hub, m } = useHub()
  const menu = ui.menu
  const a = menu && m.data.assignments.find((x) => x.id === menu.aid)
  const cur = a && m.assignStatus(a)

  const onKeyDown = (e) => {
    const items = [...e.currentTarget.querySelectorAll('button')]
    const i = items.indexOf(document.activeElement)
    if (e.key === 'Escape') { e.preventDefault(); hub.closeMenu() }
    else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); instantMode(); hub.setStatus(CHOICES[+e.key - 1][0]) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus() }
  }

  return (
    <div className="menu" id="menu" role="menu" hidden={!(menu && menu.open)} onKeyDown={onKeyDown}>
      {a && CHOICES.map(([k, t], i) => {
        const Mark = ST[A_MARK[k]]
        return (
          <button key={k} type="button" role="menuitemradio" aria-checked={cur === k} data-set-status={k} onClick={() => hub.setStatus(k)}>
            <Mark /><span>{t}</span><span className="m-key">{i + 1}</span><span className="m-chk"><I.check size={14} /></span>
          </button>
        )
      })}
    </div>
  )
}
