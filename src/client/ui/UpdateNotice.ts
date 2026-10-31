/**
 * Settings › About › update centre.
 *
 * One compact card: the published version, a disclosure that loads the release
 * notes for it, a link to the full release page, and the update action itself.
 * The action is a button, never automatic: the market queues the update when it
 * is clicked, and the panel reports the operation instead of guessing.
 *
 * A jump across several versions lists each release separately: the newest one
 * opens by default and the ones behind it expand on demand, so a 2.0.0 install
 * upgrading to 2.3.0 can read 2.1.0, 2.2.0 and 2.3.0 in order.
 */
import React from 'react'
import type { NotesEntry, NotesState, RunPhase, UpdateRunState } from './useUpdateCenter'
import type { ReleaseNoteGroup } from '../update/releaseNotes'

const h = React.createElement

const NOTES_ID = 'dsh-an-update-notes'

/** Failure codes the card can explain without echoing the market's message. */
const FAILURE_COPY: Record<string, string> = {
  NO_MARKET: 'update.noMarket',
  RELEASE_TOO_FRESH: 'update.tooFresh',
  VERSION_UNCHANGED: 'update.unchanged',
  PLUGIN_NOT_INSTALLED: 'update.notInstalled',
  UPDATE_FORBIDDEN: 'update.forbidden',
  UPDATE_REJECTED: 'update.rejected',
  OPERATION_BUSY: 'update.busy',
  UPDATE_TIMEOUT: 'update.timeout',
}

