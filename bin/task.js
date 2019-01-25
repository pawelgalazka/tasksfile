#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const SCRIPT_API_PATH = './node_modules/tasksfile/lib/script.js'

try {
  fs.accessSync(path.resolve(SCRIPT_API_PATH))
} catch (error) {
  console.error(
    'Tasksfile not found. Do "npm install tasks --save-dev" or "yarn add --dev tasksfile" first.'
  )
  process.exit(1)
}

const script = require(path.resolve(SCRIPT_API_PATH))

script.main()
