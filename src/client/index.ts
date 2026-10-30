/**
 * AsideNote browser half.
 *
 * The plugin entry: injects the stylesheet, binds the locale namespace and
 * seats the two slots (session capture + frame-wide toast host) plus the
 * host-owned header entry. Copy, storage, domain rules and the panel UI live
 * in their own modules; P2 splits the remaining UI out of this file.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import ReactDOMClient from 'react-dom/client'

import CSS from './styles/panel.css?inline'
import {
  NS,
  PANEL_ID,
  SESSION_STORAGE_KEY,
  PLUGIN_VERSION,
  PLUGIN_AUTHOR,
  PLUGIN_REPO_URL,
  PLUGIN_REPO_LABEL,
  MOD_LABEL,
  isSendModifier,
  CLEAR_CONFIRM_MS,
  PANEL_DEFAULT_WIDTH,
  PANEL_MIN_WIDTH,
  PANEL_MAX_WIDTH,
  PANEL_MIN_HEIGHT,
  MAX_TEXT,
} from './constants'
import { DICT, fill, makeSay } from './i18n'
import { Toast, icon, withTooltip, IconChevron, IconClose, IconGear } from './ui/primitives'
import { TodoRow } from './ui/TodoRow'
import { EmptyState } from './ui/EmptyState'
import { memoPopoverStyle, syncStickyHeads } from './ui/position'
import { uid } from './domain/id'

import { readSessionStore } from './storage/session'
import { migrateLegacyStorage } from './storage/migrate'
import { normalizeItems, compareDoneItems } from './domain/items'
import {
  readPanelWidth,
  writePanelWidth,
  readPanelHeight,
  writePanelHeight,
  readSendShortcut,
  writeSendShortcut,
  readForwardPrefix,
  writeForwardPrefix,
  readSectionState,
  writeSectionState,
} from './storage/prefs'
import { readSessionDrafts, saveAddDraft, clearAddDraft, readEditDraft, saveEditDraft, clearEditDraft } from './storage/drafts'
import { readForwardedIds, markForwarded, forgetForwarded } from './storage/forwarded'
import { useSessionMemoStore } from './ui/useSessionMemoStore'
import { TODO_LISTENERS } from './storage/events'

const h = React.createElement

// Shared controls come from the seeded platform module, so the panel uses the
// product's Tooltip and Toast instead of a second copy. The bundle declares it
// external: a host that cannot resolve it fails the build, never ships a duplicate.
















































/** Compact floating memo list, anchored to the entry that opened it. */
function MemoPopover(props) {
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
  const [panelWidth, setPanelWidth] = React.useState(readPanelWidth)
  const [panelHeight, setPanelHeight] = React.useState(readPanelHeight)
  const [style, setStyle] = React.useState(() => memoPopoverStyle(props.anchorRef.current, props.placement, panelWidth, panelHeight))
  const [listHasMore, setListHasMore] = React.useState(false)
  const panelRef = React.useRef(null)
  const listRef = React.useRef(null)
  const panelWidthRef = React.useRef(panelWidth)
  const panelHeightRef = React.useRef(panelHeight)
  const lastStyleRef = React.useRef('')
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

  const updatePosition = React.useCallback(() => {
    if (props.anchorRef.current || props.placement === 'right') {
      const next = memoPopoverStyle(props.anchorRef.current, props.placement, panelWidth, panelHeight)
      const key = JSON.stringify(next)
      if (key === lastStyleRef.current) return
      lastStyleRef.current = key
      setStyle(next)
    }
  }, [props.anchorRef, props.placement, panelWidth, panelHeight])

  React.useEffect(() => {
    panelWidthRef.current = panelWidth
  }, [panelWidth])

  React.useEffect(() => {
    panelHeightRef.current = panelHeight
  }, [panelHeight])

  const clampPanelWidth = value => {
    const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))
    return Math.max(PANEL_MIN_WIDTH, Math.min(max, value))
  }

  const commitPanelWidth = value => {
    const next = clampPanelWidth(value)
    panelWidthRef.current = next
    setPanelWidth(next)
    writePanelWidth(next)
  }

  const startPanelResize = event => {
    if (event.button !== 0) return
    event.preventDefault()
    const startX = event.clientX
    const startWidth = panelWidthRef.current
    const onMove = moveEvent => {
      const next = clampPanelWidth(startWidth + (startX - moveEvent.clientX))
      panelWidthRef.current = next
      setPanelWidth(next)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      writePanelWidth(panelWidthRef.current)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'
  }

  const onPanelResizeKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitPanelWidth(panelWidthRef.current + 16)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitPanelWidth(panelWidthRef.current - 16)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitPanelWidth(PANEL_DEFAULT_WIDTH)
    }
  }

  const clampPanelHeight = value => {
    const max = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 64 - 16)
    return Math.max(PANEL_MIN_HEIGHT, Math.min(max, value))
  }

  const commitPanelHeight = value => {
    const next = value > 0 ? clampPanelHeight(value) : 0
    panelHeightRef.current = next
    setPanelHeight(next)
    writePanelHeight(next)
  }

  const startPanelHeightResize = event => {
    if (event.button !== 0) return
    event.preventDefault()
    const startY = event.clientY
    const startHeight = panelHeightRef.current
      || (panelRef.current ? panelRef.current.getBoundingClientRect().height : 360)
    const onMove = moveEvent => {
      const next = clampPanelHeight(startHeight + (moveEvent.clientY - startY))
      panelHeightRef.current = next
      setPanelHeight(next)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      writePanelHeight(panelHeightRef.current)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ns-resize'
  }

  const onPanelHeightKeyDown = event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      commitPanelHeight((panelHeightRef.current || 360) + 16)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      commitPanelHeight((panelHeightRef.current || 360) - 16)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitPanelHeight(0)
    }
  }

  React.useLayoutEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  React.useEffect(() => {
    const anchor = props.anchorRef.current
    if (!anchor || typeof ResizeObserver !== 'function') return undefined
    const target = anchor.closest('[class*="_header"]') || anchor
    const observer = new ResizeObserver(updatePosition)
    observer.observe(target)
    return () => observer.disconnect()
  }, [props.anchorRef, updatePosition])

  React.useEffect(() => {
    const timer = window.setInterval(updatePosition, 400)
    return () => window.clearInterval(timer)
  }, [updatePosition])

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
    h(
      'div',
      { className: 'dsh-an-popHead' },
      h(
        'div',
        { className: 'dsh-an-popTitleLine' },
        h('div', { className: 'dsh-an-popTitle' }, say('popover.title')),
        h('p', { className: 'dsh-an-popMeta' }, say('popover.count', { open: openCount, total })),
      ),
      h(
        'div',
        { className: 'dsh-an-popActions' },
        withTooltip(say('settings.open'), h(
          'button',
          {
            type: 'button',
            className: 'dsh-an-settingsBtn',
            'data-active': showSettings ? 'true' : undefined,
            'aria-label': say('settings.open'),
            'aria-expanded': showSettings,
            onClick: () => setShowSettings(value => !value),
          },
          h(IconGear, null),
        )),
        withTooltip(say('popover.close'), h(
          'button',
          { type: 'button', className: 'dsh-an-popClose', 'aria-label': say('popover.close'), onClick: props.onClose },
          h(IconClose, null),
        )),
      ),
    ),
    showSettings
      ? h(
          'div',
          { className: 'dsh-an-settings' },
          h('div', { className: 'dsh-an-settingsHead' }, say('settings.title')),
          h(
            'div',
            { className: 'dsh-an-settingGroup' },
            h('div', { className: 'dsh-an-settingLabel' }, say('settings.shortcut')),
            h(
              'div',
              { className: 'dsh-an-settingBody' },
              h(
                'div',
                { className: 'dsh-an-settingChoices' },
                h(
                  'label',
                  { className: 'dsh-an-settingChoice' },
                  h('input', {
                    type: 'radio',
                    name: 'dsh-an-send-shortcut',
                    checked: sendShortcut === 'enter',
                    onChange: () => chooseShortcut('enter'),
                  }),
                  h('span', null, say('settings.shortcutEnter', { mod: MOD_LABEL })),
                ),
                h(
                  'label',
                  { className: 'dsh-an-settingChoice' },
                  h('input', {
                    type: 'radio',
                    name: 'dsh-an-send-shortcut',
                    checked: sendShortcut === 'ctrl-enter',
                    onChange: () => chooseShortcut('ctrl-enter'),
                  }),
                  h('span', null, say('settings.shortcutCtrlEnter', { mod: MOD_LABEL })),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'dsh-an-settingGroup' },
            h('div', { className: 'dsh-an-settingLabel' }, say('settings.forward')),
            h(
              'div',
              { className: 'dsh-an-settingBody' },
              h(
                'div',
                { className: 'dsh-an-settingItem' },
                h('textarea', {
                  id: 'dsh-an-forward-prefix',
                  ref: prefixRef,
                  className: 'dsh-an-settingInput dsh-an-settingTextarea',
                  value: forwardPrefix,
                  rows: 1,
                  maxLength: 80,
                  placeholder: say('forward.prefix'),
                  'aria-label': say('settings.forwardPrefixItem'),
                  'aria-describedby': 'dsh-an-forward-prefix-hint',
                  style: {
                    fontFamily: 'inherit',
                    fontSize: 'var(--an-fs-row)',
                    lineHeight: 'var(--an-lh-row)',
                    fontWeight: 500,
                  },
                  onChange: event => changeForwardPrefix(event.target.value),
                }),
                h('p', { id: 'dsh-an-forward-prefix-hint', className: 'dsh-an-settingHint' }, say('settings.forwardPrefixHint')),
              ),
            ),
          ),
          h(
            'div',
            { className: 'dsh-an-settingGroup' },
            h('div', { className: 'dsh-an-settingLabel' }, say('settings.about')),
            h(
              'div',
              { className: 'dsh-an-settingBody' },
              h(
                'div',
                { className: 'dsh-an-settingAbout' },
                h('span', null, `${say('settings.version')} ${PLUGIN_VERSION}`),
                h('span', { className: 'dsh-an-settingDot', 'aria-hidden': true }, '·'),
                h('span', null, `${say('settings.author')} ${PLUGIN_AUTHOR}`),
              ),
              h(
                'div',
                { className: 'dsh-an-settingProject' },
                h('span', null, say('settings.project')),
                h(
                  'a',
                  {
                    className: 'dsh-an-settingLink',
                    href: PLUGIN_REPO_URL,
                    target: '_blank',
                    rel: 'noreferrer',
                    title: PLUGIN_REPO_URL,
                  },
                  PLUGIN_REPO_LABEL,
                ),
              ),
            ),
          ),
        )
      : null,
    h(
      'form',
      {
        className: 'dsh-an-add',
        onSubmit: event => {
          event.preventDefault()
          if (composingRef.current) return
          add()
        },
      },
      h('textarea', {
        ref: addRef,
        className: 'dsh-an-input',
        value: draft,
        rows: 1,
        maxLength: MAX_TEXT,
        placeholder: say('add.placeholder'),
        'aria-label': say('add.placeholder'),
        onChange: event => {
          const value = event.target.value
          setDraft(value)
          saveAddDraft(sessionId, value)
          resizeAdd(event.target)
        },
        onCompositionStart: () => { composingRef.current = true },
        onCompositionEnd: () => { composingRef.current = false },
        onKeyDown: event => {
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
        },
      }),
      h(
        'div',
        { className: 'dsh-an-addFoot' },
        h('span', { className: 'dsh-an-addShortcut' }, say(sendShortcut === 'enter' ? 'add.shortcutEnter' : 'add.shortcut', { mod: MOD_LABEL })),
        h('button', { type: 'submit', className: 'dsh-an-addBtn', disabled: !draft.trim() }, say('add.action')),
      ),
    ),
    h(
      'div',
      {
        className: 'dsh-an-listViewport',
        'data-bottom': listHasMore ? 'true' : undefined,
      },
      h(
        'div',
        { className: 'dsh-an-listArea', ref: listRef, onScroll: syncListEdge },
        h(
          'div',
          { className: 'dsh-an-listSection' },
          h(
            'div',
            { className: 'dsh-an-sectionHead' },
            h(
              'button',
              {
                type: 'button',
                className: 'dsh-an-doneToggle',
                'aria-expanded': showOpen ? 'true' : 'false',
                onClick: toggleOpen,
              },
              h('span', { className: 'dsh-an-chevron', 'data-open': showOpen ? 'true' : 'false' }, h(IconChevron, null)),
              say('list.open'),
              openCount ? h('span', { className: 'dsh-an-sectionCount' }, String(openCount)) : null,
            ),
          ),
          showOpen
            ? openItems.length
              ? h('ul', { className: 'dsh-an-rows' }, openItems.map(row))
              : h(EmptyState, {
                  title: say(total ? 'list.allDone.title' : 'popover.empty.title'),
                  body: say(total ? 'list.allDone.body' : 'popover.empty.body'),
                })
            : null,
        ),
        doneItems.length
          ? h(
              'div',
              { className: 'dsh-an-listSection' },
              h(
                'div',
                { className: 'dsh-an-doneHead' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dsh-an-doneToggle',
                    'aria-expanded': showDone ? 'true' : 'false',
                    onClick: toggleDone,
                  },
                  h('span', { className: 'dsh-an-chevron', 'data-open': showDone ? 'true' : 'false' }, h(IconChevron, null)),
                  say('popover.completed'),
                  h('span', { className: 'dsh-an-sectionCount' }, String(doneItems.length)),
                ),
                showDone
                  ? h('button', {
                      type: 'button',
                      className: 'dsh-an-clear',
                      'aria-expanded': confirmClear ? 'true' : 'false',
                      onClick: askClearConfirm,
                    }, say('popover.clearDone'))
                  : null,
              ),
              showDone && confirmClear
                ? h(
                    'div',
                    {
                      className: 'dsh-an-clearConfirm',
                      role: 'group',
                      'aria-live': 'polite',
                      'aria-label': say('popover.clearConfirm', { n: doneItems.length }),
                    },
                    h('p', { className: 'dsh-an-clearConfirmText' }, say('popover.clearConfirm', { n: doneItems.length })),
                    h(
                      'div',
                      { className: 'dsh-an-clearConfirmActions' },
                      h('button', { type: 'button', className: 'dsh-an-mini', onClick: dismissClearConfirm }, say('popover.clearCancel')),
                      h('button', { type: 'button', className: 'dsh-an-mini dsh-an-miniDanger', onClick: confirmClearDone }, say('popover.clearConfirmAction')),
                    ),
                  )
                : null,
              showDone ? h('ul', { className: 'dsh-an-rows dsh-an-doneRows' }, doneItems.map(row)) : null,
            )
          : null,
      ),
    ),
    h(
      'div',
      { className: 'dsh-an-popFoot', role: 'status' },
      h('span', { className: syncError ? 'dsh-an-error' : undefined }, say(syncError ? 'storage.failed' : 'popover.storage')),
    ),
  )

  return ReactDOM.createPortal(content, document.body)
}

