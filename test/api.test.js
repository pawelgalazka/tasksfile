/* eslint-env jest */
import * as runjs from '../lib/index'
import chalk from 'chalk'

describe('api', () => {
  let logger

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      info: jest.fn()
    }
  })

  describe('.call()', () => {
    let a, b, obj
    beforeEach(() => {
      a = jest.fn()
      b = jest.fn()
      obj = {
        a: a,
        b: b
      }
    })

    it('should call method with given name on given object', () => {
      runjs.call(obj, ['a'], logger)
      expect(a).toHaveBeenCalled()
    })

    it('should call method with given name on given object with given arguments', () => {
      runjs.call(obj, ['b', '1', '2'], logger)
      expect(b).toHaveBeenCalledWith('1', '2')
    })

    it('should print list of all methods available in object if method name not given', () => {
      runjs.call(obj, [], logger)
      expect(logger.log).toHaveBeenCalledTimes(3)
      expect(logger.log).toHaveBeenCalledWith('Available tasks:')
      expect(logger.log).toHaveBeenCalledWith('a')
      expect(logger.log).toHaveBeenCalledWith('b')
    })

    it('should print error message if method not exist on given object', () => {
      runjs.call(obj, ['abc'], logger)
      expect(logger.log).toHaveBeenCalledTimes(1)
      expect(logger.log).toHaveBeenCalledWith(chalk.red('Task abc not found'))
    })

    it('should look for tasks in obj.default if available', () => {
      obj = {
        'default': {
          a: a,
          b: b
        }
      }

      runjs.call(obj, ['a'], logger)
      expect(a).toHaveBeenCalled()
    })
  })

  describe('.run()', () => {
    it('should execute basic shell commands when sync mode', () => {
      const output = runjs.run('echo "echo test"', {stdio: 'pipe', cwd: './test/sandbox'}, logger).toString()
      expect(output).toEqual('echo test\n')
    })

    it('should execute basic shell commands when async mode', (done) => {
      runjs.run('echo "echo test"', {async: true}, logger).then((output) => {
        output = output.toString()
        expect(output).toEqual('echo test\n')
        done()
      })
    })
  })
})
