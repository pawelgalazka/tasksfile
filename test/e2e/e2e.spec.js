/* eslint-env jest */
const { execSync } = require('child_process')

describe('runjs', () => {
  function sh(cmd) {
    return execSync(cmd, {
      cwd: './test/e2e/sandbox',
      stdio: 'pipe'
    }).toString()
  }

  it('executes simple task', () => {
    expect(sh('../../../bin/run.js echo 1 2 3 --foo --bar')).toContain(
      "echo [ '1', '2', '3' ] { foo: true, bar: true }"
    )
  })

  it('executes shell commands in a task', () => {
    const output = sh('../../../bin/run.js commands')
    expect(output).toContain(
      'echo "sync terminal"\nsync terminal\necho "sync pipe"\noutput sync pipe'
    )
    expect(output).toContain('\nasync terminal\n')
    expect(output).toContain('\noutput async terminal\n')
  })

  it('executes name spaced tasks', () => {
    expect(sh('../../../bin/run.js nested:echo 1 2 3 --foo --bar')).toContain(
      "echo [ '1', '2', '3' ] { foo: true, bar: true }"
    )
  })

  it('includes ./node_modules/.bin to PATH when executing commands', () => {
    sh('cp -p ../scripts/hello.js ./node_modules/.bin/hello')
    expect(sh('../../../bin/run.js localbin')).toContain('Hello!')
  })

  it('executes tasks with async and await', () => {
    expect(sh('../../../bin/run.js asyncawait')).toContain(
      'echo "async and await"\noutput async and await\n\nafter await'
    )
  })

  it('displays help for a task', () => {
    expect(sh('../../../bin/run.js echo --help')).toContain('Simple echo task')
  })

  it('sorts list of tasks', () => {
    expect(sh('../../../bin/run.js')).toEqual(
      expect.stringMatching(/asyncawait[^]+color[^]+echo[^]+error[^]+nested/)
    )
  })

  it('displays error from executed command', () => {
    expect(() => sh('../../../bin/run.js error')).toThrow(
      'Command failed: ../../../bin/run.js error'
    )
  })
})
