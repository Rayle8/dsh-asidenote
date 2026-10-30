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
  assert.match(client, /FORWARDED_STORAGE_KEY/)
  assert.match(client, /dsh-wt-forwardMark/)
  assert.match(client, /item\.forwarded/)
  assert.doesNotMatch(client, /dsh-wt-checkHalf|dsh-wt-checkForwarded|HALF_DONE_|item\.pendingCountdown|settings\.halfCheck/)
  assert.match(client, /edit\.hintEnter/)
  assert.match(client, /settings\.forwardMark/)
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
  // The clear-completed confirmation is localised in both bundles and both files.
  assert.equal(zh['popover.clearConfirm'], '清除 {n} 项已完成便笺？')
  assert.equal(en['popover.clearConfirm'], 'Clear {n} completed notes?')
  assert.equal(zh['popover.clearCancel'], '取消')
  assert.equal(en['popover.clearCancel'], 'Cancel')
  assert.equal(zh['popover.clearConfirmAction'], '确认清除')
  assert.equal(en['popover.clearConfirmAction'], 'Clear')
  // The forwarded tooltip names the toggle-off gesture, in both bundles.
  assert.match(zh['item.forwarded'], /移除标识/)
  assert.match(en['item.forwarded'], /remove the mark/)
  assert.ok(zh['toast.unforwarded'], 'zh.json is missing toast.unforwarded')
  assert.ok(en['toast.unforwarded'], 'en.json is missing toast.unforwarded')
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

