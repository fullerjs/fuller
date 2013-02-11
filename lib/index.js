"use strict";
var fs = require('fs');
var path = require('path');
var proc = require('child_process');
var exec = proc.exec;
var colors = require('colors');
var extend = require('ops').applyDefaults;

var errReport = require('./error').errReport;
var Verbose = require('./verbose');

var JS = require('./compilers/js');
var Less = require('./compilers/less');

var Fuller = function(plan, opt) {
	this.plan = plan;
	this.o = extend(opt, plan.defaults);
	this.home = process.cwd();
	this.compilers = {};

	this.verbose = new Verbose(this.o.verbose);
	this.verbose.log("Mr. Fuller has got a plan...".bold.cyan);

	if(this.o.dev && this.plan.tasks && this.plan.tasks.dev) {
		this.plan.tasks.dev(this);
	}

	if(this.plan.js && this.o.js) {
		this.compilers.js = new JS(this);
	}

	if(this.plan.less && this.o.css) {
		this.compilers.less = new Less(this);
	}

};

Fuller.prototype.watch = function() {
	var c;

	this.verbose.log("Start to watching for...".yellow);

	for(c in this.compilers) {
		this.compilers[c].watch(errReport);
	}
};


Fuller.prototype.build = function(cb) {
	var self = this, c;

	for(c in this.compilers) {
		this.verbose.log("Building some".yellow, c.yellow,"...".yellow);
		this.compilers[c].buildAll(errReport(cb));
	}
};

Fuller.prototype.run = function(cmd, cb) {
	var self = this;

	if(!cb) {
		cb = function (err, out, stderr) {
			if(err)  {
				console.log(stderr);
			} else {
				self.verbose.log(out);
			}
		};
	}

	this.verbose.log('Running'.red, cmd);
	exec(cmd, cb);
};


module.exports = Fuller;
