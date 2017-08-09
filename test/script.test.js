/* eslint-env jest */
const script = require('../lib/script')

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

    it('should return runfile.js as a module if found', () => {
      requirer = jest.fn().mockReturnValue({test: 1})
      expect(script.load(config, logger, requirer, access)).toEqual({test: 1})
      expect(requirer).toHaveBeenCalledWith('./runfile.js')
      expect(requirer).toHaveBeenCalledTimes(1)
    })

    it('should return runfile.js module default context if found', () => {
      requirer = jest.fn().mockReturnValue({default: {test: 1}})
      expect(script.load(config, logger, requirer, access)).toEqual({test: 1})
      expect(requirer).toHaveBeenCalledWith('./runfile.js')
      expect(requirer).toHaveBeenCalledTimes(1)
    })

    it('should raise an error if runfile.js cannot be found', () => {
      access = jest.fn(() => { throw new Error('No access') })
      expect(() => {
        script.load(config, logger, requirer, access)
      }).toThrowError(/^No \.\/runfile\.js defined in/)
      expect(requirer).not.toHaveBeenCalled()
    })

    describe('when requires defined in config', () => {
      beforeEach(() => {
        config = {
          'requires': [
            './node_modules/babel-polyfill',
            './node_modules/babel-register'
          ]
        }
      })

      it('should require specified "requires" before requiring runfile', () => {
        script.load(config, logger, requirer, access)
        expect(requirer.mock.calls).toEqual([
          ['./node_modules/babel-polyfill'],
          ['./node_modules/babel-register'],
          ['./runfile.js']
        ])
      })

      it('should raise an error if specified "requires" cannot be found', () => {
        requirer = jest.fn(() => {
          throw new Error('Cannot find ./node_modules/babel-register')
        })
        expect(() => {
          script.load(config, logger, requirer, access)
        }).toThrowError('Cannot find ./node_modules/babel-register')
      })
    })

    describe('when custom runfile path given', () => {
      beforeEach(() => {
        config = {'runfile': './runfile.ts'}
      })

      it('should return custom runfile as a module if found', () => {
        requirer = jest.fn().mockReturnValue({test: 1})
        expect(script.load(config, logger, requirer, access)).toEqual({test: 1})
        expect(requirer).toHaveBeenCalledWith('./runfile.ts')
        expect(requirer).toHaveBeenCalledTimes(1)
      })

      it('should raise an error if custom runfile cannot be found', () => {
        access = jest.fn(() => { throw new Error('No access') })
        expect(() => {
          script.load(config, logger, requirer, access)
        }).toThrowError(/^No \.\/runfile\.ts defined in/)
        expect(requirer).not.toHaveBeenCalled()
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
