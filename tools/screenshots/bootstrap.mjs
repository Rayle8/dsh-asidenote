// Builds the demo session the screenshots are taken from: one short prompt,
// then a fixed set of notes with a fixed set of ages.
//
// env: TOKEN (required), PORT (default 61399), PROMPT, TITLE (optional)
import { connect, evaluate, sleep } from './lib/cdp.mjs'
import { NOTES, NOTES_KEY, anchorExpression } from './lib/notes.mjs'

const port = process.env.PORT || 61399
const token = process.env.TOKEN
const prompt = process.env.PROMPT || '给「旁边记」插件写三条中文发布文案，每条不超过 20 字；只输出编号和文案，不要提问，不要调用任何工具。'

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

// Anchor the notes to the plan's ages; capture.mjs re-anchors before each theme.
if (!(await evaluate(session, anchorExpression()))) {
  throw new Error(`no note store at ${NOTES_KEY}`)
}

console.log(await evaluate(session, `document.querySelector('.dsh-an-popover')?.innerText ?? 'panel closed'`))
session.ws.close()
process.exit(0)
