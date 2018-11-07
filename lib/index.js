'use strict';
const path = require('path');
const exec = require('child_process').exec;
const Q = require('queueue');
const kleur = require('kleur');
const FSWatcher = require('chokidar').FSWatcher;

const Belt = require('./belt');
const Verbose = require('./tools/verbose');
const extendOptions = require('./tools/plan').extendOptions;

const isArray = Array.isArray;
const toolsCache = {};

const Fuller = function(opts) {
  this.root = process.cwd();
  this.tools = path.join(this.root, 'node_modules');
  this.planFile = path.join(this.root, opts.plan);
  this.taskName = opts.task;

  this.verbose = new Verbose(opts.verbose);
  this.q = new Q(opts.concurrency);

  if (opts.watch) {
    this.watcher = new FSWatcher({ persistent: true })
      .on('change', filepath => this.onChange(filepath))
      .on('error', err => this.verbose.error(err));
  }

  this.onPlan();
};

Fuller.prototype.loadPlan = function() {
  if (this.watcher) {
    this.dependencies = {};
    // this.watcher.unwatch('*');
    this.watcher.add(this.planFile);
  }

  try {
    //WARNING DELETING FROM CACHE
    //FOR MORE INFO http://stackoverflow.com/a/14801711/615073
    let planModule = require.resolve(this.planFile);
    if (planModule && ((planModule = require.cache[planModule]) !== undefined)) {
      delete require.cache[planModule.id];
    }
    //CAN REQUIRE IT AGAIN NOW
    this.plan = require(this.planFile);
  } catch (e) {
    this.verbose.error('plan file', e);
    return;
  }
};

Fuller.prototype.loadBelts = function() {
  const tasks = this.plan[`task:${this.taskName}`];
  this.belts = {};
  this.tasks = {};
  for (const belt in tasks) {
    const beltPlan = this.plan['belt:' + belt];
    const opts = beltPlan.options ? extendOptions(beltPlan.options, this.options) : this.options;
    this.belts[belt] = new Belt(this, opts, beltPlan);

    const taskPlan = tasks[belt];
    const taskIds = Object.keys(taskPlan);
    this.options.dev && beltPlan.dev && beltPlan.dev(this, taskPlan);

    for (const i in taskIds) {
      this.tasks[taskIds[i]] = {
        belt: belt,
        plan: taskPlan[taskIds[i]]
      };
    }
  }
  return this;
};

Fuller.prototype.onPlan = function() {
  this.loadPlan();
  if (!this.plan) {
    return;
  }

  this.options = Object.assign({}, this.plan.options);

  if (!this.options.src || this.options.src[0] === '.') {
    this.options.src = path.join(this.root, this.options.src || '');
  }

  if (!this.options.dst || this.options.dst[0] === '.') {
    this.options.dst = path.join(this.root, this.options.dst || '');
  }

  this.verbose.log(kleur.cyan.bold('Fuller has got a new plan...'));

  this
    .loadBelts()
    .build();
};

Fuller.prototype.onChange = function(filepath) {
  this.verbose.log(kleur.red('Changed '), filepath);

  if (filepath === this.planFile) {
    this.onPlan();
  } else {
    const slaves = this.dependencies[filepath];
    for (const f in slaves) {
      this.addTask(this, 'buildTask', [ slaves[f] ]);
    }
  }
};

Fuller.prototype.bind = function(tool) {
  const verbose = this.verbose;
  tool.addTask = (taskName, taskArgs) => this.addTask(tool, taskName, taskArgs);
  tool.addTasks = (taskName, taskArgsArray) => this.addTasks(tool, taskName, taskArgsArray);
  tool.addDependencies = (masters, slave) => this.addDependencies(masters, slave);
  tool.log = (...args) => verbose.log.apply(verbose, args);
  tool.error = (...args) => verbose.error.apply(verbose, args);
  tool.require = name => this.require(name);
};

Fuller.prototype.log = function() {
  this.verbose.log.apply(this.verbose, arguments);
};

Fuller.prototype.error = function() {
  this.verbose.error.apply(this.verbose, arguments);
};

Fuller.prototype.requireTool = function(tool) {
  if (!toolsCache[tool]) {
    try {
      toolsCache[tool] = this.require('fuller-' + tool);
    } catch (e) {
      this.verbose.error(e);
      process.exit(1);
    }
  }

  return toolsCache[tool];
};

Fuller.prototype.require = function(name) {
  return require(path.join(this.tools, name));
};

Fuller.prototype.addDependencies = function(master, slave) {
  if (this.watcher && master) {
    if (!isArray(master)) {
      master = [ master ];
    }

    const dependencies = this.dependencies;

    for (const i in master) {
      let file = master[i];
      if (dependencies[file] === undefined) {
        dependencies[file] = [ slave ];
        this.watcher.add(file);
      } else if (dependencies[file].indexOf(slave) === -1) {
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
    this.q.push({
      ctx: ctx,
      method: method,
      args: argsArray[i]
    });
  }
};

Fuller.prototype.buildTask = function(taskName, taskSrc, cb) {
  const task = this.tasks[taskName];
  const belt = this.belts[task.belt];

  if (cb === undefined) {
    cb = taskSrc;
    taskSrc = undefined;
  }
  belt.build(task.plan, taskName, cb);
};

Fuller.prototype.build = function() {
  for (let task in this.tasks) {
    this.addTask(this, 'buildTask', [ task ]);
  }
};

Fuller.prototype.run = function(cmd, cb) {
  if (!cb) {
    cb = (err, out, stderr) => {
      if (err) {
        this.verbose.error(stderr);
      } else {
        this.verbose.log(out);
      }
    };
  }

  this.verbose.log('Running', cmd);
  exec(cmd, cb);
};

module.exports = Fuller;
