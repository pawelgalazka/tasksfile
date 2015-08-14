var chalk = require('chalk');
var execSync = require('child_process').execSync;

exports.call = function(obj, args){
    var taskName = args[1];
    if(!taskName){
        console.log('Available tasks:');
        Object.keys(obj).forEach(function(t){
            console.log(t);
        });
        return;
    }

    var task = obj[taskName];
    if(task){
        obj[taskName].apply(null, args.slice(2));
    }
    else {
        console.error(chalk.red("Task " + taskName + " not found"));
    }
};

exports.run = function(cmd){
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:./node_modules/.bin/ ' + cmd;
    execSync(cmd, {stdio: 'inherit'});
};