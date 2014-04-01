"use strict";
var inspect = require('util').inspect;

var fs = require('fs');
var path = require('path');
var proc = require('child_process');
var exec = proc.exec;

var Q = require('queueue');
var chalk = require('chalk');
var extend = require('ops').applyDefaults;
var concurrency = require('os').cpus().length/2;

var Belt = require('./belt');
var Watchmen = require('./tools/watchmen');
var Verbose = require('./verbose');
var FileTools = require('./tools');
var extendOptions = require('./tools/plan').extendOptions;

var dependencies = {};
var toolsCache = {};

var Fuller = function(planFileName, taskName, args) {
	this.home = process.cwd();
	this.tools = path.join(this.home, 'node_modules');
	this.planFile = path.join(this.home, planFileName);
	this.args = args;
	this.taskName = taskName || "default";

	this.q = new Q(args.concurrency || concurrency);

	if(args.watch) {
		this.watch();
	}

	this.onPlan();
};

Fuller.prototype.streams = require('./streams');

Fuller.prototype.onPlan = function() {
	var self = this,
		args = this.args;

	if(this.watcher) {
		this.watcher.reset();
		this.watcher.add(this.planFile);
	}

	//WARNING DELETING FROM CACHE
	//FOR MORE INFO http://stackoverflow.com/a/14801711/615073
	var planModule = require.resolve(this.planFile);
	if (planModule && ((planModule = require.cache[planModule]) !== undefined)) {
		delete require.cache[planModule.id];
	}
	//CAN REQUIRE IT AGAIN NOW
	this.plan = require(this.planFile);
	this.options = extend({
		src: args.src,
		dst: args.dst,
		dev: args.dev,
		watch: args.watch,
		verbose: args.verbose
	}, this.plan.options);

	if(!this.options.src || this.options.src[0] === ".") {
		this.options.src = path.join(this.home, this.options.src || '');
	}

	if(!this.options.dst || this.options.dst[0] === ".") {
		this.options.dst = path.join(this.home, this.options.dst || '');
	}

	this.verbose = new Verbose(this.options.verbose);
	this.verbose.log(chalk.bold.cyan("Mr. Fuller has got a new plan..."));

	// if(this.options.dev && this.plan.tasks && this.plan.tasks.dev) {
	//	this.plan.tasks.dev(this, this.options);
	// }

	var tasks = this.plan[this.taskName];

	//load belts
	this.belts = {};
	this.tasks = {};
	for(var belt in tasks) {
		var beltPlan = this.plan["belt:"+belt],
			opts = beltPlan.options ? extendOptions(beltPlan.options, this.options): this.options;
		this.belts[belt] = new Belt(this, opts, beltPlan);

		var taskPlan = tasks[belt],
			taskIds = Object.keys(taskPlan);

		for(var i in taskIds) {
			this.tasks[taskIds[i]] = {
				belt: belt,
				plan: taskPlan[taskIds[i]]
			};
		}
	}

	this.build();
};

Fuller.prototype.bind = function(tool) {
	var self = this,
		verbose = this.verbose;

	tool.addTask = function(taskName, taskArgs) {
		self.addTask(tool, taskName, taskArgs);
	};

	tool.addTasks = function(taskName, taskArgsArray) {
		self.addTasks(tool, taskName, taskArgsArray);
	};

	tool.addDependence = function(master, slave) {
		self.addDependence(master, slave);
	};

	tool.log = function() {
		verbose.log.apply(verbose, arguments);
	};

	tool.error = function() {
		verbose.error.apply(verbose, arguments);
	};
};

Fuller.prototype.requireTool = function(tool) {
	if(!toolsCache[tool]) {
		try {
			toolsCache[tool] = require(path.join(this.tools, 'fuller-' + tool));
		} catch(e) {
			this.verbose.error(e.message);
			process.exit();
		}
	}

	return toolsCache[tool];
};

Fuller.prototype.watch = function() {
	var self = this;

	this.watcher = new Watchmen(this.planFile, {debounceDelay: 500})
		.on('changed', function(filepath, slaves) {
			self.verbose.log(chalk.red("Changed "), filepath);
			if(filepath === self.planFile) {
				self.onPlan();
			} else {
				for(var f in slaves) {
					self.addTask(self, "builtTask", [slaves[f]]);
				}
			}
		});
};

Fuller.prototype.addDependence = function(master, slave) {
	this.watcher && this.watcher.add(master, slave);
};

Fuller.prototype.addTask = function(ctx, method, args) {
	this.q.push({
		ctx: ctx,
		method: method,
		args: args
	});
};

Fuller.prototype.addTasks = function(ctx, method, argsArray) {
	for (var i in argsArray) {
		this.addTask(ctx, method, argsArray[i]);
	}
};

Fuller.prototype.builtTask = function(taskName, cb) {
	var self = this,
		task = this.tasks[taskName],
		belt = this.belts[task.belt];

	belt.build(taskName, task.plan, function(err, result) {
		if(err) {
			self.verbose.error(err);
		}
	});
	cb();
};

Fuller.prototype.build = function(taskName) {
	var belts = this.plan[taskName || this.taskName];

	for(var task in this.tasks) {
		this.addTask(this, "builtTask", [task]);
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

	this.verbose.log('Running', cmd);
	exec(cmd, cb);
};

//helpers
Fuller.prototype.treeToArray = FileTools.treeToArray;


module.exports = Fuller;

