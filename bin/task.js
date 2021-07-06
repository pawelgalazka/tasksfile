#!/usr/bin/env node
const { execSync } = require('child_process')
const path = require('path')
const packageJson = require(path.resolve('./package.json'))

const taskScript = packageJson.scripts.task

if (taskScript === undefined) {
  // prettier-ignore
  console.error('Mising \'task\' script in package.json.')
  console.error('Example (package.json, in `script`):\n')
  console.error('"task": "node ./tasksfile.js",')
  console.error('...')
  process.exit(1)
}

try {
  execSync(`${taskScript} ${process.argv.slice(2).join(' ')}`, {
    shell: true,
    stdio: 'inherit',
  })
} catch (error) {
  process.exit(1)
}
