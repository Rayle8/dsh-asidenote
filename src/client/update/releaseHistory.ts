/**
 * Which published releases belong in the update card.
 *
 * A user can sit several versions behind, so the card lists every release
 * between the running build and the published one instead of only the newest —
 * a 2.0.0 install upgrading to 2.3.0 should see 2.1.0, 2.2.0 and 2.3.0, newest
 * first. The list comes from GitHub's releases feed; drafts and prereleases are
 * skipped because stable users are never offered them.
 *
 * Pure and dependency free so the selection rules can be tested directly.
 */

/** One release as the panel needs it. */
export interface ReleaseEntry {
  version: string
  body: string
  url: string
  publishedAt: string
}

/** The releases to show, plus whether older ones were cut off. */
export interface ReleaseHistory {
  entries: ReleaseEntry[]
  truncated: boolean
}

/** Enough history to explain a long gap without turning the card into a feed. */
export const MAX_RELEASE_HISTORY = 6

export interface ReleaseHistoryQuery {
  current: string
  latest: string
  max?: number
}

function core(version: string): number[] {
  return String(version ?? '')
    .replace(/^v/i, '')
    .split('-', 1)[0]
    .split('.')
    .map(part => Number.parseInt(part, 10) || 0)
}

/** Numeric comparison of two versions; prerelease suffixes compare as the core. */
export function compareVersions(a: string, b: string): number {
  const left = core(a)
  const right = core(b)
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const difference = (left[index] || 0) - (right[index] || 0)
    if (difference !== 0) return difference > 0 ? 1 : -1
  }
  return 0
}

/** A plain `x.y.z` tag, with the `v` prefix and whitespace removed. */
export function normalizeVersion(version: string): string {
  const normalized = String(version ?? '').trim().replace(/^v/i, '')
  return /^\d+(\.\d+)*$/.test(normalized) ? normalized : ''
}

/**
 * Filter the feed down to the releases the user is about to receive:
 * newer than `current`, not newer than `latest`, newest first, capped.
 */
export function selectReleaseHistory(list: unknown, query: ReleaseHistoryQuery): ReleaseHistory {
  const max = query.max && query.max > 0 ? query.max : MAX_RELEASE_HISTORY
  const seen = new Set<string>()
  const entries: ReleaseEntry[] = []

  for (const item of Array.isArray(list) ? list : []) {
    const release = item as Record<string, any> | null
    if (!release || typeof release !== 'object') continue
    if (release.prerelease === true || release.draft === true) continue
    const version = normalizeVersion(typeof release.version === 'string' ? release.version : release.tag_name)
    if (!version || seen.has(version)) continue
    if (compareVersions(version, query.current) <= 0) continue
    if (query.latest && compareVersions(version, query.latest) > 0) continue
    seen.add(version)
    const url = release.url ?? release.html_url
    const publishedAt = release.publishedAt ?? release.published_at
    entries.push({
      version,
      body: typeof release.body === 'string' ? release.body : '',
      url: typeof url === 'string' ? url : '',
      publishedAt: typeof publishedAt === 'string' ? publishedAt : '',
    })
  }

  entries.sort((a, b) => compareVersions(b.version, a.version))
  return {
    entries: entries.slice(0, max),
    truncated: entries.length > max,
  }
}
