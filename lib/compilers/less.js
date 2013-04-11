"use strict";
var fs = require('fs');
var path = require('path');
var async = require('async');
var lesscss = require('less');

var watchFiles = require('../watcher').watchFiles;
var addDependence = require('./utils').addDependence;
var writeFileForce = require('./files').writeFileForce;

var FILE_ENCODING = 'utf-8';

var dependencies = {};
var verbose;

var Less = function(fuller) {
	if(!verbose) {
		verbose = fuller.verbose;
	}

	this.tree = fuller.plan.less;
	this.compress = !fuller.o.dev;

	this.src = path.join(fuller.home, fuller.o.src, 'less');
	this.dst = path.join(fuller.home, fuller.o.dst, 'css');
};

Less.prototype.buildDependenciesOne = function(cssFile, cb) {
	var lessFile = this.tree[cssFile];
	var parser = new lesscss.Parser({
		paths: [this.src],
		optimization: 0
	});

	parser.parse(fs.readFileSync(path.join(this.src, lessFile), FILE_ENCODING), function (err, tree) {
		if (err) {
			cb && cb(err);
		} else {
			var f, importFiles = parser.imports.files;

			addDependence(dependencies, lessFile, cssFile);

			for(f in importFiles) {
				addDependence(dependencies, f, cssFile);
			}

			cb && cb(null, 'ok');
		}
	});
};

Less.prototype.buildDependencies = function(cb) {
	var self = this, queue = {}, floor;

	var build = function(src) {
		return function(cb) {
				self.buildDependenciesOne(src, cb);
		};
	};

	for(floor in this.tree) {
		queue[floor] = build(floor);
	}

	async.series(queue, function(err, result) {
		if(err) {
			cb && cb(err);
		} else {
			cb && cb(null, result);
		}

	});
};

Less.prototype.build = function(floor, bricks, cbEach) {
	var self = this;
	return function(cb) {
			verbose.log("Building".green, path.join(self.dst, floor));
			self.buildOne(
				path.join(self.src, bricks),
				path.join(self.dst, floor),
				function(err, dst) {
					cb(err, dst);
					cbEach && cbEach(err, dst);
				}
			);
	};
};

Less.prototype.buildOne = function(src, dst, cb) {
	var self = this;
	var parser = new lesscss.Parser({
		paths: [this.src],
		optimization: 0
	});

	parser.parse(fs.readFileSync(src, FILE_ENCODING), function (err, tree) {
		if (err) {
			cb && cb(err);
		} else {
			writeFileForce(dst, tree.toCSS({compress: self.compress}), cb);
		}
	});
};

Less.prototype.buildAll = function(cbEach, cbDone) {
	var queue = {}, floor;

	for(floor in this.tree) {
		queue[floor] = this.build(floor, this.tree[floor], cbEach);
	}

	async.series(queue, function(err, result) {
		cbDone && cbDone(err, result);
	});
};

Less.prototype.watch = function(cb) {
	var self = this;

	async.waterfall([
		function(cb) {
			self.buildDependencies(cb);
		},

		function(result, cb) {
			watchFiles( self.src, dependencies, function(event, filename){
				var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];
				var queue = {};

				verbose.log("Changed ".red, filename);

				for(f in filesToBuild) {
					queue[f] = self.build(filesToBuild[f], self.tree[filesToBuild[f]]);
				}

				async.series(queue, cb);

			});
		}
	], cb);

};


module.exports = Less;
