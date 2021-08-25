import { getV2rayConfig } from './conf.ts'
import { start, tryStop } from './v2ray.ts'

export async function startV2rayService() {
  const conf = getV2rayConfig({
    b64: 'vmess://eyJwb3J0Ijo0NDMsInRscyI6InRscyIsImFpZCI6MCwidiI6IjIiLCJob3N0IjoidGlueS1vbmxpbmUub25saW5lIiwidHlwZSI6Im5vbmUiLCJwYXRoIjoiL3JheSIsIm5ldCI6IndzIiwiYWRkIjoidGlueS1vbmxpbmUub25saW5lIiwicHMiOiJ0aW55LW9ubGluZS5vbmxpbmUtMjYiLCJpZCI6IjA0MDE4YjdmLTQyZWMtNDRkMy04MmZlLWM5MTExOGI3NThhZCJ9',
    proxy: {
      http: {
        host: '127.0.0.1',
        port: 7778,
      },
      socks: {
        host: '127.0.0.1',
        port: 7777,
      },
    },
  })

  await start(conf)
}

export async function stopV2rayService() {
  await tryStop()
}
