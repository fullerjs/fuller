"use strict";
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var watchFiles = require('./watcher').watchFiles;
var extend = require('ops').applyDefaults;
var concat = require('./files').concat;

var uglify = require('./uglify').uglify;
var lesscss = require('./less').less;

var Fuller = function(opt) {
	var plan = require(opt.plan);

	this.o = extend(plan.global, {
		dev: !!(opt.dev),
		src: './',
		dst: './',
		js: true,
		css: true,
		verbose: !!(opt.verbose)
	});

	this.home = process.cwd();
	this.dst = path.join(this.home, this.o.dst);
	this.srcJS = path.join(this.home, this.o.src, 'js');
	this.srcLESS = path.join(this.home, this.o.src, 'less');

	this.deps = {}; // for all dependencies
	this.js = plan.js;
	this.less = plan.less;

	this.o.verbose && console.log("Mr. Fuller has got a plan...".bold.cyan);
};

Fuller.prototype.watch = function() {
	var self = this;

	this.o.verbose && console.log("Start to watch for...".yellow);

	this.buildDeps();

	if(this.js && this.o.js) {
		watchFiles( this.srcJS, this.js, function(event, filename){
			var ext = path.extname(filename);
			var f, filesToBuild = self.deps[path.normalize(filename.substr(self.srcJS.length + 1))];
			self.o.verbose && console.log("Changed ".red, filename);
			switch(ext) {
				case '.js':
					for(f in filesToBuild) {
						self.o.verbose && console.log("Building ".green, filesToBuild[f]);
						self.buildJS(self.srcJS, self.js[filesToBuild[f]], path.join(self.dst, filesToBuild[f]));
					}
					break;

				case '.less':
					break;
			}
		});
	}
};

Fuller.prototype.buildDeps = function() {
	var i, j, files;
	for(i in this.js) {
		files = Array.isArray(this.js[i]) ? this.js[i] : this.js[i].src;

		for(j in files) {
			if(!this.deps[files[j]]) {
				this.deps[files[j]] = [i];
			} else if(this.deps[files[j]].indexOf(i) === -1) {
				this.deps[files[j]].push(i);
			}
		}
	}
};

Fuller.prototype.build = function() {
	if(this.js && this.o.js) {
		this.o.verbose && console.log("Building some js...".yellow);
		this.buildAllJS();
	}

	if(this.less && this.o.css) {
		this.o.verbose && console.log("Building some less...".yellow);
		this.buildLess();
	}
};

// JS
Fuller.prototype.buildJS = function(srcPath, src, dst) {
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

	this.o.verbose && console.log("Concatinating to".green, dst);
	concat(srcPath, bricks, dst, p, a);
	if(!this.o.dev) {
		this.o.verbose && console.log("Uglifying ".green, dst);
		uglify(dst);
	}
};

Fuller.prototype.buildAllJS = function() {
	var floor;

	for(floor in this.js) {
		this.buildJS(this.srcJS, this.js[floor], path.join(this.dst, floor));
		this.o.verbose && console.log();
	}
};


// LESS
Fuller.prototype.buildLess = function() {
	var floor, src;

	for(floor in this.less) {
		src = path.join(this.srcLESS, this.less[floor]);
		this.o.verbose && console.log("Compiling".green, src);
		lesscss(	src,
					path.join(this.dst, 'css', floor),
					this.o.dev
		);
	}
};


module.exports = Fuller;
