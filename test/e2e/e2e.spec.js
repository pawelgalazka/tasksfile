/* eslint-env jest */
const { execSync } = require('child_process')

describe('runjs', () => {
  let cwd

  function sh (cmd) {
    return execSync(cmd, { cwd, stdio: 'pipe' }).toString()
  }

  describe('with babel transpiler', () => {
    beforeAll(() => {
      cwd = './test/e2e/sandbox/babel'
      sh('yarn')
      sh('rm -f ./node_modules/runjs')
      sh('ln -s ../../../../../ ./node_modules/runjs')
    })

    it('executes simple task', () => {
      expect(sh('../../../../bin/run.js echo 1 2 3 --foo --bar'))
        .toContain("echo [ '1', '2', '3' ] { foo: true, bar: true }")
    })

    it.skip('executes shell commands in a task', () => {
      expect(sh('../../../../bin/run.js commands'))
        .toContain(
          'echo "sync terminal"\nsync terminal\necho "sync pipe"\noutput sync pipe\n\n' +
          'echo "async terminal"\necho "async terminal"\nasync terminal\noutput async terminal')
    })

    it('executes name spaced tasks', () => {
      expect(sh('../../../../bin/run.js nested:echo 1 2 3 --foo --bar'))
        .toContain("echo [ '1', '2', '3' ] { foo: true, bar: true }")
    })

    it('includes ./node_modules/.bin to PATH when executing commands', () => {
      sh('cp -p ../../scripts/hello.js ./node_modules/.bin/hello')
      expect(sh('../../../../bin/run.js localbin')).toContain('Hello!')
    })

    it('executes tasks with async and await', () => {
      expect(sh('../../../../bin/run.js asyncawait'))
        .toContain('echo "async and await"\noutput async and await\n\nafter await')
    })

    it('displays help for a task', () => {
      expect(sh('../../../../bin/run.js echo --help'))
        .toContain('Simple echo task')
    })

    it('displays error from executed command', () => {
      expect(() => sh('../../../../bin/run.js error'))
        .toThrow('Command failed: ../../../../bin/run.js error')
    })
  })

  describe('with typescript transpiler', () => {
    beforeAll(() => {
      cwd = './test/e2e/sandbox/typescript'
      sh('yarn')
      sh('rm -f ./node_modules/runjs')
      sh('ln -s ../../../../../ ./node_modules/runjs')
    })

    it.skip('executes simple task', () => {
      expect(sh('../../../../bin/run.js echo 1 2 3 --foo --bar'))
        .toContain("echo [ '1', '2', '3' ] { foo: true, bar: true }")
    })

    it('executes shell commands in a task', () => {
      expect(sh('../../../../bin/run.js commands'))
        .toContain(
          'echo "sync terminal"\nsync terminal\necho "sync pipe"\noutput sync pipe\n\n' +
          'echo "async terminal"\necho "async terminal"\nasync terminal\noutput async terminal')
    })

    it('executes name spaced tasks', () => {
      expect(sh('../../../../bin/run.js nested:echo 1 2 3 --foo --bar'))
        .toContain("echo [ '1', '2', '3' ] { foo: true, bar: true }")
    })

    it('includes ./node_modules/.bin to PATH when executing commands', () => {
      sh('cp -p ../../scripts/hello.js ./node_modules/.bin/hello')
      expect(sh('../../../../bin/run.js localbin')).toContain('Hello!')
    })

    it('executes tasks with async and await', () => {
      expect(sh('../../../../bin/run.js asyncawait'))
        .toContain('echo "async and await"\noutput async and await\n\nafter await')
    })

    it('displays error from executed command', () => {
      expect(() => sh('../../../../bin/run.js error'))
        .toThrow('Command failed: ../../../../bin/run.js error')
    })
  })
})
