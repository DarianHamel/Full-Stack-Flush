module.exports = {
    transform: {
        "^.+\\.jsx?$": "babel-jest"
    },
    testEnvironment: "node",
    collectCoverage: true,
    coverageReporters: ['text', 'html'],
    coverageDirectory: 'coverage',
}
