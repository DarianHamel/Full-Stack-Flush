export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'], 
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest', 
    '^.+\\.css$': 'jest-transform-css',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1', 
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-toastify)', 
  ],
  collectCoverage: true,
  coverageReporters: ['text', 'html', 'lcov'], 
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [ 
    '/node_modules/',
    '/src/design/', 
    'setupTests.js',
    'jest.config.js'
  ],
  testMatch: [ 
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}',
    '<rootDir>/__tests__/**/*.{spec,test}.{js,jsx}'
  ],
  maxWorkers: 2,
  restoreMocks: true,
  clearMocks: true,
  forceExit: true,
  
  testEnvironmentOptions: {
    url: 'http://localhost' 
  },
  
  moduleDirectories: ['node_modules', 'src']
};