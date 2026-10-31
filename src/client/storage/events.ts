/**
 * Same-tab change bus.
 *
 * The `storage` event only crosses tabs, so a write here wakes the readers in
 * this tab — the header count and an open panel.
 */
/** Same-tab subscribers, so the composer dock's count follows panel edits. */
export const TODO_LISTENERS = new Set<() => void>()

/** Notify same-tab readers after a successful write (storage events only cross tabs). */
export function notifyTodoChange() {
  for (const listener of TODO_LISTENERS) {
    try {
      listener()
    } catch (error) {
      console.error('dsh-aside-note: listener failed', error)
    }
  }
}
