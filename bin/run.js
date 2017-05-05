#!/usr/bin/env node
'use strict'
const script = require('../lib/script')
const api = require('../lib/index')
const common = require('../lib/common')

try {
  const config = script.config('./package.json')
  const runfile = script.load('./runfile', config, api.logger, script.requirer, script.hasAccess)
  const ARGV = process.argv.slice(2)

  if (ARGV.length) {
    script.call(runfile, ARGV)
  } else {
    script.describe(runfile, api.logger)
  }
} catch (error) {
  if (error instanceof common.RunJSError) {
    api.logger.error(error.message)
    process.exit(1)
  } else {
    throw error
  }
}
