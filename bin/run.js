#!/usr/bin/env node

var call = require('runjs').call;
var runfile = require(process.cwd() + '/runfile');

call(runfile, process.argv.slice(2));