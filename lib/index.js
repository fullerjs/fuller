"use strict";
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var extend = require('ops').applyDefaults;

var errReport = require('./error').errReport;
var Verbose = require('./verbose');

var JS = require('./compilers/js');
var Less = require('./compilers/less');

var Fuller = function(opt) {
	var plan = require(opt.plan);
	this.o = extend(opt, plan.defaults);
	var home = process.cwd();
	this.compilers = {};

	this.js = plan.js;
	this.less = plan.less;

	this.verbose = new Verbose(this.o.verbose);
	this.verbose.log("Mr. Fuller has got a plan...".bold.cyan);

	if(this.o.dev && plan.tasks && plan.tasks.dev) {
		plan.tasks.dev(this);
	}

	if(this.js && this.o.js) {
		this.compilers.js = new JS(
			path.join(home, this.o.src, 'js'),
			path.join(home, this.o.dst),
			this.js,
			!this.o.dev,
			this.o.compile,
			this.o.verbose
		);
	}

	if(this.less && this.o.css) {
		this.compilers.less = new Less(
			path.join(home, this.o.src, 'less'),
			path.join(home, this.o.dst, 'css'),
			this.less,
			!this.o.dev,
			this.o.verbose
		);
	}

};

Fuller.prototype.watch = function() {
	var c;

	this.verbose.log("Start to watching for...".yellow);

	for(c in this.compilers) {
		this.compilers[c].watch(errReport);
	}
};


Fuller.prototype.build = function() {
	var self = this, c;

	for(c in this.compilers) {
		this.verbose.log("Building some".yellow, c.yellow,"...".yellow);
		this.compilers[c].buildAll(errReport);
	}
};


module.exports = Fuller;
