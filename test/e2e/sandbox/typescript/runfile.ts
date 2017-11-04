import { run, options } from '../../../../lib'

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
