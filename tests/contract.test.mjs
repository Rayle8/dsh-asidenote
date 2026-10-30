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
  // Section heads stay in flow: a sticky band cannot be painted on the
  // translucent menu material without a visible seam over the panel fill.
  assert.doesNotMatch(client, /position:sticky/)
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
  assert.match(client, /dsh-wt-resizeHandle/)
  assert.match(client, /dsh-wt-resizeHandleBottom/)
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
  assert.match(client, /dsh\.session-memos\.v1/)
  assert.doesNotMatch(client, /selectPanel/)
  assert.match(client, /document\.head\.appendChild\(style\)/)
  assert.doesNotMatch(client, /h\('style'/)
  assert.match(client, /return \{ inject: \['slots'\], apply \}/)
  assert.doesNotMatch(client, /@local\//)
})

test('the retired page entry is gone, not kept as a second implementation', () => {
  const client = read('client.js')
  for (const dead of ['function PanelBody', 'function PageShell', 'function MemoEntry', 'useTodoStore', 'dsh.workspace-todos.v1']) {
    assert.ok(!client.includes(dead), `dead surface still present: ${dead}`)
  }
  assert.doesNotMatch(readCss(), /dsh-wt-(?:page|shell|heroBtn|footerBtn|dockBtn|badge|statNum|track|select)\b/)
})

test('locale files carry the whole dictionary', () => {
  const zh = JSON.parse(read('locale/zh.json'))
  const en = JSON.parse(read('locale/en.json'))
  assert.equal(zh['nav.label'], '便笺')
  assert.equal(en['nav.label'], 'Notes')
  const dict = readDict()
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(dict.zh).sort(), 'zh.json drifted from the bundled dictionary')
  assert.deepEqual(Object.keys(en).sort(), Object.keys(dict.en).sort(), 'en.json drifted from the bundled dictionary')
  for (const key of Object.keys(dict.zh)) {
    assert.equal(zh[key], dict.zh[key], `zh.json value drifted for ${key}`)
    assert.equal(en[key], dict.en[key], `en.json value drifted for ${key}`)
  }
  const client = read('client.js')
  assert.match(client, /'title': '便笺'/)
  assert.match(client, /'dock\.open': '打开便笺'/)
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
    .join('\n')
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
  const client = read('client.js')
  const start = client.indexOf('    const DICT = ')
  const end = client.indexOf('\n\n    const CSS = [')
  assert.ok(start > 0 && end > start, 'DICT not found')
  const literal = client.slice(start + '    const DICT = '.length, end).trim().replace(/,$/, '')
  return new Function(`return (${literal})`)()
}

test('colours come from theme aliases, never from a second palette', () => {
  const css = readCss()
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'raw hex colours belong to the theme')
  assert.doesNotMatch(css, /\brgba?\(/i, 'raw colour functions belong to the theme')
  assert.doesNotMatch(css, /--wt-n-\d+/, 'the parallel grey ramp duplicates --dsw-alias-* tokens')
  for (const token of ['--dsw-alias-interactive-bg-hover', '--dsw-alias-label-primary', '--dsw-alias-label-secondary', '--dsw-alias-border-l2', '--dsw-alias-border-l4']) {
    assert.ok(css.includes(`var(${token})`), `missing shared token ${token}`)
  }
  for (const match of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    const token = match[1]
    assert.ok(
      token.startsWith('--dsw-') || token.startsWith('--ds-') || token.startsWith('--wt-') || token.startsWith('--dsh-wt-') || token.startsWith('--dsh-scrollbar'),
      `unknown token ${token}`,
    )
  }
})

