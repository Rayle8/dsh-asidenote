#!/usr/bin/env node
/**
 * Changelog and release helper.
 *
 * The working heading is `## next-released`: every change lands there, and the
 * release command turns it into the version section while inserting a fresh
 * empty heading for the next cycle. The publish workflow uses `check` and
 * `extract` so a tag without a matching, non-empty section fails before npm
 * publish instead of silently falling back to generated release notes.
 *
 * Usage:
 *   node tools/release.mjs check <version>    # gate a tag's changelog section
 *   node tools/release.mjs extract <version>  # print the release notes body
 *   node tools/release.mjs check-next         # CI: top section is next-released
 *   node tools/release.mjs prepare <version>  # bump, rename, check, commit, tag
 *   npm run release -- <version> [--dry-run] [--skip-check]
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const NEXT_HEADING = 'next-released'
export const CHANGELOG_FILE = 'CHANGELOG.md'

/** Files a release commit is allowed to touch. `client/client.js` is rebuilt. */
export const RELEASE_FILES = [
  'package.json',
  'src/client/constants.ts',
  CHANGELOG_FILE,
  'client/client.js',
]

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const PLUGIN_VERSION_PATTERN = /(export const PLUGIN_VERSION = ')[^']*(')/

function fail(message) {
  throw new Error(message)
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(version)
  if (!match) fail(`invalid version "${version}" (expected X.Y.Z or X.Y.Z-prerelease)`)
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  }
}

export function compareVersions(left, right) {
  const a = parseVersion(left)
  const b = parseVersion(right)
  for (const part of ['major', 'minor', 'patch']) {
    if (a[part] !== b[part]) return a[part] > b[part] ? 1 : -1
  }
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0
  if (a.prerelease.length === 0) return 1
  if (b.prerelease.length === 0) return -1
  const length = Math.max(a.prerelease.length, b.prerelease.length)
  for (let index = 0; index < length; index += 1) {
    const x = a.prerelease[index]
    const y = b.prerelease[index]
    if (x === undefined) return -1
    if (y === undefined) return 1
    const xNumeric = /^\d+$/.test(x)
    const yNumeric = /^\d+$/.test(y)
    if (xNumeric && yNumeric) {
      if (Number(x) !== Number(y)) return Number(x) > Number(y) ? 1 : -1
    } else if (xNumeric) {
      return -1
    } else if (yNumeric) {
      return 1
    } else if (x !== y) {
      return x > y ? 1 : -1
    }
  }
  return 0
}

/** Split a changelog into `## ` sections, keeping each body's internal lines. */
export function splitSections(text) {
  const sections = []
  let current = null
  for (const line of text.split('\n')) {
    const heading = /^##[ \t]+(.+?)[ \t]*$/.exec(line)
    if (heading) {
      current = { title: heading[1], body: [] }
      sections.push(current)
    } else if (current) {
      current.body.push(line)
    }
  }
  return sections.map(({ title, body }) => ({
    title,
    body: body.join('\n').replace(/^\n+|\n+$/g, ''),
  }))
}

export function findSection(text, title) {
  return splitSections(text).find((section) => section.title === title)
}

export function requireSection(text, title) {
  const section = findSection(text, title)
  if (!section) {
    fail(
      `CHANGELOG.md has no "## ${title}" section; rename "## ${NEXT_HEADING}" to "## ${title}" before tagging`,
    )
  }
  if (!section.body.trim()) {
    fail(`CHANGELOG.md "## ${title}" section is empty; add the release notes before tagging`)
  }
  return section
}

/** Print-ready release notes body for a published version. */
export function extractSection(text, title) {
  return requireSection(text, title).body.trim()
}

/** CI guard: every commit must leave the next release heading at the top. */
export function checkNextReleased(text) {
  const first = splitSections(text)[0]
  if (!first) fail(`CHANGELOG.md has no sections; add "## ${NEXT_HEADING}" at the top`)
  if (first.title !== NEXT_HEADING) {
    fail(
      `CHANGELOG.md must start with "## ${NEXT_HEADING}" (found "## ${first.title}"); ` +
        'release tooling turns that heading into the version section',
    )
  }
  return first
}

