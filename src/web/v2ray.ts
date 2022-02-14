import { config } from '../config.ts'
import { startV2rayService, stopV2rayService } from '../v2ray/index.ts'
import {  Router } from 'oak'

export const router = new Router()

router
  .prefix('/v2fly')
  .get('/start', async (ctx) => {
    config.v2ray.b64 = ctx.request.url.searchParams.get('b64')

    await startV2rayService()
    ctx.response.body = ''
  })
  .get('/stop', async (ctx) => {
    await stopV2rayService()
    ctx.response.body = ''
  })
  .get('/get-config', (ctx) => {
    ctx.response.body = config.v2ray
  })