export function UpdateNotice(props: {
  say: (key: string, vars?: Record<string, any>) => string
  latestVersion: string | null
  market: 'unknown' | 'unsupported' | 'ready'
  restartSupported: boolean
  notes: NotesState
  expanded: boolean
  expandedVersions: Record<string, boolean>
  releasesUrl: string
  run: UpdateRunState
  fullReleaseUrl: string | null
  onToggleNotes: () => void
  onToggleVersion: (version: string) => void
  onStartUpdate: (force?: boolean) => void
  onRefresh: () => void
  onRestart: () => void
}) {
  const { say, latestVersion, market, restartSupported, notes, expanded, expandedVersions, run, fullReleaseUrl } = props
  if (latestVersion === null) return null

  const phase: RunPhase = run.phase
  const busy = phase === 'starting' || phase === 'running'
  const stopped = market === 'unsupported'
  const failureKey = run.failureCode ? FAILURE_COPY[run.failureCode] : ''
  const canForce = run.failureCode === 'RELEASE_TOO_FRESH' || run.failureCode === 'VERSION_UNCHANGED'

  const progress = phase === 'running'
    ? (run.percent === null
        ? say('update.updating')
        : say('update.updatingPercent', { percent: run.percent }))
    : ''

  const noteGroups = (list: ReleaseNoteGroup[]) => list.map((group, index) =>
    h(
      'div',
      { key: `${group.title}-${index}`, className: 'dsh-an-updateGroup' },
      group.title ? h('div', { className: 'dsh-an-updateGroupTitle' }, group.title) : null,
      h(
        'ul',
        { className: 'dsh-an-updateItems' },
        group.items.map((item, itemIndex) =>
          h(
            'li',
            { key: itemIndex, className: 'dsh-an-updateItem' },
            item.lead ? h('strong', null, item.lead) : null,
            item.lead ? ' ' : null,
            item.body,
          ),
        ),
      ),
    ),
  )

  const entryBody = (entry: NotesEntry) => (entry.groups.length > 0
    ? noteGroups(entry.groups)
    : h('p', { className: 'dsh-an-updateHint' }, say('update.notesMissing')))

  const notesBody = notes.status === 'loading'
    ? h('p', { className: 'dsh-an-updateHint' }, say('update.notesLoading'))
    : notes.status === 'error'
      ? h('p', { className: 'dsh-an-updateHint' }, say('update.notesFailed'))
      : notes.status === 'ready' && notes.entries.length === 1
        ? entryBody(notes.entries[0])
        : notes.status === 'ready'
          ? h(
              'div',
              { className: 'dsh-an-updateVersions' },
              h('p', { className: 'dsh-an-updateHint' }, say('update.historyCount', { n: notes.entries.length })),
              notes.entries.map((entry, index) => {
                const open = expandedVersions[entry.version] === true
                return h(
                  'div',
                  { key: entry.version, className: 'dsh-an-updateVersion' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-an-updateVersionHead',
                      'aria-expanded': open,
                      onClick: () => props.onToggleVersion(entry.version),
                    },
                    h('span', {
                      className: 'dsh-an-updateChevron',
                      'data-open': open ? 'true' : 'false',
                      'aria-hidden': true,
                    }, '▸'),
                    h('span', { className: 'dsh-an-updateVersionLabel' }, `v${entry.version}`),
                    index === 0 ? h('span', { className: 'dsh-an-updateLatest' }, say('update.latest')) : null,
                  ),
                  open ? h('div', { className: 'dsh-an-updateVersionBody' }, entryBody(entry)) : null,
                )
              }),
              notes.truncated
                ? h(
                    'a',
                    { className: 'dsh-an-updateFull', href: props.releasesUrl, target: '_blank', rel: 'noreferrer' },
                    say('update.olderNotes'),
                  )
                : null,
            )
          : null

  return h(
    'div',
    { className: 'dsh-an-updateCard' },
    h('div', { className: 'dsh-an-updateTitle' }, say('update.available', { version: `v${latestVersion}` })),
    h(
      'div',
      { className: 'dsh-an-updateLinks' },
      h(
        'button',
        {
          type: 'button',
          className: 'dsh-an-updateToggle',
          'aria-expanded': expanded,
          'aria-controls': NOTES_ID,
          onClick: props.onToggleNotes,
        },
        say(expanded ? 'update.notesHide' : 'update.notesShow'),
      ),
      fullReleaseUrl
        ? h(
            'a',
            {
              className: 'dsh-an-updateFull',
              href: fullReleaseUrl,
              target: '_blank',
              rel: 'noreferrer',
            },
            say('update.full'),
          )
        : null,
    ),
    expanded ? h('div', { id: NOTES_ID, className: 'dsh-an-updateNotes', role: 'region' }, notesBody) : null,
    stopped
      ? h('p', { className: 'dsh-an-updateHint' }, say('update.noMarket'))
      : h(
          'div',
          { className: 'dsh-an-updateActions' },
          phase === 'done'
            ? h(
                'div',
                { className: 'dsh-an-updateDone' },
                h('span', { className: 'dsh-an-updateHint' }, say('update.updated', {
                  version: run.installedVersion ? `v${run.installedVersion}` : `v${latestVersion}`,
                })),
                run.restartRequired && restartSupported
                  ? h('button', { type: 'button', className: 'dsh-an-updatePrimary', onClick: props.onRestart }, say('update.restart'))
                  : h('button', { type: 'button', className: 'dsh-an-updatePrimary', onClick: props.onRefresh }, say('update.refresh')),
              )
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-updatePrimary',
                  disabled: busy,
                  onClick: () => props.onStartUpdate(false),
                },
                busy ? (phase === 'starting' ? say('update.starting') : progress) : say('update.now'),
              ),
          phase === 'error'
            ? h(
                'p',
                { className: 'dsh-an-updateError', role: 'status' },
                failureKey
                  ? say(failureKey)
                  : say('update.failed', { reason: run.message || run.failureCode || '' }),
                canForce
                  ? h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsh-an-updateLinkBtn',
                        onClick: () => props.onStartUpdate(true),
                      },
                      say('update.force'),
                    )
                  : null,
              )
            : null,
          run.phase === 'done' && run.restartRequired && !restartSupported
            ? h('p', { className: 'dsh-an-updateHint' }, say('update.restartHint'))
            : null,
        ),
  )
}
