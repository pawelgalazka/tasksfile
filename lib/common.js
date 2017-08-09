const chalk = require('chalk')

// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
function RunJSError (message) {
  this.name = 'RunJSError'
  this.message = message && message.split('\n')[0] // assign only first line
}
RunJSError.prototype = Object.create(Error.prototype)
RunJSError.prototype.constructor = RunJSError

const logger = {
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

module.exports = {
  RunJSError,
  logger
}
