import {
  PANEL_DEFAULT_WIDTH,
  PANEL_MAX_WIDTH,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
} from '../constants'

/**
 * Mark the section head that is actually pinned to the scroller's top edge.
 * Sticky heads stay transparent in flow; only the pinned one takes the menu
 * group-header fill, so no full-width layer sits over the list at rest.
 */
export function syncStickyHeads(node) {
  const areaTop = node.getBoundingClientRect().top
  for (const head of node.querySelectorAll('.dsh-an-sectionHead, .dsh-an-doneHead')) {
    // The head is sticky only while its section straddles the scroller's
    // top edge. Reading the section avoids the sticky element's own
    // offsetTop, which moves with the pinned position in some engines.
    const section = head.parentElement
    if (!section) continue
    const rect = section.getBoundingClientRect()
    head.toggleAttribute('data-stuck', rect.top < areaTop && rect.bottom > areaTop)
  }
}

/**
 * Frame-owned top safety margin for floating surfaces. Read from the layout
 * rather than baked in, so macOS window chrome and the Windows titlebar both
 * keep their clearance without this page touching the global variable.
 */
export function overlayTopFloor(margin) {
  try {
    const raw = getComputedStyle(document.body).getPropertyValue('--dsh-frame-overlay-top').trim()
    const value = Number.parseFloat(raw)
    if (Number.isFinite(value) && value > 0) return Math.max(margin, value)
  } catch {
    /* fall through to the plain viewport margin */
  }
  return margin
}

/**
 * Fixed panel placement: a right-side panel for the experimental entry,
 * otherwise below the anchor. Both stay inside the viewport margin, and the
 * gap side is only abandoned when the opposite side genuinely fits.
 */
export function memoPopoverStyle(anchor, placement, requestedWidth, requestedHeight) {
  const margin = window.innerWidth <= 480 ? 12 : 16
  const topFloor = overlayTopFloor(margin)
  const available = Math.max(PANEL_MIN_WIDTH, window.innerWidth - margin * 2)
  const width = Math.max(PANEL_MIN_WIDTH, Math.min(PANEL_MAX_WIDTH, available, requestedWidth || PANEL_DEFAULT_WIDTH))
  if (placement === 'right') {
    const rect = anchor && anchor.isConnected ? anchor.getBoundingClientRect() : null
    let desiredRight = rect && rect.width > 0 ? rect.right : window.innerWidth - margin
    const sidebar = [...document.querySelectorAll('[data-sidebar-right-panel][data-sidebar-right-open]')].find(node => {
      const box = node.getBoundingClientRect()
      return box.width > 24 && box.left > 0 && box.left < window.innerWidth - 24
    })
    if (sidebar) {
      desiredRight = Math.min(desiredRight, sidebar.getBoundingClientRect().left - 8)
    }
    const rightInset = Math.max(margin, Math.min(window.innerWidth - margin, window.innerWidth - desiredRight))
    const top = rect && rect.width > 0 ? Math.max(topFloor, Math.round(rect.bottom + 8)) : topFloor
    const maxHeight = Math.max(160, window.innerHeight - top - margin)
    const height = requestedHeight
      ? Math.max(Math.min(PANEL_MIN_HEIGHT, maxHeight), Math.min(maxHeight, requestedHeight))
      : 0
    const style: Record<string, string> = { right: `${rightInset}px`, left: 'auto', top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
    if (height) style.height = `${height}px`
    return style
  }
  const maxHeight = Math.max(160, Math.min(460, window.innerHeight - topFloor - margin))
  if (!anchor) return { left: `${margin}px`, top: `${topFloor}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
  const rect = anchor.getBoundingClientRect()
  const left = rect.left < 420
    ? Math.max(margin, rect.left)
    : Math.max(margin, Math.min(rect.right - width, window.innerWidth - width - margin))
  let top = rect.bottom + 8
  // Flip above only when the space below the anchor cannot hold the panel.
  if (top + maxHeight > window.innerHeight - margin) top = Math.max(topFloor, rect.top - maxHeight - 8)
  return { left: `${left}px`, top: `${top}px`, width: `${width}px`, maxHeight: `${maxHeight}px` }
}
