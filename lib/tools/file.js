"use strict";
let fs = require("fs");
let path = require("path");
let mkdirp = require("mkdirp");

const FILE_ENCODING = "utf-8";
const EOL = "\n";

let concat = function (srcPath, src, prepend, append) {
	let out = src.map(function(filePath){
		return (prepend || "") + fs.readFileSync( path.join(srcPath, filePath), FILE_ENCODING) + (append || "");
	});

	return out.join(EOL);
};

let treeToArray = function (srcPath, files) {
	return files.map(function(filePath){
		return path.join(srcPath, filePath);
	});
};

let writeForce = function (file, data, cb) {
	fs.writeFile(file, data, FILE_ENCODING, function(er) {
		if (er && er.errno === 34) {
			mkdirp(path.dirname(file), function(err) {
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

let addDependence = function(dependencies, master, slave) {
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
