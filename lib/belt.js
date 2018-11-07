'use strict';
const path = require('path');
const kleur = require('kleur');
const Transform = require('stream').Transform;
const extendOptions = require('./tools/plan').extendOptions;
const rxReserved = require('./tools/plan').rxReserved;

const getNextTools = function(plan) {
  let next = [];
  for (let nextTool in plan) {
    if (!rxReserved.test(nextTool)) {
      next.push(nextTool);
    }
  }

  return next;
};

const Belt = function(fuller, options, plan) {
  this.fuller = fuller;
  this.tools = [];
  this.watch = options.watch;
  this.dst = options.dst;
  this.parseConfig(this.tools, options, plan, true);
};

Belt.prototype.build = function(src, dst, cb) {
  this.fuller.log(kleur.green('Building'), path.join(this.dst, dst));

  let stream;
  this.tools.forEach((toolDescr, i) => {
    const next = this.getStream(toolDescr, src, dst);
    stream = i ? stream.pipe(next) : next;
  });

  stream.on('finish', cb);
};

Belt.prototype.getStream = function(t, src, dst) {
  if (t.full) {
    //full api
    return t.full.build(src, dst);
  }

  //simple api
  let f = this.fuller;
  return new Transform({
    objectMode: true,
    transform: (mat, enc, next) => t.simple(f, mat, t.options, (err, newMat) => {
      if (err) {
        f.error(err);
        next();
      } else {
        next(null, newMat);
      }
    })
  });
};

Belt.prototype.parseConfig = function(tools, options, plan, root) {
  if (plan.tools) {
    const nextTools = plan.tools;
    for (const n in nextTools) {
      tools.push(this.getTool(nextTools[n], options));
    }
    return;
  }

  const nextTools = getNextTools(plan);
  let next;

  for (const n in nextTools) {
    if (nextTools.length > 1) {
      next = [];
      tools.push(next);
    } else {
      next = tools;
    }

    const nextTool = nextTools[n];
    const nextPlan = plan[nextTool];
    const opts = nextPlan.options ? extendOptions(nextPlan.options, options) : options;

    if (root && nextTools.length === 1) {
      this.dst = opts.dst;
    }

    tools.push(this.getTool(nextTools[n], opts));
    this.parseConfig(next, opts, nextPlan);
  }
};

Belt.prototype.getTool = function(name, options) {
  const Tool = this.fuller.requireTool(name);

  if (Object.keys(Tool.prototype).length) {
    //full api
    return {
      full: new Tool(this.fuller, options)
    };
  }

  //simple api
  return {
    simple: Tool,
    options: options
  };
};


module.exports = Belt;
