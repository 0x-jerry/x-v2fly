import { createConfig } from 'x-lib'
import { join } from 'path/mod.ts'
import { ensureDirSync, existsSync } from 'fs/mod.ts'

export const homeDir = homedir()

export const confDir = join(homeDir, '.x-f2fly')
ensureDirSync(confDir)
export const confPath = join(confDir, 'config.json')

export const pidPath = join(confDir, 'x-pid')
export const processShellPath = join(confDir, 'x-shell.sh')

export const [config] = createConfig(
  () => {
    const conf = {}

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
