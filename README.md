# runjs ![node version](https://img.shields.io/node/v/runjs.svg) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pawelgalazka/runjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Minimalistic building tool

- [Get started](#get-started)
- [Why runjs ?](#why-runjs-)
- [Handling arguments](#handling-arguments)
- [API](#api)
    - [run](#runcmd-options)
- [Using Babel](#using-babel)
- [Using TypeScript](#using-typescript)
- [Using Async/Await](#using-asyncawait)
- [Scaling](#scaling)
- [Documenting tasks](#documenting-tasks)


## Get started

Install globally (for a command line script):

    npm install runjs -g

Install in your project (to use runjs api inside your `runfile.js`):

    npm install runjs --save-dev

If you want to use Babel transpiler, install it (for TypeScript click [here](#using-typescript)):

    npm install babel-core babel-preset-es2015 babel-register --save-dev

and add config to your `package.json`:

    "babel": {
      "presets": ["es2015"]
    },
    "runjs": {
      "requires": [
        "./node_modules/babel-register"
      ]
    }

Create `runfile.js`:

```javascript

import {run} from 'runjs';

export const build = {
  js () {
    run('webpack -p --config config/webpack/prod.js --progress');
  },
  
  css () {
    
  },
  
  all () {
    build.js()
    build.css()
  }
}

export function createcomponent (name) {
  
}

export function lint (path = '.') {
  this.options.fix ? run(`eslint ${path} --fix`) : run(`eslint ${path}`) 
}

lint.help = 'Do linting for javascript files'
```
    
Run:
```
run createcomponent AppContainer
run build:js
run build:all
run lint --fix components/Button.js
run lint --help
```

Mechanism of RunJS is very simple. Tasks are run by just importing `runfile.js` as a
normal node.js module. Then based on command line arguments a proper exported function
from `runfile.js` is run.


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

Makefiles are simple, better for more complex processes
but they depend on bash scripting. Within `runfile` you can use
command line calls as well as JavaScript code and npm
libraries which makes that approach much more flexible. Additionally 
each task and command call is reported in the console.


## Handling arguments

Provided arguments in the command line are passed to the function:


```javascript
export function sayHello (who) {
  console.log(`Hello ${who}!`)
}
```

    $ run sayHello world
    Hello world!
    
You can also provide dash arguments like `-a` or `--test`. Order of them doesn't matter
after task name. They will be always passed through `this.options` inside a function 
in a form of JSON object.

```javascript
export function sayHello (who) {
  console.log(`Hello ${who}!`)
  console.log('Given options:', this.options)
}
```

    $ run sayHello -a --test=something world
    Hello world!
    Given options: { a: true, test: 'something' }
    

## API

For inside `runfile.js` usage

```javascript
import { run } from 'runjs';
```

#### run(cmd, options)

run given command as a child process and log the call in the output. 
`./node_modules/.bin/` is included into PATH so you can call installed scripts directly.

*Options:*

```javascript
{
    cwd: ..., // current working directory (String)
    async: ... // run command asynchronously (true/false), false by default
    stdio: ... // 'inherit' (default), 'pipe' or 'ignore'
    env: ... // environment key-value pairs (Object)
    log: ... // log command to console (true/false), true by default
    timeout: ...
}
```

*Examples:*

To get an output from `run` function we need to set `stdio` option to `pipe` otherwise
`output` will be `null`:

```javascript
const output = run('ls -la', {stdio: 'pipe'})
run('http-server .', {async: true, stdio: 'pipe'}).then((output) => {
  log(output) 
}).catch((error) => {
  throw error
})
```

For `stdio: 'pipe'` outputs are returned but not forwarded to the parent process thus 
not printed out to the terminal. For `stdio: 'inherit'` (default) outputs are passed 
to the terminal, but `run` function will resolve (async) / return (sync)
`null`.


## Using Babel

If you want to use Babel transpiler for your `runfile.js`, just define a path
to your `babel-register` module in your `package.json` as part of runjs config.

`package.json`:

    "runjs": {
      "requires": [
        "./node_modules/babel-register"
      ]
    }

RunJS will require defined transpiler before requiring `runfile.js` so you can
use all ES6/ES7 features which are not supported by your node version. 

If you don't have `babel-register` module, just install it:

    npm install babel-register --save-dev
    
    
## Using TypeScript

If you want to use TypeScript transpiler for your runfile, define a path
to `ts-node/register` module as part of runjs config inside your `package.json`.
You need to also define custom path to your runfile as TypeScript files have
`*.ts` extension.

`package.json`:

    "runjs": {
      "requires": [
        "./node_modules/ts-node/register"
      ],
      "runfile": "./runfile.ts"
    }

RunJS will require defined transpiler before requiring `./runfile.ts`.

If you don't have `ts-node` module, just install it:

    npm install ts-node --save-dev
    
## Using Async/Await

For node >= 7.10 it is possible to use async functions out of the box since node 
will support them natively.

Expected usage in your runfile:

```javascript
import { run } from 'runjs'

export async function testasyncawait () {
  await run('ls -al | cat', {async: true}).then((data) => {
    console.log('DATA', data)
  })
  console.log('After AWAIT message')
}
```

and then just

```
$ run testasyncawait
```

If your node version is older you need to depend on transpilers, 
either `Babel` or `TypeScript`. For `TypeScript` you do no more than transpiler
setup which was described [above](#using-typescript) and async/await should just
work.

For `Babel` you additionally need `babel-preset-es2017` and `babel-polyfill`:

    npm install babel-preset-es2017 babel-polyfill --save-dev
    
and proper config in your `package.json`:

    "babel": {
      "presets": ["es2017"]
    },
    "runjs": {
      "requires": [
        "./node_modules/babel-polyfill",
        "./node_modules/babel-register"
      ]
    }

## Scaling

When `runfile.js` gets large it is a good idea to extract some logic to external modules 
and import them back to `runfile.js`:


`./tasks/css`:

```javascript
export function compile () {
  ...
}
```

`./tasks/lint`:

```javascript
export function fix () {
  ...
}
```

`./tasks/common`:

```javascript
export function serve () {
  ...
}
```

`runfile.js`:

```javascript
import { run } from 'runjs'
import lint from './tasks/lint'
import css from './tasks/css'
import common from './tasks/common'

export default {
  css, // equals to css: css
  lint, // equals to lint: lint
  ...common,
  clean: () => {
    run('rm -rf node_modules') 
  },
  deploy: {
    'production': () => {
      
    },
    'staging': () => {
      
    }
  }
}
```

```
run css:compile
run lint:fix
run serve
run clean
run deploy:production
run deploy:staging
```

You can notice a couple of approaches here but in general RunJS will treat object key as
a namespace. It is also possible to bump tasks directly without the namespace by using ES7 
object spread operator as with `common` tasks in the example above.

## Documenting tasks

To display all available tasks for your `runfile.js` type `run` in your command line
without any arguments:

    $ run
    Requiring ./node_modules/babel-register...
    Processing runfile.js...
    
    Available tasks:
    
    echo
    testapi
    
Add `help` property to your task to get additional description:

```javascript
import { run } from 'runjs'

export function buildjs (arg1, arg2) {
  
}

buildjs.help = 'Compile JavaScript files'
```

    $ run
    Requiring ./node_modules/babel-register...
    Processing runfile.js...
    
    Available tasks:
    
    buildjs [arg1 arg2]
    Compile JavaScript files
    
When running task with `--help` option, only help for that task will be displayed:

    $ run buildjs --help
    Requiring ./node_modules/babel-register...
    Processing runfile.js...
    
    ARGUMENTS
    [arg1 arg2]
    
    DESCRIPTION
    Compile JavaScript files
