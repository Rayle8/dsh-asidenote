/** Close the panel on an outside pointerdown or Escape. */
import React from 'react'

export function useOutsideDismiss(panelRef, anchorRef, onClose) {
  React.useEffect(() => {
    const onPointerDown = event => {
      if (panelRef.current && panelRef.current.contains(event.target)) return
      if (anchorRef.current && anchorRef.current.contains(event.target)) return
      onClose()
    }
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, anchorRef])
}
