// @flow
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const padEnd = require('lodash.padend')
const microcli = require('microcli')

const { RunJSError, logger, Logger } = require('./common')

const DEFAULT_RUNFILE_PATH = './runfile.js'

type Config = {
  runfile?: string,
  requires?: Array<string>
}

function requirer(filePath: string): Object {
  return require(path.resolve(filePath))
}

function hasAccess(filePath: string): void {
  return fs.accessSync(path.resolve(filePath))
}

function getConfig(filePath: string): Config {
  let config: Object
  try {
    config = requirer(filePath).runjs || {}
  } catch (error) {
    config = {}
  }
  return config
}

function load(
  config: Config,
  logger: Logger,
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

function describe(obj: Object, logger: Logger, namespace: ?string) {
  if (!namespace) {
    logger.log(chalk.yellow('Available tasks:'))
  }

  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key
    const help = value.help

    if (typeof value === 'function') {
      // Add task name
      let funcParams
      let logArgs = [chalk.bold(nextNamespace)]

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

function call(
  obj: Object,
  args: Array<string>,
  logger: Logger,
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

function main() {
  try {
    const config = getConfig('./package.json')
    const runfile = load(config, logger, requirer, hasAccess)
    const ARGV = process.argv.slice()

    if (ARGV.length > 2) {
      call(runfile, ARGV, logger)
    } else {
      describe(runfile, logger)
    }
  } catch (error) {
    if (error instanceof RunJSError) {
      logger.error(error.message)
      process.exit(1)
    } else {
      throw error
    }
  }
}

module.exports = {
  requirer,
  hasAccess,
  getConfig,
  load,
  describe,
  call,
  main
}
