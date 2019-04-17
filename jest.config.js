// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // A list of paths to directories that Jest should use to search for files in.
  roots: ["<rootDir>/src/", "<rootDir>/test/"],
  
  // The test environment that will be used for testing
  testEnvironment: "node",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "text",
    "text-summary"
  ],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    "global": {
      "lines": 35
    }
  }
};