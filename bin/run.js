#!/usr/bin/env node

var call = require('../lib/index').call;

require(process.cwd() + '/node_modules/babel-register');

var runfile = require(process.cwd() + '/runfile');
call(runfile, process.argv.slice(2));
