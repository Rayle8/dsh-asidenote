// The demo notes: the only source of truth for their copy, state and ages.
//
// bootstrap.mjs types them into the panel and anchors their stamps; capture.mjs
// re-anchors them right before each theme so the light and dark shots agree on
// the reported ages even when the two runs are minutes apart.
export const NOTES_KEY = 'dsh.aside-note' // mirrors SESSION_STORAGE_KEY in src/client/constants.ts

export const NOTES = [
  { text: '把发布说明里的截图换成新版面板', done: false, age: 46 * 60000 },
  { text: '核对暗色主题下的对比度', done: false, age: 12 * 60000 },
  { text: '确认 390px 视口下面板不溢出', done: true, age: 2 * 3600000, doneAge: 1 * 3600000 },
  { text: '补一条空状态说明文案', done: true, age: 26 * 3600000, doneAge: 20 * 60000 },
]

/** Browser-side expression that rewrites the stored stamps to the plan's ages. */
export function anchorExpression(notes = NOTES) {
  return `(() => {
    const key = ${JSON.stringify(NOTES_KEY)}
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const db = JSON.parse(raw)
    const plan = ${JSON.stringify(notes)}
    const now = Date.now()
    for (const value of Object.values(db.sessions || {})) {
      for (const item of value.items || []) {
        const note = plan.find(n => n.text === item.text)
        if (!note) continue
        item.createdAt = now - note.age
        item.updatedAt = now - (note.doneAge ?? note.age)
        if (note.done) item.completedAt = now - (note.doneAge ?? note.age)
      }
    }
    localStorage.setItem(key, JSON.stringify(db))
    return true
  })()`
}
