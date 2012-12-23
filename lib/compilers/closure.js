"use strict";
var path = require('path');
var fs = require('fs');
var proc = require('child_process');
var exec = proc.exec;
var jar = path.join(__dirname, '../../support/closure.jar');

var buildOne = function (src, dst, cb) {
	var needClean = false;

	if(typeof dst === 'undefined' || typeof dst === 'function') {
		cb = dst;
		dst = src;
		fs.renameSync(src, src + '.tmp');
		src = src + '.tmp';
		needClean = true;
	}

	exec('java -jar ' + jar + ' --compilation_level ADVANCED_OPTIMIZATIONS --js=' + src + ' --js_output_file=' + dst, function (err, out, stderr) {
		if(needClean) {
			fs.unlinkSync(src);
		}

		if (err)  {
			cb && cb(err);
		} else {
			cb && cb(null, dst);
		}
	});
};

module.exports = {
    buildOne: buildOne
};
