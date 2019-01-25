// @flow
import chalk from "chalk"
import padEnd from "lodash.padend"
import microcli from "microcli"

const CLIError = microcli.CliError

import { ILogger, logger, Logger, TasksfileError } from "./common"

export function describe(obj: any, logger: Logger, namespace?: string) {
  if (!namespace) {
    logger.log(chalk.yellow("Available tasks:"))
  }

  Object.keys(obj).forEach(key => {
    const value = obj[key]
    const nextNamespace = namespace ? `${namespace}:${key}` : key
    const help = value.help

    if (typeof value === "function") {
      // Add task name
      const funcParams = help && help.params
      const logArgs = [chalk.bold(nextNamespace)]

      // Add task params
      if (Array.isArray(funcParams) && funcParams.length) {
        logArgs[0] += ` [${funcParams.join(" ")}]`
      }

      // Add description
      if (help && (help.description || typeof help === "string")) {
        const description = help.description || help
        logArgs[0] = padEnd(logArgs[0], 40) // format
        logArgs.push("-", description.split("\n")[0])
      }

      // Log
      logger.log(...logArgs)
    } else if (typeof value === "object") {
      describe(value, logger, nextNamespace)
    }
  })

  if (!namespace) {
    logger.log(
      "\n" +
        chalk.blue(
          'Type "task [taskname] --help" to get more info if available.'
        )
    )
  }
}

export function call(
  obj: any,
  args: string[],
  logger?: ILogger,
  subtaskName?: string
) {
  const taskName = subtaskName || args[2]

  if (typeof obj[taskName] === "function") {
    const cli = microcli(
      args.slice(1),
      obj[taskName].help,
      undefined,
      logger as any
    )

    cli((options, ...params) => {
      obj[taskName].apply({ options }, params)
    })
    return obj[taskName]
  }

  const namespaces = taskName.split(":")
  const rootNamespace = namespaces.shift() || ""
  const nextSubtaskName = namespaces.join(":")

  if (obj[rootNamespace]) {
    const calledTask: any = call(
      obj[rootNamespace],
      args,
      logger,
      nextSubtaskName
    )
    if (calledTask) {
      return calledTask
    }
  }

  if (!subtaskName) {
    throw new TasksfileError(`Task ${taskName} not found`)
  }
}

export function cli(tasksfile: any) {
  try {
    const ARGV = process.argv.slice()

    if (ARGV.length > 2) {
      call(tasksfile, ARGV, logger)
    } else {
      describe(tasksfile, logger)
    }
  } catch (error) {
    if (error instanceof TasksfileError || error instanceof CLIError) {
      logger.error(error.message)
      process.exit(1)
    } else {
      logger.log(error)
      process.exit(1)
    }
  }
}
