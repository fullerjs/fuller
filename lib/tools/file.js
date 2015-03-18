"use strict";
let path = require("path");

let treeToArray = function (srcPath, files) {
	return files.map(function(filePath){
		return path.join(srcPath, filePath);
	});
};

let addDependence = function(dependencies, master, slave) {
	if(!dependencies[master]) {
		dependencies[master] = [slave];
	} else if(dependencies[master].indexOf(slave) === -1) {
		dependencies[master].push(slave);
	}
};

module.exports = {
	treeToArray: treeToArray,
	addDependence: addDependence
};
