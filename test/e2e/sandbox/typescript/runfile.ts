import { run, options } from '../../../../lib'

export function echo (...args) {
  console.log('echo', args, options(this))
}

export function command () {
  run('echo "sync"')
  run('echo "async"', { async: true })
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

  'nested2:echo': () => {
    console.log('Nested task nr 2 executed!')
  },

  all () {
    n1.nested1()
    n1['nested2:echo']()
  }
}
