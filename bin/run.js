#!/usr/bin/env node

var config = require('pkg-config')('runjs');
var call   = require('../lib/index').call;

if (config && config['require-hook']) {
  require(config['require-hook']);
}
else {

    try {
        require('babel-register');
    } catch() {
        try {
            require('babel/register');
        } catch() {}
    }
}

var runfile = require(process.cwd() + '/runfile');
call(runfile, process.argv.slice(2));
