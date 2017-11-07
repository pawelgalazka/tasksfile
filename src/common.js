// @flow
const chalk = require('chalk')

// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
class RunJSError extends Error {
  constructor(message: string) {
    message = message && message.split('\n')[0] // assign only first line
    super(message)
  }
}

interface ILogger {
  title(args: Array<any>): void;
  log(args: Array<any>): void;
  warning(args: Array<any>): void;
  error(args: Array<any>): void;
}

class Logger implements ILogger {
  title(...args: Array<any>) {
    console.log(chalk.bold(...args))
  }
  log(...args: Array<any>) {
    console.log(...args)
  }
  warning(...args: Array<any>) {
    console.warn(chalk.yellow(...args))
  }
  error(...args: Array<any>) {
    console.error(chalk.red(...args))
  }
}

class SilentLogger implements ILogger {
  title() {}
  log() {}
  warning() {}
  error() {}
}

const logger = new Logger()

module.exports = {
  RunJSError,
  logger,
  Logger,
  SilentLogger
}
