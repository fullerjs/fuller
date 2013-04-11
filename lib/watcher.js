"use strict";
var fs = require('fs');
var path = require('path');

var watching = [];
var timeout = 1000;

var watchFile = function(file, cb) {
	if(watching.indexOf(file) === -1) {
		watching.push(file);
		var timer;
		return fs.watch(file, function(e, f) {
			if(!timer) {
				timer = setTimeout(function(){
					timer = undefined;
					cb(e, file);
				}, timeout);
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
