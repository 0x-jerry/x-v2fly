import { serve } from 'http/server.ts'
import { acceptWebSocket } from 'ws/mod.ts'
import { handleWs } from './socket.ts'
import { homedir, run, runPiped, which } from 'd-lib'
import { join } from 'path/mod.ts'
import './v2ray.ts'
import { confDir } from '../config.ts'

export async function startWebSocketService(port = 7999) {
  console.log(`websocket server is running on :${port}`)

  for await (const req of serve(`:${port}`)) {
    const { conn, r: bufReader, w: bufWriter, headers } = req
    acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    })
      .then(handleWs)
      .catch(async (err) => {
        console.error(`failed to accept websocket: ${err}`)
        await req.respond({ status: 400 })
      })
  }
}

export async function startAsService(port = 7999) {
  await startOnMac(port)
}

const pListId = 'com.jerry.x-v2fly.ui'

const plistPath = join(homedir, '/Library', 'LaunchAgents', `${pListId}.plist`)

const logPath = join(confDir, 'x-ui.info.log')
const errorPath = join(confDir, 'x-ui.error.log')

async function startOnMac(port = 7999) {
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    <dict>
      <key>Label</key>
      <string>${pListId}</string>
      <key>RunAtLoad</key>
      <true/>
      <key>Disabled</key>
      <false/>
      <key>ProcessType</key>
      <string>Background</string>
      <key>EnvironmentVariables</key>
      <dict>
        <key>PATH</key>
        <string>${Deno.env.get('PATH')}</string>
      </dict>
      <key>ProgramArguments</key>
      <array>
        <string>${await which('x-v2fly')}</string>
        <string>ui</string>
        <string>${port}</string>
      </array>
      <key>StandardErrorPath</key>
      <string>${errorPath}</string>
      <key>StandardOutPath</key>
      <string>${logPath}</string>
    </dict>
  </plist>`

  await Deno.writeTextFile(plistPath, plist)

  await tryStopService()
  await run('launchctl', 'load', '-w', plistPath)
}

export async function tryStopService() {
  await tryStopOnMac()
}

async function tryStopOnMac() {
  const txt = await runPiped('launchctl', 'list')

  if (txt.includes(pListId)) {
    await run('launchctl', 'unload', '-w', plistPath)
  }
}
