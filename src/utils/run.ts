import { rgb24 } from 'fmt/colors.ts'

function getFormatCmd(cmd: string[]) {
  return [
    '$',
    // ['echo', 'hello world'] => $ echo 'hello world'
    ...cmd.map((param) => (/\s/.test(param) ? `'${param}'` : param))
  ].join(' ')
}

export async function run(...cmd: string[]) {
  console.log(rgb24(getFormatCmd(cmd), 0x999999))

  const program = Deno.run({
    cmd: cmd,
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit'
  })

  const status = await program.status()
  program.close()

  if (!status.success) {
    throw status
  }
}

const decoder = new TextDecoder()

export async function runPiped(...cmd: string[]) {
  const program = Deno.run({
    cmd: cmd,
    stdout: 'piped',
    stderr: 'inherit',
    stdin: 'inherit'
  })

  const status = await program.status()
  program.close()

  if (!status.success) {
    throw program
  }

  const output = await program.output()
  return decoder.decode(output).trim()
}
