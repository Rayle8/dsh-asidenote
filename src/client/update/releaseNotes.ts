/**
 * In-app release notes, extracted from a published GitHub Release body.
 *
 * The release body is written by `tools/release/notes.mjs`. Each locale's notes
 * sit between `app-update-notes` markers, so the panel can show a short summary
 * without rendering the whole release page (download links, first-launch notes,
 * the generated "Full Changelog" list).
 *
 * The parser is deliberately small and dependency free: headings, bullets, bold
 * leads and links are the only markdown the release notes use. Everything is
 * flattened to plain text, so nothing in a release body can inject markup into
 * the panel.
 */

/** One bullet of a release-note group. */
export interface ReleaseNoteItem {
  /** Bold topic before the colon, when the item starts with one. */
  lead: string
  /** The rest of the bullet, as plain text. */
  body: string
}

/** One `### Heading` group of a release-note block. */
export interface ReleaseNoteGroup {
  title: string
  items: ReleaseNoteItem[]
}

/** Bounds taken from the published-notes convention, not an editorial limit. */
export const MAX_NOTE_GROUPS = 6
export const MAX_NOTE_ITEMS = 40
export const MAX_NOTE_ITEM_CHARS = 600

const MARKER_RE = /<!--\s*app-update-notes:([A-Za-z-]+):start\s*-->([\s\S]*?)<!--\s*app-update-notes:\1:end\s*-->/g
const GROUP_RE = /^#{2,4}\s+(.+?)\s*$/
const ITEM_RE = /^\s*[-*]\s+(.+?)\s*$/
// A bold topic reads as "**Home list counts:** …". After the emphasis is
// stripped the colon is what remains, and a colon deep in a sentence is not a
// topic — hence the length bound and the "must be followed by text" rule.
const LEAD_RE = /^([^。．.!?！？:：]{1,40}?[:：])\s*(\S[\s\S]*)$/
const TRAILING_PR_REFS_RE = /\s*(?:[（(]\s*#\d+(?:\s*[,，、]\s*#\d+)*\s*[)）])\s*$/
const HTML_TAG_RE = /<\/?[A-Za-z][^>]*>/g
const IMAGE_RE = /!\[[^\]]*\]\([^)]*\)/g
const LINK_RE = /\[([^\]]+)\]\([^)]*\)/g
const CODE_RE = /`([^`]+)`/g
const STRONG_RE = /\*\*([^*]+)\*\*|__([^_]+)__/g
const EMPHASIS_RE = /\*([^*]+)\*|_([^_]+)_/g
const WHITESPACE_RE = /\s+/g

const ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/gi, (match, entity) => {
    const lower = entity.toLowerCase()
    if (Object.prototype.hasOwnProperty.call(ENTITIES, lower)) return ENTITIES[lower]
    const codePoint = lower.startsWith('#x')
      ? Number.parseInt(lower.slice(2), 16)
      : Number.parseInt(lower.slice(1), 10)
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return match
    try {
      return String.fromCodePoint(codePoint)
    } catch {
      return match
    }
  })
}

/** Flatten one line of release-note markdown to readable plain text. */
export function noteText(value: string): string {
  return decodeEntities(
    String(value ?? '')
      .replace(HTML_TAG_RE, '')
      .replace(IMAGE_RE, '')
      .replace(LINK_RE, '$1')
      .replace(CODE_RE, '$1')
      .replace(STRONG_RE, (_match, strong, underscored) => strong || underscored)
      .replace(EMPHASIS_RE, (_match, italic, underscored) => italic || underscored)
      .replace(TRAILING_PR_REFS_RE, ''),
  )
    .replace(WHITESPACE_RE, ' ')
    .trim()
}

/** Split "**Topic:** rest" into its bold lead and the remaining body. */
export function splitNoteLead(value: string): ReleaseNoteItem {
  const text = noteText(value)
  const match = LEAD_RE.exec(text)
  return match ? { lead: match[1].trim(), body: match[2].trim() } : { lead: '', body: text }
}

function truncate(value: string, maxChars: number): string {
  const characters = Array.from(value)
  return characters.length <= maxChars ? value : `${characters.slice(0, maxChars - 1).join('').trimEnd()}…`
}

/**
 * Locale fallback order for a DSH locale id. A Chinese UI reads the `zh` block,
 * everything else reads `en`; either falls back to the other when a release
 * only shipped one language.
 */
export function noteLocalesFor(locale: string): string[] {
  return String(locale ?? '').toLowerCase().startsWith('zh') ? ['zh', 'en'] : ['en', 'zh']
}

/** The notes block for this locale, or an empty string when the release has none. */
export function extractUpdateNotes(body: string, locale: string): string {
  const blocks = new Map<string, string>()
  for (const match of String(body ?? '').matchAll(MARKER_RE)) {
    const key = match[1].toLowerCase()
    if (!blocks.has(key)) blocks.set(key, match[2])
  }
  for (const key of noteLocalesFor(locale)) {
    const block = blocks.get(key)
    if (block && block.trim()) return block.trim()
  }
  return ''
}

/** Parse one marker block into headings and bullets. */
export function parseReleaseNotes(markdown: string): ReleaseNoteGroup[] {
  const drafts: { title: string; bullets: string[] }[] = []
  let current: { title: string; bullets: string[] } | null = null

  for (const rawLine of String(markdown ?? '').split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    const heading = GROUP_RE.exec(line)
    if (heading) {
      current = { title: noteText(heading[1]), bullets: [] }
      drafts.push(current)
      continue
    }
    const item = ITEM_RE.exec(line)
    if (item) {
      if (current === null) {
        current = { title: '', bullets: [] }
        drafts.push(current)
      }
      current.bullets.push(item[1])
      continue
    }
    // A wrapped bullet continues the previous item; anything else is ignored.
    if (line.trim() && current !== null && current.bullets.length > 0) {
      const last = current.bullets.length - 1
      current.bullets[last] = `${current.bullets[last]} ${line.trim()}`
    }
  }

  const parsed: ReleaseNoteGroup[] = []
  for (const draft of drafts) {
    const items: ReleaseNoteItem[] = []
    for (const bullet of draft.bullets) {
      const text = truncate(noteText(bullet), MAX_NOTE_ITEM_CHARS)
      if (text) items.push(splitNoteLead(text))
      if (items.length >= MAX_NOTE_ITEMS) break
    }
    if (items.length > 0) parsed.push({ title: draft.title, items })
    if (parsed.length >= MAX_NOTE_GROUPS) break
  }
  return parsed
}

/** Convenience for the panel: extract and parse in one step. */
export function updateNotesForLocale(body: string, locale: string): ReleaseNoteGroup[] {
  return parseReleaseNotes(extractUpdateNotes(body, locale))
}
