/** Session-scoped notes: the only store the panel renders. */
import { SESSION_STORAGE_KEY } from '../constants'
import { normalizeItems } from '../domain/items'
import { storage } from './codec'
import { notifyTodoChange } from './events'

/** Empty session-scoped store. */
export function emptySessionStore() {
  return { version: 1, sessions: {} }
}

/** Read the whole session memo store; corrupt or unavailable reads as empty. */
export function readSessionStore() {
  const ls = storage()
  if (!ls) return emptySessionStore()
  try {
    const raw = ls.getItem(SESSION_STORAGE_KEY)
    if (!raw) return emptySessionStore()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptySessionStore()
    const sessions = parsed.sessions
    if (!sessions || typeof sessions !== 'object' || Array.isArray(sessions)) return emptySessionStore()
    return { version: 1, sessions }
  } catch {
    return emptySessionStore()
  }
}

/** Read one session's memo record. */
export function readSessionRecord(sessionId) {
  const key = sessionId ? String(sessionId) : ''
  if (!key) return { items: [], updatedAt: 0 }
  const record = readSessionStore().sessions[key]
  return {
    items: normalizeItems(record && record.items),
    updatedAt: record && Number.isFinite(record.updatedAt) ? record.updatedAt : 0,
  }
}

/** Persist one session's memo record. */
export function writeSessionRecord(sessionId, record) {
  const ls = storage()
  const key = sessionId ? String(sessionId) : ''
  if (!ls || !key) return false
  const store = readSessionStore()
  store.sessions[key] = {
    sessionId: key,
    updatedAt: record.updatedAt || Date.now(),
    items: normalizeItems(record.items),
  }
  try {
    ls.setItem(SESSION_STORAGE_KEY, JSON.stringify(store))
    notifyTodoChange()
    return true
  } catch {
    return false
  }
}
