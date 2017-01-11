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
  const ARGV = process.argv.slice(2)

  if (ARGV.length) {
    script.call(runfile, ARGV, api.logger)
  } else {
    script.describe(runfile, api.logger)
  }
} catch (error) {
  if (error instanceof script.RunJSError) {
    api.logger.error(error.message)
    process.exit(1)
  } else {
    throw error
  }
}
