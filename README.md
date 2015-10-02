# runjs 2.0 (draft)

Minimalistic building system


## Get started

Install:

    npm install runjs -g

Create runfile.js:

```javascript

import {run} from 'runjs';

export function showFiles(){
    run('ls');
}

export function mkdir(name){
    run('mkdir ' + name);
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

## Changelog

2.0:
* dropping es5 and coffeescript support in favor of es6
* dropping support for node < v4.1
