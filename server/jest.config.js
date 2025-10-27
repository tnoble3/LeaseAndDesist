export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 30000,
  extensionsToTreatAsEsm: ['.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
};
