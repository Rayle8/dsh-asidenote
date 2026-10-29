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
  assert.match(client, /dsh-wt-listSection/)
  assert.match(client, /position:sticky/)
  assert.match(client, /dsh-wt-checkHalf/)
  assert.match(client, /HALF_DONE_DELAY/)
  assert.match(client, /FORWARDED_STORAGE_KEY/)
  assert.match(client, /dsh-wt-checkForwarded/)
  assert.match(client, /item\.pendingCountdown/)
  assert.match(client, /HALF_DONE_COUNTDOWN/)
  assert.match(client, /edit\.hintEnter/)
  assert.match(client, /settings\.halfCheck/)
  assert.match(client, /settings\.forwardCheck/)
  assert.match(client, /settings\.forwardPrefixItem/)
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

test('done notes show created and completed ages, newest completion first', () => {
  const client = read('client.js')
  assert.match(client, /'time\.createdDone': '\{created\}创建，\{completed\}完成'/)
  assert.match(client, /'time\.createdDone': 'Created \{created\} · Completed \{completed\}'/)
  assert.match(client, /function completedStamp/)
  assert.match(client, /function compareDoneItems/)
  assert.match(client, /function metaLabel/)
  // Both the panel and the popover must agree on the order.
  assert.equal([...client.matchAll(/items\.filter\(item => item\.done\)\.sort\(compareDoneItems\)/g)].length, 2)
})

test('documentation and preview assets are present', () => {
  for (const file of ['README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', 'preview.png', 'preview-badge.png', 'preview-history.png', 'preview-right.png', 'icon.svg']) {
    assert.ok(exists(file), `missing ${file}`)
  }
  assert.ok(fs.statSync(path.join(root, 'preview.png')).size > 1000)
})

/** The stylesheet is a string array; flatten it back into CSS for inspection. */
function readCss() {
  const client = read('client.js')
  const start = client.indexOf('const CSS = [')
  const end = client.indexOf("].join('')", start)
  assert.ok(start > 0 && end > start, 'CSS array not found')
  return [...client.slice(start, end).matchAll(/'(?:[^'\\]|\\.)*'/g)]
    .map(match => match[0].slice(1, -1).replace(/\\'/g, "'"))
    .join('')
}

test('colours come from the three-role token layer', () => {
  const css = readCss()
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'raw hex colours belong in tokens, not rules')
  assert.doesNotMatch(css, /\b(?:rgba?|hsla?)\(/i, 'raw colour functions belong in tokens')
  const ramp = [...css.matchAll(/--wt-n-(\d+):/g)].map(match => match[1])
  assert.deepEqual(ramp, ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'])
  for (const token of ['--wt-success', '--wt-warn', '--wt-danger', '--wt-accent']) {
    assert.ok(css.includes(`${token}:`), `missing semantic token ${token}`)
  }
  // The accent is reserved for the primary path: add, complete, selected setting.
  const accentUses = [...css.matchAll(/background:var\(--wt-accent\)/g)].length
  assert.ok(accentUses <= 6, `accent leaks into ${accentUses} fills`)
})

test('list scrollbar stays on the panel edge without shrinking cards', () => {
  const css = readCss()
  const viewport = css.match(/\.dsh-wt-listViewport\{([^}]*)\}/)
  const rule = css.match(/\.dsh-wt-listArea\{([^}]*)\}/)
  assert.ok(viewport, 'missing listViewport rule')
  assert.ok(rule, 'missing listArea rule')
  assert.match(viewport[1], /margin-right:calc\(var\(--wt-space-4\) \* -1\)/, 'the viewport must reach the panel edge')
  assert.match(rule[1], /padding-right:calc\(var\(--wt-space-4\) - 4px\)/, 'listArea must compensate the scrollbar width')
  assert.match(rule[1], /scrollbar-gutter:stable/, 'the gutter must stay reserved in both states')
  assert.doesNotMatch(rule[1], /scrollbar-width:/, 'scrollbar-width would override the 4px webkit thumb')
  assert.match(css, /\.dsh-wt-listArea::-webkit-scrollbar\{width:4px;height:4px\}/, 'scrollbar must stay thin')
})

test('note list edges use a fixed frosted blur', () => {
  const css = readCss()
  assert.match(css, /\.dsh-wt-listViewport\{[^}]*position:relative/, 'the blur needs a positioned viewport')
  assert.match(css, /\.dsh-wt-listViewport::before,\.dsh-wt-listViewport::after\{[^}]*backdrop-filter:blur\(4px\)/, 'missing edge blur')
  assert.match(css, /\.dsh-wt-listViewport::before,\.dsh-wt-listViewport::after\{[^}]*right:4px/, 'the blur must leave the scrollbar crisp')
  assert.match(css, /\.dsh-wt-listViewport::before\{top:calc\(var\(--wt-space-6\) \+ var\(--wt-space-1\)\)\}/, 'the top blur must start below the sticky header')
  assert.match(css, /\.dsh-wt-listViewport::after\{[^}]*bottom:0/, 'the bottom blur must stay at the edge')
})

test('settings read as a full-bleed separator band, not a card', () => {
  const css = readCss()
  const rule = css.match(/\.dsh-wt-settings\{([^}]*)\}/)
  assert.ok(rule, 'missing settings rule')
  assert.match(rule[1], /margin:0 calc\(var\(--wt-space-4\) \* -1\)/, 'settings must span the panel width')
  assert.match(rule[1], /border-top:1px solid var\(--wt-line\)/, 'settings need a top separator')
  assert.match(rule[1], /border-bottom:1px solid var\(--wt-line\)/, 'settings need a bottom separator')
  assert.doesNotMatch(rule[1], /border-radius:/, 'settings must not be a card')
  assert.doesNotMatch(rule[1], /box-shadow:/, 'settings must not float')
  assert.match(css, /\.dsh-wt-settingsHead::after\{[^}]*background:var\(--wt-line\)\}/, 'the heading needs its rule')
})

