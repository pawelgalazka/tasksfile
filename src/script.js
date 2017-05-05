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
    logger.debug('Available tasks:')
  }

  Object.keys(obj).forEach((key) => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key
    const doc = value.doc

    if (typeof value === 'function') {
      let funcParams
      try {
        funcParams = getParamNames(value)
      } catch (error) {
        funcParams = []
      }
      const paramsDoc = funcParams.length ? `[${funcParams.join(' ')}]` : ''
      logger.info('\n', nextNamespace, paramsDoc)
      if (doc) {
        logger.log(`   ${doc}`)
      }
    } else if (typeof value === 'object') {
      describe(value, logger, nextNamespace)
    }
  })
}

export function call (obj, args, depth = 0) {
  const taskName = args[0]

  if (typeof obj[taskName] === 'function') {
    const { nextArgs, options } = parseArgs(args.slice(1))
    obj[taskName].apply({ options }, nextArgs)
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
