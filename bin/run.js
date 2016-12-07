#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const api = require('../lib/index')

const runfile = api.load('./runfile', api.logger, function (filePath) {
  return require(path.resolve(filePath))
}, function (filePath) {
  fs.accessSync(path.resolve(filePath))
}, function (code) {
  code = code || 0
  process.exit(code)
})

api.call(runfile, process.argv.slice(2), api.logger)
