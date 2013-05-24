"use strict";
var fs = require('fs');
var path = require('path');

var mkdirp = function(dirPath, mode, cb) {
	if (typeof mode === 'function' || mode === undefined) {
		cb = mode;
		mode = parseInt('0777', 8) & (~process.umask());
	}

	if(typeof mode === 'string') {
		mode = parseInt(mode, 8);
	}

	fs.exists(dirPath, function(exists) {
		if(exists) {
			cb(null, dirPath);
		} else {
			fs.mkdir(dirPath, mode, function(err) {
				if (err) {
					if(err.errno === 34) {
						mkdirp(path.dirname(dirPath), mode, function() {
							mkdirp(dirPath, mode, cb);
						});
					} else {
						cb && cb(err);
					}
				} else {
					cb && cb(null, dirPath);
				}
			});
		}
	});
};

module.exports = {
    mkdirp: mkdirp
};
