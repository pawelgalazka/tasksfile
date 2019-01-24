import { execSync, spawn, StdioOptions } from "child_process"
import path from "path"
import { logger, Logger, RunJSError } from "./common"

const loggerAlias: Logger = logger

interface IOptions {
  cwd?: string
  async?: boolean
  stdio?: StdioOptions
  env?: NodeJS.ProcessEnv
  timeout?: number
}

interface ICliOptions {
  [key: string]: string
}

interface ITaskContext {
  options?: ICliOptions
}

interface ITaskFunction {
  (...args: any[]): any
  help?: any
}

function runSync(command: string, options: IOptions): string | null {
  try {
    const nextOptions = {
      cwd: options.cwd,
      env: options.env,
      stdio: options.stdio,
      timeout: options.timeout
    }
    const buffer: string | Buffer = execSync(command, nextOptions)
    if (buffer) {
      return buffer.toString()
    }
    return null
  } catch (error) {
    throw new RunJSError(error.message)
  }
}

function runAsync(command: string, options: IOptions): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const nextOptions = {
      cwd: options.cwd,
      env: options.env,
      shell: true,
      stdio: options.stdio
    }
    const asyncProcess = spawn(command, nextOptions)
    let output: string | null = null

    asyncProcess.on("error", (error: Error) => {
      reject(
        new Error(`Failed to start command: ${command}; ${error.toString()}`)
      )
    })

    asyncProcess.on("close", (exitCode: number) => {
      if (exitCode === 0) {
        resolve(output)
      } else {
        reject(
          new Error(`Command failed: ${command} with exit code ${exitCode}`)
        )
      }
    })

    if (options.stdio === "pipe") {
      asyncProcess.stdout.on("data", (buffer: Buffer) => {
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

export function run(
  command: string,
  options: IOptions & { async: true },
  logger?: Logger
): Promise<string | null>

export function run(
  command: string,
  options: IOptions & { async?: false | null },
  logger?: Logger
): string | null

export function run(
  command: string,
  options: IOptions = {},
  logger: Logger = loggerAlias
) {
  const binPath = path.resolve("./node_modules/.bin")

  // Pick relevant option keys and set default values
  const nextOptions: IOptions = {
    async: !!options.async,
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: options.stdio || "inherit",
    timeout: options.timeout
  }

  const env = nextOptions.env

  // Include in PATH node_modules bin path
  if (env) {
    env.PATH = [binPath, env.PATH || process.env.PATH].join(path.delimiter)
  }

  logger.title(command)

  // Handle async call
  if (options.async) {
    return runAsync(command, nextOptions)
  }

  // Handle sync call by default
  return runSync(command, nextOptions)
}

/**
 * @deprecated
 */
export function option(thisObj: ITaskContext | null, name: string = ""): any {
  return (thisObj && thisObj.options && thisObj.options[name]) || null
}

export function options(thisObj: ITaskContext | null): object {
  return (thisObj && thisObj.options) || {}
}

export function help(func: ITaskFunction, annotation?: string | any) {
  // Because the validation above currently gets compiled out,
  // Explictly  validate the function input
  if (typeof func === "function") {
    func.help = annotation
  } else {
    throw new Error("first help() argument must be a function")
  }
}
