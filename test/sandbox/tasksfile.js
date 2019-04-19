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

help(nested.echo, 'Description of nested task')

function commands() {
  sh('echo "sync terminal"')
  console.log('output', sh('echo "sync pipe"', { stdio: 'pipe' }))
  sh('echo "async terminal"', { async: true })
  sh('echo "async terminal"', { async: true, stdio: 'pipe' }).then(output =>
    console.log('output', output)
  )
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
  sh('node ./scripts/error.js', { async: true })
  sh('node ./scripts/error.js')
}

function color() {
  sh('node ./scripts/color.js')
  sh('node ./scripts/color.js', { async: true })
}


cli({
  echo,
  commands,
  nested,
  localbin,
  asyncawait,
  error,
  color
})
