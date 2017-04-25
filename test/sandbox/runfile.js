import { run, ask } from 'runjs'

export function echo (...args) {
  console.log('echo ' + args.join(' '))
}

export function testapi () {
  run('ls -al | cat')
}

export function testerror (async) {
  if (async) {
    run('node ./error_script.js', {async: true}).catch((error) => {
      console.log('ERROR', error)
    })
  } else {
    run('node ./error_script.js')
  }
}

export function testcolor () {
  run('node ./color_script.js')
  run('node ./color_script.js', {async: true})
}

export function testserver () {
  run('http-server', {async: true})
}

export function testasync () {
  run('ls -al | cat', {async: true}).then((data) => {
    console.log('DATA', data)
  }).catch((error) => {
    console.log('ERROR', error)
  })
}

export function testask () {
  ask('Who are you?').then((answer) => {
    console.log(`Hello ${answer}!`)
  })
}

export const n1 = {
  nested1 () {
    console.log('Nested task nr 1 executed!')
  },

  'nested2:echo': () => {
    console.log('Nested task nr 2 executed!')
  },

  all () {
    n1.nested1()
    n1['nested2:echo']()
  }
}


echo.doc = 'Simple echo task'
n1.nested1.doc = 'Description of nested task nr 1'
n1['nested2:echo'].doc = 'Description of nested task nr 2'
