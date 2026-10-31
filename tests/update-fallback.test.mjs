/**
 * Regression: when the market cannot run the update — it is absent, or it keeps
 * answering `409 OPERATION_BUSY` because another operation holds the lock — the
 * card must not stop at "try again later". It states the terminal command and
 * copies a ready-to-paste prompt.
 *
 * The busy case is the one users hit: the market allows one mutation per host
 * process, so a neighbour update or a lingering install lock refuses the click.
 * The panel waits the short window out and then hands over the command.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const bundle = fs.readFileSync(path.join(root, 'client', 'client.js'), 'utf8')

/** A version any released build treats as an offered update. */
const NEXT = '9.9.9'

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
const wait = (window, ms) => new Promise(resolve => window.setTimeout(resolve, ms))

/**
 * Boot the shipped bundle in jsdom, open the panel and its settings card, and
 * hand back the pieces a test needs. `market` decides what the v1 endpoints
 * answer; the version check always offers {@link NEXT}.
 */
async function boot(t, market) {
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

  const starts = []
  window.fetch = async (input, init = {}) => {
    const url = String(input)
    if (url.startsWith('https://registry.npmjs.org/')) return json(200, { version: NEXT })
    if (url.startsWith('https://registry.npmmirror.com/')) return json(404, {})
    if (url.startsWith('https://api.github.com/')) return json(200, [])
    if (url === '/dsh-market/api/v1/capabilities') return market.capabilities()
    if (url === '/dsh-market/api/v1/updates' && init.method === 'POST') {
      starts.push(init.body)
      return market.start()
    }
    if (url.startsWith('/dsh-market/api/v1/operations')) return market.operation()
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
  const exported = loaded.factory(id => {
    if (!(id in moduleTable)) throw new Error(`module table cannot answer ${id}`)
    return moduleTable[id]
  })

  const disposers = []
  const registered = []
  const ctx = {
    get: name => (name === 'locale'
      ? { bind: () => key => key, register: () => {}, getLocale: () => ({ id: 'zh' }) }
      : undefined),
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

  await act(async () => { document.querySelector('._headerUtilities > .dsh-an-headerBtn').click() })
  const popover = document.querySelector('.dsh-an-popover')
  assert.ok(popover, 'clicking the entry opens the panel')
  await act(async () => { popover.querySelector('.dsh-an-settingsBtn').click() })

  const until = async (probe, timeout) => {
    const startedAt = Date.now()
    for (;;) {
      let value = null
      await act(async () => { value = probe() })
      if (value) return value
      assert.ok(Date.now() - startedAt < timeout, 'the card never reached the expected state')
      await act(async () => { await wait(window, 60) })
    }
  }

  return { window, act, popover, starts, until, reactRoot, disposers, dom }
}

const clipboard = window => {
  const copied = []
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async text => { copied.push(text) } },
  })
  return copied
}

test('a market that stays busy hands over the command instead of only an error', async t => {
  const { window, act, popover, starts, until, reactRoot, disposers, dom } = await boot(t, {
    capabilities: () => json(200, {
      schema: 'dsh-market/update-api/v1',
      marketVersion: '1.73.3',
      stability: 'beta',
      restart: { supported: false },
      endpoints: {
        updates: '/dsh-market/api/v1/updates',
        operations: '/dsh-market/api/v1/operations',
        restart: '/dsh-market/api/v1/restart',
      },
    }),
    start: () => json(409, {
      schema: 'dsh-market/update-api/v1',
      error: 'another public update operation is already running',
      failure: { code: 'OPERATION_BUSY', message: 'another update is running', retryable: true },
    }),
    operation: () => json(404, {}),
  })

  await until(() => popover.querySelector('.dsh-an-updateCard'), 4000)
  const updateButton = popover.querySelector('.dsh-an-updatePrimary')
  assert.equal(updateButton.textContent, '立即更新', 'a reachable market offers the one-click path')
  assert.equal(popover.querySelector('.dsh-an-updateFallback'), null,
    'the manual fallback waits until the market actually refuses')

  await act(async () => { updateButton.click() })
  // The first refusal lands quickly; the card reports the wait, not a failure.
  await until(() => {
    const node = popover.querySelector('.dsh-an-updatePrimary')
    return node && node.textContent.includes('等待中') ? node : null
  }, 3000)

  const fallback = await until(() => popover.querySelector('.dsh-an-updateFallback'), 12000)
  assert.equal(starts.length, 4, 'the busy answer is retried before giving up')
  assert.match(fallback.textContent, /npx -y dsh-aside-note install/, 'the fallback states the command')
  assert.match(popover.textContent, /市场正在执行另一个更新/, 'the refusal is still reported')
  assert.equal(popover.querySelector('.dsh-an-updatePrimary').textContent, '立即更新',
    'the retry button stays available next to the command')

  const copied = clipboard(window)
  await act(async () => { fallback.querySelector('.dsh-an-updateCopy').click() })
  await act(async () => { await wait(window, 20) })
  assert.equal(copied.length, 1, 'one click copies one prompt')
  assert.equal(copied[0], '帮我更新 DSH 插件 AsideNote（旁边记）到最新版本：在终端执行 npx -y dsh-aside-note install。',
    'the prompt is handed over verbatim')

  await act(async () => { reactRoot.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})

test('an absent market shows the command straight away, without an error', async t => {
  const { window, act, popover, until, reactRoot, disposers, dom } = await boot(t, {
    capabilities: () => json(404, {}),
    start: () => json(404, {}),
    operation: () => json(404, {}),
  })

  const fallback = await until(() => popover.querySelector('.dsh-an-updateFallback'), 4000)
  assert.equal(popover.querySelector('.dsh-an-updateError'), null, 'no market is not a failure')
  assert.equal(popover.querySelector('.dsh-an-updatePrimary'), null, 'there is nothing to click in-app')
  assert.match(fallback.textContent, /npx -y dsh-aside-note install/)

  const copied = clipboard(window)
  await act(async () => { fallback.querySelector('.dsh-an-updateCopy').click() })
  await act(async () => { await wait(window, 20) })
  assert.match(copied[0], /^帮我更新 DSH 插件 AsideNote（旁边记）到最新版本/, 'the prompt asks for the latest release')
  assert.match(copied[0], /npx -y dsh-aside-note install/)

  await act(async () => { reactRoot.unmount() })
  for (const dispose of disposers) dispose()
  dom.window.close()
})
