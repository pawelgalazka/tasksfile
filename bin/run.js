#!/usr/bin/env node

const api = require('../lib/index')
const runfile = api.load('./runfile')
api.call(runfile, process.argv.slice(2))
