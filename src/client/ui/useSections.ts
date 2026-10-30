/** Open/completed section visibility, remembered across panel opens. */
import React from 'react'
import { readSectionState, writeSectionState } from '../storage/prefs'

export function useSections() {
  // Read once per mount; the popover unmounts on close.
  const [initial] = React.useState(readSectionState)
  const [showOpen, setShowOpen] = React.useState(initial.open)
  const [showDone, setShowDone] = React.useState(initial.done)
  const sectionsRef = React.useRef(initial)

  /** Apply one section state and remember it right away, using the next value. */
  const applySections = next => {
    sectionsRef.current = next
    setShowOpen(next.open)
    setShowDone(next.done)
    writeSectionState(next)
  }

  return {
    sectionsRef,
    showOpen,
    showDone,
    applySections,
    toggleOpen: () => applySections({ open: !sectionsRef.current.open, done: sectionsRef.current.done }),
    toggleDone: () => applySections({ open: sectionsRef.current.open, done: !sectionsRef.current.done }),
  }
}
