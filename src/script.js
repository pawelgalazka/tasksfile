const path = require('path')
const fs = require('fs')
const { RunJSError, logger } = require('./common')
const getParamNames = require('get-parameter-names')

const DEFAULT_RUNFILE_PATH = './runfile.js'

function requirer (filePath) {
  return require(path.resolve(filePath))
}

function hasAccess (filePath) {
  return fs.accessSync(path.resolve(filePath))
}

function getConfig (filePath) {
  let config
  try {
    config = requirer(filePath).runjs || {}
  } catch (error) {
    config = {}
  }
  return config
}

function load (config, logger, requirer, access) {
  const runfilePath = config['runfile'] || DEFAULT_RUNFILE_PATH
  // Load requires if given in config
  if (Array.isArray(config['requires'])) {
    config['requires'].forEach(modulePath => {
      logger.log(`Requiring ${modulePath}...`)
      requirer(modulePath)
    })
  }

  // Process runfile
  logger.log(`Processing ${runfilePath}...`)

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

function parseArgs (args) {
  const options = {}
  const nextArgs = args.filter(arg => {
    const doubleDashMatch = arg.match(/^--([\w-.]+)=([\w-.]*)$/) || arg.match(/^--([\w-.]+)$/)
    const singleDashMatch = arg.match(/^-(?!-)([\w-.])=([\w-.]*)$/) || arg.match(/^-(?!-)([\w-.])$/)

    if (singleDashMatch) {
      options[singleDashMatch[1]] = Number(singleDashMatch[2]) || singleDashMatch[2] || true
      return false
    }

    if (doubleDashMatch) {
      options[doubleDashMatch[1]] = Number(doubleDashMatch[2]) || doubleDashMatch[2] || true
      return false
    }

    return true
  })

  return {
    nextArgs,
    options
  }
}

function describe (obj, logger, namespace) {
  if (!namespace) {
    logger.debug('Available tasks:\n')
  }

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key
    const help = value.help

    if (typeof value === 'function') {
      let funcParams
      try {
        funcParams = getParamNames(value)
      } catch (error) {
        funcParams = []
      }
      const paramsDoc = funcParams.length ? `[${funcParams.join(' ')}]` : ''
      logger.info(nextNamespace, paramsDoc)
      if (help) {
        logger.log(help)
      }
      logger.info(' ')
    } else if (typeof value === 'object') {
      describe(value, logger, nextNamespace)
    }
  })
}

function help (task, logger) {
  logger.log(' ')
  logger.info('ARGUMENTS')
  const params = getParamNames(task)
  if (params.length) {
    logger.log(`[${params.join(' ')}]`)
  } else {
    logger.log('None')
  }
  logger.log(' ')
  logger.info('DESCRIPTION')
  logger.log(task.help || 'None')
  logger.log(' ')
}

function call (obj, args, logger, depth = 0) {
  const taskName = args[0]

  if (typeof obj[taskName] === 'function') {
    const { nextArgs, options } = parseArgs(args.slice(1))
    if (options.help) {
      help(obj[taskName], logger)
    } else {
      obj[taskName].apply({ options }, nextArgs)
    }
    return obj[taskName]
  }

  let namespaces = taskName.split(':')
  const rootNamespace = namespaces.shift()
  const nextTaskName = namespaces.join(':')
  let nextArgs = args.slice()
  nextArgs[0] = nextTaskName

  if (obj[rootNamespace]) {
    const calledTask = call(obj[rootNamespace], nextArgs, logger, depth + 1)
    if (calledTask) {
      return calledTask
    }
  }

  if (!depth) {
    throw new RunJSError(`Task ${taskName} not found`)
  }
}

function main () {
  try {
    const config = getConfig('./package.json')
    const runfile = load(config, logger, requirer, hasAccess)
    const ARGV = process.argv.slice(2)

    if (ARGV.length) {
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
