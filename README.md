# runjs 2.1 (alpha)

Minimalistic building system


## Get started

Install globally (for a command line script):

    npm install runjs -g

Install in your project (to use runjs api):

    npm install runjs


Create runfile.js:

```javascript

import {run} from 'runjs';

export function showFiles(){
    run('ls');
}

export function mkdir(name){
    run(`mkdir ${name}`);
}
```
    
Run:

    $ run showFiles
    $ run mkdir test

Tips:

* ./node_modules/.bin/ is included into PATH when running commands by "run" method
* executing `run` command without arguments displays list of all available tasks
* by executing "run('some-command', {async: true})" you can execute command asynchronously
* each call of exported functions is logged to console as well as commands called by "run" method
* handling es6 in the runfile out of the box

## Changelog

2.0:
* dropping es5 and coffeescript support in favor of es6 (handled by babel)
* dropping support for node < 4.0