test('type scale stays at the product sizes and weights cap at 500', () => {
  const css = readCss()
  const sizes = [...new Set([...css.matchAll(/font-size:([^;}]+)/g)].map(match => match[1].trim()))]
  for (const size of sizes) assert.match(size, /^var\(--wt-fs-(?:caption|row|title)\)$/)
  const scale = [...css.matchAll(/--wt-fs-[a-z]+:([0-9.]+)px/g)].map(match => Number(match[1])).sort((a, b) => a - b)
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
  const allowed = new Set(['var(--dsw-radius-sm)', 'var(--dsw-radius-md)', 'var(--dsw-radius-lg)', 'var(--dsw-radius-panel)', 'var(--wt-radius-pill)'])
  for (const rule of rules) {
    for (const match of rule.body.matchAll(/border-radius:([^;}]+)/g)) {
      assert.ok(allowed.has(match[1].trim()), `off-scale radius ${match[1].trim()} in ${rule.selector}`)
    }
    if (/border-radius:var\(--wt-radius-pill\)/.test(rule.body)) {
      assert.match(rule.body, /corner-shape:round/, `${rule.selector} must pair the pill radius with corner-shape:round`)
    }
  }
  for (const match of readCss().matchAll(/--wt-radius-pill:([^;}]+)/g)) assert.equal(match[1], '999px')
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
  assert.match(panel.body, /background:var\(--dsw-specific-menu\)/)
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
  assert.match(css, /--dsh-scrollbar-thumb:var\(--dsw-alias-scrollbar-bg-l2,var\(--wt-divider\)\)/)
  assert.match(css, /--dsh-scrollbar-thumb-hover:var\(--dsw-alias-scrollbar-hover-l2,var\(--dsw-alias-scrollbar-bg-l2,var\(--wt-divider\)\)\)/)
  // A 9px rail whose 2px transparent border leaves a 5px inset pill. Only the
  // geometry is rebound; the shared skin still owns every pseudo-element.
  assert.match(css, /--dsh-wt-scrollRail:9px/)
  assert.match(css, /--dsh-wt-scrollInset:2px/)
  assert.match(css, /--dsh-scrollbar-width:var\(--dsh-wt-scrollRail\)/)
  assert.match(css, /--dsh-scrollbar-thumb-border:var\(--dsh-wt-scrollInset\)/)
})

test('the rail grows into the popover padding without shrinking the cards', () => {
  const css = readCss()
  assert.match(css, /--dsh-wt-listGutter:var\(--wt-space-4\)/)
  assert.match(css, /@media \(max-width:480px\)\{[^@]*--dsh-wt-listGutter:var\(--wt-space-3\)/)
  const viewport = /\.dsh-wt-listViewport\{([^}]*)\}/.exec(css)
  assert.ok(viewport, 'missing list viewport')
  assert.match(viewport[1], /margin-right:calc\(var\(--dsh-wt-listGutter\) \* -1\)/)
  const list = /\.dsh-wt-listArea\{([^}]*)\}/.exec(css)
  assert.ok(list, 'missing list scroll container')
  // Cards and the add field keep one content width: the padding pays back what
  // the rail consumes, and the stable gutter keeps that width when idle.
  assert.match(list[1], /padding-right:calc\(var\(--dsh-wt-listGutter\) - var\(--dsh-wt-scrollRail\)\)/)
  assert.match(list[1], /scrollbar-gutter:stable/)
})

test('the bottom edge fades only while notes sit below the fold', () => {
  const css = readCss()
  const client = read('client.js')
  // Two stacked bottom-only layers: a tall 1px halo under a 28px 2px fade.
  const base = /\.dsh-wt-listViewport::before,\.dsh-wt-listViewport::after\{([^}]*)\}/.exec(css)
  assert.ok(base, 'missing bottom edge layers')
  assert.match(base[1], /bottom:0/, 'both layers must sit at the bottom edge')
  assert.match(base[1], /right:var\(--dsh-wt-scrollRail\)/, 'the layers must stop before the scrollbar')
  assert.match(base[1], /opacity:0/, 'the layers start hidden')
  assert.match(base[1], /pointer-events:none/, 'the layers must not intercept input')
  const halo = [...css.matchAll(/\.dsh-wt-listViewport::before\{([^}]*)\}/g)].find(match => match[1].includes('backdrop-filter'))
  assert.ok(halo, 'missing the soft outer halo')
  assert.match(halo[1], /height:calc\(var\(--wt-space-6\) \+ var\(--wt-space-4\)\)/, 'the halo must cover 48px')
  assert.match(halo[1], /backdrop-filter:blur\(1px\)/, 'the halo must be a low-strength blur')
  assert.match(halo[1], /mask-image:linear-gradient\(to top,color-mix\(in srgb,currentColor 42%,transparent\)/, 'the halo needs a long alpha ramp')
  const fade = [...css.matchAll(/\.dsh-wt-listViewport::after\{([^}]*)\}/g)].find(match => match[1].includes('height:calc'))
  assert.ok(fade, 'missing bottom fade overlay')
  assert.match(fade[1], /height:calc\(var\(--wt-space-5\) \+ var\(--wt-space-1\)\)/, 'the inner fade stays 28px')
  assert.match(fade[1], /background:linear-gradient\(to top,var\(--dsw-specific-menu\) 0%/, 'the inner layer needs a five-stop surface gradient')
  assert.match(fade[1], /48%,transparent\) 58%/, 'the gradient must fade through intermediate alpha stops')
  assert.match(fade[1], /backdrop-filter:blur\(2px\)/, 'the inner layer keeps the gentle 2px blur')
  assert.match(fade[1], /mask-image:linear-gradient\(to top,currentColor,color-mix\(in srgb,currentColor 65%,transparent\) 32%/, 'the inner mask needs a long ramp')
  assert.match(css, /\.dsh-wt-listViewport\[data-bottom="true"\]::before,\.dsh-wt-listViewport\[data-bottom="true"\]::after\{opacity:1\}/)
  // It lives outside the scroller and follows scroll + ResizeObserver state.
  assert.match(client, /className: 'dsh-wt-listViewport'[\s\S]{0,240}className: 'dsh-wt-listArea', ref: listRef/)
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
  const actions = rules.find(rule => rule.selector === '.dsh-wt-actions' && rule.media.includes('hover:hover'))
  assert.ok(actions, 'action row visibility must be decided under the hover media query')
  assert.match(actions.body, /opacity:0/)
  const base = rules.find(rule => rule.selector === '.dsh-wt-actions' && rule.media === '')
  assert.ok(base, 'action row needs a hover-less default')
  assert.doesNotMatch(base.body, /opacity:0/, 'touch devices must keep the row actions visible')
})

