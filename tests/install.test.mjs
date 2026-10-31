import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const SCRIPT = fileURLToPath(new URL('../scripts/install.mjs', import.meta.url))

function makeProfile(manifest, t) {
  const dir = mkdtempSync(join(tmpdir(), 'asidenote-install-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  writeFileSync(join(dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return dir
}

function manifestOf(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
}

function runInstaller(dir, args = []) {
  // The DSH shell exports DSH_PROFILE_DIR; an explicit --profile-dir must win,
  // but clear it anyway so a stray environment cannot redirect the test.
  const env = { ...process.env }
  delete env.DSH_PROFILE_DIR
  return spawnSync(process.execPath, [SCRIPT, '--profile-dir', dir, ...args], { encoding: 'utf8', env })
}

function runRaw(args, env) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env })
}

/**
 * A `pnpm` that stands in for the package manager and leaves behind what a real
 * install would: the installed manifest and the client bundle the script checks
 * for. It keeps the network out of the test.
 */
function fakePnpm(t) {
  const dir = mkdtempSync(join(tmpdir(), 'asidenote-pnpm-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  const bin = join(dir, 'pnpm')
  writeFileSync(bin, installScript())
  chmodSync(bin, 0o755)
  return dir
}

/** What a package manager leaves behind: the installed manifest and bundle. */
function installScript() {
  return [
    '#!/bin/sh',
    'set -e',
    'mkdir -p node_modules/dsh-aside-note/client',
    `printf '{"version":"1.0.0"}' > node_modules/dsh-aside-note/package.json`,
    `printf '// bundle\\n' > node_modules/dsh-aside-note/client/client.js`,
    '',
  ].join('\n')
}

/**
 * A stand-in for the runtime DeepSeek Harness ships: `<root>/primary-runtime/
 * dependencies/{node,pnpm}`. The node binary is a shell script that runs the
 * install, so the test can tell which toolchain the installer picked.
 */
function fakeRuntime(t) {
  const root = mkdtempSync(join(tmpdir(), 'asidenote-runtime-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const node = join(root, 'primary-runtime', 'dependencies', 'node', 'bin', 'node')
  const pnpm = join(root, 'primary-runtime', 'dependencies', 'pnpm', 'bin', 'pnpm.mjs')
  mkdirSync(dirname(node), { recursive: true })
  mkdirSync(dirname(pnpm), { recursive: true })
  writeFileSync(node, installScript())
  chmodSync(node, 0o755)
  writeFileSync(pnpm, '// stand-in for pnpm.mjs\n')
  return root
}

/** A runtime directory that does not contain a runtime, to pin the PATH path. */
function emptyRuntime(t) {
  const root = mkdtempSync(join(tmpdir(), 'asidenote-noruntime-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  return root
}

const BASE = {
  name: 'test-profile',
  private: true,
  dependencies: {},
  dsh: { profile: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'] } },
}

test('a fresh profile gets the dependency and the bundle line', (t) => {
  const dir = makeProfile(structuredClone(BASE), t)

  const result = runInstaller(dir, ['--no-install'])
  assert.equal(result.status, 0, result.stderr)

  const manifest = manifestOf(dir)
  assert.equal(manifest.dependencies['dsh-aside-note'], '^1.0.0')
  assert.deepEqual(manifest.dsh.profile.bundles, [
    '@deepseek-ai/dsh-base',
    '@deepseek-ai/dsh-web-app',
    'dsh-aside-note',
  ])
  assert.ok(existsSync(join(dir, '.local-backup')), 'the manifest is backed up before it is edited')
})

test(
  'a finished install says how to make the entry appear in the Plugins page',
  { skip: process.platform === 'win32' && 'the stand-in pnpm is a POSIX shell script' },
  (t) => {
    const dir = makeProfile(structuredClone(BASE), t)
    const shim = fakePnpm(t)
    const env = {
      ...process.env,
      PATH: `${shim}:${process.env.PATH}`,
      // Pin the search away from a real DeepSeek Harness install on this machine.
      DSH_RUNTIME_DIR: emptyRuntime(t),
    }
    delete env.DSH_PROFILE_DIR

    const result = spawnSync(process.execPath, [SCRIPT, '--profile-dir', dir], { encoding: 'utf8', env })

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /installed: dsh-aside-note@1\.0\.0/)
    assert.match(result.stdout, /After install/)
    assert.match(result.stdout, /Plugins page/)
    assert.match(result.stdout, /旁边记/)
    assert.match(result.stdout, /off\s+and on once/)
    // The DSH client has no page reload; the entry is expected right after install.
    assert.doesNotMatch(result.stdout, /reload the page/i)
  },
)

test(
  'the install runs on the runtime DeepSeek Harness ships, not on PATH',
  { skip: process.platform === 'win32' && 'the stand-in node is a POSIX shell script' },
  (t) => {
    const dir = makeProfile(structuredClone(BASE), t)
    const runtime = fakeRuntime(t)
    // A PATH pnpm that would leave a marker the test can look for: if the
    // installer picked it, the assertion below fails loudly instead of passing
    // by accident.
    const shim = fakePnpm(t)
    writeFileSync(join(shim, 'pnpm'), `#!/bin/sh\nprintf 'path-pnpm-ran' >> "${join(dir, 'path-pnpm.log')}"\nexit 1\n`)
    chmodSync(join(shim, 'pnpm'), 0o755)
    const env = {
      ...process.env,
      PATH: `${shim}:${process.env.PATH}`,
      DSH_RUNTIME_DIR: runtime,
    }
    delete env.DSH_PROFILE_DIR

    const result = spawnSync(process.execPath, [SCRIPT, '--profile-dir', dir], { encoding: 'utf8', env })

    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /DSH runtime/)
    assert.equal(existsSync(join(dir, 'path-pnpm.log')), false, 'the PATH pnpm must not be used')
  },
)

test('re-running is idempotent and keeps the existing bundle order', (t) => {
  const manifest = structuredClone(BASE)
  manifest.dependencies['dsh-aside-note'] = '~0.9.9'
  manifest.dsh.profile.bundles.splice(1, 0, 'dsh-aside-note')
  const dir = makeProfile(manifest, t)

  assert.equal(runInstaller(dir, ['--no-install']).status, 0)
  assert.equal(runInstaller(dir, ['--no-install']).status, 0)

  const after = manifestOf(dir)
  assert.equal(after.dependencies['dsh-aside-note'], '^1.0.0')
  assert.deepEqual(after.dsh.profile.bundles, [
    '@deepseek-ai/dsh-base',
    'dsh-aside-note',
    '@deepseek-ai/dsh-web-app',
  ])
})

test('--dry-run reports the plan without touching the manifest', (t) => {
  const dir = makeProfile(structuredClone(BASE), t)
  const before = readFileSync(join(dir, 'package.json'), 'utf8')

  const result = runInstaller(dir, ['--dry-run'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /would update package\.json/)
  assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), before)
  assert.equal(existsSync(join(dir, '.local-backup')), false)
})

test('--version writes the exact range it was given', (t) => {
  const dir = makeProfile(structuredClone(BASE), t)

  assert.equal(runInstaller(dir, ['--no-install', '--version', '2.0.1']).status, 0)
  assert.equal(manifestOf(dir).dependencies['dsh-aside-note'], '2.0.1')
})

test('a directory that is not a DSH profile is refused untouched', (t) => {
  const dir = makeProfile({ name: 'not-a-profile', private: true }, t)
  const before = readFileSync(join(dir, 'package.json'), 'utf8')

  const result = runInstaller(dir, ['--no-install'])
  assert.equal(result.status, 1)
  assert.match(result.stderr, /does not look like a DSH profile/)
  assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), before)
  assert.equal(readdirSync(dir).includes('.local-backup'), false)
})

test('a missing profile points at --profile instead of failing obscurely', (t) => {
  const dir = join(mkdtempSync(join(tmpdir(), 'asidenote-missing-')), 'nope')
  t.after(() => rmSync(dirname(dir), { recursive: true, force: true }))

  const result = runInstaller(dir)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /No DSH profile at/)
})

test('a machine without DSH is told to install the client first', (t) => {
  const home = mkdtempSync(join(tmpdir(), 'asidenote-home-'))
  t.after(() => rmSync(home, { recursive: true, force: true }))
  const env = { ...process.env, DSH_HOME: home }
  delete env.DSH_PROFILE_DIR
  delete env.DSH_PROFILE

  const result = runRaw([], env)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /DeepSeek Harness does not look installed yet/)
  assert.equal(readdirSync(home).length, 0, 'nothing is written when DSH is absent')
})
