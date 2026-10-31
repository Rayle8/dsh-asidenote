/** One note: checkbox, actions, inline edit and the forwarded mark. */
import React from 'react'
import { MAX_TEXT, MOD_LABEL, SEND_SHORTCUT_DEFAULT, isSendModifier } from '../constants'
import { appendToConversation } from '../domain/forward'
import { copyText } from '../domain/clipboard'
import { metaLabel } from '../domain/items'
import { IconCheck, IconCopy, IconForward, IconPencil, IconTrash, withTooltip } from './primitives'

const h = React.createElement

export function TodoRow(props) {
  const { item, done, say, onToast, onToggle, onStartEdit, onDelete, editing, editDraft, setEditDraft, onEditDraftChange, onFinishEdit, onCancelEdit, editRef, forwardPrefix, sendShortcut = SEND_SHORTCUT_DEFAULT, forwarded = false, onForwarded, onUnforwarded } = props
  const editHintKey = sendShortcut === 'enter' ? 'edit.hintEnter' : 'edit.hintCtrlEnter'
  const [pending, setPending] = React.useState('')
  const mountedRef = React.useRef(true)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const copy = async () => {
    if (pending) return
    setPending('copy')
    let ok = false
    try {
      ok = await copyText(item.text)
    } finally {
      if (mountedRef.current) setPending('')
    }
    if (!mountedRef.current) return
    // Settled outcome goes to the frame-wide toast, which outlives the panel.
    if (onToast) onToast(ok ? 'copied' : 'copyFailed')
  }

  const forward = () => {
    // A forwarded note toggles its mark off instead of staging the text again.
    if (forwarded) {
      if (onUnforwarded) onUnforwarded(item)
      if (onToast) onToast('unforwarded')
      return
    }
    if (!appendToConversation(item.text, forwardPrefix)) {
      if (onToast) onToast('forwardFailed')
      return
    }
    // Remember the forward so the button keeps its check after a reopen.
    if (onForwarded) onForwarded(item)
    if (onToast) onToast('forwarded')
  }

  // The checkbox is only the note's state: open or done. Forwarding never moves it.
  const toggleCheck = () => onToggle(item)

  const resizeEditor = node => {
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${node.scrollHeight + 2}px`
  }

  const setEditorRef = React.useCallback(node => {
    editRef.current = node
    if (node) {
      node.style.height = 'auto'
      node.style.height = `${node.scrollHeight + 2}px`
    }
  }, [editRef])

  /** Insert a line break at the caret of the controlled edit textarea and keep focus there. */
  const insertEditNewline = node => {
    if (!node) return
    const start = node.selectionStart === null ? node.value.length : node.selectionStart
    const end = node.selectionEnd === null ? start : node.selectionEnd
    const next = `${node.value.slice(0, start)}\n${node.value.slice(end)}`
    const caret = start + 1
    setEditDraft(next)
    if (onEditDraftChange) onEditDraftChange(next)
    window.requestAnimationFrame(() => {
      node.focus()
      try {
        node.setSelectionRange(caret, caret)
      } catch {
        /* selection APIs are best effort */
      }
      resizeEditor(node)
    })
  }

  const body = editing
    ? h(
        'div',
        { className: 'dsh-an-edit' },
        h('textarea', {
          ref: setEditorRef,
          className: 'dsh-an-editInput',
          value: editDraft,
          rows: 1,
          maxLength: MAX_TEXT,
          'aria-label': say('item.edit'),
          onChange: event => {
            const value = event.target.value
            setEditDraft(value)
            if (onEditDraftChange) onEditDraftChange(value)
            resizeEditor(event.target)
          },
          onKeyDown: event => {
            const composing = event.isComposing || (event.nativeEvent && event.nativeEvent.isComposing)
            if (composing) return
            if (event.key === 'Escape') {
              event.preventDefault()
              onCancelEdit()
              return
            }
            if (event.key !== 'Enter') return
            const chord = event.ctrlKey || event.metaKey
            const platformModifier = isSendModifier(event)
            if (sendShortcut === 'enter') {
              if (!chord && !event.shiftKey) {
                event.preventDefault()
                onFinishEdit(item)
              } else {
                // The platform modifier (⌘/Ctrl)+Enter and Shift+Enter break the line instead of saving.
                event.preventDefault()
                insertEditNewline(event.currentTarget)
              }
              return
            }
            // 'ctrl-enter': the platform modifier saves; Enter and Shift+Enter break the line.
            if (platformModifier) {
              event.preventDefault()
              if (event.shiftKey) insertEditNewline(event.currentTarget)
              else onFinishEdit(item)
            } else if (event.shiftKey) {
              event.preventDefault()
              insertEditNewline(event.currentTarget)
            }
          },
          onBlur: () => onFinishEdit(item),
        }),
        h(
          'div',
          { className: 'dsh-an-editActions' },
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-an-mini dsh-an-miniPrimary',
              onMouseDown: event => event.preventDefault(),
              onClick: () => onFinishEdit(item),
            },
            say('edit.save'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dsh-an-mini',
              onMouseDown: event => event.preventDefault(),
              onClick: onCancelEdit,
            },
            say('edit.cancel'),
          ),
          h('span', { className: 'dsh-an-editHint', title: say(editHintKey, { mod: MOD_LABEL }) }, say(editHintKey, { mod: MOD_LABEL })),
        ),
      )
    : h(
        'div',
        {
          className: 'dsh-an-text',
          title: say('item.editHint'),
          onDoubleClick: () => onStartEdit(item),
        },
        item.text,
      )

  const checked = done === true

  return h(
    'li',
    { className: done ? 'dsh-an-row dsh-an-rowDone' : 'dsh-an-row' },
    h(
      'button',
      {
        type: 'button',
        className: 'dsh-an-check',
        role: 'checkbox',
        'aria-checked': checked ? 'true' : 'false',
        'aria-label': say(done ? 'item.markOpen' : 'item.markDone'),
        onClick: toggleCheck,
      },
      h(
        'span',
        { className: 'dsh-an-checkCircle' },
        checked ? h(IconCheck, { size: 9 }) : null,
      ),
    ),
    h(
      'div',
      { className: 'dsh-an-itemBody' },
      body,
      editing
        ? null
        : h(
            'div',
            { className: 'dsh-an-rowFoot' },
            h('span', { className: 'dsh-an-meta', title: metaLabel(item, say, props.localeId) }, metaLabel(item, say, props.localeId)),
            h(
              'div',
              { className: 'dsh-an-actions' },
              withTooltip(say('item.copy'), h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-iconBtn',
                  'aria-label': say('item.copy'),
                  'aria-busy': pending === 'copy' ? 'true' : 'false',
                  'data-loading': pending === 'copy' ? 'true' : undefined,
                  onClick: copy,
                },
                h(IconCopy, null),
              )),
              // A completed note has nothing left to hand to the composer,
              // so the forward action is absent rather than disabled.
              done ? null : withTooltip(say(forwarded ? 'item.forwarded' : 'item.forward'), h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-iconBtn',
                  'aria-label': say(forwarded ? 'item.forwarded' : 'item.forward'),
                  'data-forwarded': forwarded ? 'true' : undefined,
                  onClick: forward,
                },
                h(IconForward, null),
                forwarded
                  ? h('span', { className: 'dsh-an-forwardMark', 'aria-hidden': true }, h(IconCheck, { size: 8 }))
                  : null,
              )),
              withTooltip(say('item.edit'), h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-iconBtn',
                  'aria-label': say('item.edit'),
                  onClick: () => onStartEdit(item),
                },
                h(IconPencil, null),
              )),
              withTooltip(say('item.delete'), h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-iconBtn dsh-an-iconBtnDanger',
                  'aria-label': say('item.delete'),
                  onClick: () => onDelete(item),
                },
                h(IconTrash, null),
              )),
            ),
      ),
    ),
  )
}
