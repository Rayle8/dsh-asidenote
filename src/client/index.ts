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
import { NS, PANEL_ID } from './constants'
import { DICT, fill, makeSay } from './i18n'
import { createToastSeat } from './ui/toastSeat'
import { createHeaderEntry } from './ui/headerEntry'
import { MemoPopover } from './ui/MemoPopover'
import { migrateLegacyStorage } from './storage/migrate'

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
    style.dataset.dshPlugin = 'dsh-aside-note'
    style.textContent = CSS
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'dsh-aside-note: styles')

  if (locale && typeof locale.register === 'function') {
    ctx.effect(() => locale.register(NS, DICT), 'dsh-aside-note: dictionaries')
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

  const toastSeat = createToastSeat(tr)
  let refreshHeaderEntry = () => {}

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
      onToast: kind => toastSeat.show(kind),
    }))
    refreshHeaderEntry()
  }

  const headerEntry = createHeaderEntry({
    getSessionId: () => activeSessionId,
    getActiveAnchor: () => (activePopover ? activePopover.anchor : null),
    getLocaleId: () => localeId(),
    tr,
    onOpen: (sessionId, anchor) => openMemoPopover(sessionId, anchor, 'right'),
  })
  refreshHeaderEntry = headerEntry.refresh

  ctx.effect(() => headerEntry.attach(() => closeMemoPopover()), 'dsh-aside-note: right-side entry')

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
      toastSeat.ToastHost,
    ),
  )
}


module.exports = { inject: ['slots'], apply }
