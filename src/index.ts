import { Logger } from '@pawelgalazka/cli/lib/utils/logger'
import { IShellOptions, shell } from '@pawelgalazka/shell'
import chalk from 'chalk'
import path from 'path'

export { cli, help } from '@pawelgalazka/cli'

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
