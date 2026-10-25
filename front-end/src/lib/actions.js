// Every action in the hub: what happens when you tick a step, rate a lecture, open a sheet…
// Components call these (hub.tick(…), hub.rate(…)) instead of changing state themselves.
//
// Pattern: change the stores inside commit(), so React redraws the page immediately; then do
// the follow-up that needs the new page (move focus, scroll, replay an animation).
import { createModel } from '../utils/model.js'
import { safeUrl } from '../utils/safeUrl.js'
import { etNow, fShort } from '../utils/dates.js'
import { A_LABEL, CONF } from '../utils/format.js'
import { buildIndex } from '../utils/search.js'
import { quizPrompt } from '../utils/prompts.js'
import { copyText } from './clipboard.js'
import { setSettleDelay } from './continuity.js'
import { commit, instantMode, isPhone, reducedMotion, replay, wait, withTransition } from './motion.js'
import { depthOf, parseHash, TAB_ORDER, viewKey } from './route.js'
import { KEYS, readText, rememberRecent, writeText } from './storage.js'
import { createStore } from './store.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const esc = (s) => CSS.escape(s)

// Page state that isn't saved anywhere: where you are, filters, open steps, the open sheet…
export function createUiStore() {
  return createStore({
    route: parseHash(),
    courseFilter: 'all', module: '', openWeeks: null, reviewFilter: 'due', showDone: false, timelineOpen: false,
    expandAll: readText(KEYS.expanded) === '1',
    open: {}, // lectureId → Set of step ids you opened ("!id" = you closed it)
    revealed: {}, // "lectureId|stepId" → long code block shown in full
    notesDraft: {}, notesStatus: {}, notesSavedAt: {},
    sheet: null, // { kind: rate | notes | help | catchup | review, lid }
    rv: null, // the review session in the sheet
    menu: null, // { aid }: the assignment status menu
    palette: null, // { index, q, sel }
    toast: null, // { msg, label, kind }
  })
}

