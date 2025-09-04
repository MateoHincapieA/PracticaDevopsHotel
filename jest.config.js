require("dotenv").config();

module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: process.env.COVERAGE || 85,
      functions: process.env.COVERAGE || 85,
      lines: process.env.COVERAGE || 85,
      statements: process.env.COVERAGE || 85,
    },
  },
};
