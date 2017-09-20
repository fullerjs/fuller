'use strict';
const chalk = require('chalk');

const formatNum = function(num) {
  return num < 10 ? `0${num}` : `${num}`;
};

const getDate = function() {
  const d = new Date();
  return `${formatNum(d.getHours())}:${formatNum(d.getMinutes())}:${formatNum(d.getSeconds())}`;
};

const Verbose = function() {
  this.v = false;
};

Verbose.prototype.level = function(verbose) {
  this.v = verbose;
  return this;
};

Verbose.prototype.log = function(...args) {
  this.v && console.log(`[${ getDate() }]`, args.join(' '));
  return this;
};

Verbose.prototype.error = function(err) {
  let msg;

  if (err instanceof Error) {
    msg = err.toString().replace('Error:', '');
  } else if (typeof err === 'object') {
    msg = `${ err.message }\n\t   ` + chalk.red(`${ err.line }:${ err.column } `) + err.file;
    if (err.extract) {
      msg += chalk.grey(`\n${err.extract}`);
    }
  } else {
    msg = Array.prototype.slice.call(arguments).join('\n');
  }

  console.log(`[${ getDate() }]`, chalk.red('Error:'), msg);
  return this;
};

module.exports = Verbose;
