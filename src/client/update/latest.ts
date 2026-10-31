/**
 * Published-version probes: the version number and the release notes behind it.
 *
 * The panel is usually installed from a checkout, not from a store, so it asks
 * the npm registry first and falls back to the GitHub Release tag. Everything
 * here is dependency-injected and free of widget state so the contract test can
 * exercise the source order, the one-hour cache and the comparison in Node.
 */
import { PLUGIN_REPO_URL } from '../constants'

/** npm metadata endpoints in fallback order; the mirror covers slow npmjs routes. */
export const UPDATE_REGISTRY_HOSTS = ['https://registry.npmjs.org', 'https://registry.npmmirror.com']

/** GitHub's REST host for this repo, derived from the displayed repo URL. */
export const UPDATE_GITHUB_API = `${PLUGIN_REPO_URL.replace(
  'https://github.com/',
  'https://api.github.com/repos/',
)}/releases`

/** Second source: a GitHub Release, for checkouts that are not published to npm. */
export const UPDATE_GITHUB_RELEASE_URL = `${UPDATE_GITHUB_API}/latest`

/** A resolved version is reused for an hour, including a miss, to keep opens quiet. */
export const UPDATE_TTL_MS = 60 * 60 * 1000

/** A manual check should not hang the panel on a black-holed network. */
export const UPDATE_TIMEOUT_MS = 8000

/** The subset of `fetch` the probe needs, so tests can answer without a network. */
export type ProbeFetch = (
  url: string,
  init?: { signal?: any },
) => Promise<{ ok: boolean; json: () => Promise<any> }>

export interface UpdateProbeOptions {
  fetchImpl?: ProbeFetch
  now?: () => number
  ttlMs?: number
}

/** Release notes for one published version, as the panel renders them. */
export interface ReleaseNotes {
  version: string
  /** The full release body; the panel extracts its locale block. */
  body: string
  /** Link to the full release page, opened by "full release notes". */
  url: string
}

export interface ReleaseNotesProbeOptions extends UpdateProbeOptions {}

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

/** A fetch that gives up after {@link UPDATE_TIMEOUT_MS} instead of hanging. */
function fetchWithTimeout(fetchImpl: ProbeFetch, url: string): Promise<{ ok: boolean; json: () => Promise<any> }> {
  if (typeof AbortController !== 'function') return Promise.resolve().then(() => fetchImpl(url))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPDATE_TIMEOUT_MS)
  return Promise.resolve()
    .then(() => fetchImpl(url, { signal: controller.signal }))
    .finally(() => clearTimeout(timer))
}

export function createUpdateProbe(options: UpdateProbeOptions = {}) {
  const fetchImpl: ProbeFetch = options.fetchImpl || ((url, init) => fetch(url, init))
  const now = options.now || (() => Date.now())
  const ttlMs = options.ttlMs || UPDATE_TTL_MS
  let cached: { at: number; promise: Promise<string | null> } | null = null

  function readJson(url: string): Promise<any> {
    // The promise chain also turns a synchronous throw (a host without `fetch`)
    // into the same null answer as a failed request.
    return fetchWithTimeout(fetchImpl, url)
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

  /** Drop the cached answer so the next call reads the network again. */
  function reset() {
    cached = null
  }

  return { latest, reset }
}

/** Process-wide probe: one fetch per hour no matter how often the panel opens. */
export const updateProbe = createUpdateProbe()

export function fetchLatestVersion(): Promise<string | null> {
  return updateProbe.latest()
}

function readJsonWithTimeout(fetchImpl: ProbeFetch, url: string): Promise<any> {
  return fetchWithTimeout(fetchImpl, url)
    .then(response => (response.ok ? response.json() : null))
    .catch(() => null)
}

/**
 * Fetch the release notes for one version. GitHub is the only source: the body
 * lives on the release, not in the npm manifest. A missing release (tags pushed
 * without a Release) resolves null, and the panel keeps the release link.
 */
export function createReleaseNotesProbe(options: ReleaseNotesProbeOptions = {}) {
  const fetchImpl: ProbeFetch = options.fetchImpl || ((url, init) => fetch(url, init))
  const now = options.now || (() => Date.now())
  const ttlMs = options.ttlMs || UPDATE_TTL_MS
  const cached = new Map<string, { at: number; promise: Promise<ReleaseNotes | null> }>()

  function latest(version: string): Promise<ReleaseNotes | null> {
    const key = String(version || '').replace(/^v/, '')
    const hit = cached.get(key)
    if (hit && now() - hit.at < ttlMs) return hit.promise
    const entry = {
      at: now(),
      promise: readJsonWithTimeout(fetchImpl, `${UPDATE_GITHUB_API}/tags/v${encodeURIComponent(key)}`).then(body => {
        if (body === null) return null
        const tag = typeof body.tag_name === 'string' ? body.tag_name.replace(/^v/, '') : key
        return {
          version: tag,
          body: typeof body.body === 'string' ? body.body : '',
          url: typeof body.html_url === 'string' && body.html_url
            ? body.html_url
            : `${PLUGIN_REPO_URL}/releases/tag/v${encodeURIComponent(tag)}`,
        }
      }),
    }
    cached.set(key, entry)
    return entry.promise
  }

  function reset() {
    cached.clear()
  }

  return { latest, reset }
}

/** Process-wide notes probe, cached per version for an hour. */
export const releaseNotesProbe = createReleaseNotesProbe()

export function fetchReleaseNotes(version: string): Promise<ReleaseNotes | null> {
  return releaseNotesProbe.latest(version)
}

/** Manual check: forget both cached answers so the next calls hit the network. */
export function resetUpdateChecks() {
  updateProbe.reset()
  releaseNotesProbe.reset()
}
