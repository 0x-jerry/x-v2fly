import { createConfig } from 'x-lib'
import { join } from 'path/mod.ts'
import { ensureDirSync, existsSync } from 'fs/mod.ts'
import { V2rayConfigOption } from './v2ray/index.ts'

export const homeDir = homedir()

export const confDir = join(homeDir, '.x-f2fly')
ensureDirSync(confDir)
export const confPath = join(confDir, 'config.json')

export const pidPath = join(confDir, 'x-pid')
export const processShellPath = join(confDir, 'x-shell.sh')

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
    }

    const conf = {
      v2ray,
    }

    if (!existsSync(confPath)) {
      return conf
    }

    const txt = Deno.readTextFileSync(confPath)
    Object.assign(conf, JSON.parse(txt))

    return conf
  },
  (data) => {
    Deno.writeTextFileSync(confPath, JSON.stringify(data, null, 2))
  }
)

function homedir(): string {
  const home = Deno.env.get('HOME') ?? Deno.env.get('USERPROFILE')

  return home!
}
