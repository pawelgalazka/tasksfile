/* eslint-env jest */
import chalk from "chalk"
import { TasksfileError } from "../../src/common"
import * as script from "../../src/script"

describe("script", () => {
  let logger: any
  let mockLogger: any

  beforeEach(() => {
    mockLogger = jest.fn()
    logger = {
      error: (...args: any[]) => {
        mockLogger("error", ...args)
      },
      log: (...args: any[]) => {
        mockLogger("log", ...args)
      },
      title: (...args: any[]) => {
        mockLogger("title", ...args)
      },
      warning: (...args: any[]) => {
        mockLogger("warning", ...args)
      }
    }
  })

  describe("describe()", () => {
    let obj: any
    beforeEach(() => {
      obj = {
        a: () => {},
        b: () => {}
      }
    })

    it("should log list of methods", () => {
      script.describe(obj, logger)
      expect(mockLogger.mock.calls).toEqual([
        ["log", chalk.yellow("Available tasks:")],
        ["log", chalk.bold("a")],
        ["log", chalk.bold("b")],
        [
          "log",
          "\n" +
            chalk.blue(
              'Type "task [taskname] --help" to get more info if available.'
            )
        ]
      ])
    })

    it("should log method descriptions", () => {
      // @ts-ignore
      obj.b = (arg1: any, arg2: any) => {}
      obj.a.help = "Description for method a"
      obj.b.help = "Description for method b"
      script.describe(obj, logger)
      expect(mockLogger.mock.calls).toEqual([
        ["log", chalk.yellow("Available tasks:")],
        [
          "log",
          chalk.bold("a") + "                              ",
          "-",
          "Description for method a"
        ],
        [
          "log",
          chalk.bold("b") + "                              ",
          "-",
          "Description for method b"
        ],
        [
          "log",
          "\n" +
            chalk.blue(
              'Type "task [taskname] --help" to get more info if available.'
            )
        ]
      ])
    })

    it("should log only first line of method descriptions", () => {
      obj.a.help = "Description for method a\nsecond line\nthird line"
      obj.b.help = "Description for method b"
      script.describe(obj, logger)
      expect(mockLogger.mock.calls).toEqual([
        ["log", chalk.yellow("Available tasks:")],
        [
          "log",
          chalk.bold("a") + "                              ",
          "-",
          "Description for method a"
        ],
        [
          "log",
          chalk.bold("b") + "                              ",
          "-",
          "Description for method b"
        ],
        [
          "log",
          "\n" +
            chalk.blue(
              'Type "task [taskname] --help" to get more info if available.'
            )
        ]
      ])
    })

    it("should log list of name spaced / nested methods", () => {
      obj.c = {
        d: () => {},
        e: {
          f: () => {},
          g: () => {}
        }
      }

      obj.c.help = "Description for namespace c"
      obj.c.e.f.help = "Description for method f"

      script.describe(obj, logger)
      expect(mockLogger.mock.calls).toEqual([
        ["log", chalk.yellow("Available tasks:")],
        ["log", chalk.bold("a")],
        ["log", chalk.bold("b")],
        ["log", chalk.bold("c:d")],
        [
          "log",
          chalk.bold("c:e:f") + "                          ",
          "-",
          "Description for method f"
        ],
        ["log", chalk.bold("c:e:g")],
        [
          "log",
          "\n" +
            chalk.blue(
              'Type "task [taskname] --help" to get more info if available.'
            )
        ]
      ])
    })
  })

  describe("call()", () => {
    let obj: any
    let a: any
    let c: any
    let e: any
    let h: any
    beforeEach(() => {
      a = jest.fn()
      c = jest.fn()
      e = jest.fn()
      h = jest.fn()
      obj = {
        a,
        b: {
          c,
          d: {
            e
          }
        },
        "f:g:h": h
      }
    })

    it("calls the method from a given object by given method name and its arguments", () => {
      script.call(obj, ["node", "task", "a"])
      expect(a).toHaveBeenLastCalledWith()
      script.call(obj, ["node", "task", "a", "1", "2"])
      expect(a).toHaveBeenLastCalledWith("1", "2")
    })

    it("should handle dash arguments", () => {
      let calls: any = {}

      function fn(this: any, ...args: any[]) {
        calls.args = args
        calls.options = this.options
      }

      obj.a = fn

      script.call(obj, ["node", "task", "a", "-a", "hello"])
      expect(calls).toEqual({ args: ["hello"], options: { a: true } })
      calls = {}
      script.call(obj, ["node", "task", "a", "hello", "-a"])
      expect(calls).toEqual({ args: ["hello"], options: { a: true } })
      script.call(obj, ["node", "task", "a", "--abc", "hello"])
      expect(calls).toEqual({ args: ["hello"], options: { abc: true } })
      script.call(obj, ["node", "task", "a", "-a=123", "hello"])
      expect(calls).toEqual({ args: ["hello"], options: { a: 123 } })
      script.call(obj, ["node", "task", "a", "--abc=test", "hello"])
      expect(calls).toEqual({ args: ["hello"], options: { abc: "test" } })
      script.call(obj, ["node", "task", "a", "-a", "--abc=test", "hello"])
      expect(calls).toEqual({
        args: ["hello"],
        options: { a: true, abc: "test" }
      })
      script.call(obj, [
        "node",
        "task",
        "a",
        "-a",
        "--abc=test",
        "-b=4",
        "hello",
        "-abc",
        "--def"
      ])
      expect(calls).toEqual({
        args: ["hello", "-abc"],
        options: { a: true, b: 4, abc: "test", def: true }
      })
      script.call(obj, [
        "node",
        "task",
        "a",
        "--ab-cd",
        "--ef-gh=test",
        "--ab.cd",
        "--ef.gh=123",
        "hello",
        "-abc"
      ])
      expect(calls).toEqual({
        args: ["hello", "-abc"],
        options: { "ab-cd": true, "ef-gh": "test", "ab.cd": true, "ef.gh": 123 }
      })
      script.call(obj, [
        "node",
        "task",
        "a",
        "--host=http://www.google.com/",
        "hello"
      ])
      expect(calls).toEqual({
        args: ["hello"],
        options: { host: "http://www.google.com/" }
      })
    })

    it("should handle dash arguments in nested tasks", () => {
      let calls: any = {}

      function fn(this: any, ...args: any[]) {
        calls.args = args
        calls.options = this.options
      }

      obj.b.c = fn

      script.call(obj, ["node", "task", "b:c", "-a", "hello"])
      expect(calls).toEqual({ args: ["hello"], options: { a: true } })
      calls = {}
      script.call(obj, ["node", "task", "b:c", "hello", "-a"])
      expect(calls).toEqual({ args: ["hello"], options: { a: true } })
    })

    it("should call methods from nested objects by method name name-spacing", () => {
      script.call(obj, ["node", "task", "a", "1", "2"])
      expect(a).toHaveBeenLastCalledWith("1", "2")
      script.call(obj, ["node", "task", "b:c", "1", "2"])
      expect(c).toHaveBeenLastCalledWith("1", "2")
      script.call(obj, ["node", "task", "b:d:e", "1", "2"])
      expect(e).toHaveBeenLastCalledWith("1", "2")
      script.call(obj, ["node", "task", "f:g:h", "1", "2"])
      expect(h).toHaveBeenLastCalledWith("1", "2")
    })

    it("should raise an error if called method cannot be found", () => {
      expect(() => {
        script.call(obj, ["node", "task", "abc"])
      }).toThrowError("Task abc not found")

      expect(() => {
        script.call(obj, ["node", "task", "abc"])
      }).toThrowError(TasksfileError)

      expect(() => {
        script.call(obj, ["node", "task", "b:d"])
      }).toThrowError("Task b:d not found")
    })
  })
})
