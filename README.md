# runjs ![node version](https://img.shields.io/node/v/runjs.svg) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pawelgalazka/runjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Minimalistic building tool

- [Get started](#get-started)
- [Why runjs ?](#why-runjs-)
- [Running tasks](#running-tasks)
- [API](#api)
- [Using Babel](#using-babel)
- [Scaling](#scaling)


## Get started

Install globally (for a command line script):

    npm install runjs -g

Install in your project (to use runjs api inside your `runfile.js`):

    npm install runjs --save-dev

If you want to use Babel, install it. RunJS will pickup your
`babel-register` automatically.

    npm install babel-core babel-preset-es2015 babel-register --save-dev

Configure Babel in your `package.json`:

    "babel": {
      "presets": ["es2015"]
    }

Create `runfile.js`:

```javascript

import {run} from 'runjs';

const task = {
    'create:component': (name) => {

    },
    'build:js': () => {
      run('webpack -p --config config/webpack/prod.js --progress');
    },
    'build:css': () => {

    },
    'build': () => {
      task['build:js']();
      task['build:css']();
    }
};

export default task
```
    
Run:
```
run create:component AppContainer
run build:js
run build
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
libraries which makes that approach much more flexible. Additionally 
each task and command call is reported in the console.

## Running tasks

To display all available tasks from your `runfile.js` type `run` in your command line
without any arguments:

    $ run
    Requiring babel-register...
    Processing runfile...
    
    Available tasks:
    echo
    testapi


## API

```javascript
import {run, generate} from 'runjs';
```

**run(cmd, options)**

run given command as a child process and log the call in the output. 
`./node_modules/.bin/` is included into PATH so you can call installed scripts directly.

Options:

```javascript
{
    cwd: .., // current working directory (String)
    async: ... // run command asynchronously (true/false)
    stdio: ... // 'inherit' (default), 'pipe' or 'ignore'
    env: ...
    timeout: ...
}
```

Examples:

```javascript
run('rm -rf ./build')
run('http-server .', {async: true}).then((output) => {
  log(output) 
}).catch((error) => {
  throw error
})
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

## Using Babel


If you have Babel and `babel-register` already installed, RunJS will pick up it
automatically and use it for you `runfile.js`. If RunJS not finds `babel-register` 
it will fallback to pure node.

RunJS performs better with `npm>=3.0` when using with Babel. It is because new
version of `npm` handles modules loading much more effective.
    
If you have very specific location for your `babel-register`, you can define
a path to it through config in your `package.json` (default path is 
`./node_modules/babel-register`):

    "runjs": {
        "babel-register": "./node_modules/some_package/node_modules/babel-register"
    }

## Scaling

When `runfile.js` gets large it is a good idea to extract some logic to external modules 
and import them back to `runfile.js`:

```javascript
import { run } from 'runjs'
import lint from './tasks/lint'
import css from './tasks/css'
import common from './tasks/common'

export default {
  css, // equals to css: css
  lint, // equals to lint: lint
  clean: () => {
    run('rm -rf node_modules') 
  },
  ...common,
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
run clean
run deploy:production
run staging:staging
```

You can notice a couple of approaches here but in general RunJS will treat object key as
a namespace. It is also possible to bump tasks directly without the namespace by using ES7 
object spread operator as with `common` tasks in the example above.
