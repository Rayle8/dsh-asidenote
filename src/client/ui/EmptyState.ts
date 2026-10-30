import React from 'react'
import { IconEmpty } from './primitives'

const h = React.createElement

export function EmptyState(props) {
  return h(
    'div',
    { className: 'dsh-an-empty' },
    h('div', { className: 'dsh-an-emptyIcon' }, h(IconEmpty, null)),
    h('div', { className: 'dsh-an-emptyTitle' }, props.title),
    h('div', { className: 'dsh-an-emptyBody' }, props.body),
  )
}
