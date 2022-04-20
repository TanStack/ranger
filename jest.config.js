module.exports = {
  projects: [
    {
      displayName: 'ranger-core',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/ranger-core/**/*.test.[jt]s?(x)'],
      setupFilesAfterEnv: [
        '<rootDir>/packages/ranger-core/__tests__/jest.setup.js',
      ],
      snapshotFormat: {
        printBasicPrototype: false,
      },
    },
  ],
}
