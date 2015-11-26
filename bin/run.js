#!/usr/bin/env node

var call = require('../lib/index').call;
require("babel/register");
try {
    var runfile = require(process.cwd() + '/runfile');
    call(runfile, process.argv.slice(2));
} catch (e){
    throw e.name + ':' + e.message;
}