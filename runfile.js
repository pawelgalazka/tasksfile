var run = require('runjs').run;

exports.tests = function(){
    run('jasmine');
};

exports.echo = function(){
    console.log('echo ' + Array.prototype.slice.call(arguments, 0).join(' '))
};
