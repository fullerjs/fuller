"use strict";

const path = require("path");
const exec = require("child_process").exec;
const concurrency = require("os").cpus().length;

const Q = require("queueue");
const chalk = require("chalk");
const chokidar = require("chokidar");
const extend = require("ops").applyDefaults;

const Belt = require("./belt");
const Verbose = require("./tools/verbose");
const extendOptions = require("./tools/plan").extendOptions;

const isArray = Array.isArray;
let toolsCache = {};

let Fuller = function(planFileName, taskName, args) {
	let self = this;

	this.home = process.cwd();
	this.tools = path.join(this.home, "node_modules");
	this.planFile = path.join(this.home, planFileName);
	this.args = args;
	this.taskName = taskName || "default";

	this.q = new Q(args.concurrency || concurrency);

	if(args.watch) {
		this.watcher = chokidar.watch(this.planFile, {persistent: true})
			.on("change", function(filepath) {
				self.onFile(filepath);
			})
			.on("error", function(err) {
				self.verbose.error(err);
			});
	}

	this.onPlan();
};

Fuller.prototype.streams = require("./streams");

Fuller.prototype.onPlan = function() {
	let args = this.args;

	if(this.watcher) {
		this.dependencies = {};
		this.watcher.unwatch("*");
		this.watcher.add(this.planFile);
	}

	//WARNING DELETING FROM CACHE
	//FOR MORE INFO http://stackoverflow.com/a/14801711/615073
	let planModule = require.resolve(this.planFile);
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
		this.options.src = path.join(this.home, this.options.src || "");
	}

	if(!this.options.dst || this.options.dst[0] === ".") {
		this.options.dst = path.join(this.home, this.options.dst || "");
	}

	this.verbose = new Verbose(this.options.verbose);
	this.verbose.log(chalk.bold.cyan("Mr. Fuller has got a new plan..."));

	// if(this.options.dev && this.plan.tasks && this.plan.tasks.dev) {
	//	this.plan.tasks.dev(this, this.options);
	// }

	let tasks = this.plan[this.taskName];

	//load belts
	this.belts = {};
	this.tasks = {};
	for(let belt in tasks) {
		let beltPlan = this.plan["belt:" + belt],
			opts = beltPlan.options ? extendOptions(beltPlan.options, this.options) : this.options;
		this.belts[belt] = new Belt(this, opts, beltPlan);

		let taskPlan = tasks[belt],
			taskIds = Object.keys(taskPlan);

		for(let i in taskIds) {
			this.tasks[taskIds[i]] = {
				belt: belt,
				plan: taskPlan[taskIds[i]]
			};
		}
	}

	this.build();
};

Fuller.prototype.onFile = function(filepath) {
	this.verbose.log(chalk.red("Changed "), filepath);

	if(filepath === this.planFile) {
		this.onPlan();
	} else {
		let slaves = this.dependencies[filepath];
		for(let f in slaves) {
			this.addTask(this, "builtTask", [slaves[f]]);
		}
	}
};

Fuller.prototype.bind = function(tool) {
	let self = this,
		verbose = this.verbose;

	tool.addTask = function(taskName, taskArgs) {
		self.addTask(tool, taskName, taskArgs);
	};

	tool.addTasks = function(taskName, taskArgsArray) {
		self.addTasks(tool, taskName, taskArgsArray);
	};

	tool.addDependencies = function(masters, slave) {
		for(var f in masters) {
			self.addDependence(masters[f], slave);
		}
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
			toolsCache[tool] = require(path.join(this.tools, "fuller-" + tool));
		} catch(e) {
			this.verbose.error(e.message);
			throw (e);
		}
	}

	return toolsCache[tool];
};

Fuller.prototype.addDependence = function(master, slave) {
	if(this.watcher) {
		if(!isArray(master)) {
			master = [master];
		}

		let dependencies = this.dependencies;

		for(let i in master) {
			let file = master[i];
			if(dependencies[file] === undefined) {
				dependencies[file] = [slave];
				this.watcher.add(file);
			} else if(dependencies[file].indexOf(slave) === -1) {
				dependencies[file].push(slave);
			}
		}
	}
};

Fuller.prototype.addTask = function(ctx, method, args) {
	this.q.push({
		ctx: ctx,
		method: method,
		args: args
	});
};

Fuller.prototype.addTasks = function(ctx, method, argsArray) {
	for (let i in argsArray) {
		this.addTask(ctx, method, argsArray[i]);
	}
};

Fuller.prototype.builtTask = function(taskName, cb) {
	let self = this,
		task = this.tasks[taskName],
		belt = this.belts[task.belt];

	belt.build(taskName, task.plan, function(err) {
		if(err) {
			self.verbose.error(err);
		}
	});
	cb();
};

Fuller.prototype.build = function() {
	for(let task in this.tasks) {
		this.addTask(this, "builtTask", [task]);
	}
};

Fuller.prototype.run = function(cmd, cb) {
	let self = this;

	if(!cb) {
		cb = function (err, out, stderr) {
			if(err) {
				console.log(stderr);
			} else {
				self.verbose.log(out);
			}
		};
	}

	this.verbose.log("Running", cmd);
	exec(cmd, cb);
};

module.exports = Fuller;
