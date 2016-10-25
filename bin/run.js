#!/usr/bin/env node

const call = require('../lib/index').call;
const path = require('path');
const fs = require('fs');
let config;

// try to read package.json config
try {
  config = require(path.resolve('./package.json')).runjs || {};
} catch (error) {
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
} catch (error) {
  console.log('Requiring failed. Fallback to pure node.');
  if (config['babel-register']) {
    throw error.stack
  }
}

// process runfile.js
console.log('Processing runfile...')

try {
  fs.accessSync(path.resolve('./runfile.js'));
} catch (error) {
  console.log(`No runfile.js defined in ${process.cwd()}`);
  process.exit(1);
}

const runfile = require(path.resolve('./runfile'));
call(runfile, process.argv.slice(2));
