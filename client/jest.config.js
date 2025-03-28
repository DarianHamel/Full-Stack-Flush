export default {
    testEnvironment: 'jest-environment-jsdom',
    transform: {
      '^.+\.jsx?$': 'babel-jest',
      '^.+\.css$': 'jest-transform-css',
    },
    moduleNameMapper: {
      '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transformIgnorePatterns: [
      '/node_modules/',
    ],
    collectCoverage: true,
    coverageReporters: ['text', 'html'],
    coverageDirectory: 'coverage',
    maxWorkers: 2, // Prevents excessive parallel workers
    restoreMocks: true, // Ensures clean mocks
    clearMocks: true, // Resets mock state before each test
    forceExit: true, // Prevents Jest from hanging
  };