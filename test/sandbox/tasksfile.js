const { sh, help, cli } = require('../../lib')

function echo(...args) {
  console.log('echo', args)
}

function commands() {
  sh('echo "sync terminal"')
  console.log('output', sh('echo "sync pipe"', { stdio: 'pipe' }))
  sh('echo "async terminal"', { async: true })
  sh('echo "async terminal"', { async: true, stdio: 'pipe' }).then(output =>
    console.log('output', output)
  )
}

function described(options, p1, p2) {
  console.log(p1, p2, options)
}

const nested = {
  echo(...args) {
    console.log('nested echo', args)
  }
}

function localbin() {
  sh('hello')
}

async function asyncawait() {
  const output = await sh('echo "async and await"', {
    async: true,
    stdio: 'pipe'
  })
  console.log('output', output)
  console.log('after await')
}

function error() {
  sh('node ../scripts/error.js', { async: true })
  sh('node ../scripts/error.js')
}

function color() {
  sh('node ../scripts/color.js')
  sh('node ../scripts/color.js', { async: true })
}

help(echo, 'Simple echo task')
help(nested.echo, 'Description of nested task')
help(described, 'Task description', {
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
