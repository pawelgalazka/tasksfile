/* eslint-env jest */
const api = require('../src/index')
const { RunJSError } = require('../src/common')
const { execSync, spawn } = require('child_process')
const { EventEmitter } = require('events')

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}))

process.env = {RUNJS_TEST: 'runjs test'}

describe('api', () => {
  let logger, spawnProcessMock

  beforeEach(() => {
    logger = {
      title: jest.fn(),
      log: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    }
  })

  describe('run()', () => {
    beforeEach(() => {
      execSync.mockReset()
      spawn.mockReset()
      execSync.mockReturnValue('output')
      spawnProcessMock = new EventEmitter()
      spawnProcessMock.stdout = new EventEmitter()
      spawn.mockReturnValue(spawnProcessMock)
    })

    describe('sync version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', () => {
          const output = api.run('echo "echo test"', {stdio: 'pipe'}, logger)
          expect(execSync.mock.calls[0][0]).toEqual('echo "echo test"')
          expect(execSync.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
          expect(output).toEqual('output')
          expect(logger.title).toHaveBeenCalledWith('echo "echo test"')
        })

        it('should throw an error if command fails', () => {
          execSync.mockImplementation(() => { throw new Error('test') })
          expect(() => {
            api.run('node ./ghost.js', {stdio: 'pipe'}, logger)
          }).toThrow(RunJSError)
        })

        it('should have access to environment variables by default', () => {
          api.run('cli-command', {stdio: 'pipe'}, logger)
          expect(execSync.mock.calls[0][1].env).toHaveProperty('RUNJS_TEST', 'runjs test')
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', () => {
          api.run('cli-command', {}, logger)
          expect(execSync.mock.calls[0][0]).toEqual('cli-command')
          expect(execSync.mock.calls[0][1]).toHaveProperty('stdio', 'inherit')
          expect(logger.title).toHaveBeenCalledWith('cli-command')
        })
      })
    })

    describe('async version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', () => {
          const runProcess = api.run('cli-cmd', {async: true, stdio: 'pipe'}, logger).then((output) => {
            expect(spawn.mock.calls[0][0]).toEqual('cli-cmd')
            expect(spawn.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
            expect(output).toEqual('output')
            expect(logger.title).toHaveBeenCalledWith('cli-cmd')
          })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })

        it('should have access to environment variables by default', () => {
          const runProcess = api.run('cli-cmd', {async: true, stdio: 'pipe'}, logger).then(() => {
            expect(spawn.mock.calls[0][1].env).toHaveProperty('RUNJS_TEST', 'runjs test')
          })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })

        it('should reject with an error if command fails', () => {
          const runProcess = api.run('cli-cmd', {async: true, stdio: 'pipe'}, logger)
          spawnProcessMock.emit('close', 1)
          return expect(runProcess).rejects.toHaveProperty('message', 'Command failed: cli-cmd with exit code 1')
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', () => {
          const runProcess = api.run('cli-cmd', {async: true, stdio: 'inherit'}, logger).then((output) => {
            expect(spawn.mock.calls[0][0]).toEqual('cli-cmd')
            expect(spawn.mock.calls[0][1]).toHaveProperty('stdio', 'inherit')
            expect(output).toEqual(null)
            expect(logger.title).toHaveBeenCalledWith('cli-cmd')
          })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })
      })
    })
  })

  describe('option()', () => {
    let thisStub

    beforeEach(() => {
      thisStub = {
        options: {
          test: 'abcdef'
        }
      }
    })

    it('should return option value from a given possible "this" object of a task function', () => {
      expect(api.option(thisStub, 'test')).toEqual('abcdef')
    })

    it('should return null if no option name given', () => {
      expect(api.option(thisStub)).toBe(null)
    })

    it('should return null if option not found', () => {
      expect(api.option(thisStub, 'ghost')).toBe(null)
      expect(api.option(null, 'ghost')).toBe(null)
      expect(api.option({}, 'ghost')).toBe(null)
    })
  })

  describe('options()', () => {
    let thisStub

    beforeEach(() => {
      thisStub = {
        options: {
          test: 'abcdef'
        }
      }
    })

    it('returns options object', () => {
      expect(api.options(thisStub)).toEqual(thisStub.options)
    })

    it('returns empty object if options not found', () => {
      expect(api.options(null)).toEqual({})
      expect(api.options({})).toEqual({})
    })
  })
})
