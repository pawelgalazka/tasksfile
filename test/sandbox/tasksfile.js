const { sh, help, cli } = require('../../lib')

help(echo, 'Simple echo task')

function echo(...args) {
  console.log('echo', args)
}

const nested = {
  echo(...args) {
    console.log('nested echo', args)
  },

  default (...args) {
    console.log('nested default', args)
  }
}

help(nested.echo, 'Description of nested task', {
  options: {
    foo: 'foo option description',
    bar: 'bar option description'
  },
  params: ['p1', 'p2']
})

function shell() {
  sh('echo "sync terminal"')
  console.log('output', sh('echo "sync silent"', {silent: true}))
  sh('echo "async terminal"', { async: true })
  sh('echo "async silent"', { async: true, silent: true}).then(output =>
    console.log('output', output)
  )
}

function npmBin() {
  sh('hello')
}

async function asyncAwait() {
  const output = await sh('echo "async and await"', {
    async: true,
    silent: true
  })
  console.log('output', output)
  console.log('after await')
}

function error() {
  sh('node ./scripts/error.js', { async: true })
  sh('node ./scripts/error.js')
}

async function errorAsyncAwait() {
  await Promise.reject(new Error('async await error'))
}

function color() {
  sh('node ./scripts/color.js')
  sh('node ./scripts/color.js', { async: true })
}


cli({
  echo,
  shell,
  nested,
  npmBin,
  asyncAwait,
  errorAsyncAwait,
  error,
  color
})
