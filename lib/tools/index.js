"use strict";
var file = require('./file');

module.exports = {
	concat: file.concat,
	treeToArray: file.treeToArray,
	writeForce: file.writeForce,
	addDependence: file.addDependence
};
