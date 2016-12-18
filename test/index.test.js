/* eslint-env jest */
import * as runjs from '../lib/index'

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

  describe('load()', () => {
    let requirer, access

    beforeEach(() => {
      requirer = jest.fn()
      access = jest.fn().mockReturnValue(true)
    })

    describe('when custom path to babel-register defined in config', () => {
      it('should raise an error if specified babel-register cannot be found', () => {
        requirer = jest.fn((mod) => {
          switch (mod) {
            case './package.json':
              return {runjs: {'babel-register': './custom/babel-register'}}
            case './custom/babel-register':
              throw new Error('Cannot find babel-register')
            default:
              throw new Error('Unexpected import')
          }
        })
        expect(() => {
          runjs.load('./runfile', logger, requirer, access)
        }).toThrowError('Cannot find babel-register')
      })

      it('should load specified babel-register', () => {
        requirer = jest.fn((mod) => {
          switch (mod) {
            case './package.json':
              return {runjs: {'babel-register': './custom/babel-register'}}
            case './custom/babel-register':
              return {}
            case './runfile':
              return {test: 1}
            default:
              throw new Error('Unexpected import')
          }
        })
        expect(runjs.load('./runfile', logger, requirer, access)).toEqual({test: 1})
      })
    })

    it('should load babel-register if found', () => {

    })

    it('should ignore babel-register load error if module not found', () => {

    })

    it('should raise an error if runfile.js cannot be found', () => {

    })

    it('should return runfile.js as a module if found', () => {

    })

    it('should return runfile module default context if found', () => {

    })
  })

  describe('call()', () => {
    let a, b, obj
    beforeEach(() => {
      a = jest.fn()
      b = jest.fn()
      obj = {
        a: a,
        b: b
      }
    })

    it('calls the method from a given object by given method name and its arguments', () => {
      runjs.call(obj, ['a'], logger)
      runjs.call(obj, ['b', '1', '2'], logger)
      expect(a).toHaveBeenCalled()
      expect(b).toHaveBeenCalledWith('1', '2')
    })

    it('should handle dash arguments', () => {

    })

    it('should call methods from nested objects by method name name-spacing', () => {

    })

    it('should raise an error if called method cannot be found', () => {
      expect(() => {
        runjs.call(obj, ['abc'], logger)
      }).toThrowError(('Task abc not found'))

      expect(() => {
        runjs.call(obj, ['abc'], logger)
      }).toThrowError(runjs.RunJSError)
    })

    it('should log execution time for called method with its arguments', () => {

    })

    describe('when method name not provided', () => {
      it('should log list of methods available in the object', () => {
        runjs.call(obj, [], logger)
        expect(logger.log).toHaveBeenCalledTimes(3)
        expect(logger.log).toHaveBeenCalledWith('Available tasks:')
        expect(logger.log).toHaveBeenCalledWith('a')
        expect(logger.log).toHaveBeenCalledWith('b')
      })

      it('should log list of methods from the object with description for each one if provided', () => {

      })
    })
  })

  describe('run()', () => {
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

  describe('ask()', () => {

  })
})
