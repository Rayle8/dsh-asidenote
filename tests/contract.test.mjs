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
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-sidebar',
    '@deepseek-ai/dsh-client-ui-workspace',
  ]) {
    assert.ok(manifest.dsh.client.inject.includes(dependency), `missing inject ${dependency}`)
  }
  for (const file of ['client.js', 'index.js', 'cordis.patch.yml', 'icon.svg', 'preview.png', 'preview-dock.png', 'preview-history.png', 'README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(manifest.files.includes(file), `missing files entry ${file}`)
  }
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
  assert.match(client, /ctx\.slots\.inject\('main'/)
  assert.match(client, /ctx\.slots\.inject\('sidebar\.panellist'/)
  assert.match(client, /ctx\.slots\.inject\('conversation\.hero\.options'/)
  assert.match(client, /ctx\.slots\.inject\('conversation\.input\.dock'/)
  assert.match(client, /function HistoryTodoDock/)
  assert.match(client, /props\.session\.blank/)
  assert.match(client, /openTodos/)
  assert.match(client, /dsh-wt-heroBtn/)
  assert.match(client, /document\.head\.appendChild\(style\)/)
  assert.doesNotMatch(client, /h\('style'/)
  assert.match(client, /return \{ inject: \['slots', 'layout'\], apply \}/)
  assert.doesNotMatch(client, /@local\//)
})

test('locale files expose the product name', () => {
  assert.equal(JSON.parse(read('locale/zh.json'))['nav.label'], '一点待办')
  assert.equal(JSON.parse(read('locale/en.json'))['nav.label'], 'Yidian Todos')
  const client = read('client.js')
  assert.match(client, /'title': '一点待办'/)
  assert.match(client, /'dock\.label': '一点待办'/)
})

test('documentation and preview assets are present', () => {
  for (const file of ['README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', 'preview.png', 'preview-dock.png', 'preview-history.png', 'icon.svg']) {
    assert.ok(exists(file), `missing ${file}`)
  }
  assert.ok(fs.statSync(path.join(root, 'preview.png')).size > 1000)
})
