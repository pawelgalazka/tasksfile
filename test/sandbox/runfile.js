import {run} from 'runjs';

export function echo(...args) {
  console.log('echo ' + args.join(' '))
}

export function testapi(){
  run('ls');
}
