import {run} from './lib/index';

export function test(){
    exports.echo(1,2,3);
    build();
    run('mocha');
}

export function echo(){
    console.log('echo ' + Array.prototype.slice.call(arguments, 0).join(' '))
}

export function build(){
    run('babel src/ --out-dir lib/');
}
