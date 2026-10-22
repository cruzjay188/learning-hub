// Motion helpers. The animations themselves are CSS (styles/03-page.css, 11-view-transitions.css);
// these decide when they run. Rule: keyboard shortcuts and "reduce motion" never animate.
import { flushSync } from 'react-dom'

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isPhone = () => window.matchMedia('(max-width: 899px)').matches

// Turns every transition and animation off until the next change has painted.
export function instantMode() {
  const h = document.documentElement
  h.classList.add('instant')
  requestAnimationFrame(() => requestAnimationFrame(() => h.classList.remove('instant')))
}

// Applies a change to the stores and makes React update the page before the next line runs.
// The hub's actions need this: "tick the step, then focus the next one" needs the next one on screen.
export function commit(fn) {
  let out
  flushSync(() => { out = fn() })
  return out
}

// Runs an update inside a View Transition when the browser supports one.
// `kind` is the CSS class on <html> that picks the animation (vt-swap, vt-rows…).
// update(vt) must change the page synchronously: do the change with commit(), then any follow-up.
export function withTransition(kind, update) {
  const clear = () => document.querySelectorAll("#view [style*='view-transition-name']").forEach((e) => { e.style.viewTransitionName = '' })
  if (!document.startViewTransition || reducedMotion() || document.hidden) {
    update(false)
    clear()
    return
  }
  const h = document.documentElement
  h.classList.add('vt', kind)
  document.startViewTransition(() => update(true)).finished.finally(() => { h.classList.remove('vt', kind); clear() })
}

// Re-plays a one-shot CSS animation by removing and re-adding its class,
// then removes it again once it's done (React keeps the element, so the class would linger).
export function replay(el, cls, ms = 700) {
  if (!el) return
  el.classList.remove(cls)
  void el.offsetWidth // forces the browser to notice the removal
  el.classList.add(cls)
  clearTimeout(el._replayT)
  el._replayT = setTimeout(() => el.classList.remove(cls), ms)
}

export const wait = (ms) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms))
