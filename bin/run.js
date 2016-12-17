#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const api = require('../lib/index')

try {
  const runfile = api.load('./runfile', api.logger, function (filePath) {
    return require(path.resolve(filePath))
  }, function (filePath) {
    return fs.accessSync(path.resolve(filePath))
  })
  api.call(runfile, process.argv.slice(2), api.logger)
} catch (error) {
  if (error instanceof api.RunJSError) {
    api.logger.error(error.message)
    process.exit(1)
  } else {
    throw error
  }
}
