/** The inline second confirmation for clearing completed notes. */
import React from 'react'
import { CLEAR_CONFIRM_MS } from '../constants'

export function useClearConfirm({ sessionId, showDone, doneCount, onConfirm }) {
  const [confirmClear, setConfirmClear] = React.useState(false)
  const clearConfirmTimerRef = React.useRef(0)

  /** Drop the pending auto-dismiss clock without touching state. */
  const stopClearConfirmTimer = () => {
    if (!clearConfirmTimerRef.current) return
    window.clearTimeout(clearConfirmTimerRef.current)
    clearConfirmTimerRef.current = 0
  }

  /** Close the inline band and drop its pending timer. */
  const dismissClearConfirm = () => {
    stopClearConfirmTimer()
    setConfirmClear(false)
  }

  /** Open the inline band; it retires itself after a short pause. */
  const askClearConfirm = () => {
    stopClearConfirmTimer()
    setConfirmClear(true)
    clearConfirmTimerRef.current = window.setTimeout(() => {
      clearConfirmTimerRef.current = 0
      setConfirmClear(false)
    }, CLEAR_CONFIRM_MS)
  }

  /** Only the destructive confirm action reaches the clear routine. */
  const confirmClearDone = () => {
    dismissClearConfirm()
    onConfirm()
  }

  // Retire the band when the completed section empties or collapses, and on a
  // session switch; unmount also drops the timer.
  React.useEffect(() => () => stopClearConfirmTimer(), [])
  React.useEffect(() => {
    if (confirmClear && (!showDone || doneCount === 0)) dismissClearConfirm()
  }, [confirmClear, showDone, doneCount])
  React.useEffect(() => {
    dismissClearConfirm()
  }, [sessionId])

  return { confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone }
}
