#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const packageJson = require(path.resolve('./package.json'))

const taskScript = packageJson.scripts.task

try {
  execSync(`${taskScript} ${process.argv.slice(2).join(' ')}`, {shell: true, stdio: 'inherit'})
} catch (error) {
  process.exit(1)
}
