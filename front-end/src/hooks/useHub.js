import { createContext, useContext } from 'react'

// Everything a page needs, handed down by App:
//   m        the course + your progress (utils/model.js): m.LB(id), m.prog(l), m.upNext(…)
//   ui       page state: route, filters, which steps are open, the open sheet…
//   progress your saved progress plus the save mode (for the Save badge)
//   hub      the actions (lib/actions.js): hub.tick(…), hub.rate(…), hub.toast(…)
export const HubContext = createContext(null)

export function useHub() {
  return useContext(HubContext)
}
