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
var dontCare = ["tasks", "tools", "defaults"];

var Fuller = function(plan, opts) {
	var home = process.cwd();

	this.plan = plan;
	this.defaults = extend({
		verbose: opts.verbose,
		src: opts.src,
		dst: opts.dst,
		dev: opts.dev
	}, plan.defaults);

	this.pathes = {
		home: home,
		tools: path.join(home, 'node_modules')
	};

	this.defaults.src =  path.join(home, this.defaults.src || '');
	this.defaults.dst =  path.join(home, this.defaults.dst || '');

	this.tools = {};

	this.verbose = new Verbose(this.defaults.verbose);
	this.verbose.log("Mr. Fuller has got a plan...".bold.cyan);

	if(this.defaults.dev && this.plan.tasks && this.plan.tasks.dev) {
		this.plan.tasks.dev(this, this.defaults);
	}

	var toolSetName, toolSetPlan;
	for(var task in plan) {
		if(dontCare.indexOf(task) === -1) {
			if(opts[task] === true) {
				toolSetName = task;
				toolSetPlan = plan[task];
				break;
			}
		}
	}

	if(!toolSetPlan) {
		toolSetName = "defaults";
		toolSetPlan = plan.default || {tools: plan.tools};
	}

	this.runToolSet(toolSetName, toolSetPlan);
};

Fuller.prototype.runToolSet = function(name, plan) {
	var defaults = extend(plan.defaults, this.defaults);
	this.name = name;
	this.tools = this.loadTools(plan.tools, defaults);
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

Fuller.prototype.loadTools = function(tools, defaults) {
	var currentTools = {}, Tool;

	for(var t in tools) {
		if(typeof tools[t] === 'object') {
			Tool = this.requireTool(t);
			var toolPlan = tools[t];
			toolPlan.defaults = extend(toolPlan.defaults, defaults);
			currentTools[t] = new Tool(this, toolPlan);
		} else {
			Tool = this.requireTool(tools[t]);
			currentTools[tools[t]] = new Tool(this, {defaults: defaults });
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

Fuller.prototype.watch = function(cb) {
	var self = this,
		t, tool,
		isWatched = false;

	for(t in this.tools) {
		tool = this.tools[t];

		if(tool.watch) {
			!isWatched && this.verbose.log("Start watching for".yellow, this.name.yellow, "...".yellow);
			isWatched = true;
			tool.watch(errReport(cb));
		}
	}

	!isWatched && this.verbose.log("There is nothing to watch for".yellow);
};

Fuller.prototype.build = function(cb) {
	var t, tool,
		isBuilded = false;

	for(t in this.tools) {
		tool = this.tools[t];

		if(tool.build) {
			!isBuilded && this.verbose.log("Building".yellow, this.name.yellow, "...".yellow);
			isBuilded = true;
			tool.build(errReport(cb));
		}
	}

	!isBuilded && this.verbose.log("There is nothing to build".yellow);
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


module.exports = {
	Fuller: Fuller,
	dontCare: dontCare
};

