import { useEffect, useState } from 'react'
import { KEYS, readJSON, writeJSON } from '../lib/storage.js'

// Loads hub-data.json (built by data/build_hub.py). If that fails, uses the last copy saved
// in this browser; if there's none, reports an error.
export function useHubData(url = 'hub-data.json') {
  const [state, setState] = useState({ data: null, fromCache: false, error: false })
  useEffect(() => {
    let live = true
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((data) => {
        writeJSON(KEYS.data, data)
        if (live) setState({ data, fromCache: false, error: false })
      })
      .catch(() => {
        const cached = readJSON(KEYS.data)
        if (live) setState(cached ? { data: cached, fromCache: true, error: false } : { data: null, fromCache: false, error: true })
      })
    return () => { live = false }
  }, [url])
  return state
}
