# runjs

Minimalistic building system

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


-----------------


runjs is a very simple building library which tries to follow simplicity of Makefile

Purpose of this is to do makefiles in javascript where you can mix js code with shell commands.

how this works ?
——
With runjs, “run" script is installed which you can run from command line. What it does
is that it requires runfile.js in current directory as a module and executes exported function
in it by given arguments to command line script. runfile.js is treated as the module,
so you can write normal nodejs code. This gives a lot of flexibility.

In runfile.js you can import runjs api (require(‘runjs’).run) which allows you to run
command line scripts synchoously. It is possible to run command asynchronously by giving async
option:
	run(‘http-server’, {async: true})

—————————————————

Feature points:
run method in runfile.js includes PATH=$PATH:./node_modules/.bin/ for every executed command, so you can run your local scripts
read also runfile.coffee
displays list of all commands, when run without arguments