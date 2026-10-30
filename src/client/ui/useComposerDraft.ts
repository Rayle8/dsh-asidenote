/** The add box: draft persistence, auto-grow, send chords and newline insertion. */
import React from 'react'
import { MAX_TEXT, isSendModifier } from '../constants'
import { clearAddDraft, readSessionDrafts, saveAddDraft } from '../storage/drafts'
import { uid } from '../domain/id'

export function useComposerDraft({ sessionId, commit, report, sendShortcut }) {
  const [draft, setDraft] = React.useState(() => readSessionDrafts(sessionId).add)
  const addRef = React.useRef(null)
  const composingRef = React.useRef(false)

  const resizeAdd = node => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight + 2}px`
  }

  React.useEffect(() => {
    resizeAdd(addRef.current)
  }, [draft])

  // Opening the panel focuses the composer on pointer devices only: on touch
  // the same focus raises the software keyboard before the user asked for it.
  React.useLayoutEffect(() => {
    const node = addRef.current
    if (!node) return
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    node.focus()
    const end = node.value.length
    try {
      node.setSelectionRange(end, end)
    } catch {
      /* selection APIs are best effort */
    }
  }, [])

  const add = () => {
    const text = draft.trim().slice(0, MAX_TEXT)
    if (!text) return
    const now = Date.now()
    const ok = commit(currentItems => [{ id: uid(), text, done: false, createdAt: now, updatedAt: now }, ...currentItems])
    // The draft is only cleared once the note is actually stored.
    if (!ok) {
      report('saveFailed')
      return
    }
    setDraft('')
    clearAddDraft(sessionId)
  }

  const insertDraftNewline = node => {
    if (!node) return
    const start = node.selectionStart === null ? node.value.length : node.selectionStart
    const end = node.selectionEnd === null ? start : node.selectionEnd
    const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`
    setDraft(next)
    saveAddDraft(sessionId, next)
    window.requestAnimationFrame(() => {
      node.selectionStart = start + 1
      node.selectionEnd = start + 1
      resizeAdd(node)
    })
  }

  const onDraftChange = event => {
    const value = event.target.value
    setDraft(value)
    saveAddDraft(sessionId, value)
    resizeAdd(event.target)
  }

  const onDraftKeyDown = event => {
    const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
    if (event.key === 'Escape') {
      event.currentTarget.blur()
      return
    }
    if (event.key !== 'Enter') return
    if (composing) {
      event.preventDefault()
      return
    }
    const chord = event.ctrlKey || event.metaKey
    const platformModifier = isSendModifier(event)
    const shouldSend = sendShortcut === 'enter'
      ? !chord && !event.shiftKey
      : platformModifier
    if (shouldSend) {
      event.preventDefault()
      add()
      return
    }
    if (sendShortcut === 'enter' && (chord || event.shiftKey)) {
      event.preventDefault()
      insertDraftNewline(event.currentTarget)
    }
  }

  return { draft, addRef, composingRef, add, onDraftChange, onDraftKeyDown }
}
