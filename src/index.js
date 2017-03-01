import chalk from 'chalk'
import childProcess from 'child_process'
import template from 'lodash.template'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

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

function runSync (command, options) {
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

function runAsync (command, options) {
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

function runAsyncSpawn (command, args, options) {
  return new Promise((resolve, reject) => {
    const spawnOptions = Object.assign({shell: true}, options)
    const asyncProcess = childProcess.spawn(command, args, spawnOptions)
    asyncProcess.on('close', code => {
      if (code !== 0) {
        reject('failed')
      } else {
        resolve('success')
      }
    })
    asyncProcess.on('error', (error) => {
      reject(error)
    })
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
    timeout: options.timeout,
    asyncSpawn: !!options.asyncSpawn,
    args: options.args || []
  }

  // Include in PATH node_modules bin path
  options.env.PATH = [binPath, options.env.PATH || process.env.PATH].join(path.delimiter)

  // Handle async call
  if (options.async) {
    logger.info(command)
    return runAsync(command, options)
  } else if (options.asyncSpawn) {
    logger.info(`${command} ${options.args.join(' ')}`)
    return runAsyncSpawn(command, options.args, options)
  }

  // Handle sync call by default
  logger.info(command)
  return runSync(command, options)
}

export function generate (src, dst, context) {
  console.log(`Generating ${dst} from template ${src}`)
  let templateString = fs.readFileSync(src)
  let content = template(templateString)(context)
  fs.writeFileSync(dst, content)
}

export function ask (question) {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        readlineInterface.question(question + ' ', (answer) => {
          resolve(answer)
          readlineInterface.close()
        })
      } catch (error) {
        reject(error)
        readlineInterface.close()
      }
    }, 0)
  })
}
