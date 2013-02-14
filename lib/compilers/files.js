"use strict";

var fs = require('fs');
var path = require('path');
var mkdirParent = require('./paths').mkdirParent;

var FILE_ENCODING = 'utf-8',
    EOL = '\n';

var concat = function (srcPath, src, prepend, append) {
    var out = src.map(function(filePath){
        return (prepend || '') + fs.readFileSync( path.join(srcPath, filePath), FILE_ENCODING) + (append || '');
    });

    return out.join(EOL);
};

var writeFileForce = function (file, data, cb) {
	fs.writeFile(file, data, FILE_ENCODING, function(err, result) {
		if (err && err.errno === 34) {
			mkdirParent(path.dirname(file), function(err, result) {
				if(err) {
					cb && cb(err);
				} else {
					writeFileForce(file, data, cb);
				}
			});
		} else {
			cb && cb(null, file);
		}
	});
};

module.exports = {
    concat: concat,
    writeFileForce: writeFileForce
};
