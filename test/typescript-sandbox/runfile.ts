import { run } from 'runjs'

export function echo (...args) {
  console.log('ECHO', args, this.options)
}

export function testapi () {
  run('ls -al | cat')
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
