import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom (the fake browser tests run in) is missing a few things the hub uses. Simple stand-ins:
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }))
window.scrollTo = () => {}
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || function () {}
if (!globalThis.CSS) globalThis.CSS = {}
if (!CSS.escape) CSS.escape = (s) => String(s).replace(/[^\w-]/g, (c) => `\\${c}`)
// <dialog>: jsdom knows the element but not showModal()
if (window.HTMLDialogElement && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')) }
}

beforeEach(() => {
  // every test runs on Monday, Oct 19 2026 at 11:15 ET (week 3, AI-8 day)
  localStorage.setItem('hub:debug-now', '2026-10-19T11:15')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  window.location.hash = ''
})
