import * as runjs from '../lib/index';
import chalk from 'chalk';
import chProcess from 'child_process';
import {expect, spy} from 'mochaccino';

/* primitive version of run function for script testing purposes */
export function exec(cmd, options = {}){
  options.stdio = 'inherit';
  let cwd = options.cwd || '';
  console.log(chalk.yellow.bold(`RUNNING SCRIPT [${cmd}] IN [${cwd}]`));
  chProcess.execSync(cmd, options);
  console.log(chalk.yellow.bold('------'));
}

describe('run script', () => {
  const RUN = `${process.cwd()}/bin/run.js`;
  describe('in a package without any babel transpiler', () => {
    const cwd = `${process.cwd()}/test/sandbox/no-babel`;

    it('should call basic task from the runfile', () => {
      exec(`${RUN} echo 1 2 3`, {cwd});
    });
  });

  describe('in a package with pre installed babel5', () => {
    const cwd = `${process.cwd()}/test/sandbox/babel5`;

    before((done) => {
      exec('npm install', {cwd});
      done();
    });

    it('should call basic task from the runfile', () => {
      exec(`${RUN} echo 1 2 3`, {cwd});
    });
  });

  describe.skip('in a package with pre installed babel6', () => {
    before(() => {

    });

    it('should call basic task from the runfile', () => {

    });
  });

  describe.skip('in a package with pre installed babel6 and .babelrc file', () => {
    before(() => {

    });

    it('should call basic task from the runfile', () => {

    });
  });
});


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
  });
});