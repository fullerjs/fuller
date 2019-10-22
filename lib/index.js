'use strict';
const path = require('path');
const { exec } = require('child_process');
const Q = require('queueue');
const { cyan, yellow } = require('kleur');
const { FSWatcher } = require('chokidar');

const Belt = require('./belt');
const Verbose = require('./tools/verbose');
const { extendOptions } = require('./tools/plan');

const isArray = Array.isArray;
const toolsCache = {};

class Fuller {
  constructor(opts) {
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
  }

  loadPlan() {
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
  }

  loadBelts() {
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
  }

  onPlan() {
    this.loadPlan();
    if (!this.plan) {
      return;
    }

    this.options = {
      ...this.plan.options
    }

    if (!this.options.src || this.options.src[0] === '.') {
      this.options.src = path.join(this.root, this.options.src || '');
    }

    if (!this.options.dst || this.options.dst[0] === '.') {
      this.options.dst = path.join(this.root, this.options.dst || '');
    }

    this.verbose.log(cyan().bold('Fuller has got a new plan...'));

    this
      .loadBelts()
      .build();
  }

  onChange(filepath) {
    this.verbose.log(yellow('Changed '), filepath);

    if (filepath === this.planFile) {
      this.onPlan();
    } else {
      const slaves = this.dependencies[filepath];
      for (const f in slaves) {
        this.addTask(this, 'buildTask', [ slaves[f] ]);
      }
    }
  }

  bind(tool) {
    tool.addTask = (taskName, taskArgs) => this.addTask(tool, taskName, taskArgs);
    tool.addTasks = (taskName, taskArgsArray) => this.addTasks(tool, taskName, taskArgsArray);
    tool.addDependencies = (masters, slave) => this.addDependencies(masters, slave);
    tool.log = (...args) => this.verbose.log(...args);
    tool.error = (...args) => this.verbose.error(...args);
    tool.require = name => this.require(name);
  }

  log() {
    this.verbose.log.apply(this.verbose, arguments);
  }

  error() {
    this.verbose.error.apply(this.verbose, arguments);
  }

  requireTool(tool) {
    if (!toolsCache[tool]) {
      try {
        toolsCache[tool] = this.require('fuller-' + tool);
      } catch (e) {
        this.verbose.error(e);
        process.exit(1);
      }
    }

    return toolsCache[tool];
  }

  require(name) {
    return require(path.join(this.tools, name));
  }

  addDependencies(master, slave) {
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
  }

  addTask(ctx, method, args) {
    this.q.push({
      ctx: ctx,
      method: method,
      args: args
    });
  }

  addTasks(ctx, method, argsArray) {
    for (const i in argsArray) {
      this.q.push({
        ctx: ctx,
        method: method,
        args: argsArray[i]
      });
    }
  }

  buildTask(taskName, taskSrc, cb) {
    const task = this.tasks[taskName];
    const belt = this.belts[task.belt];

    if (cb === undefined) {
      cb = taskSrc;
      taskSrc = undefined;
    }
    belt.build(task.plan, taskName, cb);
  }

  build() {
    for (const task in this.tasks) {
      this.addTask(this, 'buildTask', [ task ]);
    }
  }

  run(cmd, cb) {
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
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

module.exports = Fuller;
