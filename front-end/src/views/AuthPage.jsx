import { useState } from 'react'
import { authErrorMessage, authFormError, EMPTY_AUTH_FORM, PASSWORD_MIN } from '../utils/authUtils.js'

// Log in / Create an account. Shown when Supabase is set up and nobody is logged in.
// auth comes from useAuth (hooks/useAuth.js).
export default function AuthPage({ auth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState(EMPTY_AUTH_FORM)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const isRegister = mode === 'register'

  const field = (name) => ({ value: form[name], onChange: (e) => setForm({ ...form, [name]: e.target.value }) })
  const switchMode = () => { setMode(isRegister ? 'login' : 'register'); setError(''); setNotice('') }

  async function submit(e) {
    e.preventDefault()
    const problem = authFormError(form, mode)
    if (problem) { setError(problem); return }
    setBusy(true)
    setError('')
    try {
      if (isRegister) {
        const { needsConfirmation } = await auth.register(form)
        if (needsConfirmation) { setNotice(`Check ${form.email.trim()} for a link to confirm your account, then log in.`); setMode('login') }
      } else await auth.logIn(form)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__brand">
        <svg width="40" height="40" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="7" fill="var(--teal)" /><path d="M8.5 7.5l6.5 6.5-6.5 6.5M14 7.5l6.5 6.5-6.5 6.5" fill="none" stroke="var(--now)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>Eagle Learning Hub</span>
      </div>
      <form className="auth__card" onSubmit={submit} noValidate>
        <h1 className="display" id="v-title">{isRegister ? 'Create your account' : 'Log in'}</h1>
        <p className="auth__lede">{isRegister ? 'Your checkmarks, ratings and notes save to your account, so they follow you to any device.' : 'Pick up where you left off.'}</p>
        {notice && <p className="auth__notice" role="status">{notice}</p>}
        {isRegister && (
          <label className="auth__field"><span>Name</span><input type="text" autoComplete="name" maxLength={50} {...field('name')} /></label>
        )}
        <label className="auth__field"><span>Email</span><input type="email" autoComplete="email" {...field('email')} /></label>
        <label className="auth__field">
          <span>Password{isRegister ? ` (at least ${PASSWORD_MIN} characters)` : ''}</span>
          <input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} {...field('password')} />
        </label>
        {error && <p className="auth__error" role="alert">{error}</p>}
        <button type="submit" className="btn btn--primary auth__submit" disabled={busy}>{busy ? 'One moment…' : isRegister ? 'Create account' : 'Log in'}</button>
        <p className="auth__switch">
          {isRegister ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>{isRegister ? 'Log in' : 'Create an account'}</button>
        </p>
      </form>
    </div>
  )
}
