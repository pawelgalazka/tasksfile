/* eslint-env jest */
import * as api from '../lib/index'

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
    })

    it('should execute basic shell commands when async mode', (done) => {
      api.run('echo "echo test"', {async: true}, logger).then((output) => {
        expect(output).toEqual('echo test\n')
        done()
      })
    })
  })

  describe('ask()', () => {

  })
})
