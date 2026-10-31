/** The add form: one growing textarea, the shortcut hint and the submit button. */
import React from 'react'
import { MAX_TEXT, MOD_LABEL } from '../constants'

const h = React.createElement

export function ComposerForm(props) {
  const { say, draft, inputRef, sendShortcut, onDraftChange, onCompositionStart, onCompositionEnd, onKeyDown, onSubmit } = props
  return h(
    'form',
    { className: 'dsh-an-add', onSubmit },
    h('textarea', {
      ref: inputRef,
      className: 'dsh-an-input',
      value: draft,
      rows: 1,
      maxLength: MAX_TEXT,
      placeholder: say('add.placeholder'),
      'aria-label': say('add.placeholder'),
      onChange: onDraftChange,
      onCompositionStart,
      onCompositionEnd,
      onKeyDown,
    }),
    h(
      'div',
      { className: 'dsh-an-addFoot' },
      h('span', { className: 'dsh-an-addShortcut' }, say(sendShortcut === 'enter' ? 'add.shortcutEnter' : 'add.shortcut', { mod: MOD_LABEL })),
      h('button', { type: 'submit', className: 'dsh-an-addBtn', disabled: !draft.trim() }, say('add.action')),
    ),
  )
}
