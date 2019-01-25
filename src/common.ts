import chalk from 'chalk'

export class TasksfileError extends Error {
  constructor(message: string) {
    message = message && message.split('\n')[0] // assign only first line
    super(message)
  }
}

export interface ILogger {
  title(...args: any[]): void
  log(...args: any[]): void
  warning(...args: any[]): void
  error(...args: any[]): void
}

export class Logger implements ILogger {
  public title(...args: any[]) {
    console.log(chalk.bold(...args))
  }
  public log(...args: any[]) {
    console.log(...args)
  }
  public warning(...args: any[]) {
    console.warn(chalk.yellow(...args))
  }
  public error(...args: any[]) {
    console.error(chalk.red(...args))
  }
}

export class SilentLogger implements ILogger {
  public title() {}
  public log() {}
  public warning() {}
  public error() {}
}

export const logger = new Logger()
