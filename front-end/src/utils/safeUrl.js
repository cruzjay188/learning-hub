// Links that come from data (hub-data.json, anything a student types) go through here before they
// reach an href or window.open: only http(s) gets through, so a "javascript:" link can never run
// code (docs/security-rules.md §5.2). Returns the URL, or null when it isn't safe.
export function safeUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null
  try {
    const u = new URL(url.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null
  } catch {
    return null
  }
}

// What every link that opens a new tab carries
export const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' }
