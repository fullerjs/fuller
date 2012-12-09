"use strict";

var addDependence = function(dependencies, master, slave) {
	if(!dependencies[master]) {
		dependencies[master] = [slave];
	} else if(dependencies[master].indexOf(slave) === -1) {
		dependencies[master].push(slave);
	}
};

module.exports = {
	addDependence: addDependence
};
