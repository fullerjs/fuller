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
	var b, i, files, file;

	for(b in tree) {
		files = Array.isArray(tree[b]) ? tree[b] : tree[b].src;

		for(i in files) {
			file = path.join(root, files[i]);
			if(!fs.existsSync(file)) {
				continue;
			}
			watchFile(file, cb);
		}
	}
};

module.exports = {
	watchFiles: watchFiles
};
