/**
 * Latest published version probe.
 *
 * The panel is usually installed from a checkout, not from a store, so it asks
 * the npm registry first and falls back to the GitHub Release tag. Everything
 * here is dependency-injected and free of widget state so the contract test can
 * exercise the source order, the one-hour cache and the comparison in Node.
 */
import { PLUGIN_REPO_URL } from '../constants'

/** npm metadata endpoints in fallback order; the mirror covers slow npmjs routes. */
export const UPDATE_REGISTRY_HOSTS = ['https://registry.npmjs.org', 'https://registry.npmmirror.com']

/** Second source: a GitHub Release, for checkouts that are not published to npm. */
export const UPDATE_GITHUB_RELEASE_URL = `${PLUGIN_REPO_URL.replace(
  'https://github.com/',
  'https://api.github.com/repos/',
)}/releases/latest`

/** A resolved version is reused for an hour, including a miss, to keep opens quiet. */
export const UPDATE_TTL_MS = 60 * 60 * 1000

/** The subset of `fetch` the probe needs, so tests can answer without a network. */
export type ProbeFetch = (url: string) => Promise<{ ok: boolean; json: () => Promise<any> }>

export interface UpdateProbeOptions {
  fetchImpl?: ProbeFetch
  now?: () => number
  ttlMs?: number
}

/**
 * Numeric segment comparison, tolerant of a `v` prefix and short forms. A
 * pre-release tag on the same core is not newer ("2.0.0-rc.1" vs "2.0.0").
 */
export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (version: string): number[] =>
    version
      .replace(/^v/, '')
      .split('-', 1)[0]
      .split('.')
      .map(part => parseInt(part, 10) || 0)
  const next = parse(latest)
  const have = parse(current)
  for (let index = 0; index < Math.max(next.length, have.length); index += 1) {
    const a = next[index] || 0
    const b = have[index] || 0
    if (a !== b) return a > b
  }
  return false
}

export function createUpdateProbe(options: UpdateProbeOptions = {}) {
  const fetchImpl: ProbeFetch = options.fetchImpl || (url => fetch(url))
  const now = options.now || (() => Date.now())
  const ttlMs = options.ttlMs || UPDATE_TTL_MS
  let cached: { at: number; promise: Promise<string | null> } | null = null

  function readJson(url: string): Promise<any> {
    // The promise chain also turns a synchronous throw (a host without `fetch`)
    // into the same null answer as a failed request.
    return Promise.resolve()
      .then(() => fetchImpl(url))
      .then(response => (response.ok ? response.json() : null))
      .catch(() => null)
  }

  function readNpmVersion(host: string): Promise<string | null> {
    return readJson(`${host}/dsh-asidenote/latest`).then(body =>
      body !== null && typeof body.version === 'string' ? body.version : null,
    )
  }

  function readGitHubVersion(): Promise<string | null> {
    return readJson(UPDATE_GITHUB_RELEASE_URL).then(body => {
      const tag = body !== null && typeof body.tag_name === 'string' ? body.tag_name : ''
      // Release tags usually carry a `v`; the UI adds its own prefix.
      return tag === '' ? null : tag.replace(/^v/, '')
    })
  }

  function latest(): Promise<string | null> {
    if (cached === null || now() - cached.at >= ttlMs) {
      cached = {
        at: now(),
        promise: (async () => {
          for (const host of UPDATE_REGISTRY_HOSTS) {
            const version = await readNpmVersion(host)
            if (version !== null) return version
          }
          return readGitHubVersion()
        })(),
      }
    }
    return cached.promise
  }

  return { latest }
}

/** Process-wide probe: one fetch per hour no matter how often the panel opens. */
export const updateProbe = createUpdateProbe()

export function fetchLatestVersion(): Promise<string | null> {
  return updateProbe.latest()
}
