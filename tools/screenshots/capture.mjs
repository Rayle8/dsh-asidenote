// Captures the five feature states for one theme, or — with PREVIEW=1 — the
// whole-window and header shots the README previews are cut from.
//
// env: THEME=light|dark, TOKEN (required), PORT (default 61399), OUT (default raw),
//      PREVIEW=1 for the preview shots
//
// The feature shots hide the app chrome and paint the body with a neutral canvas
// so the panel keeps its real shadow and hairline while the crop stays clean.
// The preview shots are taken with the real UI in place.
import fs from 'node:fs'
import path from 'node:path'
import { connect, evaluate, shot, sleep } from './lib/cdp.mjs'
import { NOTES_KEY, anchorExpression } from './lib/notes.mjs'

const theme = process.env.THEME === 'dark' ? 'dark' : 'light'
const port = process.env.PORT || 61399
const token = process.env.TOKEN
const outDir = process.env.OUT || 'raw'
const preview = process.env.PREVIEW === '1'
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

const openPanel = () => evaluate(session, `(() => { document.querySelector('.dsh-an-headerBtn')?.click(); return true })()`)
const closePanel = () => evaluate(session, `(() => { document.querySelector('.dsh-an-popClose')?.click(); return true })()`)

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

async function openDemo() {
  await session.send('Page.navigate', { url: `http://127.0.0.1:${port}/?token=${token}` })
  await waitApp()
  await clickText('继续')
  await sleep(800)
  // Re-anchor the note ages right before this theme's shots, then reload so the
  // panel renders them: light and dark must report the same minutes.
  if (!(await evaluate(session, anchorExpression()))) throw new Error('no note store to anchor')
  await session.send('Page.reload')
  await waitApp()
  await clickText('继续')
  await sleep(600)
}

async function captureFeatures() {
  await openPanel()
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
  await closePanel()
  await restore()
  await sleep(400)

  // Empty state: drop the notes for a moment, then put them back.
  const saved = await evaluate(session, `localStorage.getItem(${JSON.stringify(NOTES_KEY)})`)
  await evaluate(session, `(() => {
    const key = ${JSON.stringify(NOTES_KEY)}
    const db = JSON.parse(localStorage.getItem(key))
    for (const s of Object.values(db.sessions)) s.items = []
    localStorage.setItem(key, JSON.stringify(db))
    return true
  })()`)
  await session.send('Page.reload')
  await waitApp()
  await clickText('继续')
  await sleep(600)
  await openPanel()
  await sleep(1200)
  await isolate()
  await capture('empty')
  await closePanel()
  await restore()
  await evaluate(session, `localStorage.setItem(${JSON.stringify(NOTES_KEY)}, ${JSON.stringify(saved)})`)

  fs.writeFileSync(path.join(outDir, `${theme}-rects.json`), JSON.stringify(rects, null, 2))
}

// Section 6 of docs/screenshot-sop.md: the demo window with the panel open, plus
// the header strip the badge close-up is cropped from (panel closed).
async function capturePreview() {
  await openPanel()
  await sleep(1200)
  await expandAll()
  // Redact the maintainer's account: the sidebar launcher carries the avatar
  // and profile name. Hiding the launcher is enough — the rest of the window
  // stays the real signed-in UI, and the model reply keeps its chip.
  await evaluate(session, `(() => {
    const launcher = document.querySelector('[data-signed-out]') || document.querySelector('[aria-label="账号菜单"], [aria-label="Account menu"]')
    if (launcher) launcher.style.display = 'none'
    const list = document.querySelector('.dsh-an-listArea')
    if (list) list.scrollTop = 0
    document.activeElement?.blur()
    return !!launcher
  })()`)
  await sleep(600)
  await shot(session, path.join(outDir, `${theme}-preview.png`))
  console.log(theme, 'preview')

  await closePanel()
  await sleep(900)
  await shot(session, path.join(outDir, `${theme}-header.png`))
  console.log(theme, 'header')
}

await openDemo()
if (preview) await capturePreview()
else await captureFeatures()

session.ws.close()
process.exit(0)
