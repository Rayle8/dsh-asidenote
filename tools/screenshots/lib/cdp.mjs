// Minimal Chrome DevTools Protocol driver used by the screenshot pipeline.
// No dependencies: Node 20+ with `--experimental-websocket`, or Node 22+.
import fs from 'node:fs'

const PORT = process.env.CDP_PORT || 9222

async function target() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
  const page = list.find(t => t.type === 'page')
  if (!page) throw new Error('no page target')
  return page
}

export class Session {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`timeout: ${method}`))
      }, 30000)
    })
  }
}

export async function connect() {
  const page = await target()
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })
  const session = new Session(ws)
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  return session
}

export async function evaluate(session, expression) {
  const result = await session.send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true, userGesture: true,
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || JSON.stringify(result.exceptionDetails))
  }
  return result.result.value
}

export async function shot(session, file) {
  const { data } = await session.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  fs.writeFileSync(file, Buffer.from(data, 'base64'))
  return file
}

export const sleep = ms => new Promise(r => setTimeout(r, ms))
