import { useEffect } from 'react'
import { commit, instantMode, isPhone } from '../lib/motion.js'
import { etNow } from '../utils/dates.js'

// Keyboard shortcuts (the Help sheet lists them). They act instantly: no animation.
//   ⌘K or /   search          g t/c/r/w  go to a tab      ?  help
//   on a lecture:  j/k next/previous step · x tick · c copy code · 1–5 rate · n notes · e expand all · Esc back
export function useShortcuts(hub) {
  useEffect(() => {
    let gPending = 0
    const onKeyDown = (e) => {
      const tgt = e.target
      const typing = tgt.matches && tgt.matches('input, textarea, select, [contenteditable]')
      const ui = hub.ui.getState()
      const palette = document.getElementById('palette')
      const sheet = document.getElementById('sheet')
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); hub.togglePalette(); return }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !typing && hub.undoFromKeyboard()) { e.preventDefault(); return }
      if (ui.menu && ui.menu.open) return // the status menu handles its own keys
      if (typing || e.metaKey || e.ctrlKey || e.altKey || palette.open || sheet.open) return
      const r = ui.route
      if (gPending && Date.now() - gPending < 1200) {
        gPending = 0
        const map = { t: '#today', c: '#course', r: '#review', w: '#work' }
        if (map[e.key]) { e.preventDefault(); hub.navigate(map[e.key], { instant: true }) }
        return
      }
      if (e.key === '/') { e.preventDefault(); hub.openPalette(); return }
      if (e.key === '?') { e.preventDefault(); hub.sheetHelp(); return }
      if (e.key === 'g') { gPending = Date.now(); return }
      if (r.view !== 'lecture') return
      if (e.key === 'Escape') { e.preventDefault(); hub.navigate('#course'); return }
      const m = hub.m()
      const l = m.LB(r.id)
      if (!l) return
      const steps = m.stepsOf(l)
      const curEl = document.activeElement && document.activeElement.closest && document.activeElement.closest('.step')
      const cur = curEl ? steps.find((s) => s.id === curEl.dataset.step) : m.firstOpen(l) || steps[steps.length - 1]
      const ci = steps.indexOf(cur)
      const focus = (sel) => { const t = document.querySelector(sel); if (t) t.focus({ preventScroll: true }) }
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const nx = steps[Math.min(steps.length - 1, Math.max(0, ci + (e.key === 'j' ? 1 : -1)))]
        if (!nx) return
        instantMode()
        commit(() => hub.setOpen(l.id, nx.id, true))
        hub.scrollToStep(nx.id, true)
        focus(`#step-${CSS.escape(nx.id)} .step__toggle`)
      } else if (e.key === 'x' && cur) {
        e.preventDefault()
        instantMode()
        commit(() => hub.toggleStep(l.id, cur.id))
        focus(`#step-${CSS.escape(cur.id)} .marker`)
      } else if (e.key === 'c' && cur && cur.code) {
        e.preventDefault()
        hub.copy(cur.code, cur.codeLabel || 'code')
      } else if (/^[1-5]$/.test(e.key) && l.date <= etNow().today) {
        e.preventDefault()
        instantMode()
        commit(() => hub.rate(l.id, +e.key))
      } else if (e.key === 'n') {
        e.preventDefault()
        if (isPhone()) hub.sheetNotes(l.id)
        else focus(`#notes-${CSS.escape(l.id)}`)
      } else if (e.key === 'e') {
        e.preventDefault()
        hub.set({ expandAll: !ui.expandAll, open: {} }, { instant: true })
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hub])
}
