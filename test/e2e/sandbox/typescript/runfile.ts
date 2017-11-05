import { run, options, help } from '../../../../lib'

export function echo (...args) {
  console.log('echo', args, options(this))
}

export function commands () {
  run('echo "sync terminal"')
  console.log('output', run('echo "sync pipe"', { stdio: 'pipe' }))
  run('echo "async terminal"', { async: true })
  run('echo "async terminal"', { async: true, stdio: 'pipe' })
    .then(output => console.log('output', output))
}

export function described(p1, p2) {
  console.log(p1, p2, options(this))
}

export const nested = {
  echo (...args) {
    console.log('nested echo', args, options(this))
  }
}

export function localbin () {
  run('hello')
}

export async function asyncawait () {
  const output = await run('echo "async and await"', {async: true, stdio: 'pipe'})
  console.log('output', output)
  console.log('after await')
}

export function error () {
  run('node ../../scripts/error.js', {async: true})
  run('node ../../scripts/error.js')
}

help(echo, 'Simple echo task')
help(nested.echo, 'Description of nested task')
help(described, {
  description: 'Task description',
  params: ['p1', 'p2'],
  options: {
    foo: 'foo option'
  }
})
