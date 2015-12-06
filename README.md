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

* `./node_modules/.bin/` is included into PATH when running commands by `run` method
* executing `run` command without arguments displays list of all available tasks
* each call of exported functions is logged to console as well as commands called by `run` method
* handling es6 in the runfile out of the box

## API

```javascript
import {run, watch, generate, call} from 'runjs';
```

**run(cmd, options)**

run given command as a child process and log the call in the output

Options:

```javascript
{
    cwd: .., // current working directory (String)
    async: ... // run command asynchronously (true/false)
}
```

**watch(pattern, callback)**

watch files which match given pattern and call callback whenever file is modified or added

```javascript
watch('src/*.js', (path) => {
    ...
});
```

**generate(src, dst, context)**

generate file specified by `dst` path by given template `src` and `context`

`file1.tmp.js`:
```javascript
{
    author: '<%= AUTHOR %>'
}
```

```javascript
generate('file1.tmp.js', 'file1.js', {AUTHOR: 'Pawel'});
```

will generate `file1.js`:

```
{
    author: 'Pawel'
}
```

**call(object, args)**

call method from given `object` by given `args` where first argument should
be name of the method. Along the way it logs every method call and print
to the output its time of execution.

`script.js`:

```javascript
#!/usr/bin/env node
let o = {
    echo: (text, a1, a2) => {
        console.log(text, a1, a2);
    }
}

call(o, process.argv.slice(2));
```

```
$ ./script.js echo 1 2
echo 1 2
```
