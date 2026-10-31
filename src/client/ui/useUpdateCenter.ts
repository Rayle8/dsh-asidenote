/**
 * Update centre state for the settings card.
 *
 * Three things are allowed to be independent here: the published version check
 * (auto on open, manual on demand), the release notes behind that version
 * (loaded only when the disclosure is opened), and the in-app update itself
 * (queued through the plugin market's public API and polled to a terminal
 * state). Keeping them separate means a missing market or a missing release
 * body cannot take the version check down with it.
 */
import React from 'react'
import { PLUGIN_REPO_URL, PLUGIN_VERSION } from '../constants'
import {
  fetchLatestVersion,
  fetchReleaseNotes,
  isNewerVersion,
  resetUpdateChecks,
} from '../update/latest'
import { updateNotesForLocale } from '../update/releaseNotes'
import type { ReleaseNoteGroup } from '../update/releaseNotes'
import { MARKET_PACKAGE, marketClient } from '../update/market'
import type { MarketCapabilities } from '../update/market'

export type CheckStatus = 'idle' | 'checking' | 'current' | 'available' | 'error'
export type NotesStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error'
export type RunPhase = 'idle' | 'starting' | 'running' | 'done' | 'error'
export type MarketState = 'unknown' | 'unsupported' | 'ready'

export interface UpdateCheckState {
  status: CheckStatus
  latestVersion: string | null
  checkedAt: number | null
}

export interface NotesState {
  status: NotesStatus
  groups: ReleaseNoteGroup[]
  url: string | null
}

export interface UpdateRunState {
  phase: RunPhase
  percent: number | null
  failureCode: string | null
  message: string | null
  retryable: boolean
  refreshRequired: boolean
  restartRequired: boolean
  installedVersion: string | null
}

const CHECK_IDLE: UpdateCheckState = { status: 'idle', latestVersion: null, checkedAt: null }
const NOTES_IDLE: NotesState = { status: 'idle', groups: [], url: null }
const RUN_IDLE: UpdateRunState = {
  phase: 'idle',
  percent: null,
  failureCode: null,
  message: null,
  retryable: false,
  refreshRequired: false,
  restartRequired: false,
  installedVersion: null,
}

const POLL_INTERVAL_MS = 900
/** A terminal state never arrives for an abandoned operation; stop asking. */
const MAX_POLLS = 400

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function terminalRun(phase: RunPhase, patch: Partial<UpdateRunState> = {}): UpdateRunState {
  return { ...RUN_IDLE, phase, ...patch }
}

