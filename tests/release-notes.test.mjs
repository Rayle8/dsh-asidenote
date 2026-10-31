/**
 * Release-note extraction and parsing, tested against the published-body shape
 * (`tools/release/notes.mjs` wraps each locale block in markers).
 *
 * The module has no imports, so Node's type stripping can load it directly and
 * the test exercises the same source the bundle is built from.
 */
import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MAX_NOTE_GROUPS,
  MAX_NOTE_ITEMS,
  extractUpdateNotes,
  noteLocalesFor,
  noteText,
  parseReleaseNotes,
  splitNoteLead,
  updateNotesForLocale,
} from '../src/client/update/releaseNotes.ts'

const BODY = `# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Update centre:** Check the registry on demand and read the notes inline. (#12)
- **Install:** One click when the market is present.

### Fixed
- **Dot:** The gear dot clears once the build is current.
<!-- app-update-notes:en:end -->

## Install

- npm install dsh-aside-note

# 中文

## 更新内容

<!-- app-update-notes:zh:start -->
### 新增
- **更新中心：** 可以手动检查版本，并在面板内展开更新说明。 （#12）
- **安装：** 检测到市场时可一键更新。

### 修复
- **提示点：** 版本已是最新时不再显示圆点。
<!-- app-update-notes:zh:end -->
`

test('picks the block for the current UI language, with a fallback', () => {
  assert.deepEqual(noteLocalesFor('zh-CN'), ['zh', 'en'])
  assert.deepEqual(noteLocalesFor('en-US'), ['en', 'zh'])
  assert.deepEqual(noteLocalesFor(''), ['en', 'zh'])

  assert.match(extractUpdateNotes(BODY, 'zh'), /更新中心/)
  assert.match(extractUpdateNotes(BODY, 'en'), /Update centre/)
  // A Chinese panel reads the English block when the release shipped one language.
  assert.match(extractUpdateNotes(BODY.replace(/<!-- app-update-notes:zh:start -->[\s\S]*?<!-- app-update-notes:zh:end -->/, ''), 'zh'), /Update centre/)
  // No markers at all (an old release) means no in-app notes.
  assert.equal(extractUpdateNotes('# English\n\n- plain notes\n', 'zh'), '')
  assert.equal(extractUpdateNotes('', 'en'), '')
})

test('parses headings, bullets and bold leads, and flattens markup', () => {
  const groups = updateNotesForLocale(BODY, 'zh')
  assert.equal(groups.length, 2)
  assert.equal(groups[0].title, '新增')
  assert.deepEqual(groups[0].items[0], {
    lead: '更新中心：',
    body: '可以手动检查版本，并在面板内展开更新说明。',
  })
  assert.equal(groups[1].title, '修复')
  assert.equal(groups[1].items[0].lead, '提示点：')
})

test('strips links, inline code, emphasis, HTML and trailing PR references', () => {
  assert.equal(noteText('**A & B:** see [docs](https://example.com) &amp; `code`'), 'A & B: see docs & code')
  assert.equal(noteText('Fix <b>bold</b> tag'), 'Fix bold tag')
  assert.equal(noteText('Item with refs (#12, #13)'), 'Item with refs')
  assert.equal(noteText('Item with refs（#12，#13）'), 'Item with refs')
  assert.equal(noteText('Use _emphasis_ and *stars*'), 'Use emphasis and stars')
  assert.equal(noteText('A colon deep in a sentence is not: a lead'), 'A colon deep in a sentence is not: a lead')
})

test('a long sentence is a body, not a lead', () => {
  const long = 'This sentence keeps going well past forty characters before its colon: rest'
  assert.deepEqual(splitNoteLead(long), { lead: '', body: long })
  assert.deepEqual(splitNoteLead('Short lead: body'), { lead: 'Short lead:', body: 'body' })
})

test('a wrapped bullet continues the previous item', () => {
  const groups = parseReleaseNotes('### 改进\n- First line\n  continues here\n- Second item\n')
  assert.equal(groups[0].items.length, 2)
  assert.equal(groups[0].items[0].body, 'First line continues here')
})

test('caps a malformed release body without dropping whole groups', () => {
  const items = Array.from({ length: 60 }, (_, index) => `- Item ${index}`).join('\n')
  const groups = parseReleaseNotes(`### 新增\n${items}\n### 修复\n- one\n`)
  assert.equal(groups[0].items.length, MAX_NOTE_ITEMS)
  assert.equal(groups.length, 2)

  const many = Array.from({ length: 12 }, (_, index) => `### Group ${index}\n- item`).join('\n')
  assert.equal(parseReleaseNotes(many).length, MAX_NOTE_GROUPS)

  const huge = parseReleaseNotes(`### 新增\n- ${'字'.repeat(900)}\n`)
  assert.ok(huge[0].items[0].body.length <= 600)
  assert.ok(huge[0].items[0].body.endsWith('…'))
})

test('groups without bullets are dropped', () => {
  assert.deepEqual(parseReleaseNotes('### Empty\n\n### 新增\n- real item\n'), [
    { title: '新增', items: [{ lead: '', body: 'real item' }] },
  ])
})
