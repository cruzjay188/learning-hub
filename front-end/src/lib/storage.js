// localStorage, wrapped: private windows and blocked storage throw, and the hub must still work.
// Key names match the original hub, so progress saved there shows up here too.
export const KEYS = {
  progress: 'eagle-hub:v1', // ticks, ratings, notes, goal, activity (the offline copy)
  data: 'eagle-hub:data', // last good copy of hub-data.json
  recent: 'hub:recent', // lectures opened lately (search palette)
  theme: 'hub:theme', // "light" | "dark" when you've picked one
  expanded: 'hub:guide-expanded', // "1" = show every step open
}

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full or blocked */ }
}
export function readText(key) {
  try { return localStorage.getItem(key) } catch { return null }
}
export function writeText(key, value) {
  try { localStorage.setItem(key, value) } catch { /* storage blocked */ }
}

// Most recently opened lectures first, at most 5.
export function rememberRecent(id) {
  const r = readJSON(KEYS.recent, []).filter((x) => x !== id)
  r.unshift(id)
  writeJSON(KEYS.recent, r.slice(0, 5))
}
