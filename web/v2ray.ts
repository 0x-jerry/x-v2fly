import { join } from 'path/mod.ts'
import { confDir } from 'shared/config.ts'
import { IV2Ray, LogLevel } from 'v2ray-schema'

export const v2rayConfPath = join(confDir, 'v2ray.config.json')
export const v2rayLogInfoPath = join(confDir, 'v2ray.info.log')
export const v2rayLogErrorPath = join(confDir, 'v2ray.error.log')

let v2rayProcess: Deno.Process | null = null

export async function start() {
  stop()

  const conf: IV2Ray = {}
  setupLogConfig(conf)

  await Deno.writeTextFile(v2rayConfPath, JSON.stringify(conf))
  v2rayProcess = Deno.run({
    cmd: ['v2ray', '-c', v2rayConfPath],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null'
  })

  return v2rayProcess
}

function setupLogConfig(conf: IV2Ray) {
  const logConf: IV2Ray = {
    log: {
      access: v2rayLogInfoPath,
      error: v2rayLogErrorPath,
      loglevel: LogLevel.info
    }
  }

  return Object.assign(conf, logConf)
}

export function stop() {
  if (!v2rayProcess) {
    return
  }

  v2rayProcess.kill(Deno.Signal.SIGHUP)
  v2rayProcess = null
}
