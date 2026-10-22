// The hub has no router library: the page is picked from the URL hash.
//   #today  #course  #review  #work  #work-activity  #lecture-<id>
// (#map and #assignments are old names, kept so saved links still work.)
export function parseHash(hash = window.location.hash) {
  const h = (hash || '#today').slice(1)
  if (h.startsWith('lecture-')) return { view: 'lecture', id: h.slice(8) }
  if (h === 'work-activity') return { view: 'work', tab: 'activity' }
  if (h === 'map') return { view: 'course' }
  if (h === 'assignments') return { view: 'work', tab: 'assignments' }
  return { view: ['today', 'course', 'review', 'work'].includes(h) ? h : 'today' }
}

export const routeKey = (r) => r.view + (r.id || '') + (r.tab || '')
// Lecture pages sit one level below the tabs; the view transition slides that way.
export const depthOf = (r) => (r && r.view === 'lecture' ? 1 : 0)
export const TAB_ORDER = ['today', 'course', 'review', 'work']
export const viewKey = (r) => (r ? r.view + (r.tab || '') : '')
