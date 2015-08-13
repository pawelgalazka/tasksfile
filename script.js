var runFile = require(process.cwd() + '/Runfile');

var runTask = function(tasks, args){
    var taskName = args[2];
    if(!taskName){
        console.log('Available tasks:');
        Object.keys(tasks).forEach(function(t){
            console.log(t);
        });
        return;
    }

    var task = tasks[taskName];
    if(task){
        tasks[taskName].apply(null, args.slice(3));
    }
    else {
        throw "Task " + taskName + " not found";
    }
};

runTask(runFile, process.argv.slice(1));