test('scrollbars keep the shared theme skin', () => {
  const css = readCss()
  assert.doesNotMatch(css, /::-webkit-scrollbar/, 'component scrollbar selectors replace the shared skin')
  assert.doesNotMatch(css, /scrollbar-width|scrollbar-color/, 'the standard scrollbar properties silence the shared hover skin')
  assert.match(css, /--dsh-scrollbar-thumb:var\(--dsw-alias-scrollbar-bg-l2\)/)
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
  for (const kind of ['copied', 'forwarded', 'unforwarded', 'deleted', 'cleared', 'copyFailed', 'forwardFailed', 'saveFailed']) {
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
  const iconButtons = [...client.matchAll(/className: 'dsh-wt-iconBtn[^']*',\n\s+'aria-label': say\(([^)]+)\)/g)]
  assert.equal(iconButtons.length, 4, 'all four row actions must be present')
  const buttonTitles = [...client.matchAll(/'aria-label': say\('[^']+'\),\n\s+title:/g)]
  assert.deepEqual(buttonTitles, [], 'aria-labelled buttons must not carry a second native title')
})

test('completed notes hide the forward action and keep the other three', () => {
  const client = read('client.js')
  const start = client.indexOf("className: 'dsh-wt-actions'")
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
    assert.doesNotMatch(match[0], /(?<!var\(--wt-dur)[^)]\b\d+m?s\b/, `untokenised duration in "${match[0]}"`)
  }
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/)
  assert.match(css, /@media \(prefers-reduced-motion:no-preference\)/)
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
  // Both counts share the one neutral badge style: the completed number is not
  // important, so it must not draw attention with a success tint. An empty open
  // section still shows no zero badge, which is noise rather than information.
  assert.doesNotMatch(css, /\.dsh-wt-sectionCount\[data-tone/, 'no done-specific count badge rule')
  assert.doesNotMatch(client, /data-tone/, 'no done-specific count badge attribute')
  assert.match(
    css,
    /\.dsh-wt-sectionCount\{[^}]*border:0\.5px solid var\(--dsw-alias-border-l3\)[^}]*background:var\(--dsw-alias-interactive-bg-hover-solid\)[^}]*color:var\(--dsw-alias-label-primary\)/,
  )
  assert.match(client, /openCount \? h\('span', \{ className: 'dsh-wt-sectionCount' \}, String\(openCount\)\) : null/)
  assert.match(client, /h\('span', \{ className: 'dsh-wt-sectionCount' \}, String\(doneItems\.length\)\)/)
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

test('send shortcuts default to Enter and name the platform modifier', () => {
  const client = read('client.js')
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
  const client = read('client.js')
  // The checkbox renders only the note's own open/done state.
  assert.match(client, /'aria-checked': checked \? 'true' : 'false'/)
  assert.doesNotMatch(client, /aria-checked': checked \? 'true' : half/)
  // The forwarded state lives on the forward action as a small check badge.
  assert.match(client, /'data-forwarded': forwarded \? 'true' : undefined/)
  assert.match(client, /className: 'dsh-wt-forwardMark'/)
  assert.match(client, /item\.forwarded/)
  // Forwarding no longer stages a delayed completion.
  assert.doesNotMatch(client, /setPendingDone|startPending|clearPendingTimers/)
  assert.match(client, /const toggleCheck = \(\) => onToggle\(item\)/)
})

test('the forwarded mark borrows the forward icon palette, not a state colour', () => {
  const client = read('client.js')
  const rule = readCss().match(/\.dsh-wt-forwardMark\{([^}]*)\}/)
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
  assert.match(client, /className: 'dsh-wt-forwardMark', 'aria-hidden': true \}, h\(IconCheck, \{ size: 8 \}\)/)
})

test('clicking a forwarded note removes the mark instead of forwarding again', () => {
  const client = read('client.js')
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
  const client = read('client.js')
  assert.match(client, /const \[confirmClear, setConfirmClear\] = React\.useState\(false\)/)
  assert.match(client, /const clearConfirmTimerRef = React\.useRef\(0\)/)
  // The section button opens the band; it never clears on the first click.
  assert.match(client, /className: 'dsh-wt-clear',\n\s+'aria-expanded': confirmClear \? 'true' : 'false',\n\s+onClick: askClearConfirm/)
  assert.doesNotMatch(client, /className: 'dsh-wt-clear', onClick: clearDone/)
  assert.match(client, /const askClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(true\)/)
  // Cancel and confirm both close the band; only confirm reaches clearDone.
  assert.match(client, /const dismissClearConfirm = \(\) => \{\n\s+stopClearConfirmTimer\(\)\n\s+setConfirmClear\(false\)\n\s+\}/)
  assert.match(client, /const confirmClearDone = \(\) => \{\n\s+dismissClearConfirm\(\)\n\s+clearDone\(\)\n\s+\}/)
  assert.match(client, /onClick: dismissClearConfirm \}, say\('popover\.clearCancel'\)/)
  assert.match(client, /onClick: confirmClearDone \}, say\('popover\.clearConfirmAction'\)/)
  // The band names the completed count and is announced politely.
  assert.match(client, /className: 'dsh-wt-clearConfirm',\n\s+role: 'group',\n\s+'aria-live': 'polite',/)
  assert.match(client, /say\('popover\.clearConfirm', \{ n: doneItems\.length \}\)/)
  // Five-second auto-dismiss, with every teardown path dropping the timer.
  assert.match(client, /const CLEAR_CONFIRM_MS = 5000/)
  assert.match(client, /clearConfirmTimerRef\.current = window\.setTimeout\(\(\) => \{\n\s+clearConfirmTimerRef\.current = 0\n\s+setConfirmClear\(false\)\n\s+\}, CLEAR_CONFIRM_MS\)/)
  assert.match(client, /React\.useEffect\(\(\) => \(\) => stopClearConfirmTimer\(\), \[\]\)/)
  assert.match(client, /if \(confirmClear && \(!showDone \|\| doneItems\.length === 0\)\) dismissClearConfirm\(\)/)
  assert.match(client, /React\.useEffect\(\(\) => \{\n\s+dismissClearConfirm\(\)\n\s+\}, \[sessionId\]\)/)
})

test('the clear confirmation band reuses card tokens and a danger confirm', () => {
  const css = readCss()
  assert.match(
    css,
    /\.dsh-wt-clearConfirm\{[^}]*border:0\.5px solid var\(--dsw-alias-settings-card-stroke\)[^}]*background:var\(--dsw-alias-settings-card-fill\)/,
  )
  assert.match(css, /\.dsh-wt-clearConfirmText\{[^}]*font-size:var\(--wt-fs-caption\)[^}]*color:var\(--dsw-alias-label-primary\)/)
  const rules = cssRules()
  const confirm = rules.find(rule => rule.selector === '.dsh-wt-miniDanger')
  assert.ok(confirm, 'danger confirm rule missing')
  assert.match(confirm.body, /background:var\(--dsw-alias-state-error-primary\)/)
  assert.match(confirm.body, /color:var\(--dsw-alias-label-primary-foreground\)/)
  assert.doesNotMatch(confirm.body, /#[0-9a-f]{3,8}\b|\brgba?\(/i)
  const hover = rules.find(rule => rule.selector === '.dsh-wt-miniDanger:hover:not([disabled])')
  assert.ok(hover, 'danger hover rule must stay inside the hover media block')
  assert.match(hover.media, /hover:hover/)
})

