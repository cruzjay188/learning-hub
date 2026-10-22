// Dates and times. The course runs on New York time (ET), so "today" is always the ET date,
// and dates are ISO strings like "2026-10-19". Pure helpers: no React, no page.

export const TZ = 'America/New_York'
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MON_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Class day in minutes after midnight ET: Stand Up at 9:30, Stand Down ends 18:30.
export const DAY_START = 9 * 60 + 30
export const DAY_END = 18 * 60 + 30

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const etParts = (d = new Date()) => Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]))

// Today's ET date and minutes since midnight. For QA, localStorage "hub:debug-now" = "2026-10-19T11:15" fakes it.
export function etNow() {
  const p = etParts()
  let today = `${p.year}-${p.month}-${p.day}`
  let minutes = +p.hour * 60 + +p.minute
  try {
    const dbg = localStorage.getItem('hub:debug-now')
    if (dbg) {
      today = dbg.slice(0, 10)
      minutes = +dbg.slice(11, 13) * 60 + +dbg.slice(14, 16)
    }
  } catch {
    // storage blocked: use the real clock
  }
  return { today, minutes }
}

// The ET date of a timestamp (or the date itself if it's already "YYYY-MM-DD").
export const etDateOf = (iso) => {
  if (!iso) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const p = etParts(new Date(iso))
  return `${p.year}-${p.month}-${p.day}`
}
export const pd = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)) }
const isoD = (dt) => dt.toISOString().slice(0, 10)
export const addDays = (iso, n) => { const d = pd(iso); d.setUTCDate(d.getUTCDate() + n); return isoD(d) }
export const dayDiff = (a, b) => Math.round((pd(b) - pd(a)) / 86400000)
export const dow = (iso) => pd(iso).getUTCDay()
// Monday of the week that holds iso
export const weekStart = (iso) => addDays(iso, -((dow(iso) + 6) % 7))

export const fShort = (iso) => `${DOW[dow(iso)]} ${MON[pd(iso).getUTCMonth()]} ${pd(iso).getUTCDate()}`
export const fMD = (iso) => `${MON[pd(iso).getUTCMonth()]} ${pd(iso).getUTCDate()}`
export const fLong = (iso) => `${DOW_LONG[dow(iso)]}, ${MON_LONG[pd(iso).getUTCMonth()]} ${pd(iso).getUTCDate()}`
// "13:30" → "1:30pm", "10:00" → "10am"
export const fTime = (t) => {
  if (!t) return ''
  let [h, m] = t.split(':').map(Number)
  const ap = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`
}
// minutes since midnight → "11:15"
export const fClock = (min) => { let h = Math.floor(min / 60); const m = min % 60; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')}` }
export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
export const fDur = (min) => (min >= 90 ? `${Math.round(min / 30) / 2} hrs` : `${Math.max(5, Math.round(min / 5) * 5)} min`)
export const ago = (iso) => {
  if (!iso) return ''
  const s = Math.max(0, (Date.now() - new Date(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  return fMD(etDateOf(iso))
}
