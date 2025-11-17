// jest.config.js
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Exclude server entry point
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 60,
      statements: 60
    }
  }
};
