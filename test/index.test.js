/* eslint-env jest */
import * as api from '../lib/index'
import { RunJSError } from '../lib/common'

describe('api', () => {
  let logger

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    }
  })

  describe('run()', () => {
    it('should execute basic shell commands when sync mode', () => {
      const output = api.run('echo "echo test"', {cwd: './test/sandbox'}, logger)
      expect(output).toEqual('echo test\n')
      expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
    })

    it('should execute basic shell commands when async mode', (done) => {
      api.run('echo "echo test"', {async: true}, logger).then((output) => {
        expect(output).toEqual('echo test\n')
        expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
        done()
      })
    })

    it('should throw an error if command fails', () => {
      expect(() => {
        api.run('node ./ghost.js', {stdio: 'pipe'}, logger)
      }).toThrow(RunJSError)
    })
  })

  describe('ask()', () => {

  })
})
