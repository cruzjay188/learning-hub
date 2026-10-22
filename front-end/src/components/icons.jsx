// Icons, converted from the original hub's SVG strings. Same paths, same sizes.
// `I` holds UI icons; `ST` holds the 20px status marks (done, in progress, today…).

// The check mark: size is in px; className lets buttons add `ico-check`.
function Check({ size = 14, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" pathLength="1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const Chev = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Down = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Ext = () => <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 2.5h5v5M9.5 2.5L3 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const Copy = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 3.5v-.2A1.3 1.3 0 0 0 9.2 2H3.8A1.3 1.3 0 0 0 2.5 3.3v5.4A1.3 1.3 0 0 0 3.8 10h.2" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
const Undo = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 6.5H10a3 3 0 0 1 0 6H7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M7 4L4.5 6.5 7 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Flag = () => <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 14V2.5M3.5 3h8l-1.8 3 1.8 3h-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Verify = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M5.3 8.2l1.9 1.9 3.6-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Target = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.6" fill="currentColor"/></svg>
const Info = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 7.2v4M8 4.8v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
const Close = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
const Notes = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h6l2.5 2.5v8.5H4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6 7.5h4.5M6 10h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
const Star = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="9" width="2.6" height="4.5" rx=".8" fill="currentColor"/><rect x="6.7" y="6" width="2.6" height="7.5" rx=".8" fill="currentColor"/><rect x="11.4" y="3" width="2.6" height="10.5" rx=".8" fill="currentColor" opacity=".45"/></svg>
const Bolt = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M9 1.8L3.6 9h4l-.8 5.2L12.4 7h-4z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
const Book = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3.2c1.6-.6 3.4-.4 5 .8 1.6-1.2 3.4-1.4 5-.8v9.6c-1.6-.6-3.4-.4-5 .8-1.6-1.2-3.4-1.4-5-.8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 4v9.6" stroke="currentColor" strokeWidth="1.4"/></svg>
const Term = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 12.5l3-9 3 9M3.6 9.4h3.8M10.5 8.5h3M12 7v6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Repo = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 13.5V3.2c0-.7.5-1.2 1.2-1.2H12v9H5.2C4.5 11 4 11.5 4 12.2s.5 1.3 1.2 1.3H12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
const Clock = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
const Ret = () => <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="M13 3.5v4a2 2 0 0 1-2 2H3.5M6.5 6.5l-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
const Minus = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
const Plus = () => <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8h9M8 3.5v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
const Alert = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4.8v3.6M8 11v.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
const Cal = () => <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M5.8 10l1.5 1.5 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>

export const I = { check: Check, chev: Chev, down: Down, ext: Ext, copy: Copy, undo: Undo, flag: Flag, verify: Verify, target: Target, info: Info, close: Close, notes: Notes, star: Star, bolt: Bolt, book: Book, term: Term, repo: Repo, clock: Clock, ret: Ret, minus: Minus, plus: Plus, alert: Alert, cal: Cal }

const StDone = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="var(--teal)"/><path d="M6 10.3l2.6 2.6L14 7.5" fill="none" stroke="var(--on-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
const StProgress = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--teal)" strokeWidth="1.7"/><path d="M10 1.8a8.2 8.2 0 0 1 0 16.4z" fill="var(--teal)"/></svg>
const StNow = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--now)" strokeWidth="1.7"/><circle cx="10" cy="10" r="3.8" fill="var(--now)"/></svg>
const StOpen = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--control)" strokeWidth="1.7"/></svg>
const StOutline = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--control)" strokeWidth="1.6" strokeDasharray="2.6 2.4"/></svg>
const StCheck = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.2" fill="none" stroke="var(--warn-mark)" strokeWidth="1.7"/><path d="M10 6v4.6M10 13.4v.1" stroke="var(--warn-mark)" strokeWidth="1.9" strokeLinecap="round"/></svg>
const StQuiz = () => <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="7.5" cy="8" r="2.6" fill="none" stroke="var(--control)" strokeWidth="1.6"/><circle cx="13.5" cy="8" r="2.6" fill="none" stroke="var(--control)" strokeWidth="1.6"/><path d="M3 16c.6-2.4 2.4-3.6 4.5-3.6S11.4 13.6 12 16M10.8 13c.8-.4 1.7-.6 2.7-.6 2.1 0 3.9 1.2 4.5 3.6" fill="none" stroke="var(--control)" strokeWidth="1.6" strokeLinecap="round"/></svg>

export const ST = { done: StDone, progress: StProgress, now: StNow, open: StOpen, outline: StOutline, check: StCheck, quiz: StQuiz }
