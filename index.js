var chalk = require('chalk');
var chProcess = require('child_process');

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
        console.log(chalk.red("Task " + taskName + " not found"));
    }
};

exports.run = function(cmd, options){
    options = options || {};
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:./node_modules/.bin/ ' + cmd;
    if(options.async){
        var child = chProcess.exec(cmd);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        return child;
    }
    return chProcess.execSync(cmd, {stdio: 'inherit'});
};