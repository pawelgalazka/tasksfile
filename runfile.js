var run = require('runjs').run;

exports.tests = function(){
    exports.echo(1,2,3);
    run('jasmine');
};

exports.echo = function(){
    console.log('echo ' + Array.prototype.slice.call(arguments, 0).join(' '))
};
