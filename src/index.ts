import path from 'path'
import { logger, Logger } from './common'
import shell, { IShellOptions } from './shell'

const loggerAlias: Logger = logger

interface ITaskFunction {
  (...args: any[]): any
  help?: any
}

export function sh(
  command: string,
  options: IShellOptions & { async: true },
  logger?: Logger
): Promise<string | null>

export function sh(
  command: string,
  options?: IShellOptions & { async?: false | null },
  logger?: Logger
): string | null

export function sh(
  command: string,
  options: IShellOptions = {},
  logger: Logger = loggerAlias
) {
  const binPath = path.resolve('./node_modules/.bin')

  // Pick relevant option keys and set default values
  const nextOptions = {
    async: !!options.async,
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout
  }

  const env = nextOptions.env

  // Include in PATH node_modules bin path
  if (env) {
    env.PATH = [binPath, env.PATH || process.env.PATH].join(path.delimiter)
  }

  logger.title(command)

  return shell(command, nextOptions)
}

export function help(func: ITaskFunction, annotation?: string | any) {
  // Because the validation above currently gets compiled out,
  // Explictly  validate the function input
  if (typeof func === 'function') {
    func.help = annotation
  } else {
    throw new Error('first help() argument must be a function')
  }
}
