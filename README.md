# runjs

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