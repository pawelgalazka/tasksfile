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

    before(() => {
      exec('npm install', {cwd});
    });

    it('should call basic task from the runfile', () => {
      exec(`${RUN} echo 1 2 3`, {cwd});
    });
  });

  describe('in a package with pre installed babel6 and .babelrc file', () => {
    const cwd = `${process.cwd()}/test/sandbox/babel6`;

    before(() => {
      exec('npm install', {cwd});
    });

    it('should call basic task from the runfile', () => {
      exec(`${RUN} echo 1 2 3`, {cwd});
    });
  });
});
