// Saving to your claude.ai account. When the hub runs as the artifact, the page gets
// `window.claude.use("db")`: a small document database only you can read and write.
// Anywhere else (npm run dev, GitHub Pages) there's no database and progress stays in this browser.
//
// Documents: lectures/<id>, assignments/<id>, meta/goal, meta/activity, meta/onboarded.
export async function connectCloud(store, { onWriteError } = {}) {
  if (!(window.claude && typeof window.claude.use === 'function')) { store.setState({ mode: 'local' }); return }
  let db = null
  try { db = await window.claude.use('db') } catch { db = null }
  if (!db) { store.setState({ mode: 'local' }); return }
  store.attach(db, { onWriteError })
  store.setState({ mode: 'cloud' })
  const fail = () => store.setState({ mode: 'error' })
  // live updates: another tab or device changed something
  const coll = (name) => db.collection(name).onSnapshot((snap) => {
    const next = {}
    snap.docs.forEach((d) => { if (d.exists) next[d.id] = d.data() })
    store.applyRemote({ [name]: next })
  }, fail)
  coll('lectures')
  coll('assignments')
  db.doc('meta/goal').onSnapshot((d) => { if (d.exists) store.applyRemote({ goal: d.data() }) }, fail)
  db.doc('meta/activity').onSnapshot((d) => { if (d.exists) store.applyRemote({ activity: d.data() }) }, fail)
  db.doc('meta/onboarded').onSnapshot((d) => store.applyRemote({ onboarded: d.exists ? d.data() : null }), fail)
}
