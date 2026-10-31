/**
 * Boots the built bundle the way the shell does.
 *
 * The contract test only reads text; this one actually runs `client/client.js`
 * inside a jsdom realm, hands its factory a module table, calls `apply(ctx)`
 * and checks the two registrations, the injected stylesheet and the host-DOM
 * header entry. It is the P1 stand-in for the real-GUI smoke test.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundlePath = path.join(root, 'client', 'client.js')
const bundle = fs.readFileSync(bundlePath, 'utf8')

test('the built bundle boots, applies, and seats its slots', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  // Seed the current keys before the plugin boots: one open note and a
  // non-default send preference. No legacy key is read or copied.
  window.localStorage.setItem('dsh.aside-note', JSON.stringify({
    version: 1,
    sessions: { 'session-1': { items: [{ id: 'seed', text: '旧便笺', done: false, createdAt: 1, updatedAt: 1 }] } },
  }))
  window.localStorage.setItem('dsh.aside-note.send-shortcut', 'ctrl-enter')

  // Loaded after the DOM globals exist: react-dom decides `canUseDOM` at import.
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  // The panel probes npm when it opens and asks the market only when a newer
  // version exists. Answer inside this realm so the shipped fallback, notes
  // fetch, cache and update flow run without touching the network.
  const RELEASE_BODY = `# English

<!-- app-update-notes:en:start -->
### Added
- **Update centre:** Notes are readable in the panel. (#31)
<!-- app-update-notes:en:end -->

# 中文

<!-- app-update-notes:zh:start -->
### 新增
- **更新中心：** 可以直接在面板里查看更新说明。 （#31）

### 修复
- **提示点：** 已是最新版本时不再显示。 （#32）
<!-- app-update-notes:zh:end -->
`
  const OLDER_BODY = `# 中文

<!-- app-update-notes:zh:start -->
### 修复
- **旧版本：** 修复了上一个版本的问题。 （#30）
<!-- app-update-notes:zh:end -->
`
  const RELEASES = [
    { tag_name: 'v0.9.12', html_url: 'https://github.com/Rayle8/dsh-aside-note/releases/tag/v0.9.12', body: RELEASE_BODY },
    { tag_name: 'v0.9.11', html_url: 'https://github.com/Rayle8/dsh-aside-note/releases/tag/v0.9.11', body: OLDER_BODY },
    // Older than the running build and a prerelease: neither may appear.
    { tag_name: 'v0.9.9', html_url: 'https://github.com/Rayle8/dsh-aside-note/releases/tag/v0.9.9', body: OLDER_BODY },
    { tag_name: 'v0.9.13-beta.1', prerelease: true, body: RELEASE_BODY },
    { tag_name: 'v0.9.14', draft: true, body: RELEASE_BODY },
  ]
  const MARKET_CAPABILITIES = {
    schema: 'dsh-market/update-api/v1',
    stability: 'beta',
    marketVersion: '1.73.3',
    restart: { supported: false, managedBy: 'operator' },
    endpoints: {
      updates: '/dsh-market/api/v1/updates',
      operations: '/dsh-market/api/v1/operations',
      restart: '/dsh-market/api/v1/restart',
    },
  }
  const calls = []
  let startedUpdates = 0
  let polledOperations = 0
  // One manual check is held open so the test can see the in-flight render.
  let holdManualCheck = false
  let releaseManualCheck = null
  const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
  window.fetch = async (input, init = {}) => {
    const url = String(input)
    const method = init.method || 'GET'
    calls.push({ url, method })
    if (url.startsWith('https://registry.npmjs.org/')) return json(404, {})
    if (url.startsWith('https://registry.npmmirror.com/')) {
      if (holdManualCheck) {
        holdManualCheck = false
        return new Promise(resolve => {
          releaseManualCheck = () => resolve(json(200, { version: '0.9.12' }))
        })
      }
      return json(200, { version: '0.9.12' })
    }
    if (url === 'https://api.github.com/repos/Rayle8/dsh-aside-note/releases?per_page=50') {
      return json(200, RELEASES)
    }
    if (url === '/dsh-market/api/v1/capabilities') return json(200, MARKET_CAPABILITIES)
    if (url === '/dsh-market/api/v1/updates' && method === 'POST') {
      startedUpdates += 1
      return json(202, { operation: { operationId: 'boot-1-update-1', state: 'queued' } })
    }
    if (url.startsWith('/dsh-market/api/v1/operations?operationId=boot-1-update-1')) {
      polledOperations += 1
      return json(200, {
        operation: {
          operationId: 'boot-1-update-1',
          state: 'succeeded',
          beforeVersion: '0.9.8',
          installedVersion: '0.9.12',
          progress: { percent: 100 },
          outcome: { refreshRequired: true, restartRequired: false },
          failure: null,
        },
      })
    }
    return json(404, {})
  }
  const registryCalls = () => calls.filter(call => call.url.includes('registry.'))

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)

  assert.equal(loaded.id, 'dsh-aside-note')
  const moduleTable = {
    react: React,
    'react-dom': ReactDOM,
    'react-dom/client': ReactDOMClient,
    '@deepseek-ai/dsh-client-ui-primitives': {},
  }
  const requireShim = id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  }
  const exported = loaded.factory(requireShim)
  assert.deepEqual([...exported.inject], ['slots'])
  assert.equal(typeof exported.apply, 'function')

  const effects = []
  const disposers = []
  const registered = []
  const injected = []
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ id: 'zh' }),
  }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: (fn, label) => {
      effects.push(label)
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
    },
    slots: {
      inject: (name, factory) => {
        injected.push(name)
        factory()
      },
      register: (meta, component) => {
        registered.push({ meta, component })
        return () => {}
      },
    },
  }

  await act(async () => { exported.apply(ctx) })

  assert.deepEqual(injected.sort(), ['conversation.composer.dock', 'shell.overlay'])
  assert.equal(registered.length, 2, 'both slots must be registered')
  assert.deepEqual(registered.map(entry => entry.meta.name).sort(), injected)

  const seeded = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
  assert.equal(seeded.sessions['session-1'].items[0].text, '旧便笺')
  assert.equal(window.localStorage.getItem('dsh.aside-note.send-shortcut'), 'ctrl-enter')
  assert.equal(window.localStorage.getItem('dsh.aside-note.migrated'), null, 'no migration marker is written')

  const style = document.querySelector('style[data-dsh-plugin="dsh-aside-note"]')
  assert.ok(style, 'the document-level stylesheet must be injected')
  assert.match(style.textContent, /\.dsh-an-popover\{/)

  // Render the session capture the shell would mount, then let its effect seat
  // the header entry into the host-owned utilities row.
  const capture = registered.find(entry => entry.meta.name === 'conversation.composer.dock').component
  const container = document.createElement('div')
  document.body.appendChild(container)
  const reactRoot = ReactDOMClient.createRoot(container)
  await act(async () => {
    reactRoot.render(React.createElement(capture, { sessionId: 'session-1' }))
  })

  const button = document.querySelector('._headerUtilities > .dsh-an-headerBtn')
  assert.ok(button, 'the header entry must be injected into the host utilities row')
  assert.equal(button.dataset.sessionId, 'session-1')
  assert.match(button.getAttribute('aria-label'), /便笺/)
  // The seeded note is open, so the entry already shows a count.
  assert.equal(button.querySelector('.dsh-an-headerCount').textContent, '1')

  // Open the panel from that entry and write a note through the real form.
  await act(async () => { button.click() })
  const popover = document.querySelector('.dsh-an-popover')
  assert.ok(popover, 'clicking the header entry must open the panel')
  const addField = popover.querySelector('.dsh-an-input')
  assert.ok(addField, 'the panel must render the add field')
  // Set the value through the prototype setter so React's value tracker sees a
  // change, then dispatch the input event React listens for. fireEvent would
  // resolve the prototype in the Node realm, not this jsdom one.
  const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set
  await act(async () => {
    valueSetter.call(addField, '新的一条')
    addField.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
  const addButton = popover.querySelector('.dsh-an-addBtn')
  assert.equal(addButton.disabled, false, 'the add button enables once the draft has text')
  await act(async () => { addButton.click() })
  const written = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
  assert.equal(written.sessions['session-1'].items[0].text, '新的一条')
  assert.equal(written.sessions['session-1'].items.length, 2)
  // The entry refreshes on a rAF after the store write; give jsdom one frame.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
  assert.equal(document.querySelector('.dsh-an-headerCount').textContent, '2')

  // Settings: the shortcut radio persists, and so does the forward prefix.
  await act(async () => { popover.querySelector('.dsh-an-settingsBtn').click() })
  assert.ok(popover.querySelector('.dsh-an-settings'), 'the gear must open the settings card')
  const radios = popover.querySelectorAll('input[type="radio"]')
  assert.equal(radios.length, 2)
  await act(async () => { radios[1].click() })
  assert.equal(window.localStorage.getItem('dsh.aside-note.send-shortcut'), 'ctrl-enter')

  // The npmjs read fails, the mirror answers with a newer version: the gear
  // gains a dot and About shows the update card.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
  assert.deepEqual(registryCalls().map(call => call.url), [
    'https://registry.npmjs.org/dsh-aside-note/latest',
    'https://registry.npmmirror.com/dsh-aside-note/latest',
  ], 'the npmjs miss must fall back to the npmmirror host')
  assert.ok(popover.querySelector('.dsh-an-updateDot'), 'the gear carries the update dot')
  const updateCard = popover.querySelector('.dsh-an-updateCard')
  assert.ok(updateCard, 'a newer version must surface in Settings > About')
  assert.match(updateCard.textContent, /0\.9\.11/)
  // Notes are part of the card, loaded without a disclosure click.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 80)) })
  assert.ok(popover.querySelector('.dsh-an-updateNotes'), 'release notes must load by default')

  // The manual check bypasses the hourly cache and reads the registry again.
  // Hold its answer to assert the card does not unmount while the check runs.
  const beforeCheck = registryCalls().length
  holdManualCheck = true
  await act(async () => { popover.querySelector('.dsh-an-updateCheck').click() })
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 60)) })
  assert.ok(popover.querySelector('.dsh-an-updateCard'), 'the card must stay mounted while a manual check runs')
  assert.ok(popover.querySelector('.dsh-an-updateDot'), 'the update dot must stay while checking')
  assert.equal(popover.querySelector('.dsh-an-updateCheck').textContent, '正在检查…', 'only the button reports progress')
  releaseManualCheck()
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 80)) })
  assert.equal(registryCalls().length, beforeCheck + 2, 'a manual check must bypass the cache')
  // The checking state is deliberately held for at least three seconds; wait it
  // out before expecting an available release again.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 3200)) })

  // The release list is already visible: two releases in the gap, the newest
  // open and the older one collapsed until its version heading is clicked.
  const notes = popover.querySelector('.dsh-an-updateNotes')
  assert.ok(notes, 'release notes stay visible after a check')
  assert.match(notes.textContent, /本次更新包含 2 个版本/)
  const heads = [...notes.querySelectorAll('.dsh-an-updateVersionHead')]
  assert.deepEqual(heads.map(head => head.textContent.replace('▸', '')), ['v0.9.12最新', 'v0.9.11'])
  assert.match(notes.textContent, /更新中心/)
  assert.doesNotMatch(notes.textContent, /0\.9\.13-beta/, 'prereleases are not offered')
  assert.doesNotMatch(notes.textContent, /v0\.9\.9\b/, 'releases older than the build are not listed')
  assert.equal(heads[0].getAttribute('aria-expanded'), 'true', 'the release being installed opens')
  assert.equal(heads[1].getAttribute('aria-expanded'), 'false', 'older releases wait for a click')
  await act(async () => { heads[1].click() })
  assert.match(notes.textContent, /修复了上一个版本的问题/, 'clicking an older version expands its notes')
  const fullLink = popover.querySelector('.dsh-an-updateFull')
  assert.equal(fullLink.getAttribute('href'), 'https://github.com/Rayle8/dsh-aside-note/releases/tag/v0.9.12')
  assert.equal(fullLink.getAttribute('target'), '_blank')
  const actions = popover.querySelector('.dsh-an-updateActions')
  assert.ok(actions, 'the action row carries the update button and the full-release link')
  assert.equal(actions.lastElementChild, fullLink, 'the full-release link sits to the right of the update button')
  assert.ok(actions.querySelector('.dsh-an-updatePrimary'), 'the update button shares that row')

  // "Update now" queues the market operation and settles on the refresh action.
  await act(async () => { popover.querySelector('.dsh-an-updatePrimary').click() })
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 2200)) })
  assert.equal(startedUpdates, 1, 'the update must POST exactly once')
  assert.ok(polledOperations >= 1, 'the operation must be polled')
  const done = [...popover.querySelectorAll('.dsh-an-updatePrimary')].map(node => node.textContent)
  assert.ok(done.includes('刷新页面'), `the finished operation offers a refresh, saw ${JSON.stringify(done)}`)

  const prefixField = popover.querySelector('#dsh-an-forward-prefix')
  await act(async () => {
    valueSetter.call(prefixField, '请处理：')
    prefixField.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
  assert.equal(window.localStorage.getItem('dsh.aside-note.forward-prefix'), '请处理：')

  // Complete one note, then clear the completed list through its confirmation.
  const check = popover.querySelector('.dsh-an-check')
  assert.ok(check, 'the row must render its checkbox')
  await act(async () => { check.click() })
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
  assert.equal(document.querySelector('.dsh-an-headerCount').textContent, '1')
  await act(async () => { popover.querySelector('.dsh-an-doneHead .dsh-an-doneToggle').click() })
  const clearButton = popover.querySelector('.dsh-an-clear')
  assert.ok(clearButton, 'the completed section must offer clear')
  await act(async () => { clearButton.click() })
  assert.ok(popover.querySelector('.dsh-an-clearConfirm'), 'clearing asks for a second click')
  await act(async () => { popover.querySelector('.dsh-an-miniDanger').click() })
  const afterClear = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
  assert.equal(afterClear.sessions['session-1'].items.length, 1)
  assert.equal(afterClear.sessions['session-1'].items[0].done, false)

  // Edit the remaining note in place.
  const editButton = popover.querySelector('.dsh-an-iconBtn[aria-label="编辑"]')
  assert.ok(editButton, 'the row must offer edit')
  await act(async () => { editButton.click() })
  const editInput = popover.querySelector('.dsh-an-editInput')
  assert.ok(editInput, 'editing swaps in the inline editor')
  await act(async () => {
    valueSetter.call(editInput, '改过的便笺')
    editInput.dispatchEvent(new window.Event('input', { bubbles: true }))
  })
  await act(async () => { popover.querySelector('.dsh-an-miniPrimary').click() })
  const afterEdit = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
  assert.equal(afterEdit.sessions['session-1'].items[0].text, '改过的便笺')

  const widthHandle = popover.querySelector('.dsh-an-resizeHandle')
  assert.ok(widthHandle, 'a right-side panel exposes the width handle')
  const widthBefore = Number(window.localStorage.getItem('dsh.aside-note.panel-width')) || 360
  await act(async () => { widthHandle.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })) })
  assert.ok(Number(window.localStorage.getItem('dsh.aside-note.panel-width')) > widthBefore)

  // Delete the last note; the store empties and the panel falls back to the empty state.
  const deleteButton = popover.querySelector('.dsh-an-iconBtnDanger[aria-label="删除"]')
  assert.ok(deleteButton, 'the row must offer delete')
  await act(async () => { deleteButton.click() })
  const afterDelete = JSON.parse(window.localStorage.getItem('dsh.aside-note'))
  assert.equal(afterDelete.sessions['session-1'].items.length, 0)
  assert.ok(popover.querySelector('.dsh-an-empty'), 'the list falls back to the empty state')

  // Section collapse is remembered.
  await act(async () => { popover.querySelector('.dsh-an-sectionHead .dsh-an-doneToggle').click() })
  const sections = JSON.parse(window.localStorage.getItem('dsh.aside-note.sections'))
  assert.equal(sections.open, false)

  // The probe caches its answer, so reopening the panel reads no registry again.
  await act(async () => { popover.querySelector('.dsh-an-popClose').click() })
  assert.equal(document.querySelector('.dsh-an-popover'), null, 'the close button removes the panel')
  await act(async () => { button.click() })
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 20)) })
  assert.equal(registryCalls().length, beforeCheck + 2, 'the cached answer must be reused by a reopened panel')
  assert.ok(document.querySelector('.dsh-an-popover').querySelector('.dsh-an-updateDot'))

  await act(async () => { reactRoot.unmount() })
  for (const dispose of disposers) dispose()
  assert.equal(document.querySelector('style[data-dsh-plugin="dsh-aside-note"]'), null,
    'the stylesheet must be removed when the plugin is disposed')
  dom.window.close()
})
