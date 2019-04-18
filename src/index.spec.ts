import { ShellError } from '@pawelgalazka/shell'
import chalk from 'chalk'
import { execSync, spawn } from 'child_process'
import { EventEmitter } from 'events'
import * as api from './index'

const execSyncMock: any = execSync
const spawnMock: any = spawn

jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn()
}))

process.env = { TASKSFILE_TEST: 'tasksfile test' }

describe('sh()', () => {
  let logger: any
  let spawnProcessMock: any

  beforeEach(() => {
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      title: jest.fn(),
      warning: jest.fn()
    }
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
        const output = api.sh('echo "echo test"', { stdio: 'pipe' }, logger)
        expect(execSyncMock.mock.calls[0][0]).toEqual('echo "echo test"')
        expect(execSyncMock.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
        expect(output).toEqual('output')
        expect(logger.log).toHaveBeenCalledWith(chalk.bold('echo "echo test"'))
      })

      it('should throw an error if command fails', () => {
        execSyncMock.mockImplementation(() => {
          throw new Error('test')
        })
        expect(() => {
          api.sh('node ./ghost.js', { stdio: 'pipe' }, logger)
        }).toThrow(ShellError)
      })

      it('should have access to environment variables by default', () => {
        api.sh('cli-command', { stdio: 'pipe' }, logger)
        expect(execSyncMock.mock.calls[0][1].env).toHaveProperty(
          'TASKSFILE_TEST',
          'tasksfile test'
        )
      })

      it('should include in PATH node_modules/.bin', () => {
        api.sh('cli-command', { stdio: 'pipe' }, logger)
        expect(execSyncMock.mock.calls[0][1].env.PATH).toContain(
          'node_modules/.bin'
        )
      })
    })

    describe('with stdio=inherit', () => {
      it('should execute basic shell commands', () => {
        api.sh('cli-command', {}, logger)
        expect(execSyncMock.mock.calls[0][0]).toEqual('cli-command')
        expect(execSyncMock.mock.calls[0][1]).toHaveProperty('stdio', 'inherit')
        expect(logger.log).toHaveBeenCalledWith(chalk.bold('cli-command'))
      })
    })
  })

  describe('async version', () => {
    describe('with stdio=pipe', () => {
      it('should execute basic shell commands', () => {
        const runProcess = api
          .sh('cli-cmd', { async: true, stdio: 'pipe' }, logger)
          .then(output => {
            expect(spawnMock.mock.calls[0][0]).toEqual('cli-cmd')
            expect(spawnMock.mock.calls[0][1]).toHaveProperty('stdio', 'pipe')
            expect(output).toEqual('output')
            expect(logger.log).toHaveBeenCalledWith(chalk.bold('cli-cmd'))
          })
        spawnProcessMock.stdout.emit('data', 'output')
        spawnProcessMock.emit('close', 0)
        return runProcess
      })

      it('should have access to environment variables by default', () => {
        const runProcess = api
          .sh('cli-cmd', { async: true, stdio: 'pipe' }, logger)
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
        const runProcess = api.sh(
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
          .sh('cli-cmd', { async: true, stdio: 'pipe' }, logger)
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
          .sh('cli-cmd', { async: true, stdio: 'inherit' }, logger)
          .then(output => {
            expect(spawnMock.mock.calls[0][0]).toEqual('cli-cmd')
            expect(spawnMock.mock.calls[0][1]).toHaveProperty(
              'stdio',
              'inherit'
            )
            expect(output).toEqual(null)
            expect(logger.log).toHaveBeenCalledWith(chalk.bold('cli-cmd'))
          })
        spawnProcessMock.stdout.emit('data', 'output')
        spawnProcessMock.emit('close', 0)
        return runProcess
      })
    })
  })
})
