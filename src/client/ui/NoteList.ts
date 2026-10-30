/** Open/completed sections, their sticky heads, rows and the clear confirmation. */
import React from 'react'
import { ClearConfirm } from './ClearConfirm'
import { EmptyState } from './EmptyState'
import { IconChevron } from './primitives'

const h = React.createElement

export function NoteList(props) {
  const {
    say, listRef, listHasMore, syncListEdge,
    showOpen, toggleOpen, openItems, openCount, total, row,
    showDone, toggleDone, doneItems,
    confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone,
  } = props
  return     h(
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
                  ? h(ClearConfirm, {
                      say,
                      count: doneItems.length,
                      onCancel: dismissClearConfirm,
                      onConfirm: confirmClearDone,
                    })
                  : null,
                showDone ? h('ul', { className: 'dsh-an-rows dsh-an-doneRows' }, doneItems.map(row)) : null,
              )
            : null,
        ),
      )
}
