'use strict';
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var extendOptions = require('./tools/plan').extendOptions;
var rxReserved = require('./tools/plan').rxReserved;

var isArray = Array.isArray;

var getNextTools = function(plan) {
	var next = [];
	for(var nextTool in plan) {
		if(!rxReserved.test(nextTool)) {
			next.push( nextTool );
		}
	}

	return next;
};

var Belt = function(fuller, options, plan) {
	fuller.bind(this);
	this.tools = [];
	this.watch = options.watch;
	this.dst = options.dst;
	this.parseConfig(this.tools, fuller, options, plan, true);
};

Belt.prototype.build = function(taskName, taskPlan, cb) {
	var self = this,
		start, end,
		dst = path.join(this.dst, taskName);

	this.log(chalk.green("Building"), dst);
	mkdirp(this.dst, function(err, path) {
		if(err) {
			cb(err);
		} else {
			end = new fs.createWriteStream(dst);
			end.on("close", function() {
				cb && cb();
			});

			self.runTools(self.tools, taskPlan, taskName, end);
		}
	});
};

Belt.prototype.runTools = function(tools, start, taskName, end) {
	for(var t in tools) {
		if(!isArray(tools[t])) {
			start = tools[t].build(start, taskName);
		} else {
			this.runTools(tools[t], start, taskName, end);
		}
	}

	start.pipe(end);
};

Belt.prototype.parseConfig = function(tools, fuller, options, plan, root) {
	var Tool, n, nextTools,
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
			opts = nextPlan.options ? extendOptions(nextPlan.options, options): options;

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
