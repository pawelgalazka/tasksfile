/* eslint-env jest */
import { execSync as orgExecSync } from 'child_process'

describe('tasksfile', () => {
  const scriptPath = '../../bin/task.js'
  function execSync(cmd: string) {
    return orgExecSync(cmd, {
      cwd: './test/sandbox',
      env: {
        ...process.env,
        FORCE_COLOR: '0'
      },
      stdio: 'pipe'
    }).toString()
  }

  it('executes simple task', () => {
    expect(execSync(`${scriptPath} echo 1 2 3 --foo --bar`)).toEqual(
      "echo [ { foo: true, bar: true }, '1', '2', '3' ]\n"
    )
  })

  it('executes shell commands in a task', () => {
    const output = execSync(`${scriptPath} shell`)
    expect(output).toContain(
      'echo "sync terminal"\nsync terminal\necho "sync silent"\noutput sync silent'
    )
    expect(output).toContain('\nasync terminal\n')
    expect(output).toContain('\noutput async silent\n')
  })

  it('executes task from a namespace', () => {
    expect(execSync(`${scriptPath} nested:echo 1 2 3 --foo --bar`)).toEqual(
      "nested echo [ { foo: true, bar: true }, '1', '2', '3' ]\n"
    )
  })

  it('executes default task from a namespace', () => {
    expect(execSync(`${scriptPath} nested 1 2 3 --foo --bar`)).toEqual(
      "nested default [ { foo: true, bar: true }, '1', '2', '3' ]\n"
    )
  })

  it('includes ./node_modules/.bin to PATH when executing bin scripts', () => {
    execSync('cp -p ./scripts/hello.js ./node_modules/.bin/hello')
    expect(execSync(`${scriptPath} npmBin`)).toEqual('hello\nHello!\n')
  })

  it('executes async/await task', () => {
    expect(execSync(`${scriptPath} asyncAwait`)).toContain(
      'echo "async and await"\noutput async and await\n\nafter await\n'
    )
  })

  it('displays help for a task', () => {
    expect(execSync(`${scriptPath} echo --help`)).toEqual(
      'Usage: echo  \n\nSimple echo task\n\n'
    )
  })

  it('displays detailed help', () => {
    expect(execSync(`${scriptPath} nested:echo --help`)).toEqual(
      'Usage: nested:echo [options] [p1 p2]\n\nDescription of nested task\n\n' +
        'Options:\n\n  --foo       foo option description\n' +
        '  --bar       bar option description\n'
    )
  })

  it('displays error from executed task', () => {
    expect(() => execSync(`${scriptPath} error`)).toThrow(
      `Command failed: ${scriptPath} error`
    )
  })

  it('displays error from executed async task', () => {
    expect(() => execSync(`${scriptPath} errorAsyncAwait`)).toThrow(
      `Command failed: ${scriptPath} errorAsyncAwait`
    )
  })

  it('displays commands list if only --help option provided and no task name', () => {
    expect(execSync(`${scriptPath} --help`)).toMatchSnapshot()
  })
})
