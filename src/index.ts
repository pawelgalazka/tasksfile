import {
  cli as cliEngine,
  CLIError,
  CommandsModule,
  Middleware,
  useMiddlewares
} from '@pawelgalazka/cli'
import { Logger } from '@pawelgalazka/cli/lib/utils/logger'
import { IShellOptions, shell, ShellError } from '@pawelgalazka/shell'
import chalk from 'chalk'
import path from 'path'

export { help, rawArgs } from '@pawelgalazka/cli'

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
  logger: Logger = new Logger()
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

  logger.log(chalk.bold(command))

  return shell(command, nextOptions)
}

export function cli(definition: CommandsModule) {
  return cliEngine(
    definition,
    useMiddlewares([commandNotFoundHandler, shellErrorHandler(new Logger())])
  )
}
