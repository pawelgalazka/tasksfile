import chalk from 'chalk'
import chProcess from 'child_process'
import template from 'lodash.template'
import fs from 'fs'
import path from 'path'

export function call (obj, args, cons = console) {
  let taskName = args[0]

  if (obj.default) {
    obj = obj.default
  }

  if (!taskName) {
    cons.log('Available tasks:')
    Object.keys(obj).forEach((t) => {
      cons.log(t)
    })
    return
  }

  Object.keys(obj).forEach((t) => {
    let task = obj[t]
    obj[t] = function () {
      let time = Date.now()
      cons.log(chalk.blue(`Running "${t}"...`))
      task.apply(null, arguments)
      time = ((Date.now() - time) / 1000).toFixed(2)
      cons.log(chalk.blue(`Finished "${t}" in ${time} sec`))
    }
  })

  let task = obj[taskName]
  if (task) {
    obj[taskName].apply(null, args.slice(1))
  } else {
    cons.log(chalk.red(`Task ${taskName} not found`))
  }
}

export function run (cmd, options = {}) {
  options.env = options.env || process.env
  let envPath = options.env.PATH ? options.env.PATH : process.env.PATH

  options.env.PATH = [
    `${process.cwd()}/node_modules/.bin/`, envPath
  ].join(path.delimiter)

  options.stdio = options.stdio || 'inherit'
  console.log(chalk.bold(cmd))
  if (options.async) {
    return new Promise((resolve, reject) => {
      const asyncProcess = chProcess.exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
          reject(error)
        } else {
          resolve(stdout)
        }
      })

      if (options.stdio === 'inherit') {
        asyncProcess.stdout.pipe(process.stdout)
        asyncProcess.stderr.pipe(process.stderr)
      }
    })
  }

  return chProcess.execSync(cmd, options)
}

export function generate (src, dst, context) {
  console.log(`Generating ${dst} from template ${src}`)
  let templateString = fs.readFileSync(src)
  let content = template(templateString)(context)
  fs.writeFileSync(dst, content)
}
