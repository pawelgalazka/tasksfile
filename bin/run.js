#!/usr/bin/env node

var call = require('../lib/index').call;
require("babel/register");
var runfile = require(process.cwd() + '/runfile');

call(runfile, process.argv.slice(2));