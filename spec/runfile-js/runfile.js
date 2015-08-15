exports.echo = function(){
    console.log('echo ' + Array.prototype.slice.call(arguments, 0).join(' '))
};