test('section toggles stay inside the scroll clip', () => {
  const css = readCss()
  assert.doesNotMatch(css, /\.dsh-wt-popover \.dsh-wt-sectionHead \.dsh-wt-doneToggle\{/, 'the toggle must not be pulled outside the clip')
})

test('type scale and weight set stay small', () => {
  const css = readCss()
  const sizes = [...new Set([...css.matchAll(/font-size:([^;}]+)/g)].map(match => match[1].trim()))]
  for (const size of sizes) assert.match(size, /^var\(--wt-fs-(?:caption|body-sm|body|heading|display)\)$/)
  const tokens = [...new Set([...css.matchAll(/--wt-fs-[a-z-]+:([0-9.]+)px/g)].map(match => Number(match[1])))]
  assert.deepEqual(tokens.sort((a, b) => a - b), [10, 12.5, 15.5, 19.5, 24.5])
  for (let i = 1; i < tokens.length; i += 1) {
    const ratio = tokens[i] / tokens[i - 1]
    assert.ok(Math.abs(ratio - 1.25) < 0.03, `${tokens[i - 1]} -> ${tokens[i]} is x${ratio.toFixed(3)}`)
  }
  const weights = [...new Set([...css.matchAll(/font-weight:([0-9]+)/g)].map(match => match[1]))]
  assert.ok(weights.length <= 3, `too many weights: ${weights.join(', ')}`)
})

test('spacing snaps to the 4px scale', () => {
  const css = readCss()
  // 1px hairlines and 2px optical offsets are allowed; everything else snaps.
  const scale = new Set(['0', '1px', '2px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px', 'auto', '100%'])
  for (const match of css.matchAll(/(?:^|[;{])(?:padding|margin|gap)(?:-[a-z]+)?:([^;}]+)/g)) {
    const value = match[1].trim()
    if (value.includes('var(') || value.includes('calc(') || value.includes('inset')) continue
    for (const part of value.split(/\s+/)) {
      assert.ok(scale.has(part) || /^-\d+px$/.test(part), `off-scale spacing "${value}"`)
    }
  }
})

test('radii, shadows and motion stay tokenised', () => {
  const css = readCss()
  const radii = [...new Set([...css.matchAll(/border-radius:([^;}]+)/g)].map(match => match[1].trim()))].sort()
  assert.deepEqual(radii, ['var(--wt-radius-md)', 'var(--wt-radius-pill)', 'var(--wt-radius-sm)'])
  assert.doesNotMatch(css, /box-shadow:(?!\s*(?:var\(|inset ))/, 'hand-written shadows are not allowed')
  const animations = [...css.matchAll(/@keyframes [^{]+\{([^@]*)\}\}/g)].map(match => match[1])
  for (const frames of animations) {
    const props = [...frames.matchAll(/([a-z-]+):/g)].map(match => match[1])
    for (const prop of props) assert.ok(['opacity', 'transform'].includes(prop), `animates ${prop}`)
  }
  for (const match of css.matchAll(/transition:[^;}]+/g)) {
    const value = match[0]
    assert.doesNotMatch(value, /(?<!var\(--wt-dur)[^)]\b\d+m?s\b/, `untokenised duration in "${value}"`)
  }
})

