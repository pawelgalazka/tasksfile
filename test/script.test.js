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

describe('runjs installation', () => {
  const cwd = `${process.cwd()}/test/sandbox`;

  before(() => {
    exec('rm -rf node_modules', {cwd});
    exec('npm install ../../', {cwd});
    exec('npm install', {cwd});
  });

  it('should install runjs', () => {
    exec('npm test', {cwd});
  });
});
