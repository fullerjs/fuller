'use strict';

module.exports = [
  {
    name: 'watch',
    shortName: 'w',
    help: 'Watch for changes',
    defaultValue: false
  },
  {
    name: 'src',
    help: 'Relative path to directory with source files'
  },
  {
    name: 'dst',
    help: 'Relative path to directory for compiled files'
  },
  {
    name: 'dev',
    shortName: 'z',
    help: 'Developer mode (no minifing and compressions)'
  },
  {
    name: 'verbose',
    shortName: 'v',
    help: 'Verbose mode',
    defaultValue: false
  }
];
