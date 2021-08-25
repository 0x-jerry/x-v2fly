import { Command, HelpCommand, CompletionsCommand } from 'cliffy/command/mod.ts'
import { startWebSocketService } from './web/main.ts'
import { startV2rayService, stopV2rayService } from './v2ray/index.ts'

const x = new Command()
  .name('x-v2fly')
  .default('help')
  .command('help', new HelpCommand())
  .command('completions', new CompletionsCommand())
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
  .action((_, port) => {
    startWebSocketService(port)
  })

await x.parse()
