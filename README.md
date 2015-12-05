# runjs 2.1 (alpha) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs)

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
```
run showFiles
run mkdir test
```

Tips:

* ./node_modules/.bin/ is included into PATH when running commands by "run" method
* executing `run` command without arguments displays list of all available tasks
* by executing "run('some-command', {async: true})" you can execute command asynchronously
* each call of exported functions is logged to console as well as commands called by "run" method
* handling es6 in the runfile out of the box

## API

```javascript
import {run, watch, generate, call} from 'runjs';
```

**run(cmd, options)**

run given command as a child process and log run in the output

Options:

```json
{
    cwd: '', // current working directory
    async: '' // run command asynchronously
    
}
```

**watch(pattern, callback)**

watch files which match given pattern and call callback whenever file is modified or added

```javascript
watch('src/*.js', () => {
    ...
});
```

**generate(src, dst, context)**

**call(object, args)**

