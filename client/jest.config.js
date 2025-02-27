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
  };