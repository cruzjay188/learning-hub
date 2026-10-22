import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Field, { AuthIcon } from '../components/Field.jsx'
import { takeAuthNote } from '../lib/auth.js'
import { reducedMotion } from '../lib/motion.js'
import {
  authErrorAction, authErrorMessage, authErrorTarget, authFieldError, authFieldErrors, EMPTY_AUTH_FORM, PASSWORD_MIN,
} from '../utils/authUtils.js'

// Log in · Create an account · Check your email: one card that changes its content, never its place.
// Spec: design/design-brief-auth.md. auth comes from useAuth (hooks/useAuth.js).
const TITLES = { login: 'Log in', register: 'Create an account', checkEmail: 'Check your email' }
const FIELDS = { login: ['email', 'password'], register: ['name', 'email', 'password'] }
const NOTES = {
  loggedOut: "You're logged out. Your progress is saved to your account.",
  loggedOutOffline: "You're logged out on this computer. Your progress is saved to your account.",
}

export default function AuthPage({ auth }) {
  const [mode, setMode] = useState(() => (window.location.hash === '#register' ? 'register' : 'login'))
  const [form, setForm] = useState(EMPTY_AUTH_FORM)
  const [touched, setTouched] = useState({}) // fields the student has left with something typed
  const [submitted, setSubmitted] = useState(false) // pressed the button since the last mode switch
  const [fieldServer, setFieldServer] = useState({}) // server errors that belong to a field
  const [server, setServer] = useState(null) // { message, action, n }: the banner
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)
  const [caps, setCaps] = useState(false)
  const [note, setNote] = useState(() => NOTES[takeAuthNote(Object.keys(NOTES))] || null)
  const [sentTo, setSentTo] = useState('')
  const refs = { name: useRef(null), email: useRef(null), password: useRef(null) }
  const title = useRef(null)
  const submitBtn = useRef(null)
  const loginInstead = useRef(null)
  const live = useRef(true)
  useEffect(() => () => { live.current = false }, [])

  const isRegister = mode === 'register'
  useEffect(() => { document.title = `${TITLES[mode]} · Eagle Learning Hub` }, [mode])

  // Desktop (a mouse): start in the first empty field. On touch, don't pop the keyboard over the page.
  useLayoutEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) focusFirstEmpty(mode)
  }, [])

  function focusFirstEmpty(m) {
    if (m === 'checkEmail') { title.current?.focus(); return }
    const f = FIELDS[m].find((k) => !form[k]) || FIELDS[m][FIELDS[m].length - 1]
    refs[f].current?.focus()
  }

  // What a field shows: its server error, else its own problem once you've left it (with text) or pressed the button.
  const errorFor = (f) => fieldServer[f] || ((submitted || touched[f]) ? authFieldError(f, form, mode) : '')

  const set = (f) => (e) => {
    setForm({ ...form, [f]: e.target.value })
    if (fieldServer[f]) setFieldServer({ ...fieldServer, [f]: '' })
  }
  const leave = (f) => () => { if (form[f]) setTouched((t) => ({ ...t, [f]: true })) }

  // Same card, new content: the card's height glides and its content cross-fades (brief §7).
  function switchMode(next, { focus = 'first', clearPassword = false } = {}) {
    const apply = () => flushSync(() => {
      setMode(next); setSubmitted(false); setTouched({}); setFieldServer({}); setServer(null); setShow(false); setNote(null)
      if (clearPassword) setForm((f) => ({ ...f, password: '' }))
    })
    // the address follows the form, so a reload opens the same one
    if (next !== 'checkEmail') window.history.replaceState(null, '', next === 'register' ? '#register' : '#today')
    const after = () => {
      if (focus === 'submit') submitBtn.current?.focus()
      else focusFirstEmpty(next)
    }
    if (document.startViewTransition && !reducedMotion()) {
      const h = document.documentElement
      h.classList.add('vt-auth')
      const t = document.startViewTransition(apply)
      t.updateCallbackDone.then(after)
      t.finished.finally(() => h.classList.remove('vt-auth'))
    } else { apply(); after() }
  }

  async function submit(e) {
    e.preventDefault()
    if (busy) return
    if (!navigator.onLine) { showServer({ code: 'offline' }); return }
    setSubmitted(true)
    setFieldServer({})
    const errs = authFieldErrors(form, mode)
    const first = FIELDS[mode].find((f) => errs[f])
    if (first) { setServer(null); refs[first].current?.focus(); return }
    setBusy(true)
    setServer(null)
    try {
      if (isRegister) {
        const { needsConfirmation } = await auth.register(form)
        if (needsConfirmation && live.current) { setSentTo(form.email.trim()); switchMode('checkEmail'); return }
      } else await auth.logIn(form)
      if (window.location.hash === '#register') window.history.replaceState(null, '', '#today')
    } catch (err) {
      if (!live.current) return
      const target = authErrorTarget(err)
      if (target === 'banner') showServer(err)
      else { flushSync(() => setFieldServer({ [target]: authErrorMessage(err) })); refs[target].current?.focus() }
    } finally {
      if (live.current) setBusy(false)
    }
  }

  // The banner, then focus where the student's next move is (brief §6).
  function showServer(err) {
    flushSync(() => setServer((s) => ({ message: authErrorMessage(err), action: authErrorAction(err), n: (s ? s.n : 0) + 1 })))
    if (err.code === 'invalid_credentials') { refs.password.current?.focus(); refs.password.current?.select() }
    else if (authErrorAction(err) === 'login') loginInstead.current?.focus()
    else submitBtn.current?.focus()
  }

  // Show / Hide keeps focus and the caret where they were.
  function toggleShow() {
    const el = refs.password.current
    const [s, end] = el ? [el.selectionStart, el.selectionEnd] : [null, null]
    flushSync(() => setShow((v) => !v))
    if (el && s != null) { try { el.setSelectionRange(s, end) } catch { /* type=email-like inputs */ } }
  }
  const capsKey = (e) => setCaps(!!(e.getModifierState && e.getModifierState('CapsLock')))

  if (mode === 'checkEmail') {
    return (
      <Frame>
        <div className="auth__head">
          <span className="auth__envelope"><AuthIcon.envelope /></span>
          <h1 className="display auth__title" id="auth-title" tabIndex={-1} ref={title}>Check your email</h1>
          <p className="auth__lede">We sent a link to <b>{sentTo}</b>. Open it to confirm your account, then come back and log in.</p>
        </div>
        <button type="button" className="btn btn--lg auth__submit" onClick={() => switchMode('login')}>Back to log in</button>
        <p className="auth__small">Can't find it? Check your spam folder.</p>
        <p className="auth__small">Wrong address? <button type="button" className="link-btn" onClick={() => switchMode('register')}>Create the account again</button></p>
      </Frame>
    )
  }

  const pwRule = form.password.length >= PASSWORD_MIN
  const pwError = errorFor('password')
  return (
    <Frame>
      <form className="auth__form" onSubmit={submit} noValidate method="post" aria-labelledby="auth-title">
        <div className="auth__head">
          <h1 className="display auth__title" id="auth-title" tabIndex={-1} ref={title}>{isRegister ? 'Create your account' : 'Log in'}</h1>
          <p className="auth__lede">{isRegister ? 'Your checkmarks, ratings and notes save to your account. Only you can see them.' : 'Your lecture guides, reviews and progress for the Eagle platoon. Pick up where you left off.'}</p>
        </div>
        <div className="auth__fields">
          {note && <div className="auth__note" role="status"><AuthIcon.info /><p>{note}</p></div>}
          {server && (
            <div className="auth__alert" role="alert" key={server.n}>
              <AuthIcon.alert />
              <p>
                {server.message}
                {server.action === 'login' && <> <button type="button" className="link-btn" ref={loginInstead} onClick={() => switchMode('login', { clearPassword: true })}>Log in instead</button></>}
              </p>
            </div>
          )}
          {isRegister && (
            <Field
              ref={refs.name} id="auth-name" label="Name" name="name" type="text" autoComplete="name" autoCapitalize="words" maxLength={50}
              value={form.name} onChange={set('name')} onBlur={leave('name')} readOnly={busy} error={errorFor('name')}
              lines={[{ id: 'auth-name-hint', node: <p className="field__msg">Shown in your account menu.</p> }]}
            />
          )}
          <Field
            ref={refs.email} id="auth-email" label="Email" name="email" type="email" autoComplete="username" inputMode="email"
            autoCapitalize="none" autoCorrect="off" spellCheck="false"
            value={form.email} onChange={set('email')} onBlur={leave('email')} readOnly={busy} error={errorFor('email')}
          />
          <Field
            ref={refs.password} id="auth-password" label="Password" name="password" type={show ? 'text' : 'password'}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            {...(isRegister ? { minLength: PASSWORD_MIN, passwordrules: `minlength: ${PASSWORD_MIN};` } : {})}
            className="field--password" value={form.password} onChange={set('password')} readOnly={busy}
            onBlur={() => { leave('password')(); setCaps(false) }} onKeyDown={capsKey} onKeyUp={capsKey}
            error={pwError}
            toggle={(
              <button type="button" className="field__toggle" aria-controls="auth-password" aria-pressed={show}
                aria-label={show ? 'Hide password' : 'Show password'} onMouseDown={(e) => e.preventDefault()} onClick={toggleShow}
              >{show ? 'Hide' : 'Show'}</button>
            )}
            lines={[
              { id: 'auth-password-caps', node: <div aria-live="polite">{caps && <p className="field__msg field__caps"><AuthIcon.caps />Caps Lock is on.</p>}</div> },
              ...(isRegister && !pwError ? [{
                id: 'auth-password-rule',
                node: (
                  <p className="field__msg field__rule" data-met={pwRule}>
                    {pwRule ? <AuthIcon.ruleMet /> : <AuthIcon.ruleOpen />}
                    At least {PASSWORD_MIN} characters<span className="sr-only">{pwRule ? ', done' : ', not yet'}</span>
                  </p>
                ),
              }] : []),
            ]}
          />
        </div>
        <button type="submit" className="btn btn--primary btn--lg auth__submit" ref={submitBtn} aria-busy={busy || undefined}>
          <span>{isRegister ? 'Create account' : 'Log in'}</span>
          {busy && <svg className="spin" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" /><path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
        </button>
        <span className="sr-only" role="status">{busy ? (isRegister ? 'Creating your account' : 'Logging in') : ''}</span>
      </form>
      {!isRegister && <p className="auth__help">Forgot your password? Ask in #eagle_questions for a reset link.</p>}
      <div className="auth__foot">
        <span>{isRegister ? 'Already have an account?' : 'New to the hub?'}</span>
        <button type="button" className="btn btn--sm auth__switch" aria-disabled={busy || undefined} onClick={() => !busy && switchMode(isRegister ? 'login' : 'register')}>
          {isRegister ? 'Log in' : 'Create an account'}
        </button>
      </div>
    </Frame>
  )
}

// The page around the card: the brand row, then the card (flat on phones).
function Frame({ children }) {
  return (
    <div className="auth">
      <div className="auth__brand">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="var(--teal)" /><path d="M8.5 7.5l6.5 6.5-6.5 6.5M14 7.5l6.5 6.5-6.5 6.5" fill="none" stroke="var(--now)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Eagle Learning Hub</span>
      </div>
      <div className="auth__card">{children}</div>
    </div>
  )
}
