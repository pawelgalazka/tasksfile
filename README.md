# runjs

Minimalistic building system


## Get started

Install:

    npm install runjs -g

Create runfile.js:

```javascript
var run = require('runjs').run;

exports.showFiles = function(){
    run('ls');
}

exports.mkdir = function(name){
    run('mkdir ' + name);
}
```
    
Run:

    $ run showFiles
    $ run mkdir test

Tips:

* runfile.coffee files are accepted as well
* ./node_modules/.bin/ is included into PATH when running commands by "run" method
* executing `run` command without arguments displays list of all available tasks
* by executing "run('some-command', {async: true})" you can execute command asynchronously
* each call of exported functions is logged to console as well as commands called by "run" method


## Example

More practical build example (runfile.coffee). Stack: systemjs, reactjs, less, coffeescript.

```coffeescript
run = require('runjs').run
fs = require 'fs'
_ = require 'lodash'
chokidar = require 'chokidar'
sleep = require('sleep').sleep
crypto = require('crypto')

template = (src, dst, context) ->
  template = fs.readFileSync src
  content = _.template(template)(context)
  fs.writeFileSync dst, content

timeHash = () ->
  time = Date.now()
  crypto.createHash('sha1').update(time.toString()).digest 'hex'

exports.install = ->
  run 'npm install'
  run 'jspm install'

exports.reinstall = ->
  exports.uninstall()
  exports.install()

exports.tests = ->
  run 'jest'

exports['clean:dist'] = ->
  run 'rm -rf dist/*'

exports['clean:all'] = ->
  exports['clean:dist']()
  run 'rm -rf node_modules'

exports['build:index'] = (conf) ->
  template 'src/index.html', 'dist/index.html', conf

exports['build:dev'] = ->
  run 'rsync -r src/ dist/ --exclude=jspm_packages --exclude=.git --exclude=.gitkeep --exclude=config.js --delete'
  run 'coffee --map --compile .', cwd: './dist'
  run 'lessc app.less app.css --source-map', cwd: './dist'
  run 'jspm unbundle'
  if '--compiled' in arguments
    fingerprint = timeHash()
    exports['build:index'](compiled: true, fingerprint: fingerprint)
    run "jspm bundle app dist/app.#{fingerprint}.min.js --minify"
    run "cleancss app.css -o app.#{fingerprint}.min.css", cwd: './dist'
  else
    exports['build:index'](compiled: false)
    run 'jspm bundle react + react-dom dist/react.bundle.js --inject'

exports.watch = ->
  console.log 'Starting coffee watch...'
  coffee = chokidar.watch 'src/*.coffee'
  coffee.on 'change', (path) ->
    distPath = path.replace /^src\//, 'dist/'
    run "cp #{path} #{distPath}"
    run "coffee --map --compile #{distPath}"

  console.log 'Starting less watch...'
  less = chokidar.watch 'src/*.less'
  less.on 'change', (path) ->
    run 'lessc src/app.less dist/app.css --source-map'

exports['serve:dev'] = ->
  exports['build:dev'](arguments...)
  run 'http-server -p 9090 dist/', async: true
  run 'live-reload --port 9091 dist/', async: true
  sleep 1
  run 'open -a "Google Chrome" http://localhost:9090'
  exports.watch() if '--compiled' not in arguments
```

Console output of `run build:dev`:

    Running "build:dev"...
    rsync -r src/ dist/ --exclude=jspm_packages --exclude=.git --exclude=.gitkeep --exclude=config.js --delete
    coffee --map --compile .
    lessc app.less app.css --source-map
    jspm unbundle
    ok   Bundle configuration removed.
    Running "build:index"...
    Finished "build:index" in 0.01 sec
    jspm bundle react + react-dom dist/react.bundle.js --inject
         Building the bundle tree for react + react-dom...

           github:jspm/nodelibs-process@0.1.1
           github:jspm/nodelibs-process@0.1.1/index
           npm:fbjs@0.1.0-alpha.4/lib/EventListener
                .
                .
                .

    ok   react.bundle added to config bundles.
    ok   Built into dist/react.bundle.js with source maps, unminified.
    Finished "build:dev" in 4.55 sec
