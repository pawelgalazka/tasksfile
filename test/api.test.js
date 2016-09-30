import * as runjs from '../lib/index';
import chalk from 'chalk';
import { expect, spy } from 'mochaccino';

describe('api', () => {
  describe('.call()', () => {
    let a, b, obj, consl;
    beforeEach(() => {
      a = spy();
      b = spy();
      obj = {
        a: a,
        b: b
      };
      consl = {
        log: spy()
      };
    });

    it('should call method with given name on given object', () => {
      runjs.call(obj, ['a'], consl);
      expect(a).toHaveBeenCalled();
    });

    it('should call method with given name on given object with given arguments', () => {
      runjs.call(obj, ['b', '1', '2'], consl);
      expect(b).toHaveBeenCalledWith('1', '2');
    });

    it('should print list of all methods available in object if method name not given', () => {
      runjs.call(obj, [], consl);
      expect(consl.log).toHaveBeenCalledTimes(3);
      expect(consl.log).toHaveBeenCalledWith('Available tasks:');
      expect(consl.log).toHaveBeenCalledWith('a');
      expect(consl.log).toHaveBeenCalledWith('b');
    });

    it('should print error message if method not exist on given object', () => {
      runjs.call(obj, ['abc'], consl);
      expect(consl.log).toHaveBeenCalledTimes(1);
      expect(consl.log).toHaveBeenCalledWith(chalk.red('Task abc not found'));
    });

    it('should look for tasks in obj.default if available', () => {
      obj = {
        "default": {
          a: a,
          b: b
        }
      };

      runjs.call(obj, ['a'], consl);
      expect(a).toHaveBeenCalled();
    });
  });

  describe('.run()', () => {
    it('should execute basic shell commands when sync mode', () => {
      const output = runjs.run('echo "echo test"', {stdio: 'pipe', cwd: './test/sandbox'}).toString()
      expect(output).toEqual('echo test\n')
    })

    it('should execute basic shell commands when async mode', (done) => {
      runjs.run('echo "echo test"', {async: true}).then((output) => {
        output = output.toString()
        expect(output).toEqual('echo test\n')
        done()
      })
    })
  })
});