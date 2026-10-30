/** Per-session notes plus a synchronous writer that never invents state. */
import React from 'react'
import { SESSION_STORAGE_KEY } from '../constants'
import { normalizeItems } from '../domain/items'
import { TODO_LISTENERS } from '../storage/events'
import { readSessionRecord, writeSessionRecord } from '../storage/session'

/** Per-session memos plus a synchronous writer that never invents state. */
export function useSessionMemoStore(sessionId) {
  const sessionKey = sessionId ? String(sessionId) : ''
  const sessionRef = React.useRef(sessionKey)
  sessionRef.current = sessionKey

  const [record, setRecord] = React.useState(() => readSessionRecord(sessionKey))
  const [syncError, setSyncError] = React.useState(false)
  const recordRef = React.useRef(record)
  recordRef.current = record

  React.useEffect(() => {
    setRecord(readSessionRecord(sessionRef.current))
    setSyncError(false)
  }, [sessionKey])

  React.useEffect(() => {
    const onStorage = event => {
      if (event.key !== SESSION_STORAGE_KEY) return
      setRecord(readSessionRecord(sessionRef.current))
    }
    const onLocal = () => setRecord(readSessionRecord(sessionRef.current))
    TODO_LISTENERS.add(onLocal)
    window.addEventListener('storage', onStorage)
    return () => {
      TODO_LISTENERS.delete(onLocal)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // A failed write leaves the rendered record alone: the row the user just
  // deleted stays on screen next to the failure toast, instead of the panel
  // reporting success for something the browser never stored.
  const commit = React.useCallback(updater => {
    const current = recordRef.current || { items: [], updatedAt: 0 }
    const nextItems = normalizeItems(updater(current.items || []))
    const next = { items: nextItems, updatedAt: Date.now() }
    const ok = writeSessionRecord(sessionRef.current, next)
    setSyncError(!ok)
    if (!ok) return false
    recordRef.current = next
    setRecord(next)
    return true
  }, [])

  return { record, syncError, commit }
}
