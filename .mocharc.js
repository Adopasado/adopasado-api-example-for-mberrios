module.exports = {
    diff: true,
    color: true,
    extension: ['js'],
    package: './package.json',
    reporter: 'spec',
    file: ['tests/api-jobs.test.js'],
    slow: 75,
    timeout: 20000,
    ui: 'bdd',
    'watch-files': ['src/**/*.js', 'tests/**/*.js'],
    'watch-ignore': ['node_modules/']
};