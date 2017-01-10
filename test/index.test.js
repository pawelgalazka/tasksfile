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
              return {}
            default:
              throw new Error('Unexpected import')
          }
        })
        runjs.load('./runfile', logger, requirer, access)
        expect(requirer).toHaveBeenCalledWith('./custom/babel-register')
      })
    })

    it('should load babel-register if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './package.json':
            return {}
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {}
          default:
            throw new Error('Unexpected import')
        }
      })
      runjs.load('./runfile', logger, requirer, access)
      expect(requirer).toHaveBeenCalledWith('./node_modules/babel-register')
    })

    it('should ignore babel-register load error if module not found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './package.json':
            return {}
          case './node_modules/babel-register':
            throw new Error('babel-register not found')
          case './runfile':
            return {test: 1}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(runjs.load('./runfile', logger, requirer, access)).toEqual({test: 1})
    })

    it('should raise an error if runfile.js cannot be found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './package.json':
            return {}
          case './node_modules/babel-register':
            return {}
          default:
            throw new Error('Unexpected import')
        }
      })
      access = jest.fn(() => { throw new Error('No access') })
      expect(() => {
        runjs.load('./runfile', logger, requirer, access)
      }).toThrowError(runjs.RunJSError)
      expect(() => {
        runjs.load('./runfile', logger, requirer, access)
      }).toThrowError(/^No \.\/runfile\.js defined in/)
    })

    it('should return runfile.js as a module if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './package.json':
            return {}
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {test: 1}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(runjs.load('./runfile', logger, requirer, access)).toEqual({test: 1})
    })

    it('should return runfile module default context if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './package.json':
            return {}
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {default: {test: 1}}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(runjs.load('./runfile', logger, requirer, access)).toEqual({test: 1})
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
      runjs.call(obj, ['a', '-a', 'hello'], logger)
      expect(a).toHaveBeenCalledWith('hello', {a: true})
      a.mockReset()
      runjs.call(obj, ['a', 'hello', '-a'], logger)
      expect(a).toHaveBeenCalledWith('hello', {a: true})
      a.mockReset()
      runjs.call(obj, ['a', '--abc', 'hello'], logger)
      expect(a).toHaveBeenCalledWith('hello', {abc: true})
      a.mockReset()
      runjs.call(obj, ['a', '-a=123', 'hello'], logger)
      expect(a).toHaveBeenCalledWith('hello', {a: 123})
      a.mockReset()
      runjs.call(obj, ['a', '--abc=test', 'hello'], logger)
      expect(a).toHaveBeenCalledWith('hello', {abc: 'test'})
      a.mockReset()
      runjs.call(obj, ['a', '-a', '--abc=test', 'hello'], logger)
      expect(a).toHaveBeenCalledWith('hello', {a: true, abc: 'test'})
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

    it('should log method execution with given method arguments', () => {
      runjs.call(obj, ['a'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a"...')
      runjs.call(obj, ['a', '1', '2'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["1","2"]...')
      runjs.call(obj, ['a', 'b', 'c'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b","c"]...')
      runjs.call(obj, ['a', 'b', '-a'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b",{"a":true}]...')
    })

    it('should log execution time for called method', () => {
      runjs.call(obj, ['a', '1', '2'], logger)
      expect(logger.debug.mock.calls[1][0]).toMatch(/Finished "a" in \d{1,2}\.\d{2} sec/)
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
        obj.a.doc = 'Description for method a'
        obj.b.doc = 'Description for method b'
        runjs.call(obj, [], logger)
        expect(logger.log).toHaveBeenCalledTimes(3)
        expect(logger.log).toHaveBeenCalledWith('Available tasks:')
        expect(logger.log).toHaveBeenCalledWith('a', '- Description for method a')
        expect(logger.log).toHaveBeenCalledWith('b', '- Description for method b')
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
