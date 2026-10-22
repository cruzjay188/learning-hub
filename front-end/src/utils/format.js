// Small text helpers and the labels the whole app shares.

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)
export const plural = (n, w, p = w + 's') => `${n} ${n === 1 ? w : p}`
export const noEmoji = (s) => String(s ?? '').replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').replace(/\s{2,}/g, ' ').trim()

// Confidence ratings, 1–5
export const CONF = ['Lost', 'Shaky', 'Getting it', 'Solid', 'Could teach it']
// Days until a lecture comes back for review, by rating. 1 = next class day, 5 = never.
export const INTERVAL = { 2: 2, 3: 4, 4: 10 }

// Lecture status → words (status marks are in components/icons.jsx)
export const ST_TEXT = { done: 'Done', progress: 'In progress', now: 'Today', notchecked: 'Not checked off', upcoming: 'Upcoming', outline: 'Prep outline' }
// Assignment status → words
export const A_LABEL = { 'in-progress': 'In progress', todo: 'To do', check: 'Ask instructor', done: 'Done', quiz: 'Team quiz' }
// Assignment status → which status mark it uses
export const A_MARK = { 'in-progress': 'progress', todo: 'open', check: 'check', done: 'done', quiz: 'quiz' }
