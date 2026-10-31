/** Which notes were forwarded in this session, plus the toggle-off bookkeeping. */
import React from 'react'
import { forgetForwarded, markForwarded, readForwardedIds } from '../storage/forwarded'

export function useForwardMarks(sessionId) {
  const [forwardedIds, setForwardedIds] = React.useState(() => readForwardedIds(sessionId))
  const sessionRef = React.useRef(sessionId ? String(sessionId) : '')

  // Only a genuine session switch re-reads the flags; parent re-renders keep this state.
  React.useEffect(() => {
    const key = sessionId ? String(sessionId) : ''
    if (sessionRef.current === key) return
    sessionRef.current = key
    setForwardedIds(readForwardedIds(key))
  }, [sessionId])

  /** Drop forwarded flags for notes that no longer render (deleted or cleared). */
  const forgetForwardedItems = itemIds => {
    const ids = (Array.isArray(itemIds) ? itemIds : [itemIds]).filter(Boolean)
    if (!ids.length) return
    forgetForwarded(sessionId, ids)
    setForwardedIds(current => {
      if (!ids.some(id => current[id])) return current
      const next = { ...current }
      for (const id of ids) delete next[id]
      return next
    })
  }

  /** Remember a successful forward so the forward button keeps its check after closing the panel. */
  const rememberForwarded = item => {
    const id = item && item.id ? String(item.id) : ''
    if (!id) return
    markForwarded(sessionId, id)
    setForwardedIds(current => (current[id] ? current : { ...current, [id]: true }))
  }

  /** Toggle the forward mark off; the note and its open/done state stay untouched. */
  const unrememberForwarded = item => {
    const id = item && item.id ? String(item.id) : ''
    if (!id) return
    forgetForwardedItems(id)
  }

  return { forwardedIds, rememberForwarded, unrememberForwarded, forgetForwardedItems }
}
