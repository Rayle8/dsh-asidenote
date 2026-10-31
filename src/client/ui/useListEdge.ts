/** Tracks whether the note list can still scroll down, and updates sticky heads. */
import React from 'react'
import { syncStickyHeads } from './position'

export function useListEdge({ items, showOpen, showDone }) {
  const listRef = React.useRef(null)
  const [listHasMore, setListHasMore] = React.useState(false)

  /** The bottom fade exists only while the list can still scroll down. */
  const syncListEdge = React.useCallback(() => {
    const node = listRef.current
    if (!node) return
    syncStickyHeads(node)
    const more = node.scrollTop + node.clientHeight < node.scrollHeight - 1
    setListHasMore(current => (current === more ? current : more))
  }, [])

  React.useEffect(() => {
    const node = listRef.current
    if (!node) return undefined
    syncListEdge()
    if (typeof ResizeObserver !== 'function') return undefined
    const observer = new ResizeObserver(syncListEdge)
    observer.observe(node)
    // Section boxes report added, removed, and edited notes; the viewport box
    // reports panel resizes. Neither needs to re-measure on every render.
    for (const section of node.children) observer.observe(section)
    return () => observer.disconnect()
  }, [items, showOpen, showDone, syncListEdge])

  return { listRef, listHasMore, syncListEdge }
}
