"use strict";
var fs = require('fs');
var path = require('path');
var proc = require('child_process');
var exec = proc.exec;
var colors = require('colors');
var extend = require('ops').applyDefaults;

var errReport = require('./error').errReport;
var Verbose = require('./verbose');
var FileTools = require('./tools');

var toolsCache = {};

var Fuller = function(plan, opt) {
	var home = process.cwd();

	this.plan = plan;
	this.o = extend(opt, plan.defaults);
	this.pathes = {
		home: home,
		tools: path.join(home, 'node_modules'),
		src: path.join(home, this.o.src || ''),
		dst: path.join(home, this.o.dst || ''),
	};

	this.tools = {};

	this.verbose = new Verbose(this.o.verbose);
	this.verbose.log("Mr. Fuller has got a plan...".bold.cyan);

	if(this.o.dev && this.plan.tasks && this.plan.tasks.dev) {
		this.plan.tasks.dev(this);
	}

	this.tools = this.loadTools(plan.tools);
};

Fuller.prototype.requireTool = function(tool) {
	if(!toolsCache[tool]) {
		try {
			toolsCache[tool] = require(path.join(this.pathes.tools, 'fuller-' + tool));
		} catch(e) {
			this.verbose.error(e.message);
			process.exit();
		}
	}

	return toolsCache[tool];
};

Fuller.prototype.loadTools = function(tools) {
	var currentTools = {}, Tool;

	for(var t in tools) {
		if(typeof tools[t] === 'object') {
			Tool = this.requireTool(t);
			currentTools[t] = new Tool(this, tools[t]);
		} else {
			Tool = this.requireTool(tools[t]);
			currentTools[tools[t]] = new Tool(this);
		}
	}

	return currentTools;
};

Fuller.prototype.getTool = function(tool) {
	if(tool === 'files') {
		return FileTools;
	}

	return this.tools[tool];
};

Fuller.prototype.watch = function() {
	var t, tool;

	for(t in this.tools) {
		tool = this.tools[t];

		if(tool.watch) {
			this.verbose.log("Start to watching for some".yellow, t.yellow,"...".yellow);
			tool.watch();
		}
	}
};

Fuller.prototype.build = function(cb) {
	var t, tool;

	for(t in this.tools) {
		tool = this.tools[t];

		if(tool.build) {
			this.verbose.log("Building some".yellow, t.yellow,"...".yellow);
			tool.build(errReport(cb));
		}
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
