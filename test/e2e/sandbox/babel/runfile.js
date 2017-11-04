import { run, options } from '../../../../lib'

export function echo (...args) {
  console.log('echo', args, options(this))
}

export function command () {
  run('echo "sync"')
  run('echo "async"', { async: true })
}

export const nested = {
  echo (...args) {
    console.log('nested echo', args, options(this))
  }
}

export function testerror (async) {
  if (async) {
    run('node ./scripts/error.js', {async: true}).catch((error) => {
      console.log('ERROR', error)
    })
  } else {
    run('node ./scripts/error.js')
  }
}

export function testcolor () {
  run('node ./scripts/color.js')
  run('node ./scripts/color.js', {async: true})
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

export async function testasyncawait () {
  await run('ls -al | cat', {async: true}).then((data) => {
    console.log('DATA', data)
  })
  console.log('After AWAIT message')
}

export const n1 = {
  nested1 () {
    console.log('Nested task nr 1 executed!')
  },

  'nested2:echo': (arg1, arg2) => {
    console.log('Nested task nr 2 executed!')
  },

  all () {
    n1.nested1()
    n1['nested2:echo']()
  }
}

echo.help = 'Simple echo task'
n1.nested1.help = 'Description of nested task nr 1'
n1['nested2:echo'].help = 'Description of nested task nr 2\nsecond line'
