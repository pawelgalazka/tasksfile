import chalk from 'chalk'
import childProcess from 'child_process'
import template from 'lodash.template'
import fs from 'fs'
import path from 'path'

// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
export function RunJSError (message) {
  this.name = 'RunJSError'
  this.message = message
}
RunJSError.prototype = Object.create(Error.prototype)
RunJSError.prototype.constructor = RunJSError

export const logger = {
  debug: (...args) => {
    console.log(chalk.blue(...args))
  },
  info: (...args) => {
    console.log(chalk.bold(...args))
  },
  log: (...args) => {
    console.log(...args)
  },
  warning: (...args) => {
    console.warn(chalk.yellow(...args))
  },
  error: (...args) => {
    console.error(chalk.red(...args))
  }
}

const loggerAlias = logger

export function load (runfilePath, logger, requirer, access) {
  let config

  // try to read package.json config
  try {
    config = requirer('./package.json').runjs || {}
  } catch (error) {
    config = {}
  }

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
  let options = {}
  let nextArgs = args.filter(arg => {
    const doubleDashMatch = arg.match(/^--(\w+)=(\w*)$/) || arg.match(/^--(\w+)$/)
    const singleDashMatch = arg.match(/^-(\w)=(\w*)$/) || arg.match(/^-(\w)$/)

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

  if (Object.keys(options).length) {
    nextArgs.push(options)
  }
  return nextArgs
}

export function call (obj, args, logger) {
  let taskName = args[0]

  if (!taskName) {
    logger.log('Available tasks:')
    Object.keys(obj).forEach((key) => {
      let doc = obj[key].doc
      if (doc) {
        logger.log(key, `- ${doc}`)
      } else {
        logger.log(key)
      }
    })
    return
  }

  if (!obj[taskName]) {
    throw new RunJSError(`Task ${taskName} not found`)
  }

  Object.keys(obj).forEach((t) => {
    let task = obj[t]
    obj[t] = function (...args) {
      let time = Date.now()
      if (args.length) {
        logger.debug(`Running "${t}" with ${JSON.stringify(args)}...`)
      } else {
        logger.debug(`Running "${t}"...`)
      }
      task.apply(null, args)
      time = ((Date.now() - time) / 1000).toFixed(2)
      logger.debug(`Finished "${t}" in ${time} sec`)
    }
  })

  obj[taskName].apply(null, parseArgs(args.slice(1)))
}

function execSync (command, options) {
  // Prepare options for execSync command (don't need async and stdio should have default value)
  const execOptions = Object.assign({}, options)
  delete execOptions.async
  if (execOptions.stdio === 'inherit') {
    delete execOptions.stdio
  }

  const execSyncBuffer = childProcess.execSync(command, execOptions)

  if (options.stdio === 'inherit') {
    // execSync do handle stdio option, but when stdio=inherit, execSync returns null. We can fix that
    // by not passing stdio=inherit and writing outcome separately. Thanks to this stdout will be streamed and sync
    // run function will still return child process outcome.
    process.stdout.write(execSyncBuffer)
  }

  return execSyncBuffer.toString()
}

function execAsync (command, options) {
  // Prepare options for exec command (don't need async and stdio as it doesn't handle them)
  const execOptions = Object.assign({}, options)
  delete execOptions.async
  delete execOptions.stdio

  return new Promise((resolve, reject) => {
    const asyncProcess = childProcess.exec(command, execOptions, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout.toString())
      }
    })

    // Simulate stdio=inherit behaviour for exec async (exec doesn't handle stdio option)
    if (options.stdio === 'inherit') {
      asyncProcess.stdout.pipe(process.stdout)
      asyncProcess.stderr.pipe(process.stderr)
    }
  })
}

export function run (command, options = {}, logger = loggerAlias) {
  const binPath = path.resolve('./node_modules/.bin')

  // Pick relevant option keys and set default values
  options = {
    env: options.env || {},
    cwd: options.cwd,
    async: !!options.async,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout
  }

  // Include in PATH node_modules bin path
  options.env.PATH = [binPath, options.env.PATH || process.env.PATH].join(path.delimiter)

  logger.info(command)

  // Handle async call
  if (options.async) {
    return execAsync(command, options)
  }

  // Handle sync call by default
  return execSync(command, options)
}

export function generate (src, dst, context) {
  console.log(`Generating ${dst} from template ${src}`)
  let templateString = fs.readFileSync(src)
  let content = template(templateString)(context)
  fs.writeFileSync(dst, content)
}
