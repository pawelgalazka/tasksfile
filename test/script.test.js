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
    let requirer, access, config

    beforeEach(() => {
      requirer = jest.fn().mockReturnValue({})
      access = jest.fn().mockReturnValue(true)
      config = {}
    })

    it('should load babel-register if found', () => {
      script.load('./runfile', config, logger, requirer, access)
      expect(requirer).toHaveBeenCalledWith('./node_modules/babel-register')
    })

    it('should raise an error if runfile.js cannot be found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './node_modules/babel-register':
            return {}
          default:
            throw new Error('Unexpected import')
        }
      })
      access = jest.fn(() => { throw new Error('No access') })
      expect(() => {
        script.load('./runfile', config, logger, requirer, access)
      }).toThrowError(script.RunJSError)
      expect(() => {
        script.load('./runfile', config, logger, requirer, access)
      }).toThrowError(/^No \.\/runfile\.js defined in/)
    })

    it('should return runfile.js as a module if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {test: 1}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(script.load('./runfile', config, logger, requirer, access)).toEqual({test: 1})
    })

    it('should return runfile module default context if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {default: {test: 1}}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(script.load('./runfile', config, logger, requirer, access)).toEqual({test: 1})
    })

    describe('when custom path to babel-register defined in config', () => {
      beforeEach(() => {
        config = {'babel-register': './custom/babel-register'}
      })

      it('should raise an error if specified babel-register cannot be found', () => {
        requirer = jest.fn(() => {
          throw new Error('Cannot find babel-register')
        })
        expect(() => {
          script.load('./runfile', config, logger, requirer, access)
        }).toThrowError('Cannot find babel-register')
        expect(requirer).toHaveBeenCalledWith('./custom/babel-register')
      })

      it('should load specified babel-register', () => {
        script.load('./runfile', config, logger, requirer, access)
        expect(requirer).toHaveBeenCalledWith('./custom/babel-register')
      })
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
      expect(logger.debug).toHaveBeenCalledTimes(1)
      expect(logger.info).toHaveBeenCalledTimes(4)
      expect(logger.debug).toHaveBeenCalledWith('Available tasks:\n')
      expect(logger.info).toHaveBeenCalledWith('a', '')
      expect(logger.info).toHaveBeenCalledWith('b', '')
    })

    it('should log list of methods with description for each one if provided', () => {
      obj.a.help = 'Description for method a'
      obj.b.help = 'Description for method b'
      script.describe(obj, logger)
      expect(logger.debug).toHaveBeenCalledWith('Available tasks:\n')
      expect(logger.info).toHaveBeenCalledWith('a', '')
      expect(logger.log).toHaveBeenCalledWith('Description for method a')
      expect(logger.info).toHaveBeenCalledWith('b', '')
      expect(logger.log).toHaveBeenCalledWith('Description for method b')
      expect(logger.info).toHaveBeenCalledTimes(4)
    })

    it('should log list of name spaced / nested methods', () => {
      obj.c = {
        d: () => {},
        e: {
          f: () => {},
          g: () => {}
        }
      }

      obj.c.help = 'Description for namespace c'
      obj.c.e.f.help = 'Description for method f'

      script.describe(obj, logger)
      expect(logger.debug).toHaveBeenCalledWith('Available tasks:\n')
      expect(logger.info).toHaveBeenCalledWith('a', '')
      expect(logger.info).toHaveBeenCalledWith('b', '')
      expect(logger.info).toHaveBeenCalledWith('c:d', '')
      expect(logger.info).toHaveBeenCalledWith('c:e:f', '')
      expect(logger.log).toHaveBeenCalledWith('Description for method f')
      expect(logger.info).toHaveBeenCalledWith('c:e:g', '')
      expect(logger.info).toHaveBeenCalledTimes(10)
    })

    it('should log list of methods with available arguments', () => {
      obj.b = (arg1, arg2) => {}
      script.describe(obj, logger)
      expect(logger.debug).toHaveBeenCalledWith('Available tasks:\n')
      expect(logger.info).toHaveBeenCalledWith('a', '')
      expect(logger.info).toHaveBeenCalledWith('b', '[arg1 arg2]')
    })
  })

  describe('call()', () => {
    let obj, a, c, e, h
    beforeEach(() => {
      a = jest.fn()
      c = jest.fn()
      e = jest.fn()
      h = jest.fn()
      obj = {
        a,
        b: {
          c,
          d: {
            e
          }
        },
        'f:g:h': h
      }
    })

    it('calls the method from a given object by given method name and its arguments', () => {
      script.call(obj, ['a'])
      expect(a).toHaveBeenLastCalledWith()
      script.call(obj, ['a', '1', '2'])
      expect(a).toHaveBeenLastCalledWith('1', '2')
    })

    it('should handle dash arguments', () => {
      let calls = {}

      function fn (...args) {
        calls.args = args
        calls.options = this.options
      }

      obj.a = fn

      script.call(obj, ['a', '-a', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {a: true}})
      calls = {}
      script.call(obj, ['a', 'hello', '-a'])
      expect(calls).toEqual({args: ['hello'], options: {a: true}})
      script.call(obj, ['a', '--abc', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {abc: true}})
      script.call(obj, ['a', '-a=123', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {a: 123}})
      script.call(obj, ['a', '--abc=test', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {abc: 'test'}})
      script.call(obj, ['a', '-a', '--abc=test', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {a: true, abc: 'test'}})
      script.call(obj, ['a', '-a', '--abc=test', '-b=4', 'hello', '-abc', '--def'])
      expect(calls).toEqual({args: ['hello', '-abc'], options: {a: true, b: 4, abc: 'test', def: true}})
      script.call(obj, ['a', '--ab-cd', '--ef-gh=test', '--ab.cd', '--ef.gh=123', 'hello', '-abc'])
      expect(calls).toEqual({args: ['hello', '-abc'], options: {'ab-cd': true, 'ef-gh': 'test', 'ab.cd': true, 'ef.gh': 123}})
    })

    it('should handle dash arguments in nested tasks', () => {
      let calls = {}

      function fn (...args) {
        calls.args = args
        calls.options = this.options
      }

      obj.b.c = fn

      script.call(obj, ['b:c', '-a', 'hello'])
      expect(calls).toEqual({args: ['hello'], options: {a: true}})
      calls = {}
      script.call(obj, ['b:c', 'hello', '-a'])
      expect(calls).toEqual({args: ['hello'], options: {a: true}})
    })

    it('should call methods from nested objects by method name name-spacing', () => {
      script.call(obj, ['a', '1', '2'])
      expect(a).toHaveBeenLastCalledWith('1', '2')
      script.call(obj, ['b:c', '1', '2'])
      expect(c).toHaveBeenLastCalledWith('1', '2')
      script.call(obj, ['b:d:e', '1', '2'])
      expect(e).toHaveBeenLastCalledWith('1', '2')
      script.call(obj, ['f:g:h', '1', '2'])
      expect(h).toHaveBeenLastCalledWith('1', '2')
    })

    it('should raise an error if called method cannot be found', () => {
      expect(() => {
        script.call(obj, ['abc'])
      }).toThrowError(('Task abc not found'))

      expect(() => {
        script.call(obj, ['abc'])
      }).toThrowError(script.RunJSError)

      expect(() => {
        script.call(obj, ['b:d'])
      }).toThrowError(('Task b:d not found'))
    })

    it('should log documentation for method if --help option given', () => {
      obj.b.c = (arg1, arg2) => {}
      obj.b.c.help = 'Test description'
      script.call(obj, ['b:c', '--help'], logger)
      expect(logger.info.mock.calls).toEqual([['ARGUMENTS'], ['DESCRIPTION']])
      expect(logger.log.mock.calls).toEqual([[' '], ['[arg1 arg2]'], [' '], ['Test description'], [' ']])

      logger.info.mockClear()
      logger.log.mockClear()

      obj.b.c = () => {}
      script.call(obj, ['b:c', '--help'], logger)
      expect(logger.info.mock.calls).toEqual([['ARGUMENTS'], ['DESCRIPTION']])
      expect(logger.log.mock.calls).toEqual([[' '], ['None'], [' '], ['None'], [' ']])
    })
  })
})
