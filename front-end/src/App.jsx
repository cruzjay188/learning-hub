import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import LecBar from './components/LecBar.jsx'
import SearchPalette from './components/SearchPalette.jsx'
import Sheet from './components/Sheet.jsx'
import StatusMenu from './components/StatusMenu.jsx'
import TabBar from './components/TabBar.jsx'
import Toast from './components/Toast.jsx'
import TopBar from './components/TopBar.jsx'
import { HubContext } from './hooks/useHub.js'
import { useAuth } from './hooks/useAuth.js'
import { takeAuthNote } from './lib/auth.js'
import { useHubData } from './hooks/useHubData.js'
import { useShortcuts } from './hooks/useShortcuts.js'
import { useStore } from './hooks/useStore.js'
import { createHub, createUiStore } from './lib/actions.js'
import { connectCloud } from './lib/cloud.js'
import { settle } from './lib/continuity.js'
import { isPhone } from './lib/motion.js'
import { createProgressStore } from './lib/progressStore.js'
import { KEYS } from './lib/storage.js'
import { connectSupabase } from './lib/supabaseSync.js'
import { userStorageKey } from './utils/authUtils.js'
import { routeKey } from './lib/route.js'
import { etNow } from './utils/dates.js'
import { createModel } from './utils/model.js'
import AuthPage from './views/AuthPage.jsx'
import Course from './views/Course.jsx'
import Lecture from './views/Lecture.jsx'
import Review from './views/Review.jsx'
import Today from './views/Today.jsx'
import Work from './views/Work.jsx'

const TITLES = { today: 'Today', course: 'Course', review: 'Review', work: 'Work' }

// Checks for a logged-in student and loads the course data, then shows the hub.
// With Supabase set up (front-end/.env.local), nobody gets in without an account: Log in first.
// Until both are ready: a skeleton of the Today page.
export default function App({ dataUrl, progressStore, authClient }) {
  const auth = useAuth(authClient === undefined ? undefined : { client: authClient })
  const { data, fromCache, error } = useHubData(dataUrl)
  if (auth.status === 'signedOut') return <main className="page" id="main" tabIndex={-1}><AuthPage auth={auth} /></main>
  // key: logging in as someone else starts a fresh hub with their progress
  if (data && auth.status !== 'checking') return <Hub key={auth.user ? auth.user.id : 'local'} data={data} fromCache={fromCache} progressStore={progressStore} auth={auth} />
  return (
    <main className="page" id="main" tabIndex={-1}>
      <div className="page__inner" id="view">
        {error ? (
          <div className="empty">
            <p>Couldn't load the course data. Reload the page. If it keeps happening, run <code>/sync</code> in Claude Code to republish it.</p>
            <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>Reload</button>
          </div>
        ) : (
          <div className="split">
            <div className="main-col">
              <div className="sk" style={{ height: '44px', width: '60%' }} /><div className="sk" style={{ height: '16px', width: '40%', marginTop: '12px' }} />
              <div className="sk" style={{ height: '56px', marginTop: '32px' }} /><div className="sk" style={{ height: '180px', marginTop: '28px' }} />
            </div>
            <div><div className="sk" style={{ height: '140px' }} /></div>
          </div>
        )}
      </div>
    </main>
  )
}

