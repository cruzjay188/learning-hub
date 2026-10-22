import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import { useHub } from '../hooks/useHub.js'
import { DAY_END, DAY_START, fClock, fTime } from '../utils/dates.js'
import { dayBlocks } from '../utils/schedule.js'
import { I, ST } from './icons.jsx'

// Today's class day: a bar of blocks on desktop (with a "now" line), a collapsible list on phones.
export default function Timeline({ day, minutes }) {
  const { m, ui, hub } = useHub()
  const track = useRef(null)
  const [now, setNow] = useState(null) // where the now line goes: { x, label }
  const blocks = dayBlocks(day, m)
  const live = minutes >= DAY_START && minutes < DAY_END
  const cur = blocks.find((b) => minutes >= b.start && minutes < b.end)
  const nxtB = blocks.find((b) => b.start > minutes)
  const eyebrow = minutes < DAY_START ? 'Class starts at 9:30 ET' : minutes >= DAY_END ? 'Class is over for today' : `Now ${fClock(minutes)} ET`
  const names = (b) => b.entries.map((e) => e.label).join(' · ')
  const label = (b) => b.entries.map((e, i) => (
    <Fragment key={i}>{i > 0 && ' · '}{e.lec ? <a href={`#lecture-${e.lec.id}`}>{e.label}</a> : e.label}</Fragment>
  ))
  const state = (b) => (minutes >= b.end ? 'past' : b === cur ? 'now' : 'next')

  // The now line sits at the current minute inside the current block, so it needs the blocks' real widths.
  useLayoutEffect(() => {
    const place = () => {
      const el = track.current
      if (!el || !live) { setNow(null); return }
      const b = [...el.querySelectorAll('.block')].find((x) => minutes >= +x.dataset.start && minutes < +x.dataset.end)
      if (!b) { setNow(null); return }
      const x = b.offsetLeft + ((minutes - +b.dataset.start) / (+b.dataset.end - +b.dataset.start)) * b.offsetWidth
      setNow({ x, label: b.querySelector('.block__label').textContent })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [live, minutes, day])

  return (
    <>
      <section className="timeline timeline--desk" aria-label="Class day timeline, Eastern time">
        <p className="timeline__eyebrow" aria-hidden={live}>{live ? '' : eyebrow}</p>
        <ol className="track" id="track" data-live={live} data-min={minutes} ref={track}>
          {blocks.map((b) => (
            <li
              key={b.t} className="block" data-state={state(b)} data-kind={b.kind} data-start={b.start} data-end={b.end}
              style={{ '--m': b.end - b.start, ...(b === cur ? { '--el': `${(((minutes - b.start) / (b.end - b.start)) * 100).toFixed(1)}%` } : {}) }}
              {...(b === cur ? { 'aria-current': 'time' } : {})}
            >
              <div className="block__bar" aria-hidden="true" />
              <p className="block__time">{fTime(b.t)}</p>
              <p className="block__label" title={names(b)}>{label(b)}</p>
            </li>
          ))}
          {now && <div className="nowline" style={{ left: `${now.x - 1}px` }} aria-hidden="true"><span>{fClock(minutes)}</span></div>}
        </ol>
        {now && <p className="sr-only">Now {fClock(minutes)}, during {now.label}.</p>}
      </section>
      <section className="timeline timeline--phone" aria-label="Class day">
        <button
          type="button" className="row" style={{ width: '100%', border: 0, borderTop: '1px solid var(--line)', background: 'none', textAlign: 'left' }}
          data-action="toggle-timeline" aria-expanded={ui.timelineOpen} onClick={() => hub.set({ timelineOpen: !ui.timelineOpen })}
        >
          <span className="st">{cur ? <ST.now /> : <ST.open />}</span>
          <span className="row__main">
            <span className="row__title">{cur ? `${fTime(cur.t)} · ${names(cur)}` : eyebrow}</span>
            <span className="row__sub">{nxtB ? `Next: ${fTime(nxtB.t)} ${names(nxtB)}` : minutes >= DAY_END ? 'See you tomorrow' : ''}</span>
          </span>
          <span className="row__end">{ui.timelineOpen ? <I.down /> : <I.chev />}</span>
        </button>
        {ui.timelineOpen && (
          <ol className="rows" style={{ borderTop: 0 }}>
            {blocks.map((b) => (
              <li key={b.t} className="row" style={{ '--row': '44px' }}>
                <span className="st">{state(b) === 'now' ? <ST.now /> : state(b) === 'past' ? <ST.done /> : <ST.open />}</span>
                <span className="row__main"><span className="row__title" style={{ fontWeight: b.kind === 'lecture' ? 600 : 500 }}>{label(b)}</span></span>
                <span className="row__end mono">{fTime(b.t)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}
