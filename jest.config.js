/** @type {import('ts-jest').JestConfigWithTsJest} */
process.env.TZ = 'UTC';

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './',
    fakeTimers: {
        enableGlobally: true,
    },
};
