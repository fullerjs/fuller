'use strict';
const path = require('path');

const rxReserved = new RegExp([ 'belt:', 'tools', 'options' ].join('|'));

const extendOptions = function(newOps, oldOps) {
  if (newOps) {
    if (newOps.src) {
      newOps.src = path.join(oldOps.src, newOps.src);
    }

    if (newOps.dst) {
      newOps.dst = path.join(oldOps.dst, newOps.dst);
    }
  }

  return Object.assign({}, oldOps, newOps);
};

module.exports = {
  rxReserved: rxReserved,
  extendOptions: extendOptions
};
