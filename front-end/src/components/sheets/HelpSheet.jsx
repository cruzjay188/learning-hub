import { useHub } from '../../hooks/useHub.js'
import { etDateOf, fShort } from '../../utils/dates.js'
import { ST } from '../icons.jsx'
import SheetHead from './SheetHead.jsx'

const MARKS = [['done', 'Done: every step checked off'], ['progress', 'In progress: some steps done'], ['now', "Today's lecture"], ['open', 'Not checked off yet, or upcoming'], ['outline', 'Prep outline: the full guide comes when the lecture is published'], ['check', 'Ask instructor']]
const KEYS = [['⌘K or /', 'Search'], ['g then t / c / r / w', 'Go to Today, Course, Review, Work'], ['j / k', 'Next / previous step'], ['x', 'Check off the current step'], ['c', "Copy the current step's code"], ['1–5', 'Rate the lecture'], ['n', 'Jump to notes'], ['e', 'Expand or collapse all steps'], ['?', 'This help']]

// "How this hub works": the status marks, where progress saves, keyboard shortcuts
export default function HelpSheet() {
  const { m } = useHub()
  return (
    <>
      <SheetHead>How this hub works</SheetHead>
      <div className="sheet__body">
        <div className="kbd-list">{MARKS.map(([k, t]) => { const Mark = ST[k]; return [<span key={`m-${k}`} className="st"><Mark /></span>, <span key={`t-${k}`}>{t}</span>] })}</div>
        <p style={{ fontSize: '14px', color: 'var(--ink-2)' }}><b>Saving.</b> Ticks, ratings, notes and your weekly goal save to your account. The course data (lectures, guides, assignments) refreshes when you run <code>/sync</code> in Claude Code; last updated {fShort(etDateOf(m.data.generatedAt))}.</p>
        <p style={{ fontSize: '14px', color: 'var(--ink-2)' }}><b>Review.</b> Rate each lecture after class. Low ratings come back on the Review tab on a schedule.</p>
        <h3 style={{ fontSize: '17px' }}>Keyboard shortcuts</h3>
        <div className="kbd-list">{KEYS.map(([k, t]) => [<span key={`k-${k}`} className="kbd">{k}</span>, <span key={`d-${k}`}>{t}</span>])}</div>
      </div>
    </>
  )
}
