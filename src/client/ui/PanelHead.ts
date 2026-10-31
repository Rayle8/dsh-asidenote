/** Panel title, counts and the settings/close actions. */
import React from 'react'
import { IconClose, IconGear, withTooltip } from './primitives'

const h = React.createElement

export function PanelHead(props) {
  const { say, openCount, total, showSettings, onToggleSettings, onClose, newerVersion } = props
  return h(
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
          'aria-label': newerVersion
            ? `${say('settings.open')} · ${say('update.tip', { version: `v${newerVersion}` })}`
            : say('settings.open'),
          'aria-expanded': showSettings,
          onClick: onToggleSettings,
        },
        h(IconGear, null),
        newerVersion ? h('span', { className: 'dsh-an-updateDot', 'aria-hidden': true }) : null,
      )),
      withTooltip(say('popover.close'), h(
        'button',
        { type: 'button', className: 'dsh-an-popClose', 'aria-label': say('popover.close'), onClick: onClose },
        h(IconClose, null),
      )),
    ),
  )
}
