/** Unsaved add/edit drafts, so closing the panel never loses text. */
import { DRAFT_STORAGE_KEY, MAX_TEXT } from '../constants'
import { storage } from './codec'

/** Empty unsaved-draft store. */
export function emptyDraftStore() {
  return { version: 1, sessions: {} }
}

/** Read the unsaved add/edit drafts; corrupt or unavailable reads as empty. */
export function readDraftStore() {
  const ls = storage()
  if (!ls) return emptyDraftStore()
  try {
    const raw = ls.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return emptyDraftStore()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyDraftStore()
    const sessions = parsed.sessions
    if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) return emptyDraftStore()
    return { version: 1, sessions }
  } catch {
    return emptyDraftStore()
  }
}

export function writeDraftStore(store) {
  const ls = storage()
  if (!ls) return
  try {
    ls.setItem(DRAFT_STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* storage is best effort */
  }
}

export function readSessionDrafts(sessionId) {
  const key = sessionId ? String(sessionId) : ''
  const record = key ? readDraftStore().sessions[key] : null
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return { add: '', edits: {} }
  }
  return {
    add: typeof record.add === 'string' ? record.add : '',
    edits: record.edits && typeof record.edits === 'object' && !Array.isArray(record.edits)
      ? record.edits
      : {},
  }
}

export function pruneDraftSession(store, sessionId) {
  const record = store.sessions[sessionId]
  if (!record) return
  const hasAdd = typeof record.add === 'string' && record.add.length > 0
  const hasEdits = record.edits && typeof record.edits === 'object' && Object.keys(record.edits).length > 0
  if (!hasAdd && !hasEdits) delete store.sessions[sessionId]
}

export function saveAddDraft(sessionId, text) {
  const key = sessionId ? String(sessionId) : ''
  if (!key) return
  const store = readDraftStore()
  const record = store.sessions[key] || {}
  const value = String(text || '').slice(0, MAX_TEXT)
  if (value) record.add = value
  else delete record.add
  record.edits = record.edits && typeof record.edits === 'object' ? record.edits : {}
  store.sessions[key] = record
  pruneDraftSession(store, key)
  writeDraftStore(store)
}

export function clearAddDraft(sessionId) {
  saveAddDraft(sessionId, '')
}

export function readEditDraft(sessionId, itemId) {
  const key = sessionId ? String(sessionId) : ''
  if (!key || !itemId) return null
  const edits = readSessionDrafts(key).edits
  return typeof edits[itemId] === 'string' ? edits[itemId] : null
}

export function saveEditDraft(sessionId, itemId, text) {
  const key = sessionId ? String(sessionId) : ''
  if (!key || !itemId) return
  const store = readDraftStore()
  const record = store.sessions[key] || {}
  record.edits = record.edits && typeof record.edits === 'object' ? record.edits : {}
  record.edits[itemId] = String(text || '').slice(0, MAX_TEXT)
  store.sessions[key] = record
  writeDraftStore(store)
}

export function clearEditDraft(sessionId, itemId) {
  const key = sessionId ? String(sessionId) : ''
  if (!key || !itemId) return
  const store = readDraftStore()
  const record = store.sessions[key]
  if (!record || !record.edits || typeof record.edits !== 'object') return
  delete record.edits[itemId]
  pruneDraftSession(store, key)
  writeDraftStore(store)
}
