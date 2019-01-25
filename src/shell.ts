import { execSync, spawn, StdioOptions } from 'child_process'

export class ShellError extends Error {
  constructor(message: string) {
    message = message && message.split('\n')[0] // assign only first line
    super(message)
  }
}

interface ICommonShellOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  stdio?: StdioOptions
  timeout?: number
}

export interface IShellOptions extends ICommonShellOptions {
  async?: boolean
}

function shellAsync(
  command: string,
  options: ICommonShellOptions = {}
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const nextOptions = {
      ...options,
      shell: true,
      stdio: options.stdio || 'inherit'
    }
    const asyncProcess = spawn(command, nextOptions)
    let output: string | null = null

    asyncProcess.on('error', (error: Error) => {
      reject(
        new ShellError(
          `Failed to start command: ${command}; ${error.toString()}`
        )
      )
    })

    asyncProcess.on('close', (exitCode: number) => {
      if (exitCode === 0) {
        resolve(output)
      } else {
        reject(
          new ShellError(
            `Command failed: ${command} with exit code ${exitCode}`
          )
        )
      }
    })

    if (nextOptions.stdio === 'pipe') {
      asyncProcess.stdout.on('data', (buffer: Buffer) => {
        output = buffer.toString()
      })
    }

    if (nextOptions.timeout) {
      setTimeout(() => {
        asyncProcess.kill()
        reject(new ShellError(`Command timeout: ${command}`))
      }, nextOptions.timeout)
    }
  })
}

function shellSync(
  command: string,
  options: ICommonShellOptions = {}
): string | null {
  try {
    const nextOptions = {
      ...options,
      stdio: options.stdio || 'inherit'
    }
    const buffer: string | Buffer = execSync(command, nextOptions)
    if (buffer) {
      return buffer.toString()
    }
    return null
  } catch (error) {
    throw new ShellError(error.message)
  }
}

function shell(
  command: string,
  options: IShellOptions & { async: true }
): Promise<string | null>

function shell(
  command: string,
  options?: IShellOptions & { async?: false }
): string | null

function shell(command: string, options?: IShellOptions) {
  return options && options.async
    ? shellAsync(command, options)
    : shellSync(command, options)
}

export default shell
