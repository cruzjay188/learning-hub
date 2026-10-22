// A tiny store: one state object, update it, get told when it changed.
// React reads it with useSyncExternalStore (see hooks/useStore.js). Unlike useState, an update
// is visible right away to the next line of code, which the hub's step-by-step actions rely on.
export function createStore(initial) {
  let state = initial
  const listeners = new Set()
  return {
    getState: () => state,
    // patch: an object to merge in, or a function (state) => patch
    setState(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next }
      listeners.forEach((fn) => fn())
    },
    subscribe(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }
}
