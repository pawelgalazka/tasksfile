# runjs ![node version](https://img.shields.io/node/v/runjs.svg) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pawelgalazka/runjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Minimalistic building tool

- [Get started](#get-started)
- [Why runjs ?](#why-runjs-)
- [Handling arguments](#handling-arguments)
- [Documenting tasks](#documenting-tasks)
- [Namespacing](#namespacing)
- [Transpilers](#transpilers)
    - [Babel](#babel)
    - [TypeScript](#typescript)
- [API](#api)
    - [run](#runcmd-options)
    - [options](#optionsthis-name)
    - [help](#helpfunc-annotation)
- [Using Async/Await](#using-asyncawait)


> For 3.x to 4.x migration instructions look [here](https://github.com/pawelgalazka/runjs/releases)


## Get started

Install runjs in your project

    npm install runjs --save-dev
    
Create `runfile.js` in your root project directory:

```js
const { run } = require('runjs')

function hello(name = 'Mysterious') {
  console.log(`Hello ${name}!`)
  run(`mkdir ${name.toLowerCase()}`)
  console('I made a directory for you!')
}

module.exports = {
  hello
}
```

Call in your terminal:

```bash
$ npx run hello Tommy
Hello Tommy!
mkdir tommy
I made a directory for you!
```

> For node < 8, [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)
is not available, so doing `npm install -g runjs-cli` is neccessary which installs
global `run` script. After that above task would be called like: `run hello Tommy`

Mechanism of RunJS is very simple. Tasks are run by just importing `runfile.js` as a
normal node.js module. Then based on command line arguments proper exported function
from `runfile.js` is called.

RunJS in a nutshell

```js
const runfile = require(path.resolve('runfile'))
const taskName = process.argv[2]
const { options, params } = parseArgs(process.argv.slice(2))

runfile[taskName].apply({ options }, params)
```


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
libraries which makes that approach much more flexible.


## Handling arguments

Provided arguments in the command line are passed to the function:


```javascript
export function sayHello (who) {
  console.log(`Hello ${who}!`)
}
```

    $ run sayHello world
    Hello world!
    
You can also provide dash arguments like `-a` or `--test`. Order of them doesn't 
matter after task name. They will be always available by `options` helper 
from inside a function.

```javascript
import { options } from 'runjs'

export function sayHello (who) {
  console.log(`Hello ${who}!`)
  console.log('Given options:', options(this))
}
```

```bash
$ run sayHello -a --test=something world
Hello world!
Given options: { a: true, test: 'something' }
```
    
    
## Documenting tasks

To display all available tasks for your `runfile.js` type `run` in your command line
without any arguments:

    $ run
    Processing runfile.js...
    
    Available tasks:
    echo                    - echo task description
    buildjs                 - Compile JS files
    
Use `help` utility function for your task to get additional description:

```javascript
import { run, help } from 'runjs'

export function buildjs () {
  
}

help(buildjs, 'Compile JS files')
```

    $ run buildjs --help
    Processing runfile.js...
    
    Usage: buildjs
    
    Compile JS files
    
You can provide detailed annotation to give even more info about the task:

```javascript
import dedent from 'dedent'
import { run, help } from 'runjs'

export function test (file) {
  
}

help(test, {
  description: 'Run unit tests',
  params: ['file'],
  options: {
    watch: 'run tests in a watch mode'
  },
  examples: dedent`
    run test dummyComponent.js
    run test dummyComponent.js --watch
  `
})
```

    $ run test --help
    Processing runfile.js...
    
    Usage: test [options] [file]
    
    Run unit tests
    
    Options:
    
      --watch       run tests in a watch mode
      
    Examples:
    
    run test dummyComponent.js
    run test dummyComponent.js --watch


## Namespacing

When `runfile.js` gets large it is a good idea to extract some logic to external modules 
and import them back to `runfile.js`:


`./tasks/css.js`:

```javascript
export function compile () {
  ...
}
```

`./tasks/lint.js`:

```javascript
export function fix () {
  ...
}
```

`./tasks/common.js`:

```javascript
export function serve () {
  ...
}
```

`runfile.js`:

```javascript
import { run } from 'runjs'
import * as lint from './tasks/lint'
import * as css from './tasks/css'
import * as common from './tasks/common'

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


## Transpilers

Transpilers gives you an advantage of using ES6/ES7 features which may not be 
available for your node version.

So for example writing `runfile.js` with es6 imports/exports is possible:

```js
import { run } from 'runjs'

export function makeThatDir(name) {
  run(`mkdir ${name}`)
  console.log('Done!')
}
```

```bash
$ run makeThatDir somedir
mkdir somedir
Done!
```

#### Babel

If you want to use Babel transpiler for your `runfile.js` install it:

    npm install babel-core babel-preset-es2015 babel-register --save-dev

and in your `package.json` write:

```json
{
  "babel": {
    "presets": ["es2015"]
  },
  "runjs": {
    "requires": [
      "./node_modules/babel-register"
    ]
  }
}

```

RunJS will require defined transpiler before requiring `runfile.js` so you can
use all ES6/ES7 features which are not supported by your node version. 

    
#### TypeScript

If you want to use TypeScript transpiler for your runfile, install TypeScript 
tooling:

    npm install typescript ts-node --save-dev

and then in your `package.json` define a path to `ts-node/register` and 
`runfile.ts`.

```json
{
  "runjs": {
    "requires": [
      "./node_modules/ts-node/register"
    ],
    "runfile": "./runfile.ts"
  }
}
```

You need to also define custom path to your runfile as TypeScript files have
`*.ts` extension. RunJS will require defined transpiler before requiring 
`./runfile.ts`.


## API

For inside `runfile.js` usage

#### run(cmd, options)

run given command as a child process and log the call in the output. 
`./node_modules/.bin/` is included into PATH so you can call installed scripts directly.

```js
const { run } = require('runjs')
```

*Options:*

```javascript
{
    cwd: ..., // current working directory (String)
    async: ... // run command asynchronously (true/false), false by default
    stdio: ... // 'inherit' (default), 'pipe' or 'ignore'
    env: ... // environment key-value pairs (Object)
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
not printed out to the terminal. 

For `stdio: 'inherit'` (default) outputs are passed 
to the terminal, but `run` function will resolve (async) / return (sync)
`null`.

For `stdio: 'ignore'` nothing will be returned or printed


#### options(this)

A helper which returns an object with options which were given through dash params of command
line script.

```js
const { options } = require('runjs')
```

Example:

```bash
$ run lint --fix
```

```js
export function lint (path = '.') {
  options(this).fix ? run(`eslint ${path} --fix`) : run(`eslint ${path}`) 
}
```


#### help(func, annotation)

Define help annotation for task function, so it will be printed out when calling task with `--help`
option and when calling `run` without any arguments.

```js
const { help } = require('runjs')
```


```javascript
help(build, 'Generate JS bundle')

help(test, {
  description: 'Run unit tests',
  params: ['file'],
  options: {
    watch: 'run tests in a watch mode'
  },
  examples: `
    run test dummyComponent.js
    run test dummyComponent.js --watch
  `
})
```

    $ run build --help
    $ run test --help


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
setup which was described [above](#typescript) and async/await should just
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

