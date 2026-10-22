import { useEffect, useLayoutEffect, useRef } from 'react'

// Phone tab bar at the bottom. A pill slides behind the current tab.
export default function TabBar({ tab, due }) {
  const inner = useRef(null)
  const placed = useRef(false)

  const place = () => {
    const el = inner.current
    if (!el || !el.offsetWidth) return
    const pill = el.querySelector('.tabbar__pill')
    const a = el.querySelector('a[aria-current="page"]')
    if (!a) return
    pill.style.setProperty('--x', `${a.offsetLeft + a.offsetWidth / 2 - 28}px`)
    // the first placement jumps into place; after that the pill glides
    if (!placed.current) { void pill.offsetWidth; pill.dataset.ready = 'true'; placed.current = true }
  }
  useLayoutEffect(place, [tab])
  useEffect(() => {
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  const cur = (k) => (tab === k ? 'page' : 'false')
  return (
    <nav className="tabbar" aria-label="Sections">
      <div className="tabbar__inner" ref={inner}>
        <span className="tabbar__pill" aria-hidden="true" data-ready="false" />
        <a href="#today" data-tab="today" aria-current={cur('today')}><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="3" y="4.5" width="16" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h16M7.5 2.5v4M14.5 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>Today</a>
        <a href="#course" data-tab="course" aria-current={cur('course')}><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 5.5h12M5 11h12M5 16.5h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>Course</a>
        <a href="#review" data-tab="review" aria-current={cur('review')}><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M4.5 11a6.5 6.5 0 1 0 2-4.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M4 3.5v3.6h3.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>Review<span className="badge" data-badge="" hidden={!due} aria-label={`${due} due`}>{due}</span></a>
        <a href="#work" data-tab="work" aria-current={cur('work')}><svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><rect x="3.5" y="6.5" width="15" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 14 5v1.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>Work</a>
      </div>
    </nav>
  )
}
