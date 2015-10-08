import chalk from 'chalk';
import chProcess from 'child_process';

export function call(obj, args){
    let taskName = args[0];
    if(!taskName){
        console.log('Available tasks:');
        Object.keys(obj).forEach(function(t){
            console.log(t);
        });
        return;
    }

    Object.keys(obj).forEach(function(t){
        let task = obj[t];
        obj[t] = function(){
            let time = Date.now();
            console.log(chalk.blue('Running "' + t + '"...'));
            task.apply(null, arguments);
            time = ((Date.now() - time) / 1000).toFixed(2);
            console.log(chalk.blue('Finished "' + t +'" in', time, 'sec'));
        }
    });

    let task = obj[taskName];
    if(task){
        obj[taskName].apply(null, args.slice(1));
    }
    else {
        console.log(chalk.red("Task " + taskName + " not found"));
    }
}

export function run(cmd, options){
    options = options || {};
    options.stdio = options.stdio || 'inherit';
    console.log(chalk.bold(cmd));
    cmd = 'PATH=$PATH:' + process.cwd() + '/node_modules/.bin/ ' + cmd;
    if(options.async){
        let child = chProcess.exec(cmd, options);
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        return child;
    }
    return chProcess.execSync(cmd, options);
}