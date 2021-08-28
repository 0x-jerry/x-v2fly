import { Command, HelpCommand, CompletionsCommand } from 'cliffy/command/mod.ts'
import { UpgradeCommand } from 'cliffy/command/upgrade/mod.ts'
import { GithubProvider } from 'cliffy/command/upgrade/provider/github.ts'
import {
  startAsService,
  tryStopService,
  startWebSocketService,
} from './web/main.ts'
import { startV2rayService, stopV2rayService } from './v2ray/index.ts'
import { version } from '../version.ts'

const x = new Command()
  .name('x-v2fly')
  .version(version)
  .default('help')
  .command('help', new HelpCommand())
  .command('completions', new CompletionsCommand())
  //
  .command(
    'upgrade',
    new UpgradeCommand({
      main: 'x-v2fly.ts',
      importMap: 'import_map.json',
      args: ['-A', '--no-check', '--unstable'],
      provider: new GithubProvider({
        repository: '0x-jerry/x-v2fly',
      }),
    })
  )
  //
  .command('start', 'Start x-v2fly service.')
  .action(async () => {
    await startV2rayService()
  })
  //
  .command('stop', 'Stop x-v2fly service.')
  .action(async () => {
    await stopV2rayService()
  })
  //
  .command('ui [port:number]', 'Start ui service, default port is 7999.')
  .option('--start', 'Start as daemon a service.')
  .option('--stop', 'Start as daemon a service.')
  .action(async (opt: { start: boolean; stop: boolean }, port) => {
    if (opt.start) {
      await startAsService(port)
      return
    }

    if (opt.stop) {
      await tryStopService()
      return
    }

    await startWebSocketService(port)
  })

try {
  await x.parse()
} catch (error) {
  console.log(error)
  Deno.exit(Deno.Signal.SIGHUP)
}