/**
 * Turn `## next-released` into `## <version>` and insert a fresh empty
 * `## next-released` above it. Everything else is preserved byte for byte.
 */
export function prepareChangelog(text, version) {
  if (!VERSION_PATTERN.test(version)) {
    fail(`invalid release version "${version}" (expected X.Y.Z or X.Y.Z-prerelease)`)
  }
  const first = checkNextReleased(text)
  if (!first.body.trim()) {
    fail(`CHANGELOG.md "## ${NEXT_HEADING}" is empty; write the release notes before releasing`)
  }
  const heading = new RegExp(`^##[ \\t]+${NEXT_HEADING}[ \\t]*$`, 'm')
  const match = heading.exec(text)
  if (!match) fail(`cannot find the "## ${NEXT_HEADING}" heading`)
  const before = text.slice(0, match.index)
  const after = text.slice(match.index + match[0].length)
  return `${before}## ${NEXT_HEADING}\n\n## ${version}${after}`
}

/** Paths from `git status --porcelain`; never trim the whole output first. */
export function parseStatusPaths(output) {
  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.error) throw result.error
  return result
}

function gitOut(args, cwd) {
  const result = git(args, cwd)
  if (result.status !== 0) {
    fail(`git ${args.join(' ')} failed: ${(result.stderr || '').trim()}`)
  }
  return result.stdout.trim()
}

function repositoryRoot() {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
  if (root.error) throw root.error
  if (root.status !== 0) fail('not inside a git repository')
  return realpathSync(root.stdout.trim())
}

function restore(root, originals) {
  for (const [file, text] of Object.entries(originals)) {
    writeFileSync(join(root, file), text)
  }
}

/**
 * Bump the version, rewrite the changelog, run the full check, then commit and
 * tag. Nothing is pushed: the caller decides when the tag goes public.
 */
export function prepare(version, { dryRun = false, skipCheck = false } = {}) {
  if (!VERSION_PATTERN.test(version)) {
    fail(`invalid release version "${version}" (expected X.Y.Z or X.Y.Z-prerelease)`)
  }
  if (skipCheck && !dryRun) {
    fail('--skip-check is only supported together with --dry-run')
  }
  const root = repositoryRoot()
  const paths = Object.fromEntries(RELEASE_FILES.map((file) => [file, join(root, file)]))
  const originals = Object.fromEntries(
    RELEASE_FILES.map((file) => [file, readFileSync(paths[file], 'utf8')]),
  )

  const manifest = JSON.parse(originals['package.json'])
  if (compareVersions(version, manifest.version) <= 0) {
    fail(`version ${version} must be greater than the current ${manifest.version}`)
  }
  const tag = `v${version}`
  if (git(['rev-parse', '--verify', '--quiet', `refs/tags/${tag}`], root).status === 0) {
    fail(`tag ${tag} already exists`)
  }
  const branch = gitOut(['rev-parse', '--abbrev-ref', 'HEAD'], root)
  if (!dryRun && branch !== 'main') {
    fail(`releases are cut from main (current branch: ${branch})`)
  }
  const dirty = gitOut(['status', '--porcelain', '--untracked-files=no'], root)
  if (dirty) {
    fail(`working tree is dirty:\n${dirty}\ncommit or stash the changes first`)
  }

  const nextChangelog = prepareChangelog(originals[CHANGELOG_FILE], version)
  manifest.version = version
  const nextConstants = originals['src/client/constants.ts'].replace(
    PLUGIN_VERSION_PATTERN,
    `$1${version}$2`,
  )
  if (nextConstants === originals['src/client/constants.ts']) {
    fail('could not find `export const PLUGIN_VERSION = ...` in src/client/constants.ts')
  }

  let committed = false
  try {
    writeFileSync(paths['package.json'], `${JSON.stringify(manifest, null, 2)}\n`)
    writeFileSync(paths['src/client/constants.ts'], nextConstants)
    writeFileSync(paths[CHANGELOG_FILE], nextChangelog)

    if (!skipCheck) {
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
      const check = spawnSync(npm, ['run', 'check'], { cwd: root, stdio: 'inherit' })
      if (check.status !== 0) fail('npm run check failed; no commit or tag was created')
    }

    const status = git(['status', '--porcelain', '--untracked-files=no'], root)
    if (status.status !== 0) fail(`git status failed: ${(status.stderr || '').trim()}`)
    const changed = parseStatusPaths(status.stdout)
    const unexpected = changed.filter((file) => !RELEASE_FILES.includes(file))
    if (unexpected.length > 0) {
      fail(`unexpected files changed during the release: ${unexpected.join(', ')}`)
    }
    const missing = RELEASE_FILES.filter((file) => !changed.includes(file))
    if (missing.length > 0) {
      fail(`the release did not update: ${missing.join(', ')}`)
    }

    if (dryRun) {
      return { version, tag, changed, dryRun: true }
    }

    const add = git(['add', '--', ...RELEASE_FILES], root)
    if (add.status !== 0) fail(`git add failed: ${(add.stderr || '').trim()}`)
    const commit = git(['commit', '-m', `release: ${version}`], root)
    if (commit.status !== 0) fail(`git commit failed: ${(commit.stderr || '').trim()}`)
    committed = true
    const tagResult = git(['tag', '-a', tag, '-m', `AsideNote ${version}`], root)
    if (tagResult.status !== 0) {
      fail(
        `commit created but tag ${tag} failed: ${(tagResult.stderr || '').trim()}; ` +
          `run git tag -a ${tag} -m "AsideNote ${version}" manually`,
      )
    }
    const hash = gitOut(['rev-parse', '--short', 'HEAD'], root)
    return { version, tag, hash, changed, dryRun: false }
  } catch (error) {
    if (!committed) {
      restore(root, originals)
      git(['reset', '--quiet', 'HEAD', '--', ...RELEASE_FILES], root)
    }
    throw error
  }
}

