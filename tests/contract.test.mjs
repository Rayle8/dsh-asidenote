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
  assert.equal(manifest.name, 'dsh-asidenote')
  assert.equal(manifest.type, 'module')
  assert.equal(manifest.exports['.'], './index.js')
  assert.equal(manifest.exports['./client'], './client/client.js')
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
  for (const file of ['client/client.js', 'index.js', 'cordis.patch.yml', 'icon.svg', 'docs/assets', 'README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md']) {
    assert.ok(manifest.files.includes(file), `missing files entry ${file}`)
  }
})

test('client version matches the package version', () => {
  const manifest = JSON.parse(read('package.json'))
  assert.match(read('src/client/constants.ts'), new RegExp(`PLUGIN_VERSION = '${manifest.version.replace(/\./g, '\\.')}'`))
})

test('the client checks for a newer release and links to the release notes', () => {
  const client = readClientTree()
  const css = readCss()
  assert.match(client, /https:\/\/registry\.npmjs\.org/)
  assert.match(client, /https:\/\/registry\.npmmirror\.com/)
  assert.match(client, /api\.github\.com\/repos/)
  assert.match(client, /dsh-asidenote\/latest/)
  assert.match(client, /tag_name/)
  assert.match(client, /export const PLUGIN_RELEASES_URL = `\$\{PLUGIN_REPO_URL\}\/releases\/latest`/)
  assert.match(client, /export function createUpdateProbe/)
  assert.match(client, /export function isNewerVersion/)
  assert.match(client, /export function useNewerVersion/)
  assert.match(client, /const newerVersion = useNewerVersion\(\)/)
  assert.match(client, /PLUGIN_VERSION\.includes\('-'\)/)
  assert.match(client, /href: PLUGIN_RELEASES_URL/)
  assert.match(client, /'update\.tip'/)
  assert.match(css, /\.dsh-an-updateDot\{/)
  assert.match(css, /\.dsh-an-settingUpdate\{/)
  assert.match(css, /\.dsh-an-settingUpdate:hover\{[^}]*var\(--an-hover\)/)
  assert.match(read('client/client.js'), /function createUpdateProbe/, 'the shipped bundle carries the check')
  // Read-only check: it installs and executes nothing.
  assert.doesNotMatch(client, /npm install|dsh plugin update|child_process|exec\(/)
})

test('the update probe falls back from npm to the mirror and GitHub, and caches both hits and misses', async () => {
  const { createUpdateProbe, isNewerVersion } = readUpdateHelpers()
  const hour = 60 * 60 * 1000
  const calls = []
  let now = 1000
  const probe = createUpdateProbe({
    fetchImpl: async url => {
      calls.push(url)
      if (url.startsWith('https://registry.npmjs.org/')) throw new Error('offline')
      return { ok: true, json: async () => ({ version: '2.1.0' }) }
    },
    now: () => now,
    ttlMs: hour,
  })
  assert.equal(await probe.latest(), '2.1.0')
  assert.deepEqual(calls, [
    'https://registry.npmjs.org/dsh-asidenote/latest',
    'https://registry.npmmirror.com/dsh-asidenote/latest',
  ], 'npm is consulted first and the mirror is the fallback')
  calls.length = 0
  now += hour - 1
  assert.equal(await probe.latest(), '2.1.0')
  assert.equal(calls.length, 0, 'a version inside the TTL is reused')
  now += 1
  await probe.latest()
  assert.equal(calls.length, 2, 'the TTL expiry reads the registry again')

  const releaseCalls = []
  const releaseOnly = createUpdateProbe({
    fetchImpl: async url => {
      releaseCalls.push(url)
      if (url.startsWith('https://api.github.com/')) {
        return { ok: true, json: async () => ({ tag_name: 'v2.1.2' }) }
      }
      return { ok: false, json: async () => ({}) }
    },
    now: () => 0,
    ttlMs: hour,
  })
  assert.equal(await releaseOnly.latest(), '2.1.2', 'a GitHub Release backs a checkout that is not on npm, with its v prefix stripped')
  assert.deepEqual(releaseCalls, [
    'https://registry.npmjs.org/dsh-asidenote/latest',
    'https://registry.npmmirror.com/dsh-asidenote/latest',
    'https://api.github.com/repos/Rayle8/dsh-asidenote/releases/latest',
  ], 'GitHub is consulted only after both npm hosts miss')

  let offline = true
  const flaky = createUpdateProbe({
    fetchImpl: async () => {
      if (offline) throw new Error('offline')
      return { ok: true, json: async () => ({ version: '2.1.1' }) }
    },
    now: () => 0,
    ttlMs: hour,
  })
  assert.equal(await flaky.latest(), null, 'an unreachable registry resolves null')
  offline = false
  assert.equal(await flaky.latest(), null, 'the miss is cached too, so repeated opens make no request')

  assert.equal(isNewerVersion('2.1.0', '2.0.0'), true)
  assert.equal(isNewerVersion('v3.0.0', '2.0.0'), true)
  assert.equal(isNewerVersion('2.0.0', '2.0.0'), false)
  assert.equal(isNewerVersion('1.9.9', '2.0.0'), false)
  assert.equal(isNewerVersion('2.1', '2.0.9'), true)
  assert.equal(isNewerVersion('2.1.0-rc.1', '2.1.0'), false)
  assert.equal(isNewerVersion('x.y', '0.0.0'), false)
})

test('patch inserts exactly the package host row', () => {
  const patch = read('cordis.patch.yml')
  assert.match(patch, /- insert:/)
  assert.match(patch, /id: dsh-asidenote/)
  assert.match(patch, /name: 'dsh-asidenote'/)
  assert.doesNotMatch(patch, /@local\//)
})

test('the browser half never reaches for Node globals', () => {
  // tsconfig now carries Node types for the build config; this keeps them out
  // of the bundle, where `process` happens to exist under the jsdom test.
  const tree = readClientTree()
  assert.doesNotMatch(tree, /from ['"]node:/, 'client code must not import Node builtins')
  assert.doesNotMatch(tree, /\bprocess\.[a-z]/, 'client code must not read process')
  assert.doesNotMatch(tree, /\bBuffer\b/, 'client code must not use Buffer')
})

test('host and browser entries use the package identity', () => {
  assert.match(read('index.js'), /export function apply\(\)/)
  // The client half is several modules now; identity checks span the tree.
  const client = readClientTree()
  // The loader shell is now emitted by tsdown, not hand-written in the source.
  const bundle = read('client/client.js')
  assert.match(bundle, /^window\.__ModuleLoader__\.load\(/)
  assert.match(bundle, /id: "dsh-asidenote"/)
  assert.match(bundle, /return module\.exports; \} \}\);/)
  assert.doesNotMatch(client, /__ModuleLoader__/, 'the source must not carry a hand-written shell')
  assert.doesNotMatch(client, /ctx\.slots\.inject\('conversation\.hero\.options'/)
  assert.match(client, /ctx\.slots\.inject\('conversation\.composer\.dock'/)
  assert.doesNotMatch(client, /conversation\.chat\.assistant-actions/)
  assert.match(client, /function MemoPopover/)
  assert.match(client, /refreshHeaderEntry/)
  assert.match(client, /dsh-an-headerBtn/)
  assert.match(client, /header\.tooltip/)
  assert.match(client, /add\.shortcut/)
  assert.match(client, /data-sidebar-right-panel\]\[data-sidebar-right-open\]/)
  assert.match(client, /DRAFT_STORAGE_KEY/)
  assert.match(client, /saveAddDraft/)
  assert.match(client, /saveEditDraft/)
  assert.match(client, /readEditDraft/)
  assert.match(client, /dsh-an-listArea/)
  assert.match(client, /dsh-an-listSection/)
  // Sticky heads stay transparent in flow and only take the panel's raised
  // surface while pinned, so no differently coloured block sits at rest.
  assert.match(readCss(), /\.dsh-an-sectionHead,\.dsh-an-doneHead\{[^}]*position:sticky[^}]*top:0[^}]*background:transparent/)
  assert.match(readCss(), /\[data-stuck\][^{]*\{[^}]*background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  assert.match(client, /FORWARDED_STORAGE_KEY/)
  assert.match(client, /dsh-an-forwardMark/)
  assert.match(client, /item\.forwarded/)
  assert.doesNotMatch(client, /dsh-an-checkHalf|dsh-an-checkForwarded|HALF_DONE_|item\.pendingCountdown|settings\.halfCheck/)
  assert.match(client, /edit\.hintEnter/)
  assert.doesNotMatch(client, /settings\.forward(?:Check|Mark)/, 'the stale forward-mark description is gone')
  assert.match(client, /settings\.forwardPrefixItem/)
  assert.match(client, /SECTION_STATE_KEY/)
  assert.match(client, /readSectionState/)
  assert.match(client, /const bullet = `- \$\{note\}`/)
  assert.match(client, /appendToConversation/)
  assert.match(client, /'forward\.prefix'/)
  assert.match(client, /IconForward/)
  assert.match(client, /item\.forward/)
  assert.match(client, /PLUGIN_VERSION/)
  assert.match(client, /settings\.open/)
  assert.match(client, /SEND_SHORTCUT_KEY/)
  assert.match(client, /readForwardPrefix/)
  assert.match(client, /conversation\.session\.header\.utilities|_headerUtilities/)
  assert.match(client, /placement === 'right'|placement === "right"/)
  assert.match(client, /BoundSessionCapture/)
  assert.match(client, /dsh-an-resizeHandle/)
  assert.match(client, /dsh-an-resizeHandleBottom/)
  assert.match(client, /PANEL_WIDTH_KEY/)
  assert.match(client, /PANEL_HEIGHT_KEY/)
  assert.match(client, /startPanelResize/)
  assert.match(client, /startPanelHeightResize/)
  assert.doesNotMatch(client, /refreshMemoBadges/)
  assert.doesNotMatch(client, /BoundDock/)
  assert.match(client, /ReactDOMClient\.createRoot/)
  assert.match(client, /IconCopy/)
  assert.match(client, /copyText/)
  assert.match(client, /toast\.copied/)
  assert.match(client, /time\.createdDone/)
  assert.match(client, /sort\(compareDoneItems\)/)
  assert.match(client, /'settings\.project'/)
  assert.match(client, /PLUGIN_REPO_URL/)
  assert.match(client, /SESSION_STORAGE_KEY/)
  assert.match(read('src/client/constants.ts'), /dsh\.aside-notes\.v2/)
  assert.match(read('src/client/storage/migrate.ts'), /dsh\.session-memos\.v1/)
  assert.doesNotMatch(client, /selectPanel/)
  assert.match(client, /document\.head\.appendChild\(style\)/)
  assert.doesNotMatch(client, /h\('style'/)
  assert.match(client, /(?:module\.exports = |return )\{ inject: \['slots'\], apply \}/)
  assert.doesNotMatch(client, /@local\//)
})

test('the retired page entry is gone, not kept as a second implementation', () => {
  const client = read('src/client/index.ts')
  for (const dead of ['function PanelBody', 'function PageShell', 'function MemoEntry', 'useTodoStore', 'dsh.dsh-asidenote.v1']) {
    assert.ok(!client.includes(dead), `dead surface still present: ${dead}`)
  }
  assert.doesNotMatch(readCss(), /dsh-an-(?:page|shell|heroBtn|footerBtn|dockBtn|badge|statNum|track|select)\b/)
})

test('locale files carry metadata and the dictionary stays in sync', () => {
  const zhMeta = JSON.parse(read('locale/zh.json'))
  const enMeta = JSON.parse(read('locale/en.json'))
  assert.ok(zhMeta.meta && zhMeta.meta.title, 'zh.json needs meta.title')
  assert.ok(enMeta.meta && enMeta.meta.title, 'en.json needs meta.title')
  assert.ok(zhMeta.meta.description && enMeta.meta.description, 'both locales need meta.description')

  const dict = readDict()
  assert.equal(dict.zh['nav.label'], '便笺')
  assert.equal(dict.en['nav.label'], 'Notes')
  assert.deepEqual(Object.keys(dict.zh).sort(), Object.keys(dict.en).sort(), 'zh and en drifted apart')
  for (const key of Object.keys(dict.zh)) {
    assert.equal(typeof dict.zh[key], 'string')
    assert.ok(dict.zh[key].length > 0, `zh ${key} is empty`)
    assert.ok(dict.en[key].length > 0, `en ${key} is empty`)
    const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort()
    assert.deepEqual(placeholders(dict.zh[key]), placeholders(dict.en[key]), `placeholders differ for ${key}`)
  }
  assert.equal(dict.zh['popover.clearConfirm'], '清除 {n} 项已完成便笺？')
  assert.equal(dict.en['popover.clearConfirm'], 'Clear {n} completed notes?')
  assert.match(dict.zh['item.forwarded'], /移除标识/)
  assert.match(dict.en['item.forwarded'], /remove the mark/)
})

test('documentation and preview assets are present', () => {
  const previews = [
    'docs/assets/preview-badge.png',
    'docs/assets/preview-badge-dark.png',
    'docs/assets/preview-right.png',
    'docs/assets/preview-right-dark.png',
  ]
  for (const file of ['README.md', 'README.en.md', 'LICENSE', 'CHANGELOG.md', ...previews, 'icon.svg']) {
    assert.ok(exists(file), `missing ${file}`)
  }
  for (const file of previews) {
    assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} looks empty`)
  }
})

test('feature screenshots ship in both themes', () => {
  const features = ['panel', 'settings', 'actions', 'clear', 'empty']
  for (const name of features) {
    for (const file of [`docs/assets/features/${name}.png`, `docs/assets/features/${name}-dark.png`]) {
      assert.ok(exists(file), `missing ${file}`)
      assert.ok(fs.statSync(path.join(root, file)).size > 1000, `${file} looks empty`)
    }
  }
  for (const readme of ['README.md', 'README.en.md']) {
    const text = read(readme)
    for (const name of features) {
      assert.match(text, new RegExp(`docs/assets/features/${name}\\.png`), `${readme} does not show ${name}`)
      assert.match(text, new RegExp(`docs/assets/features/${name}-dark\\.png`), `${readme} does not show ${name} in dark`)
    }
  }
})

/** Every file under src/client, joined — for assertions about the tree as a whole. */
function readClientTree() {
  const files = []
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(fs.readFileSync(full, 'utf8'))
    }
  }
  walk(path.join(root, 'src', 'client'))
  return files.join('\n')
}

/** The panel stylesheet is a plain .css file now. */
function readCss() {
  return read('src/client/styles/panel.css')
}

/** Split the stylesheet into whole rules, keeping their at-rule context. */
function cssRules() {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  let media = ''
  const mediaRe = /@media([^{]+)\{([\s\S]*?)\n\}/g
  let rest = css
  for (const match of css.matchAll(mediaRe)) {
    rest = rest.replace(match[0], '\n')
    for (const rule of match[2].split('}')) {
      const [selector, body] = rule.split('{')
      if (!selector || !body) continue
      rules.push({ selector: selector.trim(), body: body.trim(), media: match[1].trim() })
    }
    media = match[1].trim()
  }
  void media
  for (const rule of rest.split('}')) {
    const [selector, body] = rule.split('{')
    if (!selector || !body) continue
    if (selector.includes('@keyframes')) continue
    rules.push({ selector: selector.trim(), body: body.trim(), media: '' })
  }
  return rules
}

/** The bundled dictionary, evaluated straight from the module source. */
function readDict() {
  return {
    zh: readLiteral('src/client/i18n/zh.ts', 'zh'),
    en: readLiteral('src/client/i18n/en.ts', 'en'),
  }
}

/** Pull one JSON-compatible object literal out of a TypeScript module. */
function readLiteral(file, name) {
  const text = read(file)
  const start = text.indexOf('{', text.indexOf(`export const ${name}`))
  const end = text.lastIndexOf('}')
  assert.ok(start >= 0 && end > start, `${name} literal not found in ${file}`)
  return JSON.parse(text.slice(start, end + 1))
}

/** The shipped update probe and comparator, evaluated from the built bundle. */
function readUpdateHelpers() {
  const bundle = read('client/client.js')
  // The probe block derives the GitHub endpoint from PLUGIN_REPO_URL; carry
  // that one line so the snippet stands alone outside the module scope.
  const repoLine = bundle.match(/const PLUGIN_REPO_URL = "[^"]+";/)[0]
  const start = bundle.indexOf('const UPDATE_REGISTRY_HOSTS = ')
  const end = bundle.indexOf('const updateProbe = createUpdateProbe();', start)
  assert.ok(start > 0 && end > start, 'update helpers not found in the bundle')
  return new Function(`${repoLine}\n${bundle.slice(start, end)}\nreturn { createUpdateProbe, isNewerVersion }`)()
}

test('colours come from theme aliases, never from a second palette', () => {
  const css = readCss()
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'raw hex colours belong to the theme')
  assert.doesNotMatch(css, /\brgba?\(/i, 'raw colour functions belong to the theme')
  assert.doesNotMatch(css, /--an-n-\d+/, 'the parallel grey ramp duplicates --dsw-alias-* tokens')
  for (const token of ['--dsw-alias-interactive-bg-hover', '--dsw-alias-label-primary', '--dsw-alias-label-secondary', '--dsw-alias-border-l2', '--dsw-alias-border-l4']) {
    assert.ok(css.includes(`var(${token})`), `missing shared token ${token}`)
  }
  for (const match of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const token = match[1]
    assert.ok(
      token.startsWith('--dsw-') || token.startsWith('--ds-') || token.startsWith('--an-') || token.startsWith('--dsh-an-') || token.startsWith('--dsh-scrollbar'),
      `unknown token ${token}`,
    )
  }
})

test('type scale stays at the product sizes and weights cap at 500', () => {
  const css = readCss()
  const sizes = [...new Set([...css.matchAll(/font-size:([^;}]+)/g)].map(match => match[1].trim()))]
  for (const size of sizes) assert.match(size, /^var\(--an-fs-(?:caption|row|title)\)$/)
  const scale = [...css.matchAll(/--an-fs-[a-z]+:([0-9.]+)px/g)].map(match => Number(match[1])).sort((a, b) => a - b)
  assert.deepEqual(scale, [12, 13, 14])
  const weights = [...new Set([...css.matchAll(/font-weight:([0-9]+)/g)].map(match => Number(match[1])))]
  for (const weight of weights) assert.ok(weight <= 500, `font-weight ${weight} exceeds the 500 cap`)
})

test('spacing snaps to the 4px scale', () => {
  const css = readCss()
  const scale = new Set(['0', '1px', '2px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px', 'auto', '100%'])
  for (const match of css.matchAll(/(?:^|[;{])(?:padding|margin|gap)(?:-[a-z]+)?:([^;}]+)/g)) {
    const value = match[1].trim()
    if (value.includes('var(') || value.includes('calc(') || value.includes('inset')) continue
    for (const part of value.split(/\s+/)) {
      assert.ok(scale.has(part) || /^-\d+px$/.test(part), `off-scale spacing "${value}"`)
    }
  }
})

test('radii use the shared scale and pills declare their curve', () => {
  const rules = cssRules()
  const allowed = new Set(['var(--dsw-radius-sm)', 'var(--dsw-radius-md)', 'var(--dsw-radius-lg)', 'var(--dsw-radius-panel)', 'var(--an-radius-pill)'])
  for (const rule of rules) {
    for (const match of rule.body.matchAll(/border-radius:([^;}]+)/g)) {
      assert.ok(allowed.has(match[1].trim()), `off-scale radius ${match[1].trim()} in ${rule.selector}`)
    }
    if (/border-radius:var\(--an-radius-pill\)/.test(rule.body)) {
      assert.match(rule.body, /corner-shape:round/, `${rule.selector} must pair the pill radius with corner-shape:round`)
    }
  }
  for (const match of readCss().matchAll(/--an-radius-pill:([^;}]+)/g)) assert.equal(match[1], '999px')
})

test('hairlines stay at 0.5px and only state or dashed borders use 1px', () => {
  const rules = cssRules()
  for (const rule of rules) {
    for (const match of rule.body.matchAll(/(?:^|;)border(?:-(?:top|right|bottom|left))?:([^;}]+)/g)) {
      const value = match[1].trim()
      if (value === '0' || value.startsWith('0 ')) continue
      if (value.includes('dashed')) {
        assert.match(value, /^1px dashed /, `dashed affordance keeps 1px: ${value}`)
        continue
      }
      if (value.includes('1.5px')) {
        assert.match(rule.selector, /data-loading/, `only the spinner ring keeps 1.5px: ${rule.selector}`)
        continue
      }
      assert.match(value, /^0\.5px solid /, `neutral border must be 0.5px: "${value}" in ${rule.selector}`)
    }
  }
})

test('the floating panel is borderless and elevated, with no second stroke', () => {
  const rules = cssRules()
  const panel = rules.find(rule => rule.body.includes('position:fixed'))
  assert.ok(panel, 'panel rule missing')
  assert.match(panel.body, /border:0(?:;|$)/)
  assert.match(panel.body, /box-shadow:var\(--dsw-elevation-panel\)/)
  assert.match(panel.body, /background:var\(--dsh-an-panelSurface\)/)
  assert.doesNotMatch(panel.body, /backdrop-filter/, 'the opaque panel no longer blurs its backdrop')
  for (const rule of rules) {
    const hasNeutralBorder = /border:0?\.?5?px solid var\(--dsw-alias-border/.test(rule.body)
    const hasElevation = /box-shadow:var\(--dsw-elevation-/.test(rule.body)
    assert.ok(!(hasNeutralBorder && hasElevation), `${rule.selector} pairs a border with an elevation shadow`)
  }
})

test('scrollbars keep the shared theme skin at the DSH rail geometry', () => {
  const css = readCss()
  assert.doesNotMatch(css, /::-webkit-scrollbar/, 'component scrollbar selectors replace the shared skin')
  assert.doesNotMatch(css, /(?:^|[;{])scrollbar-(?:width|color):/, 'the standard scrollbar properties silence the shared hover skin')
  // The popover is an elevated menu surface, so the l2 pair is the DSH binding;
  // the fallback keeps a visible thumb on a theme that lacks the alias.
  assert.match(css, /--dsh-scrollbar-thumb:var\(--dsw-alias-scrollbar-bg-l2,var\(--an-divider\)\)/)
  assert.match(css, /--dsh-scrollbar-thumb-hover:var\(--dsw-alias-scrollbar-hover-l2,var\(--dsw-alias-scrollbar-bg-l2,var\(--an-divider\)\)\)/)
  // A 9px rail whose 2px transparent border leaves a 5px inset pill. Only the
  // geometry is rebound; the shared skin still owns every pseudo-element.
  assert.match(css, /--dsh-an-scrollRail:9px/)
  assert.match(css, /--dsh-an-scrollInset:2px/)
  assert.match(css, /--dsh-scrollbar-width:var\(--dsh-an-scrollRail\)/)
  assert.match(css, /--dsh-scrollbar-thumb-border:var\(--dsh-an-scrollInset\)/)
})

test('the rail grows into the popover padding without shrinking the cards', () => {
  const css = readCss()
  assert.match(css, /--dsh-an-listGutter:var\(--an-space-4\)/)
  assert.match(css, /@media \(max-width:480px\)\{[^@]*--dsh-an-listGutter:var\(--an-space-3\)/)
  const viewport = /\.dsh-an-listViewport\{([^}]*)\}/.exec(css)
  assert.ok(viewport, 'missing list viewport')
  assert.match(viewport[1], /margin-right:calc\(var\(--dsh-an-listGutter\) \* -1\)/)
  const list = [...css.matchAll(/\.dsh-an-listArea\{([^}]*)\}/g)].find(match => match[1].includes('display:flex'))
  assert.ok(list, 'missing list scroll container')
  // Cards and the add field keep one content width: the padding pays back what
  // the rail consumes, and the stable gutter keeps that width when idle.
  assert.match(list[1], /padding-right:calc\(var\(--dsh-an-listGutter\) - var\(--dsh-an-scrollRail\)\)/)
  assert.match(list[1], /scrollbar-gutter:stable/)
})

test('the bottom edge fades only while notes sit below the fold', () => {
  const css = readCss()
  const client = read('src/client/index.ts') + read('src/client/ui/NoteList.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useListEdge.ts')
  // The fade is an alpha mask on the scroller, not a blurred overlay: a mask
  // has no compositing edge to show as a crisp-to-blurred line.
  assert.doesNotMatch(css, /\.dsh-an-listViewport::(?:before|after)/, 'the bottom fade must not use an overlay pseudo-element')
  const mask = /\.dsh-an-listViewport\[data-bottom="true"\] \.dsh-an-listArea\{([^}]*)\}/.exec(css)
  assert.ok(mask, 'missing the bottom fade mask')
  assert.match(mask[1], /--dsh-an-fadeHeight:calc\(var\(--an-space-6\) \+ var\(--an-space-4\)\)/, 'the fade must cover 48px')
  assert.match(mask[1], /mask-image:linear-gradient\(to bottom,currentColor 0,currentColor calc\(100% - var\(--dsh-an-fadeHeight\)\),transparent 100%\)/, 'the content must fade over 48px')
  assert.match(mask[1], /mask-image:[^;]*linear-gradient\(to right,transparent calc\(100% - var\(--dsh-an-scrollRail\)\),currentColor calc\(100% - var\(--dsh-an-scrollRail\)\)\)/, 'the scrollbar rail must stay opaque')
  assert.match(mask[1], /mask-composite:add/, 'the two mask layers union so the rail stays crisp')
  assert.doesNotMatch(mask[1], /backdrop-filter/, 'a backdrop-filter overlay would reintroduce the hard edge')
  assert.match(css, /\.dsh-an-listViewport\[data-bottom="true"\] \.dsh-an-listArea/, 'the mask must follow the scroll state')
  // It follows scroll + ResizeObserver state.
  assert.match(client, /className: 'dsh-an-listViewport'[\s\S]{0,240}className: 'dsh-an-listArea', ref: listRef/)
  assert.match(client, /'data-bottom': listHasMore \? 'true' : undefined/)
  assert.match(client, /onScroll: syncListEdge/)
  assert.match(client, /new ResizeObserver\(syncListEdge\)/)
  assert.match(client, /node.scrollTop \+ node.clientHeight < node.scrollHeight - 1/)
})

test('hover styling is gated on hover capability', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '')
  const block = css.match(/@media \(hover:hover\)\{([\s\S]*?)\n\}/)
  assert.ok(block, 'missing @media (hover:hover) block')
  const outside = css.replace(block[0], '')
  assert.doesNotMatch(outside, /:hover/, 'hover rules must live inside @media (hover:hover)')
  assert.doesNotMatch(outside, /@media \(hover:none\)/, 'hover support is detected by capability, not by a negative fallback')
  assert.doesNotMatch(outside, /:hover[^{]*\{[^}]*opacity:0/)

  const rules = cssRules()
  const actions = rules.find(rule => rule.selector === '.dsh-an-actions' && rule.media.includes('hover:hover'))
  assert.ok(actions, 'action row visibility must be decided under the hover media query')
  assert.match(actions.body, /opacity:0/)
  const base = rules.find(rule => rule.selector === '.dsh-an-actions' && rule.media === '')
  assert.ok(base, 'action row needs a hover-less default')
  assert.doesNotMatch(base.body, /opacity:0/, 'touch devices must keep the row actions visible')
})

test('no product copy is hardcoded outside the dictionary', () => {
  const client = read('src/client/index.ts')
  const start = client.indexOf('const DICT = ')
  const end = client.indexOf('const CSS = [')
  const cssStart = client.indexOf('const CSS = [')
  const cssEnd = client.indexOf("].join('')", cssStart)
  const js = `${client.slice(0, start)}${client.slice(end, cssStart)}${client.slice(cssEnd)}`
  // A person's name is a proper noun, not translatable copy.
  const scannable = js.replace(/const PLUGIN_AUTHOR = '[^']*'/, '')
  const cjk = [...scannable.matchAll(/[^\s]*[\u4e00-\u9fff][^\n]*/g)].map(match => match[0].trim())
  assert.deepEqual(cjk, [], `hardcoded copy: ${cjk.join(' | ')}`)
})

test('chinese hints drop the trailing full stop', () => {
  const dict = readDict()
  for (const key of Object.keys(dict.zh)) {
    if (!/^(toast\.|storage\.)|hint|Hint/.test(key)) continue
    assert.ok(!dict.zh[key].endsWith('。'), `${key} ends with a full stop`)
  }
})

test('transient outcomes go to the frame-wide toast seat', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/primitives.ts') + read('src/client/ui/toastSeat.ts')
  assert.match(client, /@deepseek-ai\/dsh-client-ui-primitives/)
  assert.match(client, /ctx\.slots\.inject\('shell\.overlay'/)
  assert.match(client, /name: 'shell\.overlay'/)
  assert.match(client, /h\(Toast, \{/)
  for (const kind of ['copied', 'forwarded', 'unforwarded', 'deleted', 'cleared', 'copyFailed', 'forwardFailed', 'saveFailed']) {
    assert.match(client, new RegExp(`toast\\.${kind}`), `missing toast copy for ${kind}`)
  }
  assert.doesNotMatch(client, /dsh-an-copied|dsh-an-forwarded/, 'inline success marks duplicate the toast')
})

test('a failed write keeps the row and says so', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/useSessionMemoStore.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useNoteActions.ts') + read('src/client/ui/useComposerDraft.ts')
  assert.match(client, /if \(!ok\) return false/)
  assert.match(client, /if \(!ok\) \{\n\s+report\('saveFailed'\)/)
  assert.match(client, /A failed delete keeps the row/)
})

test('icon-only controls use the shared tooltip', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/primitives.ts') + read('src/client/ui/TodoRow.ts')
  assert.match(client, /function withTooltip\(/)
  assert.match(client, /h\(Tooltip, \{ label, side: 'top'/)
  const iconButtons = [...client.matchAll(/className: 'dsh-an-iconBtn[^']*',\n\s+'aria-label': say\(([^)]+)\)/g)]
  assert.equal(iconButtons.length, 4, 'all four row actions must be present')
  const buttonTitles = [...client.matchAll(/'aria-label': say\('[^']+'\),\n\s+title:/g)]
  assert.deepEqual(buttonTitles, [], 'aria-labelled buttons must not carry a second native title')
})

test('completed notes hide the forward action and keep the other three', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/TodoRow.ts')
  const start = client.indexOf("className: 'dsh-an-actions'")
  assert.ok(start > 0, 'row actions missing')
  const actions = client.slice(start, client.indexOf('function EmptyState', start))
  // Forwarding is the only action a completed note drops, and it disappears
  // entirely: a done row never renders a disabled forward button.
  assert.match(actions, /done \? null : withTooltip\(say\(forwarded \? 'item\.forwarded' : 'item\.forward'\)/)
  assert.equal([...actions.matchAll(/\? null : withTooltip/g)].length, 1, 'forward is the only conditional action')
  // Copy, edit and delete stay unconditional direct children of the action row.
  for (const key of ['item.copy', 'item.edit', 'item.delete']) {
    const escaped = key.replace(/\./g, '\\.')
    assert.match(actions, new RegExp(`,\\n\\s+withTooltip\\(say\\('${escaped}'\\)`), `${key} must stay unconditional`)
    assert.doesNotMatch(actions, new RegExp(`\\? null : withTooltip\\(say\\('${escaped}'\\)`), `${key} must not be conditional`)
  }
  // The surviving actions keep their reading order around the optional one.
  const order = ["withTooltip(say('item.copy')", "withTooltip(say(forwarded ? 'item.forwarded'", "withTooltip(say('item.edit')", "withTooltip(say('item.delete')"]
    .map(snippet => actions.indexOf(snippet))
  assert.ok(order.every(index => index > 0), 'row action order drifted')
  assert.deepEqual([...order].sort((a, b) => a - b), order, 'row action order drifted')
})

test('animations and transitions stay tokenised', () => {
  const css = readCss()
  const animations = [...css.matchAll(/@keyframes [^{]+\{([^@]*)\}\}/g)].map(match => match[1])
  for (const frames of animations) {
    const props = [...frames.matchAll(/([a-z-]+):/g)].map(match => match[1])
    for (const prop of props) assert.ok(['opacity', 'transform'].includes(prop), `animates ${prop}`)
  }
  for (const match of css.matchAll(/transition:[^;}]+/g)) {
    assert.doesNotMatch(match[0], /(?<!var\(--an-dur)[^)]\b\d+m?s\b/, `untokenised duration in "${match[0]}"`)
  }
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
  assert.match(css, /@media \(prefers-reduced-motion:no-preference\)/)
})

test('the panel opens in place with an opacity fade', () => {
  const css = readCss()
  assert.match(css, /@keyframes dsh-an-pop-in\{from\{opacity:0\}to\{opacity:1\}\}/, 'the panel keyframes must be opacity only')
  assert.doesNotMatch(css, /@keyframes dsh-an-pop-in\{[^@]*?(?:transform|translate|scale)/, 'the panel must not move or scale on open')
  // The entry is also the positioning anchor. A pressed transform makes the
  // anchor rect smaller, so the first panel position is computed from the
  // scaled rect and snaps right/down once the press transition ends.
  assert.doesNotMatch(css, /\.dsh-an-headerBtn:active\{[^}]*transform/, 'the panel anchor must not scale while pressed')
})

test('the prefix input shares the child title text box', () => {
  const css = readCss()
  const input = css.match(/\.dsh-an-settingInput\{([^}]*)\}/)
  assert.ok(input, 'missing settingInput rule')
  assert.doesNotMatch(input[1], /font:inherit/, 'the shorthand must not reset the type')
  assert.match(input[1], /font-size:var\(--an-fs-row\)/, 'input must use the child title size')
  assert.match(input[1], /line-height:var\(--an-lh-row\)/, 'input must use the child title line box')
  assert.match(input[1], /font-weight:500/, 'input text must match the 500-weight title')
  assert.match(css, /\.dsh-an-settingItem>\.dsh-an-settingInput\{[^}]*font-size:var\(--an-fs-row\)/, 'host input CSS must not win')
  assert.match(read('src/client/ui/SettingsPanel.ts'), /fontWeight: 500/, 'the inline guard must keep the title weight')
})

test('the prefix prompt uses a one-line-to-multiline textarea', () => {
  const css = readCss()
  const textarea = css.match(/\.dsh-an-settingTextarea\{([^}]*)\}/)
  assert.ok(textarea, 'missing settingTextarea rule')
  // The shared field keeps its border, radius, fill, type and focus skin; the
  // textarea only changes the box, starting at one 20px line plus padding.
  assert.ok(css.indexOf('.dsh-an-settingTextarea{') > css.indexOf('.dsh-an-settingInput{'), 'the textarea must override the shared input height')
  assert.match(textarea[1], /display:block/)
  assert.match(textarea[1], /height:auto/)
  assert.match(textarea[1], /min-height:calc\(var\(--an-lh-row\) \+ var\(--an-space-4\) \+ 2px\)/, 'min-height must floor the field at one line plus padding and border')
  assert.match(textarea[1], /padding:var\(--an-space-2\)/)
  assert.match(textarea[1], /resize:none/)
  assert.match(textarea[1], /overflow-y:auto/)
  assert.match(textarea[1], /white-space:pre-wrap/)
  assert.match(textarea[1], /overflow-wrap:anywhere/)
})

test('section toggles stay inside the scrolling list', () => {
  const css = readCss()
  // .dsh-an-listArea clips on the x axis, so any horizontal pull on a section
  // toggle (margin-left, including the calc(* -1) form) slices the rounded left
  // edge off its hover pill.
  assert.doesNotMatch(
    css,
    /[^{}]*\.dsh-an-(?:doneToggle|sectionHead|doneHead)[^{]*\{[^}]*margin-left:/,
    'section toggles must not pull left: .dsh-an-listArea clips the rounded edge',
  )
})

test('the section counts carry the status hierarchy', () => {
  const css = readCss()
  // Section labels are quiet captions now, so the panel title is the only
  // 14px/500 line at the top of the popover.
  assert.match(css, /\.dsh-an-doneToggle\{[^}]*font-size:var\(--an-fs-caption\)/)
  assert.match(css, /\.dsh-an-doneToggle\{[^}]*color:var\(--dsw-alias-label-secondary\)/)
  assert.match(css, /\.dsh-an-popMeta\{[^}]*font-size:var\(--an-fs-caption\)/)
  assert.match(css, /\.dsh-an-popMeta\{[^}]*font-weight:400/)
  assert.match(css, /\.dsh-an-popMeta\{[^}]*line-height:16px/)
  // The title and count share one line, and the two icon actions sit together
  // at the right, so the meta reads as a status instead of a second title.
  assert.match(css, /\.dsh-an-popTitleLine\{[^}]*flex:1 1 auto/)
  assert.match(css, /\.dsh-an-popActions\{[^}]*display:flex/)
  const client = read('src/client/index.ts') + read('src/client/ui/PanelHead.ts') + read('src/client/ui/NoteList.ts')
  assert.match(client, /className: 'dsh-an-popActions'/)
  assert.match(client, /className: 'dsh-an-popTitleLine' \},\n\s+h\('div', \{ className: 'dsh-an-popTitle' \}[^]*?h\('p', \{ className: 'dsh-an-popMeta' \}/)
  // Both counts share the one neutral badge style: the completed number is not
  // important, so it must not draw attention with a success tint. An empty open
  // section still shows no zero badge, which is noise rather than information.
  assert.doesNotMatch(css, /\.dsh-an-sectionCount\[data-tone/, 'no done-specific count badge rule')
  assert.doesNotMatch(client, /data-tone/, 'no done-specific count badge attribute')
  assert.match(
    css,
    /\.dsh-an-sectionCount\{[^}]*border:0\.5px solid var\(--dsw-alias-border-l3\)[^}]*background:var\(--dsw-alias-interactive-bg-hover-solid\)[^}]*color:var\(--dsw-alias-label-primary\)/,
  )
  assert.match(client, /openCount \? h\('span', \{ className: 'dsh-an-sectionCount' \}, String\(openCount\)\) : null/)
  assert.match(client, /h\('span', \{ className: 'dsh-an-sectionCount' \}, String\(doneItems\.length\)\)/)
  // Cards and the add field share one card surface so the panel material stays
  // the quietest layer, while the 0.5px card edge stays the strongest line.
  assert.match(css, /\.dsh-an-add\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/)
  assert.match(css, /\.dsh-an-rows\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/)
})

test('the panel never raises the soft keyboard on touch devices', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useComposerDraft.ts')
  assert.match(client, /\(hover: hover\) and \(pointer: fine\)/)
})

test('completed notes sort by newest completion', () => {
  const client = read('src/client/domain/items.ts')
  const extract = name => {
    const start = client.indexOf(`function ${name}(`)
    assert.ok(start > 0, `missing ${name}`)
    const end = client.indexOf('\n}\n', start) + '\n}\n'.length
    assert.ok(end > start, `unterminated ${name}`)
    return client.slice(start, end)
  }
  const factory = new Function(`${extract('completedStamp')}\n${extract('compareDoneItems')}\nreturn { completedStamp, compareDoneItems }`)()
  const items = [
    { id: 'a', completedAt: 1000 },
    { id: 'b', completedAt: 3000 },
    { id: 'c', updatedAt: 2000 },
    { id: 'd', createdAt: 500 },
  ]
  assert.deepEqual([...items].sort(factory.compareDoneItems).map(item => item.id), ['b', 'c', 'a', 'd'])
  assert.equal(factory.completedStamp({ updatedAt: 42, createdAt: 1 }), 42)
  assert.equal(factory.completedStamp({}), 0)
})

test('send shortcuts default to Enter and name the platform modifier', () => {
  const client = read('src/client/constants.ts')
  assert.match(client, /const SEND_SHORTCUT_DEFAULT = 'enter'/)
  assert.match(client, /const IS_MAC = \(/)
  assert.match(client, /const MOD_LABEL = IS_MAC \? '⌘' : 'Ctrl'/)
  assert.match(client, /function isSendModifier\(event\)/)
  assert.match(client, /IS_MAC \? event\.metaKey === true : event\.ctrlKey === true/)
  const dict = readDict()
  for (const key of ['settings.shortcutCtrlEnter', 'settings.shortcutEnter', 'add.shortcut', 'add.shortcutEnter', 'edit.hintCtrlEnter', 'edit.hintEnter']) {
    assert.match(dict.zh[key], /\{mod\}\+Enter/, `zh ${key} names the platform modifier`)
    assert.match(dict.en[key], /\{mod\}\+Enter/, `en ${key} names the platform modifier`)
  }
})

test('forwarding marks the forward button, never the checkbox', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/TodoRow.ts')
  // The checkbox renders only the note's own open/done state.
  assert.match(client, /'aria-checked': checked \? 'true' : 'false'/)
  assert.doesNotMatch(client, /aria-checked': checked \? 'true' : half/)
  // The forwarded state lives on the forward action as a small check badge.
  assert.match(client, /'data-forwarded': forwarded \? 'true' : undefined/)
  assert.match(client, /className: 'dsh-an-forwardMark'/)
  assert.match(client, /item\.forwarded/)
  // Forwarding no longer stages a delayed completion.
  assert.doesNotMatch(client, /setPendingDone|startPending|clearPendingTimers/)
  assert.match(client, /const toggleCheck = \(\) => onToggle\(item\)/)
})

test('the forwarded mark borrows the forward icon palette, not a state colour', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/TodoRow.ts') + read('src/client/styles/panel.css')
  const rule = readCss().match(/\.dsh-an-forwardMark\{([^}]*)\}/)
  assert.ok(rule, 'forward mark rule missing')
  const body = rule[1]
  // The badge is neutral: it uses the same secondary/foreground pair as the
  // icon buttons, never a success or brand fill.
  assert.match(body, /background:var\(--dsw-alias-label-secondary\)/)
  assert.match(body, /color:var\(--dsw-alias-label-primary-foreground\)/)
  assert.doesNotMatch(body, /--dsw-alias-state-|--dsw-alias-brand/)
  assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|\brgba?\(/i)
  // Geometry stays: a 10px dot bottom-right with an 8px check inside.
  assert.match(body, /width:10px/)
  assert.match(body, /height:10px/)
  assert.match(body, /right:0;bottom:0/)
  assert.match(client, /className: 'dsh-an-forwardMark', 'aria-hidden': true \}, h\(IconCheck, \{ size: 8 \}\)/)
})

test('clicking a forwarded note removes the mark instead of forwarding again', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/TodoRow.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useForwardMarks.ts')
  const start = client.indexOf('const forward = () => {')
  assert.ok(start > 0, 'forward handler missing')
  const end = client.indexOf('\n      }', start)
  assert.ok(end > start, 'forward handler is unterminated')
  const handler = client.slice(start, end)
  // The forwarded flag short-circuits before the composer write.
  const toggle = handler.match(/if \(forwarded\) \{([\s\S]*?)\}/)
  assert.ok(toggle, 'forwarded notes need their own branch')
  assert.match(toggle[1], /if \(onUnforwarded\) onUnforwarded\(item\)/)
  assert.match(toggle[1], /if \(onToast\) onToast\('unforwarded'\)/)
  assert.doesNotMatch(toggle[1], /appendToConversation/, 'a forwarded note must not append again')
  // Un-forwarded notes keep the existing append-and-remember behaviour.
  assert.match(handler, /appendToConversation\(item\.text, forwardPrefix\)/)
  assert.match(handler, /if \(onForwarded\) onForwarded\(item\)/)
  assert.match(handler, /if \(onToast\) onToast\('forwarded'\)/)
  // The parent callback clears the stored flag and the in-memory id set.
  assert.match(client, /const unrememberForwarded = item => \{/)
  assert.match(client, /unrememberForwarded = item => \{\n\s+const id = [^\n]+\n\s+if \(!id\) return\n\s+forgetForwardedItems\(id\)/)
  assert.match(client, /onUnforwarded: unrememberForwarded/)
  assert.match(client, /forgetForwardedItems = itemIds => \{[\s\S]*?forgetForwarded\(sessionId, ids\)[\s\S]*?setForwardedIds\(/)
  // Removing the mark never touches the checkbox: the row still toggles open/done only.
  assert.match(client, /const toggleCheck = \(\) => onToggle\(item\)/)
})

test('clearing completed notes asks for a second confirmation', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/ClearConfirm.ts') + read('src/client/ui/NoteList.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/useClearConfirm.ts')
  assert.match(client, /const \[confirmClear, setConfirmClear\] = React\.useState\(false\)/)
  assert.match(client, /const clearConfirmTimerRef = React\.useRef\(0\)/)
  // The section button opens the band; it never clears on the first click.
  assert.match(client, /className: 'dsh-an-clear',\n\s+'aria-expanded': confirmClear \? 'true' : 'false',\n\s+onClick: askClearConfirm/)
  assert.doesNotMatch(client, /className: 'dsh-an-clear', onClick: clearDone/)
  assert.match(client, /const askClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(true\)/)
  // Cancel and confirm both close the band; only confirm reaches clearDone.
  assert.match(client, /const dismissClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(false\)\n\s+\}/)
  assert.match(client, /const confirmClearDone = \(\) => \{\n\s+dismissClearConfirm\(\)\n\s+onConfirm\(\)\n\s+\}/)
  assert.match(client, /onConfirm: \(\) => clearDone\(\)/)
  assert.match(client, /onClick: onCancel \}, say\('popover\.clearCancel'\)/)
  assert.match(client, /onClick: onConfirm \}, say\('popover\.clearConfirmAction'\)/)
  // The band names the completed count and is announced politely.
  assert.match(client, /className: 'dsh-an-clearConfirm',\n\s+role: 'group',\n\s+'aria-live': 'polite',/)
  assert.match(client, /count: doneItems\.length/)
  assert.match(client, /onCancel: dismissClearConfirm/)
  assert.match(client, /onConfirm: confirmClearDone/)
  assert.match(client, /say\('popover\.clearConfirm', \{ n: count \}\)/)
  // Five-second auto-dismiss, with every teardown path dropping the timer.
  assert.match(read('src/client/constants.ts'), /const CLEAR_CONFIRM_MS = 5000/)
  assert.match(client, /clearConfirmTimerRef\.current = window\.setTimeout\(\(\) => \{\n\s+clearConfirmTimerRef\.current = 0\n\s+setConfirmClear\(false\)\n\s+\}, CLEAR_CONFIRM_MS\)/)
  assert.match(client, /React\.useEffect\(\(\) => \(\) => stopClearConfirmTimer\(\), \[\]\)/)
  assert.match(client, /if \(confirmClear && \(!showDone \|\| doneCount === 0\)\) dismissClearConfirm\(\)/)
  assert.match(client, /doneCount: record\.items\.filter\(item => item\.done\)\.length/)
  assert.match(client, /React\.useEffect\(\(\) => \{\n\s+dismissClearConfirm\(\)\n\s+\}, \[sessionId\]\)/)
})

test('the clear confirmation band reuses card tokens and a danger confirm', () => {
  const css = readCss()
  assert.match(
    css,
    /\.dsh-an-clearConfirm\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/,
  )
  assert.match(css, /\.dsh-an-clearConfirmText\{[^}]*font-size:var\(--an-fs-caption\)[^}]*color:var\(--dsw-alias-label-primary\)/)
  const rules = cssRules()
  const confirm = rules.find(rule => rule.selector === '.dsh-an-miniDanger')
  assert.ok(confirm, 'danger confirm rule missing')
  assert.match(confirm.body, /background:var\(--dsw-alias-state-error-primary\)/)
  assert.match(confirm.body, /color:var\(--dsw-alias-label-primary-foreground\)/)
  assert.doesNotMatch(confirm.body, /#[0-9a-f]{3,8}\b|\brgba?\(/i)
  const hover = rules.find(rule => rule.selector === '.dsh-an-miniDanger:hover:not([disabled])')
  assert.ok(hover, 'danger hover rule must stay inside the hover media block')
  assert.match(hover.media, /hover:hover/)
})

test('the prefix prompt is explained under the field, without a visible title', () => {
  const client = read('src/client/ui/SettingsPanel.ts')
  assert.doesNotMatch(client, /htmlFor: 'dsh-an-forward-prefix'/, 'the prefix field no longer has a visible title')
  assert.match(client, /'aria-label': say\('settings\.forwardPrefixItem'\)/, 'the field keeps an accessible name')
  assert.match(client, /'aria-describedby': 'dsh-an-forward-prefix-hint'/, 'the field points at the hint')
  assert.match(client, /id: 'dsh-an-forward-prefix-hint', className: 'dsh-an-settingHint' \}, say\('settings\.forwardPrefixHint'\)/)
  assert.doesNotMatch(readCss(), /dsh-an-settingItemLabel/, 'the unused title style is gone')
  const dict = readDict()
  assert.match(dict.zh['settings.forwardPrefixHint'], /若输入框为空/)
  assert.match(dict.zh['settings.forwardPrefixHint'], /留空则只转发便笺正文$/)
  assert.match(dict.en['settings.forwardPrefixHint'], /empty composer/)
  assert.match(dict.en['settings.forwardPrefixHint'], /leave it empty/)
})

test('the prefix prompt is a multiline field that grows with its content', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/SettingsPanel.ts') + read('src/client/ui/MemoPopover.ts') + read('src/client/ui/usePanelSettings.ts')
  const idAt = client.indexOf("id: 'dsh-an-forward-prefix'")
  assert.ok(idAt >= 0, 'the prefix field must keep its id')
  const fieldStart = client.lastIndexOf("h('textarea', {", idAt)
  const fieldEnd = client.indexOf("id: 'dsh-an-forward-prefix-hint'", idAt)
  assert.ok(fieldStart >= 0 && fieldStart < idAt, 'the prefix field must be a textarea')
  assert.ok(fieldEnd > idAt, 'the prefix hint must follow the field')
  const field = client.slice(fieldStart, fieldEnd)
  assert.match(field, /ref: prefixRef/, 'the field exposes a ref for auto-grow')
  assert.match(field, /rows: 1/, 'the field opens one line tall')
  assert.match(field, /className: 'dsh-an-settingInput dsh-an-settingTextarea'/, 'the textarea keeps the shared field skin')
  assert.match(field, /maxLength: 80/, 'the whole value stays capped at 80 characters')
  assert.match(field, /onChange: event => changeForwardPrefix\(event\.target\.value\)/, 'the field stays a controlled draft')
  assert.doesNotMatch(field, /h\('input'/, 'the old single-line input is gone')

  assert.match(client, /const prefixRef = React\.useRef\(null\)/, 'the prefix field needs its own ref')
  const effect = client.match(/React\.useLayoutEffect\(\(\) => \{\s*const node = prefixRef\.current[\s\S]*?\}, \[forwardPrefix, showSettings\]\)/)
  assert.ok(effect, 'the field re-measures when the value changes or settings reopen')
  assert.match(effect[0], /node\.style\.height = 'auto'/, 'auto-grow resets the height before measuring')
  assert.match(effect[0], /Math\.min\(138, node\.scrollHeight \+ 2\)/, 'auto-grow caps at six lines and then scrolls')
})


test('sticky heads are filled only while pinned, not at rest', () => {
  const client = read('src/client/index.ts') + read('src/client/ui/position.ts')
  assert.match(client, /function syncStickyHeads\(node\)/)
  assert.match(client, /const section = head\.parentElement/)
  assert.match(client, /const rect = section\.getBoundingClientRect\(\)/)
  assert.match(client, /head\.toggleAttribute\('data-stuck', rect\.top < areaTop && rect\.bottom > areaTop\)/)
  assert.match(client, /syncStickyHeads\(node\)/)

  // The stuck state uses the same raised surface token as the panel, so the
  // fill does not read as a differently coloured block. Blur is deferred.
  const rules = cssRules()
  const stuck = rules.find(rule => rule.selector === '.dsh-an-sectionHead[data-stuck],.dsh-an-doneHead[data-stuck]')
  assert.ok(stuck, 'stuck header rule missing')
  assert.match(stuck.body, /background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  assert.doesNotMatch(stuck.body, /backdrop-filter/, 'the stuck fill stays opaque until the blur is approved')
  const base = rules.find(rule => rule.selector === '.dsh-an-sectionHead,.dsh-an-doneHead')
  assert.ok(base, 'base header rule missing')
  assert.doesNotMatch(base.body, /backdrop-filter/, 'the header must not blur while it sits in flow')
})

test('the pinned header keeps its plain title style over a solid fill', () => {
  const css = readCss()
  const client = read('src/client/index.ts')
  const rule = css.match(/\.dsh-an-sectionHead\[data-stuck\],\.dsh-an-doneHead\[data-stuck\]\{([^}]*)\}/)
  assert.ok(rule, 'stuck header rule missing')
  assert.match(rule[1], /background:var\(--dsh-an-panelSurface,var\(--dsw-alias-bg-layer-2\)\)/)
  assert.doesNotMatch(rule[1], /border-radius|border-top-left-radius|border-top-right-radius/, 'the title keeps its plain shape')
  assert.doesNotMatch(rule[1], /backdrop-filter|opacity/, 'the header does not go translucent')
  assert.doesNotMatch(css, /\[data-stuck\][^{]*::before/, 'no extra corner underlay')

  // The opaque panel makes a top blur band unnecessary.
  assert.doesNotMatch(css, /dsh-an-headBlur/)
  assert.doesNotMatch(client, /HeadBlur/)
})
