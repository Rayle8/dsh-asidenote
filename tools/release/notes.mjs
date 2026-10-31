#!/usr/bin/env node
/**
 * Compose the GitHub Release body from the CHANGELOG.
 *
 * The body is the shop window for two readers at once:
 *   - the release page: English and Chinese notes, install/upgrade instructions,
 *     and a Full Changelog link;
 *   - the in-app update card: it extracts the block between
 *     `<!-- app-update-notes:<locale>:start/end -->` markers and renders it.
 *
 * The markers are emitted by this script, so a release written in CHANGELOG.md
 * cannot forget them. Usage:
 *
 *   node tools/release/notes.mjs --version 2.1.0 --tag v2.1.0 \
 *     --prev v2.0.1 --repo Rayle8/dsh-asidenote --out notes.md
 *
 * Exported for tests; `main()` only runs when this file is executed.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_REPO_ROOT = path.resolve(HERE, '..', '..')

const PACKAGE = 'dsh-asidenote'

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The CHANGELOG section for one version, without the heading itself. */
export function extractVersionSection(changelog, version) {
  const lines = String(changelog ?? '').split(/\r?\n/)
  const heading = new RegExp(`^##\\s+${escapeRegExp(version)}\\s*$`)
  const start = lines.findIndex(line => heading.test(line.trim()))
  if (start < 0) return ''
  const body = []
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line.trim())) break
    body.push(line)
  }
  return body.join('\n').trim()
}

/** One locale block from the marker convention, or an empty string. */
export function extractLocaleBlock(section, locale) {
  const marker = new RegExp(
    `<!--\\s*app-update-notes:${escapeRegExp(locale)}:start\\s*-->[\\s\\S]*?<!--\\s*app-update-notes:${escapeRegExp(locale)}:end\\s*-->`,
    'i',
  )
  return marker.exec(section)?.[0] ?? ''
}

function releasePageUrl(repo, tag) {
  return `https://github.com/${repo}/releases/tag/${tag}`
}

/**
 * Build the release body. `notes` may omit one language; the missing side falls
 * back to the other block so the page is never empty, and the in-app reader has
 * the same fallback.
 */
export function buildReleaseBody(options) {
  const {
    changelog,
    version,
    tag = `v${version}`,
    prevTag = '',
    repo = 'Rayle8/dsh-asidenote',
    packageName = PACKAGE,
  } = options

  const section = extractVersionSection(changelog, version)
  if (!section) throw new Error(`CHANGELOG has no section for ${version}`)

  const enBlock = extractLocaleBlock(section, 'en')
  const zhBlock = extractLocaleBlock(section, 'zh')
  if (!enBlock && !zhBlock) {
    throw new Error(`CHANGELOG section for ${version} has no app-update-notes markers`)
  }
  const fallback = enBlock || zhBlock
  const english = enBlock || fallback
  const chinese = zhBlock || fallback

  const body = [
    '# English',
    '',
    "## What's changed",
    '',
    english,
    '',
    '## Install or upgrade',
    '',
    `- \`npm install ${packageName}@${version}\`, or update the profile dependency and run \`pnpm install\`.`,
    `- Release tarball: [${packageName}-${version}.tgz](https://github.com/${repo}/releases/download/${tag}/${packageName}-${version}.tgz).`,
    '- Then restart DSH, or toggle the bundle off and on in Plugins.',
    '',
    '# 中文',
    '',
    '## 更新内容',
    '',
    chinese,
    '',
    '## 安装或升级',
    '',
    `- \`npm install ${packageName}@${version}\`，或更新 profile 依赖后执行 \`pnpm install\`。`,
    `- Release 附件：[${packageName}-${version}.tgz](https://github.com/${repo}/releases/download/${tag}/${packageName}-${version}.tgz)。`,
    '- 然后重启 DSH，或在「插件」页把组合包关闭再开启。',
  ]

  if (prevTag) {
    body.push(
      '',
      `<details><summary><strong>Full Changelog</strong>: <a href="https://github.com/${repo}/compare/${prevTag}...${tag}">${prevTag}...${tag}</a></summary>`,
      '',
      `Release page: ${releasePageUrl(repo, tag)}`,
      '',
      '</details>',
    )
  }

  return `${body.join('\n')}\n`
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (!flag.startsWith('--')) continue
    args[flag.slice(2)] = argv[index + 1]
    index += 1
  }
  return args
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const version = String(args.version ?? '').replace(/^v/, '')
  if (!version) {
    console.error('usage: node tools/release/notes.mjs --version <x.y.z> [--tag v<x.y.z>] [--prev v<a.b.c>] [--repo owner/repo] [--changelog path] [--out path]')
    process.exit(2)
  }
  const root = args.root ? path.resolve(args.root) : DEFAULT_REPO_ROOT
  const changelogPath = args.changelog ? path.resolve(args.changelog) : path.join(root, 'CHANGELOG.md')
  const body = buildReleaseBody({
    changelog: fs.readFileSync(changelogPath, 'utf8'),
    version,
    tag: args.tag || `v${version}`,
    prevTag: args.prev || '',
    repo: args.repo || 'Rayle8/dsh-asidenote',
  })
  if (args.out) fs.writeFileSync(args.out, body)
  else process.stdout.write(body)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
