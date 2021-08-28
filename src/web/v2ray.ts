import { config } from '../config.ts'
import { startV2rayService, stopV2rayService } from '../v2ray/index.ts'
import { socketEvent } from './socket.ts'

socketEvent.on('start-v2fly', (protocol) => {
  config.v2ray.b64 = protocol.data
  startV2rayService()
})

socketEvent.on('stop-v2fly', () => {
  stopV2rayService()
})

socketEvent.on('get-v2fly-conf', (_, send) => {
  send(config.v2ray)
})
