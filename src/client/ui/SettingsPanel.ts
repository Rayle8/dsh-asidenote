/** Settings card: send shortcut, forward prefix and about. */
import React from 'react'
import {
  MOD_LABEL,
  PLUGIN_AUTHOR,
  PLUGIN_REPO_LABEL,
  PLUGIN_REPO_URL,
  PLUGIN_VERSION,
} from '../constants'

const h = React.createElement

export function SettingsPanel(props) {
  const { say, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef } = props
  return h(
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
}
