# tasksfile ![node version](https://img.shields.io/node/v/tasksfile.svg) [![Build Status](https://travis-ci.org/pawelgalazka/tasksfile.svg?branch=master)](https://travis-ci.org/pawelgalazka/tasksfile) [![npm version](https://badge.fury.io/js/tasksfile.svg)](https://badge.fury.io/js/tasksfile)

Minimalistic building tool

> From version >= 5 RunJS was renamed to Tasksfile project which is currently in beta - unstable version.
> Link to stable RunJS version: https://github.com/pawelgalazka/runjs/tree/runjs

- [Get started](#get-started)
- [Why tasksfile ?](#why-tasksfile-)
- [Features](#features)
    - [Executing shell commands](#executing-shell-commands)
    - [Handling arguments](#handling-arguments)
    - [Documenting tasks](#documenting-tasks)
    - [Namespacing](#namespacing)
    - [Sharing tasks](#sharing-tasks)
    - [TypeScript support](#typescript-support)
- [API](#api)
    - [sh](#shcmd-options)
    - [help](#helpfunc-description-annotation)
    - [rawArgs](#rawArgs)


## Get started

Install tasksfile in your project

    npm install tasksfile --save-dev
    
Create `tasksfile.js` in your root project directory:

```js
const { sh, cli } = require('tasksfile')

function hello(options, name = 'Mysterious') {
  console.log(`Hello ${name}!`)
}

function makedir() {
  sh('mkdir somedir')
}

cli({
  hello,
  makedir
})
```

Create `task` entry in your `scripts` section in `package.json`:

```json
{
  "scripts": {
    "task": "node ./tasksfile.js"
  }
}
```

Call in your terminal through npm scripts:

```bash
$ npm run task -- hello Tommy
$ npm run task -- makedir
$ yarn task hello Tommy
$ yarn task makedir
```

or through shorter `npx task` alias:

```bash
$ npx task hello Tommy
Hello Tommy!
$ npx task makedir
mkdir somedir
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

[More](https://hackernoon.com/simple-build-tools-npm-scripts-vs-makefile-vs-runjs-31e578278162)


## Features

### Executing shell commands

Tasksfile gives an easy way to execute shell commands in your tasks by `sh` function
in synchronous and asynchronous way:

```js
const { sh, cli } = require('tasksfile')

function commands () {
  sh('jest')
  sh(`webpack-dev-server --config webpack.config.js`, {
    async: true
  })
}

cli({
  all
})
```

```bash
$ npx task commands
```

Because `./node_modules/.bin` is included in `PATH` when calling shell commands
by `sh` function, you can call "bins" from your local project in the same way as 
in npm scripts.

### Handling arguments

Provided arguments in the command line are passed to the function:


```javascript
function sayHello (options, who) {
  console.log(`Hello ${who}!`)
}

cli({
  sayHello
})
```

```bash
$ npx task sayHello world
Hello world!
```
    
You can also provide dash arguments like `-a` or `--test`. Order of them doesn't 
matter after task name. They will be always available by `options` helper 
from inside a function.

```javascript
function sayHello (options, who) {
  console.log(`Hello ${who}!`)
  console.log('Given options:', options)
}

cli({
  sayHello
})
```

```bash
$ npx task sayHello -a --test=something world
Hello world!
Given options: { a: true, test: 'something' }
```
    
    
### Documenting tasks

To display all available tasks for your `tasksfile.js` type `task` in your command line
without any arguments:

    $ npx task
    Available tasks:
    echo                    - echo task description
    buildjs                 - Compile JS files
    
Use `help` utility function for your task to get additional description:

```javascript
const { cli, help } = require('tasksfile')

function buildjs () {
  
}

help(buildjs, 'Compile JS files')

cli({
  buildjs
})
```

    $ npx task buildjs --help
    Usage: buildjs
    
    Compile JS files
    
You can provide detailed annotation to give even more info about the task:

```javascript
const dedent = require('dedent')
const { sh, help } = require('tasksfile')

function test (options, file) {
  
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

cli({
  test
})
```

    $ npx task test --help
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

cli({
  test
})
```

```bash
$ npx task test:unit
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

cli({
  test
})
```

```bash
$ npx task test:unit
Doing unit testing!
```

If we don't want to put imported tasks into a namespace, we can always use spread
operator:

```js
cli({
  ...test
})
```

```bash
$ npx task unit
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
$ npx task unit
$ npx task test:unit
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

cli({
  ...shared,
  local
})
```

```bash
$ npx task shared1
$ npx task shared2
$ npx task local
```

### TypeScript support

It's very easy to run your tasks in `TypeScript` if you have `TypeScript` already
in your project. Just:

- change your `tasksfile.js` to `tasksfile.ts` and adjust the code
- install `ts-node`: `npm install --save-dev ts-node`
- change command in your `package.json`:

```json
{
  "scripts": {
    "task": "ts-node ./tasksfile.ts"
  }
}
```

`Tasksfile` project already has `TypeScript` declaration files in source files.

## API

For inside `tasksfile.js` usage.

#### sh(cmd, options)

run given command as a child process and log the call in the output. 
`./node_modules/.bin/` is included into PATH so you can call installed scripts directly.

```js
const { sh } = require('tasksfile')
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

To get an output from `sh` function we need to set `stdio` option to `pipe` otherwise
`output` will be `null`:

```javascript
const output = sh('ls -la', {stdio: 'pipe'})
sh('http-server .', {async: true, stdio: 'pipe'}).then((output) => {
  log(output) 
}).catch((error) => {
  throw error
})
```

For `stdio: 'pipe'` outputs are returned but not forwarded to the parent process thus 
not printed out to the terminal. 

For `stdio: 'inherit'` (default) outputs are passed 
to the terminal, but `sh` function will resolve (async) / return (sync)
`null`.

For `stdio: 'ignore'` nothing will be returned or printed


#### help(func, description, annotation)

Define help annotation for task function, so it will be printed out when calling task with `--help`
option and when calling `run` without any arguments.

```js
const { help } = require('tasksfile')
```


```javascript
help(build, 'Generate JS bundle')

help(test, 'Run unit tests', {
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

    $ npx task build --help
    $ npx task test --help


#### rawArgs()

Returns arguments / options passed to task in a raw, unparsed format.

```javascript
const { cli, rawArgs } = require('tasksfile')

function hello(options) {
  console.log('RAW ARGS', rawArgs())
}

cli({
  hello
})
```

```sh
$ npx task hello 1 2 3 --test
RAW ARGS ['1', '2', '3', '--test']
```