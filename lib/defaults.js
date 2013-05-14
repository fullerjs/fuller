var options = [
    {
        name: 'watch',
        shortName: 'w',
        type: 'bool',
        help: 'Watch source directory for changes',
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
        name: 'js',
        shortName: 'j',
        type: 'bool',
        help: 'Compile js only',
    },
    {
        name: 'css',
        shortName: 's',
        type: 'bool',
        help: 'Compile css only',
    },
    {
        name: 'dev',
        shortName: 'z',
        type: 'bool',
        help: 'Developer version (no minifing and compressions)',
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
