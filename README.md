# runjs

Minimalistic building system


## Get started

Install:

    npm install runjs -g

Create runfile.js:

    var run = require('runjs').run;
    
    exports.showFiles = function(){
        run('ls');
    }
    
    exports.mkdir = function(name){
        run('mkdir ' + name);
    }
    
Run:

    $ run showFiles
    $ run mkdir test

Tips:

* runfile.coffee files are accepted as well
* ./node_modules/.bin/ is included into PATH when running commands by "run" method
* executing "run" command without arguments displays list of all available tasks
* by executing "run('some-command', {async: true})" you can execute command asynchronously


## Goals

runjs is a very simple building library which tries to follow simplicity of Makefile

Purpose of this is to do makefiles in javascript where you can mix js code with shell commands.

how this works ?
——
With runjs, “run" script is installed which you can run from command line. What it does
is that it requires runfile.js in current directory as a module and executes exported function
in it by given arguments to command line script. runfile.js is treated as the module,
so you can write normal nodejs code. This gives a lot of flexibility.