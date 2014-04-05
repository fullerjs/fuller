var options = [
    {
        name: 'watch',
        shortName: 'w',
        type: 'bool',
        help: 'Watch for changes',
        defaultValue: false
    },
    {
        name: 'src',
        help: 'Relative path to directory with source files',
    },
    {
        name: 'dst',
        help: 'Relative path to directory for compiled files',
    },
    {
        name: 'dev',
        shortName: 'z',
        type: 'bool',
        help: 'Developer mode (no minifing and compressions)',
    },
    {
        name: 'verbose',
        shortName: 'v',
        type: 'bool',
        help: 'Verbose mode',
        defaultValue: false
    }
];

module.exports = options;
