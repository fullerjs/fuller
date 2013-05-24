"use strict";
var file = require('./file');
var path = require('./path');
var watch = require('./watch');

module.exports = {
	concat: file.concat,
	treeToArray: file.treeToArray,
	writeForce: file.writeForce,
	addDependence: file.addDependence,
	mkdirp: path.mkdirp,
	watchFiles: watch.watchFiles
};
