# tasksfile ![node version](https://img.shields.io/node/v/tasksfile.svg) [![Build Status](https://travis-ci.org/pawelgalazka/tasksfile.svg?branch=master)](https://travis-ci.org/pawelgalazka/tasksfile) [![npm version](https://badge.fury.io/js/tasksfile.svg)](https://badge.fury.io/js/tasksfile)

Minimalistic building tool

> RunJS was renamed to Tasksfile project which is currently in beta - unstable version.
> Link to stable RunJS verion: https://github.com/pawelgalazka/runjs/tree/runjs

- [Get started](#get-started)
- [Why tasksfile ?](#why-tasksfile-)
- [Features](#features)
    - [Executing shell commands](#executing-shell-commands)
    - [Handling arguments](#handling-arguments)
    - [Documenting tasks](#documenting-tasks)
    - [Namespacing](#namespacing)
    - [Sharing tasks](#sharing-tasks)
    - [Autocompletion](#autocompletion)
- [Transpilers](#transpilers)
    - [Babel](#babel)
    - [TypeScript](#typescript)
- [API](#api)
    - [task](#taskcmd-options)
    - [options](#optionsthis)
    - [help](#helpfunc-annotation)
- [Using Async/Await](#using-asyncawait)


## Get started

Install tasksfile in your project

    npm install tasksfile --save-dev
    
Create `tasksfile.js` in your root project directory:

```js
const { run } = require('tasksfile')

function hello(name = 'Mysterious') {
  console.log(`Hello ${name}!`)
}

function makedir() {
  run('mkdir somedir')
}

module.exports = {
  hello,
  makedir
}
```

Call in your terminal:

```bash
$ npx task hello Tommy
Hello Tommy!
$ npx task makedir
mkdir somedir
```

> For node < 8.2, [npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-taskner-55f7d4bd282b)
is not available, so doing `npm install -g tasksfile-cli` is neccessary which installs
global `task` script. After that above task would be called like: `task hello Tommy`

Mechanism of Tasksfile is very simple. Tasks are run by just importing `tasksfile.js` as a
normal node.js module. Then based on command line arguments proper exported function
from `tasksfile.js` is called.

Tasksfile in a nutshell

```js
const tasksfile = require(path.resolve('./tasksfile'))
const taskName = process.argv[2]
const { options, params } = parseArgs(process.argv.slice(2))

tasksfile[taskName].apply({ options }, params)
```


## Why tasksfile ?

We have Grunt, Gulp, npm scripts, Makefile. Why another building tool ?

Gulp or Grunt files seem overly complex for what they do and the plugin
ecosystem adds a layer of complexity towards the simple command
line tools underneath. The documentation is not always up to date
and the plugin does not always use the latest version of the tool.
After a while customizing the process even with simple things,
reconfiguring it becomes time consuming.

Npm scripts are simple but they get out of hand pretty quickly if
we need more complex process which make them quite hard to read
and manage.

Makefiles are simple, better for more complex processes
but they depend on bash scripting. Within `tasksfile` you can use
command line calls as well as JavaScript code and npm
libraries which makes that approach much more flexible.

[More](https://hackernoon.com/simple-build-tools-npm-scripts-vs-makefile-vs-tasksfile-31e578278162)


## Features

### Executing shell commands

Tasksfile gives an easy way to execute shell commands in your tasks by `run` function
in synchronous and asynchronous way:

```js
const { run } = require('tasksfile')

function commands () {
  run('jest')
  run(`webpack-dev-server --config webpack.config.js`, {
    async: true
  })
}

module.exports = {
  all
}
```

```bash
$ run commands
```

Because `./node_modules/.bin` is included in `PATH` when calling shell commands
by `run` function, you can call "bins" from your local project in the same way as 
in npm scripts.

### Handling arguments

Provided arguments in the command line are passed to the function:


```javascript
function sayHello (who) {
  console.log(`Hello ${who}!`)
}

module.exports = {
  sayHello
}
```

```bash
$ task sayHello world
Hello world!
```
    
You can also provide dash arguments like `-a` or `--test`. Order of them doesn't 
matter after task name. They will be always available by `options` helper 
from inside a function.

```javascript
const { options } = require('tasksfile')

function sayHello (who) {
  console.log(`Hello ${who}!`)
  console.log('Given options:', options(this))
}

module.exports = {
  sayHello
}
```

```bash
$ task sayHello -a --test=something world
Hello world!
Given options: { a: true, test: 'something' }
```
    
    
### Documenting tasks

To display all available tasks for your `tasksfile.js` type `task` in your command line
without any arguments:

    $ task
    Processing tasksfile.js...
    
    Available tasks:
    echo                    - echo task description
    buildjs                 - Compile JS files
    
Use `help` utility function for your task to get additional description:

```javascript
const { task, help } = require('tasksfile')

function buildjs () {
  
}

help(buildjs, 'Compile JS files')

module.exports = {
  buildjs
}
```

    $ task buildjs --help
    Processing tasksfile.js...
    
    Usage: buildjs
    
    Compile JS files
    
You can provide detailed annotation to give even more info about the task:

```javascript
const dedent = require('dedent')
const { run, help } = require('tasksfile')

function test (file) {
  
}

help(test, {
  description: 'Run unit tests',
  params: ['file'],
  options: {
    watch: 'run tests in a watch mode'
  },
  examples: dedent`
    task test dummyComponent.js
    task test dummyComponent.js --watch
  `
})

module.exports = {
  test
}
```

    $ task test --help
    Processing tasksfile.js...
    
    Usage: test [options] [file]
    
    Run unit tests
    
    Options:
    
      --watch       run tests in a watch mode
      
    Examples:
    
    task test dummyComponent.js
    task test dummyComponent.js --watch


### Namespacing

To better organise tasks, it is possible to call them from namespaces:
```js
const test = {
  unit () {
    console.log('Doing unit testing!')
  }
}

module.exports = {
  test
}
```

```bash
$ task test:unit
Doing unit testing!
```

This is especially useful if `tasksfile.js` gets too large. We can move some tasks
to external modules and import them back to a namespace:

`./tasks/test.js`:

```javascript
function unit () {
  console.log('Doing unit testing!')
}

function integration () {
  console.log('Doing unit testing!')
}

module.exports = {
  unit,
  integration
}
```

`tasksfile.js`
```js
const test = require('./tasks/test')

module.exports = {
  test
}
```

```bash
$ task test:unit
Doing unit testing!
```

If we don't want to put imported tasks into a namespace, we can always use spread
operator:

```js
module.exports = {
  ...test
}
```

```bash
$ task unit
Doing unit testing!
```

With ES6 modules import/export syntax this becomes even simpler:

```js
// export with no namespace
export * from './tasks/test' // no namespace

// export with namespace
import * as test from './tasks/test'
export { test } // add namespace
```

```bash
$ task unit
$ task test:unit
```

### Sharing tasks

Because `tasksfile.js` is just a node.js module and `tasksfile` just calls exported
functions from that module based on cli arguments, nothing stops you to move 
some repetitive tasks across your projects to external npm package and 
just reuse it.

`shared-tasksfile` module:
```js
function shared1 () {
  console.log('This task is shared!')
}

function shared2 () {
  console.log('This task is shared!')
}

module.exports = {
  shared1,
  shared2
}
```

Local `tasksfile.js`
```js
const shared = require('shared-tasksfile')

function local () {
  console.log('This task is local!')
}

module.exports = {
  ...shared,
  local
}
```

```bash
$ task shared1
$ task shared2
$ task local
```

### Autocompletion

After setting up autocompletion, suggestions about available
tasks from your `tasksfile.js` will be given when calling `task <tab>`.

> This is an experimental feature. It will work slowly if you
use transpiler with your `tasksfile.js`. It won't work also
with `npx task <task>` calls, `npm -g install tasksfile-cli` is necessary,
so you could do calls like `task <task>`.

Setup process:

1. `task --completion >> ~/tasksfile.completion.sh`
2. `echo 'source ~/tasksfile.completion.sh' >> .bash_profile`
3. Restart your shell (reopen terminal)

> Depending on your shell, use proper bootstrap files accordingly.

> If you get errors like `_get_comp_words_by_ref command not found`
you need to install [bash completion](https://github.com/scop/bash-completion)
package. For MacOS users doing `brew install bash-completion` should
do the job and then adding `[ -f /usr/local/etc/bash_completion ] && ./usr/local/etc/bash_completion`.
to your `~/.bash_profile`.


## Transpilers

Transpilers gives you an advantage of using ES6/ES7 features which may not be 
available in your node version.

So for example writing `tasksfile.js` with es6 imports/exports is possible:

```js
import { run } from 'tasksfile'

export function makeThatDir(name) {
  run(`mkdir ${name}`)
  console.log('Done!')
}
```

```bash
$ task makeThatDir somedir
mkdir somedir
Done!
```

#### Babel

If you want to use Babel transpiler for your `tasksfile.js` install it:

    npm install babel-core babel-preset-es2015 babel-register --save-dev

and in your `package.json` write:

```json
{
  "babel": {
    "presets": ["es2015"]
  },
  "tasksfile": {
    "requires": [
      "./node_modules/babel-register"
    ]
  }
}

```

Tasksfile will require defined transpiler before requiring `tasksfile.js` so you can
use all ES6/ES7 features which are not supported by your node version. 

    
#### TypeScript

If you want to use TypeScript transpiler for your tasksfile, install TypeScript 
tooling:

    npm install typescript ts-node --save-dev

and then in your `package.json` define a path to `ts-node/register` and 
`tasksfile.ts`.

```json
{
  "tasksfile": {
    "requires": [
      "./node_modules/ts-node/register"
    ],
    "tasksfile": "./tasksfile.ts"
  }
}
```

You need to also define custom path to your tasksfile as TypeScript files have
`*.ts` extension. Tasksfile will require defined transpiler before requiring 
`./tasksfile.ts`.


## API

For inside `tasksfile.js` usage.

#### run(cmd, options)

run given command as a child process and log the call in the output. 
`./node_modules/.bin/` is included into PATH so you can call installed scripts directly.

```js
const { run } = require('tasksfile')
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

A helper which returns an object with options which were given through dash 
params of command line script.

```js
const { options } = require('tasksfile')
```

Example:

```bash
$ task lint --fix
```

```js
function lint (path = '.') {
  options(this).fix ? run(`eslint ${path} --fix`) : run(`eslint ${path}`) 
}
```

To execute a task in JS with options:

```js
lint.call({ options: { fix: true }}, './component.js')
```


#### help(func, annotation)

Define help annotation for task function, so it will be printed out when calling task with `--help`
option and when calling `run` without any arguments.

```js
const { help } = require('tasksfile')
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
    task test dummyComponent.js
    task test dummyComponent.js --watch
  `
})
```

    $ task build --help
    $ task test --help


## Using Async/Await

For node >= 7.10 it is possible to use async functions out of the box since node 
will support them natively.

Expected usage in your tasksfile:

```javascript
const { run } = require('tasksfile')

async function testasyncawait () {
  await run('ls -al | cat', {async: true}).then((data) => {
    console.log('DATA', data)
  })
  console.log('After AWAIT message')
}

module.exports = {
  testasyncawait
}
```

and then just

```
$ task testasyncawait
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
    "tasksfile": {
      "requires": [
        "./node_modules/babel-polyfill",
        "./node_modules/babel-register"
      ]
    }

