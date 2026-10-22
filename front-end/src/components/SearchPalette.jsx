import { useEffect, useRef } from 'react'
import { useHub } from '../hooks/useHub.js'
import { plural } from '../utils/format.js'
import { searchResults } from '../utils/search.js'
import { KEYS, readJSON } from '../lib/storage.js'
import { I } from './icons.jsx'

const TILE = { Actions: I.bolt, Lectures: I.book, 'Key terms': I.term, Assignments: I.repo, Recent: I.clock }

// The query's first match, highlighted
function Hi({ t, q }) {
  const i = q ? t.toLowerCase().indexOf(q) : -1
  if (i < 0) return t
  return <>{t.slice(0, i)}<mark>{t.slice(i, i + q.length)}</mark>{t.slice(i + q.length)}</>
}

// ⌘K / "/" search: lectures, key terms, assignments and a few actions.
export default function SearchPalette() {
  const { ui, hub, m } = useHub()
  const dialog = useRef(null)
  const pal = ui.palette
  const q = pal ? pal.q : ''
  const results = pal ? searchResults(pal.index, q, readJSON(KEYS.recent, []), m) : []
  const sel = pal ? Math.min(pal.sel, Math.max(0, results.length - 1)) : 0
  const qq = q.trim().toLowerCase()

  useEffect(() => {
    const d = dialog.current
    const onClose = () => hub.onPaletteClosed()
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [hub])
  // keep the selected result in view
  useEffect(() => {
    const el = document.getElementById(`pal-${sel}`)
    if (el && pal) el.scrollIntoView({ block: 'nearest' })
  }, [sel, pal])

  const setPal = (patch) => hub.ui.setState((s) => ({ palette: { ...s.palette, ...patch } }))
  const onKeyDown = (e) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setPal({ sel: (sel + 1) % results.length }) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPal({ sel: (sel - 1 + results.length) % results.length }) }
    else if (e.key === 'Enter') { e.preventDefault(); hub.runResult(results[sel]) }
  }

  let group = ''
  return (
    <dialog className="palette" id="palette" aria-label="Search" ref={dialog} onClick={(e) => { if (e.target === dialog.current) hub.closePalette() }}>
      <div className="palette__input">
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.8" fill="none" stroke="var(--muted)" strokeWidth="1.6" /><path d="M10.6 10.6L14 14" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <input
          id="pal-input" type="text" placeholder="Search lectures, terms, assignments…" aria-label="Search" aria-controls="pal-list" aria-autocomplete="list"
          autoComplete="off" spellCheck="false" value={q} onChange={(e) => setPal({ q: e.target.value, sel: 0 })} onKeyDown={onKeyDown}
          {...(pal && results.length ? { 'aria-activedescendant': `pal-${sel}` } : {})}
        />
        <span className="kbd">esc</span>
      </div>
      <div className="palette__list" id="pal-list" role="listbox" aria-label="Results">
        {pal && !results.length && <p className="palette__empty">No match for “{q}”. Try a lecture code like AI-8, or a term like RLS.</p>}
        {results.map((x, i) => {
          const Tile = TILE[x.g] || I.book
          const head = x.g !== group
          group = x.g
          return [
            head && <p key={`g-${x.g}`} className="pal-group" role="presentation">{x.g}</p>,
            <button key={i} type="button" className="pal-item" role="option" id={`pal-${i}`} data-pal={i} aria-selected={i === sel} onClick={() => hub.runResult(x)}>
              <span className="pal-item__tile" aria-hidden="true"><Tile /></span>
              <span className="pal-item__text"><span className="pal-item__title"><Hi t={x.t} q={qq} /></span><span className="pal-item__sub">{x.s}</span></span>
              {x.ext && <I.ext />}
              <span className="kbd pal-item__go" aria-hidden="true"><I.ret /></span>
            </button>,
          ]
        })}
      </div>
      <div className="palette__foot">
        <span><span className="kbd">↑</span><span className="kbd">↓</span>move</span><span><span className="kbd">↵</span>open</span><span><span className="kbd">esc</span>close</span>
        <span id="pal-count" style={{ marginLeft: 'auto' }}>{results.length ? plural(results.length, 'result') : ''}</span>
      </div>
    </dialog>
  )
}
