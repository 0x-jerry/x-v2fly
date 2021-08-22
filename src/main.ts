import { Command, HelpCommand, CompletionsCommand } from 'cliffy/command/mod.ts'
import { setHttpProxy } from './proxy.ts'

const x = new Command()
  .name('x-v2fly')
  .default('help')
  .command('help', new HelpCommand())
  .command('completions', new CompletionsCommand())
  .command('start', 'Start x-v2fly service.')
  .action(async () => {
    await setHttpProxy('127.0.0.1', 8889)
  })
  .command('stop', 'Stop x-v2fly service.')
  .action(() => {
    console.log('stop')
  })
  .command('restart', 'Restart x-v2fly service.')
  .action(() => {
    console.log('restart')
  })

await x.parse()
