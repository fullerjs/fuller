"use strict";
let path = require("path");
let chalk = require("chalk");
let extendOptions = require("./tools/plan").extendOptions;
let rxReserved = require("./tools/plan").rxReserved;

let isArray = Array.isArray;

let getNextTools = function(plan) {
	let next = [];
	for(let nextTool in plan) {
		if(!rxReserved.test(nextTool)) {
			next.push( nextTool );
		}
	}

	return next;
};

let Belt = function(fuller, options, plan) {
	fuller.bind(this);
	this.tools = [];
	this.watch = options.watch;
	this.dst = options.dst;
	this.parseConfig(this.tools, fuller, options, plan, true);
};

Belt.prototype.build = function(taskName, taskPlan, cb) {
	this.log(chalk.green("Building"), path.join(this.dst, taskName) );
	this.runTools(this.tools, taskPlan, taskName, cb);
};

Belt.prototype.runTools = function(tools, start, taskName) {
	for(let t in tools) {
		if(!isArray(tools[t])) {
			start = tools[t].build(start, taskName);
		} else {
			this.runTools(tools[t], start, taskName);
		}
	}
};

Belt.prototype.parseConfig = function(tools, fuller, options, plan, root) {
	let Tool, n, nextTools,
		next, opts, nextTool, nextPlan;

	if(plan.tools) {
		nextTools = plan.tools;

		for (n in nextTools) {
			Tool = fuller.requireTool(nextTools[n]);
			tools.push( new Tool(fuller, options) );
		}
	} else {
		nextTools = getNextTools(plan);

		for(n in nextTools) {
			if(nextTools.length > 1) {
				next = [];
				tools.push(next);
			} else {
				next = tools;
			}

			nextTool = nextTools[n];
			nextPlan = plan[nextTool];
			opts = nextPlan.options ? extendOptions(nextPlan.options, options) : options;

			if(root && nextTools.length === 1) {
				this.dst = opts.dst;
			}

			Tool = fuller.requireTool(nextTool);
			next.push( new Tool(fuller, opts) );

			this.parseConfig(next, fuller, opts, nextPlan);
		}
	}
};


module.exports = Belt;
