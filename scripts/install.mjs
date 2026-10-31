#!/usr/bin/env node
/**
 * One-command installer for the AsideNote plugin.
 *
 * It edits the DSH profile manifest (dependency + `dsh.profile.bundles`), runs
 * the profile's package manager, then verifies what actually landed. It never
 * touches the repository, the registry configuration or other dependencies, and
 * it is safe to re-run: an already-configured profile is left as it is.
 *
 * Usage:
 *   npx dsh-aside-note install                     # DSH_PROFILE_DIR, else "desktop"
 *   npx dsh-aside-note install --profile work      # ~/.dsh/profiles/work (or %USERPROFILE%\.dsh\profiles\work)
 *   npx dsh-aside-note install --profile-dir <dir> # explicit profile directory
 *   npx dsh-aside-note install --version 1.0.0    # exact pin instead of ^1.0.0
 *   npx dsh-aside-note install --dry-run          # print the plan, change nothing
 *   npx dsh-aside-note install --no-install       # edit the manifest only
 *
 * A profile edit does not need a restart: DSH re-composes the profile within
 * about a second, and the page picks the new client bundle up on its next load.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const PACKAGE = 'dsh-aside-note'
const DEFAULT_RANGE = '^1.0.0'

const USAGE = `Usage: dsh-aside-note install [options]

Installs the AsideNote plugin into a DSH profile: it adds the dependency, adds
the bundle line, runs the profile's package manager and verifies the result.

Options:
  --profile <name>     Profile name under ~/.dsh/profiles (default: desktop)
  --profile-dir <dir>  Explicit profile directory
  --version <range>    Version range to install (default: ${DEFAULT_RANGE})
  --dry-run            Show what would change, write nothing
  --no-install         Only edit the manifest; skip the package manager
  -h, --help           Show this help
`

const args = new Map()
for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (!arg.startsWith('--')) continue
  const [key, inline] = arg.slice(2).split('=')
  const value = inline ?? (process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i] ?? true)
  args.set(key, value)
}

if (args.has('help') || args.has('h')) {
  process.stdout.write(USAGE)
  process.exit(0)
}

const range = typeof args.get('version') === 'string' ? args.get('version') : DEFAULT_RANGE
const dryRun = args.has('dry-run')
const skipInstall = args.has('no-install')

function fail(message) {
  console.error(`\n✗ ${message}`)
  process.exit(1)
}

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function profilesRoot() {
  return join(dshHome(), 'profiles')
}

function profileName() {
  return typeof args.get('profile') === 'string' ? args.get('profile') : process.env.DSH_PROFILE || 'desktop'
}

function profileDir() {
  const explicit = args.get('profile-dir')
  if (typeof explicit === 'string') return resolve(explicit)
  // DSH sets this in the shells it spawns, so a bare run lands on the profile
  // the caller is actually using.
  if (process.env.DSH_PROFILE_DIR) return resolve(process.env.DSH_PROFILE_DIR)
  return join(profilesRoot(), profileName())
}

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    // pnpm is a .cmd shim on Windows; Node refuses to execute those directly.
    shell: process.platform === 'win32',
  })
  return !result.error && result.status === 0
}

const dir = profileDir()
const manifestPath = join(dir, 'package.json')
if (!existsSync(manifestPath)) {
  const detail =
    typeof args.get('profile-dir') === 'string'
      ? `No DSH profile at ${dir}: expected a package.json with a dsh.profile section.`
      : existsSync(profilesRoot())
        ? `No profile "${profileName()}" under ${profilesRoot()}. Pass --profile <name>, or start DSH once to create it.`
        : `DeepSeek Harness does not look installed yet (no ${profilesRoot()}).\nInstall the DeepSeek Harness client, start it once, then run this command again.`
  fail(`${detail}\n  Looked for ${manifestPath}`)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''))
if (!manifest.dsh?.profile) {
  fail(`${manifestPath} does not look like a DSH profile (missing dsh.profile). Refusing to edit it.`)
}

const before = JSON.stringify(manifest)
manifest.dependencies ??= {}
const previous = manifest.dependencies[PACKAGE]
manifest.dependencies[PACKAGE] = range

const bundles = (manifest.dsh.profile.bundles ??= [])
if (!bundles.includes(PACKAGE)) bundles.push(PACKAGE)

const changed = JSON.stringify(manifest) !== before
console.log(`profile : ${dir}`)
console.log(`package : ${PACKAGE}@${range}${previous && previous !== range ? `  (was ${previous})` : ''}`)
console.log(`bundles : ${bundles.join(', ')}`)

if (dryRun) {
  console.log(changed ? '\n(dry run) would update package.json and run the package manager' : '\n(dry run) already up to date')
  process.exit(0)
}

if (changed) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = join(dir, '.local-backup', `install-${stamp}`)
  mkdirSync(backupDir, { recursive: true })
  copyFileSync(manifestPath, join(backupDir, 'package.json'))
  if (existsSync(join(dir, 'pnpm-lock.yaml'))) {
    copyFileSync(join(dir, 'pnpm-lock.yaml'), join(backupDir, 'pnpm-lock.yaml'))
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`backup  : ${backupDir}`)
} else {
  console.log('manifest: already configured')
}

if (skipInstall) {
  console.log('\nManifest written (--no-install). Run `pnpm install` in the profile directory to finish.')
  process.exit(0)
}

console.log('\nRunning pnpm install …')
const installed = run('pnpm', ['install'], dir) || run('corepack', ['pnpm', 'install'], dir)
if (!installed) {
  fail('pnpm install failed. Install pnpm (corepack enable) and re-run, or run `pnpm install` in the profile directory.')
}

const installedManifest = join(dir, 'node_modules', PACKAGE, 'package.json')
if (!existsSync(installedManifest)) {
  fail(`Install finished but ${PACKAGE} is not in node_modules. Check the output above and run \`pnpm install\` again.`)
}
const { version } = JSON.parse(readFileSync(installedManifest, 'utf8'))
const bundleFile = join(dir, 'node_modules', PACKAGE, 'client', 'client.js')
if (!existsSync(bundleFile)) fail(`Installed ${PACKAGE}@${version} has no client/client.js — the package is incomplete.`)

console.log(`\n✓ installed: ${PACKAGE}@${version}`)
console.log(`  bundle    : ${bundleFile}`)
console.log('\nNo restart needed: the profile is re-composed within ~1s, and the page picks the new')
console.log('bundle up on its next load. Notes live in the browser localStorage (dsh.aside-notes.*.v2);')
console.log('nothing is written to projects.')