export function createHub({ data, progress, ui }) {
  const m = () => createModel(data, progress.getState())
  const S = () => ui.getState()
  const route = () => S().route

  // ---------- announcements and toasts ----------
  function announce(msg) {
    const el = $('#live')
    if (!el) return
    el.textContent = ''
    setTimeout(() => { el.textContent = msg }, 30)
  }
  let toastT = null
  let toastFn = null
  function toast(msg, action, kind) {
    const el = $('#toast')
    const showing = el.dataset.show === 'true'
    const k = kind || (action ? 'done' : /^Copied/.test(msg) ? 'copy' : /^Couldn't/.test(msg) ? 'warn' : 'done')
    commit(() => ui.setState({ toast: { msg, label: action ? action.label : null, kind: k } }))
    toastFn = action ? action.fn : null
    el.classList.remove('is-swapping')
    if (showing) { void el.offsetWidth; el.classList.add('is-swapping') } else { el.classList.add('is-from'); void el.offsetWidth; el.classList.remove('is-from') }
    el.dataset.show = 'true'
    armToast(action ? 6000 : 2200)
  }
  function armToast(ms) {
    clearTimeout(toastT)
    toastT = setTimeout(() => { $('#toast').dataset.show = 'false'; toastFn = null }, ms)
  }
  // Like Sonner, the toast waits while the pointer or keyboard focus is on it.
  const holdToast = () => clearTimeout(toastT)
  const releaseToast = () => { if ($('#toast').dataset.show === 'true') armToast(2000) }
  function runToastAction() {
    const fn = toastFn
    toastFn = null
    $('#toast').dataset.show = 'false'
    if (fn) fn()
  }
  // ⌘Z while an Undo toast is up
  function undoFromKeyboard() {
    if (!toastFn || $('#toast').dataset.show !== 'true') return false
    const fn = toastFn
    toastFn = null
    instantMode()
    fn()
    toast('Undone')
    return true
  }

  // ---------- navigation ----------
  // Links are plain <a href="#…">; the hashchange event lands in navRender().
  let lastRoute = null
  let vtFrom = null
  let instantNav = false
  const scrollMem = {}

  function navigate(hash, { instant = false } = {}) {
    instantNav = instant
    if (window.location.hash === hash) { instantNav = false; showRoute(route(), { userNav: true, same: true }) } else window.location.hash = hash
  }
  // A Course row was clicked: its title morphs into the lecture's title.
  const fromRow = (el) => { vtFrom = el }

  // After the new page is on screen: entrance animation, scroll, focus.
  function showRoute(r, opts = {}) {
    if (opts.instant) instantMode()
    if (!opts.same) commit(() => ui.setState({ route: r }))
    const view = $('#view')
    lastRoute = r
    view.classList.remove('view-enter', 'view-first')
    if (!opts.vt && !opts.instant) { void view.offsetWidth; view.classList.add('view-enter') }
    document.documentElement.classList.remove('tabbar-hidden')
    window.scrollTo(0, opts.restoreY != null ? opts.restoreY : 0)
    const origin = opts.origin && originRow(opts.origin)
    if (origin) {
      const rr = origin.getBoundingClientRect()
      if (rr.top < 72 || rr.bottom > window.innerHeight - 24) origin.scrollIntoView({ block: 'center' })
      origin.classList.add('is-origin')
      setTimeout(() => origin.classList.remove('is-origin'), 1000)
      ;(origin.matches('a') ? origin : origin.querySelector('a') || origin).focus({ preventScroll: true })
    } else if (opts.userNav) {
      const t = $('#v-title')
      if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }) }
    }
    if (r.view === 'lecture' && m().LB(r.id)) rememberRecent(r.id)
  }
  // the row you came from (Course or Review), so going back lands where you were
  const originRow = (id) => (id ? ($(`.lrow[data-lid="${esc(id)}"]`) || $(`.rv-row[data-lid="${esc(id)}"]`)) : null)

  // Drilling into a lecture slides forward, leaving it slides back; tabs slide toward their side.
  function navRender() {
    const to = parseHash()
    const from = lastRoute
    const instant = instantNav
    const src = vtFrom
    instantNav = false
    vtFrom = null
    if (from && from.view !== 'lecture') scrollMem[viewKey(from)] = window.scrollY
    let dir = 0
    let tabDir = 0
    if (from && depthOf(to) !== depthOf(from)) dir = depthOf(to) > depthOf(from) ? 1 : -1
    else if (from && depthOf(to) && to.id !== from.id) dir = m().L.findIndex((x) => x.id === to.id) > m().L.findIndex((x) => x.id === from.id) ? 1 : -1
    else if (from && viewKey(to) !== viewKey(from)) tabDir = TAB_ORDER.indexOf(to.view) > TAB_ORDER.indexOf(from.view) || (to.view === from.view && to.tab === 'activity') ? 1 : -1
    const back = dir < 0 && from && from.view === 'lecture' && to.view !== 'lecture'
    const opts = { userNav: true, instant }
    if (back) { opts.restoreY = scrollMem[viewKey(to)]; opts.origin = from.id; setSettleDelay(300) }
    if ((!dir && !tabDir) || instant || !document.startViewTransition || reducedMotion()) { showRoute(to, opts); return }
    const h = document.documentElement
    const cls = dir ? (dir > 0 ? 'vt-fwd' : 'vt-back') : tabDir > 0 ? 'vt-tab-fwd' : 'vt-tab-back'
    h.classList.add('vt', cls)
    const morph = dir > 0 && src && document.contains(src)
    const oldTitle = back ? $('#v-title') : null
    if (morph) src.style.viewTransitionName = 'lec-title'
    if (oldTitle) oldTitle.style.viewTransitionName = 'lec-title'
    const t = document.startViewTransition(() => {
      if (morph) src.style.viewTransitionName = ''
      if (oldTitle) oldTitle.style.viewTransitionName = ''
      showRoute(to, { ...opts, vt: true })
      if (morph) { const ti = $('#v-title'); if (ti) ti.style.viewTransitionName = 'lec-title' }
      if (back) {
        const row = originRow(from.id)
        const tt = row && row.querySelector('.lrow__title, .row__title a')
        if (tt && tt.getClientRects().length) tt.style.viewTransitionName = 'lec-title'
      }
    })
    t.finished.finally(() => {
      h.classList.remove('vt', cls)
      $$("[style*='view-transition-name']").forEach((e) => { if (!e.closest('.bar, .tabbar, .lecbar')) e.style.viewTransitionName = '' })
    })
  }
  const firstRoute = () => { lastRoute = route() }

  // ---------- page state helpers ----------
  const set = (patch, opts = {}) => {
    if (opts.instant) instantMode()
    commit(() => ui.setState(patch))
    if (opts.rowsIn && !reducedMotion() && !opts.instant) {
      const view = $('#view')
      replay(view, 'rows-in')
      setTimeout(() => view.classList.remove('rows-in'), 700)
    }
  }
  function setOpen(lid, sid, open) {
    const all = { ...S().open }
    const o = new Set(all[lid] || [])
    if (open) { o.add(sid); o.delete('!' + sid) } else { o.delete(sid); o.add('!' + sid) }
    all[lid] = o
    ui.setState({ open: all })
  }
  const isOpen = (lid, sid) => { const li = document.getElementById(`step-${sid}`); return li ? li.dataset.open === 'true' : false }

  // ---------- steps ----------
  function toggleStep(lid, sid, value) {
    const st = progress.lecture(lid)
    const steps = { ...(st.steps || {}) }
    const on = value === undefined ? !steps[sid] : value
    if (on) steps[sid] = true
    else delete steps[sid]
    progress.putLecture(lid, { steps, touchedAt: new Date().toISOString() })
    const mm = m()
    const l = mm.LB(lid)
    const p = mm.prog(l)
    const i = mm.stepsOf(l).findIndex((s) => s.id === sid) + 1
    const nx = mm.firstOpen(l)
    announce(on ? `Step ${i} done. ${p.done} of ${p.total}.${nx ? ` Next: ${nx.title}.` : ' All steps done.'}` : `Step ${i} marked not done. ${p.done} of ${p.total}.`)
    return on
  }
  const markNew = (sid) => replay(document.getElementById(`step-${sid}`), 'is-new')

  // A step's circle, a Today checkbox or a step's Undo
  function tick(lid, sid, btn) {
    if (route().view === 'lecture') {
      const on = commit(() => { const v = toggleStep(lid, sid); if (!v) setOpen(lid, sid, false); return v })
      const mk = $(`#step-${esc(sid)} .marker`)
      if (mk && !document.activeElement.closest('.step')) mk.focus({ preventScroll: true })
      else if (mk && btn && btn.classList.contains('step__undo')) mk.focus({ preventScroll: true })
      if (on) markNew(sid)
    } else {
      const on = commit(() => toggleStep(lid, sid))
      const cb = $(`.cb[data-tick="${esc(`${lid}|${sid}`)}"]`)
      if (cb) { cb.classList.remove('is-new'); if (on) replay(cb, 'is-new') }
    }
  }
  const toggleOpen = (lid, sid) => commit(() => setOpen(lid, sid, !isOpen(lid, sid)))
  function scrollToStep(sid, instant) {
    const el = document.getElementById(`step-${sid}`)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: y, behavior: instant || reducedMotion() ? 'auto' : 'smooth' })
  }
  function jump(lid, sid) {
    commit(() => setOpen(lid, sid, true))
    scrollToStep(sid)
    const t = $(`#step-${esc(sid)} .step__toggle`)
    if (t) t.focus({ preventScroll: true })
  }
  function skip(lid, sid) {
    const mm = m()
    const steps = mm.stepsOf(mm.LB(lid))
    const i = steps.findIndex((x) => x.id === sid)
    const nx = steps.slice(i + 1).find((x) => !mm.isDone(lid, x.id))
    commit(() => { setOpen(lid, sid, false); if (nx) setOpen(lid, nx.id, true) })
    if (nx) { if (reducedMotion()) scrollToStep(nx.id); else setTimeout(() => scrollToStep(nx.id), 240) }
  }

  // "Mark done and continue": the tick plays where you can see it, then this step folds while the next opens,
  // so the next step's header lands where your eye already is. Scroll only if it would be off screen.
  let dcBusy = false
  async function doneContinue(lid, sid) {
    if (dcBusy) return
    dcBusy = true
    const quick = reducedMotion()
    const li = document.getElementById(`step-${sid}`)
    const top = li ? li.getBoundingClientRect().top : 0
    if (li && (top < 64 || top > window.innerHeight * 0.7)) { window.scrollTo({ top: window.scrollY + top - 112, behavior: quick ? 'auto' : 'smooth' }); await wait(340) }
    const btn = li && li.querySelector("[data-action='done-continue']")
    if (btn && !quick) { btn.classList.add('is-done'); await wait(280) }
    // tick, keep this step open and the next one closed for a beat, then fold this one while the next opens
    const mm = m()
    const steps = mm.stepsOf(mm.LB(lid))
    const next = steps.slice(steps.findIndex((x) => x.id === sid) + 1).find((x) => !mm.isDone(lid, x.id)) || steps.find((x) => x.id !== sid && !mm.isDone(lid, x.id))
    commit(() => { toggleStep(lid, sid, true); setOpen(lid, sid, true); if (next) setOpen(lid, next.id, false) })
    markNew(sid)
    await wait(380)
    const nx = m().firstOpen(m().LB(lid))
    commit(() => { setOpen(lid, sid, false); if (nx) setOpen(lid, nx.id, true) })
    await wait(240)
    if (nx) {
      const el = document.getElementById(`step-${nx.id}`)
      const r = el && el.getBoundingClientRect()
      const floor = isPhone() ? window.innerHeight - 150 : window.innerHeight - 40
      if (r && (r.top < 64 || r.top > floor - 120)) window.scrollTo({ top: window.scrollY + r.top - 112, behavior: quick ? 'auto' : 'smooth' })
      const t = $(`#step-${esc(nx.id)} .step__toggle`)
      if (t) t.focus({ preventScroll: true })
    } else {
      const fin = $('#finished')
      const f = $("#finished [role='radio']")
      if (fin) fin.scrollIntoView({ block: 'center', behavior: quick ? 'auto' : 'smooth' })
      if (f) f.focus({ preventScroll: true })
    }
    dcBusy = false
  }

  // Today's "Mark step done": says Done for a beat, then the Up next card swaps to the next step.
  function doneNext(lid, sid, btn) {
    if (btn.classList.contains('is-done')) return
    const swapNow = () => {
      const st = m().stepsOf(m().LB(lid)).find((x) => x.id === sid)
      const nameAll = () => {
        const u = $('#upnext')
        if (!u) return
        u.style.viewTransitionName = 'upnext-card'
        let i = 0
        for (let n = u.nextElementSibling; n; n = n.nextElementSibling) n.style.viewTransitionName = `below-${i++}`
      }
      nameAll()
      withTransition('vt-swap', (vt) => {
        commit(() => toggleStep(lid, sid, true))
        const done = $("[data-action='done-next'].is-done")
        if (done) done.classList.remove('is-done')
        if (!vt) { const u = $('#upnext'); if (u) u.classList.add('is-swapping') } else nameAll()
        const nb = $("[data-action='done-next']")
        if (nb) nb.focus({ preventScroll: true })
        else { const ob = $('#upnext a'); if (ob) ob.focus({ preventScroll: true }) }
        setTimeout(() => toast(`Done: ${st.title}`, {
          label: 'Undo',
          fn: () => { commit(() => toggleStep(lid, sid, false)); const u = $("[data-action='done-next']"); if (u) u.focus({ preventScroll: true }) },
        }), vt ? 300 : 0)
      })
    }
    if (reducedMotion()) swapNow()
    else { btn.classList.add('is-done'); setTimeout(swapNow, 300) }
  }

  function setExpandAll(v, opts) {
    writeText(KEYS.expanded, v ? '1' : '0')
    set({ expandAll: v, open: {} }, opts)
  }

  // ---------- ratings ----------
  function rate(lid, n, opts = {}) {
    const now = new Date().toISOString()
    progress.putLecture(lid, n ? { confidence: n, ratedAt: now, ...(opts.review ? { reviewedAt: now } : {}) } : { confidence: 0, ratedAt: null })
    announce(n ? `Rated ${n} of 5, ${CONF[n - 1]}.` : 'Rating cleared.')
  }
  // where: "page" (rail or finished panel) | "sheet" (the Rate sheet) | "review" (end of a review)
  function rateClick(lid, n, where) {
    const st = progress.lecture(lid)
    const prev = { confidence: st.confidence || 0, ratedAt: st.ratedAt || null }
    const undo = { label: 'Undo', fn: () => commit(() => progress.putLecture(lid, prev)) }
    commit(() => {
      rate(lid, n, { review: where === 'review' })
      if (where === 'review') ui.setState({ rv: { ...S().rv, rated: n } })
    })
    if (where === 'review') {
      const body = $('#rv-body')
      const nx = body && (body.querySelector("[data-rv='next']") || body.querySelector(`[data-conf="${n}"]`))
      if (nx) nx.focus({ preventScroll: true })
      toast(`Rated ${CONF[n - 1]}`, undo)
      return
    }
    if (where === 'sheet') {
      const sh = $('#sheet')
      const b = sh.querySelector(`[data-conf="${n}"]`)
      if (b) b.focus()
      clearTimeout(sh._rateT)
      sh._rateT = setTimeout(() => { if (sh.open) closeSheet(); toast(`Rated ${CONF[n - 1]}`, undo) }, 650)
      return
    }
    const due = m().reviewDue(m().LB(lid))
    toast(n === 5 ? `Rated ${CONF[4]}` : `Rated ${CONF[n - 1]} · back ${due ? fShort(due) : 'soon'}`, undo)
  }
  function clearRating(lid) {
    commit(() => rate(lid, 0))
    const f = $('.rail [role="radio"][tabindex="0"]') || $('[role="radio"][tabindex="0"]')
    if (f) f.focus({ preventScroll: true })
  }

  // ---------- copying ----------
  async function copy(text, what, fallbackEl) {
    const ok = await copyText(text, fallbackEl)
    if (ok) toast(`Copied${what ? `: ${what}` : ''}`)
    else toast("Couldn't copy automatically. The text is selected, press ⌘C.")
    return ok
  }
  const copyQuizPrompt = (lid) => copy(quizPrompt(m(), m().LB(lid)), 'Quiz me prompt')

  // ---------- notes: saved 0.8s after you stop typing ----------
  const notesT = {}
  function typeNotes(lid, value) {
    ui.setState((s) => ({ notesDraft: { ...s.notesDraft, [lid]: value }, notesStatus: { ...s.notesStatus, [lid]: 'typing' } }))
    clearTimeout(notesT[lid])
    notesT[lid] = setTimeout(() => {
      progress.putLecture(lid, { notes: value })
      ui.setState((s) => {
        const notesDraft = { ...s.notesDraft }
        delete notesDraft[lid]
        return { notesDraft, notesStatus: { ...s.notesStatus, [lid]: 'saved' }, notesSavedAt: { ...s.notesSavedAt, [lid]: new Date().toISOString() } }
      })
    }, 800)
  }

  // ---------- recall deck on the lecture page ----------
  function recallAnswer(lid, term, act) {
    const st = progress.lecture(lid)
    const rc = { missed: ((st.recall && st.recall.missed) || []).filter((t) => t !== term), got: ((st.recall && st.recall.got) || []).filter((t) => t !== term) }
    rc[act === 'got' ? 'got' : 'missed'].push(term)
    commit(() => progress.putLecture(lid, { recall: rc }))
  }
  const recallRestart = (lid) => commit(() => progress.putLecture(lid, { recall: { missed: [], got: [] } }))

  // ---------- the sheet (a dialog that slides up on phones) ----------
  let sheetReturn = null
  function openSheet(sheet, focus) {
    const d = $('#sheet')
    sheetReturn = document.activeElement
    commit(() => ui.setState({ sheet: { ...sheet, n: (S().sheet ? S().sheet.n : 0) + 1 } })) // n: a fresh sheet each time
    if (!d.open) d.showModal()
    if (focus) { const el = d.querySelector(focus); if (el) el.focus() }
  }
  function closeSheet() { const d = $('#sheet'); if (d.open) d.close() }
  function onSheetClosed() { if (sheetReturn && document.contains(sheetReturn)) sheetReturn.focus() }
  const sheetRate = (lid) => openSheet({ kind: 'rate', lid }, '[role="radio"][tabindex="0"]')
  const sheetNotes = (lid) => openSheet({ kind: 'notes', lid }, 'textarea')
  const sheetHelp = () => openSheet({ kind: 'help' })
  const sheetCatchup = () => openSheet({ kind: 'catchup' })
  function catchupLater() { commit(() => progress.setOnboarded({ at: new Date().toISOString(), skipped: true })) }
  function catchupSave(choice) {
    commit(() => {
      Object.entries(choice).forEach(([lid, v]) => {
        if (v !== 'done') return
        const steps = {}
        m().stepsOf(m().LB(lid)).forEach((s) => { steps[s.id] = true })
        progress.putLecture(lid, { steps }, { quiet: true })
      })
      progress.setOnboarded({ at: new Date().toISOString() })
    })
    closeSheet()
    toast('Saved. Up next is updated.')
  }

  // ---------- review session: due lectures one after another, key terms, then re-rate ----------
  function rvLoad(rv) {
    const l = m().LB(rv.queue[rv.q])
    return { ...rv, lid: l.id, i: 0, missed: [], got: [], rated: 0, slide: false }
  }
  function startReview(lid) {
    const { today } = etNow()
    const due = m().reviewList().filter((r) => r.due && r.due <= today).sort((a, b) => a.c - b.c).map((r) => r.l.id)
    commit(() => ui.setState({ rv: rvLoad({ queue: due.includes(lid) ? [lid, ...due.filter((x) => x !== lid)] : [lid], q: 0 }) }))
    openSheet({ kind: 'review' }, '.flip, [role="radio"]')
  }
  function reviewNext() {
    commit(() => ui.setState({ rv: { ...rvLoad({ ...S().rv, q: S().rv.q + 1 }), slide: true } }))
    const body = $('#rv-body')
    if (!reducedMotion()) replay(body, 'slide-in')
    const f = body.querySelector('.flip') || body.querySelector('[role="radio"][tabindex="0"]')
    if (f) f.focus({ preventScroll: true })
  }
  function reviewAnswer(term, act) {
    const rv = S().rv
    const next = { ...rv, [act === 'got' ? 'got' : 'missed']: [...rv[act === 'got' ? 'got' : 'missed'], term], i: rv.i + 1, slide: false }
    const terms = (m().LB(rv.lid).guide || {}).concepts || []
    commit(() => {
      if (next.i >= terms.length) progress.putLecture(rv.lid, { recall: { missed: next.missed, got: next.got }, reviewedAt: new Date().toISOString() })
      ui.setState({ rv: next })
    })
    const f = $('#rv-body .flip') || $('#rv-body [role="radio"][tabindex="0"]')
    if (f) f.focus({ preventScroll: true })
  }

  // ---------- assignment status menu ----------
  let menuReturn = null
  function openMenu(btn, aid) {
    menuReturn = btn
    commit(() => ui.setState({ menu: { aid, open: true } }))
    const el = $('#menu')
    const r = btn.getBoundingClientRect()
    el.style.left = `${Math.min(r.left, window.innerWidth - el.offsetWidth - 12)}px`
    const up = r.bottom + 6 + el.offsetHeight > window.innerHeight
    el.style.top = `${up ? r.top - el.offsetHeight - 6 : r.bottom + 6}px`
    el.style.setProperty('--origin', up ? 'bottom left' : 'top left')
    ;(el.querySelector('[aria-checked="true"]') || el.querySelector('button')).focus()
  }
  function closeMenu() {
    if (!S().menu || !S().menu.open) return
    commit(() => ui.setState({ menu: { ...S().menu, open: false } }))
    if (menuReturn && document.contains(menuReturn)) menuReturn.focus()
  }
  function setStatus(k) {
    const id = S().menu.aid
    const a = data.assignments.find((x) => x.id === id)
    const prev = m().assignStatus(a)
    commit(() => ui.setState({ menu: { ...S().menu, open: false } }))
    const nameRows = () => $$('.arow[data-aid]').forEach((el) => { el.style.viewTransitionName = `ar-${el.dataset.aid.replace(/[^\w-]/g, '_')}` })
    nameRows()
    withTransition('vt-rows', () => {
      commit(() => { progress.putAssignment(id, { status: k, done: k === 'done' }); if (k === 'done') ui.setState({ showDone: true }) })
      nameRows()
      const moved = $(`.arow[data-aid="${esc(id)}"]`)
      if (moved) { moved.classList.add('is-origin'); setTimeout(() => moved.classList.remove('is-origin'), 1000) }
    })
    const refocus = () => { const f = $(`[data-status-menu="${esc(id)}"]`) || $("[data-action='toggle-done']"); if (f) f.focus({ preventScroll: true }) }
    refocus()
    toast(`${m().aTitle(a)} moved to ${A_LABEL[k]}`, { label: 'Undo', fn: () => { commit(() => progress.putAssignment(id, { status: prev, done: prev === 'done' })); refocus() } })
  }

  // ---------- search palette ----------
  let palReturn = null
  let palNavigated = false
  function openPalette() {
    const { today, minutes } = etNow()
    palReturn = document.activeElement
    commit(() => ui.setState({ palette: { index: buildIndex(m(), today, minutes), q: '', sel: 0 } }))
    const d = $('#palette')
    if (!d.open) d.showModal()
    $('#pal-input').focus()
  }
  const closePalette = () => { const d = $('#palette'); if (d.open) d.close() }
  const togglePalette = () => ($('#palette').open ? closePalette() : openPalette())
  function onPaletteClosed() {
    if (palReturn && document.contains(palReturn) && !palNavigated) palReturn.focus()
    palNavigated = false
  }
  function runResult(x) {
    if (!x) return
    palNavigated = true
    closePalette()
    if (x.copy) { copy(x.copy, 'next command'); return }
    if (x.theme) { toggleTheme(); return }
    if (x.ext) { const url = safeUrl(x.go); if (url) window.open(url, '_blank', 'noopener,noreferrer'); return }
    if (x.step) setOpen(x.go.slice(9), x.step, true)
    navigate(x.go, { instant: true })
    if (x.step) setTimeout(() => scrollToStep(x.step), 60)
  }

  function toggleTheme() {
    const root = document.documentElement
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    root.dataset.theme = dark ? 'light' : 'dark'
    writeText(KEYS.theme, root.dataset.theme)
  }

  // ---------- Course weeks ----------
  // current: the weeks open now (Course starts with this week open)
  function toggleWeek(w, section, current) {
    const s = new Set(S().openWeeks || current)
    if (s.has(w)) s.delete(w)
    else s.add(w)
    commit(() => ui.setState({ openWeeks: s }))
    if (s.has(w)) { section.classList.add('is-opening'); setTimeout(() => section.classList.remove('is-opening'), 600) }
  }

  return {
    m, ui, progress,
    announce, toast, holdToast, releaseToast, runToastAction, undoFromKeyboard,
    navigate, navRender, firstRoute, fromRow,
    set, setOpen, tick, toggleOpen, jump, skip, doneContinue, doneNext, setExpandAll, scrollToStep, toggleStep, markNew,
    rate, rateClick, clearRating,
    copy, copyQuizPrompt, typeNotes,
    recallAnswer, recallRestart,
    openSheet, closeSheet, onSheetClosed, sheetRate, sheetNotes, sheetHelp, sheetCatchup, catchupLater, catchupSave,
    startReview, reviewNext, reviewAnswer,
    openMenu, closeMenu, setStatus,
    openPalette, closePalette, togglePalette, onPaletteClosed, runResult, toggleTheme,
    toggleWeek,
  }
}
