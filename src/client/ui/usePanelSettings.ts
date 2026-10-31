/** Inline settings: send shortcut and the forward lead-in, both persisted. */
import React from 'react'
import { readForwardPrefix, readSendShortcut, writeForwardPrefix, writeSendShortcut } from '../storage/prefs'

export function usePanelSettings() {
  const [showSettings, setShowSettings] = React.useState(false)
  const [sendShortcut, setSendShortcut] = React.useState(readSendShortcut)
  const [forwardPrefix, setForwardPrefix] = React.useState(readForwardPrefix)
  const prefixRef = React.useRef(null)

  // The prefix field starts one line tall and grows with wrapped content up to
  // a six-line cap, then scrolls. Re-measure whenever the value changes or the
  // card remounts.
  React.useLayoutEffect(() => {
    const node = prefixRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(138, node.scrollHeight + 2)}px`
  }, [forwardPrefix, showSettings])

  const chooseShortcut = value => {
    setSendShortcut(value)
    writeSendShortcut(value)
  }

  const changeForwardPrefix = value => {
    const next = String(value || '').slice(0, 80)
    setForwardPrefix(next)
    writeForwardPrefix(next)
  }

  return { showSettings, setShowSettings, sendShortcut, chooseShortcut, forwardPrefix, changeForwardPrefix, prefixRef }
}
