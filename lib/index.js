"use strict";
var path = require('path');
var extend = require('ops').applyDefaults;
var concat = require('./files').concat;
var uglify = require('./uglify').uglify;

var Fuller = function(opt) {
	var plan = require(opt.plan);

	this.o = extend(plan.global, {
		dev: false,
		src: './',
		dst: './',
	});

	this.home = process.cwd();
	this.dst = path.join(this.home, this.o.dst);
	this.src = path.join(this.home, this.o.src);

	this.js = plan.js;
};

Fuller.prototype.build = function() {
	if(this.js) {
		this.buildJS();
	}

	// if(this.less) {
	//	buildLess();
	// }

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

module.exports = Fuller;
