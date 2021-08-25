import { WebSocket } from 'ws/mod.ts'
import {
  EventEmitter,
  isProtocol,
  Protocol,
  createProtocolMessage,
} from 'x-lib'

type SocketSendMessage = (data?: unknown, type?: string) => Promise<void>
type SocketMessageEvent<T = any> = (
  data: Protocol,
  send: SocketSendMessage
) => any

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
        if (!isProtocol<any, string>(json)) return

        socketEvent.emit(json.type, json, (data, type) => {
          data = isProtocol(data)
            ? data
            : { ...createProtocolMessage(type || json.type, data), id: json.id }

          return sock.send(JSON.stringify(data))
        })
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