function apply(ctx: DshClientCtx) {
  // 1.x notes live under the old keys; copy them once, before any reader runs.
  migrateLegacyStorage()

  const locale = ctx.get('locale')

  // One document-level sheet covers both the panel and the composer dock;
  // the dock mounts outside the panel tree, so a panel-local <style> would
  // leave it unstyled until the panel had been opened once.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'dsh-asidenote'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-asidenote: styles')

  if (locale && typeof locale.register === 'function') {
    ctx.effect(() => locale.register(NS, DICT), 'dsh-asidenote: dictionaries')
  }

  const localeId = () => {
    try {
      const current = locale && typeof locale.getLocale === 'function' ? locale.getLocale() : null
      const id = current && (current.id || current.locale)
      return typeof id === 'string' && id ? id : 'zh'
    } catch {
      return 'zh'
    }
  }

  const say = makeSay(ctx, localeId)

  const tr = (key: string, vars?: Record<string, any>) => fill(say(key), vars)
  let activePopover = null
  let activeSessionId = ''

  // Settled outcomes (copy, forward, delete, write failure) live here rather
  // than inside the panel: the panel unmounts on close, the banner must not.
  const toastSource = (() => {
    let notice = null
    let sequence = 0
    const listeners = new Set<() => void>()
    const publish = next => {
      notice = next
      for (const listener of listeners) listener()
    }
    return {
      hooks: {
        notice: {
          getSnapshot: () => notice,
          subscribe: listener => {
            listeners.add(listener)
            return () => { listeners.delete(listener) }
          },
        },
      },
      show(kind) {
        sequence += 1
        publish({ kind, sequence })
      },
      dismiss() {
        publish(null)
      },
    }
  })()

  const TOAST_COPY = {
    copied: { key: 'toast.copied', tone: 'success' },
    forwarded: { key: 'toast.forwarded', tone: 'success' },
    unforwarded: { key: 'toast.unforwarded', tone: 'success' },
    deleted: { key: 'toast.deleted', tone: 'success' },
    cleared: { key: 'toast.cleared', tone: 'success' },
    copyFailed: { key: 'toast.copyFailed' },
    forwardFailed: { key: 'toast.forwardFailed' },
    saveFailed: { key: 'toast.saveFailed' },
  }
  const WarningIcon = icon('IconWarningOutlineRegular')

  /** The frame-wide toast seat: one notice at a time, dismissed when faded. */
  function ToastHost(props) {
    const notice = React.useSyncExternalStore(
      toastSource.hooks.notice.subscribe,
      toastSource.hooks.notice.getSnapshot,
    )
    if (!notice || !Toast) return null
    const copy = TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed
    const bound = props && typeof props.t === 'function' ? props.t(copy.key) : ''
    // The slot's `t` falls back to the key when the namespace is not bound yet.
    const text = bound && bound !== copy.key ? bound : tr(copy.key)
    return h(Toast, {
      key: notice.sequence,
      text,
      tone: copy.tone,
      icon: copy.tone ? undefined : WarningIcon ? h(WarningIcon, { size: 16 }) : undefined,
      onDone: toastSource.dismiss,
    })
  }

  const closeMemoPopover = () => {
    const current = activePopover
    activePopover = null
    if (!current) return
    // Only hand focus back to the entry when the panel itself had it; a click
    // elsewhere must leave focus where the user put it.
    const hadFocus = current.container.contains(document.activeElement)
    try {
      current.root.unmount()
    } catch {
      /* already unmounted */
    }
    current.container.remove()
    const anchor = current.anchor
    if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === 'function') {
      anchor.focus({ preventScroll: true })
    }
    refreshHeaderEntry()
  }

  const openMemoPopover = (sessionId, anchor, placement = 'popover') => {
    if (activePopover && activePopover.anchor === anchor) {
      closeMemoPopover()
      return
    }
    closeMemoPopover()
    const container = document.createElement('div')
    container.dataset.dshMemoPopoverRoot = 'true'
    document.body.appendChild(container)
    const root = ReactDOMClient.createRoot(container)
    activePopover = { container, root, anchor, placement }
    root.render(h(MemoPopover, {
      sessionId,
      say: tr,
      localeId: localeId(),
      anchorRef: { current: anchor },
      placement,
      onClose: closeMemoPopover,
      onToast: kind => toastSource.show(kind),
    }))
    refreshHeaderEntry()
  }

  // The plugin's own glyph, shared by the header entry and `.icon.svg`
  // (same paths, same stroke). The entry is host-owned DOM, so the glyph is
  // inlined rather than rendered through a React root the host would reclaim.
  const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

  const refreshHeaderEntry = () => {
    const host = document.querySelector('[class*="_headerUtilities"]')
    let button = (host ? host.querySelector(':scope > .dsh-an-headerBtn') : null) as HTMLButtonElement | null
    if (!host || !activeSessionId) {
      if (button) button.remove()
      return
    }
    const store = readSessionStore()
    const items = normalizeItems(store.sessions[activeSessionId] && store.sessions[activeSessionId].items)
    const open = items.filter(item => !item.done).length
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dsh-an-headerBtn'
      button.addEventListener('pointerdown', event => event.stopPropagation())
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        openMemoPopover(activeSessionId, button, 'right')
      })
      host.appendChild(button)
    }
    button.dataset.active = activePopover && activePopover.anchor === button ? 'true' : 'false'
    const signature = `${localeId()}:${activeSessionId}:${open}`
    if (button.dataset.signature !== signature) {
      const icon = document.createElement('span')
      icon.className = 'dsh-an-headerIcon'
      icon.innerHTML = HEADER_ICON
      button.replaceChildren(icon)
      if (open > 0) {
        const count = document.createElement('span')
        count.className = 'dsh-an-headerCount'
        count.textContent = open > 99 ? '99+' : String(open)
        button.appendChild(count)
      }
      button.dataset.signature = signature
    }
    button.dataset.sessionId = activeSessionId
    // The header entry is host-owned DOM (a React portal beside it would be
    // reconciled away), so the shared Tooltip cannot wrap it; a native title
    // keeps the icon-only control explained on hover.
    button.title = open > 0 ? tr('header.tooltip', { n: open }) : tr('header.tooltipEmpty')
    button.setAttribute('aria-label', open > 0
      ? `${tr('dock.open')}, ${tr('dock.count', { n: open })}`
      : tr('dock.open'))
  }

  ctx.effect(() => {
    let scheduled = false
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        refreshHeaderEntry()
      })
    }
    const onStorage = event => {
      if (event.key === SESSION_STORAGE_KEY) schedule()
    }
    TODO_LISTENERS.add(schedule)
    window.addEventListener('storage', onStorage)
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    refreshHeaderEntry()
    return () => {
      TODO_LISTENERS.delete(schedule)
      window.removeEventListener('storage', onStorage)
      observer.disconnect()
      closeMemoPopover()
      for (const button of document.querySelectorAll('.dsh-an-headerBtn')) button.remove()
    }
  }, 'dsh-asidenote: right-side entry')

  function BoundSessionCapture(props) {
    const sessionId = props.sessionId || ''
    React.useEffect(() => {
      if (activeSessionId !== sessionId) {
        activeSessionId = sessionId
        closeMemoPopover()
      }
      refreshHeaderEntry()
    }, [sessionId])
    return null
  }

  ctx.slots.inject('conversation.composer.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.composer.dock',
        id: PANEL_ID,
        order: 30,
        locale: NS,
      },
      BoundSessionCapture,
    ),
  )

  // Transient outcomes belong to the frame, not to the panel that raised
  // them; the layout's overlay seat keeps them alive after the panel closes.
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: `${PANEL_ID}.toast`,
        order: 60,
        locale: NS,
      },
      ToastHost,
    ),
  )
}


module.exports = { inject: ['slots'], apply }
