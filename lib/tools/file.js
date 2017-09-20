'use strict';
const path = require('path');

const treeToArray = function(srcPath, files) {
  return files.map(filePath => path.join(srcPath, filePath));
};

const addDependence = function(dependencies, master, slave) {
  if (!dependencies[master]) {
    dependencies[master] = [ slave ];
  } else if (dependencies[master].indexOf(slave) === -1) {
    dependencies[master].push(slave);
  }
};

module.exports = {
  treeToArray: treeToArray,
  addDependence: addDependence
};