function readChangelog(root) {
  return readFileSync(join(root, CHANGELOG_FILE), 'utf8')
}

function usage() {
  return [
    'Usage:',
    '  npm run release -- <version> [--dry-run] [--skip-check]',
    '  node tools/release.mjs check <version>',
    '  node tools/release.mjs extract <version>',
    '  node tools/release.mjs check-next',
    '  node tools/release.mjs prepare <version> [--dry-run] [--skip-check]',
  ].join('\n')
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(usage())
    return
  }
  const flags = new Set(argv.filter((arg) => arg.startsWith('--')))
  const args = argv.filter((arg) => !arg.startsWith('--'))
  const dryRun = flags.has('--dry-run')
  const skipCheck = flags.has('--skip-check')
  const [command, value] = args

  if (command === 'check-next') {
    checkNextReleased(readChangelog(repositoryRoot()))
    console.log(`CHANGELOG.md starts with "## ${NEXT_HEADING}"`)
    return
  }
  if (command === 'check' || command === 'extract') {
    if (!value) fail(usage())
    const notes = extractSection(readChangelog(repositoryRoot()), value)
    if (command === 'extract') {
      process.stdout.write(`${notes}\n`)
    } else {
      console.log(`CHANGELOG.md has a non-empty "## ${value}" section`)
    }
    return
  }
  if (command === 'prepare' || (command && VERSION_PATTERN.test(command))) {
    const version = command === 'prepare' ? value : command
    if (!version) fail(usage())
    const result = prepare(version, { dryRun, skipCheck })
    if (result.dryRun) {
      console.log(`Dry run for ${result.version}: updated ${result.changed.join(', ')}`)
      console.log('No commit or tag was created. Inspect with `git diff`, discard with `git restore .`.')
      return
    }
    console.log(`Prepared release ${result.version}`)
    console.log(`  commit ${result.hash}`)
    console.log(`  tag    ${result.tag}`)
    console.log('')
    console.log('Publish with:')
    console.log('  git push origin main')
    console.log(`  git push origin ${result.tag}`)
    return
  }
  fail(usage())
}

function isEntrypoint() {
  if (!process.argv[1]) return false
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (isEntrypoint()) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(`release: ${error.message}`)
    process.exitCode = 1
  }
}
