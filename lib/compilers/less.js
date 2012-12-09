"use strict";
var fs = require('fs');
var path = require('path');
var async = require('async');
var lesscss = require('less');
var watchFiles = require('../watcher').watchFiles;

var addDependence = require('./utils').addDependence;

var FILE_ENCODING = 'utf-8';

var dependencies = {};

var less = function(src, dst, tree, compress, verbose) {
	this.tree = tree;
	this.compress = compress;
	this.verbose = verbose;
	this.src = src;
	this.dst = dst;

	this.parser = new lesscss.Parser({
		paths: [this.src],
		optimization: 0
	});
};

less.prototype.buildDependenciesOne = function(cssFile, cb) {
	var lessFile = this.tree[cssFile];

	this.parser.parse(fs.readFileSync(path.join(this.src, lessFile), FILE_ENCODING), function (err, tree) {
		if (err) {
			cb && cb(err);
		} else {
			var b, dep;
			addDependence(dependencies, lessFile, cssFile);
			for(b in tree.rules) {
				dep = tree.rules[b].path;
				if(dep) {
					addDependence(dependencies, dep, cssFile);
				}
			}
			cb && cb(null, 'ok');
		}
	});
};

less.prototype.buildDependencies = function(cb) {
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

less.prototype.build = function(floor, bricks, cbEach) {
	var self = this;
	return function(cb) {
			self.verbose && console.log("Building".green, path.join(self.dst, floor));
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

less.prototype.buildOne = function(src, dst, cb) {
	var self = this;

	this.parser.parse(fs.readFileSync(src, FILE_ENCODING), function (err, tree) {
		if (err) {
			cb && cb(err);
		} else {
			fs.writeFileSync(dst, tree.toCSS({compress: self.compress}), FILE_ENCODING);
			cb && cb(null, dst);
		}
	});
};

less.prototype.buildAll = function(cbEach, cbAll) {
	var queue = {}, floor;

	for(floor in this.tree) {
		queue[floor] = this.build(floor, this.tree[floor], cbEach);
	}

	async.series(queue, function(err, result) {
		cbAll && cbAll(err, result);
	});
};

less.prototype.watch = function(cbAll) {
	var self = this;


	async.waterfall([
		function(cb) {
			self.buildDependencies(cb);
		},

		function(result, cb) {
			watchFiles( self.src, dependencies, function(event, filename){
				var f, filesToBuild = dependencies[path.normalize(filename.substr(self.src.length + 1))];
				var queue = {};

				self.verbose && console.log("Changed ".red, filename);

				for(f in filesToBuild) {
					queue[f] = self.build(filesToBuild[f], self.tree[filesToBuild[f]]);
				}

				async.series(queue, cb);

			});
		}
	], cbAll);

};


module.exports = less;
