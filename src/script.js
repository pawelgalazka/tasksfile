// @flow
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import padEnd from 'lodash.padend'
import microcli, { CLIError } from 'microcli'
import omelette from 'omelette'

import { RunJSError, logger, ILogger, Logger, SilentLogger } from './common'

const DEFAULT_RUNFILE_PATH = './runfile.js'

type Config = {
  runfile?: string,
  requires?: Array<string>
}

export function requirer(filePath: string): Object {
  return require(path.resolve(filePath))
}

export function hasAccess(filePath: string): void {
  return fs.accessSync(path.resolve(filePath))
}

export function getConfig(filePath: string): Config {
  let config: Object
  try {
    config = requirer(filePath).runjs || {}
  } catch (error) {
    config = {}
  }
  return config
}

export function load(
  config: Config,
  logger: ILogger,
  requirer: string => Object,
  access: string => void
) {
  const runfilePath = config['runfile'] || DEFAULT_RUNFILE_PATH
  // Load requires if given in config
  if (Array.isArray(config['requires'])) {
    config['requires'].forEach(modulePath => {
      logger.log(chalk.gray(`Requiring ${modulePath}...`))
      requirer(modulePath)
    })
  }

  // Process runfile
  logger.log(chalk.gray(`Processing ${runfilePath}...`))

  try {
    access(runfilePath)
  } catch (error) {
    throw new RunJSError(`No ${runfilePath} defined in ${process.cwd()}`)
  }

  const runfile = requirer(runfilePath)
  if (runfile.default) {
    return runfile.default
  }
  return runfile
}

export function describe(obj: Object, logger: Logger, namespace: ?string) {
  if (!namespace) {
    logger.log(chalk.yellow('Available tasks:'))
  }

  Object.keys(obj)
    .sort()
    .forEach(key => {
      const value = obj[key]
      const nextNamespace = namespace ? `${namespace}:${key}` : key
      const help = value.help

      if (typeof value === 'function') {
        // Add task name
        const funcParams = help && help.params
        let logArgs = [chalk.bold(nextNamespace)]

        // Add task params
        if (Array.isArray(funcParams) && funcParams.length) {
          logArgs[0] += ` [${funcParams.join(' ')}]`
        }

        // Add description
        if (help && (help.description || typeof help === 'string')) {
          const description = help.description || help
          logArgs[0] = padEnd(logArgs[0], 40) // format
          logArgs.push('-', description.split('\n')[0])
        }

        // Log
        logger.log(...logArgs)
      } else if (typeof value === 'object') {
        describe(value, logger, nextNamespace)
      }
    })

  if (!namespace) {
    logger.log(
      '\n' +
        chalk.blue(
          'Type "run [taskname] --help" to get more info if available.'
        )
    )
  }
}

function tasks(obj: Object, namespace: ?string) {
  let list = []
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key

    if (typeof value === 'function') {
      list.push(nextNamespace)
    } else if (typeof value === 'object') {
      list = list.concat(tasks(value, nextNamespace))
    }
  })
  return list
}

export function call(
  obj: Object,
  args: Array<string>,
  logger: ILogger,
  subtaskName?: string
) {
  const taskName = subtaskName || args[2]

  if (typeof obj[taskName] === 'function') {
    const cli = microcli(args.slice(1), obj[taskName].help, null, logger)

    cli((options, ...params) => {
      obj[taskName].apply({ options }, params)
    })
    return obj[taskName]
  }

  let namespaces = taskName.split(':')
  const rootNamespace = namespaces.shift()
  const nextSubtaskName = namespaces.join(':')

  if (obj[rootNamespace]) {
    const calledTask = call(obj[rootNamespace], args, logger, nextSubtaskName)
    if (calledTask) {
      return calledTask
    }
  }

  if (!subtaskName) {
    throw new RunJSError(`Task ${taskName} not found`)
  }
}

function autocomplete(config) {
  const logger = new SilentLogger()
  const completion = omelette('run <task>')
  completion.on('task', ({ reply }) => {
    const runfile = load(config, logger, requirer, hasAccess)
    reply(tasks(runfile))
  })
  completion.init()
}

export function main() {
  try {
    const config = getConfig('./package.json')
    autocomplete(config)
    const runfile = load(config, logger, requirer, hasAccess)
    const ARGV = process.argv.slice()

    if (ARGV.length > 2) {
      call(runfile, ARGV, logger)
    } else {
      describe(runfile, logger)
    }
  } catch (error) {
    if (error instanceof RunJSError || error instanceof CLIError) {
      logger.error(error.message)
      process.exit(1)
    } else {
      logger.log(error)
      process.exit(1)
    }
  }
}
