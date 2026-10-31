/** Frame-wide toast seat: one notice at a time, dismissed when it fades. */
import React from 'react'
import { icon, Toast } from './primitives'

const h = React.createElement

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

/**
 * Settled outcomes (copy, forward, delete, write failure) live in the frame,
 * not inside the panel: the panel unmounts on close, the banner must not.
 */
export function createToastSeat(tr) {
  const source = (() => {
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

  /** The slot the layout mounts once; it owns the only visible notice. */
  function ToastHost(props) {
    const notice = React.useSyncExternalStore(
      source.hooks.notice.subscribe,
      source.hooks.notice.getSnapshot,
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
      onDone: source.dismiss,
    })
  }

  return { show: source.show, ToastHost }
}
