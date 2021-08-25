import {
  IV2Ray,
  LogLevel,
  V2RayProtocol,
  IVmessSecurity,
  IV2RayOutbound,
  IV2rayLog,
  IV2RayInbound,
} from 'v2ray-schema'
import { confDir } from '../config.ts'
import { join } from 'path/mod.ts'

export const v2rayLogInfoPath = join(confDir, 'v2ray.info.log')
export const v2rayLogErrorPath = join(confDir, 'v2ray.error.log')

function getLogConf(): IV2rayLog {
  return {
    access: v2rayLogInfoPath,
    error: v2rayLogErrorPath,
    loglevel: LogLevel.info,
  }
}

interface V2rayBase64 {
  port: number
  tls: string
  /**
   * alert id
   */
  aid: number
  /**
   * version
   */
  v: string
  host: string
  type: string
  path: string
  /**
   * network
   */
  net: string
  /**
   * address
   */
  add: string
  /**
   * name
   */
  ps: string
  /**
   * uuid
   */
  id: string
}

/**
 * Only support vmess protocol for now.
 * @param b64
 * @returns
 */
function getOutboundConfFromBase64(b64: string): IV2RayOutbound {
  const [_protocol, conf] = b64.split('://')

  const config: V2rayBase64 = JSON.parse(atob(conf))

  return {
    tag: 'proxy',
    protocol: V2RayProtocol.VMESS,
    mux: {
      enabled: true,
      concurrency: 8,
    },
    streamSettings: {
      wsSettings: {
        path: config.path,
        headers: {
          host: config.host,
        },
      },
      tlsSettings: {
        serverName: config.host,
        allowInsecure: false,
      },
      security: 'tls',
      network: 'ws',
    },
    settings: {
      vnext: [
        {
          address: config.add,
          port: config.port,
          users: [
            {
              alterId: config.aid,
              id: config.id,
              security: IVmessSecurity.AUTO,
              level: 0,
            },
          ],
        },
      ],
    },
  }
}

function getHttpInbound(host: string, port: number): IV2RayInbound {
  return {
    protocol: V2RayProtocol.HTTP,
    listen: host,
    port: port,
    sniffing: {
      enabled: true,
      destOverride: ['tls', 'http'],
    },
  }
}

function getSocksInbound(host: string, port: number): IV2RayInbound {
  return {
    protocol: V2RayProtocol.SOCKS,
    listen: host,
    port: port,
    settings: {
      udp: true,
      auth: 'noauth',
    },
    sniffing: {
      enabled: true,
      destOverride: ['tls', 'http'],
    },
  }
}

export interface V2rayConfigOption {
  b64: string
  proxy: {
    http: {
      host: string
      port: number
    }
    socks: {
      host: string
      port: number
    }
  }
}

export function getV2rayConfig(opt: V2rayConfigOption): IV2Ray {
  return {
    log: getLogConf(),
    inbounds: [
      getHttpInbound(opt.proxy.http.host, opt.proxy.http.port),
      getSocksInbound(opt.proxy.socks.host, opt.proxy.socks.port),
    ],
    outbounds: [getOutboundConfFromBase64(opt.b64)],
  }
}
