import { execSync, spawn } from 'child_process'
import { EventEmitter } from 'events'
import * as api from '../../src/index'
import { ShellError } from '../../src/shell'

const execSyncMock: any = execSync
const spawnMock: any = spawn

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}))

process.env = { TASKSFILE_TEST: 'tasksfile test' }

describe('api', () => {
  let logger: any
  let spawnProcessMock: any

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      title: jest.fn(),
      warning: jest.fn()
    }
  })

  describe('run()', () => {
    beforeEach(() => {
      execSyncMock.mockReset()
      spawnMock.mockReset()
      execSyncMock.mockReturnValue('output')
      spawnProcessMock = new EventEmitter()
      spawnProcessMock.stdout = new EventEmitter()
      spawnMock.mockReturnValue(spawnProcessMock)
    })

    describe('sync version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', () => {
          const output = api.run('echo "echo test"', { stdio: 'pipe' }, logger)
          expect(execSyncMock.mock.calls[0][0]).toEqual('echo "echo test"')
          expect(execSyncMock.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
          expect(output).toEqual('output')
          expect(logger.title).toHaveBeenCalledWith('echo "echo test"')
        })

        it('should throw an error if command fails', () => {
          execSyncMock.mockImplementation(() => {
            throw new Error('test')
          })
          expect(() => {
            api.run('node ./ghost.js', { stdio: 'pipe' }, logger)
          }).toThrow(ShellError)
        })

        it('should have access to environment variables by default', () => {
          api.run('cli-command', { stdio: 'pipe' }, logger)
          expect(execSyncMock.mock.calls[0][1].env).toHaveProperty(
            'TASKSFILE_TEST',
            'tasksfile test'
          )
        })

        it('should include in PATH node_modules/.bin', () => {
          api.run('cli-command', { stdio: 'pipe' }, logger)
          expect(execSyncMock.mock.calls[0][1].env.PATH).toContain(
            'node_modules/.bin'
          )
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', () => {
          api.run('cli-command', {}, logger)
          expect(execSyncMock.mock.calls[0][0]).toEqual('cli-command')
          expect(execSyncMock.mock.calls[0][1]).toHaveProperty(
            'stdio',
            'inherit'
          )
          expect(logger.title).toHaveBeenCalledWith('cli-command')
        })
      })
    })

    describe('async version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', () => {
          const runProcess = api
            .run('cli-cmd', { async: true, stdio: 'pipe' }, logger)
            .then(output => {
              expect(spawnMock.mock.calls[0][0]).toEqual('cli-cmd')
              expect(spawnMock.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
              expect(output).toEqual('output')
              expect(logger.title).toHaveBeenCalledWith('cli-cmd')
            })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })

        it('should have access to environment variables by default', () => {
          const runProcess = api
            .run('cli-cmd', { async: true, stdio: 'pipe' }, logger)
            .then(() => {
              expect(spawnMock.mock.calls[0][1].env).toHaveProperty(
                'TASKSFILE_TEST',
                'tasksfile test'
              )
            })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })

        it('should reject with an error if command fails', () => {
          const runProcess = api.run(
            'cli-cmd',
            { async: true, stdio: 'pipe' },
            logger
          )
          spawnProcessMock.emit('close', 1)
          return expect(runProcess).rejects.toHaveProperty(
            'message',
            'Command failed: cli-cmd with exit code 1'
          )
        })

        it('should include in PATH node_modules/.bin', () => {
          const runProcess = api
            .run('cli-cmd', { async: true, stdio: 'pipe' }, logger)
            .then(() => {
              expect(spawnMock.mock.calls[0][1].env.PATH).toContain(
                'node_modules/.bin'
              )
            })
          spawnProcessMock.stdout.emit('data', 'output')
          spawnProcessMock.emit('close', 0)
          return runProcess
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', () => {
          const runProcess = api
            .run('cli-cmd', { async: true, stdio: 'inherit' }, logger)
            .then(output => {
              expect(spawnMock.mock.calls[0][0]).toEqual('cli-cmd')
              expect(spawnMock.mock.calls[0][1]).toHaveProperty(
                'stdio',
                'inherit'
              )
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

  describe('options()', () => {
    let thisStub: any

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

  describe('help()', () => {
    it('throws an error if first argument is not a function', () => {
      expect(() => api.help(undefined as any)).toThrow(
        'first help() argument must be a function'
      )
    })
  })
})
