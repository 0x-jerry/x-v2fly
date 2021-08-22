import { WebSocket } from 'ws/mod.ts'

import { EventEmitter } from 'x-lib/mod.ts'

type SocketSendMessage = (data: unknown) => Promise<void>
type SocketMessageEvent<T = any> = (data: T, send: SocketSendMessage) => any

export const socketEvent = new EventEmitter<{
  [type: string]: SocketMessageEvent
}>()

socketEvent.on('test', (data, send) => {
  send(data)
})

export async function handleWs(sock: WebSocket) {
  console.log('socket connected!')

  try {
    for await (const ev of sock) {
      if (typeof ev !== 'string') {
        continue
      }

      try {
        const json = JSON.parse(ev)
        if (!json.type) return

        socketEvent.emit(json.type, json.data, (t) =>
          sock.send(JSON.stringify(t))
        )
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error(`failed to receive frame: ${err}`)

    if (!sock.isClosed) {
      await sock.close(1000).catch(console.error)
    }
  }
}
