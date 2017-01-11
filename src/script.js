// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
export function RunJSError (message) {
  this.name = 'RunJSError'
  this.message = message
}
RunJSError.prototype = Object.create(Error.prototype)
RunJSError.prototype.constructor = RunJSError

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
