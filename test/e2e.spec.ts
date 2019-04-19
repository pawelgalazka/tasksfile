/* eslint-env jest */
import { execSync } from 'child_process'

describe('tasksfile', () => {
  const scriptPath = '../../bin/task.js'
  function sh(cmd: string) {
    return execSync(cmd, {
      cwd: './test/sandbox',
      env: {
        ...process.env,
        FORCE_COLOR: '0'
      },
      stdio: 'pipe'
    }).toString()
  }

  it('executes simple task', () => {
    expect(sh(`${scriptPath} echo 1 2 3 --foo --bar`)).toContain(
      "echo [ { foo: true, bar: true }, '1', '2', '3' ]\n"
    )
  })

  it('executes shell commands in a task', () => {
    const output = sh(`${scriptPath} commands`)
    expect(output).toContain(
      'echo "sync terminal"\nsync terminal\necho "sync pipe"\noutput sync pipe'
    )
    expect(output).toContain('\nasync terminal\n')
    expect(output).toContain('\noutput async terminal\n')
  })

  it('executes name spaced tasks', () => {
    expect(sh(`${scriptPath} nested:echo 1 2 3 --foo --bar`)).toContain(
      "echo [ { foo: true, bar: true }, '1', '2', '3' ]\n"
    )
  })

  it('includes ./node_modules/.bin to PATH when executing commands', () => {
    sh('cp -p ./scripts/hello.js ./node_modules/.bin/hello')
    expect(sh(`${scriptPath} localbin`)).toContain('Hello!')
  })

  it('executes tasks with async and await', () => {
    expect(sh(`${scriptPath} asyncawait`)).toContain(
      'echo "async and await"\noutput async and await\n\nafter await\n'
    )
  })

  it('displays help for a task', () => {
    expect(sh(`${scriptPath} echo --help`)).toContain('Simple echo task')
  })

  it('displays error from executed command', () => {
    expect(() => sh(`${scriptPath} error`)).toThrow(
      `Command failed: ${scriptPath} error`
    )
  })
})
