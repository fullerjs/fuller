"use strict";
var path = require('path');
var colors = require('colors');
//var Watcher = require('./watcher');
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
	this.src = path.join(this.home, this.o.src);

	this.js = plan.js;
	this.less = plan.less;

	this.o.verbose && console.log("Mr. Fuller has got a plan...".bold.cyan);
};

Fuller.prototype.watch = function() {

};

Fuller.prototype.build = function() {
	if(this.js && this.o.js) {
		this.o.verbose && console.log("Building some js...".yellow);
		this.buildJS();
	}

	if(this.less && this.o.css) {
		this.o.verbose && console.log("Building some less...".yellow);
		this.buildLess();
	}
};

Fuller.prototype.buildJS = function() {
	var floor, bricks, dst, a, p;
	var src = path.join(this.src, 'js');

	for(floor in this.js) {
		if(Array.isArray(this.js[floor])) {
			bricks = this.js[floor];
			p = ";(function(window, document, undefined){";
			a = "})(window, document);";
		} else {
			bricks = this.js[floor].src;
			p = ";(function($, window, document, undefined){";
			a = "})(" + this.js[floor].lib + ", window, document);";
		}

		dst = path.join(this.dst, floor);
		this.o.verbose && console.log("Concatinating to".green, dst);
		concat(src, bricks, dst, p, a);
		if(!this.o.dev) {
			this.o.verbose && console.log("Uglifying ".green, src);
			uglify(dst);
		}
		this.o.verbose && console.log();
	}
};

Fuller.prototype.buildLess = function() {
	var floor, src;

	for(floor in this.less) {
		src = path.join(this.src, 'less', this.less[floor]);
		this.o.verbose && console.log("Compiling".green, src);
		lesscss(	src,
					path.join(this.dst, 'css', floor),
					this.o.dev
		);
	}
};


module.exports = Fuller;
