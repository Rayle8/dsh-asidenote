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

  // 1.x data must survive the rename: seed the old keys before the plugin
  // boots, then expect copies under the AsideNote keys plus the marker.
  window.localStorage.setItem('dsh.session-memos.v1', JSON.stringify({
    version: 1,
    sessions: { 'session-1': { items: [{ id: 'seed', text: '旧便笺', done: false, createdAt: 1, updatedAt: 1 }] } },
  }))
  window.localStorage.setItem('dsh.memo.send-shortcut.v1', 'ctrl-enter')

  // Loaded after the DOM globals exist: react-dom decides `canUseDOM` at import.
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  let loaded = null
  window.__ModuleLoader__ = { load: spec => { loaded = spec } }
  window.eval(bundle)

  assert.equal(loaded.id, 'dsh-asidenote')
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

  const migrated = JSON.parse(window.localStorage.getItem('dsh.aside-notes.v2'))
  assert.equal(migrated.sessions['session-1'].items[0].text, '旧便笺')
  assert.equal(window.localStorage.getItem('dsh.aside-notes.send-shortcut.v2'), 'ctrl-enter')
  assert.ok(window.localStorage.getItem('dsh.aside-notes.migrated.v2'), 'the migration marker must be set')
  assert.ok(window.localStorage.getItem('dsh.session-memos.v1'), 'old keys stay readable for a rollback')

  const style = document.querySelector('style[data-dsh-plugin="dsh-asidenote"]')
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
  // The migrated note is open, so the entry already shows a count.
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
  const written = JSON.parse(window.localStorage.getItem('dsh.aside-notes.v2'))
  assert.equal(written.sessions['session-1'].items[0].text, '新的一条')
  assert.equal(written.sessions['session-1'].items.length, 2)
  // The entry refreshes on a rAF after the store write; give jsdom one frame.
  await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 40)) })
  assert.equal(document.querySelector('.dsh-an-headerCount').textContent, '2')

  await act(async () => { reactRoot.unmount() })
  for (const dispose of disposers) dispose()
  assert.equal(document.querySelector('style[data-dsh-plugin="dsh-asidenote"]'), null,
    'the stylesheet must be removed when the plugin is disposed')
  dom.window.close()
})
