import { useHub } from '../hooks/useHub.js'
import { commit } from '../lib/motion.js'
import { addDays, fShort, weekStart } from '../utils/dates.js'
import { plural } from '../utils/format.js'
import { I } from './icons.jsx'
import Ring from './Ring.jsx'
import Ticker from './Ticker.jsx'

// "This week": a ring per day you studied, your weekly goal and your streak.
export default function GoalBlock({ today }) {
  const { m, hub, progress } = useHub()
  const s = m.streaks(today)
  const mon = weekStart(today)
  const days = progress.activity.days || {}
  // a day logged in the last 1.5s pops (or the whole week does, if that met the goal)
  const fl = progress.flash && Date.now() - progress.flash.at < 1500 ? progress.flash : null
  const dot = (i) => {
    const d = addDays(mon, i)
    const we = i > 4
    const on = !!days[d]
    return (
      <span key={i} className={`gd ${we ? 'gd--we' : ''}${fl && !fl.met && fl.day === d ? ' is-new' : ''}`} style={{ '--i': i }} data-on={on} data-today={d === today}>
        <Ring p={on ? 100 : 0} size={we ? 12 : 26} k={`gd-${d}`} sw={we ? 3.4 : 2.4} />
        <span aria-hidden="true">{'MTWTFSS'[i]}</span>
        <span className="sr-only">{fShort(d)}: {on ? 'studied' : 'not logged'}</span>
      </span>
    )
  }
  const remaining = Math.max(0, s.target - s.count)
  const changeGoal = (d) => commit(() => hub.progress.setGoal(Math.min(7, Math.max(1, (progress.goal.weeklyTarget || 4) + d))))
  const logToday = () => { commit(() => hub.progress.markActive(true)); hub.toast('Logged today') }
  return (
    <section className="rail__block" aria-labelledby="goal-h">
      <div className="rail__head"><h2 id="goal-h">This week</h2></div>
      <div className="goal-row">
        <div className={`goal-days${fl && fl.met ? ' is-met' : ''}`}>{[0, 1, 2, 3, 4].map(dot)}<span className="goal-sep" aria-hidden="true" />{[5, 6].map(dot)}</div>
        <Ring p={Math.min(100, (s.count / Math.max(1, s.target)) * 100)} size={56} k="week-ring" label={`${s.count}/${s.target}`} cls="week-ring" sw={2} />
      </div>
      <p className="goal-text">
        {s.metThisWeek
          ? <><b>Goal met.</b> {s.cur > 1 ? `${s.cur}-week streak.` : 'That starts a streak.'}</>
          : <><b>{plural(remaining, 'more day')}</b> {s.cur ? `keeps your ${s.cur}-week streak` : 'this week meets your goal'}.</>}
        {s.longest > 1 ? <> <span className="muted">Longest: {s.longest} weeks.</span></> : null}
      </p>
      <div className="goal-foot">
        <span className="goal-ctl" role="group" aria-label="Weekly goal">
          Goal <b><Ticker n={s.target} k="goal-t" /></b> days a week{' '}
          <button type="button" className="icon-btn" data-goal="-1" aria-label="Fewer days" disabled={s.target <= 1} onClick={() => changeGoal(-1)}><I.minus /></button>
          <button type="button" className="icon-btn" data-goal="1" aria-label="More days" disabled={s.target >= 7} onClick={() => changeGoal(1)}><I.plus /></button>
        </span>{' '}
        {days[today]
          ? <span className="muted" style={{ fontSize: '13px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}><I.cal /> Today logged</span>
          : <button type="button" className="btn btn--quiet btn--sm" data-action="log-today" onClick={logToday}>I studied off the hub</button>}
      </div>
      <p className="rail-note" style={{ marginTop: '10px' }}>Ticking a step, rating or writing notes logs the day for you.</p>
    </section>
  )
}
