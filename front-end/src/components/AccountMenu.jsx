import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { I } from './icons.jsx'

// The account button in the top bar: your initial (and name on desktop). It opens a menu with
// who's logged in and Log out, so logging out is never one stray click (it reuses the hub's .menu).
export default function AccountMenu({ auth }) {
  const [open, setOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const btn = useRef(null)
  const menu = useRef(null)
  const name = auth.name || auth.user.email
  const close = (refocus = true) => { setOpen(false); if (refocus) btn.current?.focus() }

  // Opens under the button, right edges lined up; focus goes to Log out.
  useLayoutEffect(() => {
    if (!open) return
    const r = btn.current.getBoundingClientRect()
    const m = menu.current
    m.style.top = `${r.bottom + 6}px`
    m.style.left = `${Math.max(12, r.right - m.offsetWidth)}px`
    m.style.setProperty('--origin', 'top right')
    m.querySelector('[role="menuitem"]').focus()
  }, [open])

  // A click anywhere else closes it.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!menu.current.contains(e.target) && !btn.current.contains(e.target)) close(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  async function logOut() {
    setLeaving(true)
    await auth.logOut() // the app swaps to the Log in screen, which says you're logged out
  }

  return (
    <>
      <button
        type="button" className="account-btn" ref={btn} aria-haspopup="menu" aria-expanded={open}
        aria-label={`Account: ${name}`} title={auth.user.email} onClick={() => setOpen((v) => !v)}
      >
        <span className="account-btn__avatar" aria-hidden="true">{name.trim().charAt(0).toUpperCase()}</span>
        <span className="account-btn__name">{name}</span>
        <I.down />
      </button>
      <div className="menu account-menu" id="account-menu" role="menu" aria-label="Account" hidden={!open} ref={menu}
        onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close() } }}
      >
        <div className="account-menu__who" role="presentation">
          <b>{name}</b>
          <span>{auth.user.email}</span>
        </div>
        <button type="button" role="menuitem" data-action="logout" aria-busy={leaving || undefined} onClick={logOut}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6.5 2.75H4A1.25 1.25 0 0 0 2.75 4v8A1.25 1.25 0 0 0 4 13.25h2.5M10 5l3 3-3 3M13 8H6.5" /></svg>
          <span>{leaving ? 'Logging out…' : 'Log out'}</span>
        </button>
      </div>
    </>
  )
}
