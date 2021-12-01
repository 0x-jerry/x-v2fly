import { config } from '../config.ts'
import { startV2rayService, stopV2rayService } from '../v2ray/index.ts'
import { ProtocolServer } from 'x-lib'

export const protocolServer = new ProtocolServer()

protocolServer.on('start-v2fly', (data) => {
  config.v2ray.b64 = data.b64
  startV2rayService()
})

protocolServer.on('stop-v2fly', () => {
  stopV2rayService()
})

protocolServer.on('get-v2fly-conf', () => {
  return config.v2ray
})
