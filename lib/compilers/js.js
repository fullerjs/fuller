"use strict";
var fs = require('fs');
var path = require('path');
var concat = require('./files').concat;
var uglify = require('./uglify').buildOne;
var closure = require('./closure').buildOne;
var watchFiles = require('../watcher').watchFiles;

var addDependence = require('./utils').addDependence;

var FILE_ENCODING = 'utf-8';

var dependencies = [];

var js = function(src, dst, tree, compress, compile, verbose) {
	this.tree = tree;
	this.compress = compress;
	this.compile = compile;
	this.verbose = verbose;
	this.src = src;
	this.dst = dst;
};

js.prototype.buildDependencies = function() {
	var i, j, files;

	for(i in this.tree) {
		files = Array.isArray(this.tree[i]) ? this.tree[i] : this.tree[i].src;

		for(j in files) {
			addDependence(dependencies, files[j], i);
		}
	}
};

js.prototype.buildOne = function(srcPath, src, dst, cb) {
	var bricks, p, a;

	if(Array.isArray(src)) {
		bricks = src;
		p = ";(function(window, document, undefined){";
		a = "})(window, document);";
	} else {
		bricks = src.src;
		p = ";(function($, window, document, undefined){";
		a = "})(" + src.lib + ", window, document);";
	}

	concat(srcPath, bricks, dst, p, a);
	if(this.compress) {
		uglify(dst);
	}

	if(this.compile) {
		closure(dst, cb);
	} else {
		cb && cb(null, dst);
	}
};

js.prototype.buildAll = function(cb) {
	var floor;

	for(floor in this.tree) {
		this.verbose && console.log("Building".green, path.join(this.dst, floor));
		this.buildOne(
			this.src,
			this.tree[floor],
			path.join(this.dst, floor),
			cb
		);
	}
};

js.prototype.watch = function(cb) {
	var self =this;

	this.buildDependencies();

	watchFiles( this.src, dependencies, function(event, filename){
		var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];

		self.verbose && console.log("Changed ".red, filename);

		for(f in filesToBuild) {
			self.verbose && console.log("Building ".green, filesToBuild[f]);
			self.buildOne(
				self.src,
				self.tree[filesToBuild[f]],
				path.join(self.dst, filesToBuild[f])
			);
		}

		cb && cb(event, filename);

	});
};


module.exports = js;
