import {
  IStrategy,
  IV2Ray,
  LogLevel,
  V2RayProtocol,
  IVmessSecurity,
  IV2RayOutbound,
  IV2rayLog,
  IV2RayInbound,
  IV2rayRouting,
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

enum OutboundTag {
  DIRECT = 'direct',
  PROXY = 'proxy',
  BLOCK = 'block',
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
    tag: OutboundTag.PROXY,
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

function getOutboundDirectConf(): IV2RayOutbound {
  return {
    tag: OutboundTag.DIRECT,
    protocol: V2RayProtocol.FREEDOM,
    settings: {},
  }
}

function getOutboundBlockConf(): IV2RayOutbound {
  return {
    tag: OutboundTag.BLOCK,
    protocol: V2RayProtocol.BLACKHOLE,
    settings: {},
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

function getRoutingConf(): IV2rayRouting {
  return {
    domainStrategy: IStrategy.AsIs,
    rules: [
      {
        type: 'field',
        outboundTag: OutboundTag.DIRECT,
        ip: [
          'geoip:cn', // 中国大陆的 IP
          'geoip:private', // 私有地址 IP，如路由器等
        ],
      },
      {
        type: 'field',
        outboundTag: OutboundTag.DIRECT,
        domain: ['geosite:cn'],
      },
      {
        type: 'field',
        outboundTag: OutboundTag.BLOCK,
        domain: ['geosite:category-ads-all'],
      },
    ],
  }
}

export function getV2rayConfig(opt: V2rayConfigOption): IV2Ray {
  return {
    log: getLogConf(),
    inbounds: [
      getHttpInbound(opt.proxy.http.host, opt.proxy.http.port),
      getSocksInbound(opt.proxy.socks.host, opt.proxy.socks.port),
    ],
    outbounds: [
      getOutboundConfFromBase64(opt.b64),
      getOutboundDirectConf(),
      getOutboundBlockConf(),
    ],
    routing: getRoutingConf(),
  }
}
