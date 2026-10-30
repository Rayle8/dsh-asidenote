/** Row actions: toggle, delete, and the inline edit session. */
import React from 'react'
import { MAX_TEXT } from '../constants'
import { clearEditDraft, readEditDraft } from '../storage/drafts'

export function useNoteActions({ sessionId, commit, report, forgetForwardedItems }) {
  const [editingId, setEditingId] = React.useState(null)
  const [editDraft, setEditDraft] = React.useState('')
  const editRef = React.useRef(null)
  const cancelEditRef = React.useRef(false)

  React.useEffect(() => {
    if (!editingId || !editRef.current) return
    editRef.current.focus()
    editRef.current.select()
  }, [editingId])

  const resetEditing = itemId => {
    if (!editingId || editingId !== itemId) return
    setEditingId(null)
    setEditDraft('')
  }

  const toggle = item => {
    const ok = commit(currentItems => currentItems.map(candidate => {
      if (candidate.id !== item.id) return candidate
      const now = Date.now()
      return {
        ...candidate,
        done: !candidate.done,
        updatedAt: now,
        ...(candidate.done ? { completedAt: undefined } : { completedAt: now }),
      }
    }))
    if (!ok) {
      report('saveFailed')
      return
    }
    if (item.id === editingId) {
      setEditingId(null)
      setEditDraft('')
      clearEditDraft(sessionId, item.id)
    }
  }

  const remove = item => {
    const ok = commit(currentItems => currentItems.filter(candidate => candidate.id !== item.id))
    // A failed delete keeps the row, its draft and its forward flag exactly
    // as they were, and the toast carries the failure.
    if (!ok) {
      report('saveFailed')
      return
    }
    report('deleted')
    clearEditDraft(sessionId, item.id)
    forgetForwardedItems(item.id)
    resetEditing(item.id)
  }

  const startEdit = item => {
    cancelEditRef.current = false
    const saved = readEditDraft(sessionId, item.id)
    setEditingId(item.id)
    setEditDraft(saved === null ? item.text : saved)
  }

  const finishEdit = item => {
    if (cancelEditRef.current) {
      cancelEditRef.current = false
      return
    }
    if (!editingId) return
    const text = editDraft.trim().slice(0, MAX_TEXT)
    if (text && text !== item.text) {
      const ok = commit(currentItems => currentItems.map(candidate => {
        if (candidate.id !== item.id) return candidate
        return { ...candidate, text, updatedAt: Date.now() }
      }))
      // Keeping the editor open preserves what the user typed.
      if (!ok) {
        report('saveFailed')
        return
      }
    }
    setEditingId(null)
    setEditDraft('')
    clearEditDraft(sessionId, item.id)
  }

  const cancelEdit = () => {
    cancelEditRef.current = true
    const currentId = editingId
    setEditingId(null)
    setEditDraft('')
    if (currentId) clearEditDraft(sessionId, currentId)
  }

  return { editingId, editDraft, setEditDraft, editRef, startEdit, finishEdit, cancelEdit, toggle, remove }
}
