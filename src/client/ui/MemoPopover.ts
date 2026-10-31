/**
 * The floating notes panel.
 *
 * State, handlers and effects for one session's notes; the markup lives in the
 * sibling components, the geometry in usePanelGeometry and the store in
 * useSessionMemoStore.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { PANEL_DEFAULT_WIDTH } from '../constants'
import { useSessionMemoStore } from './useSessionMemoStore'
import { usePanelGeometry } from './usePanelGeometry'

import { useSections } from './useSections'
import { useForwardMarks } from './useForwardMarks'
import { usePanelSettings } from './usePanelSettings'
import { useUpdateCenter } from './useUpdateCenter'
import { useComposerDraft } from './useComposerDraft'
import { useNoteActions } from './useNoteActions'
import { useClearConfirm } from './useClearConfirm'
import { useListEdge } from './useListEdge'
import { useOutsideDismiss } from './useOutsideDismiss'
import { saveEditDraft } from '../storage/drafts'
import { compareDoneItems } from '../domain/items'

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
  const { sectionsRef, showOpen, showDone, toggleOpen, toggleDone, applySections } = useSections()
  const { forwardedIds, rememberForwarded, unrememberForwarded, forgetForwardedItems } = useForwardMarks(sessionId)
  const { showSettings, setShowSettings, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef } = usePanelSettings()
  // Version check, release notes and the in-app update share one hook; the
  // registry answer is cached for an hour across panel opens.
  const update = useUpdateCenter(localeId)
  const newerVersion = update.latestVersion
  const { draft, addRef, composingRef, add, onDraftChange, onDraftKeyDown } = useComposerDraft({ sessionId, commit, report, sendShortcut })
  const { editingId, editDraft, setEditDraft, editRef, startEdit, finishEdit, cancelEdit, toggle, remove } = useNoteActions({
    sessionId,
    commit,
    report,
    forgetForwardedItems,
  })
  const { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone } = useClearConfirm({
    sessionId,
    showDone,
    doneCount: record.items.filter(item => item.done).length,
    onConfirm: () => clearDone(),
  })
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

  const items = record.items || []
  const openItems = items.filter(item => !item.done)
  const doneItems = items.filter(item => item.done).sort(compareDoneItems)
  const openCount = openItems.length
  const total = items.length
  const { listRef, listHasMore, syncListEdge } = useListEdge({ items, showOpen, showDone })
  useOutsideDismiss(panelRef, props.anchorRef, props.onClose)

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
      newerVersion,
    }),
    showSettings
      ? h(SettingsPanel, {
          say,
          sendShortcut,
          chooseShortcut,
          forwardPrefix,
          changeForwardPrefix,
          prefixRef,
          update,
          onToast: report,
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
