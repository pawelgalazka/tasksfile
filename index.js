var chalk = require('chalk');
var execSync = require('child_process').execSync;

module.exports = function(cmd){
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:./node_modules/.bin/ ' + cmd;
    execSync(cmd, {stdio: 'inherit'});
};