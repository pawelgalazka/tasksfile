var chalk = require('chalk');
var execSync = require('child_process').execSync;

module.exports = function(cmd){
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:./node_modules/.bin/ ' + cmd;
    var p = execSync.call(null, cmd);
    console.log(p.toString());
};