function Hub({ data, fromCache, progressStore, auth }) {
  // The stores and actions are made once and live as long as the page (or until someone else logs in).
  const [{ hub, progress, ui }] = useState(() => {
    const progress = progressStore || createProgressStore({ key: userStorageKey(KEYS.progress, auth.user && auth.user.id) })
    const ui = createUiStore()
    return { progress, ui, hub: createHub({ data, progress, ui }) }
  })
  const progressState = useStore(progress)
  const uiState = useStore(ui)
  const m = useMemo(() => createModel(data, progressState), [data, progressState])
  const first = useRef(true)

  // After every render: rings, bars and tickers animate from their old values.
  useLayoutEffect(() => {
    settle(document, !first.current)
    first.current = false
  })

  // Saving: to Supabase when a student is logged in, else to claude.ai (the artifact) or this browser.
  const userId = auth.user ? auth.user.id : null
  useEffect(() => {
    const onWriteError = () => hub.toast("Couldn't save your last change. Reload the page to reconnect.")
    if (!userId) { connectCloud(progress, { onWriteError }); return undefined }
    let stop = () => {}
    let live = true
    connectSupabase(progress, auth.client, userId, { onWriteError }).then((fn) => { if (live) stop = fn; else fn() })
    return () => { live = false; stop() }
  }, [hub, progress, auth.client, userId])

  // Once: the first-paint stagger and page-wide listeners.
  const started = useRef(false)
  useEffect(() => {
    const view = document.getElementById('view')
    view.classList.add('view-first')
    const t = setTimeout(() => view.classList.remove('view-first'), 600)
    hub.firstRoute()
    if (!started.current) {
      started.current = true
      const arrived = takeAuthNote(['registered', 'loggedIn']) // just logged in or signed up
      if (arrived) { const t = document.getElementById('v-title'); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }) } }
      if (fromCache) hub.toast('Showing your last saved copy of the course data.')
      else if (arrived === 'registered') hub.toast('Account created. Your progress now saves to it.')
    }

    const onHash = () => hub.navRender()
    // Clicking a link: remember which Course row it was (its title morphs); links in a sheet close it.
    const onClick = (e) => {
      const s = ui.getState()
      if (s.menu && s.menu.open && !e.target.closest('#menu') && !e.target.closest('[data-status-menu]')) hub.closeMenu()
      if (e.target.closest("a[href^='#']")) {
        const lr = e.target.closest('.lrow')
        hub.fromRow(lr ? lr.querySelector('.lrow__title') : null)
        if (document.getElementById('sheet').open && e.target.closest('#sheet')) hub.closeSheet()
      }
    }
    // A shadow under the bar once you scroll; on phones, the tab bar hides while you read a lecture.
    let lastSY = 0
    const onScroll = () => {
      const y = window.scrollY
      const h = document.documentElement
      h.classList.toggle('scrolled', y > 2)
      if (ui.getState().route.view === 'lecture' && isPhone()) {
        const atEnd = window.innerHeight + y >= h.scrollHeight - 40
        if (y > lastSY + 6 && y > 140 && !atEnd) h.classList.add('tabbar-hidden')
        else if (y < lastSY - 6 || atEnd) h.classList.remove('tabbar-hidden')
      } else h.classList.remove('tabbar-hidden')
      lastSY = y
    }
    // Today's timeline moves with the clock: redraw it every minute (unless you're busy).
    const clock = setInterval(() => {
      const busy = document.activeElement.matches('textarea, input') || document.getElementById('sheet').open || document.getElementById('palette').open
      if (ui.getState().route.view === 'today' && !busy) ui.setState({ clock: Date.now() })
    }, 60000)
    window.addEventListener('hashchange', onHash)
    document.addEventListener('click', onClick)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      clearInterval(clock)
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('click', onClick)
      window.removeEventListener('scroll', onScroll)
    }
  }, [hub, progress, ui, fromCache])

  useShortcuts(hub)

  const r = uiState.route
  const lec = r.view === 'lecture' && m.LB(r.id)
  const tab = r.view === 'lecture' ? 'course' : r.view
  const due = m.dueCount(etNow().today)
  const title = lec ? `${m.codeOf(lec) ? m.codeOf(lec) + ' · ' : ''}${lec.title}` : TITLES[r.view]
  useEffect(() => { document.title = lec ? `${lec.title} · Eagle Learning Hub` : 'Eagle Learning Hub' }, [lec])

  const page = r.view === 'lecture' ? <Lecture id={r.id} /> : r.view === 'course' ? <Course /> : r.view === 'review' ? <Review /> : r.view === 'work' ? <Work tab={r.tab} /> : <Today />
  return (
    <HubContext.Provider value={{ m, ui: uiState, progress: progressState, hub, auth }}>
      <a className="skip" href="#main">Skip to main content</a>
      <TopBar tab={tab} title={title} due={due} />
      <main className="page" id="main" tabIndex={-1} data-lecture={r.view === 'lecture'}>
        {/* key: a new page gets fresh elements, like a real page load */}
        <div className="page__inner" id="view"><Fragment key={routeKey(r)}>{page}</Fragment></div>
      </main>
      <div className="lecbar" id="lecbar" hidden={!lec}>{lec && <LecBar l={lec} />}</div>
      <TabBar tab={tab} due={due} />
      <div className="sr-only" role="status" aria-live="polite" id="live" />
      <Toast />
      <SearchPalette />
      <Sheet />
      <StatusMenu />
    </HubContext.Provider>
  )
}
