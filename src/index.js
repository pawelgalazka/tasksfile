// @flow
import { execSync, spawn } from 'child_process'
import path from 'path'
import { RunJSError, logger, Logger } from './common'

const loggerAlias: Logger = logger

type Options = {
  cwd?: string,
  async?: boolean,
  input?: string,
  stdio?: string | Array<any>,
  env?: Object,
  timeout?: number
}

function runSync(command: string, options: Options): ?string {
  try {
    const nextOptions = {
      cwd: options.cwd,
      env: options.env,
      input: options.input,
      stdio: options.stdio,
      timeout: options.timeout
    }

    const buffer: string | Buffer = execSync(command, nextOptions)
    if (buffer) {
      return buffer.toString()
    }
    return null
  } catch (error) {
    throw new RunJSError(error.message)
  }
}

function runAsync(command: string, options: Options): Promise<?string> {
  return new Promise((resolve, reject) => {
    const nextOptions = {
      cwd: options.cwd,
      env: options.env,
      stdio: options.stdio,
      shell: true
    }
    const asyncProcess = spawn(command, nextOptions)
    let output: ?string = null

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

    if (options.stdio === 'pipe') {
      asyncProcess.stdout.on('data', (buffer: Buffer) => {
        output = buffer.toString()
      })
    }

    if (options.timeout) {
      setTimeout(() => {
        asyncProcess.kill()
        reject(new Error(`Command timeout: ${command}`))
      }, options.timeout)
    }
  })
}

export function run(
  command: string,
  options: Options = {},
  logger: Logger = loggerAlias
): Promise<?string> | ?string {
  const binPath = path.resolve('./node_modules/.bin')

  // Pick relevant option keys and set default values
  const nextOptions: Options = {
    env: options.env || process.env,
    cwd: options.cwd,
    async: !!options.async,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout
  }

  const env = nextOptions.env

  // Include in PATH node_modules bin path
  if (env) {
    env.PATH = [binPath, env.PATH || process.env.PATH].join(path.delimiter)
  }

  logger.title(command)

  // Handle async call
  if (options.async) {
    return runAsync(command, nextOptions)
  }

  // Handle sync call by default
  if (typeof options.input !== 'undefined') {
    nextOptions.input = options.input
  }
  return runSync(command, nextOptions)
}

/**
 * @deprecated
 */
export function option(thisObj: ?Object, name: string): mixed {
  return (thisObj && thisObj.options && thisObj.options[name]) || null
}

export function options(thisObj: ?Object): Object {
  return (thisObj && thisObj.options) || {}
}

export function help(func: () => void, annotation?: string | Object) {
  // Because the validation above currently gets compiled out,
  // Explictly  validate the function input
  if (typeof func === 'function') {
    func.help = annotation
  } else {
    throw new Error('first help() argument must be a function')
  }
}
