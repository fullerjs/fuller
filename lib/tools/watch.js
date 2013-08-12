"use strict";
var fs = require('fs');
var path = require('path');

var watching = {};
var timeout = 1000;

var watchFile = function(file, cb) {
	if(watching[file] === undefined) {
		watching[file] = cb;

		return fs.watchFile(file, function(curr, prev) {
			if(curr.mtime > prev.mtime) {
				cb && cb(file);
			}
		});
	}
};

var watchFiles = function(root, tree, cb) {
	var f;

	for(f in tree) {

		if(f.indexOf(root) === -1) {
			f = path.join(root, f);
		}

		if(!fs.existsSync(f)) {
			continue;
		}

		watchFile(f, cb);
	}
};

module.exports = {
	watchFiles: watchFiles
};
