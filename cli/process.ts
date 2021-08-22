import { pidPath, processShellPath } from 'shared/config.ts'

export async function createNewProcess(...cmd: string[]) {
  await kill()

  cmd = cmd.map((n) => (/\s/.test(n) ? `"${n}"` : n))

  const shellScript = [cmd, '&'].join(' ')

  await Deno.writeTextFile(processShellPath, shellScript)

  Deno.run({
    cmd: ['sh', processShellPath],
    stderr: 'null',
    stdin: 'null',
    stdout: 'null'
  })
}

async function kill() {
  try {
    const p = await Deno.readTextFile(pidPath)
    Deno.kill(parseInt(p), Deno.Signal.SIGHUP)
    return true
  } catch (error) {
    return String(error)
  }
}
