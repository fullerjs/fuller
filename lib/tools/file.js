"use strict";
var fs = require('fs');
var path = require('path');
var mkdirp = require('./path').mkdirp;

var FILE_ENCODING = 'utf-8',
    EOL = '\n';

var concat = function (srcPath, src, prepend, append) {
    var out = src.map(function(filePath){
        return (prepend || '') + fs.readFileSync( path.join(srcPath, filePath), FILE_ENCODING) + (append || '');
    });

    return out.join(EOL);
};

var treeToArray = function (srcPath, files) {
    return files.map(function(filePath){
        return path.join(srcPath, filePath);
    });
};

var writeForce = function (file, data, cb) {
	fs.writeFile(file, data, FILE_ENCODING, function(err, result) {
		if (err && err.errno === 34) {
			mkdirp(path.dirname(file), function(err, result) {
				if(err) {
					cb && cb(err);
				} else {
					writeForce(file, data, cb);
				}
			});
		} else {
			cb && cb(null, file);
		}
	});
};

var addDependence = function(dependencies, master, slave) {
	if(!dependencies[master]) {
		dependencies[master] = [slave];
	} else if(dependencies[master].indexOf(slave) === -1) {
		dependencies[master].push(slave);
	}
};

module.exports = {
	concat: concat,
	treeToArray: treeToArray,
	writeForce: writeForce,
	addDependence: addDependence
};
