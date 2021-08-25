import { config } from '../config.ts'
import { getV2rayConfig } from './conf.ts'
import { start, tryStop } from './v2ray.ts'
export type { V2rayConfigOption } from './conf.ts'

export async function startV2rayService() {
  const conf = getV2rayConfig(config.v2ray)

  await start(conf)
}

export async function stopV2rayService() {
  await tryStop()
}
