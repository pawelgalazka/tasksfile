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

    it('executes runjs tasks', () => {
      sh('../../../../bin/run.js echo 1 2 3')
      sh('../../../../bin/run.js testapi')
      sh('../../../../bin/run.js testasyncawait')
      sh('../../../../bin/run.js n1:nested1')
      sh('../../../../bin/run.js n1:nested2:echo')
    })
  })

  describe('with typescript transpiler', () => {
    beforeAll(() => {
      cwd = './test/e2e/sandbox/typescript'
      sh('yarn')
      sh('rm -f ./node_modules/runjs')
      sh('ln -s ../../../../../ ./node_modules/runjs')
    })

    it('executes runjs tasks', () => {
      sh('../../../../bin/run.js echo 1 2 3')
      sh('../../../../bin/run.js testapi')
      sh('../../../../bin/run.js testasyncawait')
      sh('../../../../bin/run.js n1:nested1')
      sh('../../../../bin/run.js n1:nested2:echo')
    })
  })
})
