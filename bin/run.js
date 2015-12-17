#!/usr/bin/env node

var call = require('../lib/index').call;

try {
  require(process.cwd() + '/node_modules/babel-register');
} catch (e) {
  try {
    require(process.cwd() + '/node_modules/babel/register');
  } catch (e) {
    require('babel/register');
  }
}

var runfile = require(process.cwd() + '/runfile');
call(runfile, process.argv.slice(2));