/** Pull one factory-scope function out of client.js, ending at its four-space brace. */
function readFunction(client, name) {
  const start = client.indexOf(`function ${name}(`)
  assert.ok(start > 0, `missing ${name}`)
  const end = client.indexOf('\n    }\n', start) + '\n    }\n'.length
  assert.ok(end > start, `unterminated ${name}`)
  return client.slice(start, end)
}

/** Pull one single-line factory-scope constant out of client.js. */
function readConstant(client, name) {
  const match = client.match(new RegExp(`const ${name} = [^\\n]+`))
  assert.ok(match, `missing const ${name}`)
  return match[0]
}

test('the trash store keeps snapshots per session, newest first, capped at 50', () => {
  const client = read('client.js')
  assert.match(client, /const TRASH_STORAGE_KEY = 'dsh\.memo\.trash\.v1'/)
  const source = [
    readConstant(client, 'TRASH_STORAGE_KEY'),
    readConstant(client, 'TRASH_LIMIT'),
    readConstant(client, 'MAX_TEXT'),
    readConstant(client, 'MAX_ITEMS'),
    readConstant(client, 'TODO_LISTENERS'),
    readFunction(client, 'uid'),
    readFunction(client, 'storage'),
    readFunction(client, 'notifyTodoChange'),
    readFunction(client, 'normalizeItems'),
    readFunction(client, 'emptyTrashStore'),
    readFunction(client, 'readTrashStore'),
    readFunction(client, 'writeTrashStore'),
    readFunction(client, 'normalizeTrashEntry'),
    readFunction(client, 'normalizeTrashEntries'),
    readFunction(client, 'readSessionTrash'),
    readFunction(client, 'archiveTrash'),
    readFunction(client, 'dropTrashEntry'),
    readFunction(client, 'emptyTrash'),
    'return { TODO_LISTENERS, readTrashStore, writeTrashStore, readSessionTrash, archiveTrash, dropTrashEntry, emptyTrash }',
  ].join('\n')

  // The helpers read window.localStorage directly, so give the sandbox one.
  const memory = new Map()
  const previousWindow = globalThis.window
  const localStorage = {
    getItem: key => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => { memory.set(key, String(value)) },
    removeItem: key => { memory.delete(key) },
  }
  globalThis.window = { localStorage }
  try {
    const trash = new Function(source)()
    const note = (id, text, extra = {}) => ({ id, text, done: false, createdAt: 1000, updatedAt: 1000, ...extra })

    assert.deepEqual(trash.readTrashStore(), { version: 1, sessions: {} })

    let notified = 0
    const listener = () => { notified += 1 }
    trash.TODO_LISTENERS.add(listener)
    assert.equal(trash.archiveTrash('s1', [note('a', 'alpha')], 'deleted'), true)
    trash.TODO_LISTENERS.delete(listener)
    assert.ok(notified > 0, 'a successful trash write must notify same-tab listeners')

    const stored = JSON.parse(memory.get('dsh.memo.trash.v1'))
    assert.equal(stored.version, 1)
    assert.ok(Array.isArray(stored.sessions.s1.items), 'trash lives in the separate sessions shape')
    assert.equal(stored.sessions.s1.items.length, 1)

    const first = trash.readSessionTrash('s1')
    assert.equal(first.length, 1)
    assert.ok(typeof first[0].trashId === 'string' && first[0].trashId.length > 0)
    assert.equal(first[0].reason, 'deleted')
    assert.ok(Number.isFinite(first[0].deletedAt))
    // The snapshot keeps the note record shape, it does not rewrite it.
    assert.deepEqual(Object.keys(first[0].item).sort(), ['createdAt', 'done', 'id', 'text', 'updatedAt'])
    assert.equal(first[0].item.text, 'alpha')

    assert.equal(trash.archiveTrash('s1', [note('b', 'beta')], 'cleared'), true)
    const second = trash.readSessionTrash('s1')
    assert.deepEqual(second.map(entry => entry.item.id), ['b', 'a'], 'newest entries come first')
    assert.equal(second[0].reason, 'cleared')

    // Done notes keep their completion stamp in the snapshot.
    assert.equal(trash.archiveTrash('s1', [note('c', 'gamma', { done: true, completedAt: 2000 })], 'cleared'), true)
    const doneEntry = trash.readSessionTrash('s1')[0]
    assert.equal(doneEntry.item.done, true)
    assert.equal(doneEntry.item.completedAt, 2000)

    // Sessions stay separate.
    assert.deepEqual(trash.readSessionTrash('s2'), [])
    assert.deepEqual(trash.readSessionTrash(''), [])

    // The oldest entries fall off past the cap.
    for (let index = 0; index < 55; index += 1) {
      assert.equal(trash.archiveTrash('cap', [note(`cap-${index}`, `note ${index}`)], 'deleted'), true)
    }
    const capped = trash.readSessionTrash('cap')
    assert.equal(capped.length, 50)
    assert.equal(capped[0].item.id, 'cap-54')
    assert.equal(capped[49].item.id, 'cap-5')

    // Corrupt storage reads as empty instead of breaking the panel.
    memory.set('dsh.memo.trash.v1', '{not json')
    assert.deepEqual(trash.readTrashStore(), { version: 1, sessions: {} })
    assert.deepEqual(trash.readSessionTrash('s1'), [])

    // Drop and empty are explicit and report whether anything changed.
    assert.equal(trash.archiveTrash('drop', [note('d1', 'one'), note('d2', 'two')], 'deleted'), true)
    const target = trash.readSessionTrash('drop')[0]
    assert.equal(trash.dropTrashEntry('drop', target.trashId), true)
    assert.deepEqual(trash.readSessionTrash('drop').map(entry => entry.item.id), ['d2'])
    assert.equal(trash.dropTrashEntry('drop', target.trashId), false)
    assert.equal(trash.emptyTrash('drop'), true)
    assert.deepEqual(trash.readSessionTrash('drop'), [])
    assert.equal(trash.emptyTrash('drop'), false)

    // A blocked storage write fails softly; the caller decides what to report.
    localStorage.setItem = () => { throw new Error('blocked') }
    assert.equal(trash.archiveTrash('s3', [note('e1', 'nope')], 'deleted'), false)
    assert.equal(trash.dropTrashEntry('s3', 'missing'), false)
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }
})