test('no product copy is hardcoded outside the dictionary', () => {
  const client = read('client.js')
  const start = client.indexOf('    const DICT = ')
  const end = client.indexOf('\n\n    const CSS = [')
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
  const client = read('client.js')
  assert.match(client, /@deepseek-ai\/dsh-client-ui-primitives/)
  assert.match(client, /ctx\.slots\.inject\('shell\.overlay'/)
  assert.match(client, /name: 'shell\.overlay'/)
  assert.match(client, /h\(Toast, \{/)
  for (const kind of ['copied', 'forwarded', 'deleted', 'cleared', 'copyFailed', 'forwardFailed', 'saveFailed']) {
    assert.match(client, new RegExp(`toast\\.${kind}`), `missing toast copy for ${kind}`)
  }
  assert.doesNotMatch(client, /dsh-wt-copied|dsh-wt-forwarded/, 'inline success marks duplicate the toast')
})

test('a failed write keeps the row and says so', () => {
  const client = read('client.js')
  assert.match(client, /if \(!ok\) return false/)
  assert.match(client, /if \(!ok\) \{\n\s+report\('saveFailed'\)/)
  assert.match(client, /A failed delete keeps the row/)
})

test('icon-only controls use the shared tooltip', () => {
  const client = read('client.js')
  assert.match(client, /function withTooltip\(/)
  assert.match(client, /h\(Tooltip, \{ label, side: 'top'/)
  const iconButtons = [...client.matchAll(/className: 'dsh-wt-iconBtn[^']*',\n\s+'aria-label': say\('([^']+)'\)/g)].map(match => match[1])
  assert.equal(iconButtons.length, 4, 'all four row actions must be present')
  const buttonTitles = [...client.matchAll(/'aria-label': say\('[^']+'\),\n\s+title:/g)]
  assert.deepEqual(buttonTitles, [], 'aria-labelled buttons must not carry a second native title')
})

test('animations and transitions stay tokenised', () => {
  const css = readCss()
  const animations = [...css.matchAll(/@keyframes [^{]+\{([^@]*)\}\}/g)].map(match => match[1])
  for (const frames of animations) {
    const props = [...frames.matchAll(/([a-z-]+):/g)].map(match => match[1])
    for (const prop of props) assert.ok(['opacity', 'transform'].includes(prop), `animates ${prop}`)
  }
  for (const match of css.matchAll(/transition:[^;}]+/g)) {
    assert.doesNotMatch(match[0], /(?<!var\(--wt-dur)[^)]\b\d+m?s\b/, `untokenised duration in "${match[0]}"`)
  }
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
  assert.match(css, /@media \(prefers-reduced-motion:no-preference\)/)
})

test('the panel opens in place with an opacity fade', () => {
  const css = readCss()
  assert.match(css, /@keyframes dsh-wt-pop-in\{from\{opacity:0\}to\{opacity:1\}\}/, 'the panel keyframes must be opacity only')
  assert.doesNotMatch(css, /@keyframes dsh-wt-pop-in\{[^@]*?(?:transform|translate|scale)/, 'the panel must not move or scale on open')
})

test('the prefix input shares the child title text box', () => {
  const css = readCss()
  const input = css.match(/\.dsh-wt-settingInput\{([^}]*)\}/)
  assert.ok(input, 'missing settingInput rule')
  assert.doesNotMatch(input[1], /font:inherit/, 'the shorthand must not reset the type')
  assert.match(input[1], /font-size:var\(--wt-fs-row\)/, 'input must use the child title size')
  assert.match(input[1], /line-height:var\(--wt-lh-row\)/, 'input must use the child title line box')
  assert.match(input[1], /font-weight:500/, 'input text must match the 500-weight title')
  assert.match(css, /\.dsh-wt-settingItem>\.dsh-wt-settingInput\{[^}]*font-size:var\(--wt-fs-row\)/, 'host input CSS must not win')
  assert.match(read('client.js'), /fontWeight: 500/, 'the inline guard must keep the title weight')
})

test('section toggles stay inside the scrolling list', () => {
  const css = readCss()
  // .dsh-wt-listArea clips on the x axis, so any horizontal pull on a section
  // toggle (margin-left, including the calc(* -1) form) slices the rounded left
  // edge off its hover pill.
  assert.doesNotMatch(
    css,
    /[^{}]*\.dsh-wt-(?:doneToggle|sectionHead|doneHead)[^{]*\{[^}]*margin-left:/,
    'section toggles must not pull left: .dsh-wt-listArea clips the rounded edge',
  )
})

test('the section counts carry the status hierarchy', () => {
  const css = readCss()
  // Section labels are quiet captions now, so the panel title is the only
  // 14px/500 line at the top of the popover.
  assert.match(css, /\.dsh-wt-doneToggle\{[^}]*font-size:var\(--wt-fs-caption\)/)
  assert.match(css, /\.dsh-wt-doneToggle\{[^}]*color:var\(--dsw-alias-label-secondary\)/)
  assert.match(css, /\.dsh-wt-popMeta\{[^}]*font-size:var\(--wt-fs-caption\)/)
  assert.match(css, /\.dsh-wt-popMeta\{[^}]*font-weight:400/)
  assert.match(css, /\.dsh-wt-popMeta\{[^}]*line-height:16px/)
  // The title and count share one line, and the two icon actions sit together
  // at the right, so the meta reads as a status instead of a second title.
  assert.match(css, /\.dsh-wt-popTitleLine\{[^}]*flex:1 1 auto/)
  assert.match(css, /\.dsh-wt-popActions\{[^}]*display:flex/)
  const client = read('client.js')
  assert.match(client, /className: 'dsh-wt-popActions'/)
  assert.match(client, /className: 'dsh-wt-popTitleLine' \},\n\s+h\('div', \{ className: 'dsh-wt-popTitle' \}[^]*?h\('p', \{ className: 'dsh-wt-popMeta' \}/)
  // Completed work gets the only success tint; an empty open section shows no
  // zero badge, which is noise rather than information.
  assert.match(
    css,
    /\.dsh-wt-sectionCount\[data-tone="done"\]\{[^}]*border-color:var\(--dsw-alias-state-success-primary\)[^}]*background:var\(--dsw-alias-state-success-tertiary\)[^}]*color:var\(--dsw-alias-label-primary\)/,
  )
  assert.match(client, /openCount \? h\('span', \{ className: 'dsh-wt-sectionCount' \}, String\(openCount\)\) : null/)
  assert.match(client, /h\('span', \{ className: 'dsh-wt-sectionCount', 'data-tone': 'done' \}/)
  // Cards and the add field share one card surface so the panel material stays
  // the quietest layer, while the 0.5px card edge stays the strongest line.
  assert.match(css, /\.dsh-wt-add\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/)
  assert.match(css, /\.dsh-wt-rows\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/)
})

test('the panel never raises the soft keyboard on touch devices', () => {
  const client = read('client.js')
  assert.match(client, /\(hover: hover\) and \(pointer: fine\)/)
})

test('completed notes sort by newest completion', () => {
  const client = read('client.js')
  const extract = name => {
    const start = client.indexOf(`function ${name}(`)
    assert.ok(start > 0, `missing ${name}`)
    const end = client.indexOf('\n    }\n', start) + '\n    }\n'.length
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