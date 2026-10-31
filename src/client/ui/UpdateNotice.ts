/**
 * Settings › About › update centre.
 *
 * One compact card: the published version, the release notes it ships with, and
 * the update action. The notes load and show as soon as an update is offered —
 * they are not hidden behind a disclosure. The action is a button, never
 * automatic: the market queues the update when it is clicked, and the panel
 * reports the operation instead of guessing.
 *
 * When the market is missing, or stays busy with another operation after the
 * waiting window, the card stops insisting on its own button and states the
 * terminal command — with one click to copy a ready-to-paste prompt for an
 * agent. The panel still never runs a package manager itself.
 *
 * A jump across several versions lists each release separately: the newest one
 * opens by default and the ones behind it expand on demand, so a 2.0.0 install
 * upgrading to 2.3.0 can read 2.1.0, 2.2.0 and 2.3.0 in order. The full release
 * page opens from the link beside the update button.
 */
import React from 'react'
import type { NotesEntry, NotesState, RunPhase, UpdateRunState } from './useUpdateCenter'
import type { ReleaseNoteGroup } from '../update/releaseNotes'

const h = React.createElement

const NOTES_ID = 'dsh-an-update-notes'

/** Failure codes the card can explain without echoing the market's message. */
const FAILURE_COPY: Record<string, string> = {
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
  expandedVersions: Record<string, boolean>
  releasesUrl: string
  run: UpdateRunState
  fullReleaseUrl: string | null
  onToggleVersion: (version: string) => void
  onStartUpdate: (force?: boolean) => void
  onRefresh: () => void
  onRestart: () => void
  onCopyPrompt: (text: string) => Promise<boolean>
  onToast?: (kind: string) => void
}) {
  const { say, latestVersion, market, restartSupported, notes, expandedVersions, run, fullReleaseUrl } = props
  const notesRef = React.useRef<HTMLDivElement | null>(null)
  const [fade, setFade] = React.useState(false)

  const syncFade = React.useCallback(() => {
    const node = notesRef.current
    if (!node) {
      setFade(false)
      return
    }
    const overflow = node.scrollHeight > node.clientHeight + 1
    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
    setFade(overflow && !atBottom)
  }, [])

  React.useEffect(() => {
    const node = notesRef.current
    if (!node) return undefined
    const frame = requestAnimationFrame(syncFade)
    const onScroll = () => syncFade()
    node.addEventListener('scroll', onScroll, { passive: true })
    let observer: any = null
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(syncFade)
      observer.observe(node)
    }
    window.addEventListener('resize', syncFade)
    return () => {
      cancelAnimationFrame(frame)
      node.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', syncFade)
      observer?.disconnect()
    }
  }, [notes.status, notes.entries, expandedVersions, syncFade])

  if (latestVersion === null) return null

  const phase: RunPhase = run.phase
  const busy = phase === 'starting' || phase === 'waiting' || phase === 'running'
  const stopped = market === 'unsupported'
  const failureKey = run.failureCode ? FAILURE_COPY[run.failureCode] : ''
  const canForce = run.failureCode === 'RELEASE_TOO_FRESH' || run.failureCode === 'VERSION_UNCHANGED'
  /**
   * No market, or one that stayed busy: the user needs the command now, not a
   * "try again later" with nothing behind it. A busy market keeps its retry
   * button, so both paths stay reachable.
   */
  const manual = stopped || run.failureCode === 'OPERATION_BUSY'

  const progress = phase === 'running'
    ? (run.percent === null
        ? say('update.updating')
        : say('update.updatingPercent', { percent: run.percent }))
    : ''

  /**
   * Hand the user a prompt they can paste into an agent; report the outcome.
   * The prompt asks for the latest release rather than this card's version, so
   * it stays correct if a newer one lands between render and click.
   */
  const copyPrompt = () => {
    const text = say('update.prompt')
    Promise.resolve(props.onCopyPrompt(text)).then(ok => {
      if (typeof props.onToast === 'function') props.onToast(ok ? 'copied' : 'copyFailed')
    })
  }

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
                      'aria-controls': `${NOTES_ID}-${entry.version}`,
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
                  open
                    ? h(
                        'div',
                        { id: `${NOTES_ID}-${entry.version}`, className: 'dsh-an-updateVersionBody' },
                        entryBody(entry),
                      )
                    : null,
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
      {
        id: NOTES_ID,
        ref: notesRef,
        className: 'dsh-an-updateNotes',
        role: 'region',
        'aria-label': say('update.notesTitle'),
        'data-fade': fade ? 'true' : undefined,
      },
      notesBody,
    ),
    h(
      'div',
      { className: 'dsh-an-updateActions' },
      stopped
        ? null
        : phase === 'done'
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
                'aria-busy': busy,
                onClick: () => props.onStartUpdate(false),
              },
              busy
                ? (phase === 'running'
                    ? progress
                    : phase === 'waiting' ? say('update.waiting') : say('update.starting'))
                : say('update.now'),
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
    phase === 'error'
      ? h(
          'div',
          { className: 'dsh-an-updateErrorRow' },
          h(
            'p',
            { className: 'dsh-an-updateError', role: 'status' },
            failureKey
              ? say(failureKey)
              : say('update.failed', { reason: run.message || run.failureCode || '' }),
          ),
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
    manual
      ? h(
          'div',
          { className: 'dsh-an-updateFallback' },
          h('p', { className: 'dsh-an-updateHint' }, say('update.manualHint')),
          h(
            'button',
            { type: 'button', className: 'dsh-an-updateCopy', onClick: copyPrompt },
            say('update.copyPrompt'),
          ),
        )
      : null,
    run.phase === 'done' && run.restartRequired && !restartSupported
      ? h('p', { className: 'dsh-an-updateHint' }, say('update.restartHint'))
      : null,
  )
}
