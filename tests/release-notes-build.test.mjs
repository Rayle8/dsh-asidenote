/**
 * Release body assembly: CHANGELOG → GitHub Release body → in-app notes.
 *
 * The last assertion is the contract that matters: whatever the release page
 * shows, the panel parses the same text through the same marker convention.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

import { buildReleaseBody, extractLocaleBlock, extractVersionSection } from '../tools/release/notes.mjs'
import { updateNotesForLocale } from '../src/client/update/releaseNotes.ts'

const CHANGELOG = `# Changelog

## 2.1.0

<!-- app-update-notes:en:start -->
### Added
- **Update centre:** Check the registry on demand, read the notes inline and update in place. (#21)

### Fixed
- **Dot:** The gear dot clears once the build is current. (#22)
<!-- app-update-notes:en:end -->

<!-- app-update-notes:zh:start -->
### 新增
- **更新中心：** 可手动检查版本、展开更新说明并就地更新。 （#21）

### 修复
- **提示点：** 版本已是最新时不再显示圆点。 （#22）
<!-- app-update-notes:zh:end -->

## 2.0.1

- Old, marker-free notes.
`

test('extracts exactly one version section', () => {
  const section = extractVersionSection(CHANGELOG, '2.1.0')
  assert.match(section, /Update centre/)
  assert.doesNotMatch(section, /Old, marker-free notes/)
  assert.equal(extractVersionSection(CHANGELOG, '9.9.9'), '')
})

test('builds a bilingual body with install links, markers and the compare link', () => {
  const body = buildReleaseBody({
    changelog: CHANGELOG,
    version: '2.1.0',
    tag: 'v2.1.0',
    prevTag: 'v2.0.1',
    repo: 'Rayle8/dsh-asidenote',
  })
  assert.match(body, /^# English/)
  assert.match(body, /## What's changed/)
  assert.match(body, /# 中文/)
  assert.match(body, /## 更新内容/)
  assert.match(body, /<!-- app-update-notes:en:start -->/)
  assert.match(body, /<!-- app-update-notes:zh:start -->/)
  assert.match(body, /npm install dsh-asidenote@2\.1\.0/)
  assert.match(body, /dsh-asidenote-2\.1\.0\.tgz/)
  assert.match(body, /compare\/v2\.0\.1\.\.\.v2\.1\.0/)
  // The English release page must not swallow the Chinese block, and vice versa.
  assert.equal(extractLocaleBlock(body, 'en').includes('更新中心'), false)
  assert.equal(extractLocaleBlock(body, 'zh').includes('Update centre'), false)
})

test('the panel reads the generated body as groups in both languages', () => {
  const body = buildReleaseBody({
    changelog: CHANGELOG,
    version: '2.1.0',
    tag: 'v2.1.0',
    prevTag: 'v2.0.1',
  })
  const zh = updateNotesForLocale(body, 'zh-CN')
  assert.deepEqual(zh.map(group => group.title), ['新增', '修复'])
  assert.equal(zh[0].items[0].lead, '更新中心：')

  const en = updateNotesForLocale(body, 'en-US')
  assert.deepEqual(en.map(group => group.title), ['Added', 'Fixed'])
  assert.match(en[0].items[0].lead, /Update centre/)
})

test('one missing language falls back to the other', () => {
  const onlyEnglish = CHANGELOG.replace(/<!-- app-update-notes:zh:start -->[\s\S]*?<!-- app-update-notes:zh:end -->/, '')
  const body = buildReleaseBody({ changelog: onlyEnglish, version: '2.1.0' })
  // The page repeats the available language; the panel's zh reader then falls
  // back to the English block, so the card is still populated.
  assert.match(extractLocaleBlock(body, 'en'), /Update centre/)
  assert.equal(updateNotesForLocale(body, 'zh').length, 2)
})

test('a section without markers is rejected, and a missing version throws', () => {
  assert.throws(
    () => buildReleaseBody({ changelog: CHANGELOG, version: '2.0.1' }),
    /no app-update-notes markers/,
  )
  assert.throws(
    () => buildReleaseBody({ changelog: CHANGELOG, version: '3.0.0' }),
    /no section for 3\.0\.0/,
  )
})

test('without a previous tag there is no compare link', () => {
  const body = buildReleaseBody({ changelog: CHANGELOG, version: '2.1.0' })
  assert.doesNotMatch(body, /compare\//)
  assert.doesNotMatch(body, /Full Changelog/)
})
