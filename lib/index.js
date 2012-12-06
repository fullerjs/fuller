"use strict";
var path = require('path');
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
		css: true
	});

	this.home = process.cwd();
	this.dst = path.join(this.home, this.o.dst);
	this.src = path.join(this.home, this.o.src);

	this.js = plan.js;
	this.less = plan.less;
};

Fuller.prototype.build = function() {
	if(this.js && this.o.js) {
		this.buildJS();
	}

	if(this.less && this.o.less) {
		this.buildLess();
	}
};

Fuller.prototype.buildJS = function() {
	var floor, bricks, lib, dst, a, p;
	var src = path.join(this.src, 'js');

	var prependLib = ";(function($, window, document, undefined){";
	var appendLib = "})(jQuery, window, document);";

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
		concat(src, bricks, dst, p, a);
		if(!this.o.dev) {
			uglify(dst);
		}
	}
};

Fuller.prototype.buildLess = function() {
	var floor;

	for(floor in this.less) {
		lesscss(	path.join(this.src, 'less', this.less[floor]),
					path.join(this.dst, 'css', floor),
					this.o.dev
		);
	}
};


module.exports = Fuller;
