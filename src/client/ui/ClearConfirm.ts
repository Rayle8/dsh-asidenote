/** Inline second confirmation for clearing the completed notes. */
import React from 'react'

const h = React.createElement

export function ClearConfirm(props) {
  const { say, count, onCancel, onConfirm } = props
  return h(
    'div',
    {
      className: 'dsh-an-clearConfirm',
      role: 'group',
      'aria-live': 'polite',
      'aria-label': say('popover.clearConfirm', { n: count }),
    },
    h('p', { className: 'dsh-an-clearConfirmText' }, say('popover.clearConfirm', { n: count })),
    h(
      'div',
      { className: 'dsh-an-clearConfirmActions' },
      h('button', { type: 'button', className: 'dsh-an-mini', onClick: onCancel }, say('popover.clearCancel')),
      h('button', { type: 'button', className: 'dsh-an-mini dsh-an-miniDanger', onClick: onConfirm }, say('popover.clearConfirmAction')),
    ),
  )
}
