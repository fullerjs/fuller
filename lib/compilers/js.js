"use strict";
var fs = require('fs');
var path = require('path');
var concat = require('./files').concat;
var uglify = require('./uglify').buildOne;
var closure = require('./closure').buildOne;

var watchFiles = require('../watcher').watchFiles;
var addDependence = require('./utils').addDependence;
var writeFileForce = require('./files').writeFileForce;

var FILE_ENCODING = 'utf-8';

var dependencies = [];
var verbose;

var JS = function(fuller) {
	if(!verbose) {
		verbose = fuller.verbose;
	}

	this.tree = fuller.plan.js;
	this.compress = !fuller.o.dev;
	this.compile = fuller.o.compile;

	this.src = path.join(fuller.home, fuller.o.src, 'js');
	this.dst = path.join(fuller.home, fuller.o.dst);

	this.prologue = fs.readFileSync( path.join(__dirname, '../fullerjs/prologue.js'), FILE_ENCODING);
	this.epilogue = fs.readFileSync( path.join(__dirname, '../fullerjs/epilogue.js'), FILE_ENCODING);
};

JS.prototype.buildDependencies = function() {
	var i, j, files;

	for(i in this.tree) {
		files = Array.isArray(this.tree[i]) ? this.tree[i] : this.tree[i].src;

		for(j in files) {
			addDependence(dependencies, files[j], i);
		}
	}
};

JS.prototype.buildOne = function(srcPath, src, dst, cb) {
	var self = this, bricks, p, a;

	p = ";(function(window, document, undefined){";
	a = "})(window, document);";

	var out = concat(srcPath, src, p, a);

    writeFileForce(dst, this.prologue + out + this.epilogue, function(err, result){
		if(err) {
			cb(err);
		} else {
			if(self.compress) {
				uglify(dst);
			}

			if(self.compile) {
				verbose.log("Compiling".green, dst);
				closure(dst, cb);
			} else {
				cb && cb(null, dst);
			}
		}
    });

};

JS.prototype.buildAll = function(cb) {
	var floor;
	for(floor in this.tree) {
		verbose.log("Building".green, path.join(this.dst, floor));
		this.buildOne(
			this.src,
			this.tree[floor],
			path.join(this.dst, floor),
			cb
		);
	}
};

JS.prototype.watch = function(cb) {
	var self =this;

	this.buildDependencies();

	watchFiles( this.src, dependencies, function(event, filename){
		var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];

		verbose.log("Changed".red, filename);

		for(f in filesToBuild) {
			verbose.log("Building".green, filesToBuild[f]);
			self.buildOne(
				self.src,
				self.tree[filesToBuild[f]],
				path.join(self.dst, filesToBuild[f])
			);
		}

		cb && cb(event, filename);

	});
};


module.exports = JS;
