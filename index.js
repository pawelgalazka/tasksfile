var execSync = require('child_process').execSync;

module.exports = function(){
    console.log(arguments[0]);
    execSync.apply(null, arguments);
};