/**
 * Browser client bundle for the notes plugin.
 *
 * The shell loads a `dsh.client` package's `./client` export as a classic
 * script: `window.__ModuleLoader__.load({ id, factory })`, where the factory
 * receives a `require` bound to the frozen module table. The output below is
 * exactly that closure — nothing else. React and the shared primitives stay
 * external; everything else is inlined.
 *
 * Mirrors the client preset of the two reference plugins:
 * https://github.com/bowenliang123/dsh-context and https://github.com/dsh-market/dsh-market
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { defineConfig } from 'tsdown'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const CSS_INLINE = '?inline'
const CSS_VIRTUAL_PREFIX = '\0dsh-css:'

/**
 * `import css from './x.css?inline'` yields the file's text.
 *
 * The sheet is injected by the entry module rather than by the bundler, so the
 * plugin owns one <style> tag and can remove it on dispose. The virtual id must
 * not end in `.css`: tsdown's own css pipeline matches on that suffix.
 */
function inlineCss() {
  return {
    name: 'dsh-css-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith(`.css${CSS_INLINE}`)) return null
      const file = source.slice(0, -CSS_INLINE.length)
      return CSS_VIRTUAL_PREFIX + (importer ? resolvePath(dirname(importer), file) : file) + '.mjs'
    },
    load(id: string) {
      if (!id.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const file = id.slice(CSS_VIRTUAL_PREFIX.length, -'.mjs'.length)
      return `export default ${JSON.stringify(readFileSync(file, 'utf8'))}`
    },
  }
}

/** Modules the loader seeds into the factory's `require`; never bundled. */
const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/dsh-client-ui-primitives',
]

export default defineConfig({
  entry: { client: 'src/client/index.ts' },
  // package.json exports "./client" → "./client/client.js".
  outDir: 'client',
  format: 'cjs',
  target: 'es2022',
  dts: false,
  sourcemap: false,
  // The bundle is committed and reviewed like source; minification would turn
  // every change into a whole-file diff.
  minify: false,
  clean: false,
  // CJS normally targets Node; this one is a browser classic script, so say so
  // explicitly instead of relying on the format's default platform.
  inputOptions: { platform: 'browser' },
  deps: {
    neverBundle: CLIENT_EXTERNALS,
    // Anything not in the loader's module table must inline: a require() the
    // table cannot answer throws at boot.
    alwaysBundle: source => (CLIENT_EXTERNALS.includes(source) ? undefined : true),
  },
  plugins: [inlineCss()],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
})
