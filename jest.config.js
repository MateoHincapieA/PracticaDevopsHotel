module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: process.env.COVERAGE || 60,
      functions: process.env.COVERAGE || 60,
      lines: process.env.COVERAGE || 60,
      statements: process.env.COVERAGE || 60,
    },
  },
};
