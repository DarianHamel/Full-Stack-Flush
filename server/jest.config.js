module.exports = {
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    },
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ['text', 'html'],
    coverageDirectory: 'coverage',
    maxWorkers: 2, // Prevents excessive parallel workers
    restoreMocks: true, // Ensures clean mocks
    clearMocks: true, // Resets mock state before each test
    forceExit: true, // Prevents Jest from hanging
}
