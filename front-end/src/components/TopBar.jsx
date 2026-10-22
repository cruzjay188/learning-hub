import { useEffect, useLayoutEffect, useRef } from 'react'
import { useHub } from '../hooks/useHub.js'
import { etDateOf, fMD } from '../utils/dates.js'

const TABS = [['today', 'Today'], ['course', 'Course'], ['review', 'Review'], ['work', 'Work']]
const SAVE_TEXT = { saving: 'Saving…', cloud: 'Saved', local: 'Saved in this browser only', readonly: 'View only', error: 'Not saving: reload', loading: 'Connecting…' }
const SAVE_TIP = { cloud: 'Your progress saves to your account', local: 'Open the hub on claude.ai to save to your account', error: 'Click to reload and reconnect', readonly: 'You can view but not change this hub' }

// Desktop tabs: one underline that slides to the current tab (clip-path, so no layout work).
function placeTabInd(nav, instant) {
  const ind = nav.querySelector('.tabs__ind')
  const a = nav.querySelector('.tab[aria-current="page"]')
  if (!a || !a.offsetWidth) return
  if (instant) ind.dataset.ready = 'false'
  ind.style.setProperty('--ind-l', `${a.offsetLeft + 12}px`)
  ind.style.setProperty('--ind-r', `${a.offsetLeft + a.offsetWidth - 12}px`)
  if (instant) { void ind.offsetWidth; ind.dataset.ready = 'true' }
}

// The bar across the top: brand, page title (phone), tabs, search and the Save badge.
export default function TopBar({ tab, title, due }) {
  const { hub, progress, m, auth } = useHub()
  const nav = useRef(null)
  const placed = useRef(false)

  useLayoutEffect(() => {
    placeTabInd(nav.current, !placed.current)
    placed.current = true
  }, [tab])
  useEffect(() => {
    const onResize = () => placeTabInd(nav.current, true)
    window.addEventListener('resize', onResize)
    if (document.fonts) document.fonts.ready.then(onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const mode = progress.saving > 0 ? 'saving' : progress.mode
  const tip = SAVE_TIP[mode] || ''
  const text = SAVE_TEXT[mode]
  return (
    <header className="bar">
      <div className="bar__inner">
        <a className="brand" href="#today" aria-label="Eagle Learning Hub, Today">
          <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="var(--teal)" /><path d="M8.5 7.5l6.5 6.5-6.5 6.5M14 7.5l6.5 6.5-6.5 6.5" fill="none" stroke="var(--now)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="brand__name">Eagle Learning Hub</span>
        </a>
        <p className="bar__title" id="bar-title">{title}</p>
        <nav className="tabs" aria-label="Sections" ref={nav}>
          {TABS.map(([k, label]) => (
            <a key={k} className="tab" href={`#${k}`} data-tab={k} aria-current={tab === k ? 'page' : 'false'}>
              {label}{k === 'review' && <span className="badge" data-badge="" hidden={!due} aria-label={`${due} due`}>{due}</span>}
            </a>
          ))}
          <span className="tabs__ind" aria-hidden="true" />
        </nav>
        <div className="bar__right">
          <button type="button" className="search-btn" data-action="palette" aria-label="Search lectures, terms and assignments" aria-keyshortcuts="Meta+K" onClick={hub.openPalette}>
            <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10.6 10.6L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            <span>Search lectures, terms…</span><kbd>⌘K</kbd>
          </button>
          <button type="button" className="icon-btn phone-only" data-action="palette" aria-label="Search" onClick={hub.openPalette}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M13.2 13.2l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
          </button>
          <button
            type="button" className="save" id="save" data-mode={mode}
            title={`${tip} · Course data updated ${fMD(etDateOf(m.data.generatedAt))}`}
            aria-label={`${text}. ${tip}`}
            onClick={() => (mode === 'error' ? window.location.reload() : hub.sheetHelp())}
          >
            <span className="save__dot" aria-hidden="true" /><span className="save__text" id="save-text">{text}</span>
          </button>
          {auth && auth.status === 'signedIn' && (
            <button type="button" className="btn btn--quiet btn--sm account-btn" title={`Logged in as ${auth.user.email}`} onClick={auth.logOut}>
              <span className="account-btn__name">{auth.name} · </span>Log out
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
