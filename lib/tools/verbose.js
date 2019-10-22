'use strict';
const { red, gray } = require('kleur');

function formatNum(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function getDate() {
  const d = new Date();
  return `${formatNum(d.getHours())}:${formatNum(d.getMinutes())}:${formatNum(d.getSeconds())}`;
}

class Verbose {
  constructor(level = false) {
    this.level = level;
  }

  level(level) {
    this.level = level;
    return this;
  }

  log(...args) {
    this.level && console.log(`[${ getDate() }] ${args.join(' ')}`);
    return this;
  }

  error(err) {
    console.log('err', err);
    let msg;

    if (err instanceof Error) {
      msg = err.toString().replace('Error:', '');
    } else if (typeof err === 'object') {
      msg = `${ err.message }\n\t   ` + red(`${ err.line }:${ err.column } `) + err.file;
      if (err.extract) {
        msg += gray(`\n${err.extract}`);
      }
    } else {
      msg = Array.from(arguments).join('\n');
    }

    console.log(`[${ getDate() }]`, red('Error:'), msg);
    return this;
  }
}

module.exports = Verbose;
