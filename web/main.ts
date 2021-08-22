import { serve } from 'http/server.ts'
import { acceptWebSocket } from 'ws/mod.ts'
import { handleWs } from './socket.ts'
import { pidPath } from 'shared/config.ts'

Deno.writeTextFileSync(pidPath, Deno.pid.toString())

const port = 7999

console.log(`websocket server is running on :${port}`)

for await (const req of serve(`:${port}`)) {
  const { conn, r: bufReader, w: bufWriter, headers } = req
  acceptWebSocket({
    conn,
    bufReader,
    bufWriter,
    headers
  })
    .then(handleWs)
    .catch(async (err) => {
      console.error(`failed to accept websocket: ${err}`)
      await req.respond({ status: 400 })
    })
}
