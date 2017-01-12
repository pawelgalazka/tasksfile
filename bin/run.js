#!/usr/bin/env node
'use strict'
const script = require('../lib/script')
const api = require('../lib/index')

try {
  const runfile = script.load('./runfile', api.logger, script.requirer, script.hasAccess)
  const ARGV = process.argv.slice(2)

  if (ARGV.length) {
    let decoratedRunfile = script.decorate(runfile, api.logger)
    script.call(decoratedRunfile, ARGV)
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
