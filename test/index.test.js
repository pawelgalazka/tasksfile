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
    describe('sync version', () => {
      it('should execute basic shell commands', () => {
        const output = api.run('echo "echo test"', {cwd: './test/sandbox'}, logger)
        expect(output).toEqual('echo test\n')
        expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
      })

      it('should throw an error if command fails', () => {
        expect(() => {
          api.run('node ./ghost.js', {stdio: 'pipe'}, logger)
        }).toThrow(RunJSError)
      })
    })

    describe('async version', () => {
      it('should execute basic shell commands', (done) => {
        api.run('echo "echo test"', {async: true}, logger).then((output) => {
          expect(output).toEqual('echo test\n')
          expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
          done()
        })
      })
    })
  })

  describe('ask()', () => {

  })
})
