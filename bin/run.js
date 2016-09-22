#!/usr/bin/env node

var call = require('../lib/index').call;
var path = require('path');
var config;

// try to read package.json config
try {
  config = require(path.resolve('./package.json')).runjs || {};
} catch (e) {
  config = {};
}

// try to load babel-register
try {
  console.log('Requiring babel-register...')
  if (config['babel-register']) {
    require(path.resolve(config['babel-register']));
  } else {
    require(path.resolve('./node_modules/babel-register'));
  }
} catch (e) {
  console.log('Requiring failed. Fallback to pure node.');
  if (config['babel-register']) {
    throw e.stack
  }
}

// process runfile.js
console.log('Processing runfile...')
var runfile = require(path.resolve('./runfile'));
call(runfile, process.argv.slice(2));
