# runjs 2.4 ![node version](https://img.shields.io/node/v/runjs.svg) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pawelgalazka/runjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Minimalistic building system


## Get started

Install globally (for a command line script):

    npm install runjs -g

Install in your project (to use runjs api):

    npm install runjs --save-dev

If you don't have Babel (6.x) install it to use full ES6 syntax:

    npm install babel-core babel-preset-es2015 babel-register --save-dev

Configure Babel in your package.json:

    "babel": {
      "presets": ["es2015"]
    }

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

## Why runjs ?

We have Grunt, Gulp, npm scripts, Makefile. Why another building tool ?

Gulp or Grunt files seem overly complex for what they do and the plugin
ecosystem adds a layer of complexity towards the simple command
line tools underneath. The documentation is not always up to date
and the plugin does not always use the latest version of the tool.
After a while customizing the process even with simple things,
reconfiguring it becomes time consuming.

Npm scripts are simple but they get out of hand pretty quickly if
we need more complex process which make them quite hard to read.

Makefiles are simple, better for more complex processes then npm scripts
but they depend on bash scripting. Within `runfile` you can use
command line calls as well as JavaScript code and npm
libraries which makes that approach much more flexible. Having
additionally simple reporting system which tells you which tasks
or cli commands were called.

## API

```javascript
import {run, generate} from 'runjs';
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
