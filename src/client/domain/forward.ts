/** Append a note to the conversation composer (Lexical contenteditable or textarea). */
/** Append one note to the conversation composer (Lexical contenteditable or textarea). */
export function appendToConversation(text, prefix = '') {
  const note = String(text || '').replace(/^\s+|\s+$/g, '')
  if (!note) return false
  const bullet = `- ${note}`
  const lead = prefix ? String(prefix).trim() : ''
  const emptyBlock = lead ? `${lead}\n${bullet}` : bullet
  const visible = node => {
    const rect = node.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }
  const specific = [...document.querySelectorAll('[data-composer-input]')].filter(visible)
  const editor = (specific.length
    ? specific
    : [...document.querySelectorAll('[contenteditable="true"][role="textbox"], textarea[role="textbox"]')].filter(visible))[0] as
    | HTMLTextAreaElement
    | HTMLInputElement
    | HTMLElement
    | undefined
  if (!editor) return false
  /** Payload for a composer whose current plain text is `current`. */
  const payloadFor = current => {
    const value = typeof current === 'string' ? current : ''
    if (!value.trim()) return emptyBlock
    return value.endsWith('\n') ? bullet : `\n${bullet}`
  }

  if (editor.tagName === 'TEXTAREA') {
    const textarea = editor as HTMLTextAreaElement
    const current = textarea.value
    const payload = payloadFor(current)
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
    setter.call(textarea, `${current}${payload}`)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.focus()
    const end = textarea.value.length
    textarea.setSelectionRange(end, end)
    return true
  }

  const current = typeof editor.innerText === 'string' ? editor.innerText : ''
  const payload = payloadFor(current)
  editor.focus()
  try {
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  } catch {
    /* selection is best effort */
  }
  try {
    const data = new DataTransfer()
    data.setData('text/plain', payload)
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
    const notHandled = editor.dispatchEvent(event)
    if (!notHandled) return true
  } catch {
    /* fall through to execCommand */
  }
  try {
    return document.execCommand('insertText', false, payload)
  } catch {
    return false
  }
}
