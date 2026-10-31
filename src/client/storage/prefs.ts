/** Panel geometry, send shortcut, forward prefix and section state. */
import {
  PANEL_DEFAULT_WIDTH,
  PANEL_HEIGHT_KEY,
  PANEL_MAX_WIDTH,
  PANEL_MIN_WIDTH,
  PANEL_WIDTH_KEY,
  SECTION_STATE_DEFAULT,
  SECTION_STATE_KEY,
  SEND_SHORTCUT_DEFAULT,
  SEND_SHORTCUT_KEY,
  FORWARD_PREFIX_STORAGE_KEY,
} from '../constants'
import { storage } from './codec'

/** Read the persisted right-panel width, clamped for the current viewport. */
export function readPanelWidth() {
  const ls = storage()
  const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))
  try {
    const saved = ls && Number(ls.getItem(PANEL_WIDTH_KEY))
    if (Number.isFinite(saved) && saved > 0) return Math.max(PANEL_MIN_WIDTH, Math.min(max, saved))
  } catch {
    /* fall through */
  }
  return Math.max(PANEL_MIN_WIDTH, Math.min(max, PANEL_DEFAULT_WIDTH))
}

/** Persist the right-panel width so it survives reopening the popover. */
export function writePanelWidth(width) {
  const ls = storage()
  if (!ls) return
  try {
    ls.setItem(PANEL_WIDTH_KEY, String(Math.round(width)))
  } catch {
    /* storage is best effort */
  }
}

/** Read the persisted right-panel height; 0 means content-sized. */
export function readPanelHeight() {
  const ls = storage()
  try {
    const saved = ls && Number(ls.getItem(PANEL_HEIGHT_KEY))
    if (Number.isFinite(saved) && saved > 0) return saved
  } catch {
    /* fall through */
  }
  return 0
}

/** Persist the right-panel height; 0 restores content sizing. */
export function writePanelHeight(height) {
  const ls = storage()
  if (!ls) return
  try {
    if (height > 0) ls.setItem(PANEL_HEIGHT_KEY, String(Math.round(height)))
    else ls.removeItem(PANEL_HEIGHT_KEY)
  } catch {
    /* storage is best effort */
  }
}

/** Read the Enter-to-send preference. */
export function readSendShortcut() {
  try {
    const saved = storage() && storage().getItem(SEND_SHORTCUT_KEY)
    return saved === 'enter' || saved === 'ctrl-enter' ? saved : SEND_SHORTCUT_DEFAULT
  } catch {
    return SEND_SHORTCUT_DEFAULT
  }
}

export function writeSendShortcut(value) {
  try {
    const ls = storage()
    if (ls) ls.setItem(SEND_SHORTCUT_KEY, value === 'enter' ? 'enter' : 'ctrl-enter')
  } catch {
    /* storage is best effort */
  }
}

/** Read the user's forward lead-in; an empty string means no prefix. */
export function readForwardPrefix() {
  try {
    const raw = storage() && storage().getItem(FORWARD_PREFIX_STORAGE_KEY)
    return typeof raw === 'string' ? raw.slice(0, 80) : ''
  } catch {
    return ''
  }
}

export function writeForwardPrefix(value) {
  try {
    const ls = storage()
    if (ls) ls.setItem(FORWARD_PREFIX_STORAGE_KEY, String(value || '').slice(0, 80))
  } catch {
    /* storage is best effort */
  }
}

/** Remembered section state; corrupt or missing storage falls back to defaults. */
export function readSectionState() {
  const fallback = { open: SECTION_STATE_DEFAULT.open, done: SECTION_STATE_DEFAULT.done }
  const ls = storage()
  if (!ls) return fallback
  try {
    const raw = ls.getItem(SECTION_STATE_KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return fallback
    return {
      open: typeof saved.open === 'boolean' ? saved.open : fallback.open,
      done: typeof saved.done === 'boolean' ? saved.done : fallback.done,
    }
  } catch {
    return fallback
  }
}

/** Persist the section state immediately; storage failures are ignored. */
export function writeSectionState(state) {
  const ls = storage()
  if (!ls) return
  try {
    ls.setItem(SECTION_STATE_KEY, JSON.stringify({ open: state.open === true, done: state.done === true }))
  } catch {
    /* storage is best effort */
  }
}
