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

export async function testasyncawait () {
  await run('ls -al | cat', {async: true}).then((data) => {
    console.log('DATA', data)
  })
  console.log('After AWAIT message')
}

echo.help = 'Simple echo task'
nested.echo.help = 'Description of nested task'
