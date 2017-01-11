import {run} from 'runjs'

const task = {
  'echo': (...args) => {
    console.log('echo ' + args.join(' '))
  },
  'testapi': () => {
    run('ls -al')
    run('echo "\\033[33;44m Yellow text on blue background\\033[0m"')
  },
  'n1': {
    'nested1': () => {
      console.log('Nested task nr 1 executed!')
    }
  },
  'n1:nested2': () => {
    console.log('Nested task nr 2 executed!')
  }
};

task['echo'].doc = 'Simple echo task'
task['n1']['nested1'].doc = 'Description of nested task nr 1'
task['n1:nested2'].doc = 'Description of nested task nr 2'

export default task