'use strict';
const path = require('path');

function treeToArray(srcPath, files) {
  return files.map(filePath => path.join(srcPath, filePath));
}

function addDependence(dependencies, master, slave) {
  if (!dependencies[master]) {
    dependencies[master] = [ slave ];
  } else if (dependencies[master].indexOf(slave) === -1) {
    dependencies[master].push(slave);
  }
}

module.exports = {
  treeToArray,
  addDependence
};
