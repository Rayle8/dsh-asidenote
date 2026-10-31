/**
 * The plugin market's public update API, exercised through an injected fetch.
 *
 * Shapes follow `dshmarket/UPDATE-API-V1.md`; the client is deliberately
 * tolerant of a market that is absent, old, or mid-failure.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MARKET_API_BASE,
  MARKET_TIMEOUT_MS,
  createMarketClient,
} from '../src/client/update/market.ts'

function jsonResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

const CAPABILITIES = {
  schema: 'dsh-market/update-api/v1',
  apiVersion: 1,
  stability: 'beta',
  marketVersion: '1.73.3',
  profile: 'desktop',
  runtime: 'web',
  features: { check: true, update: true, progress: true, rollback: true, restart: false, updatesSummary: true },
  restart: { supported: false, managedBy: 'operator' },
  operationRetention: 'current-process',
  operationLimit: 50,
  endpoints: {
    updates: '/dsh-market/api/v1/updates',
    operations: '/dsh-market/api/v1/operations',
    restart: '/dsh-market/api/v1/restart',
  },
}

test('capabilities are discovered before any mutation and can be absent', async () => {
  const calls = []
  const market = createMarketClient({
    fetchImpl: async (url, init) => {
      calls.push({ url, init })
      if (url === `${MARKET_API_BASE}/capabilities`) return jsonResponse(200, CAPABILITIES)
      return jsonResponse(404, {})
    },
  })
  const caps = await market.capabilities()
  assert.equal(caps.marketVersion, '1.73.3')
  assert.equal(caps.restartSupported, false)
  assert.deepEqual(caps.endpoints, CAPABILITIES.endpoints)
  assert.deepEqual(calls.map(call => call.url), [`${MARKET_API_BASE}/capabilities`])

  const absent = createMarketClient({ fetchImpl: async () => jsonResponse(404, null) })
  assert.equal(await absent.capabilities(), null)

  const wrongSchema = createMarketClient({
    fetchImpl: async () => jsonResponse(200, { schema: 'something-else' }),
  })
  assert.equal(await wrongSchema.capabilities(), null)
})

test('the package check carries force and normalises the row', async () => {
  const urls = []
  const market = createMarketClient({
    fetchImpl: async url => {
      urls.push(url)
      return jsonResponse(200, {
        schema: 'dsh-market/update-api/v1',
        package: {
          name: 'dsh-asidenote',
          source: 'npm',
          installedVersion: '2.0.0',
          latestVersion: '2.0.1',
          updateAvailable: true,
          channelSwitch: null,
        },
      })
    },
  })
  const info = await market.check('dsh-asidenote', true)
  assert.deepEqual(info, {
    name: 'dsh-asidenote',
    source: 'npm',
    installedVersion: '2.0.0',
    latestVersion: '2.0.1',
    updateAvailable: true,
  })
  assert.equal(urls[0], `${MARKET_API_BASE}/updates?name=dsh-asidenote&force=1`)
})

test('starting an update returns the operation, or a retryable failure code', async () => {
  const requests = []
  const accepted = createMarketClient({
    fetchImpl: async (url, init) => {
      requests.push({ url, init })
      return jsonResponse(202, {
        schema: 'dsh-market/update-api/v1',
        operation: { operationId: 'boot-1-update-1', state: 'queued' },
      })
    },
  })
  assert.deepEqual(await accepted.start(), { operationId: 'boot-1-update-1', state: 'queued' })
  assert.equal(requests[0].init.method, 'POST')
  assert.equal(requests[0].init.headers['content-type'], 'application/json')
  assert.deepEqual(JSON.parse(requests[0].init.body), { packageName: 'dsh-asidenote' })

  const busy = createMarketClient({
    fetchImpl: async () => jsonResponse(409, {
      schema: 'dsh-market/update-api/v1',
      error: 'another public update operation is already running',
      failure: { code: 'OPERATION_BUSY', message: 'another update is running', retryable: true },
    }),
  })
  const result = await busy.start()
  assert.equal(result.error.code, 'OPERATION_BUSY')
  assert.equal(result.error.retryable, true)

  const offline = createMarketClient({ fetchImpl: async () => { throw new Error('offline') } })
  const failed = await offline.start()
  assert.equal(failed.error.code, 'UPDATE_FAILED')
})

test('operation polling normalises progress, outcome and retryability', async () => {
  const market = createMarketClient({
    fetchImpl: async () => jsonResponse(200, {
      schema: 'dsh-market/update-api/v1',
      operation: {
        operationId: 'boot-1-update-1',
        state: 'running',
        beforeVersion: '2.0.0',
        installedVersion: '2.0.0',
        progress: { percent: 42.4, detail: 'resolving dsh-asidenote' },
        outcome: { refreshRequired: false, restartRequired: false },
        failure: null,
      },
    }),
  })
  assert.deepEqual(await market.operation('boot-1-update-1'), {
    operationId: 'boot-1-update-1',
    state: 'running',
    percent: 42,
    detail: 'resolving dsh-asidenote',
    beforeVersion: '2.0.0',
    installedVersion: '2.0.0',
    refreshRequired: false,
    restartRequired: false,
    failure: null,
  })

  const failed = createMarketClient({
    fetchImpl: async () => jsonResponse(200, {
      schema: 'dsh-market/update-api/v1',
      operation: {
        operationId: 'boot-1-update-2',
        state: 'failed',
        failure: { code: 'RESOLVED_VERSION_MISMATCH', message: 'mirror lag', retryable: true },
      },
    }),
  })
  const operation = await failed.operation('boot-1-update-2')
  assert.equal(operation.state, 'failed')
  assert.equal(operation.failure.code, 'RESOLVED_VERSION_MISMATCH')
  assert.equal(operation.failure.retryable, true)

  assert.equal(await market.operation(''), null)
})

test('restart is a POST and reports the market answer', async () => {
  const seen = []
  const ok = createMarketClient({
    fetchImpl: async (url, init) => {
      seen.push({ url, method: init.method })
      return jsonResponse(200, { schema: 'dsh-market/update-api/v1', result: { ok: true } })
    },
  })
  assert.equal(await ok.restart(), true)
  assert.deepEqual(seen[0], { url: `${MARKET_API_BASE}/restart`, method: 'POST' })

  const refused = createMarketClient({ fetchImpl: async () => jsonResponse(403, {}) })
  assert.equal(await refused.restart(), false)
})

test('the default timeout is bounded', () => {
  assert.equal(MARKET_TIMEOUT_MS, 8000)
})
