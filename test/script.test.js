/* eslint-env jest */
import * as script from '../lib/script'

describe('script', () => {
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
          script.load('./runfile', logger, requirer, access)
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
        script.load('./runfile', logger, requirer, access)
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
      script.load('./runfile', logger, requirer, access)
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
      expect(script.load('./runfile', logger, requirer, access)).toEqual({test: 1})
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
        script.load('./runfile', logger, requirer, access)
      }).toThrowError(script.RunJSError)
      expect(() => {
        script.load('./runfile', logger, requirer, access)
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
      expect(script.load('./runfile', logger, requirer, access)).toEqual({test: 1})
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
      expect(script.load('./runfile', logger, requirer, access)).toEqual({test: 1})
    })
  })

  describe('describe()', () => {
    let obj
    beforeEach(() => {
      obj = {
        a: () => {},
        b: () => {}
      }
    })

    it('should log list of methods available in the object', () => {
      script.describe(obj, logger)
      expect(logger.log).toHaveBeenCalledTimes(3)
      expect(logger.log).toHaveBeenCalledWith('Available tasks:')
      expect(logger.log).toHaveBeenCalledWith('a')
      expect(logger.log).toHaveBeenCalledWith('b')
    })

    it('should log list of methods from the object with description for each one if provided', () => {
      obj.a.doc = 'Description for method a'
      obj.b.doc = 'Description for method b'
      script.describe(obj, logger)
      expect(logger.log).toHaveBeenCalledWith('Available tasks:')
      expect(logger.log).toHaveBeenCalledWith('a', '- Description for method a')
      expect(logger.log).toHaveBeenCalledWith('b', '- Description for method b')
      expect(logger.log).toHaveBeenCalledTimes(3)
    })

    it('should log list of name spaced / nested methods', () => {
      obj.c = {
        d: () => {},
        e: {
          f: () => {},
          g: () => {}
        }
      }

      obj.c.doc = 'Description for namespace c'
      obj.c.e.f.doc = 'Description for method f'

      script.describe(obj, logger)
      expect(logger.log).toHaveBeenCalledWith('Available tasks:')
      expect(logger.log).toHaveBeenCalledWith('a')
      expect(logger.log).toHaveBeenCalledWith('b')
      expect(logger.log).toHaveBeenCalledWith('c:d')
      expect(logger.log).toHaveBeenCalledWith('c:e:f', '- Description for method f')
      expect(logger.log).toHaveBeenCalledWith('c:e:g')
      expect(logger.log).toHaveBeenCalledTimes(6)
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
      script.call(obj, ['a'], logger)
      script.call(obj, ['b', '1', '2'], logger)
      expect(a).toHaveBeenCalled()
      expect(b).toHaveBeenCalledWith('1', '2')
    })

    it('should handle dash arguments', () => {
      script.call(obj, ['a', '-a', 'hello'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {a: true})
      a.mockClear()
      script.call(obj, ['a', 'hello', '-a'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {a: true})
      script.call(obj, ['a', '--abc', 'hello'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {abc: true})
      script.call(obj, ['a', '-a=123', 'hello'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {a: 123})
      script.call(obj, ['a', '--abc=test', 'hello'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {abc: 'test'})
      script.call(obj, ['a', '-a', '--abc=test', 'hello'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', {a: true, abc: 'test'})
      script.call(obj, ['a', '-a', '--abc=test', '-b=4', 'hello', '-abc', '--def'], logger)
      expect(a).toHaveBeenLastCalledWith('hello', '-abc', {a: true, b: 4, abc: 'test', def: true})
    })

    it('should call methods from nested objects by method name name-spacing', () => {
      const c = jest.fn()
      const f = jest.fn()
      obj = {
        a,
        e: {
          b,
          d: {
            sub: c,
            f: () => {}
          }
        },
        'e:d:f': f
      }

      script.call(obj, ['a', '1', '2'], logger)
      expect(a).toHaveBeenLastCalledWith('1', '2')
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["1","2"]...')
      script.call(obj, ['e:b', '1', '2'], logger)
      expect(b).toHaveBeenLastCalledWith('1', '2')
      expect(logger.debug).toHaveBeenCalledWith('Running "e:b" with ["1","2"]...')
      script.call(obj, ['e:d:sub', '1', '2'], logger)
      expect(c).toHaveBeenLastCalledWith('1', '2')
      expect(logger.debug).toHaveBeenCalledWith('Running "e:d:sub" with ["1","2"]...')
      script.call(obj, ['e:d:f', '1', '2'], logger)
      expect(f).toHaveBeenLastCalledWith('1', '2')
      expect(logger.debug).toHaveBeenCalledWith('Running "e:d:f" with ["1","2"]...')
      // script.call(obj, ['e', '1', '2'], logger)
    })

    it('should raise an error if called method cannot be found', () => {
      expect(() => {
        script.call(obj, ['abc'], logger)
      }).toThrowError(('Task abc not found'))

      expect(() => {
        script.call(obj, ['abc'], logger)
      }).toThrowError(script.RunJSError)
    })

    it('should log method execution with given method arguments', () => {
      script.call(obj, ['a'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a"...')
      script.call(obj, ['a', '1', '2'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["1","2"]...')
      script.call(obj, ['a', 'b', 'c'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b","c"]...')
      script.call(obj, ['a', 'b', '-a'], logger)
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b",{"a":true}]...')
    })

    it('should log execution time for called method', () => {
      script.call(obj, ['a', '1', '2'], logger)
      expect(logger.debug.mock.calls[1][0]).toMatch(/Finished "a" in \d{1,2}\.\d{2} sec/)
    })
  })
})
