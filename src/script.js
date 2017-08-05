import path from 'path'
import fs from 'fs'
import { RunJSError } from './common'
import getParamNames from 'get-parameter-names'

export function requirer (filePath) {
  return require(path.resolve(filePath))
}

export function hasAccess (filePath) {
  return fs.accessSync(path.resolve(filePath))
}

export function config (filePath) {
  let config
  try {
    config = require(filePath).runjs || {}
  } catch (error) {
    config = {}
  }
  return config
}

export function load (runfilePath, config, logger, requirer, access) {
  let babelEnabled = false
  let tsEnabled = false
  let hasJsRunfile = false
  let hasTsRunfile = false
  let importError = null

  if (config['babel-register']) {
    try {
      requirer(config['babel-register'])
      babelEnabled = true
    } catch (error) {
      importError = error
    }
  } else if (config['ts-register']) {
    try {
      requirer(config['ts-register'])
      tsEnabled = true
    } catch (error) {
      importError = error
    }
  } else {
    try {
      requirer('./node_modules/babel-register')
      babelEnabled = true
    } catch (error) {
      importError = error
    }

    if (!babelEnabled) {
      try {
        requirer('./node_modules/ts-node/register')
        tsEnabled = true
      } catch (error) {
        importError = error
      }
    }
  }

  if (babelEnabled) {
    logger.log('Loaded babel-register')
  } else if (tsEnabled) {
    logger.log('Loaded ts-node/register')
  } else if ((config['babel-register'] || config['ts-register']) && importError instanceof Error) {
    throw importError
  }

  // process runfile.js
  logger.log('Processing runfile...')
  try {
    access(`${runfilePath}.js`)
    hasJsRunfile = true
  } catch (error) {
    if (tsEnabled) {
      try {
        access(`${runfilePath}.ts`)
        runfilePath = `${runfilePath}.ts`
        hasTsRunfile = true
      } catch (error) {
        hasTsRunfile = false
      }
    }
  }

  if (!hasJsRunfile && !hasTsRunfile) {
    throw new RunJSError(`No ${runfilePath} defined in ${process.cwd()}`)
  }

  var runfile = requirer(runfilePath)
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

export function describe (obj, logger, namespace) {
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

export function call (obj, args, logger, depth = 0) {
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
