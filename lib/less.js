"use strict";
var fs = require('fs');
var path = require('path');
var lesscss = require('less');

var FILE_ENCODING = 'utf-8';

function less(src, dst, opt) {
	var parser = new lesscss.Parser({
		paths: [path.dirname(src)],
		optimization: 0
	});

	parser.parse(fs.readFileSync(src, FILE_ENCODING), function (err, tree) {
		if (err) { return console.error(err); }
		fs.writeFileSync(dst, tree.toCSS({compress: opt}), FILE_ENCODING);
	});
}

module.exports = {
    less: less
};
