/* eslint-env jest */
import { execSync } from "child_process"

describe("tasksfile", () => {
  function sh(cmd: string) {
    return execSync(cmd, {
      cwd: "./test/e2e/sandbox",
      stdio: "pipe"
    }).toString()
  }

  it("executes simple task", () => {
    expect(sh("../../../bin/task.js echo 1 2 3 --foo --bar")).toContain(
      "echo [ '1', '2', '3' ] { foo: true, bar: true }"
    )
  })

  it("executes shell commands in a task", () => {
    const output = sh("../../../bin/task.js commands")
    expect(output).toContain(
      'echo "sync terminal"\nsync terminal\necho "sync pipe"\noutput sync pipe'
    )
    expect(output).toContain("\nasync terminal\n")
    expect(output).toContain("\noutput async terminal\n")
  })

  it("executes name spaced tasks", () => {
    expect(sh("../../../bin/task.js nested:echo 1 2 3 --foo --bar")).toContain(
      "echo [ '1', '2', '3' ] { foo: true, bar: true }"
    )
  })

  it("includes ./node_modules/.bin to PATH when executing commands", () => {
    sh("cp -p ../scripts/hello.js ./node_modules/.bin/hello")
    expect(sh("../../../bin/task.js localbin")).toContain("Hello!")
  })

  it("executes tasks with async and await", () => {
    expect(sh("../../../bin/task.js asyncawait")).toContain(
      'echo "async and await"\noutput async and await\n\nafter await'
    )
  })

  it("displays help for a task", () => {
    expect(sh("../../../bin/task.js echo --help")).toContain("Simple echo task")
  })

  it("displays error from executed command", () => {
    expect(() => sh("../../../bin/task.js error")).toThrow(
      "Command failed: ../../../bin/task.js error"
    )
  })
})
