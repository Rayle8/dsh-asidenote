/**
 * Client for the plugin market's public update API (v1, beta).
 *
 * The market publishes a small same-origin JSON API so a plugin can offer its
 * own update button without running a package manager itself. Everything here
 * degrades to `null` when the market is absent, older than the API, or refuses
 * the request: an update button is a convenience, not a dependency.
 *
 * Contract: `dshmarket/UPDATE-API-V1.md` — endpoints come from
 * `/capabilities`, so a path change does not need a client release.
 */

/** Where the market mounts its public API. */
export const MARKET_API_BASE = '/dsh-market/api/v1'
/** The package this panel updates. */
export const MARKET_PACKAGE = 'dsh-aside-note'
/** A check should answer quickly; a slow market falls back to the manual path. */
export const MARKET_TIMEOUT_MS = 8000

export type MarketFetch = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string; signal?: any },
) => Promise<{ ok: boolean; status: number; json: () => Promise<any> }>

export interface MarketCapabilities {
  marketVersion: string
  stability: string
  restartSupported: boolean
  endpoints: {
    updates: string
    operations: string
    restart: string
  }
}

export interface MarketUpdateInfo {
  name: string
  source: string
  installedVersion: string
  latestVersion: string
  updateAvailable: boolean
}

export type MarketOperationState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'rolled-back'

export interface MarketOperationView {
  operationId: string
  state: MarketOperationState
  percent: number | null
  detail: string | null
  beforeVersion: string | null
  installedVersion: string | null
  refreshRequired: boolean
  restartRequired: boolean
  failure: { code: string; message: string; retryable: boolean } | null
}

export interface MarketStartResult {
  operationId: string
  state: MarketOperationState
}

export interface MarketError {
  code: string
  message: string
  retryable: boolean
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function asRecord(value: unknown): Record<string, any> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : null
}

function operationView(raw: unknown): MarketOperationView | null {
  const operation = asRecord(raw)
  if (!operation) return null
  const progress = asRecord(operation.progress) || {}
  const outcome = asRecord(operation.outcome) || {}
  const failure = asRecord(operation.failure)
  const percent = typeof progress.percent === 'number' && Number.isFinite(progress.percent)
    ? Math.max(0, Math.min(100, Math.round(progress.percent)))
    : null
  const state = asText(operation.state)
  const allowed: MarketOperationState[] = ['queued', 'running', 'succeeded', 'failed', 'cancelled', 'rolled-back']
  return {
    operationId: asText(operation.operationId) || '',
    state: allowed.includes(state as MarketOperationState) ? (state as MarketOperationState) : 'failed',
    percent,
    detail: asText(progress.detail),
    beforeVersion: asText(operation.beforeVersion),
    installedVersion: asText(operation.installedVersion),
    refreshRequired: outcome.refreshRequired === true,
    restartRequired: outcome.restartRequired === true,
    failure: failure
      ? {
          code: asText(failure.code) || 'UPDATE_FAILED',
          message: asText(failure.message) || '',
          retryable: failure.retryable === true,
        }
      : null,
  }
}

function errorFrom(body: unknown, fallback: string): MarketError {
  const failure = asRecord(asRecord(body)?.failure)
  return {
    code: asText(failure?.code) || 'UPDATE_FAILED',
    message: asText(failure?.message) || asText(asRecord(body)?.error) || fallback,
    retryable: failure?.retryable === true,
  }
}

export interface MarketClientOptions {
  fetchImpl?: MarketFetch
  timeoutMs?: number
  base?: string
}

/**
 * Build a market client. `fetchImpl` is injected so the client can be tested
 * without a browser or a live market.
 */
export function createMarketClient(options: MarketClientOptions = {}) {
  const fetchImpl: MarketFetch = options.fetchImpl || ((url, init) => fetch(url, init))
  const timeoutMs = options.timeoutMs || MARKET_TIMEOUT_MS
  const base = (options.base || MARKET_API_BASE).replace(/\/$/, '')

  async function request(path: string, init: Parameters<MarketFetch>[1] = {}): Promise<{ status: number; body: any } | null> {
    const controller = typeof AbortController === 'function' ? new AbortController() : null
    const timer = setTimeout(() => controller?.abort(), timeoutMs)
    try {
      const response = await fetchImpl(path.startsWith('http') ? path : `${base}${path}`, {
        ...init,
        ...(controller ? { signal: controller.signal } : {}),
      })
      const body = await response.json().catch(() => null)
      return { status: response.status, body }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  return {
    /** Feature discovery; `null` means "no usable market on this host". */
    async capabilities(): Promise<MarketCapabilities | null> {
      const result = await request('/capabilities')
      const body = asRecord(result?.body)
      if (!result || result.status !== 200 || !body || body.schema !== 'dsh-market/update-api/v1') return null
      const endpoints = asRecord(body.endpoints) || {}
      return {
        marketVersion: asText(body.marketVersion) || '',
        stability: asText(body.stability) || 'beta',
        restartSupported: body.restart?.supported === true,
        endpoints: {
          updates: asText(endpoints.updates) || `${MARKET_API_BASE}/updates`,
          operations: asText(endpoints.operations) || `${MARKET_API_BASE}/operations`,
          restart: asText(endpoints.restart) || `${MARKET_API_BASE}/restart`,
        },
      }
    },

    /** The market's view of the installed vs published version. */
    async check(name: string = MARKET_PACKAGE, force = true): Promise<MarketUpdateInfo | null> {
      const query = `?name=${encodeURIComponent(name)}${force ? '&force=1' : ''}`
      const result = await request(`/updates${query}`)
      const pkg = asRecord(asRecord(result?.body)?.package)
      if (!result || result.status !== 200 || !pkg) return null
      return {
        name: asText(pkg.name) || name,
        source: asText(pkg.source) || 'unknown',
        installedVersion: asText(pkg.installedVersion) || '',
        latestVersion: asText(pkg.latestVersion) || '',
        updateAvailable: pkg.updateAvailable === true,
      }
    },

    /** Queue an update; returns the operation to poll or a stable failure code. */
    async start(name: string = MARKET_PACKAGE, force = false): Promise<MarketStartResult | { error: MarketError }> {
      const result = await request('/updates', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packageName: name, ...(force ? { force: true } : {}) }),
      })
      if (!result) return { error: { code: 'UPDATE_FAILED', message: 'market did not answer', retryable: true } }
      const operation = asRecord(asRecord(result.body)?.operation)
      const operationId = asText(operation?.operationId)
      if ((result.status === 200 || result.status === 202) && operationId) {
        const state = asText(operation?.state)
        return { operationId, state: state === 'queued' || state === 'running' ? state : 'queued' }
      }
      return { error: errorFrom(result.body, `update failed with HTTP ${result.status}`) }
    },

    /** Poll one operation. */
    async operation(operationId: string): Promise<MarketOperationView | null> {
      if (!operationId) return null
      const result = await request(`/operations?operationId=${encodeURIComponent(operationId)}`)
      if (!result || result.status !== 200) return null
      return operationView(asRecord(result.body)?.operation)
    },

    /** Ask the market to restart the host; only offered when capabilities allow it. */
    async restart(): Promise<boolean> {
      const result = await request('/restart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      return result !== null && result.status >= 200 && result.status < 300
    },
  }
}

/** Process-wide market client: one request shape, shared by every panel open. */
export const marketClient = createMarketClient()
