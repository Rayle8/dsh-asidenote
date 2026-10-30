/**
 * The floating notes panel.
 *
 * State, handlers and effects for one session's notes; the markup lives in the
 * sibling components, the geometry in usePanelGeometry and the store in
 * useSessionMemoStore.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { CLEAR_CONFIRM_MS, MAX_TEXT, PANEL_DEFAULT_WIDTH } from '../constants'
import { useSessionMemoStore } from './useSessionMemoStore'
import { usePanelGeometry } from './usePanelGeometry'

import { uid } from '../domain/id'
import { compareDoneItems } from '../domain/items'
import { saveAddDraft, clearAddDraft, readSessionDrafts, readEditDraft, saveEditDraft, clearEditDraft } from '../storage/drafts'
import { readForwardedIds, markForwarded, forgetForwarded } from '../storage/forwarded'
import { readSectionState, writeSectionState, readSendShortcut, writeSendShortcut, readForwardPrefix, writeForwardPrefix } from '../storage/prefs'
import { isSendModifier } from '../constants'
import { syncStickyHeads } from './position'
import { TodoRow } from './TodoRow'
import { PanelHead } from './PanelHead'
import { SettingsPanel } from './SettingsPanel'
import { ComposerForm } from './ComposerForm'
import { NoteList } from './NoteList'

const h = React.createElement

export function MemoPopover(props) {
  const say = props.say
  const localeId = props.localeId
  const sessionId = props.sessionId || ''
  /** Settled outcomes go to the frame-wide toast host, not to inline marks. */
  const report = typeof props.onToast === 'function' ? props.onToast : () => {}
  const { record, syncError, commit } = useSessionMemoStore(props.sessionId)
  const [draft, setDraft] = React.useState(() => readSessionDrafts(sessionId).add)
  const [editingId, setEditingId] = React.useState(null)
  const [editDraft, setEditDraft] = React.useState('')
  // Read the remembered section state once per mount; the popover unmounts on close.
  const [initialSections] = React.useState(readSectionState)
  const [showDone, setShowDone] = React.useState(initialSections.done)
  const [showOpen, setShowOpen] = React.useState(initialSections.open)
  const [confirmClear, setConfirmClear] = React.useState(false)
  const sectionsRef = React.useRef(initialSections)
  const [showSettings, setShowSettings] = React.useState(false)
  const [sendShortcut, setSendShortcut] = React.useState(readSendShortcut)
  const [forwardPrefix, setForwardPrefix] = React.useState(readForwardPrefix)
  // Forwarded item ids of this session, read once per mount so reopen restores the forward mark.
  const [forwardedIds, setForwardedIds] = React.useState(() => readForwardedIds(sessionId))
  const forwardedSessionRef = React.useRef(sessionId ? String(sessionId) : '')
  const [listHasMore, setListHasMore] = React.useState(false)
  const panelRef = React.useRef(null)
  const {
    style,
    commitPanelWidth,
    commitPanelHeight,
    startPanelResize,
    startPanelHeightResize,
    onPanelResizeKeyDown,
    onPanelHeightKeyDown,
  } = usePanelGeometry(props.anchorRef, props.placement, panelRef)
  const listRef = React.useRef(null)
  const editRef = React.useRef(null)
  const addRef = React.useRef(null)
  const prefixRef = React.useRef(null)
  const cancelEditRef = React.useRef(false)
  const composingRef = React.useRef(false)
  const clearConfirmTimerRef = React.useRef(0)

  const resizeAdd = node => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight + 2}px`
  }

  React.useEffect(() => {
    resizeAdd(addRef.current)
  }, [draft])

  // The prefix field starts one line tall and grows with wrapped content
  // up to a six-line cap, then scrolls. Re-measure whenever the draft
  // changes or settings remount.
  React.useLayoutEffect(() => {
    const node = prefixRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(138, node.scrollHeight + 2)}px`
  }, [forwardPrefix, showSettings])

  // Only a genuine session switch re-reads the flags; parent re-renders keep this state.
  React.useEffect(() => {
    const key = sessionId ? String(sessionId) : ''
    if (forwardedSessionRef.current === key) return
    forwardedSessionRef.current = key
    setForwardedIds(readForwardedIds(key))
  }, [sessionId])

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


  React.useEffect(() => {
    const onPointerDown = event => {
      if (panelRef.current && panelRef.current.contains(event.target)) return
      if (props.anchorRef.current && props.anchorRef.current.contains(event.target)) return
      props.onClose()
    }
    const onKeyDown = event => {
      if (event.key === 'Escape') props.onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [props.onClose, props.anchorRef])

  React.useEffect(() => {
    if (!editingId || !editRef.current) return
    editRef.current.focus()
    editRef.current.select()
  }, [editingId])

  const items = record.items || []
  const openItems = items.filter(item => !item.done)
  const doneItems = items.filter(item => item.done).sort(compareDoneItems)
  const openCount = openItems.length
  const total = items.length

  // Retire the confirmation when the completed section empties or collapses,
  // or when the popover switches session; unmount also drops the timer.
  React.useEffect(() => () => stopClearConfirmTimer(), [])
  React.useEffect(() => {
    if (confirmClear && (!showDone || doneItems.length === 0)) dismissClearConfirm()
  }, [confirmClear, showDone, doneItems.length])
  React.useEffect(() => {
    dismissClearConfirm()
  }, [sessionId])

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

  const chooseShortcut = value => {
    setSendShortcut(value)
    writeSendShortcut(value)
  }

  const changeForwardPrefix = value => {
    const next = String(value || '').slice(0, 80)
    setForwardPrefix(next)
    writeForwardPrefix(next)
  }

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
    if (item.id === editingId) {
      setEditingId(null)
      setEditDraft('')
    }
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

  /** Apply one section state and remember it right away, using the next value. */
  const applySections = next => {
    sectionsRef.current = next
    setShowOpen(next.open)
    setShowDone(next.done)
    writeSectionState(next)
  }

  /** Drop the pending auto-dismiss clock without touching state. */
  const stopClearConfirmTimer = () => {
    if (!clearConfirmTimerRef.current) return
    window.clearTimeout(clearConfirmTimerRef.current)
    clearConfirmTimerRef.current = 0
  }

  /** Close the inline band and drop its pending timer. */
  const dismissClearConfirm = () => {
    stopClearConfirmTimer()
    setConfirmClear(false)
  }

  /** Open the inline band; it retires itself after a short pause. */
  const askClearConfirm = () => {
    stopClearConfirmTimer()
    setConfirmClear(true)
    clearConfirmTimerRef.current = window.setTimeout(() => {
      clearConfirmTimerRef.current = 0
      setConfirmClear(false)
    }, CLEAR_CONFIRM_MS)
  }

  /** Only the destructive confirm action reaches the existing clear routine. */
  const confirmClearDone = () => {
    dismissClearConfirm()
    clearDone()
  }

  const clearDone = () => {
    // Capture the completed items before the commit so their forward flags can be cleared.
    const clearedItems = items.filter(item => item.done)
    const ok = commit(currentItems => currentItems.filter(item => !item.done))
    if (!ok) {
      report('saveFailed')
      return
    }
    report('cleared')
    forgetForwardedItems(clearedItems.map(item => item.id))
    applySections({ open: sectionsRef.current.open, done: false })
  }

  const toggleOpen = () => {
    applySections({ open: !sectionsRef.current.open, done: sectionsRef.current.done })
  }

  const toggleDone = () => {
    applySections({ open: sectionsRef.current.open, done: !sectionsRef.current.done })
  }

  const row = item => h(TodoRow, {
    key: item.id,
    item,
    done: item.done,
    say,
    localeId,
    onToast: report,
    onToggle: toggle,
    onStartEdit: startEdit,
    onDelete: remove,
    editing: editingId === item.id,
    editDraft,
    setEditDraft,
    onEditDraftChange: value => saveEditDraft(sessionId, item.id, value),
    onFinishEdit: finishEdit,
    onCancelEdit: cancelEdit,
    editRef,
    forwardPrefix: forwardPrefix.trim() ? forwardPrefix : say('forward.prefix'),
    sendShortcut,
    forwarded: forwardedIds[item.id] === true,
    onForwarded: rememberForwarded,
    onUnforwarded: unrememberForwarded,
  })

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

  const content = h(
    'div',
    {
      ref: panelRef,
      className: props.placement === 'right' ? 'dsh-an-popover dsh-an-popoverRight' : 'dsh-an-popover',
      style,
      role: 'dialog',
      'aria-label': say('popover.title'),
    },
    props.placement === 'right'
      ? h('div', {
          className: 'dsh-an-resizeHandle',
          role: 'separator',
          'aria-orientation': 'vertical',
          'aria-label': say('resize.width'),
          tabIndex: 0,
          title: say('resize.hint'),
          onPointerDown: startPanelResize,
          onDoubleClick: () => commitPanelWidth(PANEL_DEFAULT_WIDTH),
          onKeyDown: onPanelResizeKeyDown,
        })
      : null,
    props.placement === 'right'
      ? h('div', {
          className: 'dsh-an-resizeHandleBottom',
          role: 'separator',
          'aria-orientation': 'horizontal',
          'aria-label': say('resize.height'),
          tabIndex: 0,
          title: say('resize.hint'),
          onPointerDown: startPanelHeightResize,
          onDoubleClick: () => commitPanelHeight(0),
          onKeyDown: onPanelHeightKeyDown,
        })
      : null,
    h(PanelHead, {
      say,
      openCount,
      total,
      showSettings,
      onToggleSettings: () => setShowSettings(value => !value),
      onClose: props.onClose,
    }),
    showSettings
      ? h(SettingsPanel, {
          say,
          sendShortcut,
          chooseShortcut,
          forwardPrefix,
          changeForwardPrefix,
          prefixRef,
        })
      : null,
    h(ComposerForm, {
      say,
      draft,
      inputRef: addRef,
      sendShortcut,
      onDraftChange,
      onCompositionStart: () => { composingRef.current = true },
      onCompositionEnd: () => { composingRef.current = false },
      onKeyDown: onDraftKeyDown,
      onSubmit: event => {
        event.preventDefault()
        if (composingRef.current) return
        add()
      },
    }),
    h(NoteList, {
      say,
      listRef,
      listHasMore,
      syncListEdge,
      showOpen,
      toggleOpen,
      openItems,
      openCount,
      total,
      row,
      showDone,
      toggleDone,
      doneItems,
      confirmClear,
      askClearConfirm,
      dismissClearConfirm,
      confirmClearDone,
    }),
    h(
      'div',
      { className: 'dsh-an-popFoot', role: 'status' },
      h('span', { className: syncError ? 'dsh-an-error' : undefined }, say(syncError ? 'storage.failed' : 'popover.storage')),
    ),
  )

  return ReactDOM.createPortal(content, document.body)
}
