# runjs 2.2 ![node version](https://img.shields.io/node/v/runjs.svg) [![Build Status](https://travis-ci.org/pawelgalazka/runjs.svg?branch=master)](https://travis-ci.org/pawelgalazka/runjs) [![npm version](https://badge.fury.io/js/runjs.svg)](https://badge.fury.io/js/runjs) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pawelgalazka/runjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

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
* if you have `babel-register` or `babel/register` module available in you package
runjs will use them for es6 compilation, if not it will use babel from runjs repository

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

## Runfile example

```javascript
import {run, generate, watch} from 'runjs';
import fs from 'fs';
import crypto from 'crypto';
import {sleep} from 'sleep';
import express from 'express';

let task = {};

function timeHash(){
    let time = Date.now();
    return crypto.createHash('sha1').update(time.toString()).digest('hex');
}

function exist(path){
    try {
        fs.accessSync(path, fs.F_OK);
        return true;
    } catch(e){
        return false;
    }
}

task.echo = () => {
    console.log('echo');
};

task.install = () => {
    run('npm install');
    run('jspm install');
    task['build:dev:configure'](true);
};

task.uninstall = () => {
    task['clean:dist']();
    task['clean:cache']();
    run('rm -rf node_modules');
};

task.test = () => {
    run('mocha');
};

task['clean:dist'] = () => {
    run('rm -rf dist/*');
};

task.cmd = (...args) => {
    run(args.join(' '));
};

task['build:dev:configure'] = (force) => {
    if(!exist('dist/react.bundle.js') || force){
        run('jspm bundle react + react-dom dist/react.bundle.js --inject');
    }
};

task.watch = () => {
    watch('src/app.less', () => {
        run('lessc src/app.less dist/app.css --source-map');
    });

    watch('src/*.jsx', (path) => {
        let outPath = path.split('/');
        outPath.shift();
        outPath.unshift('dist');
        outPath = outPath.join('/');
        outPath = outPath.split('.');
        outPath.pop();
        outPath.push('js');
        outPath = outPath.join('.');
        run(`babel ${path} --out-file ${outPath} --source-maps inline`);
    });
};

task['build:template'] = (src, dst, context) => {
    generate(src, dst, context);
};

task['build:dev'] = () => {
    run('lessc src/app.less dist/app.css --source-map-map-inline');
    run('babel src --out-dir dist --source-maps inline');
    run('rm dist/config.js');
    task['build:template']('src/index.tpl.html', 'dist/index.html', {compiled: false});
    task['build:dev:configure']();
};

task['build:dist'] = () => {
    task['clean:dist']();
    let fingerprint = timeHash();
    task['build:template']('src/index.tpl.html', 'dist/index.html', {compiled: true, fingerprint: fingerprint});
    run(`jspm bundle-sfx app dist/app.${fingerprint}.js --minify`);
    run(`cleancss src/app.css -o dist/app.${fingerprint}.css`);
};

task['serve:express'] = (prod) => {
    let port = 9090;
    let app = express();
    app.use(express.static('dist', {etag: true}));
    if(!prod){
        app.use(express.static('src', {etag: true}));
    }
    let server = app.listen(port);
    console.log('Express static server listening at http://localhost:%s', port);
};

task['serve:dev'] = () => {
    task['build:dev']();
    task['serve:express']();
    run('live-reload --port 9091 dist', {async: true});
    sleep(1);
    run('open -a "Google Chrome" http://localhost:9090');
    task.watch();
};

task['serve:dist'] = () => {
    task['build:dist']();
    task['serve:express'](true);
    sleep(1);
    run('open -a "Google Chrome" http://localhost:9090');
};


export default task;
```
