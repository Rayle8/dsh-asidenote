/**
 * Builds the browser bundle for AsideNote.
 *
 * The shell loads a `dsh.client` package through its `./client` export as a
 * classic script: `window.__ModuleLoader__.load({ id, factory })`, where the
 * factory receives a `require` bound to the frozen module table. The output
 * below is exactly that closure — nothing else. React and the shared
 * primitives stay external; everything else is inlined.
 *
 * Mirrors the client preset of the two reference plugins:
 * https://github.com/bowenliang123/dsh-context and https://github.com/dsh-market/dsh-market
 */
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve as resolvePath } from 'node:path'
import { defineConfig, type TsdownPlugin } from 'tsdown'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

const CSS_INLINE = '?inline'
const CSS_VIRTUAL_PREFIX = '\0dsh-css:'

/**
 * `import css from './x.css?inline'` yields the file's text.
 *
 * The sheet is injected by the entry module rather than by the bundler, so the
 * plugin owns one <style> tag and can remove it on dispose. The virtual id must
 * not end in `.css`: the tsdown css pipeline matches on that suffix.
 */
function inlineCss(): TsdownPlugin {
  return {
    name: 'dsh-css-inline',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith(`.css${CSS_INLINE}`)) return null
      const file = source.slice(0, -CSS_INLINE.length)
      const absolute = importer ? resolvePath(dirname(importer), file) : file
      // Keep the virtual id relative and slash-separated: rolldown echoes it in
      // a comment, so an absolute path would leak the author's machine, and a
      // Windows "\" would make the bundle differ from the Linux CI artifact by
      // one byte and fail the committed-bundle gate.
      const id = relative(process.cwd(), absolute).replaceAll('\\', '/')
      return CSS_VIRTUAL_PREFIX + id + '.mjs'
    },
    load(id: string) {
      if (!id.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const file = resolvePath(process.cwd(), id.slice(CSS_VIRTUAL_PREFIX.length, -'.mjs'.length))
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

// tsdown loads this file by convention, so nothing in the project imports it.
// noinspection JSUnusedGlobalSymbols
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
  // CJS would default to Node, but this is a browser classic script; name the
  // platform rather than inheriting the format default.
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
