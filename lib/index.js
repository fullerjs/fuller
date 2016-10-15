'use strict';
const concurrency = require('os').cpus().length;
const path = require('path');
const exec = require('child_process').exec;
const Q = require('queueue');
const chalk = require('chalk');
const FSWatcher = require('chokidar').FSWatcher;

const Belt = require('./belt');
const Verbose = require('./tools/verbose');
const extendOptions = require('./tools/plan').extendOptions;

const isArray = Array.isArray;
const toolsCache = {};

let Fuller = function(planFileName, taskName, args) {
  let self = this;

  this.home = process.cwd();
  this.tools = path.join(this.home, 'node_modules');
  this.planFile = path.join(this.home, planFileName);
  this.args = args;
  this.taskName = taskName || 'default';

  this.q = new Q(args.concurrency || concurrency);

  if (args.watch) {
    this.watcher = new FSWatcher({ persistent: true })
      .on('change', function(filepath) {
        self.onChange(filepath);
      })
      .on('error', function(err) {
        self.verbose.error(err);
      });
  }

  this.onPlan();
};

Fuller.prototype.onPlan = function() {
  let args = this.args;

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
    this.verbose.error('plan file', e.toString());
    return;
  }

  this.options = Object.assign({}, this.plan.options, args);

  if (!this.options.src || this.options.src[0] === '.') {
    this.options.src = path.join(this.home, this.options.src || '');
  }

  if (!this.options.dst || this.options.dst[0] === '.') {
    this.options.dst = path.join(this.home, this.options.dst || '');
  }

  this.verbose = new Verbose(this.options.verbose);
  this.verbose.log(chalk.bold.cyan('Fuller has got a new plan...'));

  let tasks = this.plan[this.taskName];

  //load belts
  this.belts = {};
  this.tasks = {};
  for (let belt in tasks) {
    let beltPlan = this.plan['belt:' + belt];
    let opts = beltPlan.options ? extendOptions(beltPlan.options, this.options) : this.options;
    this.belts[belt] = new Belt(this, opts, beltPlan);

    let taskPlan = tasks[belt];
    let taskIds = Object.keys(taskPlan);
    this.options.dev && beltPlan.dev && beltPlan.dev(this, taskPlan);

    for (let i in taskIds) {
      this.tasks[taskIds[i]] = {
        belt: belt,
        plan: taskPlan[taskIds[i]]
      };
    }
  }

  this.build();
};

Fuller.prototype.onChange = function(filepath) {
  this.verbose.log(chalk.red('Changed '), filepath);

  if (filepath === this.planFile) {
    this.onPlan();
  } else {
    let slaves = this.dependencies[filepath];
    for (let f in slaves) {
      this.addTask(this, 'buildTask', [ slaves[f] ]);
    }
  }
};

Fuller.prototype.bind = function(tool) {
  let self = this;
  let verbose = this.verbose;

  tool.addTask = function(taskName, taskArgs) {
    self.addTask(tool, taskName, taskArgs);
  };

  tool.addTasks = function(taskName, taskArgsArray) {
    self.addTasks(tool, taskName, taskArgsArray);
  };

  tool.addDependencies = function(masters, slave) {
    self.addDependencies(masters, slave);
  };

  tool.log = function() {
    verbose.log.apply(verbose, arguments);
  };

  tool.error = function() {
    verbose.error.apply(verbose, arguments);
  };
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
      toolsCache[tool] = require(path.join(this.tools, 'fuller-' + tool));
    } catch (e) {
      this.verbose.error(e);
      process.exit(1);
    }
  }

  return toolsCache[tool];
};

Fuller.prototype.addDependencies = function(master, slave) {
  if (this.watcher && master) {
    if (!isArray(master)) {
      master = [ master ];
    }

    let dependencies = this.dependencies;

    for (let i in master) {
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
  let task = this.tasks[taskName];
  let belt = this.belts[task.belt];

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
  let self = this;

  if (!cb) {
    cb = function(err, out, stderr) {
      if (err) {
        self.verbose.error(stderr);
      } else {
        self.verbose.log(out);
      }
    };
  }

  this.verbose.log('Running', cmd);
  exec(cmd, cb);
};

module.exports = Fuller;
