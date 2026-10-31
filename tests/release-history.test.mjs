/**
 * Release-history selection: which releases a multi-version jump shows, in what
 * order, and what gets cut off.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MAX_RELEASE_HISTORY,
  compareVersions,
  normalizeVersion,
  selectReleaseHistory,
} from '../src/client/update/releaseHistory.ts'

const feed = [
  { version: 'v2.3.0', body: 'newest', url: 'https://example.test/2.3.0' },
  { version: 'v2.2.0', body: 'middle', url: 'https://example.test/2.2.0' },
  { version: 'v2.1.0', body: 'current', url: 'https://example.test/2.1.0' },
  { version: 'v2.0.1', body: 'older', url: 'https://example.test/2.0.1' },
  { version: 'v2.4.0-beta.1', body: 'prerelease', prerelease: true },
  { version: 'v2.5.0', body: 'draft', draft: true },
]

test('keeps the releases between the running build and the published one', () => {
  const history = selectReleaseHistory(feed, { current: '2.1.0', latest: '2.3.0' })
  assert.deepEqual(history.entries.map(entry => entry.version), ['2.3.0', '2.2.0'])
  assert.equal(history.truncated, false)
  assert.equal(history.entries[0].url, 'https://example.test/2.3.0')
  assert.equal(history.entries[1].body, 'middle')
})

test('skips drafts, prereleases and versions outside the gap', () => {
  const history = selectReleaseHistory(feed, { current: '2.0.0', latest: '2.2.0' })
  assert.deepEqual(history.entries.map(entry => entry.version), ['2.2.0', '2.1.0', '2.0.1'])
  assert.equal(history.entries.some(entry => entry.version === '2.4.0-beta.1'), false)
  assert.equal(history.entries.some(entry => entry.version === '2.5.0'), false)
})

test('accepts tag_name/publication shapes and de-duplicates versions', () => {
  const history = selectReleaseHistory([
    { tag_name: 'v2.2.0', body: 'a', html_url: 'https://example.test/a', published_at: '2026-01-02' },
    { tag_name: '2.2.0', body: 'duplicate', html_url: 'https://example.test/b' },
    { tag_name: 'v2.1.5', body: 'b', html_url: 'https://example.test/c' },
  ], { current: '2.1.0', latest: '2.2.0' })
  assert.deepEqual(history.entries.map(entry => entry.version), ['2.2.0', '2.1.5'])
  assert.equal(history.entries[0].publishedAt, '2026-01-02')
})

test('caps the list and reports that older releases were cut off', () => {
  const many = Array.from({ length: 9 }, (_, index) => ({
    version: `2.${index + 1}.0`,
    body: `notes ${index + 1}`,
  }))
  const history = selectReleaseHistory(many, { current: '2.0.0', latest: '2.9.0' })
  assert.equal(history.entries.length, MAX_RELEASE_HISTORY)
  assert.equal(history.truncated, true)
  assert.equal(history.entries[0].version, '2.9.0')
  assert.equal(history.entries.at(-1).version, '2.4.0')
})

test('invalid versions and non-arrays are ignored', () => {
  const history = selectReleaseHistory([
    { version: 'latest' },
    { version: '' },
    null,
    { version: '2.2.0' },
  ], { current: '2.1.0', latest: '2.2.0' })
  assert.deepEqual(history.entries.map(entry => entry.version), ['2.2.0'])
  assert.deepEqual(selectReleaseHistory(null, { current: '1.0.0', latest: '2.0.0' }), {
    entries: [],
    truncated: false,
  })
})

test('compares numeric segments and normalises tags', () => {
  assert.equal(compareVersions('2.10.0', '2.9.9'), 1)
  assert.equal(compareVersions('2.0.0', '2.0.0'), 0)
  assert.equal(compareVersions('1.9.9', '2.0.0'), -1)
  assert.equal(compareVersions('v2.1.0', '2.1.0'), 0)
  assert.equal(normalizeVersion(' v2.1.0 '), '2.1.0')
  assert.equal(normalizeVersion('nightly'), '')
})
