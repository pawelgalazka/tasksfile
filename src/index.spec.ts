import { shell } from '@pawelgalazka/shell'
import chalk from 'chalk'

import { sh } from './index'

const shellMock = shell as jest.Mock

jest.mock('@pawelgalazka/shell')

process.env = { TASKSFILE_TEST: 'tasksfile test' }

describe('sh()', () => {
  let logger: any

  beforeEach(() => {
    jest.resetAllMocks()
    logger = {
      error: jest.fn(),
      log: jest.fn(),
      title: jest.fn(),
      warning: jest.fn()
    }
  })

  it('calls original @pawelgalazka/shell function with the same command', () => {
    sh('test command', undefined, logger)
    expect(shellMock).toHaveBeenCalledTimes(1)
    expect(shellMock).toHaveBeenCalledWith('test command', expect.anything())
  })

  it('logs executed command', () => {
    sh('test command', undefined, logger)
    expect(logger.log).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(chalk.bold('test command'))
  })

  it('calls original @pawelgalazka/shell with default options values', () => {
    sh('test command', undefined, logger)
    expect(shellMock).toHaveBeenCalledTimes(1)
    expect(shellMock).toHaveBeenCalledWith(expect.anything(), {
      async: false,
      cwd: undefined,
      env: {
        PATH: expect.anything(),
        TASKSFILE_TEST: 'tasksfile test'
      },
      stdio: 'inherit',
      timeout: undefined
    })
  })

  it('calls original @pawelgalazka/shell with given options values', () => {
    sh(
      'test command',
      { async: true, cwd: 'cwd-dir', stdio: 'pipe', timeout: 1000 },
      logger
    )
    expect(shellMock).toHaveBeenCalledTimes(1)
    expect(shellMock).toHaveBeenCalledWith(expect.anything(), {
      async: true,
      cwd: 'cwd-dir',
      env: {
        PATH: expect.anything(),
        TASKSFILE_TEST: 'tasksfile test'
      },
      stdio: 'pipe',
      timeout: 1000
    })
  })
})
