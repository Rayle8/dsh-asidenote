import {
  DRAFT_STORAGE_KEY,
  FORWARDED_STORAGE_KEY,
  FORWARD_PREFIX_STORAGE_KEY,
  PANEL_HEIGHT_KEY,
  PANEL_WIDTH_KEY,
  SECTION_STATE_KEY,
  SEND_SHORTCUT_KEY,
  SESSION_STORAGE_KEY,
} from '../constants'
import { storage } from './codec'

/** One-time marker; its presence means the copy below already ran successfully. */
const MIGRATED_KEY = 'dsh.aside-notes.migrated.v2'

/**
 * The 1.x keys, read once and copied verbatim.
 *
 * They are never deleted: a user who rolls back to 1.9.x still finds their
 * notes, and a half-finished copy is retried on the next load because the
 * marker is only written after the whole loop succeeds.
 */
const LEGACY_KEYS: ReadonlyArray<readonly [next: string, legacy: string]> = [
  [SESSION_STORAGE_KEY, 'dsh.session-memos.v1'],
  [DRAFT_STORAGE_KEY, 'dsh.memo.drafts.v1'],
  [FORWARDED_STORAGE_KEY, 'dsh.memo.forwarded.v1'],
  [SECTION_STATE_KEY, 'dsh.memo.sections.v1'],
  [PANEL_WIDTH_KEY, 'dsh.memo.panel-width.v1'],
  [PANEL_HEIGHT_KEY, 'dsh.memo.panel-height.v1'],
  [SEND_SHORTCUT_KEY, 'dsh.memo.send-shortcut.v1'],
  [FORWARD_PREFIX_STORAGE_KEY, 'dsh.memo.forward-prefix.v1'],
]

/**
 * Copy 1.x storage into the AsideNote keys.
 *
 * Runs before anything reads the store. A newer value already present wins, so
 * the migration never overwrites what the user did after upgrading.
 */
export function migrateLegacyStorage(): void {
  const ls = storage()
  if (!ls) return
  try {
    if (ls.getItem(MIGRATED_KEY) !== null) return
    for (const [next, legacy] of LEGACY_KEYS) {
      if (ls.getItem(next) !== null) continue
      const raw = ls.getItem(legacy)
      if (raw !== null) ls.setItem(next, raw)
    }
    ls.setItem(MIGRATED_KEY, new Date().toISOString())
  } catch {
    /* quota or a blocked store: the panel already reports storage failures */
  }
}
