import {
  cli as cliEngine,
  CLIError,
  CommandsModule,
  Middleware,
  useMiddlewares
} from '@pawelgalazka/cli'
import { Logger } from '@pawelgalazka/cli/lib/utils/logger'
import {
  IAsyncShellOptions,
  IShellOptions,
  ISyncShellOptions,
  shell,
  ShellError
} from '@pawelgalazka/shell'
import chalk from 'chalk'
import path from 'path'

export { help, rawArgs } from '@pawelgalazka/cli'
export { prefixTransform } from '@pawelgalazka/shell'

const commandNotFoundHandler: Middleware = next => args => {
  const { command } = args

  if (!command) {
    throw new CLIError(
      'Command not found. Type "npx task --help" for more information.'
    )
  }

  next(args)
}
const shellErrorHandler: (
  logger: Logger
) => Middleware = logger => next => args => {
  const { reject } = args
  const nextReject = (error: Error) => {
    if (error instanceof ShellError) {
      logger.error(error.message)
      process.exit(1)
    } else {
      reject(error)
    }
  }
  try {
    next({
      ...args,
      reject: nextReject
    })
  } catch (error) {
    nextReject(error)
  }
}

export function sh(
  command: string,
  options: IAsyncShellOptions,
  logger?: Logger
): Promise<string | null>

export function sh(
  command: string,
  options?: ISyncShellOptions,
  logger?: Logger
): string | null

export function sh(
  command: string,
  options: IShellOptions = {},
  logger: Logger = new Logger()
) {
  const binPath = path.resolve('./node_modules/.bin')
  // Include in PATH node_modules bin path
  const nextPath = [
    binPath,
    (options.env && options.env.PATH) || process.env.PATH
  ].join(path.delimiter)

  const nextOptions = {
    ...options,
    env: {
      ...(options.env || process.env),
      PATH: nextPath
    }
  }

  logger.log(chalk.bold(command))

  return shell(command, nextOptions)
}

export function cli(definition: CommandsModule) {
  return cliEngine(
    definition,
    useMiddlewares([commandNotFoundHandler, shellErrorHandler(new Logger())])
  )
}
