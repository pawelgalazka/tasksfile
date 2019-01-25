import { spawn, StdioOptions } from 'child_process'

interface IShellOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  stdio: StdioOptions
  timeout?: number
}

export default (
  command: string,
  { cwd, env, timeout, stdio = 'inherit' }: IShellOptions
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const asyncProcess = spawn(command, {
      cwd,
      env,
      shell: true,
      stdio
    })
    let output: string | null = null

    asyncProcess.on('error', (error: Error) => {
      reject(
        new Error(`Failed to start command: ${command}; ${error.toString()}`)
      )
    })

    asyncProcess.on('close', (exitCode: number) => {
      if (exitCode === 0) {
        resolve(output)
      } else {
        reject(
          new Error(`Command failed: ${command} with exit code ${exitCode}`)
        )
      }
    })

    if (stdio === 'pipe') {
      asyncProcess.stdout.on('data', (buffer: Buffer) => {
        output = buffer.toString()
      })
    }

    if (timeout) {
      setTimeout(() => {
        asyncProcess.kill()
        reject(new Error(`Command timeout: ${command}`))
      }, timeout)
    }
  })
}
