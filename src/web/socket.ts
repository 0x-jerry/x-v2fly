import { protocolServer } from './v2ray.ts'

export function handleWs(socket: WebSocket) {
  console.log('socket connected!')

  socket.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)

      protocolServer.resolve({
        ...data,
        send(data) {
          socket.send(JSON.stringify(data))
        },
      })
    } catch (error) {
      console.warn('resolve socket message error', error)
    }
  }

  socket.onclose = () => {
    socket.close(1000)
  }
}
