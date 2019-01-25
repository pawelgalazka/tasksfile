const { run, options, help } = require('../../../lib')
const { cli } = require('../../../lib/script')

function echo(...args) {
  console.log('echo', args, options(this))
}

function commands() {
  run('echo "sync terminal"')
  console.log('output', run('echo "sync pipe"', { stdio: 'pipe' }))
  run('echo "async terminal"', { async: true })
  run('echo "async terminal"', { async: true, stdio: 'pipe' }).then(output =>
    console.log('output', output)
  )
}

function described(p1, p2) {
  console.log(p1, p2, options(this))
}

const nested = {
  echo(...args) {
    console.log('nested echo', args, options(this))
  }
}

function localbin() {
  run('hello')
}

async function asyncawait() {
  const output = await run('echo "async and await"', {
    async: true,
    stdio: 'pipe'
  })
  console.log('output', output)
  console.log('after await')
}

function error() {
  run('node ../scripts/error.js', { async: true })
  run('node ../scripts/error.js')
}

function color() {
  run('node ../scripts/color.js')
  run('node ../scripts/color.js', { async: true })
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

cli({
  echo,
  commands,
  described,
  nested,
  localbin,
  asyncawait,
  error,
  color
})
