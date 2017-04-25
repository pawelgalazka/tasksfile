import path from 'path'
import fs from 'fs'
import minimist from 'minimist'

// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
export function RunJSError (message) {
  this.name = 'RunJSError'
  this.message = message
}
RunJSError.prototype = Object.create(Error.prototype)
RunJSError.prototype.constructor = RunJSError

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
  // try to load babel-register
  try {
    logger.log('Requiring babel-register...')
    if (config['babel-register']) {
      requirer(config['babel-register'])
    } else {
      requirer('./node_modules/babel-register')
    }
  } catch (error) {
    logger.log('Requiring failed. Fallback to pure node.')
    if (config['babel-register']) {
      throw error
    }
  }

  // process runfile.js
  logger.log('Processing runfile...')

  try {
    access(`${runfilePath}.js`)
  } catch (error) {
    throw new RunJSError(`No ${runfilePath}.js defined in ${process.cwd()}`)
  }

  const runfile = requirer(runfilePath)
  if (runfile.default) {
    return runfile.default
  }
  return runfile
}

function parseArgs (args) {
  const options = minimist(args)
  const unassigned = options._
  delete options._
  return Object.keys(options).length ? unassigned.concat(options) : unassigned
}

export function describe (obj, logger, namespace) {
  if (!namespace) {
    logger.log('Available tasks:')
  }

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const doc = value.doc
    const nextNamespace = namespace ? `${namespace}:${key}` : key

    if (typeof value === 'function') {
      if (doc) {
        logger.log(nextNamespace, `- ${doc}`)
      } else {
        logger.log(nextNamespace)
      }
    } else if (typeof value === 'object') {
      describe(value, logger, nextNamespace)
    }
  })
}

export function decorate (obj, logger, namespace) {
  let nextObj = {}
  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key

    if (typeof value === 'function') {
      nextObj[key] = function (...args) {
        let time = Date.now()
        if (args.length) {
          logger.debug(`Running "${nextNamespace}" with ${JSON.stringify(args)}...`)
        } else {
          logger.debug(`Running "${nextNamespace}"...`)
        }
        value.apply(null, args)
        time = ((Date.now() - time) / 1000).toFixed(2)
        logger.debug(`Finished "${nextNamespace}" in ${time} sec`)
      }
    }

    if (typeof value === 'object') {
      nextObj[key] = decorate(value, logger, nextNamespace)
    }
  })
  return nextObj
}

export function call (obj, args, depth = 0) {
  const taskName = args[0]

  if (typeof obj[taskName] === 'function') {
    obj[taskName].apply(null, parseArgs(args.slice(1)))
    return obj[taskName]
  }

  let namespaces = taskName.split(':')
  const rootNamespace = namespaces.shift()
  const nextTaskName = namespaces.join(':')
  let nextArgs = args.slice()
  nextArgs[0] = nextTaskName

  if (obj[rootNamespace]) {
    const calledTask = call(obj[rootNamespace], nextArgs, depth + 1)
    if (calledTask) {
      return calledTask
    }
  }

  if (!depth) {
    throw new RunJSError(`Task ${taskName} not found`)
  }
}
