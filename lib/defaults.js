'use strict';
const defaultConcurrency = require('os').cpus().length;

module.exports = [
  {
    name: 'watch',
    shortName: 'w',
    help: 'Watch for changes',
    defaultValue: false
  },
  {
    name: 'plan',
    shortName: 'p',
    help: 'Plan file',
    defaultValue: 'plan.js'
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
    name: 'task',
    shortName: 't',
    help: 'Name of the task to run',
    defaultValue: 'default'
  },
  {
    name: 'verbose',
    shortName: 'v',
    help: 'Verbose mode',
    defaultValue: false
  },
  {
    name: 'concurrency',
    shortName: 'c',
    help: 'Number of concurrent tasks',
    defaultValue: defaultConcurrency
  }
];
