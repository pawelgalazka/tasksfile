#!/usr/bin/env node

var call = require('../lib/index').call;

try {
  console.log('Requiring babel-register...')
  require(process.cwd() + '/node_modules/babel-register');
} catch (e) {
  console.log('Requiring failed. Fallback to pure node.')
}

console.log('Processing runfile...')
var runfile = require(process.cwd() + '/runfile');
call(runfile, process.argv.slice(2));
