/** @type {import('jest').Config} */
export default {
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: ['index.js'],
  testEnvironment: 'node',
};
