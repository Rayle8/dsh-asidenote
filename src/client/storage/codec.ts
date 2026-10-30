/** The browser store, or null when storage is blocked. */
/** The browser store, or null when storage is blocked. */
export function storage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}
