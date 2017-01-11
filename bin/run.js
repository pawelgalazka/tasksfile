#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const script = require('../lib/script')
const api = require('../lib/index')

try {
  const runfile = script.load('./runfile', api.logger, function (filePath) {
    return require(path.resolve(filePath))
  }, function (filePath) {
    return fs.accessSync(path.resolve(filePath))
  })
  script.call(runfile, process.argv.slice(2), api.logger)
} catch (error) {
  if (error instanceof script.RunJSError) {
    api.logger.error(error.message)
    process.exit(1)
  } else {
    throw error
  }
}
