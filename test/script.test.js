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
      requirer = jest.fn()
      access = jest.fn().mockReturnValue(true)
      config = {}
    })

    describe('when custom path to babel-register defined in config', () => {
      beforeEach(() => {
        config = {'babel-register': './custom/babel-register'}
      })

      it('should raise an error if specified babel-register cannot be found', () => {
        requirer = jest.fn((mod) => {
          switch (mod) {
            case './custom/babel-register':
              throw new Error('Cannot find babel-register')
            default:
              throw new Error('Unexpected import')
          }
        })
        expect(() => {
          script.load('./runfile', config, logger, requirer, access)
        }).toThrowError('Cannot find babel-register')
      })

      it('should load specified babel-register', () => {
        requirer = jest.fn((mod) => {
          switch (mod) {
            case './custom/babel-register':
              return {}
            case './runfile':
              return {}
            default:
              throw new Error('Unexpected import')
          }
        })
        script.load('./runfile', config, logger, requirer, access)
        expect(requirer).toHaveBeenCalledWith('./custom/babel-register')
      })
    })

    it('should load babel-register if found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './node_modules/babel-register':
            return {}
          case './runfile':
            return {}
          default:
            throw new Error('Unexpected import')
        }
      })
      script.load('./runfile', config, logger, requirer, access)
      expect(requirer).toHaveBeenCalledWith('./node_modules/babel-register')
    })

    it('should ignore babel-register load error if module not found', () => {
      requirer = jest.fn((mod) => {
        switch (mod) {
          case './node_modules/babel-register':
            throw new Error('babel-register not found')
          case './runfile':
            return {test: 1}
          default:
            throw new Error('Unexpected import')
        }
      })
      expect(script.load('./runfile', config, logger, requirer, access)).toEqual({test: 1})
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

  describe('decorate()', () => {
    let obj, a, c, e, h

    beforeEach(() => {
      a = jest.fn()
      c = jest.fn()
      e = jest.fn()
      h = jest.fn()
      obj = script.decorate({
        a,
        b: {
          c,
          d: {
            e
          }
        },
        'f:g:h': h
      }, logger)
    })

    it('should log flat methods execution with given method arguments', () => {
      obj.a()
      expect(logger.debug).toHaveBeenCalledWith('Running "a"...')
      obj.a('b', 'c')
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b","c"]...')
      obj.a('b', {a: true})
      expect(logger.debug).toHaveBeenCalledWith('Running "a" with ["b",{"a":true}]...')
    })

    it('should log nested methods execution with given method arguments', () => {
      obj.b.c()
      expect(logger.debug).toHaveBeenCalledWith('Running "b:c"...')
      obj.b.c('b', 'c')
      expect(logger.debug).toHaveBeenCalledWith('Running "b:c" with ["b","c"]...')
      obj.b.d.e('b', {a: true})
      expect(logger.debug).toHaveBeenCalledWith('Running "b:d:e" with ["b",{"a":true}]...')
      obj['f:g:h']('1', '2')
      expect(logger.debug).toHaveBeenCalledWith('Running "f:g:h" with ["1","2"]...')
    })

    it('should log execution time for called method', () => {
      obj.a('b', 'c')
      expect(logger.debug.mock.calls[1][0]).toMatch(/Finished "a" in \d{1,2}\.\d{2} sec/)
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
      script.call(obj, ['a', 1, 2])
      expect(a).toHaveBeenLastCalledWith(1, 2)
    })

    it('should handle dash arguments', () => {
      script.call(obj, ['a', '-a', 'hello'])
      expect(a).toHaveBeenLastCalledWith({a: 'hello'})
      a.mockClear()
      script.call(obj, ['a', 'hello', '-a'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: true})
      script.call(obj, ['a', '--abc', 'hello'])
      expect(a).toHaveBeenLastCalledWith({abc: 'hello'})
      script.call(obj, ['a', '-a=123', 'hello'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: 123})
      script.call(obj, ['a', '--abc=test', 'hello'])
      expect(a).toHaveBeenLastCalledWith('hello', {abc: 'test'})
      script.call(obj, ['a', '-a', '--abc=test', 'hello'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: true, abc: 'test'})
      script.call(obj, ['a', '-a', '--abc=test', '-b=4', 'hello', '-abc', '--def'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: true, b: [4, true], c: true, abc: 'test', def: true})
    })

    it('should call methods from nested objects by method name name-spacing', () => {
      script.call(obj, ['a', '1', '2'])
      expect(a).toHaveBeenLastCalledWith(1, 2)
      script.call(obj, ['b:c', '1', '2'])
      expect(c).toHaveBeenLastCalledWith(1, 2)
      script.call(obj, ['b:d:e', '1', '2'])
      expect(e).toHaveBeenLastCalledWith(1, 2)
      script.call(obj, ['f:g:h', '1', '2'])
      expect(h).toHaveBeenLastCalledWith(1, 2)
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

    it('should handle nested options arguments', () => {
      script.call(obj, ['a', 'hello', '-a', '--abc', '--nested="-a --abc --foo=bar"'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: true, abc: true, nested: '"-a --abc --foo=bar"'})
      script.call(obj, ['a', 'hello', '-a', '--abc', '--nested', '"-a --abc --foo=bar"'])
      expect(a).toHaveBeenLastCalledWith('hello', {a: true, abc: true, nested: '"-a --abc --foo=bar"'})
    })
  })
})
