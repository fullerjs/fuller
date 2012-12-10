"use strict";
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var extend = require('ops').applyDefaults;

var JS = require('./compilers/js');
var Less = require('./compilers/less');

var Fuller = function(opt) {
	var plan = require(opt.plan);

	console.log(opt.plan);
	this.o = extend(opt, plan.defaults);

	var home = process.cwd();
	this.compilers = {};

	if(plan.js && this.o.js) {
		this.compilers.js = new JS(
			path.join(home, this.o.src, 'js'),
			path.join(home, this.o.dst),
			plan.js,
			!this.o.dev,
			this.o.verbose
		);
	}

	if(plan.less && this.o.css) {
		this.compilers.less = new Less(
			path.join(home, this.o.src, 'less'),
			path.join(home, this.o.dst, 'css'),
			plan.less,
			!this.o.dev,
			this.o.verbose
		);
	}

	this.o.verbose && console.log("Mr. Fuller has got a plan...".bold.cyan);
};

Fuller.prototype.watch = function() {
	var c;

	this.o.verbose && console.log("Start to watching for...".yellow);

	for(c in this.compilers) {
		this.compilers[c].watch();
	}
};


Fuller.prototype.build = function() {
	var self = this, c;

	for(c in this.compilers) {
		this.o.verbose && console.log("Building some".yellow, c.yellow,"...".yellow);
		this.compilers[c].buildAll();
	}
};


module.exports = Fuller;
