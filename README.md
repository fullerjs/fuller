# Fuller #
## Build everything with right tool##

_Richard Buckminster "Bucky" Fuller was an American systems theorist, architect, engineer, author, designer, inventor, and futurist_

## Install ##
    npm install fuller -g

## Usage ##
    fuller [-w] [-src] [-dst] [-c] [-z] [-v]

```
--watch, -w     Watch source directory for changes
--src           Relative path to directory with source files
--dst           Relative path to directory for compiled files
--dev, -z       Developer version (usually this means no minifing and compressions, but depends from plugin)
--verbose, -v   Verbose mode
--task-name     Run task specified by plan

## Tools ##
This is about right tools. But what is a Tool? Tool is a plugin, that building something according to plan. Plan is a simple js object:

```js
plan = {
    someOtherUsefulStuff: Stuff,
    
    tools: {
        toolName: toolPlan
    },
}
```
or if your tool don't need a plan it can be simple array
```js
plan = {    
    tools: ['tool1', 'tool2']
}
```
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
__;)__

You should include tools' packages in your project's package.json

### Tools API ###
Needs to be written. 
But you can check fuller's js build tool.

```
## Plan ##
So Mr. Fuller needs a plan, it is a simple node module:
```js
var defaults = {
    src: "./src",
    dst: "./static",
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
        js: {files: js, tools: ['common-js', 'uglify']},
        less: {files: less},
    }
};
```

### Defaults ###
You can specify default option in global section, and overide them with command line.

#### File tools ####
Also fuller has special purpose file tools. You can load in your plugin with a fuller.getTool('files').

* __concat(path, arrayFileNames, [prependString], [appendString])__ — concatenates files with base path and strings for appeding and prepending to result.
* __treeToArray(srcPath, files)__ — converts path and array of files to array of full paths to files
* __writeForce(pathFile, data, cb)__ — writes file, but if destination directory not exist creates it.
* __addDependence(deps, master, slave)__ — adds depenencies to deps object
* __mkdirp__ — make path
* __watchFiles(root, arrayFileNames, cb)__ — adds watchers and run cb on files changes.

## Tasks
You can specify your own tasks in plan:
```js
tasks = {
    start: function(fuller) {
        fuller.build();             //builds everything
        fuller.run('bin/cmd start') //run cmd
    }
}
```
and then just run it
    fuller --start

Don't forget about verbose mode here if you needed.

The fuller var in your task function is a pointer to global fuller object.

__fuller.plan__ — your plan

__fuller.build()__ — builds everything.

__fuller.watch()__ — watch for changes in all  tools.

__fuller.run(cmd)__ — run cmd

Verbose mode:

__fuller.verbose.log(str)__ — print str to console if fuller in verbose mode

Bonus, you can specify dev task. It'll be run before all others tasks when you'll use -z(--dev) key.
