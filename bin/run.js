#!/usr/bin/env node

var call = require('../lib/index').call;
var path = require('path');

// try to read package.json config
try {
  var pkg = require(path.resolve('./package.json')) || {};
} catch (e) {

}

// try to load babel-register
try {
  console.log('Requiring babel-register...')
  if (pkg.runjs && pkg.runjs['babel-register']) {
    require(path.resolve(pkg.runjs['babel-register']));
  } else {
    require(path.resolve('./node_modules/babel-register'));
  }
} catch (e) {
  console.log('Requiring failed. Fallback to pure node.')
}

// process runfile.js
console.log('Processing runfile...')
var runfile = require(path.resolve('./runfile'));
call(runfile, process.argv.slice(2));
