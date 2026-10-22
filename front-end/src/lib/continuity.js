// Continuity: progress is seen to change. Any element with data-k remembers its value between
// renders; when a render changes it, the element starts at the old value and moves to the new one
// (rings fill, bars grow, ticker digits roll). App runs settle() after every render.
//
//   data-k="key" data-var="--p"      animate a CSS variable (rings, bars, the rating thumb)
//   data-k="key" data-attr="data-s"  animate an attribute (Up next's step segments)
//   data-k="key" (text)              replay the swap-in animation when the text changes
//   .tick data-k data-n              a ticker: digits roll from the old number
import { reducedMotion } from './motion.js'

const kmem = new Map()
// Elements held at their old value until the next frame: el → { temp, target }.
// React can render twice before that frame (an action, then its toast). The second settle()
// must not mistake the temporary old value for a new one, or the animation would run backwards.
const holding = new WeakMap()
let delay = 0

// Going back to Course waits for the view transition before rings animate.
export function setSettleDelay(ms) { delay = ms }

export function settle(root = document, animate = true) {
  const go = animate && !reducedMotion() && !document.documentElement.classList.contains('instant')
  const pending = []
  root.querySelectorAll('[data-k]').forEach((el) => {
    const k = el.dataset.k
    if (el.classList.contains('tick')) {
      const n = el.dataset.n
      const prev = kmem.get(k)
      kmem.set(k, n)
      if (go && prev !== undefined && prev !== n && prev.length === n.length) {
        const ds = [...el.querySelectorAll('.d')]
        el.classList.add('no-tr')
        ds.forEach((d, i) => d.style.setProperty('--d', prev[i]))
        pending.push(() => { el.classList.remove('no-tr'); ds.forEach((d, i) => d.style.setProperty('--d', n[i])) })
      }
      return
    }
    const v = el.dataset.var
    const a = el.dataset.attr
    let cur = v ? el.style.getPropertyValue(v) : a ? el.getAttribute(a) : el.textContent
    const held = holding.get(el)
    if (held && cur === held.temp) cur = held.target // still showing our temporary value: the real one is the target
    const prev = kmem.get(k)
    kmem.set(k, cur)
    if (!go || prev === undefined || prev === cur) return
    if (!v && !a) { el.classList.remove('is-swapping'); void el.offsetWidth; el.classList.add('is-swapping'); return }
    el.classList.add('no-tr')
    if (v) el.style.setProperty(v, prev)
    else el.setAttribute(a, prev)
    const hold = { temp: prev, target: cur }
    holding.set(el, hold)
    pending.push(() => {
      if (holding.get(el) !== hold) return // a newer change took over
      holding.delete(el)
      el.classList.remove('no-tr')
      if (v) el.style.setProperty(v, cur)
      else el.setAttribute(a, cur)
    })
  })
  placeSegs(root, animate)
  if (!pending.length) return
  void document.body.offsetWidth
  const run = () => requestAnimationFrame(() => pending.forEach((f) => f()))
  if (delay) { setTimeout(run, delay); delay = 0 } else run()
}

// Segmented controls: the thumb slides from where it was to the chosen item.
const segMem = {}
export function placeSegs(root = document, animate = true) {
  root.querySelectorAll('[data-segc]').forEach((g) => {
    const th = g.querySelector('.segc__thumb')
    const sel = g.querySelector('[aria-pressed="true"], [aria-current="page"]')
    if (!th || !sel || !g.offsetWidth) return
    const w = g.clientWidth - 6
    const l = sel.offsetLeft - 3
    const r = w - l - sel.offsetWidth
    const key = g.dataset.segc
    const prev = segMem[key]
    th.dataset.ready = 'false'
    if (animate && prev && !reducedMotion() && (prev.l !== l || prev.r !== r)) {
      th.style.setProperty('--tl', prev.l + 'px')
      th.style.setProperty('--tr', prev.r + 'px')
      void th.offsetWidth
      th.dataset.ready = 'true'
    }
    th.style.setProperty('--tl', l + 'px')
    th.style.setProperty('--tr', r + 'px')
    segMem[key] = { l, r }
  })
}
