/**
 * Regression: checking for updates while the running build is the published
 * one must not flash an update card for that same version.
 *
 * The check state used to keep the published version even when it matched the
 * running build, and the manual "checking" state rendered any kept version as
 * an offer. This boots the shipped bundle in jsdom and watches the real panel
 * through the quiet check, the manual check and its settled state.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundle = fs.readFileSync(path.join(root, 'client', 'client.js'), 'utf8')

// The build under test moves every release; the registry answer must be that
// same version, or the regression this file guards ("published === running")
// stops being exercised.
const RUNNING = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
const wait = (window, ms) => new Promise(resolve => window.setTimeout(resolve, ms))

test('an up-to-date manual check never offers the running version', async t => {
  const dom = new JSDOM(
    '<!doctype html><html><body><div class="_headerUtilities"></div></body></html>',
    { url: 'https://example.test/', pretendToBeVisual: true, runScripts: 'outside-only' },
  )
  const { window } = dom
  t.after(() => window.close())
  globalThis.window = window
  globalThis.document = window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true

  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const ReactDOMClient = await import('react-dom/client')
  const { act } = React

  // npmjs misses, the mirror answers with the version already running. A
  // manual check can be held open so the in-flight render is observable.
  let holdManualCheck = false
  let releaseManualCheck = null
  let offline = false
  window.fetch = async input => {
    if (offline) throw new Error('offline')
    const url = String(input)
    if (url.startsWith('https://registry.npmjs.org/')) return json(404, {})
    if (url.startsWith('https://registry.npmmirror.com/')) {
      if (holdManualCheck) {
        holdManualCheck = false
        return new Promise(resolve => {
          releaseManualCheck = () => resolve(json(200, { version: RUNNING }))
        })
      }
      return json(200, { version: RUNNING })
    }
    return json(404, {})
  }

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

  const disposers = []
  const registered = []
  const locale = {
    bind: () => key => key,
    register: () => {},
    getLocale: () => ({ id: 'zh' }),
  }
  const ctx = {
    get: name => (name === 'locale' ? locale : undefined),
    effect: fn => {
      const dispose = fn()
      if (typeof dispose === 'function') disposers.push(dispose)
    },
    slots: {
      inject: (name, factory) => factory(),
      register: (meta, component) => {
        registered.push({ meta, component })
        return () => {}
      },
    },
  }
  await act(async () => { exported.apply(ctx) })

  const capture = registered.find(entry => entry.meta.name === 'conversation.composer.dock').component
  const container = document.createElement('div')
  document.body.appendChild(container)
  const reactRoot = ReactDOMClient.createRoot(container)
  await act(async () => {
    reactRoot.render(React.createElement(capture, { sessionId: 'session-1' }))
  })

  const headerButton = document.querySelector('._headerUtilities > .dsh-an-headerBtn')
  assert.ok(headerButton, 'the header entry must be seated')
  await act(async () => { headerButton.click() })
  const popover = document.querySelector('.dsh-an-popover')
  assert.ok(popover, 'clicking the entry opens the panel')

  // Quiet check on open: published === running, so there is nothing to offer.
  await act(async () => { await wait(window, 40) })
  assert.equal(popover.querySelector('.dsh-an-updateCard'), null, 'an up-to-date build has no update card')
  assert.equal(popover.querySelector('.dsh-an-updateDot'), null, 'an up-to-date build has no gear dot')

  await act(async () => { popover.querySelector('.dsh-an-settingsBtn').click() })
  const checkButton = () => popover.querySelector('.dsh-an-updateCheck')
  assert.equal(checkButton().textContent, '检查更新')

  // Manual check: hold the answer to inspect the "checking" render.
  holdManualCheck = true
  await act(async () => { checkButton().click() })
  await act(async () => { await wait(window, 80) })
  assert.equal(checkButton().textContent, '正在检查…', 'only the button reports progress')
  assert.equal(popover.querySelector('.dsh-an-updateCard'), null,
    'the running version must not be offered while the check is in flight')
  assert.equal(popover.querySelector('.dsh-an-updateDot'), null,
    'the gear must not gain a dot for the running version')
  assert.doesNotMatch(popover.textContent, new RegExp(`有新版本\\s*v?${RUNNING.replace(/\./g, '\\.')}`),
    'the card must not announce the running version as new')

  // Release the answer: the check settles back to "up to date", still with no
  // card. The checking state is deliberately held for three seconds.
  releaseManualCheck()
  await act(async () => { await wait(window, 3200) })
  assert.equal(popover.querySelector('.dsh-an-updateCard'), null, 'no card once the check settles')
  assert.equal(popover.querySelector('.dsh-an-updateDot'), null, 'no gear dot once the check settles')
  assert.ok(
    [...popover.querySelectorAll('.dsh-an-updateHint')].some(node => node.textContent === '已是最新版本'),
    'the settled check says the build is up to date',
  )
  assert.equal(checkButton().textContent, '检查更新', 'the button is idle again')

  // A failed check on a current build belongs in the button, not in a card
  // that resurrects the running version. The check still holds its state for
  // three seconds, so wait it out.
  offline = true
  await act(async () => { checkButton().click() })
  await act(async () => { await wait(window, 3200) })
  assert.equal(popover.querySelector('.dsh-an-updateCard'), null,
    'a failed check must not conjure an update card')
  assert.equal(popover.querySelector('.dsh-an-updateDot'), null,
    'a failed check must not add the gear dot')
  assert.ok(
    [...popover.querySelectorAll('.dsh-an-updateHintError')].some(node => node.textContent === '检查失败，请稍后重试'),
    'the failure is reported beside the button',
  )
  assert.equal(checkButton().textContent, '重试检查', 'the button offers a retry')

  await act(async () => { reactRoot.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})
