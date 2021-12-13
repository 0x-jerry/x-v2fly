import { createConfig } from 'x-lib'
import { join } from 'path/mod.ts'
import { ensureDirSync } from 'fs/mod.ts'
import { V2rayConfigOption } from './v2ray/index.ts'
import { homedir } from 'd-lib'

export const isDev = Deno.env.get('__X_V2FLY_DEBUG__') === '1'

export const confDir = join(homedir, '.x-v2fly')
ensureDirSync(confDir)
export const confPath = join(confDir, isDev ? 'config.dev.json' : 'config.json')

export const [config] = createConfig(
  () => {
    const v2ray: V2rayConfigOption = {
      b64: '',
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
      mux: false,
    }

    const conf = {
      program: 'v2ray' as 'v2ray' | 'xray',
      v2ray,
    }

    try {
      const txt = Deno.readTextFileSync(confPath)
      Object.assign(conf, JSON.parse(txt))
      return conf
    } catch (_error) {
      return conf
    }
  },
  (data) => {
    Deno.writeTextFileSync(confPath, JSON.stringify(data, null, 2))
  }
)
