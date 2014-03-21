# Fuller #
## Build everything with right tool##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-w] [-z] [-v] [--src] [--dst] [--taskName]

```
--watch, -w     Watch source directory for changes
--src           Relative path to directory with source files
--dst           Relative path to directory for compiled files
--dev, -z       Developer mode (usually this means no minifing and compressions, but depends from plugin)
--verbose, -v   Verbose mode
--taskName      Run task from plan
```

## Plan
### Belt
### Task
So Mr. Fuller needs a plan to build something. All plans looks like this:

```js
plan = {
    defaults,
    tasks,
    tools: {
        toolName: toolPlan
    }
}
```

If you don't need tool's plan tools section can be a simple array.
```js
plan = {
    defaults,
    tasks,
    tools: ["toolName1", "toolName2"]
}
```

At start fuller trying to find plan.js file in current directory. So global plan is a simple module:

```js
var defaults = {
    src: "./src",
    dst: "./",
    dev: true
};

var js = {
    "out/script.js": [
        "src1.js",
        "src2.js"
    ]
};

var less = {
        "out.css": "src.less"
};

var tasks = {
    //look for further explanation in the text below
}

module.exports = {
    defaults: defaults,
    tasks: tasks,
    tools : {
        concat: {
            tasks: js, 
            defaults: {
                src: defaults.src + "/js"
            },
            tools: ['common-js', 'uglify']
        },
        less: {tasks: less},
    }
};
```

In global plan you can make named tool sets. And run single tool set from command line. For example:
```js
module.exports = {
    defaults: defaults,
    tasks: tasks,

    "static": {
        defaults: {
            dst: defaults.dst + "static"
        },
        tools : {
            concat: {
                tasks: js, 
                defaults: {
                    src: defaults.src + "/js"
                },
                tools: ['common-js', 'uglify']
            },
            less: {tasks: less},
        },
    }
};
```

if you didn't make tool set, it's means `"default"` tool set. And it will be run on fuller start.

## Tools ##
This is about right tools. But what is a Tool? Tool is a plugin, that building something according to plan. 

What's interesting tools can use another tools...
```js
plan: {
    tools: {
        tool1: {
            tools: {
                tool2: etc;
            }
        }
    }
}
```

**;)**

You should include tools' packages in your project's package.json

### Tools API ###
Needs to be written. 
But you can check fuller's tools.

### Defaults ###
You can specify defaults option in global section, or in tool's part of the plan.

Don't forget about verbose mode here if you needed.

The fuller var in your task function is a pointer to global fuller object.

* __fuller.plan__ — your plan
* __fuller.build()__ — builds everything.
* __fuller.watch()__ — watch for changes in all  tools.
* __fuller.run(cmd)__ — run cmd
* __fuller.verbose.log(str)__ — print str to console if fuller in verbose mode
* __fuller.getTool('toolName')__ — return tool instance

Bonus, you can specify dev task. It'll be run before all others tasks when you'll use -z(--dev) key.