test('deleting and clearing completed notes archive snapshots into the trash', () => {
  const client = read('client.js')
  const body = name => {
    const start = client.indexOf(`const ${name} = `)
    assert.ok(start > 0, `missing ${name}`)
    const end = client.indexOf('\n      }', start)
    assert.ok(end > start, `${name} is unterminated`)
    return client.slice(start, end)
  }

  const remove = body('remove')
  const removeCommit = remove.indexOf('const ok = commit(')
  const removeArchive = remove.indexOf("archiveTrash(sessionId, [item], 'deleted')")
  assert.ok(removeCommit >= 0, 'delete must commit the note store')
  assert.ok(removeArchive > removeCommit, 'delete must archive only after a successful commit')
  assert.match(remove, /report\(archived \? 'deleted' : 'archiveFailed'\)/)
  assert.match(remove, /clearEditDraft\(sessionId, item\.id\)/)
  assert.match(remove, /forgetForwardedItems\(item\.id\)/)

  const clearDone = body('clearDone')
  const captureAt = clearDone.indexOf('const clearedItems = items.filter(item => item.done)')
  const clearCommit = clearDone.indexOf('const ok = commit(')
  const clearArchive = clearDone.indexOf("archiveTrash(sessionId, clearedItems, 'cleared')")
  assert.ok(captureAt >= 0, 'clear-done must capture the done snapshots')
  assert.ok(clearCommit > captureAt, 'the snapshots must be captured before the commit')
  assert.ok(clearArchive > clearCommit, 'clear-done must archive only after a successful commit')
  assert.match(clearDone, /report\(archived \? 'cleared' : 'archiveFailed'\)/)
  assert.match(clearDone, /forgetForwardedItems\(clearedItems\.map\(item => item\.id\)\)/)
  assert.match(clearDone, /applySections\(\{ open: sectionsRef\.current\.open, done: false \}\)/)
  // A failed archive never undoes the deletion: the commit runs first and stays.
  assert.doesNotMatch(remove, /commit\([\s\S]*?archiveTrash[\s\S]*?commit\(/)
})

test('the settings panel renders a per-session trash group between forward and About', () => {
  const client = read('client.js')
  assert.match(client, /say\('settings\.trash'\),/)
  assert.match(client, /h\('span', \{ className: 'dsh-wt-settingCount' \}, String\(trashItems\.length\)\) : null/)
  assert.match(client, /say\('trash\.empty'\)/)
  assert.match(client, /className: 'dsh-wt-trashList' \}, trashItems\.map\(trashRow\)\)/)
  assert.match(client, /say\('trash\.clear'\)/)
  assert.match(client, /say\('trash\.restore'\)/)
  assert.match(client, /say\('trash\.delete'\)/)
  assert.match(client, /ageLabel\(entry\.deletedAt, say, localeId\)/)
  assert.match(client, /trash\.reason\.cleared' : 'trash\.reason\.deleted'/)

  const forwardAt = client.indexOf("say('settings.forward')")
  const trashAt = client.indexOf("say('settings.trash')")
  const aboutAt = client.indexOf("say('settings.about')")
  assert.ok(forwardAt > 0 && trashAt > 0 && aboutAt > 0)
  assert.ok(trashAt > forwardAt, 'the trash group follows the forward group')
  assert.ok(aboutAt > trashAt, 'the About group stays last')

  // The panel scopes trash reads and writes to the current session.
  assert.match(client, /React\.useState\(\(\) => readSessionTrash\(sessionId\)\)/)
  assert.match(client, /readSessionTrash\(trashSessionRef\.current\)/)
  assert.match(client, /event\.key !== TRASH_STORAGE_KEY/)
  assert.match(client, /TODO_LISTENERS\.add\(onLocal\)/)
})

test('trash restore commits first, permanent delete only drops, clear empties', () => {
  const client = read('client.js')
  const handler = name => {
    const start = client.indexOf(`const ${name} = `)
    assert.ok(start > 0, `missing ${name}`)
    const end = client.indexOf('\n      }', start)
    assert.ok(end > start, `${name} is unterminated`)
    return client.slice(start, end)
  }

  const restore = handler('restoreTrashEntry')
  const commitAt = restore.indexOf('const ok = commit(currentItems => [{ ...snapshot, updatedAt: now }, ...currentItems])')
  const dropAt = restore.indexOf('dropTrashEntry(trashSessionRef.current, entry.trashId)')
  assert.ok(commitAt >= 0, 'restore must re-add the snapshot through commit()')
  assert.ok(dropAt > commitAt, 'restore must drop the trash entry only after the commit succeeds')
  assert.match(restore, /if \(!ok\) \{\n          report\('saveFailed'\)/)
  assert.match(restore, /report\('trashFailed'\)/)
  assert.match(restore, /report\('trashRestored'\)/)

  const permanent = handler('deleteTrashEntry')
  assert.match(permanent, /dropTrashEntry\(trashSessionRef\.current, entry && entry\.trashId\)/)
  assert.match(permanent, /report\('trashFailed'\)/)
  assert.match(permanent, /report\('trashDeleted'\)/)
  assert.doesNotMatch(permanent, /commit\(/, 'permanent delete must not touch the note store')

  const clear = handler('clearTrash')
  assert.match(clear, /emptyTrash\(trashSessionRef\.current\)/)
  assert.match(clear, /report\('trashFailed'\)/)
  assert.match(clear, /report\('trashCleared'\)/)

  const copy = readDict()
  assert.equal(copy.zh['trash.archiveFailed'], '已删除，但垃圾箱写入失败')
  assert.equal(copy.en['trash.archiveFailed'], 'Deleted, but the trash could not be updated')
  assert.match(client, /archiveFailed: \{ key: 'trash\.archiveFailed' \}/)
  for (const key of ['trash.restored', 'trash.deleted', 'trash.cleared', 'trash.failed', 'trash.archiveFailed']) {
    assert.ok(client.includes(`'${key}'`), `missing copy ${key}`)
  }
})

test('all trash copy matches the locale files in both languages', () => {
  const zh = JSON.parse(read('locale/zh.json'))
  const en = JSON.parse(read('locale/en.json'))
  const dict = readDict()
  const keys = [
    'settings.trash',
    'trash.empty',
    'trash.reason.deleted',
    'trash.reason.cleared',
    'trash.restore',
    'trash.delete',
    'trash.clear',
    'trash.restored',
    'trash.deleted',
    'trash.cleared',
    'trash.failed',
    'trash.archiveFailed',
  ]
  for (const key of keys) {
    assert.ok(dict.zh[key], `DICT.zh is missing ${key}`)
    assert.ok(dict.en[key], `DICT.en is missing ${key}`)
    assert.equal(zh[key], dict.zh[key], `zh.json drifted for ${key}`)
    assert.equal(en[key], dict.en[key], `en.json drifted for ${key}`)
  }
  assert.equal(zh['settings.trash'], '垃圾箱')
  assert.equal(en['settings.trash'], 'Trash')
  assert.equal(zh['trash.empty'], '垃圾箱是空的')
  assert.equal(en['trash.empty'], 'Trash is empty')
})
