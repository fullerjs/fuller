"use strict";
let path = require("path");
let chalk = require("chalk");
let Transform = require("stream").Transform;
let extendOptions = require("./tools/plan").extendOptions;
let rxReserved = require("./tools/plan").rxReserved;

// let isArray = Array.isArray;

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
	this.fuller = fuller;
	this.tools = [];
	this.watch = options.watch;
	this.dst = options.dst;
	this.parseConfig(this.tools, options, plan, true);
};

Belt.prototype.build = function(src, dst, cb) {
	this.fuller.log(chalk.green("Building"), path.join(this.dst, dst) );

	let self = this;
	let stream;

	this.tools.forEach(function(toolDescr, i) {
		let next = self.getStream(toolDescr, src, dst);
		stream = i ? stream.pipe(next) : next;
	});

	stream.on("finish", cb);
};

Belt.prototype.getStream = function(t, src, dst) {
	if(t.full) {
		//full api
		return t.full.build(src, dst);
	} else {
		//simple api
		let f = this.fuller;
		return new Transform({
			objectMode: true,
			transform: function (mat, enc, next) {
				t.simple(f, mat, t.options, function(err, newMat) {
					if(err) {
						f.error(err);
						next();
					} else {
						next(null, newMat);
					}
				});
			}
		});
	}
};

Belt.prototype.parseConfig = function(tools, options, plan, root) {
	let n, nextTools,
		next, opts, nextTool, nextPlan;

	if(plan.tools) {
		nextTools = plan.tools;

		for (n in nextTools) {
			tools.push( this.getTool(nextTools[n], options) );
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

			tools.push( this.getTool(nextTools[n], opts) );
			this.parseConfig(next, opts, nextPlan);
		}
	}
};

Belt.prototype.getTool = function(name, options) {
	let Tool = this.fuller.requireTool(name);

	if(Object.keys(Tool.prototype).length) {
		//full api
		return {
			full: new Tool(this.fuller, options)
		};
	} else {
		//simple api
		return {
			simple: Tool,
			options: options
		};
	}
};


module.exports = Belt;
