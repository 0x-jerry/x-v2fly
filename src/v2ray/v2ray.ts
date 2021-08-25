import { join } from 'path/mod.ts'
import { confDir } from '../config.ts'
import { IV2Ray } from 'v2ray-schema'
import { run, runPiped } from 'd-lib'

export const v2rayConfPath = join(confDir, 'v2ray.config.json')
export const v2rayPlistPath = join(confDir, 'v2ray.plist')

const pListId = 'com.jerry.launch.v2ray'

export async function start(conf: IV2Ray) {
  await Deno.writeTextFile(v2rayConfPath, JSON.stringify(conf))

  await startOnMac()
}

async function startOnMac() {
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
      <key>ProgramArguments</key>
      <array>
        <string>/usr/local/bin/v2ray</string>
        <string>-c</string>
        <string>${v2rayConfPath}</string>
      </array>
      <key>UserName</key>
      <string>root</string>
      <key>GroupName</key>
      <string>wheel</string>
    </dict>
  </plist>`

  await Deno.writeTextFile(v2rayPlistPath, plist)

  await tryStop()
  await run('launchctl', 'load', '-w', v2rayPlistPath)
}

export async function tryStop() {
  await tryStopOnMac()
}

async function tryStopOnMac() {
  const txt = await runPiped('launchctl', 'list')

  if (txt.includes(pListId)) {
    await run('launchctl', 'unload', '-w', v2rayPlistPath)
  }
}