export function useUpdateCenter(localeId: string) {
  const [check, setCheck] = React.useState<UpdateCheckState>(CHECK_IDLE)
  const [notes, setNotes] = React.useState<NotesState>(NOTES_IDLE)
  const [expanded, setExpanded] = React.useState(false)
  const [run, setRun] = React.useState<UpdateRunState>(RUN_IDLE)
  const [market, setMarket] = React.useState<MarketState>('unknown')
  const [restartSupported, setRestartSupported] = React.useState(false)

  const disposed = React.useRef(false)
  const runRef = React.useRef<UpdateRunState>(RUN_IDLE)
  runRef.current = run

  React.useEffect(() => {
    disposed.current = false
    return () => {
      disposed.current = true
    }
  }, [])

  const latestVersion = check.status === 'available' ? check.latestVersion : null

  // Quiet check on open: keeps the gear dot meaningful without a click. A local
  // dev build (`2.1.0-dev`) never nags, but a manual check still works.
  React.useEffect(() => {
    if (PLUGIN_VERSION.includes('-')) return undefined
    let active = true
    fetchLatestVersion().then(version => {
      if (!active || version === null) return
      if (isNewerVersion(version, PLUGIN_VERSION)) {
        setCheck({ status: 'available', latestVersion: version, checkedAt: Date.now() })
      } else {
        setCheck({ status: 'current', latestVersion: version, checkedAt: Date.now() })
      }
    })
    return () => {
      active = false
    }
  }, [])

  // Only ask the market once a version is actually offered, so a current build
  // never touches the market API.
  React.useEffect(() => {
    if (check.status !== 'available' || market !== 'unknown') return undefined
    let active = true
    marketClient.capabilities().then((caps: MarketCapabilities | null) => {
      if (!active) return
      setMarket(caps ? 'ready' : 'unsupported')
      setRestartSupported(caps?.restartSupported === true)
    })
    return () => {
      active = false
    }
  }, [check.status, market])

  const checkNow = React.useCallback(async () => {
    if (check.status === 'checking') return
    // A manual check is an explicit request to look again: drop the hourly cache.
    resetUpdateChecks()
    setCheck(previous => ({ ...previous, status: 'checking' }))
    setNotes(NOTES_IDLE)
    setExpanded(false)
    // A new check supersedes a finished or failed attempt, so the card cannot
    // keep showing a failure that belongs to the previous version.
    setRun(RUN_IDLE)
    const version = await fetchLatestVersion()
    if (disposed.current) return
    if (version === null) {
      setCheck({ status: 'error', latestVersion: null, checkedAt: Date.now() })
      return
    }
    if (isNewerVersion(version, PLUGIN_VERSION)) {
      setCheck({ status: 'available', latestVersion: version, checkedAt: Date.now() })
      setMarket('unknown')
    } else {
      setCheck({ status: 'current', latestVersion: version, checkedAt: Date.now() })
      setMarket('unknown')
    }
  }, [check.status])

  const toggleNotes = React.useCallback(() => {
    setExpanded(value => !value)
  }, [])

  // Lazy notes: one request when the disclosure first opens for a version.
  React.useEffect(() => {
    if (!expanded || check.status !== 'available' || check.latestVersion === null) return undefined
    if (notes.status !== 'idle') return undefined
    let active = true
    setNotes(previous => ({ ...previous, status: 'loading' }))
    fetchReleaseNotes(check.latestVersion).then(release => {
      if (!active) return
      if (release === null) {
        setNotes({ status: 'error', groups: [], url: null })
        return
      }
      const groups = updateNotesForLocale(release.body, localeId)
      if (groups.length === 0) {
        setNotes({ status: 'missing', groups: [], url: release.url })
        return
      }
      setNotes({ status: 'ready', groups, url: release.url })
    })
    return () => {
      active = false
    }
    // `notes.status` is intentionally not a dependency: setting "loading" here
    // would invalidate the effect and its cleanup would discard the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, check.status, check.latestVersion, localeId])

  const startUpdate = React.useCallback(async (force = false) => {
    if (runRef.current.phase === 'starting' || runRef.current.phase === 'running' || runRef.current.phase === 'done') return
    setRun(terminalRun('starting'))
    const caps = await marketClient.capabilities()
    if (disposed.current) return
    if (!caps) {
      setMarket('unsupported')
      setRun(terminalRun('error', { failureCode: 'NO_MARKET' }))
      return
    }
    setMarket('ready')
    setRestartSupported(caps.restartSupported)
    const started = await marketClient.start(MARKET_PACKAGE, force)
    if (disposed.current) return
    if ('error' in started) {
      setRun(terminalRun('error', {
        failureCode: started.error.code,
        message: started.error.message || null,
        retryable: started.error.retryable,
      }))
      return
    }
    setRun({ ...RUN_IDLE, phase: 'running', percent: 0 })
    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await sleep(POLL_INTERVAL_MS)
      if (disposed.current) return
      const operation = await marketClient.operation(started.operationId)
      if (disposed.current) return
      if (operation === null) {
        setRun(terminalRun('error', { failureCode: 'UPDATE_FAILED', retryable: true }))
        return
      }
      if (operation.state === 'queued' || operation.state === 'running') {
        setRun({ ...RUN_IDLE, phase: 'running', percent: operation.percent })
        continue
      }
      if (operation.state === 'succeeded') {
        setRun(terminalRun('done', {
          percent: 100,
          installedVersion: operation.installedVersion,
          refreshRequired: operation.refreshRequired || !operation.restartRequired,
          restartRequired: operation.restartRequired,
        }))
        return
      }
      setRun(terminalRun('error', {
        failureCode: operation.failure?.code || 'UPDATE_FAILED',
        message: operation.failure?.message || null,
        retryable: operation.failure?.retryable !== false,
      }))
      return
    }
    setRun(terminalRun('error', { failureCode: 'UPDATE_TIMEOUT', retryable: true }))
  }, [])

  const refreshPage = React.useCallback(() => {
    try {
      window.location.reload()
    } catch {
      /* a host without location simply keeps the message */
    }
  }, [])

  const restartHost = React.useCallback(async () => {
    await marketClient.restart()
    refreshPage()
  }, [refreshPage])

  const fullReleaseUrl = notes.url || (latestVersion
    ? `${PLUGIN_REPO_URL}/releases/tag/v${latestVersion}`
    : null)

  return {
    check,
    latestVersion,
    notes,
    expanded,
    run,
    market,
    restartSupported,
    fullReleaseUrl,
    checkNow,
    toggleNotes,
    startUpdate,
    refreshPage,
    restartHost,
  }
}
