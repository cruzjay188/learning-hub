import { useSyncExternalStore } from 'react'

// Re-renders the component whenever the store changes. (lib/store.js explains the stores.)
export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.getState)
}
