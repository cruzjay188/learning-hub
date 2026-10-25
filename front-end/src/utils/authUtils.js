// Pure helpers for the Log in / Create an account forms. No Supabase calls here (those live in lib/auth.js).
// Wording follows design/design-brief-auth.md §6 and §9.

export const PASSWORD_MIN = 6 // Supabase's default minimum

export const EMPTY_AUTH_FORM = { name: '', email: '', password: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// One field's problem, or '' when it's fine. mode: 'login' | 'register'
export function authFieldError(field, form, mode) {
  if (field === 'name') return mode === 'register' && !form.name.trim() ? 'Enter your name.' : ''
  if (field === 'email') {
    if (!form.email.trim()) return 'Enter your email address.'
    return EMAIL_RE.test(form.email.trim()) ? '' : 'Enter an email address like name@example.com.'
  }
  if (field === 'password') {
    if (!form.password) return 'Enter your password.'
    return mode === 'register' && form.password.length < PASSWORD_MIN ? `Use at least ${PASSWORD_MIN} characters.` : ''
  }
  return ''
}

// Every problem with the form at once: { name?, email?, password? }. Empty object = ready to send.
export function authFieldErrors(form, mode) {
  const out = {}
  for (const f of mode === 'register' ? ['name', 'email', 'password'] : ['email', 'password']) {
    const msg = authFieldError(f, form, mode)
    if (msg) out[f] = msg
  }
  return out
}

// The first problem, or null (kept for anything that only needs one message).
export function authFormError(form, mode) {
  return Object.values(authFieldErrors(form, mode))[0] || null
}

// Turns a Supabase Auth error into a message for the student. Never says whether the email or
// the password was wrong, so nobody can use the form to find out who has an account.
export function authErrorMessage(error) {
  switch (error?.code) {
    case 'offline':
      return "You're offline. Connect to the internet, then try again."
    case 'invalid_credentials':
      return 'Wrong email or password. Check both and try again.'
    case 'user_already_exists':
    case 'email_exists':
      return 'That email already has an account.'
    case 'email_address_invalid':
      return "That email address can't be used. Check it for typos."
    case 'weak_password':
      return `Use at least ${PASSWORD_MIN} characters.`
    case 'email_not_confirmed':
      return 'Confirm your email first. Open the link we sent, then log in.'
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Too many tries. Wait a minute, then try again.'
    default:
      // a 5xx is the server's fault, not the student's connection
      return error?.status >= 500 ? "The hub's server had a problem. Try again in a minute." : "Couldn't reach the hub's server. Check your connection and try again."
  }
}

// Where a server error shows: under a field when it's about that field, else the banner at the top.
export function authErrorTarget(error) {
  if (error?.code === 'email_address_invalid') return 'email'
  if (error?.code === 'weak_password') return 'password'
  return 'banner'
}

// A "do this next" button in the banner: 'login' = "Log in instead".
export function authErrorAction(error) {
  return error?.code === 'user_already_exists' || error?.code === 'email_exists' ? 'login' : null
}

// What to call the student until their profile loads: the name they registered with, else the
// part of their email before the @ (the same rule the database trigger uses).
export function fallbackName(user) {
  return user?.user_metadata?.name || user?.email?.split('@')[0] || ''
}

// Each account keeps its own offline copy, so two people on one computer never see each other's progress.
export function userStorageKey(baseKey, userId) {
  return userId ? `${baseKey}:${userId}` : baseKey
}
