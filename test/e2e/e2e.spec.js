/* eslint-env jest */
const { execSync } = require('child_process')

describe('runjs', () => {
  let cwd

  function sh (cmd) {
    return execSync(cmd, { cwd, stdio: 'inherit' })
  }

  describe('with babel transpiler', () => {
    beforeAll(() => {
      cwd = './test/e2e/sandbox/babel'
      sh('yarn')
      sh('rm -f ./node_modules/runjs')
      sh('ln -s ../../../../../ ./node_modules/runjs')
    })

    it('executes simple task', () => {
      sh('../../../../bin/run.js echo 1 2 3 --foo --bar')
    })

    it('executes shell commands in a task', () => {
      sh('../../../../bin/run.js commands')
    })

    it('executes name spaced tasks', () => {
      sh('../../../../bin/run.js nested:echo 1 2 3 --foo --bar')
    })

    it('executes tasks with async and await', () => {
      sh('../../../../bin/run.js asyncawait')
    })
  })

  describe('with typescript transpiler', () => {
    beforeAll(() => {
      cwd = './test/e2e/sandbox/typescript'
      sh('yarn')
      sh('rm -f ./node_modules/runjs')
      sh('ln -s ../../../../../ ./node_modules/runjs')
    })

    it('executes simple task', () => {
      sh('../../../../bin/run.js echo 1 2 3 --foo --bar')
    })

    it('executes shell commands in a task', () => {
      sh('../../../../bin/run.js commands')
    })

    it('executes name spaced tasks', () => {
      sh('../../../../bin/run.js nested:echo 1 2 3 --foo --bar')
    })

    it('executes tasks with async and await', () => {
      sh('../../../../bin/run.js asyncawait')
    })
  })
})
