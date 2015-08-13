var execSync = require('child_process').execSync;

module.exports = function(){
    console.log(arguments[0]);
    var p = execSync.apply(null, arguments);
    console.log(p.toString())
};