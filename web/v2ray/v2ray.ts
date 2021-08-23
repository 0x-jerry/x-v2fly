import { join } from 'path/mod.ts'
import { confDir } from 'shared/config.ts'
import { IV2Ray } from 'v2ray-schema'

export const v2rayConfPath = join(confDir, 'v2ray.config.json')

let v2rayProcess: Deno.Process | null = null

export async function start(conf: IV2Ray) {
  stop()

  await Deno.writeTextFile(v2rayConfPath, JSON.stringify(conf))
  v2rayProcess = Deno.run({
    cmd: ['v2ray', '-c', v2rayConfPath],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null'
  })

  return v2rayProcess
}

export function stop() {
  if (!v2rayProcess) {
    return
  }

  v2rayProcess.kill(Deno.Signal.SIGHUP)
  v2rayProcess = null
}
