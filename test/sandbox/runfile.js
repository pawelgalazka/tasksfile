import {run} from 'runjs'

const task = {
  'echo': (...args) => {
    console.log('echo ' + args.join(' '))
  },
  'testapi': () => {
    run('ls -al')
    run('echo "\\033[33;44m Yellow text on blue background\\033[0m"')
  }
};

task['echo'].doc = 'Simple echo task'

export default task