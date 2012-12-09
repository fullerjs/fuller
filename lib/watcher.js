"use strict";
var fs = require('fs');
var path = require('path');

var watching = [];

var watchFile = function(file, cb) {
	if(watching.indexOf(file) === -1) {
		watching.push(file);
		return fs.watch(file, function(e, f) {
			cb(e, file);
		});
	}
};

var watchFiles = function(root, tree, cb) {
	var f, file;

	for(f in tree) {
		file = path.join(root, f);
		if(!fs.existsSync(file)) {
			continue;
		}
		watchFile(file, cb);
	}
};

module.exports = {
	watchFiles: watchFiles
};
