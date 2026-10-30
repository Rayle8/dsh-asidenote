/**
 * AsideNote browser half.
 *
 * The plugin entry: injects the stylesheet, binds the locale namespace and
 * seats the two slots (session capture + frame-wide toast host) plus the
 * host-owned header entry. Copy, storage, domain rules and the panel UI live
 * in their own modules; P2 splits the remaining UI out of this file.
 */
import React from 'react'
import ReactDOMClient from 'react-dom/client'

import CSS from './styles/panel.css?inline'
import { NS, PANEL_ID, SESSION_STORAGE_KEY } from './constants'
import { DICT, fill, makeSay } from './i18n'
import { Toast, icon } from './ui/primitives'
import { MemoPopover } from './ui/MemoPopover'
import { readSessionStore } from './storage/session'
import { migrateLegacyStorage } from './storage/migrate'
import { normalizeItems } from './domain/items'
import { TODO_LISTENERS } from './storage/events'

const h = React.createElement

// Shared controls come from the seeded platform module, so the panel uses the
// product's Tooltip and Toast instead of a second copy. The bundle declares it
// external: a host that cannot resolve it fails the build, never ships a duplicate.











































/** Compact floating memo list, anchored to the entry that opened it. */
function apply(ctx: DshClientCtx) {
  // 1.x notes live under the old keys; copy them once, before any reader runs.
  migrateLegacyStorage()

  const locale = ctx.get('locale')

  // One document-level sheet covers both the panel and the composer dock;
  // the dock mounts outside the panel tree, so a panel-local <style> would
  // leave it unstyled until the panel had been opened once.
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshPlugin = 'dsh-asidenote'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-asidenote: styles')

  if (locale && typeof locale.register === 'function') {
    ctx.effect(() => locale.register(NS, DICT), 'dsh-asidenote: dictionaries')
  }

  const localeId = () => {
    try {
      const current = locale && typeof locale.getLocale === 'function' ? locale.getLocale() : null
      const id = current && (current.id || current.locale)
      return typeof id === 'string' && id ? id : 'zh'
    } catch {
      return 'zh'
    }
  }

  const say = makeSay(ctx, localeId)

  const tr = (key: string, vars?: Record<string, any>) => fill(say(key), vars)
  let activePopover = null
  let activeSessionId = ''

  // Settled outcomes (copy, forward, delete, write failure) live here rather
  // than inside the panel: the panel unmounts on close, the banner must not.
  const toastSource = (() => {
    let notice = null
    let sequence = 0
    const listeners = new Set<() => void>()
    const publish = next => {
      notice = next
      for (const listener of listeners) listener()
    }
    return {
      hooks: {
        notice: {
          getSnapshot: () => notice,
          subscribe: listener => {
            listeners.add(listener)
            return () => { listeners.delete(listener) }
          },
        },
      },
      show(kind) {
        sequence += 1
        publish({ kind, sequence })
      },
      dismiss() {
        publish(null)
      },
    }
  })()

  const TOAST_COPY = {
    copied: { key: 'toast.copied', tone: 'success' },
    forwarded: { key: 'toast.forwarded', tone: 'success' },
    unforwarded: { key: 'toast.unforwarded', tone: 'success' },
    deleted: { key: 'toast.deleted', tone: 'success' },
    cleared: { key: 'toast.cleared', tone: 'success' },
    copyFailed: { key: 'toast.copyFailed' },
    forwardFailed: { key: 'toast.forwardFailed' },
    saveFailed: { key: 'toast.saveFailed' },
  }
  const WarningIcon = icon('IconWarningOutlineRegular')

  /** The frame-wide toast seat: one notice at a time, dismissed when faded. */
  function ToastHost(props) {
    const notice = React.useSyncExternalStore(
      toastSource.hooks.notice.subscribe,
      toastSource.hooks.notice.getSnapshot,
    )
    if (!notice || !Toast) return null
    const copy = TOAST_COPY[notice.kind] || TOAST_COPY.saveFailed
    const bound = props && typeof props.t === 'function' ? props.t(copy.key) : ''
    // The slot's `t` falls back to the key when the namespace is not bound yet.
    const text = bound && bound !== copy.key ? bound : tr(copy.key)
    return h(Toast, {
      key: notice.sequence,
      text,
      tone: copy.tone,
      icon: copy.tone ? undefined : WarningIcon ? h(WarningIcon, { size: 16 }) : undefined,
      onDone: toastSource.dismiss,
    })
  }

  const closeMemoPopover = () => {
    const current = activePopover
    activePopover = null
    if (!current) return
    // Only hand focus back to the entry when the panel itself had it; a click
    // elsewhere must leave focus where the user put it.
    const hadFocus = current.container.contains(document.activeElement)
    try {
      current.root.unmount()
    } catch {
      /* already unmounted */
    }
    current.container.remove()
    const anchor = current.anchor
    if (hadFocus && anchor && anchor.isConnected && typeof anchor.focus === 'function') {
      anchor.focus({ preventScroll: true })
    }
    refreshHeaderEntry()
  }

  const openMemoPopover = (sessionId, anchor, placement = 'popover') => {
    if (activePopover && activePopover.anchor === anchor) {
      closeMemoPopover()
      return
    }
    closeMemoPopover()
    const container = document.createElement('div')
    container.dataset.dshMemoPopoverRoot = 'true'
    document.body.appendChild(container)
    const root = ReactDOMClient.createRoot(container)
    activePopover = { container, root, anchor, placement }
    root.render(h(MemoPopover, {
      sessionId,
      say: tr,
      localeId: localeId(),
      anchorRef: { current: anchor },
      placement,
      onClose: closeMemoPopover,
      onToast: kind => toastSource.show(kind),
    }))
    refreshHeaderEntry()
  }

  // The plugin's own glyph, shared by the header entry and `.icon.svg`
  // (same paths, same stroke). The entry is host-owned DOM, so the glyph is
  // inlined rather than rendered through a React root the host would reclaim.
  const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

  const refreshHeaderEntry = () => {
    const host = document.querySelector('[class*="_headerUtilities"]')
    let button = (host ? host.querySelector(':scope > .dsh-an-headerBtn') : null) as HTMLButtonElement | null
    if (!host || !activeSessionId) {
      if (button) button.remove()
      return
    }
    const store = readSessionStore()
    const items = normalizeItems(store.sessions[activeSessionId] && store.sessions[activeSessionId].items)
    const open = items.filter(item => !item.done).length
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dsh-an-headerBtn'
      button.addEventListener('pointerdown', event => event.stopPropagation())
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        openMemoPopover(activeSessionId, button, 'right')
      })
      host.appendChild(button)
    }
    button.dataset.active = activePopover && activePopover.anchor === button ? 'true' : 'false'
    const signature = `${localeId()}:${activeSessionId}:${open}`
    if (button.dataset.signature !== signature) {
      const icon = document.createElement('span')
      icon.className = 'dsh-an-headerIcon'
      icon.innerHTML = HEADER_ICON
      button.replaceChildren(icon)
      if (open > 0) {
        const count = document.createElement('span')
        count.className = 'dsh-an-headerCount'
        count.textContent = open > 99 ? '99+' : String(open)
        button.appendChild(count)
      }
      button.dataset.signature = signature
    }
    button.dataset.sessionId = activeSessionId
    // The header entry is host-owned DOM (a React portal beside it would be
    // reconciled away), so the shared Tooltip cannot wrap it; a native title
    // keeps the icon-only control explained on hover.
    button.title = open > 0 ? tr('header.tooltip', { n: open }) : tr('header.tooltipEmpty')
    button.setAttribute('aria-label', open > 0
      ? `${tr('dock.open')}, ${tr('dock.count', { n: open })}`
      : tr('dock.open'))
  }

  ctx.effect(() => {
    let scheduled = false
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        refreshHeaderEntry()
      })
    }
    const onStorage = event => {
      if (event.key === SESSION_STORAGE_KEY) schedule()
    }
    TODO_LISTENERS.add(schedule)
    window.addEventListener('storage', onStorage)
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    refreshHeaderEntry()
    return () => {
      TODO_LISTENERS.delete(schedule)
      window.removeEventListener('storage', onStorage)
      observer.disconnect()
      closeMemoPopover()
      for (const button of document.querySelectorAll('.dsh-an-headerBtn')) button.remove()
    }
  }, 'dsh-asidenote: right-side entry')

  function BoundSessionCapture(props) {
    const sessionId = props.sessionId || ''
    React.useEffect(() => {
      if (activeSessionId !== sessionId) {
        activeSessionId = sessionId
        closeMemoPopover()
      }
      refreshHeaderEntry()
    }, [sessionId])
    return null
  }

  ctx.slots.inject('conversation.composer.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.composer.dock',
        id: PANEL_ID,
        order: 30,
        locale: NS,
      },
      BoundSessionCapture,
    ),
  )

  // Transient outcomes belong to the frame, not to the panel that raised
  // them; the layout's overlay seat keeps them alive after the panel closes.
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: `${PANEL_ID}.toast`,
        order: 60,
        locale: NS,
      },
      ToastHost,
    ),
  )
}


module.exports = { inject: ['slots'], apply }
