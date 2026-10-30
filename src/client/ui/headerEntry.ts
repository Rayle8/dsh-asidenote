/**
 * The host-owned notes button in the conversation header.
 *
 * It is a plain DOM node beside the shell's utilities row: a React portal there
 * would be reconciled away. The glyph is inlined for the same reason.
 */
import { SESSION_STORAGE_KEY } from '../constants'
import { normalizeItems } from '../domain/items'
import { readSessionStore } from '../storage/session'
import { TODO_LISTENERS } from '../storage/events'

const HEADER_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M3.25 2.75h6.5l3 3v7.5c0 .55-.45 1-1 1H3.25c-.55 0-1-.45-1-1V3.75c0-.55.45-1 1-1Z"/><path d="M9.75 2.75v3h3"/><path d="M4.9 7.6h5.4M4.9 9.9h3.6" stroke-linecap="round"/></svg>'

export function createHeaderEntry({ getSessionId, getActiveAnchor, getLocaleId, tr, onOpen }) {
  const refresh = () => {
    const sessionId = getSessionId()
    const host = document.querySelector('[class*="_headerUtilities"]')
    let button = (host ? host.querySelector(':scope > .dsh-an-headerBtn') : null) as HTMLButtonElement | null
    if (!host || !sessionId) {
      if (button) button.remove()
      return
    }
    const store = readSessionStore()
    const items = normalizeItems(store.sessions[sessionId] && store.sessions[sessionId].items)
    const open = items.filter(item => !item.done).length
    if (!button) {
      button = document.createElement('button')
      button.type = 'button'
      button.className = 'dsh-an-headerBtn'
      button.addEventListener('pointerdown', event => event.stopPropagation())
      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()
        onOpen(sessionId, button)
      })
      host.appendChild(button)
    }
    button.dataset.active = getActiveAnchor() === button ? 'true' : 'false'
    const signature = `${getLocaleId()}:${sessionId}:${open}`
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
    button.dataset.sessionId = sessionId
    // The header entry is host-owned DOM (a React portal beside it would be
    // reconciled away), so the shared Tooltip cannot wrap it; a native title
    // keeps the icon-only control explained on hover.
    button.title = open > 0 ? tr('header.tooltip', { n: open }) : tr('header.tooltipEmpty')
    button.setAttribute('aria-label', open > 0
      ? `${tr('dock.open')}, ${tr('dock.count', { n: open })}`
      : tr('dock.open'))
  }

  /** Watch the store, the DOM and the viewport; returns the cleanup. */
  const attach = onDispose => {
    let scheduled = false
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        refresh()
      })
    }
    const onStorage = event => {
      if (event.key === SESSION_STORAGE_KEY) schedule()
    }
    TODO_LISTENERS.add(schedule)
    window.addEventListener('storage', onStorage)
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    refresh()
    return () => {
      TODO_LISTENERS.delete(schedule)
      window.removeEventListener('storage', onStorage)
      observer.disconnect()
      onDispose()
      for (const button of document.querySelectorAll('.dsh-an-headerBtn')) button.remove()
    }
  }

  return { refresh, attach }
}
