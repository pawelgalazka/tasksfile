const childProcess = require('child_process')
const path = require('path')
const { RunJSError, logger } = require('./common')

const loggerAlias = logger

function runSync (command, options) {
  try {
    const buffer = childProcess.execSync(command, options)
    if (buffer) {
      return buffer.toString()
    }
    return buffer
  } catch (error) {
    throw new RunJSError(error.message)
  }
}

function runAsync (command, options) {
  return new Promise((resolve, reject) => {
    const asyncProcess = childProcess.spawn(command, options)
    let output = null

    asyncProcess.on('error', (error) => {
      reject(new Error(`Failed to start command: ${command}; ${error}`))
    })

    asyncProcess.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve(output)
      } else {
        reject(new Error(`Command failed: ${command} with exit code ${exitCode}`))
      }
    })

    if (options.stdio === 'pipe') {
      asyncProcess.stdout.on('data', (buffer) => {
        output = buffer.toString()
      })
    }

    if (options.timeout) {
      setTimeout(() => {
        asyncProcess.kill()
        reject(new Error(`Command timeout: ${command}`))
      }, options.timeout)
    }
  })
}

function run (command, options = {}, logger = loggerAlias) {
  const binPath = path.resolve('./node_modules/.bin')
  const shouldLog = options.log !== false

  // Pick relevant option keys and set default values
  options = {
    env: options.env || process.env,
    cwd: options.cwd,
    async: !!options.async,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout,
    shell: true
  }

  // Include in PATH node_modules bin path
  options.env.PATH = [binPath, options.env.PATH || process.env.PATH].join(path.delimiter)

  if (shouldLog) {
    logger.info(command)
  }

  // Handle async call
  if (options.async) {
    return runAsync(command, options)
  }

  // Handle sync call by default
  return runSync(command, options)
}

function option (thisObj, name) {
  return (thisObj && thisObj.options && thisObj.options[name]) || null
}

module.exports = {
  run,
  option
}
