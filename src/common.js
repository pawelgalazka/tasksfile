// Needed to use ES5 inheritance, because of issues with Error subclassing for Babel
export function RunJSError (message) {
  this.name = 'RunJSError'
  this.message = message.split('\n')[0] // assign only first line
}
RunJSError.prototype = Object.create(Error.prototype)
RunJSError.prototype.constructor = RunJSError
