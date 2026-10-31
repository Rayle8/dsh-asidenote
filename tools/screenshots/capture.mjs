// Captures the five feature states for one theme.
//
// env: THEME=light|dark, TOKEN (required), PORT (default 61399), OUT (default raw)
//
// The app chrome is hidden and the body is painted with a neutral canvas so
// the panel keeps its real shadow and hairline while the crop stays clean.
import fs from 'node:fs'
import path from 'node:path'
import { connect, evaluate, shot, sleep } from './lib/cdp.mjs'

const theme = process.env.THEME === 'dark' ? 'dark' : 'light'
const port = process.env.PORT || 61399
const token = process.env.TOKEN
const outDir = process.env.OUT || 'raw'
const canvas = theme === 'dark' ? '#0D0D0F' : '#F2F3F5'

if (!token) throw new Error('TOKEN is required')
fs.mkdirSync(outDir, { recursive: true })

const session = await connect()
const rects = {}

const clickText = text => evaluate(session, `(() => {
  const el = [...document.querySelectorAll('button,[role=button],a')].find(e => e.textContent.trim() === ${JSON.stringify(text)})
  if (el) el.click()
  return !!el
})()`)

const expandAll = () => evaluate(session, `(() => {
  for (const s of document.querySelectorAll('.dsh-an-listSection')) {
    if (!s.querySelector('.dsh-an-row')) s.querySelector('.dsh-an-doneToggle')?.click()
  }
  return true
})()`)

const collapseAll = () => evaluate(session, `(() => {
  for (const s of document.querySelectorAll('.dsh-an-listSection')) {
    if (s.querySelector('.dsh-an-row')) s.querySelector('.dsh-an-doneToggle')?.click()
  }
  return true
})()`)

const isolate = () => evaluate(session, `(() => {
  for (const c of document.body.children) {
    if (!c.classList.contains('dsh-an-popover')) c.style.visibility = 'hidden'
  }
  document.body.style.background = ${JSON.stringify(canvas)}
  document.activeElement?.blur()
  return true
})()`)

const restore = () => evaluate(session, `(() => {
  for (const c of document.body.children) c.style.visibility = ''
  document.body.style.background = ''
  return true
})()`)

async function waitApp() {
  for (let i = 0; i < 5; i++) {
    await sleep(4000)
    const state = await evaluate(session, `({
      failed: document.body.innerText.includes('Failed to load plugins'),
      ready: !!document.querySelector('.dsh-an-headerBtn') || document.body.innerText.includes('描述你想要构建的内容'),
    })`)
    if (state.ready) return
    if (state.failed) await session.send('Page.reload')
  }
  throw new Error('app did not become ready')
}

async function capture(name) {
  const rect = await evaluate(session, `(() => {
    const p = document.querySelector('.dsh-an-popover')
    if (!p) return null
    const r = p.getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })()`)
  if (!rect) throw new Error(`no popover for ${name}`)
  rects[name] = rect
  await sleep(400)
  await shot(session, path.join(outDir, `${theme}-${name}.png`))
  console.log(theme, name, JSON.stringify(rect))
}

await session.send('Page.navigate', { url: `http://127.0.0.1:${port}/?token=${token}` })
await waitApp()
await clickText('继续')
await sleep(800)

// Reload so the backdated note ages from bootstrap land in the panel.
await session.send('Page.reload')
await waitApp()
await clickText('继续')
await sleep(600)

await evaluate(session, `(() => { document.querySelector('.dsh-an-headerBtn')?.click(); return true })()`)
await sleep(1200)

await expandAll()
await evaluate(session, `(() => {
  const list = document.querySelector('.dsh-an-listArea')
  if (list) list.scrollTop = 0
  return true
})()`)
await sleep(600)
await isolate()
await capture('panel')

// Settings card on a compact panel.
await collapseAll()
await sleep(500)
await evaluate(session, `(() => { document.querySelector('.dsh-an-settingsBtn')?.click(); return true })()`)
await sleep(700)
await capture('settings')
await evaluate(session, `(() => { document.querySelector('.dsh-an-settingsBtn')?.click(); return true })()`)
await sleep(400)
await expandAll()
await sleep(500)

// Row actions on hover.
const row = await evaluate(session, `(() => {
  const r = document.querySelector('.dsh-an-row').getBoundingClientRect()
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
})()`)
await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: row.x, y: row.y })
await sleep(600)
await capture('actions')
await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 5, y: 5 })
await sleep(400)

// Clear-completed confirmation.
await evaluate(session, `(() => { document.querySelector('.dsh-an-clear')?.click(); return true })()`)
await sleep(600)
await capture('clear')
await clickText('取消')
await sleep(400)
await evaluate(session, `(() => { document.querySelector('.dsh-an-popClose')?.click(); return true })()`)
await restore()
await sleep(400)

// Empty state: drop the notes for a moment, then put them back.
const saved = await evaluate(session, `localStorage.getItem('dsh.aside-notes.v2')`)
await evaluate(session, `(() => {
  const key = 'dsh.aside-notes.v2'
  const db = JSON.parse(localStorage.getItem(key))
  for (const s of Object.values(db.sessions)) s.items = []
  localStorage.setItem(key, JSON.stringify(db))
  return true
})()`)
await session.send('Page.reload')
await waitApp()
await clickText('继续')
await sleep(600)
await evaluate(session, `(() => { document.querySelector('.dsh-an-headerBtn')?.click(); return true })()`)
await sleep(1200)
await isolate()
await capture('empty')
await evaluate(session, `(() => { document.querySelector('.dsh-an-popClose')?.click(); return true })()`)
await restore()
await evaluate(session, `localStorage.setItem('dsh.aside-notes.v2', ${JSON.stringify(saved)})`)

fs.writeFileSync(path.join(outDir, `${theme}-rects.json`), JSON.stringify(rects, null, 2))
session.ws.close()
process.exit(0)
