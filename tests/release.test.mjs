import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  NEXT_HEADING,
  checkNextReleased,
  compareVersions,
  extractSection,
  parseStatusPaths,
  prepareChangelog,
  splitSections,
} from '../tools/release.mjs'

const CHANGELOG = `# Changelog

## next-released

- Fix A.
- Fix B.

## 2.0.1

- Shipped.

## 2.0.0

- Older.
`

test('splitSections keeps each section body and its order', () => {
  const sections = splitSections(CHANGELOG)
  assert.deepEqual(
    sections.map((section) => section.title),
    ['next-released', '2.0.1', '2.0.0'],
  )
  assert.equal(sections[0].body, '- Fix A.\n- Fix B.')
  assert.equal(sections[1].body, '- Shipped.')
})

test('extractSection stops at the next version heading', () => {
  assert.equal(extractSection(CHANGELOG, '2.0.1'), '- Shipped.')
  assert.equal(extractSection(CHANGELOG, 'next-released'), '- Fix A.\n- Fix B.')
})

test('extractSection rejects a missing or empty section', () => {
  assert.throws(() => extractSection(CHANGELOG, '9.9.9'), /has no "## 9\.9\.9" section/)
  assert.throws(
    () => extractSection('## 2.0.2\n\n## 2.0.1\n\n- Shipped.\n', '2.0.2'),
    /"## 2\.0\.2" section is empty/,
  )
})

test('checkNextReleased requires next-released at the top', () => {
  assert.equal(checkNextReleased(CHANGELOG).title, NEXT_HEADING)
  assert.throws(
    () => checkNextReleased('## 2.0.1\n\n- Shipped.\n'),
    /must start with "## next-released"/,
  )
})

test('prepareChangelog renames next-released and inserts a fresh placeholder', () => {
  const prepared = prepareChangelog(CHANGELOG, '2.1.0')
  assert.equal(
    prepared,
    `# Changelog

## next-released

## 2.1.0

- Fix A.
- Fix B.

## 2.0.1

- Shipped.

## 2.0.0

- Older.
`,
  )
  assert.equal(checkNextReleased(prepared).title, NEXT_HEADING)
  assert.equal(checkNextReleased(prepared).body, '')
  assert.equal(extractSection(prepared, '2.1.0'), '- Fix A.\n- Fix B.')
  assert.equal(extractSection(prepared, '2.0.1'), '- Shipped.')
})

test('prepareChangelog refuses an empty next-released section', () => {
  assert.throws(
    () => prepareChangelog('## next-released\n\n## 2.0.1\n\n- Shipped.\n', '2.1.0'),
    /is empty; write the release notes/,
  )
})

test('parseStatusPaths keeps the filename when the index column is blank', () => {
  assert.deepEqual(parseStatusPaths(' M CHANGELOG.md\nM  package.json\n'), [
    'CHANGELOG.md',
    'package.json',
  ])
})

test('compareVersions orders stable and prerelease versions', () => {
  assert.equal(compareVersions('2.1.0', '2.0.1'), 1)
  assert.equal(compareVersions('2.1.0', '2.1.0'), 0)
  assert.equal(compareVersions('2.0.1', '2.1.0'), -1)
  assert.equal(compareVersions('2.1.0-beta.1', '2.1.0'), -1)
  assert.equal(compareVersions('2.1.0', '2.1.0-beta.9'), 1)
  assert.equal(compareVersions('2.1.0-beta.2', '2.1.0-beta.1'), 1)
  assert.equal(compareVersions('2.1.0-beta.10', '2.1.0-beta.9'), 1)
})
