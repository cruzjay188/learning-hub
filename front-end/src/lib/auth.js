// Email + password accounts through Supabase Auth. Components use these through useAuth,
// never supabase directly. supabase-js keeps the session in localStorage and refreshes the
// access token by itself, which is why a refresh keeps you logged in.
import { KEYS } from './storage.js'

// Throws Supabase's error so the form can show a friendly message (utils/authUtils.js).
function unwrap({ data, error }) {
  if (error) throw error
  return data
}

// One-time notes for the next screen ("You're logged out", "Account created"), kept for this tab only.
const NOTE = 'hub:auth-note'
export function setAuthNote(note) { try { sessionStorage.setItem(NOTE, note) } catch { /* storage blocked */ } }
export function takeAuthNote(match) {
  try {
    const note = sessionStorage.getItem(NOTE)
    if (!note || (match && !match.includes(note))) return null
    sessionStorage.removeItem(NOTE)
    return note
  } catch { return null }
}

// The name goes into the account's metadata; the database trigger copies it into profiles.
// Returns { needsConfirmation: true } when the project still has "Confirm email" on.
export async function register(client, { name, email, password }) {
  const data = unwrap(await client.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } }))
  if (data.session) setAuthNote('registered')
  return { needsConfirmation: !data.session }
}

export async function logIn(client, { email, password }) {
  unwrap(await client.auth.signInWithPassword({ email: email.trim(), password }))
  setAuthNote('loggedIn')
}

// Removes this computer's copy of the student's progress FIRST, so a shared lab computer is
// clean even if the server can't be reached; then ends the session. If the server is down,
// the session still ends on this computer (scope: 'local').
export async function logOut(client, userId) {
  forgetLocalData(userId)
  let reached = true
  try {
    const { error } = await client.auth.signOut()
    if (error) throw error
  } catch {
    reached = false
    await client.auth.signOut({ scope: 'local' }).catch(() => {})
  }
  setAuthNote(reached ? 'loggedOut' : 'loggedOutOffline')
}

// RLS only returns the logged-in student's own profile.
export async function loadProfile(client, userId) {
  return unwrap(await client.from('profiles').select('display_name').eq('id', userId).maybeSingle())
}

export function forgetLocalData(userId) {
  try { localStorage.removeItem(`${KEYS.progress}:${userId}`) } catch { /* storage blocked: nothing was saved */ }
}
