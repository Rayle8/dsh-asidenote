// Builds the demo session the screenshots are taken from: one short prompt,
// then a fixed set of notes with a fixed set of ages.
//
// env: TOKEN (required), PORT (default 61399), PROMPT, TITLE (optional)
import { connect, evaluate, sleep } from './lib/cdp.mjs'

const port = process.env.PORT || 61399
const token = process.env.TOKEN
const prompt = process.env.PROMPT || '给「便笺」插件写三条中文发布文案，每条不超过 20 字，不要调用任何工具。'
const NOTES = [
  { text: '把发布说明里的截图换成新版面板', done: false, age: 46 * 60000 },
  { text: '核对暗色主题下的对比度', done: false, age: 12 * 60000 },
  { text: '确认 390px 视口下面板不溢出', done: true, age: 2 * 3600000, doneAge: 1 * 3600000 },
  { text: '补一条空状态说明文案', done: true, age: 26 * 3600000, doneAge: 20 * 60000 },
]

if (!token) throw new Error('TOKEN is required')

const session = await connect()

const clickText = text => evaluate(session, `(() => {
  const el = [...document.querySelectorAll('button,[role=button],a')].find(e => e.textContent.trim() === ${JSON.stringify(text)})
  if (el) el.click()
  return !!el
})()`)

const pressEnter = async () => {
  await session.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter' })
}

await session.send('Page.navigate', { url: `http://127.0.0.1:${port}/?token=${token}` })
await sleep(9000)
await clickText('继续')
await sleep(800)

// Fast model, no tool calls.
await evaluate(session, `(() => {
  const b = [...document.querySelectorAll('button,[role=button]')].find(x => x.textContent.includes('请选择模型'))
  if (b) b.click()
  return !!b
})()`)
await sleep(900)
await evaluate(session, `(() => {
  const it = [...document.querySelectorAll('[role=menuitem],[role=menuitemradio],[role=option]')].find(e => e.textContent.includes('Flash'))
  if (it) it.click()
  return !!it
})()`)
await sleep(600)

await evaluate(session, `(() => { const el = document.querySelector('textarea,[contenteditable=true],[role=textbox]'); if (el) el.focus(); return !!el })()`)
await session.send('Input.insertText', { text: prompt })
await sleep(400)
await pressEnter()
await sleep(25000)

console.log(await evaluate(session, `document.body.innerText.slice(0, 200)`))

// Add the notes.
await evaluate(session, `(() => { document.querySelector('.dsh-an-headerBtn')?.click(); return true })()`)
await sleep(1200)
for (const note of NOTES) {
  await evaluate(session, `(() => { const ta = document.querySelector('.dsh-an-input'); ta.focus(); return true })()`)
  await session.send('Input.insertText', { text: note.text })
  await sleep(300)
  await pressEnter()
  await sleep(700)
}
await evaluate(session, `(() => {
  for (const r of document.querySelectorAll('.dsh-an-row')) {
    const t = r.querySelector('.dsh-an-text').textContent
    const note = ${JSON.stringify(NOTES)}.find(n => n.text === t)
    if (note && note.done) r.querySelector('.dsh-an-check').click()
  }
  return true
})()`)
await sleep(1500)

// Backdate the notes so both themes show the same ages.
await evaluate(session, `(() => {
  const key = 'dsh.aside-notes.v2'
  const db = JSON.parse(localStorage.getItem(key))
  const now = Date.now()
  const plan = ${JSON.stringify(NOTES)}
  for (const s of Object.values(db.sessions)) for (const it of s.items) {
    const note = plan.find(n => n.text === it.text)
    if (!note) continue
    it.createdAt = now - note.age
    it.updatedAt = now - (note.doneAge ?? note.age)
    if (note.done) it.completedAt = now - note.doneAge
  }
  localStorage.setItem(key, JSON.stringify(db))
  return true
})()`)

console.log(await evaluate(session, `document.querySelector('.dsh-an-popover')?.innerText ?? 'panel closed'`))
session.ws.close()
process.exit(0)
