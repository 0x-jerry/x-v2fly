import { config } from '../config.ts'
import { startV2rayService, stopV2rayService } from '../v2ray/index.ts'
import { socketEvent } from './socket.ts'

socketEvent.on('start', () => {
  startV2rayService()
})

socketEvent.on('stop', () => {
  stopV2rayService()
})

socketEvent.on('set-v2ray-b64', (data, send) => {
  config.v2ray.b64 = data.data
  send(0)
})
