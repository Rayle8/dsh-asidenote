import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = name => fs.readFileSync(path.join(root, name), 'utf8')
const exists = name => fs.existsSync(path.join(root, name))

test('package declares the DSH bundle and web client halves', () => {
  const manifest = JSON.parse(read('package.json'))
  assert.equal(manifest.name, 'dsh-workspace-todos')
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.exports['.'], './index.js')
  assert.equal(manifest.exports['./client'], './client.js')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.equal(manifest.dsh.client.immediately, true)
  for (const dependency of [
    '@deepseek-ai/dsh-client-locale',
    '@deepseek-ai/dsh-client-ui-chat',
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
    '@deepseek-ai/dsh-client-ui-workspace',
  ]) {
    assert.ok(manifest.dsh.client.inject.includes(dependency), `missing inject ${dependency}`)
  }
  for (const file of ['client.js', 'index.js', 'cordis.patch.yml', 'icon.svg', 'preview.png', 'preview-badge.png', 'preview-history.png', 'preview-right.png', 'README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(manifest.files.includes(file), `missing files entry ${file}`)
  }
})

test('client version matches the package version', () => {
  const manifest = JSON.parse(read('package.json'))
  assert.match(read('client.js'), new RegExp(`PLUGIN_VERSION = '${manifest.version.replace(/\./g, '\\.')}'`))
})

test('patch inserts exactly the package host row', () => {
  const patch = read('cordis.patch.yml')
  assert.match(patch, /- insert:/)
  assert.match(patch, /id: workspace-todos/)
  assert.match(patch, /name: 'dsh-workspace-todos'/)
  assert.doesNotMatch(patch, /@local\//)
})

test('host and browser entries use the package identity', () => {
  assert.match(read('index.js'), /export function apply\(\)/)
  const client = read('client.js')
  assert.match(client, /window\.__ModuleLoader__\.load\(/)
  assert.match(client, /id: 'dsh-workspace-todos'/)
  assert.doesNotMatch(client, /ctx\.slots\.inject\('conversation\.hero\.options'/)
  assert.match(client, /ctx\.slots\.inject\('conversation\.composer\.dock'/)
  assert.doesNotMatch(client, /conversation\.chat\.assistant-actions/)
  assert.match(client, /function MemoPopover/)
  assert.match(client, /refreshHeaderEntry/)
  assert.match(client, /dsh-wt-headerBtn/)
  assert.match(client, /header\.tooltip/)
  assert.match(client, /add\.shortcut/)
  assert.match(client, /data-sidebar-right-panel\]\[data-sidebar-right-open\]/)
  assert.match(client, /DRAFT_STORAGE_KEY/)
  assert.match(client, /saveAddDraft/)
  assert.match(client, /saveEditDraft/)
  assert.match(client, /readEditDraft/)
  assert.match(client, /dsh-wt-listArea/)
  assert.match(client, /SECTION_STATE_KEY/)
  assert.match(client, /readSectionState/)
  assert.match(client, /const bullet = `- \$\{note\}`/)
  assert.match(client, /appendToConversation/)
  assert.match(client, /FORWARD_PREFIX/)
  assert.match(client, /IconForward/)
  assert.match(client, /item\.forward/)
  assert.match(client, /PLUGIN_VERSION/)
  assert.match(client, /settings\.open/)
  assert.match(client, /SEND_SHORTCUT_KEY/)
  assert.match(client, /readForwardPrefix/)
  assert.match(client, /conversation\.session\.header\.utilities|_headerUtilities/)
  assert.match(client, /placement === 'right'|placement === \"right\"/)
  assert.match(client, /BoundSessionCapture/)
  assert.match(client, /dsh-wt-resizeHandle/)
  assert.match(client, /dsh-wt-resizeHandleBottom/)
  assert.match(client, /PANEL_WIDTH_KEY/)
  assert.match(client, /PANEL_HEIGHT_KEY/)
  assert.match(client, /startPanelResize/)
  assert.match(client, /startPanelHeightResize/)
  assert.doesNotMatch(client, /refreshMemoBadges/)
  assert.doesNotMatch(client, /BoundDock/)
  assert.match(client, /ReactDOMClient\.createRoot/)
  assert.match(client, /function IconCopy/)
  assert.match(client, /copyText/)
  assert.match(client, /item\.copied/)
  assert.match(client, /dsh-wt-copied/)
  assert.match(client, /SESSION_STORAGE_KEY/)
  assert.match(client, /dsh\.session-memos\.v1/)
  assert.doesNotMatch(client, /selectPanel/)
  assert.match(client, /document\.head\.appendChild\(style\)/)
  assert.doesNotMatch(client, /h\('style'/)
  assert.match(client, /return \{ inject: \['slots'\], apply \}/)
  assert.doesNotMatch(client, /@local\//)
})

test('locale files expose the product name', () => {
  assert.equal(JSON.parse(read('locale/zh.json'))['nav.label'], '便笺')
  assert.equal(JSON.parse(read('locale/en.json'))['nav.label'], 'Notes')
  const client = read('client.js')
  assert.match(client, /'title': '便笺'/)
  assert.match(client, /'dock\.label': '便笺'/)
  assert.match(client, /'badge\.label': '便笺'/)
})

test('documentation and preview assets are present', () => {
  for (const file of ['README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', 'preview.png', 'preview-badge.png', 'preview-history.png', 'preview-right.png', 'icon.svg']) {
    assert.ok(exists(file), `missing ${file}`)
  }
  assert.ok(fs.statSync(path.join(root, 'preview.png')).size > 1000)
})
