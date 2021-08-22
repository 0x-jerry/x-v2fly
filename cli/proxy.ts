import { run, runPiped } from './utils/run.ts'

const platform = Deno.build.os

/**
 * execute with platform
 */
function ewp<T>(opt: {
  mac?: () => T
  linux?: () => T
  win?: () => T
}): T | undefined {
  if (platform === 'darwin') {
    return opt.mac?.()
  } else if (platform === 'linux') {
    return opt.linux?.()
  } else if (platform === 'windows') {
    return opt.win?.()
  }
}

export function getAllNets() {
  return ewp({
    async mac() {
      const txt = await runPiped('networksetup', '-listnetworkserviceorder')
      const nets = txt.match(/^\(\d+\) .+$/gm)

      const result: string[] =
        nets?.map((n) => n.replace(/^\(\d+\) /, '')) || []

      return result
    }
  })
}

export function isConnected(net: string) {
  return ewp({
    async mac() {
      const txt = await runPiped('networksetup', '-getinfo', net)
      const m = /^(IPv6 )?IP address: (?!none).+$/m.test(txt)
      return !!m
    }
  })
}

export async function setHttpProxy(
  domain: string,
  port: number,
  enable = true
) {
  const nets = (await getAllNets()) || []

  return ewp({
    async mac() {
      for (const net of nets) {
        if (!(await isConnected(net))) {
          continue
        }

        await run('networksetup', '-setwebproxy', net, domain, port.toString())

        if (!enable) {
          await run('networksetup', '-setwebproxystate', net, 'off')
        }
      }
    }
  })
}

export async function setHttpProxyOff() {
  const nets = (await getAllNets()) || []

  return ewp({
    async mac() {
      for (const net of nets) {
        if (!(await isConnected(net))) {
          continue
        }

        await run('networksetup', '-setwebproxystate', net, 'off')
      }
    }
  })
}
