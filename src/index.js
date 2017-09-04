// @flow
const { execSync, spawn } = require('child_process')
const path = require('path')
const { RunJSError, logger } = require('./common')

const loggerAlias = logger

type Options = {
  cwd?: string,
  async?: boolean,
  stdio?: string | Array<any>,
  env?: Object,
  timeout?: number
}

function runSync (command: string, options: Object) : ?string {
  try {
    const buffer = execSync(command, options)
    if (buffer) {
      return buffer.toString()
    }
    return buffer
  } catch (error) {
    throw new RunJSError(error.message)
  }
}

function runAsync (command: string, options: Object): Promise<?string> {
  return new Promise((resolve, reject) => {
    const asyncProcess = spawn(command, options)
    let output : ?string = null

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
      asyncProcess.stdout.on('data', (buffer: Buffer) => {
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

function run (command: string, options: Options = {}, logger = loggerAlias) {
  const binPath = path.resolve('./node_modules/.bin')

  // Pick relevant option keys and set default values
  options = {
    env: options.env || process.env,
    cwd: options.cwd,
    async: !!options.async,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout,
    shell: true
  }

  const env = options.env

  // Include in PATH node_modules bin path
  if (env) {
    env.PATH = [binPath, env.PATH || process.env.PATH].join(path.delimiter)
  }

  logger.info(command)

  // Handle async call
  if (options.async) {
    return runAsync(command, options)
  }

  // Handle sync call by default
  return runSync(command, options)
}

function option (thisObj: ?Object, name: string): mixed {
  return (thisObj && thisObj.options && thisObj.options[name]) || null
}

module.exports = {
  run,
  option
}
